# Pandemica Go engine — design

Date: 2026-09-11. Author: Claude (autonomous overnight session, pre-approved by João).

## Goal

Rewrite the unfinished TypeScript simulation (`model/`) as a complete, tested Go engine
(`engine/`) that reproduces the paper's model end to end and runs the full Campinas
scenario (1,164,099 agents, 2020-03-18 → 2022-12-31, 1,020 days) on a MacBook
(Apple M4, 16 GB) in minutes, then compare the output with the real case/death series.

Paper claims implemented: census-driven synthetic population with houses, schools,
workplaces, income, transport; weekly activity routines per individual; a small
feedforward neural network (10-20-10, backprop) used in attribute/routine assignment;
microCOVID-style activity risk with mask, setting, distance, voice, vaccine and prior
infection modifiers; SEIR-style natural history with age-based hospitalization and
death; interventions (lockdown/work-from-home/school closure, masks, vaccination from
the real Campinas dose registry); hold-out calibration on the first 20% of the series.

## Non-goals

Web UI changes beyond dropping a result CSV where the existing chart can read it.
Geographic coordinates. Multi-city runs.

## Architecture

Go module `github.com/ojpbarbosa/pandemica/engine`.

```
cmd/pandemica         CLI: run | calibrate | population
internal/rng          splitmix64 / PCG, per-worker streams, stable hashes
internal/census       Campinas 2010 constants + normalization (from model/data/census/index.ts)
internal/activity     activity catalog: label, category, duration, setting, distance, voice, group size
internal/nn           10-20-10 MLP with backprop + trainer + sampler
internal/population   synthesis: sex, age, house/region, education, schools, work sites, income, transport
internal/routine      weekly routine generator (work shifts, study, transport, leisure weights, mimicking)
internal/disease      risk model + natural history parameters + variants
internal/scenario     timeline config (JSON) + vaccine registry CSV + real cases CSV
internal/sim          engine: population arrays (SoA), daily loop, presence index, infection, progression
internal/report       daily CSV in the real-data schema, MAPE, HTML chart
```

### Data layout (struct-of-arrays, N ≈ 1.16M)

Per individual: sex, age bracket, education, income bracket, transport, region (uint8);
house, work site, school (int32); work size/routine flags; routine offsets (uint32 +
8×uint16 day starts); disease state and event days (int32); vaccine type/doses/last dose
day; mask; behaviour flags (work-from-home, isolates when symptomatic).

Routines: one flat `[]Act{Label uint8, Dur uint16}` (4 bytes each, ≈70M entries ≈ 280 MB).

Locations share one integer id space: houses, then work sites, then schools, then venues
(per region × leisure label, sized by residents-per-venue table), plus transport lines.

### Daily loop

1. Apply scenario events for the date (lockdown phases, mask adherence, vaccines, variant).
2. Build infectious presence index: for every infectious individual, for each activity of
   today's routine resolve its location and push (start, end, weight) into `first[loc]`
   linked list. Weight = source mask × voice × asymptomatic factor × variant.
3. Exposure pass (parallel, per-worker RNG): for every susceptible/recovered individual walk
   today's activities; for locations with presences accumulate hazard
   `Σ overlap_hours × base × setting × distance × ownMask × (1-vaccineProtection) × (1-priorInfectionProtection) × β`;
   infect with probability `1 - exp(-hazard)`.
4. Progression: exposed → infectious (latent), symptom onset, hospitalization, death,
   recovery by pre-drawn event days; hospitalized/isolating individuals stay home.
5. Record daily counts (infections, reported cases = infections × ascertainment on
   symptom-onset day, hospitalizations, deaths) → CSV row.

Activities resolve to locations deterministically: home-category → house; in-person work →
work site; in-person study → school; leisure/shopping/transport → venue chosen by stable
hash(id, day, ordinal) inside the individual's region, so the infectious and susceptible
passes agree without storing anything.

Behaviour switches (work-from-home, school closed, leisure reduction fraction, isolation)
are evaluated at resolution time with the same stable hash, so no routine mutation is
needed during the run.

### Risk model

Reference interaction: 14%/hour, one infectious person, indoors, 1 m, normal voice
(paper). Modifiers from the paper's tables: outdoor /20, 2 m /2, extra metres /2, loud ×5,
silent /5, masks (own thin 1/2, cloth 1/3, surgical 1/4, N95 1/6), vaccines (paper's
adjusted infectivity ratios: Pfizer 0.17, AstraZeneca 0.47, CoronaVac 0.45, Janssen
0.36 for a full schedule; one dose half-way; booster ×0.6; linear waning after 90 days to
40% at one year), prior infection 0.92 protection (0.5 against Omicron). Variants scale
transmissibility (Gamma ×1.5, Delta ×1.5 on top, Omicron ×1.5 on top plus escape).
Household activities use a 0.5 contact factor (people are not 1 m apart all day).

The paper leaves the infection threshold "to be stipulated"; a hard threshold gives
all-or-nothing dynamics, so infection is Bernoulli on the accumulated hazard and the only
free parameter, β, is fitted on the hold-out window (first 20% of days) by bisection so
that simulated reported cases match the real cumulative count at the end of that window.

Natural history: latent 3 d (2 for Omicron), infectious 7 d, symptom onset day 4-5,
17% asymptomatic at 0.4 relative infectivity, hospitalization / death by age
(paper table 7), vaccines protect against severe outcomes (0.6 / 0.85 / 0.93 by doses),
50% of symptomatic individuals isolate at home, hospitalized are isolated.

### Neural network

`nn` implements a 10→20→10 sigmoid MLP trained with backprop. It is trained on samples
drawn from the census rule-based generator (inputs: age, sex, region, house size,
education, has-work, has-study, transport, income, weekday) to predict the leisure /
shopping activity preference distribution. The routine generator draws leisure
activities from the network's output for each individual, which is the "neural
network-like assignment" the paper describes. Hard census quotas (sex, age, houses,
schools, work sites, income brackets) stay quota-driven so totals always match IBGE.

### Testing

`go test ./...`: census normalization sums; population invariants (everyone housed, house
sizes exact, school/work counts, income quotas); routine invariants (each day = 1440 min,
children mimic guardians, work days per shift); NN learns XOR and matches training
marginals; risk modifiers reproduce the paper's reference numbers; progression timing;
presence overlap; small end-to-end runs (β=0 → no spread; seed → spread; determinism by
seed); vaccine registry allocation; report MAPE and CSV schema.

### Output

`engine/results/<run>.csv` in the real-data schema, `engine/results/<run>.html` chart,
copy of the calibrated run at `web/public/simulation/results/campinas/v2.csv`.
