// WeatherApp — weather-api.js
// All network calls live here: geocoding (turning a typed place name into
// coordinates) and the forecast fetch itself. Both use Open-Meteo's free
// APIs — no key required.

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

/**
 * @param {string} query
 * @returns {Promise<Array<{name: string, country: string, admin1: string, latitude: number, longitude: number}>>}
 */
async function geocodeCity(query) {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set('name', query);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const response = await fetch(url);
  if (!response.ok) throw new Error('Geocoding request failed');
  const data = await response.json();
  return data.results || [];
}

function formatPlaceLabel(result) {
  const parts = [result.name];
  if (result.admin1 && result.admin1 !== result.name) parts.push(result.admin1);
  if (result.country) parts.push(result.country);
  return parts.join(', ');
}

/**
 * @param {number} latitude
 * @param {number} longitude
 * @param {{temperature: 'celsius'|'fahrenheit', wind: 'kmh'|'mph', precipitation: 'mm'|'inch'}} units
 */
async function getForecast(latitude, longitude, units) {
  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m'
  );
  url.searchParams.set('hourly', 'temperature_2m,weather_code');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '6');
  url.searchParams.set('temperature_unit', units.temperature);
  url.searchParams.set('wind_speed_unit', units.wind);
  url.searchParams.set('precipitation_unit', units.precipitation);

  const response = await fetch(url);
  if (!response.ok) throw new Error('Forecast request failed');
  return response.json();
}

window.geocodeCity = geocodeCity;
window.formatPlaceLabel = formatPlaceLabel;
window.getForecast = getForecast;