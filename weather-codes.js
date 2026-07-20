// WeatherApp — weather-codes.js
// Open-Meteo returns WMO weather codes (https://open-meteo.com/en/docs).


const WEATHER_CODE_MAP = {
  0: { label: 'Clear sky', icon: 'icon-sunny.webp' },
  1: { label: 'Mainly clear', icon: 'icon-sunny.webp' },
  2: { label: 'Partly cloudy', icon: 'icon-partly-cloudy.webp' },
  3: { label: 'Overcast', icon: 'icon-overcast.webp' },
  45: { label: 'Fog', icon: 'icon-fog.webp' },
  48: { label: 'Depositing rime fog', icon: 'icon-fog.webp' },
  51: { label: 'Light drizzle', icon: 'icon-drizzle.webp' },
  53: { label: 'Drizzle', icon: 'icon-drizzle.webp' },
  55: { label: 'Dense drizzle', icon: 'icon-drizzle.webp' },
  56: { label: 'Freezing drizzle', icon: 'icon-drizzle.webp' },
  57: { label: 'Dense freezing drizzle', icon: 'icon-drizzle.webp' },
  61: { label: 'Slight rain', icon: 'icon-rain.webp' },
  63: { label: 'Rain', icon: 'icon-rain.webp' },
  65: { label: 'Heavy rain', icon: 'icon-rain.webp' },
  66: { label: 'Freezing rain', icon: 'icon-rain.webp' },
  67: { label: 'Heavy freezing rain', icon: 'icon-rain.webp' },
  71: { label: 'Slight snow', icon: 'icon-snow.webp' },
  73: { label: 'Snow', icon: 'icon-snow.webp' },
  75: { label: 'Heavy snow', icon: 'icon-snow.webp' },
  77: { label: 'Snow grains', icon: 'icon-snow.webp' },
  80: { label: 'Slight rain showers', icon: 'icon-rain.webp' },
  81: { label: 'Rain showers', icon: 'icon-rain.webp' },
  82: { label: 'Violent rain showers', icon: 'icon-rain.webp' },
  85: { label: 'Slight snow showers', icon: 'icon-snow.webp' },
  86: { label: 'Heavy snow showers', icon: 'icon-snow.webp' },
  95: { label: 'Thunderstorm', icon: 'icon-storm.webp' },
  96: { label: 'Thunderstorm with hail', icon: 'icon-storm.webp' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'icon-storm.webp' },
};

function describeWeatherCode(code) {
  return WEATHER_CODE_MAP[code] || { label: 'Unknown', icon: 'icon-overcast.webp' };
}

function weatherIconPath(code) {
  return `./assets/images/${describeWeatherCode(code).icon}`;
}

window.describeWeatherCode = describeWeatherCode;
window.weatherIconPath = weatherIconPath;
