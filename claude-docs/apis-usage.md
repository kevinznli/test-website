# External API usage

Audience: developers and coding agents working on the backend.

This doc lists exactly what the backend calls and what it does with the results. For how the pieces fit together, see [`backend-doc.md`](backend-doc.md). For the list of APIs the team chose, see [`apis.md`](apis.md).

Snapshot: 2026-11-07. Limits are as documented or observed on that date.

## Summary

| API | Called from | When | Scope | Max frequency | Used for |
|---|---|---|---|---|---|
| [NWS alerts](#nws-active-alerts) | Runtime | On demand, cached 5 min | One call, whole US | 288/day | Live alerts for all hazards except earthquake |
| [USGS recent](#usgs-recent-earthquakes) | Runtime | On demand, cached 5 min | One call, worldwide | 288/day | Live earthquake signal |
| [Open-Meteo forecast](#open-meteo-forecast) | Runtime | County opened, cached 30 min | One county | 48/day per county | Wind and fire weather |
| [NWPS gauges](#nwps-gauges) | Runtime | County opened, cached 15 min | One county's box | 96/day per county | River flood status |
| [Open-Meteo geocoding](#open-meteo-geocoding) | Runtime | Search with no county match, cached 24 h | One query | 1/day per query | City and ZIP search |
| [OpenFEMA](#openfema-disaster-declarations) | Build script | Manual | Since 2006 | 4 calls per build | Historical baseline |
| [USGS history](#usgs-earthquake-history) | Build script | Manual | US, since 2006 | 1 call per build | Earthquake baseline |
| [Census population](#census-population-estimates) | Build script | Manual | All counties | 2 files per build | Population |
| [County GeoJSON](#county-boundaries) | Build script | Manual | All counties | 1 file per build | County list, locations |

**None of them need an API key.** Every request sends the header `User-Agent: UCSD-Risk-Resource-NotForProfit`, set by `USER_AGENT` in [`app/config.py`](../backend/app/config.py). NWS rejects requests without a `User-Agent` (tested: 403).

The last three rows and geocoding are **not in `apis.md`**. They were added because none of the listed APIs provide population, county names or a way to resolve cities and ZIP codes.

## Why some APIs are only used per county

| API | Whole-country cost | Decision |
|---|---|---|
| NWS | 1 call, about 0.6 s, 1.8 MB | Used for the map |
| USGS | 1 call, about 0.7 s, 270 KB | Used for the map |
| NWPS | 1 call, **about 44 s, 13 MB** | Too slow, so per county only |
| Open-Meteo | **3,221 calls per refresh**, against a limit of 10,000/day | Per county only |

As a result, the map doesn't include weather or gauge data. [`backend-doc.md`](backend-doc.md#why-a-countys-map-colour-can-differ-from-its-sidebar-score) explains the effect.

## Runtime APIs

### NWS active alerts

Code: [`app/clients/nws.py`](../backend/app/clients/nws.py)

```
GET https://api.weather.gov/alerts/active?status=actual&message_type=alert,update
```

| Parameter | Why |
|---|---|
| `status=actual` | Excludes test and exercise alerts |
| `message_type=alert,update` | Excludes cancellations |

**Fields read**, from `features[].properties`:

| Field | Used for |
|---|---|
| `id` | Counting each alert once per state |
| `event` | Looking up hazard and score in `ALERT_RULES`; `primaryAlert` text |
| `severity` | Breaking ties between alerts |
| `headline` | `CountyRecord.activeAlert`. Falls back to `event` |
| `geocode.SAME[]` | Finding affected counties |

**Parsing `SAME` codes:** they're six digits, a subdivision digit followed by the FIPS, so `006065` is county `06065`. Marine zones like `057131` appear too, and are ignored because they match no county.

**Scoring:** `event` is looked up in `ALERT_RULES`. Events not listed, such as Frost Advisory, add no score, but still count toward `activeAlertCount` and can appear as a county's active alert.

**Limits:** rate limits aren't published. NWS says a request over the limit can be retried, typically within 5 seconds, and that proxies are more likely to hit it. NWS also says the `User-Agent` requirement will be replaced with an API key in the future, so this may need one later.

**If it fails:** alert fields say status is unknown, and non-earthquake warnings add "(live data unavailable)".

### USGS recent earthquakes

Code: [`app/clients/usgs.py`](../backend/app/clients/usgs.py)

```
GET https://earthquake.usgs.gov/fdsnws/event/1/query
    ?format=geojson&eventtype=earthquake&starttime={7 days ago}&minmagnitude=3.0
```

`minmagnitude=3.0` is the smallest magnitude the scoring uses.

**Fields read**, from `features[]`:

| Field | Used for |
|---|---|
| `geometry.coordinates` | Distance to each county's box. The order is longitude, latitude, depth |
| `properties.mag` | Scoring (`quake_score`) and warning text |
| `properties.place` | Warning text, e.g. "M4.9 earthquake 9 km N of Delta, B.C., MX, in the past week" |

**Limits:** a query can return at most 20,000 results.

**If it fails:** the earthquake warning adds "(live data unavailable)".

### Open-Meteo forecast

Code: [`app/clients/open_meteo.py`](../backend/app/clients/open_meteo.py)

```
GET https://api.open-meteo.com/v1/forecast
    ?latitude={county centroid}&longitude={county centroid}
    &hourly=wind_gusts_10m,relative_humidity_2m,precipitation
    &wind_speed_unit=mph&precipitation_unit=inch&forecast_hours=24
```

**Fields read**, from `hourly`. Hours with a missing gust or humidity value are skipped.

| Field | Derived value | Used for |
|---|---|---|
| `wind_gusts_10m` | Highest gust | Severe Storm: 40 mph scores 70, 58 mph scores 100 |
| `relative_humidity_2m` | Lowest humidity | Warning text |
| Both, hour by hour | Any hour with RH ≤ 15% and gusts ≥ 25 mph | Wildfire: scores 80 |
| `precipitation` | 24-hour total | Flood warning text only; never scored |

**Limits and terms:** the free tier allows 600 calls/minute, 5,000/hour, 10,000/day and 300,000/month per IP address. It's for **non-commercial use only**: a site with ads or subscriptions would need a paid plan. Each call here costs 1.0, according to the `x-ratelimit-cost` response header.

**If it fails:** Wildfire and Severe Storm warnings add "(live data unavailable)".

### NWPS gauges

Code: [`app/clients/nwps.py`](../backend/app/clients/nwps.py)

```
GET https://api.water.noaa.gov/nwps/v1/gauges
    ?bbox.xmin={west}&bbox.ymin={south}&bbox.xmax={east}&bbox.ymax={north}&srid=EPSG_4326
```

The box is the county's bounding box from `reference.json`.

**Fields read**, from `gauges[]`:

| Field | Used for |
|---|---|
| `name` | Warning text, e.g. "Elevated river stage at ..." |
| `lid` | Fallback if `name` is missing |
| `status.observed.floodCategory` | Scoring |
| `status.forecast.floodCategory` | Scoring. The worse of the two counts |

| `floodCategory` | Live flood score |
|---|---|
| `major` | 100 |
| `moderate` | 85 |
| `minor` | 70 |
| `action` | 40 |
| `no_flooding` | 0 |
| Anything else (`not_defined`, `low_threshold`, `obs_not_current`, `fcst_not_current`, `out_of_service`) | Gauge is ignored |

Many gauges aren't useful: in a nationwide check, about 44% of 12,961 reported something other than a flood status.

**Limits:** none are published, but **we were rate-limited in practice**. After a few dozen requests in a session, including one full download, NWPS returned 429 with no `Retry-After` header. It kept doing so for a while, then recovered later that day. So:

- A 429 makes the client pause all NWPS calls for 5 minutes (`RATE_LIMIT_BACKOFF_SECONDS`).
- Don't call this API repeatedly while testing.
- Before a live demo, open `/api/health` and check that `nwps` isn't `degraded`.

**If it fails:** the Flood warning adds "(live data unavailable)". NWS flood alerts still score normally, so flooding with an active alert is still reflected.

### Open-Meteo geocoding

Code: [`app/clients/open_meteo.py`](../backend/app/clients/open_meteo.py), used by [`app/services/search.py`](../backend/app/services/search.py)

```
GET https://geocoding-api.open-meteo.com/v1/search
    ?name={query}&count=10&countryCode=US&language=en&format=json
```

It's only called when the search text doesn't match a county name. The query has any trailing state removed first, so `Palm Springs, CA` searches for `Palm Springs`.

**Fields read**, from `results[]`:

| Field | Used for |
|---|---|
| `name` | `matchedPlace` |
| `admin1` | State. Filters results and identifies the county |
| `admin2` | County name, matched to a FIPS code using state and name |

Results without `admin1` or `admin2` are skipped.

**If it fails:** search returns only local county matches, which may be an empty list.

## Build-time sources

Only [`scripts/build_reference_data.py`](../backend/scripts/build_reference_data.py) uses these, and the output is committed. **A running API never calls them**, so they can't affect a demo.

### OpenFEMA disaster declarations

```
GET https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries
    ?$select=disasterNumber,fipsStateCode,fipsCountyCode,designatedArea,incidentType,declarationType
    &$filter=declarationDate ge '2006-01-01T00:00:00.000Z'
    &$orderby=id&$top=10000&$skip={rows so far}
```

Pages are fetched until one comes back short. There were 39,483 rows in 4 calls on the snapshot date.

| Field | Used for |
|---|---|
| `incidentType` | Mapped to a hazard by `FEMA_INCIDENT_HAZARDS`. Unmapped types are dropped |
| `declarationType` | `EM` rows are dropped |
| `fipsStateCode` + `fipsCountyCode` | The county |
| `designatedArea` | `"Statewide"` counts for every county in that state |
| `disasterNumber` | Counting distinct disasters, because one disaster has many rows |

**Watch out for county code `000`: it doesn't mean statewide.** Of 1,080 such rows since 2006, only 10 are `"Statewide"`. Most are tribal lands, which count toward the state total but no county.

Produces `counts` and `baseline` for each county, and `declarations` for each state.

**Limits:** up to 10,000 records per call. No rate limit is stated.

### USGS earthquake history

```
GET https://earthquake.usgs.gov/fdsnws/event/1/query
    ?format=geojson&eventtype=earthquake&starttime=2006-01-01&minmagnitude=4.5
    &minlatitude=17&maxlatitude=72&minlongitude=-180&maxlongitude=-64
```

The box covers the US including Alaska, Hawaii and Puerto Rico. This returned 5,380 earthquakes on the snapshot date, well under the 20,000 limit. M4.0 would return 15,207, which is uncomfortably close to it.

Only `geometry.coordinates` is read, to count earthquakes within 60 miles of each county's box. That produces the earthquake `counts` and `baseline`.

### Census population estimates

| File | Column |
|---|---|
| [`co-est2021-alldata.csv`](https://www2.census.gov/programs-surveys/popest/datasets/2020-2021/counties/totals/co-est2021-alldata.csv) | `POPESTIMATE2021` |
| [`co-est2019-alldata.csv`](https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/totals/co-est2019-alldata.csv) | `POPESTIMATE2019`, only for codes missing from 2021 |

Only rows with `SUMLEV` of `050` (counties) are used, and the files are Latin-1 encoded. They're old on purpose: newer files replace Connecticut's counties with planning regions, which no longer match the GeoJSON polygons.

Used for `pop`, `population`, state population weighting, and ordering search results. Puerto Rico isn't covered.

### County boundaries

```
GET https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json
```

This is the same file the frontend draws, so IDs always match.

| Field | Used for |
|---|---|
| `id` | FIPS code |
| `properties.NAME` | `bareName` |
| `properties.LSAD` | The name's suffix, e.g. `Parish` or `CA` for Census Area |
| `properties.STATE` | State FIPS |
| `geometry` | Centroid and bounding box |

It's an older file, so two retired codes are mapped to their current ones in `FIPS_RENAMES`.

## Adding or changing an API call

1. Put the HTTP call and parsing in `app/clients/`, returning plain dataclasses.
2. Fetch it through `TTLCache`, so that it's cached and failures are handled.
3. Check its limits against the worst case: every visitor shares one quota.
4. Update this doc: the summary table, the exact request, and every field read.
