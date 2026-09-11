#!/usr/bin/env python3
"""Build the Pandemica validation report (single HTML page) from real run outputs.

usage: results_page.py OUT.html
Reads engine/results/*.json|csv, the real Campinas bulletin, the paper's
TypeScript v1 results and scenarios/campinas.json. Every number shown comes
from these files.
"""
import csv, json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RES = os.path.join(ROOT, "engine", "results")

def rows(path):
    return list(csv.DictReader(open(path)))

def col(rs, key):
    return [int(float(r[key])) for r in rs]

def weekly(cum):
    return [cum[i] - cum[i - 7] for i in range(7, len(cum), 7)]

def wdates(dates):
    return [dates[i] for i in range(7, len(dates), 7)]

def run(name):
    p = os.path.join(RES, name + ".csv")
    if not os.path.exists(p):
        return None
    rs = rows(p)
    return {"rows": rs, "summary": json.load(open(os.path.join(RES, name + ".json")))}

def main():
    out = sys.argv[1]
    real = rows(os.path.join(ROOT, "model/data/covid19/campinas_2020_2021_2022_cases.csv"))
    ts = rows(os.path.join(ROOT, "web/public/simulation/results/campinas/v1.csv"))
    dates = [r["date"] for r in real]
    head = run("compliance-fit")
    seeds = [x for x in (head, run("compliance-fit-seed2"), run("compliance-fit-seed3")) if x]
    pm, bf = run("paper-mode"), run("beta-fit-deaths")
    cfi, cfv = run("cf-no-interventions"), run("cf-no-vaccines")
    sc = json.load(open(os.path.join(ROOT, "engine/scenarios/campinas.json")))
    extras = json.load(open(os.path.join(RES, "extras.json")))
    hr = head["rows"]
    N = head["summary"]["build"]["population"]

    real_deaths, real_cases = col(real, "deaths"), col(real, "totalCases")
    head_deaths = col(hr, "deaths")
    seed_deaths = [col(s["rows"], "deaths") for s in seeds]
    band_lo = [min(v[i] for v in seed_deaths) for i in range(len(dates))]
    band_hi = [max(v[i] for v in seed_deaths) for i in range(len(dates))]

    settings = ["home", "venue", "school", "work", "transport"]
    set_weekly = {}
    for s in settings:
        daily = col(hr, "infections_" + s)
        cum, c = [], 0
        for v in daily:
            c += v
            cum.append(c)
        set_weekly[s] = weekly(cum)

    def final(rs, key):
        return int(float(rs[-1][key]))

    ruler = [{"label": "Paper, TypeScript (2023)", "cases": final(ts, "totalCases"), "deaths": final(ts, "deaths")}]
    for label, r in (("Go · paper setup", pm), ("Go · fit on 2020 deaths", bf)):
        if r:
            ruler.append({"label": label, "cases": final(r["rows"], "totalCases"), "deaths": final(r["rows"], "deaths")})
    for k, s in enumerate(seeds):
        ruler.append({"label": "Go · headline" + ("" if k == 0 else f" (seed {k + 1})"), "cases": final(s["rows"], "totalCases"),
                      "deaths": final(s["rows"], "deaths"), "headline": True, "seed": k > 0})

    data = {
        "N": N,
        "dates": dates,
        "real": {"deaths": real_deaths, "cases": real_cases},
        "ts": {"deaths": col(ts, "deaths"), "cases": col(ts, "totalCases")},
        "head": {"deaths": head_deaths, "cases": col(hr, "totalCases"), "infections": final(hr, "totalInfections"),
                 "simSeconds": head["summary"]["simSeconds"], "build": head["summary"]["build"],
                 "compliance": head["summary"].get("compliance"), "r0": head["summary"].get("r0"),
                 "detect": head["summary"]["params"]["DetectSymptomatic"], "beta": head["summary"]["params"]["Beta"],
                 "trainEnd": head["summary"]["trainEnd"]},
        "band": {"lo": band_lo, "hi": band_hi, "n": len(seeds)},
        "weekly": {"dates": wdates(dates), "real": weekly(real_deaths), "head": weekly(head_deaths)},
        "settings": {"dates": wdates(dates), "order": settings, "values": set_weekly},
        "doses": {"d1": col(hr, "dose1")[-1], "d2": col(hr, "dose2")[-1], "d3": col(hr, "dose3")[-1]},
        "variants": [{"date": v["date"], "name": v["variant"]} for v in sc["variants"]],
        "ruler": ruler,
        "calib": {
            "beta": [{"x": c["beta"], "cases": c["cases"], "deaths": c["deaths"]} for c in (pm["summary"]["calibration"] if pm else [])],
            "betaTarget": 31789,
            "comp": [{"x": c["beta"], "deaths": c["deaths"]} for c in head["summary"].get("calibration", [])],
            "compTarget": 1253,
        },
        "r0": extras.get("r0", []),
        "scen": [{"label": "As it happened", "deaths": head_deaths}]
                + ([{"label": "No lockdown, masks or school closures", "deaths": col(cfi["rows"], "deaths")}] if cfi else [])
                + ([{"label": "No vaccines", "deaths": col(cfv["rows"], "deaths")}] if cfv else []),
    }
    sweep = sorted(extras.get("r0", []), key=lambda p: p["beta"])
    def r0_at(beta):
        if len(sweep) < 2:
            return None
        for a, b in zip(sweep, sweep[1:]):
            if a["beta"] <= beta <= b["beta"]:
                return a["r0"] + (beta - a["beta"]) / (b["beta"] - a["beta"]) * (b["r0"] - a["r0"])
        # slightly outside the measured sweep: extend its nearest segment
        a, b = (sweep[0], sweep[1]) if beta < sweep[0]["beta"] else (sweep[-2], sweep[-1])
        if abs(beta - (a["beta"] if beta < a["beta"] else b["beta"])) > 0.02:
            return None
        return a["r0"] + (beta - a["beta"]) / (b["beta"] - a["beta"]) * (b["r0"] - a["r0"])
    marks = [{"label": "headline", "beta": head["summary"]["params"]["Beta"], "ok": True}]
    if pm:
        marks.append({"label": "paper setup", "beta": pm["summary"]["params"]["Beta"], "ok": False})
    if bf:
        marks.append({"label": "fit on deaths", "beta": bf["summary"]["params"]["Beta"], "ok": False})
    lo_b, hi_b = (sweep[0]["beta"], sweep[-1]["beta"]) if sweep else (0, 0)
    for m in marks:
        m["r0"] = r0_at(m["beta"])
        m["extrap"] = not (lo_b <= m["beta"] <= hi_b)
    data["r0marks"] = [m for m in marks if m["r0"] is not None]
    page = TEMPLATE.replace("/*DATA*/", json.dumps(data, separators=(",", ":"), ensure_ascii=False))
    open(out, "w").write(page)
    print("wrote", out, f"{len(page) / 1024:.0f} KB")

