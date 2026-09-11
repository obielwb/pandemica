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

## Results (Campinas, 2020-03-18 to 2022-12-31, seed 1)

Real bulletin: 209,500 cases and 5,360 deaths. The paper's TypeScript run:
289,943 cases and 7,752 deaths (58.48% by the paper's metric).

| Run | Calibration (first 20% of days only) | Cases | Deaths | Paper metric (full) | Curve score (test 80%) |
| --- | --- | ---: | ---: | ---: | ---: |
| `paper-mode` | beta fit on training cases, every infection is a case | 12,535,612 | 10,265 | -2,887.6% | -1,099.6% |
| `beta-fit-deaths` | beta fit on training deaths, reporting rate on training cases | 1,852,812 | 11,387 | -348.4% | -88.5% |
| `compliance-fit` (headline) | beta from R0 = 2.8, intervention compliance fit on training deaths (0.40), reporting rate on training cases (14.6%) | 657,300 | 6,188 | -14.6% | 39.3% |

Paper metric = 100 - mean(|error of final cases|, |error of final deaths|) in %.
Curve score = 100 - mean(MAPE of cumulative cases, MAPE of cumulative deaths)
over every day of the window.

What this says:

* **Counting every infection as a case (the paper's setup) cannot work.** Fitting
  2020 cases forces an ancestral-strain R0 of about 6.7 (`pandemica r0`), yet it
  still produces a ninth of the deaths observed by October 2020. The real
  epidemic had roughly seven infections per reported case.
* **Fitting transmission to 2020 deaths alone is a knife edge.** Beta 0.20 gives
  30k cases by October 2020, beta 0.24 gives 343k. The fit lands on R0 ~7.5,
  and once restrictions ease every later wave explodes.
* **Pinning R0 to the literature and fitting how strongly people followed the
  measures works for deaths.** Final deaths are 15% high and the 2021-2022
  cumulative curve stays close to the real one. Cases stay about 3x high
  because the reporting rate fitted on 2020 (14.6%) is held fixed, while
  real testing fell sharply in the Omicron era.
* **The 2020 wave comes late.** The model peaks in October-December 2020
  instead of July-August, so deaths are over-predicted at the end of 2020.
  The intervention timeline in `scenarios/campinas.json` is the weakest input.

Seed check (city rebuilt and recalibrated each time): seeds 1, 2 and 3 give
6,188 / 6,027 / 6,119 deaths, 657,300 / 609,162 / 532,223 cases, and full-period
curve scores of 38.8% / 44.9% / 50.1%.

Counterfactuals with the headline calibration (`-from results/compliance-fit.json`):
no lockdown, masks or school closures gives 10,244 deaths (+66%); no vaccines
gives 15,972 deaths (+158%).
