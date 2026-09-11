// Package scenario loads the scenario timeline (interventions and variants),
// the real Campinas case/death series and the vaccination registry.
package scenario

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

// DateLayout is the date format used everywhere.
const DateLayout = "2006-01-02"

// Date wraps time.Time with JSON (un)marshalling in DateLayout.
type Date struct{ time.Time }

func (d *Date) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), `"`)
	t, err := time.Parse(DateLayout, s)
	if err != nil {
		return err
	}
	d.Time = t
	return nil
}

func (d Date) MarshalJSON() ([]byte, error) {
	return []byte(`"` + d.Format(DateLayout) + `"`), nil
}

// Phase is a set of behaviour levels valid from Date until the next phase.
type Phase struct {
	Date             Date    `json:"date"`
	Note             string  `json:"note,omitempty"`
	LeisureReduction float64 `json:"leisureReduction"` // share of venue activities skipped
	WorkFromHome     float64 `json:"workFromHome"`     // share of workers not going to work
	SchoolsClosed    float64 `json:"schoolsClosed"`    // share of students studying from home
	MaskAdherence    float64 `json:"maskAdherence"`    // share wearing masks out of home
	MaskType         string  `json:"maskType"`         // thin | cloth | surgical | n95
	Isolation        float64 `json:"isolation"`        // share of symptomatic people isolating
}

// VariantIntro seeds imported infections of a variant.
type VariantIntro struct {
	Date    Date   `json:"date"`
	Variant string `json:"variant"`
	Seeds   int    `json:"seeds"`
}

// Scenario is the full timeline.
type Scenario struct {
	Name              string         `json:"name"`
	Start             Date           `json:"start"`
	End               Date           `json:"end"`
	InitialInfections int            `json:"initialInfections"`
	ImportDays        int            `json:"importDays"`   // days of continued importation after start
	ImportPerDay      float64        `json:"importPerDay"` // expected imported infections per day
	Phases            []Phase        `json:"phases"`
	Variants          []VariantIntro `json:"variants"`
	VaccinesEnabled   bool           `json:"vaccinesEnabled"`
}

// Load reads a scenario JSON file.
func Load(path string) (*Scenario, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var s Scenario
	if err := json.Unmarshal(b, &s); err != nil {
		return nil, fmt.Errorf("scenario %s: %w", path, err)
	}
	return &s, s.Validate()
}

// Validate checks ordering and ranges.
func (s *Scenario) Validate() error {
	if !s.End.After(s.Start.Time) {
		return fmt.Errorf("scenario end must be after start")
	}
	if len(s.Phases) == 0 {
		return fmt.Errorf("scenario needs at least one phase")
	}
	sort.SliceStable(s.Phases, func(a, b int) bool { return s.Phases[a].Date.Before(s.Phases[b].Date.Time) })
	sort.SliceStable(s.Variants, func(a, b int) bool { return s.Variants[a].Date.Before(s.Variants[b].Date.Time) })
	for _, p := range s.Phases {
		for _, v := range []float64{p.LeisureReduction, p.WorkFromHome, p.SchoolsClosed, p.MaskAdherence, p.Isolation} {
			if v < 0 || v > 1 {
				return fmt.Errorf("phase %s: values must be in [0,1]", p.Date.Format(DateLayout))
			}
		}
		switch p.MaskType {
		case "", "thin", "cloth", "surgical", "n95":
		default:
			return fmt.Errorf("phase %s: unknown mask type %q", p.Date.Format(DateLayout), p.MaskType)
		}
	}
	return nil
}

// Days returns the number of simulated days (inclusive).
func (s *Scenario) Days() int {
	return int(s.End.Sub(s.Start.Time).Hours()/24) + 1
}

// PhaseAt returns the phase active on date t (the first phase if t precedes all).
func (s *Scenario) PhaseAt(t time.Time) Phase {
	cur := s.Phases[0]
	for _, p := range s.Phases {
		if !p.Date.After(t) {
			cur = p
		}
	}
	return cur
}

