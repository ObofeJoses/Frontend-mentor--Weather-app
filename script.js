// Wired up feature by feature. This first pass just handles opening/closing
// the two dropdowns (Units menu + Hourly day-picker). No data fetching yet.

const unitsTrigger = document.getElementById('unitsTrigger');
const unitsMenuList = document.getElementById('unitsMenuList');

const dayTrigger = document.getElementById('hourlyForecastToggle');
const dayMenuList = document.getElementById('dayMenuList');

function openMenu(trigger, list) {
  list.hidden = false;
  trigger.classList.add('is-open');
}

function closeMenu(trigger, list) {
  list.hidden = true;
  trigger.classList.remove('is-open');
}

function toggleMenu(trigger, list) {
  if (list.hidden) {
    openMenu(trigger, list);
  } else {
    closeMenu(trigger, list);
  }
}

unitsTrigger.addEventListener('click', () => {
  toggleMenu(unitsTrigger, unitsMenuList);
  closeMenu(dayTrigger, dayMenuList);
});

dayTrigger.addEventListener('click', () => {
  toggleMenu(dayTrigger, dayMenuList);
  closeMenu(unitsTrigger, unitsMenuList);
});

// Close either dropdown when clicking outside of it.
document.addEventListener('click', (e) => {
  if (!unitsTrigger.contains(e.target) && !unitsMenuList.contains(e.target)) {
    closeMenu(unitsTrigger, unitsMenuList);
  }
  if (!dayTrigger.contains(e.target) && !dayMenuList.contains(e.target)) {
    closeMenu(dayTrigger, dayMenuList);
  }
});

// Close either dropdown on Escape.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu(unitsTrigger, unitsMenuList);
    closeMenu(dayTrigger, dayMenuList);
  }
});

// ---------------------------------------------------------------------
// City search (uses geocodeCity/formatPlaceLabel from weather-api.js)
// ---------------------------------------------------------------------

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestionsList');

let debounceTimer = null;
let activeIndex = -1;
let currentResults = [];

function closeSuggestions() {
  suggestionsList.hidden = true;
  suggestionsList.innerHTML = '';
  activeIndex = -1;
}

function renderSuggestions(results) {
  currentResults = results;
  activeIndex = -1;

  if (results.length === 0) {
    suggestionsList.innerHTML = '<li class="suggestions-list-empty">No matching places</li>';
    suggestionsList.hidden = false;
    return;
  }

  suggestionsList.innerHTML = results
    .map(
      (result, i) => `
      <li>
        <button type="button" class="suggestions-list-item" data-index="${i}">
          ${formatPlaceLabel(result)}
        </button>
      </li>`
    )
    .join('');

  suggestionsList.hidden = false;

  suggestionsList.querySelectorAll('.suggestions-list-item').forEach((btn) => {
    btn.addEventListener('click', () => selectResult(Number(btn.dataset.index)));
  });
}

function selectResult(index) {
  const result = currentResults[index];
  if (!result) return;
  searchInput.value = formatPlaceLabel(result);
  closeSuggestions();
  handleLocationSelected(result);
}

function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

async function handleSearchInput(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    closeSuggestions();
    return;
  }
  try {
    const results = await geocodeCity(trimmed);
    renderSuggestions(results);
  } catch (err) {
    suggestionsList.innerHTML = '<li class="suggestions-list-error">Couldn\'t load suggestions</li>';
    suggestionsList.hidden = false;
  }
}

const debouncedSearch = debounce(handleSearchInput, 350);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

searchInput.addEventListener('keydown', (e) => {
  const items = suggestionsList.querySelectorAll('.suggestions-list-item');
  if (suggestionsList.hidden || items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % items.length;
    updateActiveItem(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + items.length) % items.length;
    updateActiveItem(items);
  } else if (e.key === 'Enter' && activeIndex >= 0) {
    e.preventDefault();
    selectResult(activeIndex);
  } else if (e.key === 'Escape') {
    closeSuggestions();
  }
});

function updateActiveItem(items) {
  items.forEach((item, i) => item.classList.toggle('is-active', i === activeIndex));
  if (activeIndex >= 0) items[activeIndex].scrollIntoView({ block: 'nearest' });
}

document.addEventListener('click', (e) => {
  if (!searchForm.contains(e.target)) closeSuggestions();
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  closeSuggestions();
  try {
    const results = await geocodeCity(query);
    if (results.length === 0) {
      // No-results handling comes with the weather-fetching step.
      console.log('No results found for', query);
      return;
    }
    searchInput.value = formatPlaceLabel(results[0]);
    handleLocationSelected(results[0]);
  } catch (err) {
    console.error('Search failed:', err);
  }
});

/**
 * Called once a place has been chosen. Weather fetching/rendering is wired
 * up in a later step — for now this is just the hand-off point.
 */
function handleLocationSelected(result) {
  const location = {
    name: result.name,
    admin1: result.admin1,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  };
  fetchAndRenderWeather(location);
}

// ---------------------------------------------------------------------
// Weather fetching + rendering
// ---------------------------------------------------------------------

const currentUnits = { temperature: 'celsius', wind: 'kmh', precipitation: 'mm' };

