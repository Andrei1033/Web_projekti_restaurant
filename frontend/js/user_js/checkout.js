/**
 * checkout.js
 * - Fills pickup time slots based on opening hours
 * - Calls GET /api/availability for real seat counts
 * - Enables Place Order only when all fields valid + seats available
 *
 * window.prepareCheckout(date) is called by order.js before opening modal.
 */

const CHECKOUT_API = "http://localhost:3000";

// Will be populated from /api/about openingHours (fallback below)
let OPENING_HOURS = {
  0: null,
  1: { open: "11:00", close: "22:00" },
  2: { open: "11:00", close: "22:00" },
  3: { open: "11:00", close: "22:00" },
  4: { open: "11:00", close: "22:00" },
  5: { open: "11:00", close: "22:00" },
  6: { open: "12:00", close: "23:00" },
};

let fetchOpeningHoursPromise = null;

function buildOpeningHoursMap(openingHoursArray) {
  // Return map 0..6 -> {open, close} or null
  const map = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
  if (!Array.isArray(openingHoursArray)) return map;

  const nameToIndex = (name) => {
    if (!name) return null;
    const key = name.trim().slice(0, 3).toLowerCase();
    switch (key) {
      case "mon":
        return 1;
      case "tue":
      case "tuh":
      case "tis":
        return 2;
      case "wed":
      case "ons":
        return 3;
      case "thu":
      case "tor":
        return 4;
      case "fri":
      case "pei":
        return 5;
      case "sat":
      case "lau":
        return 6;
      case "sun":
      case "søn":
      case "sön":
        return 0;
      default:
        return null;
    }
  };

  openingHoursArray.forEach((item) => {
    const day = (item.day || "").trim();
    const hours = (item.hours || "").trim();
    if (!day || !hours) return;

    // Parse hours, e.g. "10:00 – 22:00"
    const [openRaw, closeRaw] = hours.split(/[-–—]/).map((s) => s && s.trim());
    const open = openRaw ? openRaw.slice(0, 5) : null;
    const close = closeRaw ? closeRaw.slice(0, 5) : null;
    if (!open || !close) return;

    // Day may be a range like "Mon – Fri" or single day
    const parts = day.split(/[-–—]/).map((s) => s && s.trim());
    if (parts.length === 1) {
      const idx = nameToIndex(parts[0]);
      if (idx !== null) map[idx] = { open, close };
    } else if (parts.length === 2) {
      const start = nameToIndex(parts[0]);
      const end = nameToIndex(parts[1]);
      if (start === null || end === null) return;
      let i = start;
      while (true) {
        map[i] = { open, close };
        if (i === end) break;
        i = (i + 1) % 7;
      }
    }
  });

  return map;
}

function loadOpeningHoursFromApi() {
  if (fetchOpeningHoursPromise) return fetchOpeningHoursPromise;
  fetchOpeningHoursPromise = fetch(`${CHECKOUT_API}/api/about`)
    .then((r) => {
      if (!r.ok) throw new Error("Could not fetch about");
      return r.json();
    })
    .then((data) => {
      if (data && data.openingHours) {
        const map = buildOpeningHoursMap(data.openingHours);
        // Only replace keys that are populated
        OPENING_HOURS = { ...OPENING_HOURS, ...map };
      }
    })
    .catch((e) => {
      console.warn("Could not load opening hours from API, using defaults", e);
    });
  return fetchOpeningHoursPromise;
}

