// Command pandemica builds the virtual Campinas population and runs the
// epidemic simulation described in the Pandemica paper.
//
//	pandemica population              synthesize the population and print statistics
//	pandemica run [flags]             calibrate (hold-out) and simulate 2020-2022
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/census"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/population"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/report"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/routine"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/scenario"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/sim"
)

func usage() {
	fmt.Fprintln(os.Stderr, "usage: pandemica <population|run> [flags]\n  run -h for flags")
	os.Exit(2)
}

func main() {
	if len(os.Args) < 2 {
		usage()
	}
	switch os.Args[1] {
	case "population":
		cmdPopulation(os.Args[2:])
	case "run":
		cmdRun(os.Args[2:])
	case "r0":
		cmdR0(os.Args[2:])
	default:
		usage()
	}
}

func logf(format string, a ...any) {
	fmt.Printf("[%s] %s\n", time.Now().Format("15:04:05"), fmt.Sprintf(format, a...))
}

func heapMB() float64 {
	var m runtime.MemStats
	runtime.GC()
	runtime.ReadMemStats(&m)
	return float64(m.HeapAlloc) / (1 << 20)
}

type buildInfo struct {
	Population   int     `json:"population"`
	Houses       int     `json:"houses"`
	WorkSites    int     `json:"workSites"`
	WorkTeams    int     `json:"workTeams"`
	Schools      int     `json:"schools"`
	Classes      int     `json:"classes"`
	Locations    int     `json:"locations"`
	RoutineActs  int     `json:"routineActivities"`
	IndexEntries int     `json:"indexEntries"`
	NNLoss       float64 `json:"nnLoss"`
	BuildSeconds float64 `json:"buildSeconds"`
	HeapMB       float64 `json:"heapMB"`
}

func build(n int, seed uint64, staffShare float64) (*sim.World, buildInfo) {
	t0 := time.Now()
	logf("synthesizing %d individuals", n)
	p, err := population.Generate(population.Options{N: n, Seed: seed, HospitalStaffShare: staffShare})
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	logf("population ready: %d houses, %d work sites, %d schools (%.1fs)", p.NumHouses(), len(p.WorkLabel), len(p.SchoolLabel), time.Since(t0).Seconds())
	t1 := time.Now()
	m, loss := routine.TrainPreferenceNetwork(p, 20000, 40, seed)
	logf("preference network 10-20-10 trained, cross-entropy %.4f (%.1fs)", loss, time.Since(t1).Seconds())
	t2 := time.Now()
	rt := routine.Generate(p, m, seed)
	logf("weekly routines: %d activities (%.1fs)", len(rt.Acts), time.Since(t2).Seconds())
	t3 := time.Now()
	w := sim.NewWorld(p, rt, seed)
	logf("world: %d locations, %d weekly presences indexed (%.1fs)", w.NumLoc, w.IndexSize(), time.Since(t3).Seconds())
	info := buildInfo{
		Population: p.N, Houses: p.NumHouses(), WorkSites: len(p.WorkLabel), WorkTeams: p.NumWorkGroups,
		Schools: len(p.SchoolLabel), Classes: p.NumClasses, Locations: w.NumLoc, RoutineActs: len(rt.Acts),
		IndexEntries: w.IndexSize(), NNLoss: loss, BuildSeconds: time.Since(t0).Seconds(), HeapMB: heapMB(),
	}
	logf("build done in %.1fs, heap %.0f MB", info.BuildSeconds, info.HeapMB)
	return w, info
}

