#!/usr/bin/env python3
"""Build the single-page results report from engine/results/*.json|csv.

usage: results_page.py OUT.html verdict.html run1=Label1 run2=Label2 ...
The first run is treated as the headline model. Runs whose JSON is missing are
skipped. Also reads the real bulletin and the paper's TypeScript v1 results.
"""
import csv, json, os, sys, html

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RES = os.path.join(ROOT, "engine", "results")

def load_series(path, date_key="date"):
    rows = list(csv.DictReader(open(path)))
    return {
        "dates": [r[date_key] for r in rows],
        "cases": [int(float(r["totalCases"])) for r in rows],
        "deaths": [int(float(r["deaths"])) for r in rows],
        "infections": [int(float(r["totalInfections"])) for r in rows] if "totalInfections" in rows[0] else None,
        "settings": {k[len("infections_"):]: sum(int(r[k]) for r in rows) for k in rows[0] if k.startswith("infections_")},
        "reinf": sum(int(r.get("newReinfections", 0) or 0) for r in rows),
    }

def main():
    out, verdict_path = sys.argv[1], sys.argv[2]
    runs = []
    for arg in sys.argv[3:]:
        name, label = arg.split("=", 1)
        j = os.path.join(RES, name + ".json")
        if not os.path.exists(j):
            print("skip", name); continue
        summ = json.load(open(j))
        ser = load_series(os.path.join(RES, name + ".csv"))
        runs.append({"name": name, "label": label, "summary": summ, "series": ser})
    real = load_series(os.path.join(ROOT, "model/data/covid19/campinas_2020_2021_2022_cases.csv"))
    paper = load_series(os.path.join(ROOT, "web/public/simulation/results/campinas/v1.csv"))
    verdict = open(verdict_path).read()
    extra = {}
    xp = os.path.join(RES, "extras.json")
    if os.path.exists(xp):
        extra = json.load(open(xp))
    data = {
        "real": {k: real[k] for k in ("dates", "cases", "deaths")},
        "paper": {k: paper[k] for k in ("dates", "cases", "deaths")},
        "runs": [{"label": r["label"], "name": r["name"], "dates": r["series"]["dates"], "cases": r["series"]["cases"],
                  "deaths": r["series"]["deaths"], "infections": r["series"]["infections"],
                  "settings": r["series"]["settings"], "reinf": r["series"]["reinf"], "summary": r["summary"]} for r in runs],
        "extra": extra,
    }
    page = TEMPLATE.replace("/*DATA*/", json.dumps(data, separators=(",", ":"))).replace("<!--VERDICT-->", verdict)
    open(out, "w").write(page)
    print("wrote", out, f"{len(page)/1024:.0f} KB")

