// Package report writes simulation outputs in the schema of the real Campinas
// bulletin, computes the paper's error metric (MAPE) and renders an HTML chart.
package report

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/ojpbarbosa/pandemica/engine-v2/internal/scenario"
	"github.com/ojpbarbosa/pandemica/engine-v2/internal/sim"
)

// WriteCSV writes one row per day. The first twelve columns match
// campinas_2020_2021_2022_cases.csv so the web chart can read the file; extra
// columns carry infections, hospitalizations, settings and vaccination.
func WriteCSV(path string, stats []sim.DayStats, population int) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	w := bufio.NewWriter(f)
	fmt.Fprint(w, "epi_week,date,state,city,ibgeID,newDeaths,deaths,newCases,totalCases,deaths_per_100k_inhabitants,totalCases_per_100k_inhabitants,deaths_by_totalCases")
	fmt.Fprint(w, ",newInfections,newReinfections,totalInfections,everInfected,infectious,hospitalized,newHospitalizations,dose1,dose2,dose3,bedsUsed,bedsTotal,turnedAway")
	for _, s := range sim.SettingNames {
		fmt.Fprintf(w, ",infections_%s", s)
	}
	fmt.Fprintln(w)
	per100k := 100000 / float64(population)
	for _, d := range stats {
		_, wk := d.Date.ISOWeek()
		ratio := 0.0
		if d.TotalCases > 0 {
			ratio = float64(d.TotalDeaths) / float64(d.TotalCases)
		}
		fmt.Fprintf(w, "%d,%s,SP,Campinas/SP,3509502,%d,%d,%d,%d,%.3f,%.3f,%.3f",
			wk, d.Date.Format(scenario.DateLayout), d.NewDeaths, d.TotalDeaths, d.NewCases, d.TotalCases,
			float64(d.TotalDeaths)*per100k, float64(d.TotalCases)*per100k, ratio)
		fmt.Fprintf(w, ",%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d", d.NewInfections, d.NewReinfections, d.TotalInfections, d.EverInfected,
			d.Infectious, d.Hospitalized, d.NewHospitalizations, d.Dose1, d.Dose2, d.Dose3, d.BedsUsed, d.BedsTotal, d.TurnedAway)
		for _, v := range d.BySetting {
			fmt.Fprintf(w, ",%d", v)
		}
		fmt.Fprintln(w)
	}
	return w.Flush()
}

// Series is a named daily cumulative series.
type Series struct {
	Name       string
	Dates      []time.Time
	Cases      []float64 // cumulative reported cases
	Deaths     []float64 // cumulative deaths
	Infections []float64 // cumulative infections (simulated only)
}

// FromStats converts simulation stats into a Series.
func FromStats(name string, stats []sim.DayStats) Series {
	s := Series{Name: name}
	for _, d := range stats {
		s.Dates = append(s.Dates, d.Date)
		s.Cases = append(s.Cases, float64(d.TotalCases))
		s.Deaths = append(s.Deaths, float64(d.TotalDeaths))
		s.Infections = append(s.Infections, float64(d.TotalInfections))
	}
	return s
}

// FromReal converts the real bulletin into a Series.
func FromReal(rows []scenario.DailyCases) Series {
	s := Series{Name: "Real (Campinas bulletin)"}
	for _, r := range rows {
		s.Dates = append(s.Dates, r.Date)
		s.Cases = append(s.Cases, float64(r.TotalCases))
		s.Deaths = append(s.Deaths, float64(r.Deaths))
	}
	return s
}