// estimateR0 seeds an epidemic without interventions or vaccines and converts
// the early exponential growth rate r into R0 = (1 + r*latent)(1 + r*infectious)
// (SEIR with exponential stages; latent 3.5 d, infectious 7 d). The growth
// rate is a log-linear fit of 7-day incidence from day 14 until 3% of the
// population has been infected, before susceptible depletion bends the curve.
func estimateR0(w *sim.World, par sim.Params, sc *scenario.Scenario) (float64, float64) {
	nc := sc.Clone()
	nc.VaccinesEnabled = false
	nc.Variants = nil
	nc.InitialInfections, nc.ImportDays = 100, 0
	nc.Phases = []scenario.Phase{{Date: nc.Start, Isolation: sc.Phases[0].Isolation, MaskType: "cloth"}}
	s := sim.New(w, nc, nil, par)
	limit := 0.03 * float64(w.P.N)
	var inf []float64
	cum := 0.0
	for s.Day() < 150 && cum < limit {
		st := s.Step()
		inf = append(inf, float64(st.NewInfections))
		cum += float64(st.NewInfections)
	}
	var xs, ys []float64
	for t := 14; t < len(inf); t++ {
		w7 := 0.0
		for _, v := range inf[t-6 : t+1] {
			w7 += v
		}
		if w7 > 0 {
			xs = append(xs, float64(t))
			ys = append(ys, math.Log(w7))
		}
	}
	if len(xs) < 3 {
		return math.NaN(), math.NaN()
	}
	mx, my := 0.0, 0.0
	for k := range xs {
		mx += xs[k]
		my += ys[k]
	}
	mx /= float64(len(xs))
	my /= float64(len(xs))
	num, den := 0.0, 0.0
	for k := range xs {
		num += (xs[k] - mx) * (ys[k] - my)
		den += (xs[k] - mx) * (xs[k] - mx)
	}
	r := num / den
	return r, (1 + r*3.5) * (1 + r*7)
}

func cmdR0(args []string) {
	fs := flag.NewFlagSet("r0", flag.ExitOnError)
	n := fs.Int("n", 300000, "population size")
	seed := fs.Uint64("seed", 1, "random seed")
	staffShare := fs.Float64("hospital-staff-share", 0.5, "share of the census health workforce working in hospital wards (assumption)")
	scPath := fs.String("scenario", "scenarios/campinas.json", "scenario (start date and isolation only)")
	betas := fs.String("betas", "0.04,0.06,0.08,0.1,0.15,0.2,0.25", "comma-separated beta values")
	fs.Parse(args)
	sc, err := scenario.Load(*scPath)
	check(err)
	w, _ := build(*n, *seed, *staffShare)
	par := sim.DefaultParams()
	par.Seed = *seed
	for _, b := range strings.Split(*betas, ",") {
		var beta float64
		fmt.Sscanf(b, "%g", &beta)
		par.Beta = beta
		r, r0 := estimateR0(w, par, sc)
		fmt.Printf("beta %.4f  growth %.3f/day  doubling %.1f d  R0 %.2f\n", beta, r, math.Log(2)/r, r0)
	}
}

func cmdPopulation(args []string) {
	fs := flag.NewFlagSet("population", flag.ExitOnError)
	n := fs.Int("n", census.PaperPopulation, "population size")
	seed := fs.Uint64("seed", 1, "random seed")
	staffShare := fs.Float64("hospital-staff-share", 0.5, "share of the census health workforce working in hospital wards (assumption)")
	fs.Parse(args)
	w, info := build(*n, *seed, *staffShare)
	p := w.P
	b, _ := json.MarshalIndent(info, "", "  ")
	fmt.Println(string(b))

	var workers, students, private, kids, seniors int
	var eduCount [8]int
	for i := 0; i < p.N; i++ {
		if p.Work[i] >= 0 {
			workers++
		}
		if p.School[i] >= 0 {
			students++
		}
		if p.Transport[i] == population.Private {
			private++
		}
		if p.Age[i] <= 14 {
			kids++
		}
		if p.Age[i] >= 65 {
			seniors++
		}
		eduCount[p.Education[i]]++
	}
	pct := func(v int) float64 { return 100 * float64(v) / float64(p.N) }
	fmt.Printf("workers %.1f%%  students %.1f%%  private transport %.1f%%  age<=14 %.1f%%  age>=65 %.1f%%\n",
		pct(workers), pct(students), pct(private), pct(kids), pct(seniors))
	var perCat [activity.NumLabels]int
	for _, a := range w.R.Acts {
		perCat[a.Label] += int(a.Dur)
	}
	fmt.Println("average minutes per person per day by activity:")
	for l := activity.Label(0); l < activity.NumLabels; l++ {
		if perCat[l] > 0 {
			fmt.Printf("  %-26s %7.1f\n", activity.Catalog[l].Name, float64(perCat[l])/float64(p.N)/7)
		}
	}
}

