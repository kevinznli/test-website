# ==============================================================================
# CELL 1: ENVIRONMENT SETUP, API KEY & IMPORTS
# ==============================================================================

# 1. CARTO BASEMAP API KEY CONFIGURATION
# Paste your CARTO API key inside the quotes below:
CARTO_API_KEY = "cb1_4tcx_1_1be5ac43300947e122f334b0"

# Custom tile URL template and mandatory attribution for Folium
CARTO_POSITRON_URL = f"https://basemaps.cartocdn.com/rastertiles/light_all/{{z}}/{{x}}/{{y}}.png?key={CARTO_API_KEY}"
CARTO_ATTRIBUTION = (
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors '
    '&copy; <a href="https://carto.com/attributions">CARTO</a>'
)

# 2. PACKAGE IMPORTS
import json
import requests
import requests_cache
from retry_requests import retry
import openmeteo_requests
from adjustText import adjust_text

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import folium

# print("All libraries imported and CARTO configuration loaded successfully.")

# Cell 2: California Statewide Grid (22 Anchors - No Gaps)
ca_counties_grid = {
    # Northern Coast & Interior (Fills Eureka down to SF)
    "Eureka (Far North Coast)": {"lat": 40.8021, "lon": -124.1637, "region": "North Coast"},
    "Mendocino / Fort Bragg (Mendocino Coast)": {"lat": 39.3078, "lon": -123.7994, "region": "North Coast"},
    "Redding (Northern Interior)": {"lat": 40.5865, "lon": -122.3917, "region": "Northern Interior"},
    "Chico (Upper Sacramento Valley)": {"lat": 39.7285, "lon": -121.8375, "region": "Northern Interior"},
    
    # Sierra Nevada & Mountain Passes
    "Nevada City (Sierra Foothills)": {"lat": 39.3039, "lon": -120.7685, "region": "Sierra Nevada"},
    "South Lake Tahoe (Sierra Crest)": {"lat": 38.9399, "lon": -119.9772, "region": "Sierra Nevada"},
    "Mono Lake / Bridgeport (Eastern Sierra)": {"lat": 38.2557, "lon": -119.2313, "region": "Sierra Nevada"},
    
    # Greater Bay Area & Central Coast
    "Santa Rosa (North Bay)": {"lat": 38.4404, "lon": -122.7141, "region": "Bay Area"},
    "San Francisco (Bay Area Urban)": {"lat": 37.7749, "lon": -122.4194, "region": "Bay Area"},
    "San Jose (South Bay)": {"lat": 37.3382, "lon": -121.8863, "region": "Bay Area"},
    "Monterey (Central Coast)": {"lat": 36.6002, "lon": -121.8947, "region": "Central Coast"},
    "San Luis Obispo (Central Coast)": {"lat": 35.2828, "lon": -120.6596, "region": "Central Coast"},
    
    # Central Valley
    "Sacramento (Delta / Capitol)": {"lat": 38.5816, "lon": -121.4944, "region": "Central Valley"},
    "Modesto (Northern San Joaquin Valley)": {"lat": 37.6391, "lon": -120.9969, "region": "Central Valley"},
    "Fresno (Central Valley Core)": {"lat": 36.7468, "lon": -119.7726, "region": "Central Valley"},
    "Bakersfield (Southern Valley)": {"lat": 35.3733, "lon": -119.0187, "region": "Central Valley"},
    
    # Greater Los Angeles & South Coast Basin
    "Ventura (Oxnard Coastal Plain)": {"lat": 34.2805, "lon": -119.2945, "region": "South Coast"},
    "Los Angeles (Urban Basin)": {"lat": 34.0522, "lon": -118.2437, "region": "South Coast"},
    "Irvine / Santa Ana (Orange County)": {"lat": 33.6846, "lon": -117.8265, "region": "South Coast"},
    "San Diego (Coastal South)": {"lat": 32.7157, "lon": -117.1611, "region": "South Coast"},
    
    # Inland Empire, Desert & Mountain Gaps
    "Palm Springs (San Gorgonio Pass / Desert)": {"lat": 33.8303, "lon": -116.5453, "region": "Inland / Desert"},
    "Barstow (Mojave Desert)": {"lat": 34.8958, "lon": -117.0173, "region": "Inland / Desert"}
}

