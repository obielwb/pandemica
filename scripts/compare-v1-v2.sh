#!/usr/bin/env bash
# Build and run the frozen v1 engine and the v2 fork side by side with the same
# seed and calibration method, one after the other (a full run needs ~1.5 GB).
#
#   scripts/compare-v1-v2.sh [seed]
#
# Results: engine/results/compare-v1-seed<N>.* and engine-v2/results/compare-v2-seed<N>.*
set -euo pipefail
seed="${1:-1}"
root="$(cd "$(dirname "$0")/.." && pwd)"
for v in engine engine-v2; do
  (cd "$root/$v" && go build -o bin/pandemica ./cmd/pandemica)
done
export GOMEMLIMIT=6GiB
(cd "$root/engine" && ./bin/pandemica run -seed "$seed" -fit compliance -r0 2.8 -name "compare-v1-seed$seed")
(cd "$root/engine-v2" && ./bin/pandemica run -seed "$seed" -fit compliance -r0 2.8 -name "compare-v2-seed$seed")
python3 - "$root" "$seed" <<'PY'
import json, sys
root, seed = sys.argv[1], sys.argv[2]
rows = []
for v, d in (("v1", "engine"), ("v2", "engine-v2")):
    s = json.load(open(f"{root}/{d}/results/compare-{v}-seed{seed}.json"))
    rows.append((v, s["totals"]["deaths"], s["totals"]["cases"], s["full"]["paperAccuracy"], s["full"]["curveAccuracy"], s["infectionsBySetting"]))
print(f"{'':4} {'deaths':>8} {'cases':>9} {'paperAcc':>9} {'curveAcc':>9}")
for v, d, c, pa, ca, _ in rows:
    print(f"{v:4} {d:8d} {c:9d} {pa:8.1f}% {ca:8.1f}%")
for v, *_, st in rows:
    tot = sum(st.values())
    print(v, " ".join(f"{k}={100*n/tot:.1f}%" for k, n in sorted(st.items(), key=lambda kv: -kv[1])))
PY