type runSummary struct {
	Name        string            `json:"name"`
	Params      sim.Params        `json:"params"`
	Build       buildInfo         `json:"build"`
	TrainDays   int               `json:"trainDays"`
	TrainEnd    string            `json:"trainEnd"`
	Calibrated  bool              `json:"calibrated"`
	Fit         string            `json:"fit"`
	Compliance  float64           `json:"compliance"`
	R0          float64           `json:"r0"`
	Calibration []calibrationStep `json:"calibration,omitempty"`
	SimSeconds  float64           `json:"simSeconds"`
	Train       metricsJSON       `json:"train"`
	Test        metricsJSON       `json:"test"`
	Full        metricsJSON       `json:"full"`
	Totals      map[string]int    `json:"totals"`
	BySetting   map[string]int    `json:"infectionsBySetting"`
	ByActivity  map[string]int    `json:"infectionsByActivity"`
	Beds        map[string]int    `json:"beds"`
}

type calibrationStep struct {
	Beta   float64 `json:"beta"`
	Cases  int     `json:"cases"`
	Deaths int     `json:"deaths"`
}

type metricsJSON struct {
	From             string  `json:"from"`
	To               string  `json:"to"`
	PaperAccuracy    float64 `json:"paperAccuracy"`
	CurveAccuracy    float64 `json:"curveAccuracy"`
	CasesMAPE        float64 `json:"cumulativeCasesMAPE"`
	DeathsMAPE       float64 `json:"cumulativeDeathsMAPE"`
	WeeklyCasesMAPE  float64 `json:"weeklyCasesMAPE"`
	WeeklyDeathsMAPE float64 `json:"weeklyDeathsMAPE"`
	RealCases        float64 `json:"realCases"`
	SimCases         float64 `json:"simCases"`
	RealDeaths       float64 `json:"realDeaths"`
	SimDeaths        float64 `json:"simDeaths"`
}

func toJSON(m report.Metrics) metricsJSON {
	clean := func(v float64) float64 {
		if math.IsNaN(v) || math.IsInf(v, 0) {
			return -1
		}
		return math.Round(v*100) / 100
	}
	return metricsJSON{m.From.Format(scenario.DateLayout), m.To.Format(scenario.DateLayout),
		clean(m.PaperAccuracy()), clean(m.CurveAccuracy()), clean(m.CasesMAPE), clean(m.DeathsMAPE),
		clean(m.WeeklyCasesMAPE), clean(m.WeeklyDeathsMAPE), m.RealCases, m.SimCases, m.RealDeaths, m.SimDeaths}
}