const SLOT_INTERVAL = 30;
const LAST_OFFSET = 30;
const MIN_ADVANCE = 15;

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateSlots(date) {
  const hours = OPENING_HOURS[date.getDay()];
  if (!hours) return [];

  const [oH, oM] = hours.open.split(":").map(Number);
  const [cH, cM] = hours.close.split(":").map(Number);
  const openMin = oH * 60 + oM;
  const closeMin = cH * 60 + cM - LAST_OFFSET;

  const now = new Date();
  const isToday = toDateStr(date) === toDateStr(now);
  const nowMin = isToday
    ? now.getHours() * 60 + now.getMinutes() + MIN_ADVANCE
    : 0;

  const slots = [];
  for (let m = openMin; m <= closeMin; m += SLOT_INTERVAL) {
    if (m < nowMin) continue;
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

// Ensure opening hours are requested at startup so prepareCheckout can use API data
loadOpeningHoursFromApi();

/* ── Real API call ── */
async function checkAvailabilityAPI(date, time, guests) {
  try {
    const res = await fetch(
      `${CHECKOUT_API}/api/availability?date=${date}&time=${time}&guests=${guests}`,
    );
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
    // { available, freeSeats, bookedSeats, totalCapacity, requestedGuests }
  } catch (err) {
    console.error("checkAvailabilityAPI:", err);
    return null;
  }
}

/* ══════════════════════════════════════════════════════════════
   UI
   ══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const timeSelect = document.getElementById("co-time");
  const timeHint = document.getElementById("co-time-hint");
  const guestsValue = document.getElementById("co-guests-value");
  const guestsMinus = document.getElementById("co-guests-minus");
  const guestsPlus = document.getElementById("co-guests-plus");
  const seatsHint = document.getElementById("co-seats-hint");
  const submitBtn = document.getElementById("co-submit-btn");
  const nameInput = document.getElementById("co-name");
  const lastInput = document.getElementById("co-lastname");
  const emailInput = document.getElementById("co-email");

  if (!timeSelect) return;

  let selectedDate = new Date();
  let guestCount = 1;
  let seatsOk = false; // tracks latest availability result
  let checkTimer = null; // debounce timer

  /* ── Populate slots ── */
  function populateSlots(date) {
    selectedDate = date;
    seatsOk = false;
    timeSelect.innerHTML =
      '<option value="" disabled selected>Select time…</option>';

    const slots = generateSlots(date);

    if (slots.length === 0) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "Restaurant closed this day";
      timeSelect.appendChild(opt);
      if (timeHint) {
        timeHint.textContent = "Restaurant is closed on this day.";
        timeHint.style.color = "var(--red-glow)";
      }
      updateSubmitState();
      return;
    }

    if (timeHint) timeHint.textContent = "";

    slots.forEach((slot) => {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot;
      timeSelect.appendChild(opt);
    });

    updateSubmitState();
  }

  /* ── Check availability via API ── */
  async function checkAvailability() {
    const slot = timeSelect.value;
    if (!slot) {
      seatsOk = false;
      updateSubmitState();
      return;
    }

    if (seatsHint) {
      seatsHint.textContent = "Checking availability…";
      seatsHint.style.color = "var(--silver)";
    }

    const data = await checkAvailabilityAPI(
      toDateStr(selectedDate),
      slot,
      guestCount,
    );

    if (!data) {
      if (seatsHint) {
        seatsHint.textContent = "Could not check availability — try again.";
        seatsHint.style.color = "var(--silver)";
      }
      seatsOk = false;
    } else if (!data.available) {
      if (seatsHint) {
        seatsHint.textContent = `✗ Only ${data.freeSeats} seat${data.freeSeats !== 1 ? "s" : ""} available for ${guestCount} guests.`;
        seatsHint.style.color = "var(--red-glow)";
      }
      seatsOk = false;
    } else if (data.freeSeats <= 5) {
      if (seatsHint) {
        seatsHint.textContent = `⚠ Only ${data.freeSeats} seat${data.freeSeats !== 1 ? "s" : ""} left!`;
        seatsHint.style.color = "#fbbf24";
      }
      seatsOk = true;
    } else {
      if (seatsHint) {
        seatsHint.textContent = `✓ ${data.freeSeats} seats available`;
        seatsHint.style.color = "#4ade80";
      }
      seatsOk = true;
    }

    updateSubmitState();
  }

  /* ── Debounced availability check ── */
  function scheduleCheck() {
    clearTimeout(checkTimer);
    checkTimer = setTimeout(checkAvailability, 400);
  }

  /* ── Submit button state ── */
  function updateSubmitState() {
    if (!submitBtn) return;
    const slot = timeSelect.value;
    // If a non-admin user is logged in, only require time slot + availability
    const currentUser = typeof getUser === "function" ? getUser() : null;
    if (currentUser && currentUser.role !== "admin") {
      const can = !!(slot && seatsOk);
      submitBtn.disabled = !can;
      submitBtn.style.opacity = can ? "1" : "0.45";
      submitBtn.style.cursor = can ? "pointer" : "not-allowed";
      return;
    }

    const name = nameInput?.value.trim() || "";
    const last = lastInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const can = !!(slot && seatsOk && name && last && emailOk);
    submitBtn.disabled = !can;
    submitBtn.style.opacity = can ? "1" : "0.45";
    submitBtn.style.cursor = can ? "pointer" : "not-allowed";
  }

  /* ── Guest counter ── */
  guestsMinus?.addEventListener("click", () => {
    if (guestCount > 1) {
      guestCount--;
      if (guestsValue) guestsValue.textContent = guestCount;
      scheduleCheck();
    }
  });
  guestsPlus?.addEventListener("click", () => {
    guestCount++;
    if (guestsValue) guestsValue.textContent = guestCount;
    scheduleCheck();
  });

  timeSelect.addEventListener("change", checkAvailability);
  [nameInput, lastInput, emailInput].forEach((el) =>
    el?.addEventListener("input", updateSubmitState),
  );

  // If a non-admin user is logged in, prefill and hide contact fields
  const __currentUser = typeof getUser === "function" ? getUser() : null;
  if (__currentUser && __currentUser.role !== "admin") {
    try {
      if (nameInput) {
        nameInput.value = __currentUser.username || "";
        nameInput.closest(".input-group")?.classList.add("hidden");
      }
      if (lastInput) {
        lastInput.value = "";
        lastInput.closest(".input-group")?.classList.add("hidden");
      }
      if (emailInput) {
        emailInput.value = __currentUser.email || "";
        emailInput.closest(".input-group")?.classList.add("hidden");
      }
      document
        .getElementById("checkout-register-link")
        ?.classList.add("hidden");
    } catch (e) {
      console.warn("Could not auto-fill/hide contact inputs", e);
    }
  }

  /* ── Expose to order.js ── */
  window.prepareCheckout = (date) => {
    guestCount = 1;
    seatsOk = false;
    if (guestsValue) guestsValue.textContent = 1;
    if (seatsHint) seatsHint.textContent = "";
    const d = date || new Date();
    // If opening hours are still loading, wait for them
    const p = fetchOpeningHoursPromise || Promise.resolve();
    p.then(() => populateSlots(d)).catch(() => populateSlots(d));
  };
});
