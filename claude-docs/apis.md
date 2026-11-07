APIs that we are considering wrapping with our backend:
- Open-Meteo Forecast API: 
    - Documentation: https://open-meteo.com/en/docs
    - Base Request URL: https://api.open-meteo.com/v1/forecast
- USGS Earthquake Catalog:
    - Documentation: https://earthquake.usgs.gov/fdsnws/event/1/
    - Request URL Format: https://earthquake.usgs.gov/fdsnws/event/1/[METHOD[?PARAMETERS]]
- NOAA NWPS API:
    - Documentation: https://api.water.noaa.gov/nwps/v1/docs/
    - Base Request URL: https://api.water.noaa.gov/nwps/v1
    - Requests require a User-Agent header.
- NWS API:
    - Documentation: https://www.weather.gov/documentation/services-web-api
    - Base Request URL: https://api.weather.gov
- FEMA Disasters Historical Data:
    - Documentation: https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2
    - Base Request URL: https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries

Notes:
- We are not requesting any data for commercial use
- For now we'll call our User-Agent "UCSD-Risk-Resource-NotForProfit" to make it extra clear that we are not using any of this data for profit.