# Risk Resource frontend: design and data contract

Audience: developers and coding agents working on the frontend or the backend that feeds it.

Snapshot: 2026-11-07. Line references will drift. If this doc and the code disagree, the code wins, and this doc should be updated.

Related docs:

- [`backend-doc.md`](backend-doc.md): the API, scoring and caching.
- [`human-review.md`](human-review.md): decisions that still need human review, including the site's wording and scoring.

## 1. Summary

Risk Resource is a prototype site for US natural disaster risk, with three routes: a landing page, an interactive risk map and a methodology page. The footer lists DS3 at UCSD and HDSI as affiliations.

**All risk data now comes from the FastAPI backend.** There's no mock data, so the backend must be running for scores to appear. Without it, the site still loads and says scores are unavailable.

## 2. Stack and commands

| Area | Details |
|---|---|
| Framework | Next.js 16.4.3 (App Router, Turbopack), React 19.3 |
| Language | TypeScript in strict mode, with the path alias `@/*` pointing at `frontend/*` |
| Styling | Tailwind CSS v4, CSS-first. There is no `tailwind.config` or PostCSS config; it runs through the `@tailwindcss/turbopack` loader in `next.config.ts` |
| Map | Leaflet 1.9 and react-leaflet 5 |
| Next flags | `cacheComponents`, `partialPrefetching`, `experimental.agentFeedback` |

