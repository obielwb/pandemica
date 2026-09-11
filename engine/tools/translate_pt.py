#!/usr/bin/env python3
"""Make the Brazilian Portuguese results page from the English one.

usage: translate_pt.py IN_en.html OUT_pt.html
Every replacement must match; a missing string fails loudly so the Portuguese
page never silently keeps English after the English page changes.
"""
import sys

PAIRS = [
    # page identity
    ("<title>Pandemica vs. Campinas</title>", "<title>Pandemica x Campinas</title>"),
    ('<span class="vs">vs.</span>', '<span class="vs">x</span>'),
    ("const D = ", 'document.documentElement.lang = "pt-BR";\nconst D = '),
    # static copy
    ('aria-label="Report header"', 'aria-label="Cabeçalho do relatório"'),
    ("The finished model, rewritten in Go, checked against three years of the real epidemic.", "O modelo concluído, reescrito em Go, conferido contra três anos da epidemia real."),
    ('aria-label="Verdict"', 'aria-label="Veredito"'),
    ("Deaths end inside tolerance", "Os óbitos terminam dentro da tolerância"),
    ("Cumulative deaths. The model runs above the band from late 2020 to mid-2021, then converges. Yellow band: ±30% around the bulletin, the paper's own 70–80% accuracy goal. Grey band: three seeds of the headline run.",
     "Óbitos acumulados. O modelo fica acima da faixa do fim de 2020 até meados de 2021 e depois converge. Faixa amarela: ±30% em torno do boletim, a meta de 70–80% de acurácia do próprio artigo. Faixa cinza: três sementes da rodada principal."),
    ("How far off each run lands", "Quanto cada rodada erra"),
    ("></i>deaths</span>", "></i>óbitos</span>"),
    ("></i>cases</span>", "></i>casos</span>"),
    ("></i>±30% tolerance</span>", "></i>tolerância ±30%</span>"),
    ("Final total ÷ real total, 31 Dec 2022, log scale. 1× is a perfect reading.", "Total final ÷ total real, 31 dez 2022, escala log. 1× é uma leitura perfeita."),
    ("Waves, week by week", "Ondas, semana a semana"),
    ("></i>bulletin</span>", "></i>boletim</span>"),
    ("></i>model</span>", "></i>modelo</span>"),
    ("></i>paper run</span>", "></i>rodada do artigo</span>"),
    (" seeds</span>", " sementes</span>"),
    ("Weekly new deaths. Ticks mark when each variant was seeded. The 2020 wave arrives about three months late; 2021 and 2022 line up.",
     "Novos óbitos por semana. As marcas indicam quando cada variante foi introduzida. A onda de 2020 chega cerca de três meses atrasada; 2021 e 2022 coincidem."),
    ("The knife edge", "O fio da navalha"),
    ("Paper setup: fitting 2020 cases by transmission scale. A 20% nudge moves the result tenfold.",
     "Configuração do artigo: ajuste aos casos de 2020 pela escala de transmissão. Uma variação de 20% muda o resultado em dez vezes."),
    ("The fix", "A correção"),
    ("Headline setup: R0 pinned at 2.8, fitting how closely people followed the measures to 2020 deaths.",
     "Configuração principal: R0 fixado em 2,8, ajustando a adesão às medidas aos óbitos de 2020."),
    ("The hidden epidemic", "A epidemia oculta"),
    ("Where infections happened", "Onde as infecções aconteceram"),
    ("Weekly infections in the headline run, stacked by place.", "Infecções semanais na rodada principal, empilhadas por local."),
    ("One lever at a time", "Uma alavanca por vez"),
    ("Same calibrated model and seed, one intervention removed.", "Mesmo modelo calibrado e mesma semente, com uma intervenção removida."),
    ("How contagious the fit makes the virus", "Quão contagioso o ajuste deixa o vírus"),
    ("literature R0 2.5–3", "R0 da literatura 2,5–3"),
    ("R0 of the ancestral strain measured from early growth for each transmission scale. Fits that match 2020 without pinning R0 need a virus more than twice as contagious as the literature.",
     "R0 da cepa original medido pelo crescimento inicial para cada escala de transmissão. Ajustes que batem com 2020 sem fixar o R0 exigem um vírus mais que duas vezes mais contagioso que o da literatura."),
    ('aria-label="Method"', 'aria-label="Método"'),
    ("<h3>Hold-out</h3>", "<h3>Validação hold-out</h3>"),
    ("Only data up to 7 Oct 2020 (the first 20% of days) was used to calibrate. Everything after is a prediction.",
     "Só os dados até 7 out 2020 (os primeiros 20% dos dias) entraram na calibração. Todo o resto é previsão."),
    ("<h3>Why cases miss</h3>", "<h3>Por que os casos erram</h3>"),
    ("The reporting rate fitted in 2020 stays fixed. Real testing collapsed in the Omicron era, so the model over-reports cases while deaths hold.",
     "A taxa de notificação ajustada em 2020 fica fixa. A testagem real despencou na era Ômicron, então o modelo notifica casos demais enquanto os óbitos se mantêm."),
    ("<h3>Run it</h3>", "<h3>Como rodar</h3>"),
    ("Reference: Campinas epidemiological bulletin · vaccination registry · IBGE 2010 census",
     "Referência: boletim epidemiológico de Campinas · registro de vacinação · Censo IBGE 2010"),
    # locale and number formatting
    ('toLocaleString("en-US")', 'toLocaleString("pt-BR")'),
    ('toLocaleDateString("en-GB"', 'toLocaleDateString("pt-BR"'),
    ('Math.abs(v).toFixed(v >= 100 || v <= -100 ? 0 : 1) + "%"', 'Math.abs(v).toFixed(v >= 100 || v <= -100 ? 0 : 1).replace(".", ",") + "%"'),
    ('(v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + "M"', '(v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(".", ",") + "M"'),
    ('(v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\\.0$/, "") + "k"', '(v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\\.0$/, "").replace(".", ",") + "k"'),
    # header spec and readings
    ('["Instrument", "Pandemica Go engine"]', '["Instrumento", "Motor Pandemica em Go"]'),
    ('["Reference", "Campinas bulletin, SP"]', '["Referência", "Boletim de Campinas, SP"]'),
    ('["Period", "18 Mar 2020 – 31 Dec 2022"]', '["Período", "18 mar 2020 – 31 dez 2022"]'),
    ('["Agents", ', '["Agentes", '),
    ('["Calibration window", "to " + ', '["Janela de calibração", "até " + '),
    ('["Runtime, 1,019 days", (D.head.simSeconds / 60).toFixed(1) + " min, M4 laptop"]', '["Execução, 1.019 dias", (D.head.simSeconds / 60).toFixed(1).replace(".", ",") + " min, notebook M4"]'),
    # readings
    ('["Deaths", signed(ed), `${fmt(md)} simulated · ${fmt(rd)} real`', '["Óbitos", signed(ed), `${fmt(md)} simulados · ${fmt(rd)} reais`'),
    ('["Reported cases", signed(ec), `${fmt(mc)} simulated · ${fmt(rc)} real`', '["Casos notificados", signed(ec), `${fmt(mc)} simulados · ${fmt(rc)} reais`'),
    ('mark("pass", "WITHIN ±30%")', 'mark("pass", "DENTRO DE ±30%")'),
    ('mark("fail", "OUT OF TOLERANCE")', 'mark("fail", "FORA DA TOLERÂNCIA")'),
    ('["Paper run, deaths", signed(et), `${fmt(tsd)} in the 2023 TypeScript run`, mark("info", "PREVIOUS INSTRUMENT")]',
     '["Rodada do artigo, óbitos", signed(et), `${fmt(tsd)} na rodada em TypeScript de 2023`, mark("info", "INSTRUMENTO ANTERIOR")]'),
    ('const dec = (v, d) => v.toFixed(d);', 'const dec = (v, d) => v.toFixed(d).replace(".", ",");'),
    # fig 1
    ('t: "Bulletin"', 't: "Boletim"'),
    ('t: "Model"', 't: "Modelo"'),
    ('t: "Paper run"', 't: "Rodada do artigo"'),
    (">calibration ends<", ">fim da calibração<"),
    ('<span style="color:var(--ref)">Bulletin</span>', '<span style="color:var(--ref)">Boletim</span>'),
    ("<span>Model</span>", "<span>Modelo</span>"),
    ("<span>Error</span>", "<span>Erro</span>"),
    ("Cumulative deaths, bulletin versus model, 2020 to 2022", "Óbitos acumulados, boletim versus modelo, 2020 a 2022"),
    # fig 2
    ("rc >= 10 ? rc.toFixed(0) : rc.toFixed(1)}× cases</text>", 'rc >= 10 ? rc.toFixed(0) : rc.toFixed(1).replace(".", ",")}× casos</text>'),
    ("<title>deaths ${", "<title>óbitos ${"),
    ("<title>cases ${", "<title>casos ${"),
    ("Ratio of simulated to real totals for every run", "Razão entre totais simulados e reais em cada rodada"),
    # fig 3
    ('["Jan", "Apr", "Jul", "Oct"]', '["Jan", "Abr", "Jul", "Out"]'),
    ("Weekly deaths in ${yr}", "Óbitos semanais em ${yr}"),
    # fig 4/5
    ("2020 target ${fmt(target)}", "meta 2020 ${fmt(target)}"),
    ('xf: (v) => v.toFixed(2), xlabel: "transmission scale β"', 'xf: (v) => v.toFixed(2).replace(".", ","), xlabel: "escala de transmissão β"'),
    ('xlabel: "compliance with measures"', 'xlabel: "adesão às medidas"'),
    ("Training cases by transmission scale", "Casos no treino por escala de transmissão"),
    ("Training deaths by compliance", "Óbitos no treino por adesão"),
    # fig 6
    ("infections become a reported case. The model infects ${fmt(D.head.infections)} times over three years; only ${fmt(D.head.cases[n])} are reported.",
     "infecções viram um caso notificado. O modelo gera ${fmt(D.head.infections)} infecções em três anos; só ${fmt(D.head.cases[n])} são notificadas."),
    ("of every 100 infections reported", "de cada 100 infecções notificadas"),
    # fig 7
    ('{ home: "home", venue: "leisure & shops", school: "school", work: "work", transport: "transport" }',
     '{ home: "casa", venue: "lazer e comércio", school: "escola", work: "trabalho", transport: "transporte" }'),
    ("Weekly infections by setting", "Infecções semanais por local"),
    # fig 8
    ('" deaths")', '" óbitos")'),
    ("Cumulative deaths under three scenarios", "Óbitos acumulados em três cenários"),
    # fig 9
    ("${v.toFixed(2)}</text>", '${v.toFixed(2).replace(".", ",")}</text>'),
    (">transmission scale β<", ">escala de transmissão β<"),
    ("R0 by transmission scale", "R0 por escala de transmissão"),
    ('"label":"headline"', '"label":"principal"'),
    ('"label":"paper setup"', '"label":"config. do artigo"'),
    ('"label":"fit on deaths"', '"label":"ajuste nos óbitos"'),
    ('t: "Bulletin (real)"', 't: "Boletim (real)"'),
    ('{ l: "Bulletin (real)"', '{ l: "Boletim (real)"'),
    ('" (extrapolated)"', '" (extrapolado)"'),
    # v2 section
    ("v2, closer to the original design", "v2, mais perto do desenho original"),
    ("Cumulative deaths. v2.1 adds hospitals, sick routines, bedrooms and adaptive behaviour, and is fitted to the whole training curve; the bed limit is off because the repository has no bed data. Same seed as v1.",
     "Óbitos acumulados. A v2.1 adiciona hospitais, rotina de doentes, quartos e comportamento adaptativo, e é ajustada à curva de treino inteira; o limite de leitos fica desligado porque o repositório não tem dados de leitos. Mesma semente da v1."),
    ("></i>v1</span>", "></i>v1</span>"),
    ("Where infections happen, v1 and v2.1", "Onde as infecções acontecem, v1 e v2.1"),
    ("Share of all infections by place. In v2.1, hospital wards carry <b class=\"num\" id=\"w11\"></b> of infections and pharmacies <b class=\"num\" id=\"p11\"></b>, too thin to see as bars.",
     "Parcela de todas as infecções por local. Na v2.1, as enfermarias ficam com <b class=\"num\" id=\"w11\"></b> das infecções e as farmácias com <b class=\"num\" id=\"p11\"></b>, finas demais para aparecer nas barras."),
    ("What each v2 change does", "O que cada mudança da v2 faz"),
    ("Every row recalibrates from scratch (R0 2.8, compliance fitted on 2020 deaths). The first v2 row has all four changes with 1 COVID bed per 1,000 people; each row below removes one. Curve score is on the held-out 80%.",
     "Cada linha recalibra do zero (R0 2,8, adesão ajustada aos óbitos de 2020). A primeira linha da v2 tem as quatro mudanças com 1 leito COVID por 1.000 pessoas; cada linha abaixo remove uma. O escore da curva é nos 80% de validação."),
    ('aria-label="v2 comparison"', 'aria-label="Comparação v2"'),
    ('const names = { home: "home", venue: "leisure & shops", school: "school", work: "work", transport: "transport", hospital: "hospital" };',
     'const names = { home: "casa", venue: "lazer e comércio", school: "escola", work: "trabalho", transport: "transporte", hospital: "hospital" };'),
    ("<th>Run</th><th>β for R0 2.8</th><th>Deaths</th><th>Cases</th><th>Home</th><th>Hospital</th><th>Turned away</th><th>Curve score, test</th>",
     "<th>Rodada</th><th>β para R0 2,8</th><th>Óbitos</th><th>Casos</th><th>Casa</th><th>Hospital</th><th>Sem leito</th><th>Escore da curva, validação</th>"),
    ("Cumulative deaths, bulletin, v1 and v2", "Óbitos acumulados, boletim, v1 e v2"),
    ("Share of infections by place, v1 and v2", "Parcela das infecções por local, v1 e v2"),
    ('"v1 (reference)"', '"v1 (referência)"'),
    ('"v2, every change (1 bed per 1,000)"', '"v2, todas as mudanças (1 leito por 1.000)"'),
    ('"– without sick routine"', '"– sem rotina de doentes"'),
    ('"– without bedroom rule"', '"– sem regra de quartos"'),
    ('"– without bed limit = v2 final"', '"– sem limite de leitos = v2 final"'),
    ('"– without hospitals"', '"– sem hospitais"'),
    ('"v2.1: v2 final + whole-curve fit + adaptive behaviour"', '"v2.1: v2 final + ajuste da curva inteira + comportamento adaptativo"'),
    ('"– without adaptive behaviour"', '"– sem comportamento adaptativo"'),
    ("`Across ${a.length} seeds, the held-out curve score is <b class=\"num\">${rng(a, \"curve\", pc)}</b> for v1 (mean <b class=\"num\">${pc(mean(a, \"curve\"))}</b>) and <b class=\"num\">${rng(b, \"curve\", pc)}</b> for v2.1 (mean <b class=\"num\">${pc(mean(b, \"curve\"))}</b>); deaths are <b class=\"num\">${rng(a, \"deaths\", fmt)}</b> and <b class=\"num\">${rng(b, \"deaths\", fmt)}</b>. The table shows seed 1.`",
     "`Em ${a.length} sementes, o escore da curva na validação fica entre <b class=\"num\">${rng(a, \"curve\", pc)}</b> na v1 (média <b class=\"num\">${pc(mean(a, \"curve\"))}</b>) e <b class=\"num\">${rng(b, \"curve\", pc)}</b> na v2.1 (média <b class=\"num\">${pc(mean(b, \"curve\"))}</b>); os óbitos ficam entre <b class=\"num\">${rng(a, \"deaths\", fmt)}</b> e <b class=\"num\">${rng(b, \"deaths\", fmt)}</b>. A tabela mostra a semente 1.`"),
    # embedded data labels
    ('"Paper, TypeScript (2023)"', '"Artigo, TypeScript (2023)"'),
    ('"Go · paper setup"', '"Go · config. do artigo"'),
    ('"Go · fit on 2020 deaths"', '"Go · ajuste nos óbitos de 2020"'),
    ("Go · headline", "Go · principal"),
    (" (seed ", " (semente "),
    ('"As it happened"', '"Como aconteceu"'),
    ('"No lockdown, masks or school closures"', '"Sem quarentena, máscaras ou escolas fechadas"'),
    ('"No vaccines"', '"Sem vacinas"'),
]

def main():
    src, dst = sys.argv[1], sys.argv[2]
    s = open(src).read()
    missing = []
    for old, new in PAIRS:
        if old not in s:
            missing.append(old)
            continue
        s = s.replace(old, new)
    if missing:
        sys.exit("untranslated (not found in the English page):\n  " + "\n  ".join(missing))
    open(dst, "w").write(s)
    print("wrote", dst)

if __name__ == "__main__":
    main()