func cmdRun(args []string) {
	fs := flag.NewFlagSet("run", flag.ExitOnError)
	n := fs.Int("n", census.PaperPopulation, "population size")
	seed := fs.Uint64("seed", 1, "random seed")
	staffShare := fs.Float64("hospital-staff-share", 0.5, "share of the census health workforce working in hospital wards (assumption)")
	root := fs.String("root", "..", "repository root (for model/data and web/public)")
	scPath := fs.String("scenario", "scenarios/campinas.json", "scenario timeline")
	beta := fs.Float64("beta", 0, "transmission scale; 0 = calibrate on the training window")
	from := fs.String("from", "", "reuse beta and reporting rates from a previous run's JSON summary (for counterfactual scenarios)")
	fit := fs.String("fit", "compliance", "calibration: compliance (beta from -r0, fit intervention compliance on training deaths, then the reporting rate on training cases), deaths (fit beta on training deaths, then the reporting rate), or cases (paper: fit beta on training cases, every infection is a case)")
	r0 := fs.Float64("r0", 2.8, "ancestral-strain R0 used to set beta in -fit compliance")
	train := fs.Float64("train", 0.2, "hold-out training fraction (paper: first 20%)")
	detSym := fs.Float64("detect-sym", 1, "probability a symptomatic infection is reported (paper: 1)")
	detAsym := fs.Float64("detect-asym", 1, "probability an asymptomatic infection is reported (paper: 1)")
	contacts := fs.Float64("close-contacts", 10, "effective close contacts in a group")
	home := fs.Float64("home", 1.0, "household contact intensity (v2: full reference interaction)")
	beds := fs.Float64("covid-beds-per-1000", 0, "hospital beds available to COVID patients per 1,000 inhabitants; 0 = unlimited (the repository has no bed data)")
	care := fs.Float64("care-seeking", 0.6, "share of symptomatic people who visit a pharmacy at symptom onset (assumption)")
	overload := fs.Float64("overload-death-factor", 2, "death probability multiplier for severe cases turned away (assumption)")
	hospInf := fs.Int("hospital-infectious-days", 5, "days a severe case keeps shedding after admission (assumption)")
	sickMask := fs.Float64("sick-mask", 0.5, "share of symptomatic, non-isolating people who mask up (TS useMask; assumption)")
	sickDrop := fs.Float64("sick-leisure-drop", 0.5, "share of symptomatic, non-isolating people who drop leisure (TS interruptedActivities; assumption)")
	sleepPairs := fs.Bool("sleep-pairs", true, "only bedroom partners share the night (TS sleep maxEngaged 2); false = whole household (v1)")
	occ := fs.Float64("occupation", 0.5, "work/school contact intensity")
	noVax := fs.Bool("no-vaccines", false, "disable the vaccine registry")
	out := fs.String("out", "results", "output directory")
	name := fs.String("name", "", "run name (default: timestamp)")
	workers := fs.Int("workers", runtime.NumCPU(), "parallel workers")
	fs.Parse(args)

	if *name == "" {
		*name = "run-" + time.Now().Format("20060102-150405")
	}
	sc, err := scenario.Load(*scPath)
	check(err)
	if *noVax {
		sc.VaccinesEnabled = false
	}
	real, err := scenario.LoadCases(filepath.Join(*root, "model/data/covid19/campinas_2020_2021_2022_cases.csv"))
	check(err)
	var vaccines []scenario.VaccineRecord
	if sc.VaccinesEnabled {
		vaccines, err = scenario.LoadVaccines(filepath.Join(*root, "model/data/covid19/campinas_2021_2022_2023_vaccines.csv"))
		check(err)
		logf("vaccine registry: %d records", len(vaccines))
	}
	w, info := build(*n, *seed, *staffShare)

	par := sim.DefaultParams()
	par.Seed = *seed
	par.DetectSymptomatic, par.DetectAsymptomatic = *detSym, *detAsym
	par.CloseContacts, par.HomeContact, par.OccupationContact = *contacts, *home, *occ
	par.CovidBedsPer1000, par.CareSeeking, par.OverloadDeathFactor, par.HospitalInfectiousDays = *beds, *care, *overload, *hospInf
	par.SickMaskShare, par.SickLeisureDrop, par.SleepPairs = *sickMask, *sickDrop, *sleepPairs
	par.Workers = *workers

	trainDays := int(math.Ceil(float64(len(real)) * *train))
	trainEnd := real[trainDays-1]
	scale := float64(*n) / float64(census.PaperPopulation)
	target := float64(trainEnd.TotalCases) * scale
	sum := runSummary{Name: *name, Build: info, TrainDays: trainDays, TrainEnd: trainEnd.Date.Format(scenario.DateLayout)}

	if *from != "" {
		b, err := os.ReadFile(*from)
		check(err)
		var prev runSummary
		check(json.Unmarshal(b, &prev))
		par.Beta = prev.Params.Beta
		par.DetectSymptomatic, par.DetectAsymptomatic = prev.Params.DetectSymptomatic, prev.Params.DetectAsymptomatic
		par.CloseContacts, par.HomeContact, par.OccupationContact = prev.Params.CloseContacts, prev.Params.HomeContact, prev.Params.OccupationContact
		par.CovidBedsPer1000, par.CareSeeking, par.OverloadDeathFactor, par.HospitalInfectiousDays = prev.Params.CovidBedsPer1000, prev.Params.CareSeeking, prev.Params.OverloadDeathFactor, prev.Params.HospitalInfectiousDays
		par.SickMaskShare, par.SickLeisureDrop, par.SleepPairs = prev.Params.SickMaskShare, prev.Params.SickLeisureDrop, prev.Params.SleepPairs
		if prev.Compliance > 0 {
			sc = sc.WithCompliance(prev.Compliance)
			sum.Compliance = prev.Compliance
		}
		logf("parameters from %s: beta %.5f, detection %.3f/%.3f, compliance %.3f", *from, par.Beta, par.DetectSymptomatic, par.DetectAsymptomatic, prev.Compliance)
	} else if *beta > 0 {
		par.Beta = *beta
	} else {
		sum.Calibrated = true
		sum.Fit = *fit
		targetDeaths := float64(trainEnd.Deaths) * scale
		probePar := par
		if *fit != "cases" {
			// the reporting rate does not affect the dynamics: count every
			// symptomatic infection and a quarter of asymptomatic ones while
			// fitting, then scale detection to match training cases
			probePar.DetectSymptomatic, probePar.DetectAsymptomatic = 1, 0.25
		}
		var lastCases int
		runTrain := func(p sim.Params, scn *scenario.Scenario) (int, int) {
			s := sim.New(w, scn, vaccines, p)
			st := s.Run(trainDays, nil)
			return st[len(st)-1].TotalCases, st[len(st)-1].TotalDeaths
		}
		if *fit == "compliance" {
			// beta from the literature R0 of the ancestral strain
			lo, hi := 0.01, 0.5
			for it := 0; it < 12; it++ {
				mid := math.Sqrt(lo * hi)
				p := probePar
				p.Beta = mid
				if _, r := estimateR0(w, p, sc); r < *r0 {
					lo = mid
				} else {
					hi = mid
				}
			}
			probePar.Beta = math.Sqrt(lo * hi)
			_, got := estimateR0(w, probePar, sc)
			sum.R0 = got
			logf("beta %.5f gives R0 %.2f for the ancestral strain (target %.2f)", probePar.Beta, got, *r0)
			logf("calibrating intervention compliance on the first %d days (until %s): target %.0f cumulative deaths", trainDays, sum.TrainEnd, targetDeaths)
			// more compliance -> fewer deaths (monotone decreasing)
			cl, ch := 0.0, 1.0
			probeC := func(c float64) int {
				cc, d := runTrain(probePar, sc.WithCompliance(c))
				lastCases = cc
				sum.Calibration = append(sum.Calibration, calibrationStep{c, cc, d})
				logf("  compliance %.4f -> %d cases, %d deaths", c, cc, d)
				return d
			}
			if float64(probeC(ch)) > targetDeaths {
				logf("  full compliance still overshoots; keeping compliance 1")
				cl = 1
			} else if float64(probeC(cl)) < targetDeaths {
				logf("  no interventions still undershoot; keeping compliance 0")
				ch = 0
			} else {
				for it := 0; it < 14 && ch-cl > 0.002; it++ {
					mid := (cl + ch) / 2
					if float64(probeC(mid)) > targetDeaths {
						cl = mid
					} else {
						ch = mid
					}
				}
			}
			sum.Compliance = (cl + ch) / 2
			sc = sc.WithCompliance(sum.Compliance)
			par.Beta = probePar.Beta
			lastCases, _ = runTrain(probePar, sc)
			logf("calibrated compliance = %.3f", sum.Compliance)
		} else {
			target1 := target
			if *fit == "deaths" {
				target1 = targetDeaths
			}
			logf("calibrating beta on the first %d days (until %s): target %.0f cumulative %s", trainDays, sum.TrainEnd, target1, *fit)
			probe := func(b float64) bool { // true when below target
				p := probePar
				p.Beta = b
				c, d := runTrain(p, sc)
				lastCases = c
				sum.Calibration = append(sum.Calibration, calibrationStep{b, c, d})
				logf("  beta %.5f -> %d cases, %d deaths", b, c, d)
				if *fit == "deaths" {
					return float64(d) < targetDeaths
				}
				return float64(c) < target
			}
			lo, hi := 0.01, 0.5
			for probe(hi) && hi < 16 {
				lo = hi
				hi *= 2
			}
			for it := 0; it < 14; it++ {
				mid := math.Sqrt(lo * hi)
				if probe(mid) {
					lo = mid
				} else {
					hi = mid
				}
				if hi/lo < 1.005 {
					break
				}
			}
			par.Beta = math.Sqrt(lo * hi)
			logf("calibrated beta = %.5f", par.Beta)
			if *fit == "deaths" {
				p := probePar
				p.Beta = par.Beta
				lastCases, _ = runTrain(p, sc)
			}
		}
		if *fit != "cases" {
			d := target / float64(lastCases)
			if d > 1 {
				d = 1
			}
			par.DetectSymptomatic, par.DetectAsymptomatic = d, 0.25*d
			logf("reporting rate fitted on training cases: %.1f%% of symptomatic, %.1f%% of asymptomatic infections", 100*d, 25*d)
		}
	}
	sum.Params = par

	logf("simulating %s .. %s (%d days)", sc.Start.Format(scenario.DateLayout), sc.End.Format(scenario.DateLayout), sc.Days())
	t0 := time.Now()
	s := sim.New(w, sc, vaccines, par)
	stats := s.Run(0, func(d sim.DayStats) {
		if d.Date.Day() == 1 {
			logf("  %s  infections %8d  cases %7d  deaths %5d  infectious %6d  hospitalized %5d  doses %d/%d/%d",
				d.Date.Format(scenario.DateLayout), d.TotalInfections, d.TotalCases, d.TotalDeaths, d.Infectious, d.Hospitalized, d.Dose1, d.Dose2, d.Dose3)
		}
	})
	sum.SimSeconds = time.Since(t0).Seconds()
	last := stats[len(stats)-1]
	logf("done in %.1fs: %d infections (%d people ever infected, %.1f%%), %d reported cases, %d deaths",
		sum.SimSeconds, last.TotalInfections, last.EverInfected, 100*float64(last.EverInfected)/float64(*n), last.TotalCases, last.TotalDeaths)

	check(os.MkdirAll(*out, 0o755))
	csvPath := filepath.Join(*out, *name+".csv")
	check(report.WriteCSV(csvPath, stats, *n))

	realS := report.FromReal(real)
	simS := report.FromStats("Pandemica Go engine", stats)
	if scale != 1 { // compare per capita when running a scaled-down city
		for k := range simS.Cases {
			simS.Cases[k] /= scale
			simS.Deaths[k] /= scale
			simS.Infections[k] /= scale
		}
	}
	first, lastDate := real[0].Date, real[len(real)-1].Date
	mTrain := report.Compare(realS, simS, first, trainEnd.Date)
	mTest := report.Compare(realS, simS, trainEnd.Date.AddDate(0, 0, 1), lastDate)
	mFull := report.Compare(realS, simS, first, lastDate)
	sum.Train, sum.Test, sum.Full = toJSON(mTrain), toJSON(mTest), toJSON(mFull)
	sum.Totals = map[string]int{"infections": last.TotalInfections, "everInfected": last.EverInfected, "cases": last.TotalCases, "deaths": last.TotalDeaths}
	sum.BySetting = map[string]int{}
	sum.ByActivity = map[string]int{}
	sum.Beds = map[string]int{"total": last.BedsTotal}
	for _, d := range stats {
		for l, v := range d.ByLabel {
			if v == 0 {
				continue
			}
			name := "imported"
			if l < int(activity.NumLabels) {
				name = activity.Catalog[l].Name
			}
			sum.ByActivity[name] += v
		}
		sum.Beds["turnedAway"] += d.TurnedAway
		if d.BedsUsed > sum.Beds["peakUsed"] {
			sum.Beds["peakUsed"] = d.BedsUsed
		}
		sum.Beds["admitted"] += d.NewHospitalizations - d.TurnedAway
	}
	for _, d := range stats {
		for k, v := range d.BySetting {
			sum.BySetting[sim.SettingNames[k]] += v
		}
	}
	fmt.Println()
	fmt.Printf("%-6s %-23s %10s %10s %10s %10s %9s %9s\n", "window", "dates", "real cases", "sim cases", "real dead", "sim dead", "paperAcc", "curveAcc")
	for _, row := range []struct {
		n string
		m report.Metrics
	}{{"train", mTrain}, {"test", mTest}, {"full", mFull}} {
		fmt.Printf("%-6s %s..%s %10.0f %10.0f %10.0f %10.0f %8.2f%% %8.2f%%\n", row.n, row.m.From.Format("2006-01-02"), row.m.To.Format("2006-01-02"),
			row.m.RealCases, row.m.SimCases, row.m.RealDeaths, row.m.SimDeaths, row.m.PaperAccuracy(), row.m.CurveAccuracy())
	}
	fmt.Printf("infections by setting: %v\n", sum.BySetting)
	type kv struct {
		k string
		v int
	}
	var acts []kv
	for k, v := range sum.ByActivity {
		acts = append(acts, kv{k, v})
	}
	sort.Slice(acts, func(a, b int) bool { return acts[a].v > acts[b].v })
	fmt.Print("infections by activity:")
	for k, a := range acts {
		if k == 14 {
			break
		}
		fmt.Printf(" %s=%d", a.k, a.v)
	}
	fmt.Printf("\nbeds: %v\n", sum.Beds)

	b, _ := json.MarshalIndent(sum, "", "  ")
	check(os.WriteFile(filepath.Join(*out, *name+".json"), b, 0o644))

	// HTML report
	paper, perr := report.LoadResultCSV("Paper (TypeScript v1)", filepath.Join(*root, "web/public/simulation/results/campinas/v1.csv"))
	casesChart := report.Chart{Title: "Cumulative reported cases"}
	deathsChart := report.Chart{Title: "Cumulative deaths"}
	casesChart.Series = append(casesChart.Series, report.Line{Name: realS.Name, Dates: realS.Dates, Values: realS.Cases})
	deathsChart.Series = append(deathsChart.Series, report.Line{Name: realS.Name, Dates: realS.Dates, Values: realS.Deaths})
	if perr == nil {
		casesChart.Series = append(casesChart.Series, report.Line{Name: paper.Name, Dates: paper.Dates, Values: paper.Cases, Dashed: true})
		deathsChart.Series = append(deathsChart.Series, report.Line{Name: paper.Name, Dates: paper.Dates, Values: paper.Deaths, Dashed: true})
	}
	casesChart.Series = append(casesChart.Series, report.Line{Name: simS.Name, Dates: simS.Dates, Values: simS.Cases})
	deathsChart.Series = append(deathsChart.Series, report.Line{Name: simS.Name, Dates: simS.Dates, Values: simS.Deaths})
	weekly := func(dates []time.Time, cum []float64) ([]time.Time, []float64) {
		var d []time.Time
		var v []float64
		for k := 7; k < len(cum); k += 7 {
			d = append(d, dates[k])
			v = append(v, cum[k]-cum[k-7])
		}
		return d, v
	}
	wr, wrv := weekly(realS.Dates, realS.Cases)
	ws, wsv := weekly(simS.Dates, simS.Cases)
	wi, wiv := weekly(simS.Dates, simS.Infections)
	weeklyChart := report.Chart{Title: "Weekly new cases (and simulated infections)", Series: []report.Line{
		{Name: "Real weekly cases", Dates: wr, Values: wrv},
		{Name: "Simulated weekly infections", Dates: wi, Values: wiv, Dashed: true},
		{Name: "Simulated weekly reported cases", Dates: ws, Values: wsv},
	}}
	settingChart := report.Chart{Title: "Cumulative infections by setting"}
	for k := 0; k < sim.NumSettings; k++ {
		var d []time.Time
		var v []float64
		c := 0.0
		for _, st := range stats {
			c += float64(st.BySetting[k])
			d = append(d, st.Date)
			v = append(v, c)
		}
		settingChart.Series = append(settingChart.Series, report.Line{Name: sim.SettingNames[k], Dates: d, Values: v})
	}
	var vd []time.Time
	var v1, v2, v3 []float64
	for _, st := range stats {
		vd = append(vd, st.Date)
		v1 = append(v1, float64(st.Dose1))
		v2 = append(v2, float64(st.Dose2))
		v3 = append(v3, float64(st.Dose3))
	}
	vaxChart := report.Chart{Title: "Vaccine doses applied (cumulative, simulated population)", Series: []report.Line{
		{Name: "1st dose", Dates: vd, Values: v1}, {Name: "2nd dose", Dates: vd, Values: v2}, {Name: "boosters", Dates: vd, Values: v3}}}
	var tb strings.Builder
	fmt.Fprintf(&tb, "<p>%d individuals, beta %.4f%s, detection sym/asym %.2f/%.2f. Simulated %d days in %.0fs.</p>",
		*n, par.Beta, map[bool]string{true: " (calibrated on the first 20%)", false: ""}[sum.Calibrated], par.DetectSymptomatic, par.DetectAsymptomatic, len(stats), sum.SimSeconds)
	tb.WriteString("<table><tr><th>Window</th><th>Real cases</th><th>Sim cases</th><th>Real deaths</th><th>Sim deaths</th><th>Paper accuracy</th><th>Curve accuracy</th></tr>")
	for _, row := range []struct {
		n string
		m report.Metrics
	}{{"Train (first 20%)", mTrain}, {"Test (last 80%)", mTest}, {"Full period", mFull}} {
		fmt.Fprintf(&tb, "<tr><td>%s</td><td>%.0f</td><td>%.0f</td><td>%.0f</td><td>%.0f</td><td>%.2f%%</td><td>%.2f%%</td></tr>",
			row.n, row.m.RealCases, row.m.SimCases, row.m.RealDeaths, row.m.SimDeaths, row.m.PaperAccuracy(), row.m.CurveAccuracy())
	}
	tb.WriteString("</table>")
	check(report.WriteHTML(filepath.Join(*out, *name+".html"), "Pandemica — "+*name, tb.String(),
		[]report.Chart{casesChart, deathsChart, weeklyChart, settingChart, vaxChart}))
	logf("wrote %s, %s.json and %s.html", csvPath, *name, *name)
}

func check(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
