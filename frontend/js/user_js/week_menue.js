/**
 * NightWolf Kitchen — Week Menu Module
 *
 * HOW TO USE:
 * 1. Edit MENU_DATA below with your real weekly themes.
 *    Key format: "YYYY-Www"  e.g. "2026-W14"
 *    Days: mon / tue / wed / thu / fri
 *    Omit a day → card shows "No menu yet"
 *    img: path to dish image, e.g. "../assets/menu/ramen.jpg"
 *
 * 2. Set ORDER_PAGE_URL to your order page path.
 *
 * 3. <script src="../js/week_menu.js"></script> before </body>
 *
 * LATER — swap MENU_DATA lookup for a real API call:
 *   const weekData = await fetch(`/api/menu?week=${weekKey}`).then(r => r.json());
 */

'use strict';

/* ── Config ────────────────────────────────────────────────── */
const ORDER_PAGE_URL = 'order.html';

/* ── Placeholder menu data ──────────────────────────────────
 *  Keys are hardcoded ISO week strings — no getter tricks.
 *  img paths point to your assets folder.
 * ─────────────────────────────────────────────────────────── */
const MENU_DATA = {
  '2026-W14': {
    mon: {
      theme: 'Ramen Night',
      desc: 'Rich tonkotsu broth, chashu pork, soft egg & nori.',
      img: '../assets/menu/ramen.jpg'
    },
    tue: {
      theme: 'Taco Tuesday',
      desc: 'Smoked beef, jalapeño salsa & lime crema.',
      img: '../assets/menu/tacos.jpg'
    },
    wed: {
      theme: 'Smash Burger',
      desc: 'Double smash patty, aged cheddar & secret wolf sauce.',
      img: '../assets/menu/burger.jpg'
    },
    thu: {
      theme: 'Pizza Romana',
      desc: 'Thin-crust, San Marzano tomato, fior di latte.',
      img: '../assets/menu/pizza.jpg'
    },
    fri: {
      theme: 'Sushi Friday',
      desc: 'Omakase-style nigiri & premium maki rolls.',
      img: '../assets/menu/sushi.jpg'
    },
    sat: {
      theme: 'Weekend Brunch',
      desc: 'Avocado toast, shakshuka & bottomless mimosas.',
      img: '../assets/menu/brunch.jpg'
    },
    sun: {
      theme: 'Sunday Roast',
      desc: 'Herb-crusted beef, roasted veg & Yorkshire pudding.',
      img: '../assets/menu/roast.jpg'
    }
  },
  '2026-W15': {
    mon: {
      theme: 'Pho Bo',
      desc: 'Vietnamese beef broth, rice noodles & fresh herbs.',
      img: '../assets/menu/pho.jpg'
    },
    tue: {
      theme: 'Birria Tacos',
      desc: 'Braised beef birria with consommé for dipping.',
      img: '../assets/menu/birria.jpg'
    },
    // Wednesday intentionally missing → shows "No menu yet"
    thu: {
      theme: 'Neapolitan Pizza',
      desc: 'Wood-fired, 00 flour dough, buffalo mozzarella.',
      img: '../assets/menu/pizza.jpg'
    },
    fri: {
      theme: 'Omakase',
      desc: "Chef's selection of the finest seasonal fish.",
      img: '../assets/menu/sushi.jpg'
    }
  }
};

/* ── ISO week helpers ───────────────────────────────────────── */

/**
 * Returns "YYYY-Www" for any given Date.
 * Uses UTC internally to avoid DST edge cases.
 * @param {Date} date
 * @returns {string}
 */
function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Move to Thursday of the week (ISO: week year = Thursday's year)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum   = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * Returns the Monday (local time) for a "YYYY-Www" key.
 * @param {string} weekKey
 * @returns {Date}
 */
function mondayOfWeek(weekKey) {
  const [yearStr, wStr] = weekKey.split('-W');
  const year    = parseInt(yearStr, 10);
  const weekNum = parseInt(wStr, 10);
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4);
  const mon  = new Date(jan4);
  mon.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (weekNum - 1) * 7);
  return mon;
}

/** Date → "12 Apr" */
function fmtDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Week key → "7 Apr – 11 Apr 2026" */
function fmtWeekRange(weekKey) {
  const mon  = mondayOfWeek(weekKey);
  const fri  = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const s = { day: 'numeric', month: 'short' };
  return `${mon.toLocaleDateString('en-GB', s)} – ${fri.toLocaleDateString('en-GB', { ...s, year: 'numeric' })}`;
}

