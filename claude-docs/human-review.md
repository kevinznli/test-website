# Decisions for humans to review

These are choices Claude made on its own while building the backend and connecting the frontend. Nobody on the team has approved them, and some of them affect what people are told about their safety. Each can be changed, and the "Change it in" column says where.

Snapshot: 2026-11-07. When you settle an item, delete it or mark it as decided.

## Review these first

These are the items most likely to mislead someone using the site.

| # | Issue | Why it matters | Suggested action |
|---|---|---|---|
| 1 | **The scoring model isn't validated.** Every weight, cutoff and alert score below was chosen for a demo. No hazard expert has reviewed them, and they haven't been checked against real outcomes. | A person could read "Moderate" or "Low" as advice about their home. | Have someone with domain knowledge review section 1. Keep the site labelled as a prototype until then. |
| 2 | **"0/100" looks like "no risk".** A hazard scores 0 if the place has no recent history of it and nothing is active. Cook County shows Earthquake 0/100. | Absence from a record since 2006 isn't proof of safety. The New Madrid fault zone, for example, has major historical quakes that a 20-year window can't capture. | Consider wording such as "No recorded events since 2006", or hiding the number at 0. |
| 3 | **"Low" and "Moderate" may reassure too much.** On the test day, 3,117 of 3,221 counties were Low or Moderate, and no state was above Moderate. A quiet day caps every hazard at 50, because half the score is live. | A high-risk county looks calm until an alert is issued. Long-term and current risk are merged into one number. | Decide whether long-term risk and current conditions should be two separate numbers. |
| 4 | **Federal declarations aren't physical risk.** They measure when the federal government responded, and depend on how FEMA labels events. | Baselines can understate risk: FEMA has few "Tornado" declarations (no county has more than 3), probably because many are filed under "Severe Storm". | Consider adding the FEMA National Risk Index, which was designed for this purpose. |
| 5 | **Site wording about data was rewritten by Claude.** See section 5. | This is the public description of the project's methodology. | Read `/about`, the home page and the footer, and correct anything you'd phrase differently. |

## 1. Scoring

All of this is in `backend/app/domain/`. Changing a mapping for FEMA also needs a rebuild: `python -m scripts.build_reference_data`.