To run the whole site, start the backend first (see [`backend-doc.md`](backend-doc.md#2-running-it)), then from `frontend/`:

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build
npm run lint
npx tsc --noEmit   # run after a build: LayoutProps comes from generated route types
```

| Check at this snapshot | Result |
|---|---|
| `npm run build` | Passes; all routes are static shells that fetch data in the browser |
| `tsc --noEmit` | Passes after a build. Before one, it fails with `Cannot find name 'LayoutProps'` |
| `npm run lint` | Passes |
| Tests and CI | None exist |

**Environment variables,** both optional, set in `frontend/.env.local`. The `NEXT_PUBLIC_` prefix means values ship to browsers and are fixed at build time.

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Backend base URL |
| `NEXT_PUBLIC_CARTO_API_KEY` | None | CARTO basemap. Falls back to OpenStreetMap tiles |

**Next.js version:** [`frontend/AGENTS.md`](../frontend/AGENTS.md) warns that this version differs from older training data. Read `node_modules/next/dist/docs/` before writing Next-specific code. These behaviours affect this app:

- A static page calling `useSearchParams` needs a `<Suspense>` boundary, or the production build fails. That's why `app/map/page.tsx` wraps `MapExplorer`.
- Routes stay mounted but hidden after navigation, so state survives, and effects re-run when the route becomes visible again.
- `next dev` allows one server per project. A second one exits with an error and points to the first.

## 3. Structure

```
frontend/
  app/
    layout.tsx             Root layout and fonts
    page.tsx               /       Landing page
    map/page.tsx           /map    Server shell; Suspense around MapExplorer
    about/page.tsx         /about  Methodology, static content
  components/
    common/                Navigation, Footer
    home/
      MiniMapPreview.tsx   Live data for Riverside County
      HeroSection.tsx      Search form; links to /map?q=
      StatsSection.tsx, FeaturesGrid.tsx, CtaBanner.tsx    Static content
    map/
      MapExplorer.tsx      Owns all /map state and data fetching
      RiskLeafletMap.tsx   Leaflet map; fetches GeoJSON; loaded with ssr: false
      MapControls.tsx      View toggle, hazard pills; hosts CountySearch
      CountySearch.tsx     Search box and results list
      MapLegend.tsx        Tier legend
      StateInspector.tsx, CountyInspector.tsx    Sidebars
      HazardList.tsx       Hazard rows, shared by both sidebars
      InspectorPlaceholder.tsx    Sidebar loading and error states
  lib/
    api.ts                 Every backend call
    types.ts               API response types
    tiers.ts               Tier colours and legend text
```

### `/map` data flow

`MapExplorer` holds all the state, with no global store or data-fetching library:

| State | Type | Purpose |
|---|---|---|
| `viewMode` | `'states' \| 'counties'` | Which layer shows, and which map values to fetch |
| `metric` | `MapMetric` | Which score colours the map |
| `selection` | `{ level, id }` | What the sidebar shows. Defaults to California |
| `focus` | `{ id, nonce }` | Asks the map to zoom to a place |
| `loaded`, `mapResult` | Record or values, with a request key | Fetched data |

```
MapExplorer
├─ MapControls ─ CountySearch ── onSelect(result) ──> handleSearchSelect
├─ RiskLeafletMap (viewMode, values, focus) ── onSelectFeature(id, level) ──> handleFeatureSelect
├─ MapLegend (title)
└─ CountyInspector, StateInspector or InspectorPlaceholder
```

**Stale responses:** each fetch effect aborts when its inputs change, and each result is stored with the key of its request. A stored result whose key doesn't match the current request counts as loading, so old data never appears under a new selection.

### Calls by user action

| Action | Backend call | Then |
|---|---|---|
| Open `/map`, switch view, or pick a hazard | `GET /map-values?level=&metric=` | Recolours the map |
| Open `/map`, or click a state | `GET /states/{code}` | `StateInspector` |
| Click a county, or a search result | `GET /counties/{fips}` | `CountyInspector` |
| Search, or arrive with `?q=` | `GET /search?q=` | Opens the first result; lists the others |
| Open `/` | `GET /counties/06065` | `MiniMapPreview` |

### External requests

The browser fetches each GeoJSON file the first time that layer is needed.

| Layer | Source | Size | Feature ID | Properties |
|---|---|---|---|---|
| States | [folium `us_states.json`](https://raw.githubusercontent.com/python-visualization/folium-example-data/main/us_states.json) | 88 KB, 50 features | `"CA"` | `name: "California"` |
| Counties | [plotly `geojson-counties-fips.json`](https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json) | 3.2 MB, 3,221 features | `"06065"` | `NAME: "Riverside"`, `LSAD: "County"`, `STATE: "06"`, `COUNTY: "065"` |

Both are unpinned files on third-party `main`/`master` branches. Consider self-hosting them.

### Visual conventions

- Risk colours come only from [`lib/tiers.ts`](../frontend/lib/tiers.ts), and the backend assigns tiers. Don't work out a tier from a score on the frontend.
- Other colours are hardcoded hex values in Tailwind classes; there are no shared tokens.
- Page backgrounds are light (`#fcfbf7`) with a dark navigation bar and footer.
- `globals.css` sets `body` to Arial, so Geist Sans isn't applied to body text. The `font-mono` class does use Geist Mono.

## 4. Data contract

The source of truth is [`frontend/lib/types.ts`](../frontend/lib/types.ts), which mirrors [`backend/app/schemas.py`](../backend/app/schemas.py). **Change them together.**

```ts
export type Tier = 'Low' | 'Moderate' | 'Elevated' | 'Critical';
export type MapLevel = 'state' | 'county';
export type MapMetric =
  | 'compositeScore' | 'wildfire' | 'earthquake' | 'flood'
  | 'severeStorm' | 'hurricane' | 'tornado';

export interface HazardItem {
  name: string;
  score: number;       // Whole number, 0 to 100
  tier: Tier;
  warning: string;
}

export interface StateRecord {
  code: string;        // Matches the state GeoJSON feature ID, e.g. "CA"
  name: string;
  compositeScore: number;
  tier: Tier;
  countiesCount: number;
  population: string;  // Preformatted, e.g. "39,501,350", or "N/A"
  activeAlertCount?: number; // Absent when the NWS feed is unavailable
  primaryAlert?: string;     // Absent when there are no active alerts
  hazards: HazardItem[];     // Highest score first
}

export interface CountyRecord {
  name: string;        // Includes the suffix, e.g. "Orleans Parish"
  state: string;       // Full name, e.g. "California"
  stateCode: string;   // e.g. "CA"
  compositeScore: number;
  tier: Tier;
  fips: string;        // Matches the county GeoJSON feature ID, e.g. "06065"
  pop: string;         // Preformatted, e.g. "2,458,395", or "N/A"
  activeAlert?: string; // Absent when there are no active alerts
  hazards: HazardItem[]; // Highest score first
}

export interface MapValue {
  id: string;          // State code or FIPS, matching the GeoJSON feature ID
  value: number;       // Whole number, 0 to 100
  tier: Tier;
}

export interface SearchResult {
  fips: string;
  name: string;
  state: string;
  stateCode: string;
  matchedPlace?: string; // Present when a city or ZIP led to this county
}
```

### Rules the types don't express

- **Alerts have three states.** With alerts, the field holds their text. With none, it's absent, and the UI shows "No active NWS alerts". If the NWS feed is down, it holds "NWS alert feed unavailable, so alert status is unknown", and `activeAlertCount` is absent, which the UI shows as "Unknown". Never treat an outage as "no alerts".
- **Join on IDs, never on names.** County GeoJSON names have no suffix, and 444 names are shared by more than one county ("Washington" appears 31 times).
- **FIPS codes are strings.** As numbers, `06065` would become `6065` and match nothing.
- **Hazards render in array order,** and the UI doesn't sort them. `hazards[0]` is the "Top Hazard".
- **Values render exactly as sent.** The UI doesn't round or add separators.
- **A county's sidebar score can differ from its map value,** because only the sidebar includes weather and river gauges. See [`backend-doc.md`](backend-doc.md#why-a-countys-map-colour-can-differ-from-its-sidebar-score).

### Local shapes

```ts
// components/map/RiskLeafletMap.tsx
interface MapFocus { id: string; nonce: number; }
interface Props {
  viewMode: 'states' | 'counties';
  values: MapValue[] | null;   // null shows every polygon as "No data"
  focus: MapFocus | null;
  onSelectFeature: (id: string, level: MapLevel) => void;
}

// components/map/CountySearch.tsx
interface Props { initialQuery: string | null; onSelect: (result: SearchResult) => void; }
```

`DataSource` in `app/about/page.tsx` describes that page's hardcoded source list and isn't API data.

## 5. Working with the map

react-leaflet has three behaviours that are easy to get wrong:

- It re-applies `style` whenever the prop's identity changes, so styles are memoized to avoid restyling 3,221 polygons on every render.
- It reads `data` only when a layer is created. New boundary data needs a new `key`.
- It reads `onEachFeature` only at creation, so those handlers keep the first render's closures. `RiskLeafletMap` passes them the latest values and callback through refs.

Other things to know:

- Leaflet touches `window`, so anything importing it must stay behind `dynamic(..., { ssr: false })` in a client component.
- Leaflet rounds the initial `zoom={3.5}` to 4, because of its default `zoomSnap`.
- Overlays above the map need a z-index above Leaflet's panes. The search list uses `z-[1000]`.

## 6. Error states

| Failure | What the user sees |
|---|---|
| Backend down, map values | Red banner with "Try again"; all polygons grey as "No data" |
| Backend down, sidebar | "Couldn't load risk details" with "Try again" |
| Backend down, search | "Search failed. The risk API may be offline." |
| Backend down, home preview | "Live scores are unavailable right now." |
| Search finds nothing | "No US county found for ..." with the current view kept |
| GeoJSON fails to load | "Couldn't load map boundaries" over the map |
| One upstream source down | Handled by the backend: scores still load, with "(live data unavailable)" in the affected warnings |

These were checked in a browser with the backend stopped, except the GeoJSON failure.

## 7. Known issues

- **DC and Puerto Rico** have no state polygons, so they're only reachable through the county view or search. The API does return them at state level.
- **Page title:** the browser tab still says "Create Next App" ([`layout.tsx:16-17`](../frontend/app/layout.tsx#L16-L17)).
- **Unused dependencies:** `lucide-react` and `autoprefixer`. `@types/leaflet` is in `dependencies` rather than `devDependencies`.
- **Empty hero search** goes to Riverside County, since `HeroSection` defaults the query.
- **The selected county isn't highlighted** on the map.
- **Duplicated values:** the tier ranges in `lib/tiers.ts` and the formula on `/about` repeat values from the backend. Update them if the scoring changes.

## 8. Guidance for coding agents

- Read this doc and `lib/types.ts` before changing anything that touches data.
- Call the backend only through `lib/api.ts`, and keep risk colours in `lib/tiers.ts`.
- Don't hardcode scores, statuses or "live" labels. The site previously showed fake live indicators, which matters on a safety site.
- `/about` makes public claims about the data. If you change sources or scoring, update it.
- To check the contract, write a real API response into a `.ts` file as `const x: CountyRecord = {...}` and run `tsc` on it.
- Add any decision a human might want to change to [`human-review.md`](human-review.md).
- Update this doc when you change types, routes or data flow.