TEMPLATE = r"""<title>Pandemica vs. Campinas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,600&family=Space+Grotesk:wght@500&display=swap">
<style>
:root{
  --ground:#f7f8fc; --surface:#ffffff; --ink:#0d1030; --ink-2:#4a4f72; --rule:#dfe2f0;
  --blue:#0019f0; --yellow-mark:#b89a00; --yellow-fill:#f4de02; --grey:#8b90ad; --red:#c2273d; --teal:#0f8a7e;
  --good:#11845b; --bad:#c2273d;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --ground:#0a0b1a; --surface:#12142a; --ink:#eef0ff; --ink-2:#a8acd0; --rule:#262a4a;
  --blue:#6f7dff; --yellow-mark:#f4de02; --yellow-fill:#f4de02; --grey:#7d82a6; --red:#ff6b81; --teal:#3cc7b8;
  --good:#3ecf8e; --bad:#ff6b81;}}
:root[data-theme="dark"]{
  --ground:#0a0b1a; --surface:#12142a; --ink:#eef0ff; --ink-2:#a8acd0; --rule:#262a4a;
  --blue:#6f7dff; --yellow-mark:#f4de02; --yellow-fill:#f4de02; --grey:#7d82a6; --red:#ff6b81; --teal:#3cc7b8;
  --good:#3ecf8e; --bad:#ff6b81;}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font:15px/1.6 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;padding-inline:16px;padding-block:0 64px}
main{max-width:980px;margin:0 auto}
header{padding-block:48px 24px;border-bottom:1px solid var(--rule)}
.kicker{font:500 12px/1 "Space Grotesk",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-2)}
h1{font:italic 600 clamp(34px,6vw,58px)/1.02 Newsreader,Georgia,serif;margin:12px 0 16px;text-wrap:balance;letter-spacing:-.01em}
h1 em{font-style:italic;color:var(--blue)}
h2{font:italic 600 28px/1.15 Newsreader,Georgia,serif;margin:0 0 8px;text-wrap:balance}
h3{font:600 15px/1.3 Inter,system-ui,sans-serif;margin:0 0 4px}
p{max-width:68ch;margin:0 0 12px}
.lede{font-size:18px;color:var(--ink)}
.muted{color:var(--ink-2)}
section{padding-block:36px 8px}
.verdict{display:grid;gap:12px;margin-top:8px}
.verdict p{margin:0}
.scores{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule);border-radius:10px;overflow:hidden;margin:20px 0 0}
.score{background:var(--surface);padding:16px 18px;display:grid;gap:4px}
.score .v{font:500 30px/1.1 "Space Grotesk",ui-monospace,monospace;font-variant-numeric:tabular-nums}
.score .l{font-size:13px;color:var(--ink-2)}
.tablewrap{overflow-x:auto;border:1px solid var(--rule);border-radius:10px;background:var(--surface);margin-top:12px}
table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
th,td{padding:9px 12px;text-align:right;border-bottom:1px solid var(--rule);white-space:nowrap}
th{font:500 11.5px/1.2 "Space Grotesk",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2);background:transparent}
td:first-child,th:first-child{text-align:left}
tr:last-child td{border-bottom:0}
.pos{color:var(--good)}.neg{color:var(--bad)}
.chart{background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:14px 14px 8px;margin-top:12px;position:relative}
.chart svg{display:block;width:100%;height:auto;overflow:visible}
.chart .ax{font:11px "Space Grotesk",ui-monospace,monospace;fill:var(--ink-2)}
.chart .grid{stroke:var(--rule);stroke-width:1}
.legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12.5px;color:var(--ink-2);margin:4px 2px 6px}
.legend span{display:inline-flex;align-items:center;gap:6px}
.legend i{width:16px;height:0;border-top:2.5px solid currentColor;display:inline-block}
.legend i.dash{border-top-style:dashed}
.tip{position:absolute;pointer-events:none;background:var(--surface);border:1px solid var(--rule);border-radius:8px;padding:8px 10px;font-size:12.5px;box-shadow:0 6px 24px rgba(0,0,0,.12);display:none;min-width:190px;font-variant-numeric:tabular-nums}
.tip b{font-weight:600}
.tip .row{display:flex;justify-content:space-between;gap:12px}
.bars{display:grid;gap:8px;margin-top:12px}
.bar{display:grid;grid-template-columns:110px 1fr 64px;gap:10px;align-items:center;font-size:13.5px}
.bar .track{height:12px;background:var(--rule);border-radius:3px;overflow:hidden}
.bar .fill{height:100%;background:var(--blue)}
.bar .num{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink-2)}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
ul.plain{padding-left:18px;margin:0;max-width:68ch}
ul.plain li{margin-bottom:6px}
code{font:13px ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--rule);padding:1px 5px;border-radius:4px}
pre{font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:12px 14px;overflow-x:auto}
.seg{display:inline-flex;border:1px solid var(--rule);border-radius:8px;overflow:hidden;margin-top:10px}
.seg button{font:500 12.5px Inter,system-ui,sans-serif;background:var(--surface);color:var(--ink-2);border:0;padding:6px 12px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--blue);color:#fff}
.seg button:focus-visible{outline:2px solid var(--blue);outline-offset:-2px}
footer{border-top:1px solid var(--rule);margin-top:40px;padding-top:16px;font-size:13px;color:var(--ink-2)}
@media (max-width:520px){.bar{grid-template-columns:84px 1fr 52px}}
</style>
<main>
<header>
  <div class="kicker">Capstone check-in · Campinas, SP · 18 Mar 2020 – 31 Dec 2022</div>
  <h1>Pandemica vs. <em>Campinas</em></h1>
  <p class="lede">We finished the model we described in the paper, rewrote it in Go, and ran it against three years of the real epidemic in Campinas. This page shows what came out.</p>
  <div class="scores" id="scores"></div>
</header>

<section>
  <h2>The verdict</h2>
  <div class="verdict"><!--VERDICT--></div>
</section>

<section>
  <h2>Every run against the bulletin</h2>
  <p class="muted">Accuracy uses the paper's own definition: 100 minus the mean absolute percentage error of the final case and death totals. It reproduces the 58.48% the paper reports for the TypeScript run. The curve score is stricter: it averages the error on every day, not just the last one. Negative means the error is larger than the real value itself.</p>
  <div class="tablewrap"><table id="scoreboard"></table></div>
</section>

<section>
  <h2>Cumulative reported cases</h2>
  <div class="seg" role="group" aria-label="Scale"><button id="lin" aria-pressed="true">Linear</button><button id="log" aria-pressed="false">Log</button></div>
  <div class="chart" id="c-cases"></div>
</section>

<section>
  <h2>Cumulative deaths</h2>
  <p class="muted">Deaths are the fairer yardstick: nearly all of them were counted, while most infections never became a reported case.</p>
  <div class="chart" id="c-deaths"></div>
</section>

<section>
  <h2>Weekly new cases</h2>
  <p class="muted">Real weekly cases against the headline run's reported cases and its true, mostly unreported, infections.</p>
  <div class="chart" id="c-weekly"></div>
</section>

<section class="two">
  <div>
    <h2>Where people got infected</h2>
    <p class="muted">Headline run, share of all infections by the place they happened.</p>
    <div class="bars" id="settings"></div>
  </div>
  <div>
    <h2>How contagious is the model?</h2>
    <p class="muted">R0 of the ancestral strain measured from early growth, for each transmission scale. The literature puts it near 2.5–3.</p>
    <div class="tablewrap"><table id="r0"></table></div>
  </div>
</section>

<section id="cf-sec">
  <h2>What if Campinas had done nothing?</h2>
  <p class="muted">The paper's promise was scenario testing. Same calibrated model, same seed, one lever changed.</p>
  <div class="tablewrap"><table id="cf"></table></div>
</section>

<section>
  <h2>What was built</h2>
  <div class="two">
    <ul class="plain" id="built"></ul>
    <pre>cd engine
go test ./...
go build -o bin/pandemica ./cmd/pandemica
./bin/pandemica run -fit compliance   # headline
./bin/pandemica run -fit cases -detect-sym 1 -detect-asym 1   # paper-faithful
./bin/pandemica r0                    # contagiousness sweep</pre>
  </div>
</section>

<footer>Real data: Campinas epidemiological bulletin (brasil.io) and the vaccination registry in <code>model/data/covid19</code>. Census: IBGE 2010. Branch <code>feat/go-engine</code>.</footer>
</main>

<script>
const D = /*DATA*/;
const $ = (id) => document.getElementById(id);
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const fmt = (v) => v == null || isNaN(v) ? "–" : Math.round(v).toLocaleString("en-US");
const pct = (v) => v == null || v === -1 || isNaN(v) ? "–" : v.toFixed(1) + "%";
const H = D.runs[0];
const N = H ? H.summary.build.population : 1164099;

// scores
if (H) {
  const s = H.summary, t = s.test, f = s.full;
  const ever = s.totals.everInfected, inf = s.totals.infections;
  const tiles = [
    [pct(f.paperAccuracy), "paper-style accuracy, headline run (paper: 58.48%)"],
    [fmt(f.simDeaths), "simulated deaths vs " + fmt(f.realDeaths) + " real"],
    [(inf / N).toFixed(1), "infections per person over three years"],
    [Math.round(s.simSeconds / 60 * 10) / 10 + " min", "to simulate 1,019 days for " + fmt(N) + " people"],
  ];
  $("scores").innerHTML = tiles.map(([v, l]) => `<div class="score"><div class="v">${v}</div><div class="l">${l}</div></div>`).join("");
}

// scoreboard
(() => {
  const cls = (v) => v >= 50 ? "pos" : v < 0 ? "neg" : "";
  let h = "<tr><th>Run</th><th>Cases</th><th>Deaths</th><th>Accuracy (full)</th><th>Accuracy (test 80%)</th><th>Curve score</th></tr>";
  const real = D.real, n = real.cases.length - 1;
  h += `<tr><td>Real bulletin</td><td>${fmt(real.cases[n])}</td><td>${fmt(real.deaths[n])}</td><td>–</td><td>–</td><td>–</td></tr>`;
  const pa = D.paper, pn = pa.cases.length - 1;
  const ape = (a, b) => Math.abs(a - b) / b * 100;
  const pacc = 100 - (ape(pa.cases[pn], real.cases[n]) + ape(pa.deaths[pn], real.deaths[n])) / 2;
  h += `<tr><td>Paper, TypeScript v1 (2023)</td><td>${fmt(pa.cases[pn])}</td><td>${fmt(pa.deaths[pn])}</td><td class="${cls(pacc)}">${pct(pacc)}</td><td>–</td><td>–</td></tr>`;
  for (const r of D.runs) {
    const s = r.summary;
    h += `<tr><td>${r.label}</td><td>${fmt(s.full.simCases)}</td><td>${fmt(s.full.simDeaths)}</td><td class="${cls(s.full.paperAccuracy)}">${pct(s.full.paperAccuracy)}</td><td class="${cls(s.test.paperAccuracy)}">${pct(s.test.paperAccuracy)}</td><td class="${cls(s.full.curveAccuracy)}">${pct(s.full.curveAccuracy)}</td></tr>`;
  }
  $("scoreboard").innerHTML = h;
})();

// line chart
const COLORS = ["--yellow-mark", "--red", "--teal", "--grey"];
function lineChart(el, series, opts = {}) {
  const W = 940, Hh = 330, L = 64, R = 12, T = 12, B = 28;
  const all = series.flatMap(s => s.values.filter(v => v != null));
  const toT = (d) => Date.parse(d + "T00:00:00Z");
  const t0 = Math.min(...series.map(s => toT(s.dates[0]))), t1 = Math.max(...series.map(s => toT(s.dates[s.dates.length - 1])));
  const log = !!opts.log;
  let vmax = Math.max(...all) * 1.04, vmin = log ? 10 : 0;
  const ly = (v) => Math.log10(Math.max(v, vmin));
  const x = (d) => L + (toT(d) - t0) / (t1 - t0) * (W - L - R);
  const y = (v) => log ? T + (1 - (ly(v) - ly(vmin)) / (ly(vmax) - ly(vmin))) * (Hh - T - B) : T + (1 - v / vmax) * (Hh - T - B);
  let g = "";
  const ticks = [];
  if (log) { for (let p = 1; Math.pow(10, p) <= vmax; p++) ticks.push(Math.pow(10, p)); }
  else { const step = niceStep(vmax / 4); for (let v = 0; v <= vmax; v += step) ticks.push(v); }
  for (const v of ticks) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`;
  for (const yr of [2020, 2021, 2022, 2023]) {
    const d = `${yr}-01-01`; const tt = toT(d); if (tt < t0 || tt > t1) continue;
    g += `<line class="grid" x1="${x(d)}" x2="${x(d)}" y1="${T}" y2="${Hh - B}"/><text class="ax" x="${x(d) + 4}" y="${Hh - 8}">${yr}</text>`;
  }
  for (const s of series) {
    let dpath = ""; let pen = false;
    s.dates.forEach((d, i) => { const v = s.values[i]; if (v == null || (log && v <= 0)) { pen = false; return; } dpath += (pen ? "L" : "M") + x(d).toFixed(1) + "," + y(v).toFixed(1); pen = true; });
    g += `<path d="${dpath}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.2}" ${s.dash ? 'stroke-dasharray="6 5"' : ""} stroke-linejoin="round"/>`;
  }
  g += `<line id="${el.id}-x" class="grid" x1="0" x2="0" y1="${T}" y2="${Hh - B}" style="display:none;stroke:var(--ink-2)"/>`;
  el.innerHTML = `<div class="legend">${series.map(s => `<span style="color:${s.color}"><i class="${s.dash ? "dash" : ""}"></i><span style="color:var(--ink-2)">${s.name}</span></span>`).join("")}</div>
  <svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${opts.label || ""}">${g}</svg><div class="tip"></div>`;
  const svg = el.querySelector("svg"), tip = el.querySelector(".tip"), cross = el.querySelector(`#${el.id}-x`);
  const idx = series.map(s => new Map(s.dates.map((d, i) => [d, i])));
  svg.addEventListener("mousemove", (ev) => {
    const r = svg.getBoundingClientRect(); const px = (ev.clientX - r.left) / r.width * W;
    if (px < L || px > W - R) { tip.style.display = "none"; cross.style.display = "none"; return; }
    const tt = t0 + (px - L) / (W - L - R) * (t1 - t0);
    const d = new Date(tt).toISOString().slice(0, 10);
    const rows = series.map((s, k) => { let i = idx[k].get(d); if (i == null) return ""; return `<div class="row"><span style="color:${s.color}">${s.name}</span><b>${fmt(s.values[i])}</b></div>`; }).join("");
    if (!rows) return;
    cross.setAttribute("x1", x(d)); cross.setAttribute("x2", x(d)); cross.style.display = "";
    tip.innerHTML = `<div class="muted" style="margin-bottom:4px">${new Date(tt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}</div>${rows}`;
    tip.style.display = "block";
    const left = (ev.clientX - r.left) + 16; tip.style.left = Math.min(left, r.width - 210) + "px"; tip.style.top = "40px";
  });
  svg.addEventListener("mouseleave", () => { tip.style.display = "none"; cross.style.display = "none"; });
}
function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw))); const m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
function short(v) { return v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + "M" : v >= 1e3 ? (v / 1e3).toFixed(0) + "k" : String(Math.round(v)); }

function casesSeries(key) {
  const s = [{ name: "Real bulletin", dates: D.real.dates, values: D.real[key], color: css("--blue"), width: 3 },
             { name: "Paper, TypeScript v1", dates: D.paper.dates, values: D.paper[key], color: css("--grey"), dash: true }];
  D.runs.forEach((r, k) => s.push({ name: r.label, dates: r.dates, values: r[key], color: css(COLORS[k % COLORS.length]) }));
  return s;
}
let logScale = false;
function drawAll() {
  lineChart($("c-cases"), casesSeries("cases"), { log: logScale, label: "Cumulative reported cases" });
  lineChart($("c-deaths"), casesSeries("deaths"), { label: "Cumulative deaths" });
  if (H) {
    const wk = (dates, cum) => { const d = [], v = []; for (let i = 7; i < cum.length; i += 7) { d.push(dates[i]); v.push(cum[i] - cum[i - 7]); } return { d, v }; };
    const r = wk(D.real.dates, D.real.cases), c = wk(H.dates, H.cases), inf = wk(H.dates, H.infections);
    lineChart($("c-weekly"), [
      { name: "Real weekly cases", dates: r.d, values: r.v, color: css("--blue"), width: 3 },
      { name: H.label + ": reported cases", dates: c.d, values: c.v, color: css(COLORS[0]) },
      { name: H.label + ": all infections", dates: inf.d, values: inf.v, color: css("--grey"), dash: true },
    ], { label: "Weekly new cases" });
  }
}
drawAll();
$("lin").onclick = () => { logScale = false; $("lin").setAttribute("aria-pressed", "true"); $("log").setAttribute("aria-pressed", "false"); drawAll(); };
$("log").onclick = () => { logScale = true; $("log").setAttribute("aria-pressed", "true"); $("lin").setAttribute("aria-pressed", "false"); drawAll(); };
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawAll);
new MutationObserver(drawAll).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

// settings
if (H) {
  const st = H.settings; const tot = Object.values(st).reduce((a, b) => a + b, 0);
  const names = { home: "Home", venue: "Leisure & shops", school: "School", work: "Work", transport: "Transport", imported: "Imported" };
  $("settings").innerHTML = Object.entries(st).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
    `<div class="bar"><span>${names[k] || k}</span><div class="track"><div class="fill" style="width:${(v / tot * 100).toFixed(1)}%"></div></div><span class="num">${(v / tot * 100).toFixed(1)}%</span></div>`).join("");
}
// r0 table
if (D.extra.r0) {
  $("r0").innerHTML = "<tr><th>Scale β</th><th>Doubling</th><th>R0</th></tr>" + D.extra.r0.map(r => `<tr><td>${r.beta.toFixed(3)}${r.note ? " · " + r.note : ""}</td><td>${r.doubling.toFixed(1)} d</td><td>${r.r0.toFixed(2)}</td></tr>`).join("");
}
// counterfactuals
if (D.extra.counterfactuals && D.extra.counterfactuals.length) {
  $("cf").innerHTML = "<tr><th>Scenario</th><th>Infections</th><th>Deaths</th><th>Deaths vs. baseline</th></tr>" + D.extra.counterfactuals.map(c =>
    `<tr><td>${c.label}</td><td>${fmt(c.infections)}</td><td>${fmt(c.deaths)}</td><td>${c.delta}</td></tr>`).join("");
} else { $("cf-sec").style.display = "none"; }
// built
if (H) {
  const b = H.summary.build;
  $("built").innerHTML = [
    `${fmt(b.population)} agents in ${fmt(b.houses)} houses, ${fmt(b.workSites)} workplaces and ${fmt(b.schools)} schools, from IBGE 2010.`,
    `${fmt(b.routineActivities)} weekly activities; a 10-20-10 network trained by backpropagation picks everyone's leisure.`,
    `${fmt(b.indexEntries)} weekly presences indexed, so contacts are exact to the minute.`,
    `City built in ${b.buildSeconds.toFixed(1)} s with a ${Math.round(b.heapMB)} MB heap; the whole 2020–2022 run takes about ${Math.round(H.summary.simSeconds / 60)} minutes on an M4 MacBook.`,
    `Real vaccination registry replayed dose by dose; five variants seeded on their arrival dates.`,
  ].map(t => `<li>${t}</li>`).join("");
}
</script>
"""

if __name__ == "__main__":
    main()
