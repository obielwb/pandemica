# Pandemica engine v2 — design

Date: 2026-09-11. Scope confirmed by João: all four changes below.

v1 (`engine/`) stays frozen as the reference run. v2 (`engine-v2/`) is a fork with
its own Go module (`github.com/ojpbarbosa/pandemica/engine-v2`) so both build and
run side by side on the same data.

Every change brings back something from the paper or the original TypeScript model
(`model/src`). Numbers that are not in the repository are marked as assumptions and
exposed as flags.

## 1. Hospitals as places

Source: TS `Category.Hospital` + `hospitalized` activity (indoor, silent, maxEngaged 2),
paper attribute "Hospitalized?", paper concern with health-system overload.

- Health workers: IBGE 2010 "Saúde humana e serviços sociais" = 30,940 people,
  scaled to the simulated population. A share of them (assumption, `-hospital-staff-share 0.5`)
  work in hospitals; they are drawn from the commerce-and-services workers so the
  employed total is unchanged.
- Hospital staff work 12-hour 12x36 shifts (`HospitalShift` label, cannot work from home)
  in ward teams (maxEngaged 25). Each ward team is one location; it is also where its
  patients lie.
- COVID beds (assumption, `-covid-beds-per-1000 1.0`) are split over wards in
  proportion to team size.
- An admitted patient occupies a ward bed and stays infectious for 5 days after
  admission (assumption; severe cases shed longer). Patients are present all day
  (silent voice); staff meet them during shifts. Staff wear N95 at work.
- Infections are attributed to a new `hospital` setting.

## 2. Sick people's routine

Source: TS `assignInfectiousRoutine(individual, useMask, maskType, interruptedActivities)`.

- On symptom onset, a symptomatic person visits a pharmacy for 15 minutes
  (assumption `-care-seeking 0.6`), at a pharmacy instance of their region.
- Isolating symptomatic people (phase `isolation`) stay home apart from that visit.
- Non-isolating symptomatic people drop leisure, shopping and errands
  (TS interruptedActivities), keep work and study, and wear a mask (TS useMask)
  of the phase's type.

## 3. Home follows maxEngaged

Source: TS activity catalog (`stayAtHome` indoor/normal voice/maxEngaged 11,
sleep maxEngaged 2) and TS `calculate`, which applies the reference interaction to
every activity, home included.

- Sleep is shared only between sleep partners: housemates are paired at build time
  (oldest adults together, then children in pairs; one left alone when odd).
  Housemates asleep in different rooms do not interact; a sleeping person does not
  interact with awake housemates.
- Awake time at home uses the full reference interaction (no 0.5 home-intensity
  knob), with the same group dilution as every other place (houses have at most 11).

## 4. Hospital capacity

Source: paper, "Flattening the curve" and "Preventing healthcare system overload".

- When no ward bed is free at admission, the patient stays home (and can infect the
  household), and the death probability of a severe case doubles (assumption,
  `-overload-death-factor 2`).
- Daily bed occupancy and turned-away admissions are reported.

## Diagnostics (always on)

- Infections are attributed to the exact activity label of the largest contribution
  (pharmacy, bar, hospital ward, sleep, stay at home, …) and totalled in the run
  summary, next to the six settings.

## Calibration and comparison

Same hold-out method as v1's headline run (`-fit compliance`): beta from R0 = 2.8,
intervention compliance fitted on training-window deaths, reporting rate on training
cases. `scripts/compare-v1-v2.sh` runs both engines with the same seed and writes
both result sets; the results page shows v1 and v2 side by side.