// Clone deep-copies the scenario (so counterfactuals can edit phases).
func (s *Scenario) Clone() *Scenario {
	c := *s
	c.Phases = append([]Phase(nil), s.Phases...)
	c.Variants = append([]VariantIntro(nil), s.Variants...)
	return &c
}

// DailyCases is one row of the real epidemiological bulletin.
type DailyCases struct {
	EpiWeek    int
	Date       time.Time
	NewDeaths  int
	Deaths     int
	NewCases   int
	TotalCases int
}

// LoadCases reads campinas_2020_2021_2022_cases.csv.
func LoadCases(path string) ([]DailyCases, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	var out []DailyCases
	header := true
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if header {
			header = false
			continue
		}
		if line == "" {
			continue
		}
		c := strings.Split(line, ",")
		if len(c) < 9 {
			return nil, fmt.Errorf("cases: short line %q", line)
		}
		d, err := time.Parse(DateLayout, c[1])
		if err != nil {
			return nil, err
		}
		atoi := func(s string) int { v, _ := strconv.Atoi(s); return v }
		out = append(out, DailyCases{atoi(c[0]), d, atoi(c[5]), atoi(c[6]), atoi(c[7]), atoi(c[8])})
	}
	return out, sc.Err()
}

// VaccineRecord is one aggregated registry row: Count doses of number Dose of
// Vaccine given on Date to people of Sex in [AgeLo, AgeHi].
type VaccineRecord struct {
	Date    time.Time
	Dose    int
	Vaccine string // pfizer | astrazeneca | janssen | coronavac
	Female  bool
	AgeLo   int
	AgeHi   int
	Count   int
}

// VaccinePopulation is the pop2021 column of the registry (used to scale counts).
const VaccinePopulation = 1223237

// LoadVaccines reads campinas_2021_2022_2023_vaccines.csv
// (date,state,city,ibgeID,dose,vaccine,sex,age,count,pop2021). Rows with an
// unknown vaccine or age are skipped; "dose 0" (single dose) becomes dose 1.
func LoadVaccines(path string) ([]VaccineRecord, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	var out []VaccineRecord
	header := true
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if header {
			header = false
			continue
		}
		if line == "" {
			continue
		}
		c := strings.Split(line, ",")
		if len(c) < 9 {
			return nil, fmt.Errorf("vaccines: short line %q", line)
		}
		if c[0] == "" { // 67 registry rows (690 doses) have no date
			continue
		}
		d, err := time.Parse(DateLayout, c[0])
		if err != nil {
			return nil, err
		}
		dose, _ := strconv.Atoi(c[4])
		if dose == 0 {
			dose = 1
		}
		var vac string
		switch {
		case strings.HasPrefix(c[5], "Pfizer"):
			vac = "pfizer"
		case c[5] == "AstraZeneca":
			vac = "astrazeneca"
		case c[5] == "Janssen":
			vac = "janssen"
		case c[5] == "Sinovac":
			vac = "coronavac"
		default:
			continue
		}
		lo, hi, ok := parseAge(c[7])
		if !ok {
			continue
		}
		count, _ := strconv.Atoi(c[8])
		if count <= 0 {
			continue
		}
		out = append(out, VaccineRecord{d, dose, vac, c[6] == "F", lo, hi, count})
	}
	sort.SliceStable(out, func(a, b int) bool { return out[a].Date.Before(out[b].Date) })
	return out, sc.Err()
}

func parseAge(s string) (int, int, bool) {
	if s == "90+" {
		return 90, 120, true
	}
	parts := strings.Split(s, "-")
	if len(parts) != 2 {
		return 0, 0, false
	}
	lo, err1 := strconv.Atoi(parts[0])
	hi, err2 := strconv.Atoi(parts[1])
	if err1 != nil || err2 != nil {
		return 0, 0, false
	}
	return lo, hi, true
}