/* ── Constants ──────────────────────────────────────────────── */
const DAY_KEYS   = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TODAY          = new Date();
const TODAY_DAY_KEY  = ['sun','mon','tue','wed','thu','fri','sat'][TODAY.getDay()];
const TODAY_WEEK     = isoWeekKey(TODAY);
const TODAY_MIDNIGHT = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());

/* ── State ──────────────────────────────────────────────────── */
// Tracks which week is currently displayed
let currentWeekKey = TODAY_WEEK;

/* ── Render ─────────────────────────────────────────────────── */
function renderWeek(weekKey) {
  const grid     = document.getElementById('wm-grid');
  const weekText = document.getElementById('wm-week-text');
  const badge    = document.getElementById('wm-current-badge');

  if (!grid) return;

  weekText.textContent = fmtWeekRange(weekKey);
  badge.classList.toggle('hidden', weekKey !== TODAY_WEEK);

  // Fade out → rebuild → fade in
  grid.classList.add('fading');

  setTimeout(() => {
    grid.innerHTML = '';

    // ── Swap this one line for fetch('/api/menu?week=...') later ──
    const weekData = MENU_DATA[weekKey] || {};
    // ─────────────────────────────────────────────────────────────

    const monday = mondayOfWeek(weekKey);

    DAY_KEYS.forEach((dayKey, i) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const isToday   = weekKey === TODAY_WEEK && dayKey === TODAY_DAY_KEY;
      const isPast    = dayDate < TODAY_MIDNIGHT;
      const menu      = weekData[dayKey] || null;
      const isEmpty   = !menu;
      const clickable = !isEmpty && !isPast;

      // Use <a> for clickable cards so the whole card is a link
      const card = document.createElement(clickable ? 'a' : 'div');
      if (clickable) {
        card.href = `${ORDER_PAGE_URL}?day=${dayKey}&week=${weekKey}`;
      }

      card.className = [
        'wm-card',
        isToday ? 'is-today' : '',
        isPast  ? 'is-past'  : '',
        isEmpty ? 'is-empty' : ''
      ].filter(Boolean).join(' ');

      card.style.animationDelay = `${i * 55}ms`;

      // Image area — shows placeholder wolf bg if img fails or no menu
      const imgHTML = `
        <div class="wm-card-img ${menu ? '' : 'wm-img-missing'}">
          ${menu
            ? `<img src="${menu.img}"
                    alt="${menu.theme}"
                    onerror="this.parentElement.classList.add('wm-img-missing'); this.remove();">`
            : ''}
          ${isToday ? '<div class="wm-img-today-ribbon">Today</div>' : ''}
        </div>`;

      // Card text body
      const bodyHTML = menu
        ? `<div class="wm-card-day-row">
             <span class="wm-card-day">${DAY_NAMES[i].toUpperCase()}</span>
             <span class="wm-card-date">${fmtDate(dayDate)}</span>
           </div>
           <div class="wm-card-theme">${menu.theme}</div>
           <div class="wm-card-desc">${menu.desc}</div>
           ${clickable
             ? `<div class="wm-card-cta">
                  Order now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>`
             : ''}`
        : `<div class="wm-card-day-row">
             <span class="wm-card-day">${DAY_NAMES[i].toUpperCase()}</span>
             <span class="wm-card-date">${fmtDate(dayDate)}</span>
           </div>
           <div class="wm-card-theme wm-theme-empty">Coming soon</div>
           <div class="wm-empty-msg">No menu available yet.<br>Check back soon!</div>`;

      card.innerHTML = `${imgHTML}<div class="wm-card-body">${bodyHTML}</div>`;
      grid.appendChild(card);
    });

    grid.classList.remove('fading');
  }, 200);
}

/* ── Navigation ─────────────────────────────────────────────── */

/**
 * Move forward (+1) or backward (-1) by one week.
 * @param {number} direction  +1 or -1
 */
function changeWeek(direction) {
  const mon = mondayOfWeek(currentWeekKey);
  mon.setDate(mon.getDate() + direction * 7);
  currentWeekKey = isoWeekKey(mon);
  renderWeek(currentWeekKey);
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('wm-prev');
  const nextBtn = document.getElementById('wm-next');
  if (!prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => changeWeek(-1));
  nextBtn.addEventListener('click', () => changeWeek(+1));

  renderWeek(currentWeekKey);
});