# print(f"Configured {len(ca_counties_grid)} representative anchors across all California geographic gaps.")

# Cell 3: Single Batched Open-Meteo Query Across All Anchors
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# 1. Build coordinate lists from Cell 2's ca_counties_grid
lats = [c["lat"] for c in ca_counties_grid.values()]
lons = [c["lon"] for c in ca_counties_grid.values()]

# 2. Query Open-Meteo
url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": lats,
    "longitude": lons,
    "hourly": ["temperature_2m", "wind_gusts_10m", "relative_humidity_2m", "precipitation"],
    "temperature_unit": "fahrenheit",    # Direct °F output
    "wind_speed_unit": "mph",
    "precipitation_unit": "inch",
    "timezone": "America/Los_Angeles"
}

responses = openmeteo.weather_api(url, params=params)

# 3. Extract and unpack FlatBuffers arrays into df_ca
records = []
for i, (name, meta) in enumerate(ca_counties_grid.items()):
    res = responses[i]
    hourly = res.Hourly()
    
    # Ingested variables matching params["hourly"] order
    temp = hourly.Variables(0).ValuesAsNumpy()      # temperature_2m (°F)
    gusts = hourly.Variables(1).ValuesAsNumpy()     # wind_gusts_10m (mph)
    rh = hourly.Variables(2).ValuesAsNumpy()        # relative_humidity_2m (%)
    precip = hourly.Variables(3).ValuesAsNumpy()    # precipitation (in)
    
    dates = pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True).tz_convert("America/Los_Angeles"),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True).tz_convert("America/Los_Angeles"),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    )
    
    for t, te, g, h, p in zip(dates, temp, gusts, rh, precip):
        records.append({
            "location": name,
            "county": name,
            "region": meta["region"],
            "lat": meta["lat"],
            "lon": meta["lon"],
            "time": t,
            "temperature_f": te,
            "wind_gusts_mph": g,
            "relative_humidity": h,
            "precipitation_in": p
        })

df_ca = pd.DataFrame(records)
print(f"Statewide dataset ready: {len(df_ca)} hourly records covering {len(ca_counties_grid)} locations.")

# 1. Fetch California County boundary polygons (GeoJSON)
ca_geo_url = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/california-counties.geojson"
ca_geojson = requests.get(ca_geo_url).json()

# 2. Map all 58 California counties into the 8 regions declared in Cell 2
county_to_region = {
    # North Coast
    "Del Norte": "North Coast", "Humboldt": "North Coast", "Mendocino": "North Coast", "Trinity": "North Coast",
    
    # Northern Interior
    "Siskiyou": "Northern Interior", "Modoc": "Northern Interior", "Shasta": "Northern Interior", 
    "Lassen": "Northern Interior", "Tehama": "Northern Interior", "Plumas": "Northern Interior", 
    "Butte": "Northern Interior", "Glenn": "Northern Interior",
    
    # Sierra Nevada
    "Sierra": "Sierra Nevada", "Nevada": "Sierra Nevada", "Placer": "Sierra Nevada", 
    "El Dorado": "Sierra Nevada", "Alpine": "Sierra Nevada", "Amador": "Sierra Nevada", 
    "Calaveras": "Sierra Nevada", "Tuolumne": "Sierra Nevada", "Mariposa": "Sierra Nevada", 
    "Mono": "Sierra Nevada", "Inyo": "Sierra Nevada",
    
    # Bay Area
    "Sonoma": "Bay Area", "Napa": "Bay Area", "Marin": "Bay Area", "Solano": "Bay Area", 
    "Contra Costa": "Bay Area", "Alameda": "Bay Area", "San Francisco": "Bay Area", 
    "San Mateo": "Bay Area", "Santa Clara": "Bay Area",
    
    # Central Coast
    "Santa Cruz": "Central Coast", "San Benito": "Central Coast", "Monterey": "Central Coast", 
    "San Luis Obispo": "Central Coast", "Santa Barbara": "Central Coast",
    
    # Central Valley
    "Colusa": "Central Valley", "Yolo": "Central Valley", "Sutter": "Central Valley", 
    "Yuba": "Central Valley", "Sacramento": "Central Valley", "San Joaquin": "Central Valley", 
    "Stanislaus": "Central Valley", "Merced": "Central Valley", "Madera": "Central Valley", 
    "Fresno": "Central Valley", "Kings": "Central Valley", "Tulare": "Central Valley", 
    "Kern": "Central Valley",
    
    # South Coast
    "Ventura": "South Coast", "Los Angeles": "South Coast", "Orange": "South Coast", "San Diego": "South Coast",
    
    # Inland / Desert
    "San Bernardino": "Inland / Desert", "Riverside": "Inland / Desert", "Imperial": "Inland / Desert"
}

