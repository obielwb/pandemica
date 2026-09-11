package report

import (
	"fmt"
	"html"
	"math"
	"os"
	"strings"
	"time"
)

var palette = []string{"#2563eb", "#9ca3af", "#e11d48", "#16a34a", "#d97706", "#7c3aed"}

// Chart is one panel of the HTML report.
type Chart struct {
	Title  string
	Series []Line
}

// Line is one plotted line.
type Line struct {
	Name   string
	Dates  []time.Time
	Values []float64
	Dashed bool
}

func svgChart(c Chart, w, h int) string {
	if len(c.Series) == 0 {
		return ""
	}
	var minT, maxT time.Time
	maxV := 0.0
	for _, s := range c.Series {
		for k, d := range s.Dates {
			if minT.IsZero() || d.Before(minT) {
				minT = d
			}
			if d.After(maxT) {
				maxT = d
			}
			if s.Values[k] > maxV {
				maxV = s.Values[k]
			}
		}
	}
	if maxV == 0 {
		maxV = 1
	}
	const padL, padR, padT, padB = 70, 10, 10, 30
	pw, ph := float64(w-padL-padR), float64(h-padT-padB)
	span := maxT.Sub(minT).Hours()
	if span == 0 {
		span = 1
	}
	x := func(d time.Time) float64 { return padL + d.Sub(minT).Hours()/span*pw }
	y := func(v float64) float64 { return padT + ph - v/maxV*ph }
	var b strings.Builder
	fmt.Fprintf(&b, `<svg viewBox="0 0 %d %d" role="img" aria-label="%s">`, w, h, html.EscapeString(c.Title))
	for k := 0; k <= 4; k++ {
		v := maxV * float64(k) / 4
		fmt.Fprintf(&b, `<line x1="%d" x2="%d" y1="%.1f" y2="%.1f" class="grid"/>`, padL, w-padR, y(v), y(v))
		fmt.Fprintf(&b, `<text x="%d" y="%.1f" class="ax" text-anchor="end">%s</text>`, padL-6, y(v)+4, human(v))
	}
	for yr := minT.Year(); yr <= maxT.Year()+1; yr++ {
		d := time.Date(yr, 1, 1, 0, 0, 0, 0, time.UTC)
		if d.Before(minT) || d.After(maxT) {
			continue
		}
		fmt.Fprintf(&b, `<line x1="%.1f" x2="%.1f" y1="%d" y2="%.1f" class="grid"/>`, x(d), x(d), padT, padT+ph)
		fmt.Fprintf(&b, `<text x="%.1f" y="%d" class="ax" text-anchor="middle">%d</text>`, x(d), h-8, yr)
	}
	for k, s := range c.Series {
		var pts strings.Builder
		for i, d := range s.Dates {
			fmt.Fprintf(&pts, "%.1f,%.1f ", x(d), y(s.Values[i]))
		}
		dash := ""
		if s.Dashed {
			dash = ` stroke-dasharray="5 4"`
		}
		fmt.Fprintf(&b, `<polyline fill="none" stroke="%s" stroke-width="2"%s points="%s"/>`, palette[k%len(palette)], dash, pts.String())
	}
	b.WriteString(`</svg><div class="legend">`)
	for k, s := range c.Series {
		fmt.Fprintf(&b, `<span><i style="background:%s"></i>%s</span>`, palette[k%len(palette)], html.EscapeString(s.Name))
	}
	b.WriteString(`</div>`)
	return b.String()
}

func human(v float64) string {
	switch {
	case v >= 1e6:
		return fmt.Sprintf("%.1fM", v/1e6)
	case v >= 1e3:
		return fmt.Sprintf("%.0fk", v/1e3)
	}
	return fmt.Sprintf("%.0f", math.Round(v))
}

// WriteHTML writes a standalone report with the given summary (pre-rendered
// HTML) and charts.
func WriteHTML(path, title, summary string, charts []Chart) error {
	var b strings.Builder
	fmt.Fprintf(&b, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%s</title><style>
body{font:14px/1.5 system-ui,sans-serif;margin:0;padding:24px 16px;background:#fafafa;color:#111}
main{max-width:980px;margin:0 auto}h1{font-size:22px;margin:0 0 12px}h2{font-size:16px;margin:24px 0 6px}
svg{width:100%%;height:auto;background:#fff;border:1px solid #e5e7eb;border-radius:6px}
.grid{stroke:#eee}.ax{font-size:11px;fill:#6b7280}.legend{display:flex;flex-wrap:wrap;gap:12px;margin:6px 0 0;font-size:12px}
.legend i{display:inline-block;width:12px;height:3px;margin-right:6px;vertical-align:middle}
table{border-collapse:collapse;font-size:13px;margin:8px 0}td,th{border:1px solid #e5e7eb;padding:4px 8px;text-align:right}th{background:#f3f4f6}td:first-child,th:first-child{text-align:left}
</style></head><body><main><h1>%s</h1>%s`, html.EscapeString(title), html.EscapeString(title), summary)
	for _, c := range charts {
		fmt.Fprintf(&b, "<h2>%s</h2>%s", html.EscapeString(c.Title), svgChart(c, 960, 320))
	}
	b.WriteString("</main></body></html>")
	return os.WriteFile(path, []byte(b.String()), 0o644)
}
