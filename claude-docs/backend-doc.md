# Risk Resource backend: design and how it works

Audience: developers and coding agents working on the backend or connecting the frontend to it.

Snapshot: 2026-11-07. If this doc and the code disagree, the code wins, and this doc should be updated.

Related docs:

- [`frontend-doc.md`](frontend-doc.md): the frontend and the data shapes it expects.
- [`apis-usage.md`](apis-usage.md): exactly what is called on each external API and how it's used.
- [`human-review.md`](human-review.md): decisions that still need human review, including the scoring rules.

## 1. Summary

A FastAPI service that combines public hazard data into risk scores, and returns them in the shapes defined by [`frontend/lib/types.ts`](../frontend/lib/types.ts). It's built for a hackathon-style demo: there's no database, no authentication and no automated tests.

Three things shape the design:

- **Two kinds of data.** Slow-changing history is pre-computed into a committed file, [`backend/data/reference.json`](../backend/data/reference.json). Live data is fetched when needed and cached in memory.
- **Quotas are shared.** All site visitors share this backend's upstream limits, so everything is cached, and per-county APIs are only called when someone opens that county.
- **Upstream failures don't break the site.** If a source is down, the API still returns baseline scores and says that live data is unavailable. It never reports "no alerts" when it couldn't check.

The frontend uses this API for all of its risk data. See [section 10](#10-how-the-frontend-connects).

## 2. Running it

No API keys are needed. These commands are for PowerShell, from the repo root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

- Interactive API docs: <http://localhost:8000/docs>
- Status of each source: <http://localhost:8000/api/health>

It was developed on Python 3.14 and needs at least 3.11. Run commands from `backend/`, or the `app` package won't be found.

To refresh the static data, which takes under a minute:

```powershell
python -m scripts.build_reference_data
```

### Configuration

Everything is optional. To override a default, copy [`backend/env.example`](../backend/env.example) to `backend/.env`. The example file isn't named `.env.example` because the repo's `.gitignore` excludes `.env.*`. All settings are defined in [`app/config.py`](../backend/app/config.py).

## 3. Structure

```
backend/
  requirements.txt
  env.example
  data/reference.json            Static data; generated, committed, 1.1 MB
  scripts/
    build_reference_data.py      Generates reference.json
  app/
    main.py                      App factory; creates everything at startup
    config.py                    Settings
    schemas.py                   Response models that mirror frontend/lib/types.ts
    dependencies.py              FastAPI dependencies
    routers/                     HTTP layer only, one file per endpoint group
    services/
      reference.py               Loads reference.json
      snapshot.py                National scores from the nationwide feeds
      risk.py                    Builds StateRecord, CountyRecord and MapValue
      search.py                  Resolves text to counties
    clients/                     One file per external API; fetch and parse only
      nws.py, usgs.py, nwps.py, open_meteo.py
    domain/                      Pure rules with no I/O
      hazards.py                 Hazard list; alert and FEMA mapping tables
      scoring.py                 Every scoring formula and threshold
      geo.py                     Distance calculation
    core/
      cache.py                   TTL cache with stale fallback
```

Dependencies point one way: `routers` call `services`, which call `clients` and `domain`. Clients don't know about scoring, and `domain` doesn't know about HTTP.

### Request flow

```
GET /api/counties/06065
  routers/counties.py
    RiskService.get_county
      get_snapshot()          NWS alerts + USGS quakes, all counties (cached)
      _conditions_for()       Open-Meteo, this county (cached 30 min)
      _gauges_for()           NWPS, this county (cached 15 min)
      merge signals, score, write warnings
    returns CountyRecord
```

## 4. Endpoints

All are `GET`, under `/api`. JSON field names are camelCase.

| Endpoint | Returns | Errors |
|---|---|---|
| `/api/states/{code}` | `StateRecord`. The code is case-insensitive. Includes DC and PR | 404 unknown code |
| `/api/counties/{fips}` | `CountyRecord` | 404 unknown FIPS, 422 not five digits |
| `/api/map-values?level=&metric=` | `MapValue[]` | 422 invalid value |
| `/api/search?q=&limit=` | `SearchResult[]`. Empty when nothing matches | 422 missing `q` |
| `/api/health` | Status of each source | None |

**`/api/map-values` parameters:**

- `level`: `state` (default, 52 values) or `county` (3,221 values, about 138 KB).
- `metric`: `compositeScore` (default), `wildfire`, `earthquake`, `flood`, `severeStorm`, `hurricane` or `tornado`.

Expected-loss metrics such as `lossPerPerson` **aren't supported** and return 422. See [section 9](#9-known-limitations).

**`/api/search`:** county names are matched locally. Anything else, such as a city or ZIP code, goes to a geocoder. A trailing state narrows results.

| Query | Result |
|---|---|
| `Riverside` | Riverside County, CA |
| `Palm Springs, CA` | Riverside County, CA, with `matchedPlace: "Palm Springs, California"` |
| `92262` | Riverside County, CA, with `matchedPlace` |
| `Washington` | Up to `limit` counties, largest first |

### Types

[`app/schemas.py`](../backend/app/schemas.py) mirrors [`frontend/lib/types.ts`](../frontend/lib/types.ts), which is reproduced in [section 4 of the frontend doc](frontend-doc.md#4-data-contract). Live responses, including ones captured during a simulated outage, were checked against those types with `tsc`.

### Example: `/api/counties/06037` (shortened)

```json
{
  "name": "Los Angeles County",
  "state": "California",
  "stateCode": "CA",
  "compositeScore": 87,
  "tier": "Critical",
  "fips": "06037",
  "pop": "9,829,544",
  "activeAlert": "Red Flag Warning issued November 6 at 3:14PM PST until November 7 at 6:00PM PST by NWS Los Angeles/Oxnard CA (+2 more)",
  "hazards": [
    { "name": "Wildfire", "score": 100, "tier": "Critical", "warning": "Red Flag Warning active" },
    { "name": "Severe Storm", "score": 58, "tier": "Elevated", "warning": "Next 24h: gusts to 44 mph" }
  ]
}
```

### Frontend rules the API follows

- Scores are whole numbers from 0 to 100.
- Populations are preformatted strings. Unknown is `"N/A"`.
- `hazards` is always present and sorted highest first.
- `activeAlert` and `primaryAlert` are omitted when there are no alerts, and hold the "unavailable" text below during an NWS outage, when `activeAlertCount` is also omitted.
- County names include their suffix (`"Orleans Parish"`), and `state` is the full name.
- FIPS codes are strings with leading zeros.

## 5. Scoring model

All of this is in [`app/domain/scoring.py`](../backend/app/domain/scoring.py) and [`app/domain/hazards.py`](../backend/app/domain/hazards.py).

**These are decisions made for the demo, not validated risk science.** [`human-review.md`](human-review.md) lists each one with alternatives.

### Hazard score

```
hazard score = 50% baseline + 50% live
```

This is the split that `/about` on the site describes. With no live signal, a hazard therefore can't exceed 50.

There are six hazards: Wildfire, Earthquake, Flood, Severe Storm, Hurricane and Tornado. The list covers the frontend's filter pills, plus Severe Storm from its mock data.

### Baseline (0 to 100)

The baseline is a county's percentile rank for that hazard since 2006, among counties that have had the hazard at all. A county with no history scores 0. Excluding unaffected counties stops rare hazards being inflated: one tornado declaration would otherwise rank at the 93rd percentile.

| Hazard | What's counted |
|---|---|
| Earthquake | USGS M4.5+ earthquakes within 60 miles of the county's bounding box |
| All others | Distinct FEMA major disaster and fire declarations covering the county |

FEMA emergency declarations (`EM`) are excluded, because many cover other states' evacuees rather than local damage. COVID-19 and other "Biological" incidents are also excluded. `FEMA_INCIDENT_HAZARDS` maps FEMA's incident types to hazards.

### Live (0 to 100)

Each source produces a `LiveSignal` of hazard, score and explanatory text. For each hazard, the **strongest signal wins**, and its text becomes that hazard's `warning`. With no signal, the warning describes the baseline instead.

| Source | Rule | Live score |
|---|---|---|
| NWS alerts | Each event type has a fixed score in `ALERT_RULES`, e.g. Red Flag Warning | 100 |
| | Flood Warning | 85 |
| | Wind Advisory | 35 |
| USGS, past 7 days | M5.5+ within 20 mi of the county | 100 |
| | M4.5+ within 30 mi | 75 |
| | M3.0+ within 30 mi | 45 |
| Open-Meteo, next 24h | One hour with humidity ≤ 15% and gusts ≥ 25 mph (Wildfire) | 80 |
| | Gusts ≥ 58 mph (Severe Storm) | 100 |
| | Gusts ≥ 40 mph (Severe Storm) | 70 |
| NWPS gauges | Major / moderate / minor flood, observed or forecast (Flood) | 100 / 85 / 70 |
| | Action stage (Flood) | 40 |

The earthquake and weather thresholds come from the data dictionary on `/about`. Weather below its thresholds scores 0 but still supplies the warning text.

### Composite score

```
composite = 60% highest hazard + 40% mean of the top three hazards
```

A plain average would let hazards that don't apply to a place hide the one that does.

### Tiers

| Tier | Score |
|---|---|
| Critical | 75 and up |
| Elevated | 50 to 74 |
| Moderate | 30 to 49 |
| Low | Below 30 |

The cutoffs at 75 and 50 line up with the frontend's hazard bar colours.

### States

A state's hazard scores are the population-weighted average of its counties, and its composite is calculated from those. Puerto Rico has no population data, so its municipios are weighted equally.

### Worked example: Riverside County

Severe Storm has a baseline of 31 and a gust forecast above 40 mph, which gives a live score of 70. So `0.5 × 31 + 0.5 × 70 ≈ 50`. With top hazards of 50, 50 and 44, the composite is `0.6 × 50 + 0.4 × 48 ≈ 49`.

### Why a county's map colour can differ from its sidebar score

This is a deliberate trade-off:

| | Baseline | NWS alerts | USGS | Open-Meteo | NWPS |
|---|---|---|---|---|---|
| `/map-values`, `/states/{code}` | Yes | Yes | Yes | No | No |
| `/counties/{fips}` | Yes | Yes | Yes | Yes | Yes |

Weather and gauges can't be fetched for 3,221 counties (see [`apis-usage.md`](apis-usage.md)). Because they only score above advisory thresholds, the two numbers usually match: 9 of 12 sampled counties were identical in testing, and the other three differed by 2 to 4 points. They differ when local conditions are hazardous but no NWS alert covers it. Riverside was 49 in the sidebar and 47 on the map in that test, because of a gust forecast above 40 mph. The gap can be larger for a county whose hazards are otherwise low.

## 6. Caching and failure handling

[`core/cache.py`](../backend/app/core/cache.py) is an in-memory, per-process cache. Its contents are lost on restart, and the snapshot is refilled in the background at startup.

| Cache key | Lifetime |
|---|---|
| `nws:alerts`, `usgs:recent` | 5 minutes |
| `snapshot` (computed scores) | 1 minute |
| `openmeteo:forecast:{fips}` | 30 minutes |
| `nwps:gauges:{fips}` | 15 minutes |
| `openmeteo:geocode:{query}` | 24 hours |

When an upstream call fails:

1. If the cached value is less than **1 hour** old, it's served. Older data isn't used, so old alerts never appear as current.
2. Otherwise the source counts as unavailable, and scoring carries on without it.
3. That key isn't retried for 60 seconds, so a dead upstream doesn't slow every request.

What users see when a source is unavailable:

| Field | Text |
|---|---|
| `activeAlert`, `primaryAlert` | `"NWS alert feed unavailable, so alert status is unknown"` |
| Affected hazards' `warning` | `"4 federal flood declarations since 2006 (live data unavailable)"` |

Scores are lower during an outage, because live signals are missing. This was tested with all upstream traffic blocked: every endpoint still returned 200, except that geocoder-backed searches returned no results.

**NWPS has its own backoff.** A 429 pauses all NWPS calls for 5 minutes, for every county, because its limits aren't published. See [`apis-usage.md`](apis-usage.md).

## 7. Reference data

[`scripts/build_reference_data.py`](../backend/scripts/build_reference_data.py) produces `data/reference.json`:

```jsonc
{
  "meta": { "generatedAt": "...", "baselineSinceYear": 2006, "quakeMinMagnitude": 4.5, "quakeRadiusMiles": 60 },
  "states": {
    "CA": { "name": "California", "declarations": { "wildfire": 217, "flood": 6, "...": 0 } }
  },
  "counties": {
    "06065": {
      "name": "Riverside County", "bareName": "Riverside", "state": "CA",
      "lat": 33.7435, "lon": -115.9957,
      "bbox": [-117.6737, 33.4259, -114.4349, 34.0797],   // west, south, east, north
      "population": 2458395,
      "counts":   { "wildfire": 21, "earthquake": 47, "...": 0 },
      "baseline": { "wildfire": 100, "earthquake": 89, "...": 0 }
    }
  }
}
```

It uses each county's **largest polygon** for the centroid and box, so that distant islands don't stretch them. Earthquake distance is measured to the box rather than the centroid, since a centroid can be far from most of a large county.

County IDs come from the same GeoJSON file the frontend draws, so every `MapValue.id` matches a polygon. Population is missing for Puerto Rico's 78 municipios and for Bedford city, VA (`51515`), which no longer exists. Those show `"N/A"`.

## 8. Common changes

| To change | Edit |
|---|---|
| Which alerts count, or their scores | `ALERT_RULES` in `domain/hazards.py` |
| Which FEMA incidents count | `FEMA_INCIDENT_HAZARDS` in `domain/hazards.py`, then rebuild the reference data |
| Tier cutoffs, weights or thresholds | `domain/scoring.py` |
| Cache lifetimes, CORS origins, User-Agent | `app/config.py` or `backend/.env` |
| A response field | `app/schemas.py` and `frontend/lib/types.ts`, together |

**To add a hazard:** add it to `Hazard` and `_LABELS`, add its table entries, add it to `MapMetric` in `services/risk.py`, then rebuild the reference data.

**To add a live source:** add a client in `clients/` that returns plain dataclasses, fetch it through the cache in `RiskService`, convert the result to `LiveSignal`s and merge them. If it's nationwide, do this in `snapshot.py` so the map benefits. Then document it in `apis-usage.md`.

## 9. Known limitations

- **FEMA data is declarations, not the National Risk Index.** The NRI isn't one of the chosen APIs, which is why expected-loss metrics are missing. The site's wording was updated to match.
- **Baseline is a proxy.** Declarations measure federal response rather than physical risk, and they depend on how FEMA labels events: many tornadoes are filed under "Severe Storm".
- **Weather is sampled at one point,** the county's centroid. For large counties this can be far from where people live. Riverside's is in the desert.
- **County boundaries are approximate.** Quake and gauge lookups use bounding boxes, so they can catch events just outside a county.
- **Tribal lands.** FEMA declarations for tribal areas have no county, so they count toward the state's declaration total but not toward any county's baseline.
- **River flooding hasn't been seen live.** Live NWPS responses were parsed without errors, but none of the responses reviewed showed a gauge above flood stage, and NWPS then rate-limited us. That branch was only tested with sample data.
- **The cache is per-process.** Running several workers multiplies upstream calls.
- **Informational only.** This isn't a substitute for official warnings, as the site's footer already says.

`climate_data.json` in the repo root isn't used by the backend. It only covers California, and this backend gets its weather from Open-Meteo directly.

## 10. How the frontend connects

The browser calls this API directly, through [`frontend/lib/api.ts`](../frontend/lib/api.ts). [The frontend doc](frontend-doc.md#calls-by-user-action) lists which user action makes which call.

- The base URL is `NEXT_PUBLIC_API_URL`, which defaults to `http://localhost:8000/api`.
- CORS allows `http://localhost:3000`. When deploying, add the site's origin to `CORS_ORIGINS` and set `NEXT_PUBLIC_API_URL` before building the frontend.

## 11. Guidance for coding agents

- Keep `app/schemas.py` and `frontend/lib/types.ts` in sync. To check, write a real response into a `.ts` file as `const x: CountyRecord = {...}` and run `tsc` on it.
- Put scoring rules in `domain/`, and don't add I/O there.
- Don't add per-county upstream calls to `/map-values`. There are 3,221 counties, and the quotas are shared.
- Never replace "unavailable" text with "no alerts". The distinction matters on a safety site.
- Avoid repeatedly calling NWPS while testing. It rate-limited us after a few dozen requests in one session.
- After changing `domain/hazards.py` mappings for FEMA, rebuild `data/reference.json` and commit it.
- Update this doc and `apis-usage.md` when you change endpoints, sources or scoring.