# 3. Pull regional summary statistics computed from df_ca
reg_stats_dict = df_ca.groupby("region").agg(
    max_gust=("wind_gusts_mph", "max"),
    median_gust=("wind_gusts_mph", "median"),
    min_rh=("relative_humidity", "min")
).to_dict(orient="index")

# 4. Color Palette mapped to NWS Hazard Benchmarks
def get_zone_color(max_g):
    if max_g >= 40:
        return "#e7298a"  # High Wind Advisory (Pink / Severe)
    elif max_g >= 25:
        return "#d95f02"  # Watch / Critical Gust (Orange / Elevated)
    elif max_g >= 18:
        return "#feb24c"  # Moderate Breeze (Light Amber)
    return "#2b5c8f"      # Calm / Ambient (Blue)

# 5. Initialize Map centered on California with CARTO Positron
ca_region_map = folium.Map(
    location=[37.2, -119.5],
    zoom_start=6,
    tiles=CARTO_POSITRON_URL if "CARTO_POSITRON_URL" in globals() else "CartoDB positron",
    attr=CARTO_ATTRIBUTION if "CARTO_ATTRIBUTION" in globals() else None
)

# 6. Style function for polygon fills
def style_region(feature):
    c_name = feature["properties"]["name"]
    r_name = county_to_region.get(c_name, "Other")
    
    if r_name in reg_stats_dict:
        max_g = reg_stats_dict[r_name]["max_gust"]
        return {
            "fillColor": get_zone_color(max_g),
            "color": "#444444",      # Dark border between counties
            "weight": 0.8,
            "fillOpacity": 0.40     # Semi-transparent so street/terrain details remain readable
        }
    return {
        "fillColor": "#ffffff",
        "color": "#cccccc",
        "weight": 0.5,
        "fillOpacity": 0.05
    }

# 7. Add properties for interactive hover cards
for feature in ca_geojson["features"]:
    c_name = feature["properties"]["name"]
    r_name = county_to_region.get(c_name, "Unknown")
    if r_name in reg_stats_dict:
        s = reg_stats_dict[r_name]
        feature["properties"]["region"] = r_name
        feature["properties"]["max_gust"] = f"{s['max_gust']:.1f} mph"
        feature["properties"]["median_gust"] = f"{s['median_gust']:.1f} mph"
        feature["properties"]["min_rh"] = f"{s['min_rh']:.1f}%"
        feature["properties"]["fire_status"] = "⚠️ WATCH CRITERIA" if (s['min_rh'] <= 15 and s['max_gust'] >= 25) else "✓ Normal"

folium.GeoJson(
    ca_geojson,
    style_function=style_region,
    tooltip=folium.GeoJsonTooltip(
        fields=["name", "region", "max_gust", "median_gust", "min_rh", "fire_status"],
        aliases=["County:", "Climate Zone:", "Peak Gust:", "Median Gust:", "Lowest RH:", "Fire Weather:"],
        style="font-family: Arial; font-size: 11px; line-height: 1.4;"
    )
).add_to(ca_region_map)

# 8. Add small reference dots for the 22 physical weather stations from Cell 2
for name, meta in ca_counties_grid.items():
    folium.CircleMarker(
        location=[meta["lat"], meta["lon"]],
        radius=3.5,
        color="#111111",
        weight=1,
        fill=True,
        fill_color="#ffffff",
        fill_opacity=0.9,
        tooltip=f"<b>Weather Anchor:</b> {name}"
    ).add_to(ca_region_map)

# Display interactive map
ca_region_map.save("california_map.html")

# Format your regional statistics dictionary for frontend consumption
stats_output = {
    "regions": reg_stats_dict,
    "stations": ca_counties_grid  # lat/lon coordinates for your 22 anchor stations
}

with open("climate_data.json", "w") as f:
    json.dump(stats_output, f, indent=2)

print("Exported climate_data.json successfully!")