// LoadResultCSV reads a result file in the bulletin schema (optionally with a
// leading index column, like the paper's v1.csv).
func LoadResultCSV(name, path string) (Series, error) {
	s := Series{Name: name}
	f, err := os.Open(path)
	if err != nil {
		return s, err
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	var idx map[string]int
	for sc.Scan() {
		c := strings.Split(strings.TrimSpace(sc.Text()), ",")
		if idx == nil {
			idx = map[string]int{}
			for k, h := range c {
				idx[h] = k
			}
			continue
		}
		d, err := time.Parse(scenario.DateLayout, c[idx["date"]])
		if err != nil {
			return s, err
		}
		tc, _ := strconv.ParseFloat(c[idx["totalCases"]], 64)
		de, _ := strconv.ParseFloat(c[idx["deaths"]], 64)
		s.Dates = append(s.Dates, d)
		s.Cases = append(s.Cases, tc)
		s.Deaths = append(s.Deaths, de)
	}
	return s, sc.Err()
}

// MAPE is the mean absolute percentage error (in %) over points where the
// reference is positive.
func MAPE(ref, pred []float64) float64 {
	sum, n := 0.0, 0
	for k := range ref {
		if k >= len(pred) || ref[k] <= 0 {
			continue
		}
		sum += math.Abs(pred[k]-ref[k]) / ref[k]
		n++
	}
	if n == 0 {
		return math.NaN()
	}
	return 100 * sum / float64(n)
}

// Metrics compares a simulated series with the real one.
type Metrics struct {
	From, To              time.Time
	CasesMAPE             float64 // cumulative cases
	DeathsMAPE            float64 // cumulative deaths
	WeeklyCasesMAPE       float64 // weekly new cases
	WeeklyDeathsMAPE      float64
	RealCases, SimCases   float64 // at To
	RealDeaths, SimDeaths float64
}

// PaperAccuracy is the paper's definition: 100 minus the mean absolute
// percentage error of the final totals (cases and deaths). For the TypeScript
// run (289,943 cases / 7,752 deaths vs 209,500 / 5,360) it gives 58.48%.
func (m Metrics) PaperAccuracy() float64 {
	if m.RealCases <= 0 || m.RealDeaths <= 0 {
		return math.NaN()
	}
	ec := math.Abs(m.SimCases-m.RealCases) / m.RealCases
	ed := math.Abs(m.SimDeaths-m.RealDeaths) / m.RealDeaths
	return 100 - 100*(ec+ed)/2
}

// CurveAccuracy is a stricter day-by-day score: 100 minus the mean of the
// cumulative-cases and cumulative-deaths MAPE over the window.
func (m Metrics) CurveAccuracy() float64 { return 100 - (m.CasesMAPE+m.DeathsMAPE)/2 }

// Compare aligns both series by date and computes metrics over [from, to].
func Compare(real, simulated Series, from, to time.Time) Metrics {
	m := Metrics{From: from, To: to}
	pos := map[string]int{}
	for k, d := range simulated.Dates {
		pos[d.Format(scenario.DateLayout)] = k
	}
	var rc, sc, rd, sd []float64
	for k, d := range real.Dates {
		if d.Before(from) || d.After(to) {
			continue
		}
		j, ok := pos[d.Format(scenario.DateLayout)]
		if !ok {
			continue
		}
		rc = append(rc, real.Cases[k])
		sc = append(sc, simulated.Cases[j])
		rd = append(rd, real.Deaths[k])
		sd = append(sd, simulated.Deaths[j])
	}
	if len(rc) == 0 {
		return m
	}
	m.CasesMAPE = MAPE(rc, sc)
	m.DeathsMAPE = MAPE(rd, sd)
	m.WeeklyCasesMAPE = MAPE(weekly(rc), weekly(sc))
	m.WeeklyDeathsMAPE = MAPE(weekly(rd), weekly(sd))
	m.RealCases, m.SimCases = rc[len(rc)-1], sc[len(sc)-1]
	m.RealDeaths, m.SimDeaths = rd[len(rd)-1], sd[len(sd)-1]
	return m
}

// weekly converts a cumulative series into non-overlapping 7-day increments.
func weekly(cum []float64) []float64 {
	var out []float64
	for k := 7; k < len(cum); k += 7 {
		out = append(out, cum[k]-cum[k-7])
	}
	return out
}

// ValueAt returns the cumulative value of s at date d (or the last before it).
func ValueAt(vals []float64, dates []time.Time, d time.Time) float64 {
	v := 0.0
	for k, x := range dates {
		if x.After(d) {
			break
		}
		v = vals[k]
	}
	return v
}
