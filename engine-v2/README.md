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

## v2.1: adaptive behaviour and a whole-curve fit

Diagnosis of v1 and v2 final: both matched the cumulative deaths of 7 Oct 2020
(the last training day) with the wrong shape. The 2020 wave peaked three months
late (Oct–Nov instead of late July) and three times too tall, which then left
too much immunity for the Gamma wave.

v2.1 adds two things and changes nothing else:

* **Adaptive behaviour** (paper, Scope: "human behaviour is adaptive"): people give
  up optional contacts (leisure, office work) in proportion to the deaths of the
  previous two weeks, which they learn about a week late. It reacts to the
  model's own deaths, never the real series. Strength: `-awareness`.
* **Whole-curve calibration** (`-fit trajectory`): awareness and compliance are
  fitted to every day of the training window's cumulative deaths, not only the
  last one. Still only the first 20% of days.

| Seed | awareness | compliance | training MAPE | deaths (real 5,360) | cases | curve (test) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0.05 | 0.297 | 12.9% | 5,298 | 726,336 | 55.0% |
| 2 | 0.05 | 0.284 | 10.8% | 5,560 | 650,998 | 61.3% |
| 3 | 0.05 | 0.326 | 10.5% | 5,120 | 749,693 | 52.7% |
| mean | | | | 5,326 (−0.6%) | 709,009 | **56.3%** |
| seed 1, without adaptive behaviour | 0 | 0.459 | 52.1% | 6,901 | 419,384 | 53.7% |

Against v1 (mean held-out curve score 47.7%, deaths +12–15%) and v2 final
(36.1%, +28–29%), v2.1 is the best of the three on every seed.

**Do not quote the curve score as "the model's accuracy".** It is
100 - mean(cumulative-cases MAPE, cumulative-deaths MAPE) on the held-out days,
so it averages one good number with one bad one, and it depends entirely on
which metric you pick:

| v2.1, held-out 80%, mean of 3 seeds | |
| --- | ---: |
| cumulative deaths MAPE | 13.3% |
| cumulative reported cases MAPE | 74.1% |
| curve score (100 - mean of the two) | 56.3% |
| weekly new deaths MAPE | 209% |
| weekly new cases MAPE | 749% |
| the paper's own metric (final totals) | **-20.8%** |

Defensible claims: the death total lands within 5% on every seed and the
cumulative death curve stays within ~13% over the held-out period; the 2020 peak
falls in the right fortnight. Reported cases are ~3.5x too high, and week-to-week
numbers are far noisier than the cumulative curves suggest.

Deaths added per period (seed 1 of each engine; real bulletin in the first column):

| Period | real | v1 | v2 final | v2.1 |
| --- | ---: | ---: | ---: | ---: |
| training (to 7 Oct 2020) | 1,253 | 1,436 | 1,505 | 1,291 |
| late 2020 | 221 | 2,504 | 3,077 | 741 |
| Gamma wave (H1 2021) | 2,263 | 368 | 300 | 1,323 |
| H2 2021 | 895 | 770 | 860 | 680 |
| 2022 (Omicron) | 728 | 1,110 | 1,172 | 1,263 |

2020 peak week: real 29 Jul (103 deaths); v1 4 Nov (296); v2 final 28 Oct (351);
v2.1 8–15 Jul (106–155).

What is still wrong: reported cases stay ~3x too high because the reporting rate
fitted in 2020 is held fixed; the Gamma wave is about 57% of its real size; and
Omicron-era deaths are overestimated.