let lastLocation = null;

const weatherEls = {
  placeName: document.getElementById('placeName'),
  placeDate: document.getElementById('placeDate'),
  icon: document.getElementById('weatherIcon'),
  temp: document.getElementById('currentTemp'),
  feelsLike: document.getElementById('feelsLike'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  precipitation: document.getElementById('precipitation'),
};

function placeLabel(location) {
  const parts = [location.name];
  if (location.country) parts.push(location.country);
  return parts.join(', ');
}

function formatDate(isoLocalDateTime) {
  const [datePart] = isoLocalDateTime.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatTemp(value) {
  return `${Math.round(value)}°`;
}

function formatWind(value) {
  const unitLabel = currentUnits.wind === 'kmh' ? 'km/h' : 'mph';
  return `${Math.round(value)} ${unitLabel}`;
}

function formatPrecipitation(value) {
  const unitLabel = currentUnits.precipitation === 'mm' ? 'mm' : 'in';
  const decimals = currentUnits.precipitation === 'mm' ? 0 : 2;
  return `${Number(value).toFixed(decimals)} ${unitLabel}`;
}

function renderCurrentWeather(data, location) {
  const { current } = data;
  const weather = describeWeatherCode(current.weather_code);

  weatherEls.placeName.textContent = placeLabel(location);
  weatherEls.placeDate.textContent = formatDate(current.time);
  weatherEls.temp.textContent = formatTemp(current.temperature_2m);
  weatherEls.icon.src = weatherIconPath(current.weather_code);
  weatherEls.icon.alt = weather.label;

  weatherEls.feelsLike.textContent = formatTemp(current.apparent_temperature);
  weatherEls.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  weatherEls.wind.textContent = formatWind(current.wind_speed_10m);
  weatherEls.precipitation.textContent = formatPrecipitation(current.precipitation);
}

function weekdayShort(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

function weekdayFull(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

function formatHourLabel(isoDateTime) {
  const timePart = isoDateTime.split('T')[1];
  let hour = parseInt(timePart.split(':')[0], 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour} ${suffix}`;
}

const dailyForecastList = document.querySelector('.daily-forecast');
const hourlyForecastList = document.querySelector('.hourly-forecast-list');
const selectedDayLabel = document.getElementById('selectedDayLabel');

let lastForecastData = null;
let activeDayIndex = 0;

function renderDailyForecast(data) {
  const { time, weather_code, temperature_2m_max, temperature_2m_min } = data.daily;

  dailyForecastList.innerHTML = time
    .map((isoDate, i) => {
      const weather = describeWeatherCode(weather_code[i]);
      return `
        <li class="daily-forecast-item">
          <p class="daily-forecast-day">${weekdayShort(isoDate)}</p>
          <img src="${weatherIconPath(weather_code[i])}" alt="${weather.label}">
          <div class="daily-forecast-range">
            <p class="daily-forecast-maxtemp">${formatTemp(temperature_2m_max[i])}</p>
            <p class="daily-forecast-mintemp">${formatTemp(temperature_2m_min[i])}</p>
          </div>
        </li>`;
    })
    .join('');
}

function renderHourlyForecast(data, dayIndex) {
  const dayDate = data.daily.time[dayIndex];
  const { time, temperature_2m, weather_code } = data.hourly;

  const rows = time
    .map((isoDateTime, i) => ({ isoDateTime, i }))
    .filter(({ isoDateTime }) => isoDateTime.startsWith(dayDate));

  hourlyForecastList.innerHTML = rows
    .map(({ isoDateTime, i }) => {
      const weather = describeWeatherCode(weather_code[i]);
      return `
        <li class="hourly-forecast-item">
          <span class="hourly-forecast-item-left">
            <img src="${weatherIconPath(weather_code[i])}" alt="${weather.label}">
            <span>${formatHourLabel(isoDateTime)}</span>
          </span>
          <span>${formatTemp(temperature_2m[i])}</span>
        </li>`;
    })
    .join('');
}

function renderDayMenu(data) {
  dayMenuList.innerHTML = data.daily.time
    .map((isoDate, i) => `<li><button type="button" class="dropdown-panel-item" data-index="${i}">${weekdayFull(isoDate)}</button></li>`)
    .join('');

  dayMenuList.querySelectorAll('.dropdown-panel-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeDayIndex = Number(btn.dataset.index);
      selectedDayLabel.textContent = weekdayFull(data.daily.time[activeDayIndex]);
      renderHourlyForecast(data, activeDayIndex);
      closeMenu(dayTrigger, dayMenuList);
    });
  });
}

async function fetchAndRenderWeather(location) {
  lastLocation = location;
  try {
    const data = await getForecast(location.latitude, location.longitude, currentUnits);
    lastForecastData = data;
    activeDayIndex = 0;
    renderCurrentWeather(data, location);
    renderDailyForecast(data);
    renderDayMenu(data);
    selectedDayLabel.textContent = weekdayFull(data.daily.time[0]);
    renderHourlyForecast(data, 0);
  } catch (err) {
    console.error('Could not fetch weather:', err);
  }
}