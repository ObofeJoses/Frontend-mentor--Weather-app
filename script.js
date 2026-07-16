
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