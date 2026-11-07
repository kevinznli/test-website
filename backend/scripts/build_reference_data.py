"""Builds data/reference.json, the static data the API loads at startup.

Run from backend/ with: python -m scripts.build_reference_data

It takes about a minute and only needs re-running to refresh the baseline. The
output is committed, so the API starts instantly and doesn't depend on these
slow or rarely changing sources during a demo.
"""

import csv
import io
import json
from collections import defaultdict
from datetime import UTC, datetime

import httpx
import numpy as np

from app.config import get_settings
from app.domain.geo import distance_to_boxes_miles
from app.domain.hazards import FEMA_INCIDENT_HAZARDS, Hazard

BASELINE_SINCE_YEAR = 2006
QUAKE_MIN_MAGNITUDE = 4.5
QUAKE_RADIUS_MILES = 60

COUNTIES_GEOJSON_URL = (
    "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"
)
FEMA_URL = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries"
FEMA_PAGE_SIZE = 10000
USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
CENSUS_URLS = (
    # The newest file first. The older one fills in codes the newer one dropped.
    (
        "https://www2.census.gov/programs-surveys/popest/datasets/2020-2021/counties/totals/co-est2021-alldata.csv",
        "POPESTIMATE2021",
    ),
    (
        "https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/totals/co-est2019-alldata.csv",
        "POPESTIMATE2019",
    ),
)

# The GeoJSON still uses these retired codes for renamed counties.
FIPS_RENAMES = {
    "02270": "02158",  # Wade Hampton is now Kusilvak Census Area, Alaska
    "46113": "46102",  # Shannon is now Oglala Lakota County, South Dakota
}

LSAD_SUFFIXES = {
    "County": "County",
    "Parish": "Parish",
    "Borough": "Borough",
    "CA": "Census Area",
    "Cty&Bor": "City and Borough",
    "Muny": "Municipality",
    "Muno": "Municipio",
    "city": "city",
}

# State FIPS to (postal code, name). The frontend's map covers these 50 states,
# and its county layer also includes DC and Puerto Rico.
STATES = {
    "01": ("AL", "Alabama"), "02": ("AK", "Alaska"), "04": ("AZ", "Arizona"),
    "05": ("AR", "Arkansas"), "06": ("CA", "California"), "08": ("CO", "Colorado"),
    "09": ("CT", "Connecticut"), "10": ("DE", "Delaware"),
    "11": ("DC", "District of Columbia"), "12": ("FL", "Florida"), "13": ("GA", "Georgia"),
    "15": ("HI", "Hawaii"), "16": ("ID", "Idaho"), "17": ("IL", "Illinois"),
    "18": ("IN", "Indiana"), "19": ("IA", "Iowa"), "20": ("KS", "Kansas"),
    "21": ("KY", "Kentucky"), "22": ("LA", "Louisiana"), "23": ("ME", "Maine"),
    "24": ("MD", "Maryland"), "25": ("MA", "Massachusetts"), "26": ("MI", "Michigan"),
    "27": ("MN", "Minnesota"), "28": ("MS", "Mississippi"), "29": ("MO", "Missouri"),
    "30": ("MT", "Montana"), "31": ("NE", "Nebraska"), "32": ("NV", "Nevada"),
    "33": ("NH", "New Hampshire"), "34": ("NJ", "New Jersey"), "35": ("NM", "New Mexico"),
    "36": ("NY", "New York"), "37": ("NC", "North Carolina"), "38": ("ND", "North Dakota"),
    "39": ("OH", "Ohio"), "40": ("OK", "Oklahoma"), "41": ("OR", "Oregon"),
    "42": ("PA", "Pennsylvania"), "44": ("RI", "Rhode Island"), "45": ("SC", "South Carolina"),
    "46": ("SD", "South Dakota"), "47": ("TN", "Tennessee"), "48": ("TX", "Texas"),
    "49": ("UT", "Utah"), "50": ("VT", "Vermont"), "51": ("VA", "Virginia"),
    "53": ("WA", "Washington"), "54": ("WV", "West Virginia"), "55": ("WI", "Wisconsin"),
    "56": ("WY", "Wyoming"), "72": ("PR", "Puerto Rico"),
}


