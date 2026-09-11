# Go engine — implementation plan

Order (each step = code + tests, `go test ./...` green before the next):

1. `engine/go.mod`, `internal/rng` (splitmix64, PCG32 stream, stable hash, weighted pick).
2. `internal/activity` catalog (labels/categories/durations/settings from model/src/population/activities.ts).
3. `internal/census` constants + `NormalizeAges`, `NormalizeResidentsPerHouse`, `Normalize`, `NormalizeIncomes`.
4. `internal/disease` risk multipliers, vaccine tables, age outcome tables, variants, hazard → probability.
5. `internal/nn` MLP 10-20-10, backprop, XOR test, trainer on generated samples.
6. `internal/population` synthesis into SoA arrays: sex, age, houses+regions, education, schools, work sites, income, transport.
7. `internal/routine` weekly routines (work shifts, study, transport, leisure via nn weights, mimicking, day = 1440).
8. `internal/scenario` JSON timeline (lockdown phases, masks, variants), vaccine CSV, real cases CSV.
9. `internal/sim` engine: locations, presence index, exposure pass (parallel), progression, daily stats.
10. `internal/report` CSV writer (real-data schema), MAPE, HTML chart.
11. `cmd/pandemica`: `population` (stats), `calibrate` (β bisection on first 20%), `run`.
12. Full Campinas run, calibration, results CSV/HTML, artifact, README, commit, merge.