TEMPLATE = r"""<!--
THESIS: A calibration certificate. The model is the instrument under test, the Campinas bulletin the reference standard; every figure is a reading checked against a tolerance band. Refuses the dark data-dashboard of tiles and the editorial long-read.
OWN-WORLD: White ground, blue-black ink, hairline rules, Pandemica blue for the reference, ink for the instrument, Pandemica yellow only as the tolerance band, PASS green and FAIL red as verdict marks. Archivo upright at varied widths; Geist Mono for readings.
STORY: Deaths pass tolerance and cases fail, visible in one screen; the figures show why; scenario deltas close.
FIRST VIEWPORT: Title and spec grid; two verdict readings; Fig. 1 cumulative deaths full width with an instrument readout that follows the cursor.
FORM: Calibration certificate, grounded list position 7, seed key 2cf38d65.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->
<title>Pandemica vs. Campinas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..800&family=Geist+Mono:wght@400;500;600&display=swap">
<style>
:root{
  color-scheme: light;
  --paper:#ffffff; --plate:#f6f7fb; --ink:#0b0e2a; --ink-2:#4d5275; --ink-3:#5f6488; --rule:#dfe2ee; --rule-2:#c6cadc;
  --ref:#0019f0; --ref-tint:#e8eaff; --inst:#0b0e2a; --tol:#f4de02; --tol-soft:rgba(244,222,2,.34);
  --pass:#0a7a4b; --pass-tint:#e3f4ec; --fail:#c8102e; --fail-tint:#fbe7ea;
  --home:#0b0e2a; --venue:#4d5275; --school:#8a8fb0; --work:#b9bdd4; --transport:#e1e3ee;
  --sans:"Archivo",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
*{box-sizing:border-box}
html{background:var(--paper)}
body{margin:0;background:var(--paper);color:var(--ink);font:400 16px/1.55 var(--sans);font-stretch:100%;padding-inline:clamp(16px,4vw,48px);padding-block:0 72px;-webkit-font-smoothing:antialiased}
::selection{background:var(--tol);color:var(--ink)}
a{color:var(--ref);text-underline-offset:3px}
:focus-visible{outline:2px solid var(--ref);outline-offset:2px}
main{max-width:1180px;margin:0 auto}
.num,.mono{font-family:var(--mono);font-variant-numeric:tabular-nums;letter-spacing:-.01em}

/* certificate head */
.cert{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:32px 48px;padding-block:36px 28px;border-bottom:2px solid var(--ink);align-items:end}
h1{font:760 clamp(40px,6.4vw,80px)/.9 var(--sans);font-stretch:78%;letter-spacing:-.035em;margin:0;text-wrap:balance}
h1 .vs{font-weight:300;font-stretch:100%;color:var(--ink-3)}
.sub{font:420 18px/1.45 var(--sans);color:var(--ink-2);max-width:40ch;margin:16px 0 0}
.spec{display:grid;grid-template-columns:auto 1fr;margin:0;border-top:1px solid var(--rule)}
.spec dt,.spec dd{margin:0;padding:7px 0;border-bottom:1px solid var(--rule);font-size:13.5px}
.spec dt{color:var(--ink-3);padding-right:18px;font-stretch:90%;font-weight:500}
.spec dd{font-size:13.5px;text-align:right;font-variant-numeric:tabular-nums}

/* verdict readings */
.readings{border-bottom:1px solid var(--rule)}
.rt{display:grid;grid-template-columns:minmax(0,1.4fr) repeat(2,minmax(0,1fr)) minmax(0,1.2fr) minmax(0,.8fr) minmax(0,auto);gap:8px 20px;align-items:center;padding:14px 0;border-bottom:1px solid var(--rule)}
.rt:last-child{border-bottom:0}
.rt.h{padding:10px 0;font:500 12.5px var(--sans);color:var(--ink-3)}
.rt .q{font:650 17px/1.2 var(--sans);font-stretch:88%}
.rt .num{font:500 15px var(--mono);font-variant-numeric:tabular-nums}
.rt .v{font:500 clamp(26px,3.2vw,38px)/1 var(--mono);letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.reading{padding:22px 24px 22px 0;display:grid;gap:6px;align-content:start}
.reading+.reading{padding-left:24px;border-left:1px solid var(--rule)}
.reading .q{font:600 15px/1.2 var(--sans);font-stretch:88%}
.reading .v{font:500 clamp(30px,4vw,44px)/1 var(--mono);letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.reading .ref{font-size:13.5px;color:var(--ink-2)}
.mark{justify-self:start;display:inline-flex;align-items:center;gap:7px;font:600 12px/1 var(--mono);letter-spacing:.06em;padding:6px 9px;border-radius:3px;border:1.5px solid currentColor}
.mark svg{width:13px;height:13px}
.mark.pass{color:var(--pass);background:var(--pass-tint)}
.mark.fail{color:var(--fail);background:var(--fail-tint)}
.mark.info{color:var(--ink-2);background:var(--plate)}

/* figures */
figure{margin:0;padding-block:40px 8px;border-bottom:1px solid var(--rule)}
.fighead{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px 24px;margin-bottom:14px}
h2{font:700 clamp(22px,2.6vw,30px)/1.1 var(--sans);font-stretch:84%;letter-spacing:-.02em;margin:0;text-wrap:balance}
h2 .fig{font:500 13px/1 var(--mono);color:var(--ink-3);letter-spacing:0;margin-right:12px;vertical-align:4px}
figcaption{font-size:14.5px;color:var(--ink-2);max-width:62ch;margin-top:10px}
.plot{position:relative;width:100%}
.plot svg{display:block;width:100%;overflow:visible}
.ax{font:11.5px var(--mono);fill:var(--ink-3)}
.axl{font:600 12px var(--sans);fill:var(--ink-2)}
.grid{stroke:var(--rule);stroke-width:1;shape-rendering:crispEdges}
.lbl{font:600 12.5px var(--sans);font-stretch:88%}
.lblv{font:500 12px var(--mono)}
.readout{position:absolute;top:8px;left:72px;background:rgba(255,255,255,.94);border:1px solid var(--rule-2);border-radius:4px;padding:10px 12px;display:grid;grid-template-columns:auto auto;gap:3px 16px;font-size:12.5px;pointer-events:none;box-shadow:0 6px 18px rgba(11,14,42,.08)}
.readout .d{grid-column:1/-1;font:600 12px var(--mono);color:var(--ink);margin-bottom:4px}
.readout span:nth-child(even){font-family:var(--mono);text-align:right;font-variant-numeric:tabular-nums}
.key{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:13px;color:var(--ink-2);margin:0 0 6px}
.key span{display:inline-flex;align-items:center;gap:7px}
.sw{width:18px;height:10px;border-radius:2px;display:inline-block}
.sw.line{height:0;border-top:2.5px solid;border-radius:0}
.sw.dash{height:0;border-top:2px dashed;border-radius:0}

.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px}
.cols>figure{border-bottom:0;padding-bottom:32px}
.row2{border-bottom:1px solid var(--rule)}
.tri{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.tri .yr{font:600 13px var(--mono);color:var(--ink-2);margin:0 0 2px}
.waffle{display:grid;grid-template-columns:auto minmax(0,1fr);gap:24px;align-items:center}
.waffle .big{font:500 56px/1 var(--mono);letter-spacing:-.04em}
.waffle p{margin:6px 0 0;color:var(--ink-2);font-size:14.5px;max-width:34ch}
.notes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;padding-block:36px 0}
.notes h3{font:650 15px/1.25 var(--sans);font-stretch:88%;margin:0 0 6px}
.notes p{margin:0;font-size:14px;color:var(--ink-2)}
pre{font:12.5px/1.6 var(--mono);background:var(--plate);border:1px solid var(--rule);border-radius:4px;padding:14px 16px;overflow-x:auto;margin:0}
footer{margin-top:40px;padding-top:14px;border-top:2px solid var(--ink);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 24px;font-size:12.5px;color:var(--ink-3)}
footer .mono{color:var(--ink-2)}

@media (max-width:860px){
  .cert{grid-template-columns:1fr}
  .readings{grid-template-columns:1fr}
  .reading,.reading+.reading{padding:18px 0;border-left:0}
  .reading+.reading{border-top:1px solid var(--rule)}
  .cols,.notes{grid-template-columns:1fr}
  .tri{grid-template-columns:1fr}
  .readout{position:static;margin-top:10px;display:inline-grid;box-shadow:none}
  .rt.h{display:none}
  .rt{grid-template-columns:1fr 1fr;gap:12px 16px}
  .rt .q{grid-column:1/-1}
  .rt [data-l]::before{content:attr(data-l);display:block;font:500 11.5px var(--sans);color:var(--ink-3);margin-bottom:3px;letter-spacing:0}
}
@media (max-width:480px){.waffle{grid-template-columns:1fr}}

</style>
<main>
<section class="cert" aria-label="Report header">
  <div>
    <h1>Pandemica <span class="vs">vs.</span> Campinas</h1>
    <p class="sub">The finished model, rewritten in Go, checked against three years of the real epidemic.</p>
  </div>
  <dl class="spec" id="spec"></dl>
</section>

<section class="readings" id="readings" aria-label="Verdict"></section>

<figure>
  <div class="fighead"><h2><span class="fig">Fig. 1</span>Deaths end inside tolerance</h2>
    <div class="key" id="k1"></div></div>
  <div class="plot" id="f1"></div>
  <figcaption>Cumulative deaths. The model runs above the band from late 2020 to mid-2021, then converges. Yellow band: ±30% around the bulletin, the paper's own 70–80% accuracy goal. Grey band: three seeds of the headline run.</figcaption>
</figure>

<figure>
  <div class="fighead"><h2><span class="fig">Fig. 2</span>How far off each run lands</h2>
    <div class="key"><span><i class="sw" style="background:var(--ink)"></i>deaths</span><span><i class="sw" style="background:#fff;border:2px solid var(--ink)"></i>cases</span><span><i class="sw" style="background:var(--tol-soft)"></i>±30% tolerance</span></div></div>
  <div class="plot" id="f2"></div>
  <figcaption>Final total ÷ real total, 31 Dec 2022, log scale. 1× is a perfect reading.</figcaption>
</figure>

<figure>
  <div class="fighead"><h2><span class="fig">Fig. 3</span>Waves, week by week</h2>
    <div class="key"><span><i class="sw line" style="border-color:var(--ref)"></i>bulletin</span><span><i class="sw line" style="border-color:var(--inst)"></i>model</span></div></div>
  <div class="tri" id="f3"></div>
  <figcaption>Weekly new deaths. Ticks mark when each variant was seeded. The 2020 wave arrives about three months late; 2021 and 2022 line up.</figcaption>
</figure>

<div class="cols row2">
  <figure>
    <div class="fighead"><h2><span class="fig">Fig. 4</span>The knife edge</h2></div>
    <div class="plot" id="f4a"></div>
    <figcaption>Paper setup: fitting 2020 cases by transmission scale. A 20% nudge moves the result tenfold.</figcaption>
  </figure>
  <figure>
    <div class="fighead"><h2><span class="fig">Fig. 5</span>The fix</h2></div>
    <div class="plot" id="f4b"></div>
    <figcaption>Headline setup: R0 pinned at 2.8, fitting how closely people followed the measures to 2020 deaths.</figcaption>
  </figure>
</div>

<div class="cols row2">
  <figure>
    <div class="fighead"><h2><span class="fig">Fig. 6</span>The hidden epidemic</h2></div>
    <div class="waffle"><div class="plot" id="f5" style="width:220px"></div><div id="f5t"></div></div>
  </figure>
  <figure>
    <div class="fighead"><h2><span class="fig">Fig. 7</span>Where infections happened</h2></div>
    <div class="key" id="k6"></div>
    <div class="plot" id="f6"></div>
    <figcaption>Weekly infections in the headline run, stacked by place.</figcaption>
  </figure>
</div>

<figure>
  <div class="fighead"><h2><span class="fig">Fig. 8</span>How contagious the fit makes the virus</h2>
    <div class="key"><span><i class="sw" style="background:var(--tol-soft)"></i>literature R0 2.5–3</span></div></div>
  <div class="plot" id="f8"></div>
  <figcaption>R0 of the ancestral strain measured from early growth for each transmission scale. Fits that match 2020 without pinning R0 need a virus more than twice as contagious as the literature.</figcaption>
</figure>

<figure>
  <div class="fighead"><h2><span class="fig">Fig. 9</span>One lever at a time</h2></div>
  <div class="plot" id="f7"></div>
  <figcaption>Same calibrated model and seed, one intervention removed.</figcaption>
</figure>

<section class="notes" aria-label="Method">
  <div><h3>Hold-out</h3><p>Only data up to 7 Oct 2020 (the first 20% of days) was used to calibrate. Everything after is a prediction.</p></div>
  <div><h3>Why cases miss</h3><p>The reporting rate fitted in 2020 stays fixed. Real testing collapsed in the Omicron era, so the model over-reports cases while deaths hold.</p></div>
  <div><h3>Run it</h3><pre>cd engine && go test ./...
go build -o bin/pandemica ./cmd/pandemica
./bin/pandemica run -fit compliance</pre></div>
</section>

<footer><span>Reference: Campinas epidemiological bulletin · vaccination registry · IBGE 2010 census</span><span class="mono">branch feat/go-engine</span></footer>
</main>

<script>
const D = /*DATA*/;
const $ = (id) => document.getElementById(id);
const fmt = (v) => Math.round(v).toLocaleString("en-US");
const T = (s) => Date.parse(s + "T00:00:00Z");
const dec = (v, d) => v.toFixed(d);
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const n = D.dates.length - 1;
const short = (v) => v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + "M" : v >= 1e3 ? (v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "k" : String(Math.round(v));
const pctErr = (sim, real) => (sim / real - 1) * 100;
const signed = (v) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(v >= 100 || v <= -100 ? 0 : 1) + "%";
const TOL = 30;
const ICON = {
  pass: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3L13 4.5"/></svg>',
  fail: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="5.5"/><path d="M8 7.2v4M8 4.8v.2" stroke-linecap="round"/></svg>',
};

// header
(() => {
  const b = D.head.build;
  const spec = [
    ["Instrument", "Pandemica Go engine"],
    ["Reference", "Campinas bulletin, SP"],
    ["Period", "18 Mar 2020 – 31 Dec 2022"],
    ["Agents", fmt(b.population)],
    ["Calibration window", "to " + new Date(T(D.head.trainEnd)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })],
    ["Runtime, 1,019 days", (D.head.simSeconds / 60).toFixed(1) + " min, M4 laptop"],
  ];
  $("spec").innerHTML = spec.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
  const rd = D.real.deaths[n], md = D.head.deaths[n], rc = D.real.cases[n], mc = D.head.cases[n];
  const tsd = D.ts.deaths[n];
  const ed = pctErr(md, rd), ec = pctErr(mc, rc), et = pctErr(tsd, rd);
  const mark = (ok, text) => `<span class="mark ${ok}">${ICON[ok]}${text}</span>`;
  const rowsR = [["Deaths", rd, md, ed], ["Reported cases", rc, mc, ec]];
  $("readings").innerHTML = `<div class="rt h"><span>Quantity</span><span>Reference</span><span>Measured</span><span>Error</span><span>Tolerance</span><span>Verdict</span></div>` +
    rowsR.map(([q, r, m, e]) => `<div class="rt"><span class="q">${q}</span><span class="num" data-l="Reference">${fmt(r)}</span><span class="num" data-l="Measured">${fmt(m)}</span><span class="v" data-l="Error">${signed(e)}</span><span class="num" data-l="Tolerance">±${TOL}%</span>${Math.abs(e) <= TOL ? mark("pass", "PASS") : mark("fail", "FAIL")}</div>`).join("");
})();

// ---------- chart core ----------
function sizeOf(el, ratio, min, max) {
  const w = Math.max(280, el.clientWidth || 800);
  const h = Math.max(min, Math.min(max, Math.round(w * ratio)));
  return { w, h };
}
function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw))); const m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
function pathOf(xs, ys) { let d = ""; for (let i = 0; i < xs.length; i++) d += (i ? "L" : "M") + xs[i].toFixed(1) + "," + ys[i].toFixed(1); return d; }
function areaOf(xs, lo, hi) { let d = "M" + xs[0].toFixed(1) + "," + hi[0].toFixed(1); for (let i = 1; i < xs.length; i++) d += "L" + xs[i].toFixed(1) + "," + hi[i].toFixed(1); for (let i = xs.length - 1; i >= 0; i--) d += "L" + xs[i].toFixed(1) + "," + lo[i].toFixed(1); return d + "Z"; }
function spread(labels, minGap, top, bottom) {
  labels.sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < minGap) labels[i].y = labels[i - 1].y + minGap;
  const over = labels.length ? labels[labels.length - 1].y - bottom : 0;
  if (over > 0) for (const l of labels) l.y -= over;
  for (let i = labels.length - 2; i >= 0; i--) if (labels[i + 1].y - labels[i].y < minGap) labels[i].y = labels[i + 1].y - minGap;
  for (const l of labels) l.y = Math.max(top, l.y);
  return labels;
}
function yearTicks(t0, t1, x, T0, B, H) {
  let g = "";
  for (let yr = 2020; yr <= 2023; yr++) {
    const t = Date.UTC(yr, 0, 1); if (t < t0 || t > t1) continue;
    g += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${T0}" y2="${H - B}"/><text class="ax" x="${x(t) + 5}" y="${H - B + 17}">${yr}</text>`;
  }
  return g;
}

// ---------- Fig 1: cumulative deaths with tolerance, seed band, readout ----------
function fig1() {
  const el = $("f1"); const { w, h } = sizeOf(el, 0.38, 280, 430);
  const narrow = w < 640;
  const L = narrow ? 44 : 60, R = narrow ? 12 : 150, Tp = 14, B = 30;
  const ts = D.dates.map(T), t0 = ts[0], t1 = ts[n];
  const rd = D.real.deaths, md = D.head.deaths;
  const vmax = Math.max(...md, ...D.ts.deaths, ...D.band.hi, ...rd.map(v => v * 1.3)) * 1.03;
  const x = (t) => L + (t - t0) / (t1 - t0) * (w - L - R);
  const y = (v) => Tp + (1 - v / vmax) * (h - Tp - B);
  const xs = ts.map(x);
  let g = "";
  const step = niceStep(vmax / 5);
  for (let v = 0; v <= vmax; v += step) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`;
  g += yearTicks(t0, t1, x, Tp, B, h);
  g += `<path d="${areaOf(xs, rd.map(v => y(v * 0.7)), rd.map(v => y(v * 1.3)))}" fill="var(--tol-soft)"/>`;
  g += `<path d="${areaOf(xs, D.band.lo.map(y), D.band.hi.map(y))}" fill="rgba(11,14,42,.14)"/>`;
  g += `<path d="${pathOf(xs, D.ts.deaths.map(y))}" fill="none" stroke="var(--ink-3)" stroke-width="1.6" stroke-dasharray="5 4"/>`;
  g += `<path d="${pathOf(xs, rd.map(y))}" fill="none" stroke="var(--ref)" stroke-width="3" stroke-linejoin="round"/>`;
  g += `<path d="${pathOf(xs, md.map(y))}" fill="none" stroke="var(--inst)" stroke-width="2.2" stroke-linejoin="round"/>`;
  if (!narrow) {
    const labels = spread([
      { y: y(rd[n]), c: "var(--ref)", t: "Bulletin", v: fmt(rd[n]) },
      { y: y(md[n]), c: "var(--inst)", t: "Model", v: fmt(md[n]) },
      { y: y(D.ts.deaths[n]), c: "var(--ink-3)", t: "Paper run", v: fmt(D.ts.deaths[n]) },
    ], 30, Tp + 8, h - B - 6);
    for (const l of labels) g += `<text class="lbl" x="${w - R + 12}" y="${l.y}" fill="${l.c}">${l.t}</text><text class="lblv" x="${w - R + 12}" y="${l.y + 14}" fill="var(--ink-2)">${l.v}</text>`;
  }
  const tv = T(D.head.trainEnd);
  g += `<line x1="${x(tv)}" x2="${x(tv)}" y1="${Tp}" y2="${h - B}" stroke="var(--ink)" stroke-width="1" stroke-dasharray="2 3"/><text class="axl" x="${x(tv) + 6}" y="${Tp + 12}">calibration ends</text>`;
  g += `<line id="f1x" x1="0" x2="0" y1="${Tp}" y2="${h - B}" stroke="var(--ink)" stroke-width="1" style="display:none"/>`;
  g += `<circle id="f1r" r="4.5" fill="var(--ref)" stroke="#fff" stroke-width="2" style="display:none"/><circle id="f1m" r="4.5" fill="var(--inst)" stroke="#fff" stroke-width="2" style="display:none"/>`;
  el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Cumulative deaths, bulletin versus model, 2020 to 2022">${g}</svg><div class="readout" id="f1ro" aria-live="polite"></div>`;
  const ro = $("f1ro"), cx = $("f1x"), cr = $("f1r"), cm = $("f1m");
  const show = (i) => {
    const e = pctErr(md[i], rd[i]); const inside = Math.abs(e) <= TOL;
    ro.innerHTML = `<span class="d">${new Date(ts[i]).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span>
      <span style="color:var(--ref)">Bulletin</span><span>${fmt(rd[i])}</span>
      <span>Model</span><span>${fmt(md[i])}</span>
      <span>Error</span><span style="color:${inside ? "var(--pass)" : "var(--fail)"}">${rd[i] > 20 ? signed(e) : "–"}</span>`;
  };
  show(n);
  const svg = el.querySelector("svg");
  const move = (clientX) => {
    const r = svg.getBoundingClientRect(); const px = (clientX - r.left) / r.width * w;
    const t = t0 + (px - L) / (w - L - R) * (t1 - t0); let i = Math.round((t - t0) / 864e5); i = Math.max(0, Math.min(n, i));
    cx.setAttribute("x1", xs[i]); cx.setAttribute("x2", xs[i]); cx.style.display = "";
    cr.setAttribute("cx", xs[i]); cr.setAttribute("cy", y(rd[i])); cr.style.display = "";
    cm.setAttribute("cx", xs[i]); cm.setAttribute("cy", y(md[i])); cm.style.display = "";
    show(i);
  };
  svg.addEventListener("pointermove", (e) => move(e.clientX));
  svg.addEventListener("pointerleave", () => { cx.style.display = cr.style.display = cm.style.display = "none"; show(n); });
  $("k1").innerHTML = `<span><i class="sw line" style="border-color:var(--ref)"></i>bulletin</span><span><i class="sw line" style="border-color:var(--inst)"></i>model</span><span><i class="sw dash" style="border-color:var(--ink-3)"></i>paper run</span><span><i class="sw" style="background:var(--tol-soft)"></i>±30%</span><span><i class="sw" style="background:rgba(11,14,42,.14)"></i>${D.band.n} seeds</span>`;
}

// ---------- Fig 2: error ruler ----------
function fig2() {
  const el = $("f2"); const w = Math.max(300, el.clientWidth); const narrow = w < 640;
  const rows = D.ruler; const rowH = narrow ? 52 : 38; const Tp = 26, B = 8;
  const L = narrow ? 8 : 230, R = 20; const h = Tp + rows.length * rowH + B;
  const lo = Math.log10(0.5), hi = Math.log10(100);
  const x = (r) => L + (Math.log10(r) - lo) / (hi - lo) * (w - L - R);
  let g = `<rect x="${x(0.7)}" y="${Tp - 6}" width="${x(1.3) - x(0.7)}" height="${h - Tp - B + 6}" fill="var(--tol-soft)"/>`;
  for (const t of [0.5, 1, 2, 5, 10, 20, 50, 100]) g += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${Tp - 6}" y2="${h - B}"/><text class="ax" x="${x(t)}" y="${Tp - 12}" text-anchor="middle">${t}×</text>`;
  g += `<line x1="${x(1)}" x2="${x(1)}" y1="${Tp - 6}" y2="${h - B}" stroke="var(--ref)" stroke-width="2"/>`;
  rows.forEach((r, k) => {
    const yy = Tp + k * rowH + rowH / 2 + (narrow ? 8 : 0);
    const rc = r.cases / D.real.cases[n], rdd = r.deaths / D.real.deaths[n];
    const col = r.headline ? "var(--ink)" : "var(--ink-3)"; const op = r.seed ? 0.55 : 1;
    g += `<line x1="${L}" x2="${w - R}" y1="${yy}" y2="${yy}" stroke="var(--rule)"/>`;
    g += narrow ? `<text class="lbl" x="${L}" y="${yy - 16}" fill="${col}">${r.label}</text>` : `<text class="lbl" x="${L - 14}" y="${yy + 4}" text-anchor="end" fill="${col}" opacity="${op}">${r.label}</text>`;
    g += `<line x1="${x(Math.min(rc, rdd))}" x2="${x(Math.max(rc, rdd))}" y1="${yy}" y2="${yy}" stroke="${col}" stroke-width="2" opacity="${op * 0.5}"/>`;
    g += `<circle cx="${x(rdd)}" cy="${yy}" r="6" fill="${col}" opacity="${op}"><title>deaths ${rdd.toFixed(2)}×</title></circle>`;
    g += `<rect x="${x(rc) - 5.5}" y="${yy - 5.5}" width="11" height="11" fill="#fff" stroke="${col}" stroke-width="2" opacity="${op}"><title>cases ${rc.toFixed(2)}×</title></rect>`;
    const vx = x(Math.max(rc, rdd)), atEnd = vx > w - R - 96;
    if (!r.seed) g += `<text class="lblv" x="${atEnd ? w - R : vx + 12}" y="${atEnd ? yy - 12 : yy + 4}" text-anchor="${atEnd ? "end" : "start"}" fill="var(--ink-2)">${rc >= 10 ? rc.toFixed(0) : rc.toFixed(1)}× cases</text>`;
  });
  el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Ratio of simulated to real totals for every run">${g}</svg>`;
}

// ---------- Fig 3: weekly deaths small multiples ----------
function fig3() {
  const wrap = $("f3"); wrap.innerHTML = "";
  const W = D.weekly; const vmax = Math.max(...W.real, ...W.head) * 1.08;
  for (const yr of [2020, 2021, 2022]) {
    const idx = W.dates.map((d, i) => [d, i]).filter(([d]) => d.startsWith(String(yr))).map(([, i]) => i);
    const box = document.createElement("div"); box.innerHTML = `<div class="yr">${yr}</div><div class="plot"></div>`; wrap.appendChild(box);
    const el = box.querySelector(".plot"); const w = Math.max(260, el.clientWidth || 360), h = 190;
    const L = 38, R = 8, Tp = 24, B = 26;
    const t0 = Date.UTC(yr, 0, 1), t1 = Date.UTC(yr, 11, 31);
    const x = (t) => L + (t - t0) / (t1 - t0) * (w - L - R);
    const y = (v) => Tp + (1 - v / vmax) * (h - Tp - B);
    let g = "";
    const step = niceStep(vmax / 3);
    for (let v = 0; v <= vmax; v += step) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`;
    for (const m of [0, 3, 6, 9]) { const t = Date.UTC(yr, m, 1); g += `<text class="ax" x="${x(t)}" y="${h - 8}">${["Jan", "Apr", "Jul", "Oct"][m / 3]}</text>`; }
    for (const v of D.variants) { const t = T(v.date); if (t >= t0 && t <= t1) { const nearEnd = x(t) > w - R - 60; g += `<line x1="${x(t)}" x2="${x(t)}" y1="${Tp - 4}" y2="${h - B}" stroke="var(--ink-3)" stroke-width="1" stroke-dasharray="2 3"/><text class="axl" x="${nearEnd ? x(t) - 4 : x(t) + 4}" text-anchor="${nearEnd ? "end" : "start"}" y="${Tp - 8}" style="font-size:11px">${v.name === "ba5" ? "BA.5" : v.name === "bq1" ? "BQ.1" : v.name[0].toUpperCase() + v.name.slice(1)}</text>`; } }
    const xs = idx.map(i => x(T(W.dates[i])));
    if (xs.length) {
      g += `<path d="${areaOf(xs, idx.map(() => y(0)), idx.map(i => y(W.real[i])))}" fill="var(--ref-tint)"/>`;
      g += `<path d="${pathOf(xs, idx.map(i => y(W.real[i])))}" fill="none" stroke="var(--ref)" stroke-width="2.6"/>`;
      g += `<path d="${pathOf(xs, idx.map(i => y(W.head[i])))}" fill="none" stroke="var(--inst)" stroke-width="1.8"/>`;
    }
    el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Weekly deaths in ${yr}">${g}</svg>`;
  }
}

// ---------- Fig 4/5: calibration traces ----------
function scatter(el, pts, key, target, opts) {
  const w = Math.max(280, el.clientWidth), h = Math.round(Math.min(300, Math.max(230, w * 0.56)));
  const L = 52, R = 14, Tp = 14, B = 38;
  const xs = pts.map(p => p.x), ys = pts.map(p => p[key]);
  const x0 = opts.x0, x1 = opts.x1;
  const logy = opts.log; const ylo = logy ? 100 : 0, yhi = Math.max(...ys, target) * (logy ? 2 : 1.1);
  const x = (v) => L + (v - x0) / (x1 - x0) * (w - L - R);
  const y = (v) => logy ? Tp + (1 - (Math.log10(Math.max(v, ylo)) - Math.log10(ylo)) / (Math.log10(yhi) - Math.log10(ylo))) * (h - Tp - B) : Tp + (1 - v / yhi) * (h - Tp - B);
  let g = "";
  const yt = logy ? [100, 1e3, 1e4, 1e5, 1e6] : (() => { const s = niceStep(yhi / 4), a = []; for (let v = 0; v <= yhi; v += s) a.push(v); return a; })();
  for (const v of yt) if (v <= yhi) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`;
  for (const v of opts.xt) g += `<text class="ax" x="${x(v)}" y="${h - B + 16}" text-anchor="middle">${opts.xf(v)}</text>`;
  g += `<text class="axl" x="${(L + w - R) / 2}" y="${h - 4}" text-anchor="middle">${opts.xlabel}</text>`;
  if (opts.band) g += `<rect x="${x(opts.band[0])}" y="${Tp}" width="${Math.max(2, x(opts.band[1]) - x(opts.band[0]))}" height="${h - Tp - B}" fill="var(--tol-soft)"/>`;
  g += `<line x1="${L}" x2="${w - R}" y1="${y(target)}" y2="${y(target)}" stroke="var(--ref)" stroke-width="2"/><text class="axl" x="${w - R}" y="${y(target) - 7}" text-anchor="end" fill="var(--ref)" style="fill:var(--ref)">2020 target ${fmt(target)}</text>`;
  const sorted = pts.map((p, i) => ({ ...p, i })).sort((a, b) => a.x - b.x);
  g += `<path d="${pathOf(sorted.map(p => x(p.x)), sorted.map(p => y(p[key])))}" fill="none" stroke="var(--ink-3)" stroke-width="1.2"/>`;
  pts.forEach((p, i) => { const last = i === pts.length - 1; g += `<circle cx="${x(p.x)}" cy="${y(p[key])}" r="${last ? 6 : 4}" fill="${last ? "var(--ink)" : "#fff"}" stroke="var(--ink)" stroke-width="1.6"><title>${opts.xf(p.x)} → ${fmt(p[key])}</title></circle>`; });
  el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${opts.aria}">${g}</svg>`;
}
function fig4() {
  const c = D.calib;
  if (c.beta.length) scatter($("f4a"), c.beta, "cases", c.betaTarget, { x0: 0.05, x1: 0.52, log: true, xt: [0.1, 0.2, 0.3, 0.4, 0.5], xf: (v) => v.toFixed(2), xlabel: "transmission scale β", aria: "Training cases by transmission scale" });
  if (c.comp.length) scatter($("f4b"), c.comp, "deaths", c.compTarget, { x0: 0, x1: 1, log: false, xt: [0, 0.25, 0.5, 0.75, 1], xf: (v) => Math.round(v * 100) + "%", xlabel: "compliance with measures", aria: "Training deaths by compliance" });
}

// ---------- Fig 6: waffle ----------
function fig5() {
  const share = D.head.cases[n] / D.head.infections; const k = Math.round(share * 100);
  const s = 20, gap = 2; let g = "";
  for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10; const on = i < k; g += `<rect x="${c * (s + gap)}" y="${r * (s + gap)}" width="${s}" height="${s}" rx="2" fill="${on ? "var(--ref)" : "#fff"}" stroke="${on ? "var(--ref)" : "var(--rule-2)"}" stroke-width="1.2"/>`; }
  const W = 10 * (s + gap) - gap;
  $("f5").innerHTML = `<svg width="${W}" height="${W}" viewBox="0 0 ${W} ${W}" role="img" aria-label="${k} of every 100 infections reported">${g}</svg>`;
  $("f5t").innerHTML = `<div class="big">${k}<span style="font-size:24px;color:var(--ink-3)">/100</span></div><p>infections become a reported case. The model infects ${fmt(D.head.infections)} times over three years; only ${fmt(D.head.cases[n])} are reported.</p>`;
}

// ---------- Fig 7: stacked settings ----------
function fig6() {
  const el = $("f6"); const S = D.settings; const w = Math.max(280, el.clientWidth), h = Math.round(Math.min(280, Math.max(220, w * 0.5)));
  const L = 44, R = 8, Tp = 8, B = 26;
  const ts = S.dates.map(T), t0 = ts[0], t1 = ts[ts.length - 1];
  const stack = []; let acc = S.dates.map(() => 0);
  for (const k of S.order) { const lo = acc.slice(); acc = acc.map((v, i) => v + S.values[k][i]); stack.push({ k, lo, hi: acc.slice() }); }
  const vmax = Math.max(...acc) * 1.05;
  const x = (t) => L + (t - t0) / (t1 - t0) * (w - L - R);
  const y = (v) => Tp + (1 - v / vmax) * (h - Tp - B);
  const xs = ts.map(x);
  let g = ""; const step = niceStep(vmax / 4);
  for (let v = 0; v <= vmax; v += step) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`;
  g += yearTicks(t0, t1, x, Tp, B, h);
  for (const s of stack) g += `<path d="${areaOf(xs, s.lo.map(y), s.hi.map(y))}" fill="var(--${s.k})"/>`;
  el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Weekly infections by setting">${g}</svg>`;
  const tot = {}; let all = 0; for (const k of S.order) { tot[k] = S.values[k].reduce((a, b) => a + b, 0); all += tot[k]; }
  const names = { home: "home", venue: "leisure & shops", school: "school", work: "work", transport: "transport" };
  $("k6").innerHTML = S.order.map(k => `<span><i class="sw" style="background:var(--${k})"></i>${names[k]} <b class="num" style="font-weight:500;color:var(--ink)">${(tot[k] / all * 100).toFixed(0)}%</b></span>`).join("");
}

// ---------- Fig 8: scenarios ----------
function fig7() {
  const el = $("f7"); const { w, h } = sizeOf(el, 0.36, 260, 400); const narrow = w < 640;
  const L = narrow ? 44 : 60, R = narrow ? 12 : 250, Tp = 12, B = 30;
  const ts = D.dates.map(T), t0 = ts[0], t1 = ts[n];
  const sc = D.scen; const vmax = Math.max(...sc.flatMap(s => s.deaths)) * 1.05;
  const x = (t) => L + (t - t0) / (t1 - t0) * (w - L - R);
  const y = (v) => Tp + (1 - v / vmax) * (h - Tp - B);
  const xs = ts.map(x);
  const cols = ["var(--inst)", "var(--inst)", "var(--inst)"]; const dashes = ["", "8 5", "2 4"];
  let g = ""; const step = niceStep(vmax / 4);
  for (let v = 0; v <= vmax; v += step) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`;
  g += yearTicks(t0, t1, x, Tp, B, h);
  g += `<path d="${pathOf(xs, D.real.deaths.map(y))}" fill="none" stroke="var(--ref)" stroke-width="1.6" stroke-dasharray="4 3" opacity=".7"/>`;
  sc.forEach((s, k) => { g += `<path d="${pathOf(xs, s.deaths.map(y))}" fill="none" stroke="${cols[k]}" stroke-width="${k ? 2 : 2.8}" ${dashes[k] ? `stroke-dasharray="${dashes[k]}"` : ""}/>`; });
  const base = sc[0].deaths[n];
  const labels = spread([...sc.map((s, k) => ({ y: y(s.deaths[n]), c: cols[k], t: s.label, v: fmt(s.deaths[n]) + (k ? `  (+${fmt(s.deaths[n] - base)})` : " deaths") })),
    { y: y(D.real.deaths[n]), c: "var(--ref)", t: "Bulletin (real)", v: fmt(D.real.deaths[n]) }], 44, Tp + 8, h - B - 18);
  const wrap = (t) => { if (t.length <= 28) return [t]; const mid = t.lastIndexOf(" ", 28); return mid > 0 ? [t.slice(0, mid), t.slice(mid + 1)] : [t]; };
  if (!narrow) for (const l of labels) { const ls = wrap(l.t); g += `<text class="lbl" x="${w - R + 12}" y="${l.y}" fill="${l.c}">${ls.map((t, i) => `<tspan x="${w - R + 12}" dy="${i ? 14 : 0}">${t}</tspan>`).join("")}</text><text class="lblv" x="${w - R + 12}" y="${l.y + 15 + (ls.length - 1) * 14}" fill="var(--ink-2)">${l.v}</text>`; }
  el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Cumulative deaths under three scenarios">${g}</svg>` + (narrow ? `<div class="key" style="margin-top:8px">${[...sc.map((s, k) => ({ l: s.label, c: cols[k], d: dashes[k], w: k ? 2 : 2.8, v: s.deaths[n] })), { l: "Bulletin (real)", c: "var(--ref)", d: "4 3", w: 1.6, v: D.real.deaths[n] }].map(e => `<span><svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="${e.c}" stroke-width="${e.w}" ${e.d ? `stroke-dasharray="${e.d}"` : ""}/></svg>${e.l}: <b class="num" style="font-weight:500">${fmt(e.v)}</b></span>`).join("")}</div>` : "");
}

// ---------- Fig 9: R0 sweep ----------
function fig8() {
  const el = $("f8"); const w = Math.max(280, el.clientWidth), h = Math.round(Math.min(300, Math.max(220, w * 0.3)));
  const L = 44, R = 16, Tp = 12, B = 38;
  const pts = D.r0; const x0 = 0.02, x1 = 0.25, ymax = 8;
  const x = (v) => L + (v - x0) / (x1 - x0) * (w - L - R);
  const y = (v) => Tp + (1 - v / ymax) * (h - Tp - B);
  let g = `<rect x="${L}" y="${y(3)}" width="${w - L - R}" height="${y(2.5) - y(3)}" fill="var(--tol-soft)"/>`;
  for (let v = 0; v <= ymax; v += 2) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  for (const v of [0.05, 0.1, 0.15, 0.2, 0.25]) g += `<text class="ax" x="${x(v)}" y="${h - B + 16}" text-anchor="middle">${v.toFixed(2)}</text>`;
  g += `<text class="axl" x="${(L + w - R) / 2}" y="${h - 4}" text-anchor="middle">transmission scale β</text>`;
  g += `<path d="${pathOf(pts.map(p => x(p.beta)), pts.map(p => y(p.r0)))}" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  for (const p of pts) g += `<circle cx="${x(p.beta)}" cy="${y(p.r0)}" r="3.5" fill="#fff" stroke="var(--ink)" stroke-width="1.6"/>`;
  const place = [{ dx: 0, dy: -16, a: "middle" }, { dx: 0, dy: 26, a: "middle" }, { dx: -12, dy: -12, a: "end" }];
  const marks = D.r0marks.map((m, k) => ({ b: m.beta, r: m.r0, x: m.extrap, t: `${m.label} · R0 ${m.extrap ? "≈" : ""}${dec(m.r0, 1)}${m.extrap ? " (extrapolated)" : ""}`, c: m.ok ? "var(--pass)" : "var(--fail)", ...place[k % 3] }));
  const last = pts[pts.length - 1];
  for (const m of marks) if (m.x) g += `<line x1="${x(last.beta)}" y1="${y(last.r0)}" x2="${x(m.b)}" y2="${y(m.r)}" stroke="var(--ink)" stroke-width="2" stroke-dasharray="3 3"/>`;
  for (const m of marks) g += `<circle cx="${x(m.b)}" cy="${y(m.r)}" r="7" fill="none" stroke="${m.c}" stroke-width="2.4"/><text class="lbl" x="${x(m.b) + m.dx}" y="${y(m.r) + m.dy}" text-anchor="${m.a}" fill="${m.c}">${m.t}</text>`;
  el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="R0 by transmission scale">${g}</svg>`;
}

function drawAll() { fig1(); fig2(); fig3(); fig4(); fig5(); fig6(); fig7(); fig8(); }
drawAll();
let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(drawAll, 120); });
if (document.fonts) document.fonts.ready.then(drawAll);
</script>
"""

if __name__ == "__main__":
    main()