def main() -> None:
    settings = get_settings()
    with httpx.Client(headers={"User-Agent": settings.user_agent}, timeout=120) as http:
        print("Fetching county boundaries...")
        counties = load_counties(http)
        print(f"  {len(counties)} counties")

        print("Fetching population estimates...")
        populations = load_populations(http)
        for fips, county in counties.items():
            county["population"] = populations.get(FIPS_RENAMES.get(fips, fips))
        missing = sorted(f for f, c in counties.items() if c["population"] is None)
        print(f"  no population for {len(missing)} counties ({missing[:3]}...)")

        print("Fetching FEMA declarations...")
        county_counts, state_counts = load_declarations(http, counties)

        print("Fetching USGS earthquake history...")
        quake_counts = load_quake_counts(http, counties)

    for fips, county in counties.items():
        counts = {hazard.value: 0 for hazard in Hazard}
        for hazard, number in county_counts[fips].items():
            counts[hazard.value] = number
        counts[Hazard.EARTHQUAKE.value] = quake_counts[fips]
        county["counts"] = counts

    add_percentile_scores(counties)

    states = {
        code: {
            "name": name,
            "declarations": {
                hazard.value: state_counts[code][hazard]
                for hazard in Hazard
                if hazard is not Hazard.EARTHQUAKE
            },
        }
        for code, name in STATES.values()
    }
    output = {
        "meta": {
            "generatedAt": datetime.now(UTC).isoformat(timespec="seconds"),
            "baselineSinceYear": BASELINE_SINCE_YEAR,
            "quakeMinMagnitude": QUAKE_MIN_MAGNITUDE,
            "quakeRadiusMiles": QUAKE_RADIUS_MILES,
        },
        "states": states,
        "counties": counties,
    }
    path = settings.reference_data_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(output, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {path} ({path.stat().st_size / 1_000_000:.1f} MB)")


def load_counties(http: httpx.Client) -> dict[str, dict]:
    response = http.get(COUNTIES_GEOJSON_URL)
    response.raise_for_status()
    counties = {}
    for feature in response.json()["features"]:
        properties = feature["properties"]
        code, state_name = STATES[properties["STATE"]]
        suffix = LSAD_SUFFIXES.get(properties["LSAD"], "")
        west, south, east, north, latitude, longitude = polygon_stats(feature["geometry"])
        counties[feature["id"]] = {
            "name": f"{properties['NAME']} {suffix}".strip(),
            "bareName": properties["NAME"],
            "state": code,
            "lat": round(latitude, 4),
            "lon": round(longitude, 4),
            "bbox": [round(west, 4), round(south, 4), round(east, 4), round(north, 4)],
        }
    return counties


def polygon_stats(geometry: dict) -> tuple[float, float, float, float, float, float]:
    """Return the bounding box and centroid of a county's largest polygon.

    Using the largest polygon keeps islands, such as Alaska's Aleutians crossing
    the 180th meridian, from stretching the box around the whole planet.
    """
    if geometry["type"] == "Polygon":
        rings = [geometry["coordinates"][0]]
    else:
        rings = [polygon[0] for polygon in geometry["coordinates"]]
    largest = max((np.array(ring, dtype=float) for ring in rings), key=lambda r: abs(_area(r)))
    x, y = largest[:, 0], largest[:, 1]

    area = _area(largest)
    if area == 0:
        centroid_x, centroid_y = float(x.mean()), float(y.mean())
    else:
        cross = x[:-1] * y[1:] - x[1:] * y[:-1]
        centroid_x = float(((x[:-1] + x[1:]) * cross).sum() / (6 * area))
        centroid_y = float(((y[:-1] + y[1:]) * cross).sum() / (6 * area))
    return float(x.min()), float(y.min()), float(x.max()), float(y.max()), centroid_y, centroid_x


def _area(ring: np.ndarray) -> float:
    x, y = ring[:, 0], ring[:, 1]
    return float((x[:-1] * y[1:] - x[1:] * y[:-1]).sum() / 2)


def load_populations(http: httpx.Client) -> dict[str, int]:
    populations: dict[str, int] = {}
    for url, column in CENSUS_URLS:
        response = http.get(url)
        response.raise_for_status()
        for row in csv.DictReader(io.StringIO(response.content.decode("latin-1"))):
            if row["SUMLEV"] == "050":
                populations.setdefault(row["STATE"] + row["COUNTY"], int(row[column]))
    return populations


def load_declarations(
    http: httpx.Client, counties: dict[str, dict]
) -> tuple[dict[str, dict[Hazard, int]], dict[str, dict[Hazard, int]]]:
    """Count distinct disasters per county and state.

    FEMA's data has one row per designated area. A "Statewide" area counts for
    every county in that state. County code 000 alone doesn't mean statewide: it's
    mostly used for tribal lands. Emergency declarations (EM) are left out because
    many cover other states' evacuees rather than local damage.
    """
    rows = fetch_fema_rows(http)
    print(f"  {len(rows)} rows")

    counties_by_state: dict[str, list[str]] = defaultdict(list)
    for fips, county in counties.items():
        counties_by_state[county["state"]].append(fips)
    new_to_old = {new: old for old, new in FIPS_RENAMES.items()}

    county_disasters: dict[str, dict[Hazard, set[int]]] = defaultdict(lambda: defaultdict(set))
    state_disasters: dict[str, dict[Hazard, set[int]]] = defaultdict(lambda: defaultdict(set))
    for row in rows:
        hazard = FEMA_INCIDENT_HAZARDS.get(row["incidentType"])
        state = STATES.get(row["fipsStateCode"].zfill(2))
        if hazard is None or state is None or row["declarationType"] == "EM":
            continue
        code = state[0]
        number = row["disasterNumber"]
        state_disasters[code][hazard].add(number)

        county_code = row["fipsCountyCode"].zfill(3)
        if row["designatedArea"] == "Statewide":
            targets = counties_by_state[code]
        elif county_code == "000":
            targets = []  # A tribal area, which counts for the state but no specific county
        else:
            fips = row["fipsStateCode"].zfill(2) + county_code
            targets = [new_to_old.get(fips, fips)]
        for target in targets:
            if target in counties:
                county_disasters[target][hazard].add(number)

    return _count_sets(county_disasters, counties), _count_sets(
        state_disasters, {code: None for code, _ in STATES.values()}
    )


def _count_sets(sets_by_area: dict, areas: dict) -> dict[str, dict[Hazard, int]]:
    return {
        area: {hazard: len(sets_by_area[area][hazard]) for hazard in Hazard}
        for area in areas
    }


def fetch_fema_rows(http: httpx.Client) -> list[dict]:
    rows: list[dict] = []
    while True:
        response = http.get(
            FEMA_URL,
            params={
                "$select": (
                    "disasterNumber,fipsStateCode,fipsCountyCode,designatedArea,"
                    "incidentType,declarationType"
                ),
                "$filter": f"declarationDate ge '{BASELINE_SINCE_YEAR}-01-01T00:00:00.000Z'",
                "$orderby": "id",
                "$top": FEMA_PAGE_SIZE,
                "$skip": len(rows),
            },
        )
        response.raise_for_status()
        page = response.json()["DisasterDeclarationsSummaries"]
        rows.extend(page)
        if len(page) < FEMA_PAGE_SIZE:
            return rows


def load_quake_counts(http: httpx.Client, counties: dict[str, dict]) -> dict[str, int]:
    response = http.get(
        USGS_URL,
        params={
            "format": "geojson",
            "eventtype": "earthquake",
            "starttime": f"{BASELINE_SINCE_YEAR}-01-01",
            "minmagnitude": QUAKE_MIN_MAGNITUDE,
            # A box around the US, including Alaska, Hawaii and Puerto Rico
            "minlatitude": 17,
            "maxlatitude": 72,
            "minlongitude": -180,
            "maxlongitude": -64,
        },
    )
    response.raise_for_status()
    coordinates = np.array(
        [f["geometry"]["coordinates"][:2] for f in response.json()["features"]], dtype=float
    )
    print(f"  {len(coordinates)} earthquakes")

    fips_list = list(counties)
    boxes = np.array([counties[f]["bbox"] for f in fips_list])
    totals = np.zeros(len(fips_list), dtype=int)
    for longitude, latitude in coordinates:
        totals += distance_to_boxes_miles(boxes, latitude, longitude) <= QUAKE_RADIUS_MILES
    return {fips: int(total) for fips, total in zip(fips_list, totals, strict=True)}


def add_percentile_scores(counties: dict[str, dict]) -> None:
    """Score each hazard by percentile rank among counties that have had it at all.

    A county with no events scores 0. Excluding those counties from the ranking
    matters for rare hazards: 93% of counties have no tornado declarations, so
    ranking against all counties would put a single declaration at the 93rd
    percentile. Ties take the middle of their range.
    """
    fips_list = list(counties)
    for county in counties.values():
        county["baseline"] = {}
    for hazard in Hazard:
        counts = np.array([counties[f]["counts"][hazard.value] for f in fips_list])
        affected = np.sort(counts[counts > 0])
        lower = np.searchsorted(affected, counts, side="left")
        upper = np.searchsorted(affected, counts, side="right")
        ranks = 100 * (lower + upper) / 2 / max(len(affected), 1)
        scores = np.where(counts > 0, np.round(ranks), 0).astype(int)
        for fips, score in zip(fips_list, scores, strict=True):
            counties[fips]["baseline"][hazard.value] = int(score)


if __name__ == "__main__":
    main()
