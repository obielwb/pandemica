# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: the authors (João and Gabriel) and their capstone advisors at Colégio Técnico de Campinas (Unicamp), reviewing how the finished Pandemica model performs against real data. Secondary: municipal health departments (Campinas and Bragança Paulista adopted the tool) evaluating scenarios.

## Product Purpose
Pandemica is an open-source agent-based pandemic simulator for a single city. It builds a virtual population from census data (IBGE), gives each person a weekly routine, spreads a respiratory disease through shared places, and lets public health officials compare intervention scenarios (masks, lockdown, vaccination). Success means the simulated epidemic tracks the real bulletin closely enough that scenario differences can be trusted.

## Positioning
City-scale, census-driven individuals with routines, rather than national compartmental models; runs on a laptop.

## Operating Context
Results are reviewed as reports and charts comparing simulated and real daily series for Campinas, 2020-03-18 to 2022-12-31. The paper is at web/content/paper.mdx; the website lives in web/.

## Capabilities and Constraints
Go engine in engine/ (population, routines, neural preference network, transmission, vaccines, variants, calibration, counterfactual scenarios). Hold-out validation: only the first 20% of days may be used for calibration.

## Brand Commitments
Name: Pandemica. Web identity uses Pandemica blue (hsl 234 100% 47%) and Pandemica yellow (hsl 54 99% 48%).

## Evidence on Hand
Real bulletin: model/data/covid19/campinas_2020_2021_2022_cases.csv. Vaccine registry: model/data/covid19/campinas_2021_2022_2023_vaccines.csv. Paper run: web/public/simulation/results/campinas/v1.csv. Engine runs: engine/results/*.csv|json. Every figure shown must come from these files; never invent numbers.

## Product Principles
- Honest comparison with real data beats flattering metrics.
- Hold-out discipline: calibrate on the first 20% only.
- Scenarios are the point: same model, one lever changed.
