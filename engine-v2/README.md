# Pandemica engine v2

A fork of the v1 engine (`../engine`, kept frozen as the reference) that brings
back four ideas from the paper and the original TypeScript model. Both engines
build and run side by side on the same data; `../scripts/compare-v1-v2.sh [seed]`
runs them one after the other with the same seed and calibration.

## What changed from v1

| Change | Source in the original conception | v1 behaviour | v2 behaviour |
| --- | --- | --- | --- |
| Hospitals as places | TS `Category.Hospital`, `hospitalized` activity (maxEngaged 2); paper attribute "Hospitalized?" | hospitalized agents vanish from all contacts; no health workers | ward teams of hospital staff (share of the IBGE 2010 health workforce, 30,940 people) work 12x36 shifts in N95; admitted patients shed on the ward for 5 days |
| Sick people's routine | TS `assignInfectiousRoutine(useMask, maskType, interruptedActivities)` | symptomatic agents either isolate completely or keep their full routine | symptomatic agents visit a pharmacy at onset, mask up, drop leisure, keep work and study; isolators stay home except the pharmacy visit |
| Home per maxEngaged | TS catalog: sleep maxEngaged 2, stayAtHome indoor/normal voice; TS `calculate` applies the reference interaction everywhere | the whole household shares the night; home contact scaled by 0.5 | only bedroom partners share the night; awake time at home uses the full reference interaction |
| Hospital capacity | paper: flattening the curve, health-system overload | unlimited beds | COVID beds per 1,000 inhabitants; severe cases without a bed stay home with doubled death probability |
| Diagnostics | — | infections by 6 settings | also by exact activity (pharmacy, ward, sleep, …), bed use and turn-aways |

## Assumptions (flags)

Numbers that are not in the repository's data are flags with stated defaults:
`-hospital-staff-share 0.5`, `-covid-beds-per-1000 0` (unlimited; set a number to model overload), `-care-seeking 0.6`,
`-overload-death-factor 2`, `-hospital-infectious-days 5`, `-home 1.0`.

## Run

```bash
go test ./...
go build -o bin/pandemica ./cmd/pandemica
./bin/pandemica run -fit compliance -name compliance-fit
```

## Results: ablation (Campinas 2020–2022, seed 1)

Every row recalibrates from scratch: beta from R0 = 2.8, intervention compliance
fitted on deaths up to 7 Oct 2020, reporting rate on cases in the same window.
Real bulletin: 209,500 cases, 5,360 deaths. Curve score = 100 − mean MAPE of
cumulative cases and deaths over the held-out 80%.

| Run | beta | deaths | cases | home | venue | hospital | turned away | curve (test) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| v1 (reference) | 0.072 | 6,188 | 657,300 | 45.7% | 42.8% | 0% | – | 39.3% |
| v2 first attempt (every sick person masked, no leisure) | 0.229 | 9,394 | 915,723 | 72.4% | 16.3% | 0.08% | 13,335 | −26.7% |
| v2, every change, 1 bed per 1,000 | 0.114 | 8,795 | 695,581 | 61.9% | 26.7% | 0.04% | 14,210 | −5.9% |
| – without sick routine | 0.066 | 8,030 | 643,298 | 53.1% | 36.9% | 0.02% | 12,574 | 14.5% |
| – without bedroom rule | 0.126 | 8,111 | 814,324 | 54.7% | 31.7% | 0.05% | 12,820 | −14.2% |
| **– without bed limit = v2 final** | 0.114 | 6,914 | 521,511 | 61.6% | 26.8% | 0.05% | 0 | **45.0%** |
| – without hospitals (no limit) | 0.113 | 6,856 | 737,424 | 61.7% | 26.9% | 0% | 0 | 18.3% |

What the ablation shows:

* **Pharmacies and hospitals are now real places, and they are small.** In v2
  final, pharmacies carry 0.9% of infections and hospital wards 0.04% (staff on
  N95 are rarely infected). The v1 zeros were artefacts; the true shares are
  small but nonzero.
* **Home grows, not shrinks.** Sick people who stay home and a full-strength
  reference interaction for awake time at home move infections indoors
  (46% → 62%).
* **The bed limit is the biggest lever and needs real data.** At 1 COVID bed per
  1,000 people the model turns away ~14,000 severe cases and overshoots deaths by
  64%; the repository has no bed counts, so v2 final leaves beds unlimited and
  keeps the limit as a what-if flag.
* **Across three seeds, v2 final does not beat v1.** Seed 1 alone suggested it
  did (45.0% vs 39.3% held-out curve score), but seeds 2 and 3 reverse it. The
  bedroom rule, hospitals and sick routines make the model more faithful to the
  original design, not more accurate against Campinas.

| Seed | v1 deaths | v1 curve (test) | v2 final deaths | v2 final curve (test) |
| --- | ---: | ---: | ---: | ---: |
| 1 | 6,188 | 39.3% | 6,914 | 45.0% |
| 2 | 6,027 | 48.1% | 6,904 | 33.4% |
| 3 | 6,119 | 55.7% | 6,869 | 29.8% |
| mean | 6,111 (+14%) | 47.7% | 6,896 (+29%) | 36.1% |

Counterfactuals with the v2 final calibration (`-from results/v2-final.json`):
no lockdown, masks or school closures gives 11,243 deaths (+63% vs 6,914);
no vaccines gives 17,938 (+159%). v1 gave +66% and +158%.
