# Pandemica engine (Go)

A from-scratch Go implementation of the model described in the Pandemica paper.
It replaces the unfinished TypeScript prototype in `model/` and runs the full
Campinas scenario (1,164,099 agents, 2020-03-18 to 2022-12-31) on a laptop.

## Quick start

```bash
cd engine
go test ./...                       # unit + integration tests
go build -o bin/pandemica ./cmd/pandemica
./bin/pandemica population          # synthesize Campinas and print statistics
./bin/pandemica run                 # calibrate on the first 20% and simulate 2020-2022
```

`run` writes `results/<name>.csv` (same schema as the real bulletin plus extra
columns), `results/<name>.json` (parameters, calibration trace, metrics) and
`results/<name>.html` (charts against the real data and the paper's run).

Useful flags: `-beta` (skip calibration), `-n` (smaller city, compared per
capita), `-detect-sym` / `-detect-asym` (share of infections that become
reported cases; the paper counts every infection), `-no-vaccines`,
`-scenario` (another timeline), `-seed`.

## How it maps to the paper

| Paper | Engine |
| --- | --- |
| Census-based individuals: sex, age, education, house, region, income, transport, occupations | `internal/population` (quotas from `internal/census`, IBGE 2010, normalized to the paper's population) |
| Neural network 10-20-10 with backpropagation | `internal/nn`, trained in `internal/routine/leisure.go` on the rule-based preferences; it chooses each individual's leisure and shopping activities |
| Routines of activities (category, duration, distance, voice, environment) | `internal/activity` catalog, `internal/routine` weekly generator (shifts, 12x36, part time, night shifts, commutes, lunch, children follow guardians) |
| Location as an identifier instead of coordinates | houses, work teams, classes and venue instances share one id space; `internal/sim/world.go` indexes who is where for each weekday |
| Activity synchronization (Johnson-inspired ordered array) | exact interval overlap per location and day: two people only interact for the minutes they are really together |
| Reference interaction 14%/h and modifiers table | `internal/disease` (outdoor /20, 2 m /2, loud x5, silent /5, masks, vaccines, prior infection) |
| SEIR, age hospitalization/death table | `internal/disease` + `internal/sim` natural history (latent, infectious, asymptomatic 17%, hospitalization, death) |
| Masks, lockdown, vaccination triggers | `scenarios/campinas.json` timeline + the real dose registry (`model/data/covid19`) |
| Hold-out validation, 20% train / 80% test | `run` fits the single free parameter (beta) on the first 20% of days, evaluates on the rest |
| Accuracy "based on MAPE" | `report.Metrics.PaperAccuracy`: 100 minus the mean absolute percentage error of final cases and deaths; it reproduces the paper's 58.48% on `web/public/simulation/results/campinas/v1.csv` |

## Performance design

* Struct-of-arrays population (bytes per attribute, int32 ids).
* Routines in one flat array of 4-byte activities (~70M for the whole city).
* A static per-weekday presence index (8-byte entries) built once; behaviour
  changes (work from home, school closure, leisure reduction, isolation, masks)
  are evaluated with stable hashes at query time, so routines are never copied.
* Each day only infectious people are visited; their contacts are found in the
  index and hazard contributions are accumulated in parallel, then merged in a
  fixed order so runs are reproducible for a given seed.
