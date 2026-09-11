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
	"strings"
	"time"

	"github.com/ojpbarbosa/pandemica/engine/internal/activity"
	"github.com/ojpbarbosa/pandemica/engine/internal/census"
	"github.com/ojpbarbosa/pandemica/engine/internal/population"
	"github.com/ojpbarbosa/pandemica/engine/internal/report"
	"github.com/ojpbarbosa/pandemica/engine/internal/routine"
	"github.com/ojpbarbosa/pandemica/engine/internal/scenario"
	"github.com/ojpbarbosa/pandemica/engine/internal/sim"
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

func build(n int, seed uint64) (*sim.World, buildInfo) {
	t0 := time.Now()
	logf("synthesizing %d individuals", n)
	p, err := population.Generate(population.Options{N: n, Seed: seed})
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

func cmdPopulation(args []string) {
	fs := flag.NewFlagSet("population", flag.ExitOnError)
	n := fs.Int("n", census.PaperPopulation, "population size")
	seed := fs.Uint64("seed", 1, "random seed")
	fs.Parse(args)
	w, info := build(*n, *seed)
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
	Calibration []calibrationStep `json:"calibration,omitempty"`
	SimSeconds  float64           `json:"simSeconds"`
	Train       metricsJSON       `json:"train"`
	Test        metricsJSON       `json:"test"`
	Full        metricsJSON       `json:"full"`
	Totals      map[string]int    `json:"totals"`
	BySetting   map[string]int    `json:"infectionsBySetting"`
}

type calibrationStep struct {
	Beta  float64 `json:"beta"`
	Cases int     `json:"cases"`
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
	root := fs.String("root", "..", "repository root (for model/data and web/public)")
	scPath := fs.String("scenario", "scenarios/campinas.json", "scenario timeline")
	beta := fs.Float64("beta", 0, "transmission scale; 0 = calibrate on the training window")
	train := fs.Float64("train", 0.2, "hold-out training fraction (paper: first 20%)")
	detSym := fs.Float64("detect-sym", 1, "probability a symptomatic infection is reported (paper: 1)")
	detAsym := fs.Float64("detect-asym", 1, "probability an asymptomatic infection is reported (paper: 1)")
	contacts := fs.Float64("close-contacts", 10, "effective close contacts in a group")
	home := fs.Float64("home", 0.5, "household contact intensity")
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
	w, info := build(*n, *seed)

	par := sim.DefaultParams()
	par.Seed = *seed
	par.DetectSymptomatic, par.DetectAsymptomatic = *detSym, *detAsym
	par.CloseContacts, par.HomeContact, par.OccupationContact = *contacts, *home, *occ
	par.Workers = *workers

	trainDays := int(math.Ceil(float64(len(real)) * *train))
	trainEnd := real[trainDays-1]
	scale := float64(*n) / float64(census.PaperPopulation)
	target := float64(trainEnd.TotalCases) * scale
	sum := runSummary{Name: *name, Build: info, TrainDays: trainDays, TrainEnd: trainEnd.Date.Format(scenario.DateLayout)}

	if *beta > 0 {
		par.Beta = *beta
	} else {
		sum.Calibrated = true
		logf("calibrating beta on the first %d days (until %s): target %.0f cumulative cases", trainDays, sum.TrainEnd, target)
		probe := func(b float64) int {
			p := par
			p.Beta = b
			s := sim.New(w, sc, vaccines, p)
			st := s.Run(trainDays, nil)
			c := st[len(st)-1].TotalCases
			sum.Calibration = append(sum.Calibration, calibrationStep{b, c})
			logf("  beta %.5f -> %d cases", b, c)
			return c
		}
		lo, hi := 0.01, 0.5
		for probe(hi) < int(target) && hi < 16 {
			lo = hi
			hi *= 2
		}
		for it := 0; it < 12; it++ {
			mid := math.Sqrt(lo * hi)
			if probe(mid) < int(target) {
				lo = mid
			} else {
				hi = mid
			}
			if hi/lo < 1.01 {
				break
			}
		}
		par.Beta = math.Sqrt(lo * hi)
		logf("calibrated beta = %.5f", par.Beta)
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
