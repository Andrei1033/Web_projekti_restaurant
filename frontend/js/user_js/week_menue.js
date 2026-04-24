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

"use strict";

/* ── Config ────────────────────────────────────────────────── */
const ORDER_PAGE_URL = "order.html";
const API_BASE = "http://localhost:3000/api";

/* ── ISO week helpers ───────────────────────────────────────── */

function isoWeekKey(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function mondayOfWeek(weekKey) {
  const [yearStr, wStr] = weekKey.split("-W");
  const year = parseInt(yearStr, 10);
  const weekNum = parseInt(wStr, 10);
  const jan4 = new Date(year, 0, 4);
  const mon = new Date(jan4);
  mon.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (weekNum - 1) * 7);
  return mon;
}

function fmtDate(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtWeekRange(weekKey) {
  const mon = mondayOfWeek(weekKey);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6); // Sunday is 6 days after Monday

  const options = { day: "numeric", month: "short" };
  const yearOptions = { ...options, year: "numeric" };

  // If same month and year
  if (
    mon.getMonth() === sun.getMonth() &&
    mon.getFullYear() === sun.getFullYear()
  ) {
    return `${mon.toLocaleDateString("en-GB", options)} – ${sun.toLocaleDateString("en-GB", yearOptions)}`;
  }
  // Different months or years
  return `${mon.toLocaleDateString("en-GB", options)} – ${sun.toLocaleDateString("en-GB", yearOptions)}`;
}

/* ── Constants ──────────────────────────────────────────────── */
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const TODAY_WEEK = isoWeekKey(TODAY);

/* ── State ──────────────────────────────────────────────────── */
let currentWeekKey = TODAY_WEEK;

/* ── API Functions ──────────────────────────────────────────── */

/**
 * Fetch menu for a specific week from backend API
 * @param {string} weekKey - Format: "2026-W17"
 * @returns {Promise<Object>} - Menu data organized by date
 */
async function fetchWeekMenu(weekKey) {
  try {
    const response = await fetch(`${API_BASE}/menu/week?week=${weekKey}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching week menu:", error);
    return {}; // Return empty object on error
  }
}

/**
 * Convert API date format to day key (mon, tue, etc.)
 * @param {string} dateStr - "2026-04-20"
 * @returns {string} - "mon", "tue", etc.
 */
function dateToDayKey(dateStr) {
  const date = new Date(dateStr);
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[date.getDay()];
}

/**
 * Get image URL (handle relative paths)
 * @param {string} imagePath - Image path from API
 * @returns {string} - Full image URL or placeholder
 */
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) return imagePath;
  // If it starts with /uploads, prepend API_BASE
  if (imagePath.startsWith("/uploads")) return `${API_BASE}${imagePath}`;
  // Otherwise assume it's in assets folder
  return `../assets/menu/${imagePath}`;
}

/* ── Render ─────────────────────────────────────────────────── */

async function renderWeek(weekKey) {
  const grid = document.getElementById("wm-grid");
  const weekText = document.getElementById("wm-week-text");
  const badge = document.getElementById("wm-current-badge");

  if (!grid) return;

  weekText.textContent = fmtWeekRange(weekKey);
  badge.classList.toggle("hidden", weekKey !== TODAY_WEEK);

  // Show loading state
  grid.classList.add("loading");
  grid.innerHTML = '<div class="loading-spinner">Loading menu...</div>';

  try {
    // Fetch real data from API
    const weekData = await fetchWeekMenu(weekKey);

    // Fade out → rebuild → fade in
    grid.classList.add("fading");
    grid.classList.remove("loading");

    setTimeout(() => {
      grid.innerHTML = "";

      const monday = mondayOfWeek(weekKey);

      DAY_KEYS.forEach((dayKey, i) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + i);

        // (Now rendering all days Monday–Sunday)

        const dateStr = dayDate.toISOString().slice(0, 10);
        const isToday =
          weekKey === TODAY_WEEK &&
          dateStr === new Date().toISOString().slice(0, 10);
        const isPast = dayDate < TODAY;

        // Get menu data from API response
        const apiDayData = weekData[dateStr] || null;
        const hasMenu =
          apiDayData && apiDayData.dishes && apiDayData.dishes.length > 0;

        // Transform API data to format needed for display
        let menu = null;
        if (hasMenu && apiDayData.theme_title) {
          menu = {
            theme: apiDayData.theme_title,
            desc: apiDayData.dishes.map((d) => d.name).join(", "), // Show dish names as description
            img: getImageUrl(apiDayData.theme_image),
            dishes: apiDayData.dishes,
          };
        }

        const isEmpty = !menu;
        const clickable = !isEmpty && !isPast;

        const card = document.createElement(clickable ? "a" : "div");
        if (clickable) {
          // Pass date to order page instead of day+week
          card.href = `${ORDER_PAGE_URL}?date=${dateStr}`;
        }

        card.className = [
          "wm-card",
          isToday ? "is-today" : "",
          isPast ? "is-past" : "",
          isEmpty ? "is-empty" : "",
        ]
          .filter(Boolean)
          .join(" ");

        card.style.animationDelay = `${i * 55}ms`;

        // Image area
        const imgHTML = `
          <div class="wm-card-img ${menu ? "" : "wm-img-missing"}">
            ${
              menu && menu.img
                ? `<img src="${menu.img}"
                    alt="${menu.theme}"
                    onerror="this.parentElement.classList.add('wm-img-missing'); this.remove();">`
                : ""
            }
            ${isToday ? '<div class="wm-img-today-ribbon">Today</div>' : ""}
          </div>`;

        // Card text body
        const bodyHTML = menu
          ? `<div class="wm-card-day-row">
               <span class="wm-card-day">${DAY_NAMES[i].toUpperCase()}</span>
               <span class="wm-card-date">${fmtDate(dayDate)}</span>
             </div>
             <div class="wm-card-theme">${menu.theme}</div>
             <div class="wm-card-desc">${menu.desc.substring(0, 80)}${menu.desc.length > 80 ? "..." : ""}</div>
             ${
               clickable
                 ? `<div class="wm-card-cta">
                Order now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>`
                 : ""
             }`
          : `<div class="wm-card-day-row">
               <span class="wm-card-day">${DAY_NAMES[i].toUpperCase()}</span>
               <span class="wm-card-date">${fmtDate(dayDate)}</span>
             </div>
             <div class="wm-card-theme wm-theme-empty">Coming soon</div>
             <div class="wm-empty-msg">No menu available yet.<br>Check back soon!</div>`;

        card.innerHTML = `${imgHTML}<div class="wm-card-body">${bodyHTML}</div>`;
        grid.appendChild(card);
      });

      grid.classList.remove("fading");
    }, 200);
  } catch (error) {
    console.error("Error rendering week:", error);
    grid.innerHTML =
      '<div class="error-message">Failed to load menu. Please try again later.</div>';
    grid.classList.remove("loading", "fading");
  }
}

/* ── Navigation ─────────────────────────────────────────────── */

function changeWeek(direction) {
  const mon = mondayOfWeek(currentWeekKey);
  mon.setDate(mon.getDate() + direction * 7);
  currentWeekKey = isoWeekKey(mon);
  renderWeek(currentWeekKey);
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.getElementById("wm-prev");
  const nextBtn = document.getElementById("wm-next");
  if (!prevBtn || !nextBtn) return;

  prevBtn.addEventListener("click", () => changeWeek(-1));
  nextBtn.addEventListener("click", () => changeWeek(+1));

  renderWeek(currentWeekKey);
});