| Decision | What was chosen | Why | Alternatives | Change it in |
|---|---|---|---|---|
| Baseline vs live split | 50% / 50% | The original `/about` page said this | Weight long-term risk more heavily; show two numbers | `BASELINE_WEIGHT`, `LIVE_WEIGHT` in `scoring.py` |
| Composite formula | 60% highest hazard + 40% mean of top three | An average would let irrelevant hazards hide the real one | Maximum only; population or damage weighting | `composite_score` in `scoring.py` |
| Tier cutoffs | Critical 75+, Elevated 50+, Moderate 30+, Low below 30 | Aligned with the site's existing bar colours. The mock data's tiers overlapped, so they gave no answer | FEMA's five ratings; percentile-based tiers | `TIER_FLOORS` in `scoring.py`, plus the display text in `frontend/lib/tiers.ts` |
| Tier names | Kept Low, Moderate, Elevated, Critical | Already in the frontend's types | FEMA's "Very Low" to "Very High" | Same as above, plus `frontend/lib/types.ts` |
| Hazard list | Wildfire, Earthquake, Flood, Severe Storm, Hurricane, Tornado | The frontend's filters plus Severe Storm from its mock data. Heat, drought and winter aren't separate hazards | Add heat or drought, which have large real-world impact | `Hazard` in `hazards.py` |
| Baseline method | Percentile rank among counties that have had the hazard; never-affected counties score 0 | Ranking against all counties made one tornado declaration score 93 | Rates per year; rates per person or area | `add_percentile_scores` in `scripts/build_reference_data.py` |
| History window | Since 2006 | `/about` described a 20-year baseline | Longer windows, especially for earthquakes | `BASELINE_SINCE_YEAR` in the same script |
| FEMA incident mapping | E.g. Winter Storm counts as Severe Storm; Mud/Landslide and Coastal Storm count as Flood; Tropical Storm counts as Hurricane | Closest available fit | Separate winter hazard | `FEMA_INCIDENT_HAZARDS` in `hazards.py` |
| FEMA exclusions | Emergency declarations (`EM`) and COVID-19 excluded | Many `EM` declarations cover evacuees from other states | Include them | `load_declarations` in the same script |
| Tribal lands | Count toward a state's total but no county | FEMA gives them no county code | Map reservations onto their counties | `load_declarations` |
| Earthquake baseline | M4.5+ within 60 miles of the county, since 2006 | FEMA has too few earthquake declarations to rank counties | Use USGS seismic hazard maps, which is what the field uses | Constants in the same script |
| Alert scores | E.g. Red Flag Warning 100, Flood Warning 85, Wind Advisory 35 | A judgement call for each of 31 alert types | Expert-set values | `ALERT_RULES` in `hazards.py` |
| Live earthquake scores | M5.5+ within 20 mi scores 100, M4.5+ within 30 mi scores 75, M3+ within 30 mi scores 45, counted for 7 days | Distances and magnitudes come from `/about`; the scores and the 7 days were chosen | Decay over time; measure ground shaking instead | `quake_score` in `scoring.py`, `RECENT_DAYS` in `clients/usgs.py` |
| Weather scores | RH ≤ 15% and gusts ≥ 25 mph scores 80 for wildfire; gusts ≥ 40 / 58 mph score 70 / 100; below that scores 0 | Thresholds come from `/about`; the scores were chosen. Scoring nothing below advisory level keeps the map and sidebar in step | Graduated scores | `scoring.py` |
| Gauge scores | Major 100, moderate 85, minor 70, action 40; the worse of observed and forecast | A judgement call | | `GAUGE_CATEGORY_SCORES` in `scoring.py` |
| Rain | Shown in text but never scored | No threshold existed in the original design | Add a flash flood rule | `_flood_signal` in `services/risk.py` |
| State scores | Population-weighted average of counties | Reflects where people live | Worst county; area weighting. Averages dilute local hazards: on the test day, the Tornado view showed every state as Low | `_population_weighted` in `services/snapshot.py` |
| Puerto Rico weighting | Equal weight for each municipio | No population data was available | Find a population source | Same function |

## 2. Data sources

| Decision | What was chosen | Why | Alternatives |
|---|---|---|---|
| Sources added beyond `apis.md` | Census population files, Plotly county GeoJSON, Open-Meteo geocoding | None of the listed APIs provide population, county names or city and ZIP lookup | Other geocoders, such as the Census geocoder |
| No National Risk Index | Not used, since it isn't in `apis.md` | Stayed with the list. So there are no expected-loss figures | Add it; this also restores the loss metrics |
| Population vintage | 2021 estimates, 2019 for gaps | Newer files replace Connecticut's counties, which wouldn't match the map | Update the map file and use newer data |
| Static baseline | Pre-computed into a committed file | Demo reliability; the source calls are slow | Refresh on a schedule |
| Weather location | One point at each county's center | One call per county | Sample several points, or where people live. Riverside's center is in the desert, far from most residents |

`backend/data/reference.json` was generated on 2026-11-07 and doesn't refresh on its own.

## 3. Reliability and API usage

Change these in `backend/app/config.py` or `backend/.env`, except where noted.

| Decision | What was chosen | Why |
|---|---|---|
| Cache lifetimes | Alerts and quakes 5 min; scores 1 min; weather 30 min; gauges 15 min; search 24 h | Protects shared quotas. **This means a new alert can take up to about 6 minutes to appear**, which is too slow to rely on in an emergency |
| Old data during outages | Served for up to 1 hour, then treated as unavailable | Balances availability against showing old alerts as current |
| Failed sources | Scores carry on without them, so they read lower, and the text says live data is unavailable | The site stays up. The alternative is hiding scores entirely during an outage, which is arguably safer |
| NWPS backoff | 5-minute pause after a 429 | NWPS publishes no limit (`RATE_LIMIT_BACKOFF_SECONDS` in `clients/nwps.py`) |
| Map excludes weather and gauges | The map uses baseline, NWS and USGS only, so a county's map colour can differ from its sidebar score | 3,221 per-county calls exceed quotas. A note in the sidebar explains this |
| Commercial use | Assumes the project stays non-commercial, per `apis.md` | Open-Meteo's free tier requires it, including no ads or subscriptions |

