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
`-hospital-staff-share 0.5`, `-covid-beds-per-1000 1.0`, `-care-seeking 0.6`,
`-overload-death-factor 2`, `-hospital-infectious-days 5`, `-home 1.0`.

## Run

```bash
go test ./...
go build -o bin/pandemica ./cmd/pandemica
./bin/pandemica run -fit compliance -name compliance-fit
```