## 4. Interface

All of this is in `frontend/components/`.

| Decision | What was chosen | Why | Change it in |
|---|---|---|---|
| Metric dropdown | **Removed** | Its options (loss per person, total loss, % high-risk) have no data source | `map/MapControls.tsx` |
| Hazard pills | Now colour the map; added Severe Storm | They were marked Planned | `METRIC_FILTERS` in `map/MapControls.tsx` |
| Legend | Four tiers plus "No data", replacing dollar ranges | Matches what the colours now mean | `map/MapLegend.tsx`, `lib/tiers.ts` |
| Tier colours | Reused the existing ramp, with Low slightly darker so bars stay visible | Keeps the existing look | `lib/tiers.ts` |
| Default state | California opens first | It was the previous default | `DEFAULT_STATE` in `map/MapExplorer.tsx` |
| Search result choice | Opens the best match immediately and lists any others. Same-named counties are ranked by population | Quick for the common case, but someone searching "Washington" sees the largest one first | `map/CountySearch.tsx` |
| Empty hero search | Still goes to Riverside, as it did before | Left unchanged, though it may surprise people | `home/HeroSection.tsx` |
| Home page preview | Shows live Riverside County data | It was hardcoded and contradicted the mock data | `PREVIEW_FIPS` in `home/MiniMapPreview.tsx` |
| Top Hazard tile | Replaced the hardcoded "Threat Index: High (Live)" | That value wasn't real | `map/StateInspector.tsx` |
| County footer | Replaced "Synced with NWS & USGS feeds ● Active" with a note on map differences | That status was hardcoded | `map/CountyInspector.tsx` |
| Prototype badge | Removed "SAMPLE DATA", kept "PROTOTYPE" | The data is now real. It's still hidden on small screens, which you may want to change | `common/Navigation.tsx` |
| DC and Puerto Rico | Available through the county view and search, not as state polygons | The state map file doesn't include them | `BOUNDARY_URLS` in `map/RiskLeafletMap.tsx` |

## 5. Site wording

Claude rewrote these because the old text described data the site doesn't use, such as the National Risk Index, NIFC fire perimeters and HRRR weather models.

| Location | Change |
|---|---|
| `/about` | Rewrote the data sources, the description of the two score components and the data dictionary. **Added a paragraph publishing the composite formula and tier cutoffs**, since the site promises transparency |
| Home hero | "FEMA National Risk Index · 3,232 Counties" became "FEMA, NOAA & USGS data · 3,221 Counties". Rewrote the summary, removing the promises about annual cost and community preparedness |
| Home stats | 3,232 counties became 3,221; 18 hazards became 6; "Data Vintage: Dec 2025" became "History Since: 2006" |
| Home features | Removed the social vulnerability, resilience and expected-damage claims. "Live hazard alerts" is no longer marked Planned, and "Built entirely on public data" became "Built on public data" |
| Footer | NIFC and FEMA NRI links became Open-Meteo and OpenFEMA |

The `/about` paragraph and the tier legend repeat values from the backend. If you change the scoring, update them too.

## 6. Removed or changed in code

| Item | Note |
|---|---|
| `frontend/lib/mockRiskData.ts` | Deleted, so the site now needs the backend to show scores. To restore it for offline demos, use git history |
| `frontend/components/map/CartogramGrid.tsx` | Deleted; it was unused and depended on the mock data |
| `lossPerPerson`, `totalLoss`, `highRiskPct`, `highRiskCounties`, `row`, `col`, `risk`, `color` | Removed from `lib/types.ts`, since nothing supplies them |
| Fixes you didn't ask for | The invisible "From national patterns" heading and that section's missing margins |

## 7. Not done

- **Deployment.** There's no hosting setup. Deploying needs `NEXT_PUBLIC_API_URL` on the frontend and the site's address in `CORS_ORIGINS` on the backend.
- **CARTO key.** A key committed earlier should still be rotated, because it remains in git history. Rotating it needs someone with CARTO account access.
- **Boundary files.** The map loads its GeoJSON from third-party GitHub branches at runtime. They could move or change, so consider self-hosting them.
- **Page title.** The browser tab still says "Create Next App".
