/**
 * NightWolf Kitchen — Checkout Module
 *
 * Handles:
 *  - Generating pickup time slots for the selected day
 *  - Guest count selector (1–MAX_CAPACITY)
 *  - Availability check (simulated frontend — replace with real API later)
 *  - Submit button state (disabled until all fields valid + seats available)
 *
 * LATER — replace simulateAvailability() with:
 *   const data = await fetch(`/api/availability?date=YYYY-MM-DD&time=HH:MM&guests=N`).then(r=>r.json());
 *
 * Load AFTER modals.js and order.js:
 *   <script src="../js/user_js/checkout.js" defer></script>
 */

'use strict';

/* ── Config ────────────────────────────────────────────────── */

/** Restaurant opening hours per weekday (0=Sun … 6=Sat) */
const OPENING_HOURS = {
  0: null,               // Sunday — closed
  1: { open: '11:00', close: '22:00' }, // Monday
  2: { open: '11:00', close: '22:00' },
  3: { open: '11:00', close: '22:00' },
  4: { open: '11:00', close: '22:00' },
  5: { open: '11:00', close: '22:00' }, // Friday
  6: { open: '12:00', close: '23:00' }, // Saturday
};

/** Slot interval in minutes */
const SLOT_INTERVAL = 30;

/** Last slot is this many minutes before closing */
const LAST_SLOT_OFFSET = 30;

/** Maximum seats in the restaurant */
const MAX_CAPACITY = 40;

/** Minimum advance booking in minutes (can't book current minute) */
const MIN_ADVANCE_MINUTES = 15;

/* ── Simulated availability data ──────────────────────────────
 * Keys: "YYYY-MM-DD HH:MM" → seats already booked
 * REPLACE THIS with a real API call when backend is ready.
 * ─────────────────────────────────────────────────────────── */
const BOOKED_SEATS = {
  // Example: heavily booked lunch slots
  [`${todayKey()} 12:00`]: 35,
  [`${todayKey()} 12:30`]: 38,
  [`${todayKey()} 13:00`]: 30,
  [`${todayKey()} 13:30`]: 22,
  [`${todayKey()} 19:00`]: 40, // fully booked
  [`${todayKey()} 19:30`]: 37,
};

/** Returns "YYYY-MM-DD" for today */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Returns "YYYY-MM-DD" for any Date */
function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

/* ── Time slot generator ──────────────────────────────────── */

/**
 * Generates an array of "HH:MM" time slot strings for a given date.
 * Skips past slots (with MIN_ADVANCE_MINUTES buffer for today).
 * Returns [] if restaurant is closed that day.
 *
 * @param {Date} date
 * @returns {string[]}
 */
function generateTimeSlots(date) {
  const hours = OPENING_HOURS[date.getDay()];
  if (!hours) return []; // closed

  const [openH, openM]   = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);

  const openMinutes  = openH  * 60 + openM;
  const closeMinutes = closeH * 60 + closeM - LAST_SLOT_OFFSET;

  const now = new Date();
  const isToday = dateKey(date) === dateKey(now);
  const nowMinutes = isToday
    ? now.getHours() * 60 + now.getMinutes() + MIN_ADVANCE_MINUTES
    : 0;

  const slots = [];
  for (let m = openMinutes; m <= closeMinutes; m += SLOT_INTERVAL) {
    if (m < nowMinutes) continue; // past slot
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

/* ── Availability check ───────────────────────────────────── */

/**
 * Returns available seats for a given date+time slot.
 * REPLACE body with real API call when backend is ready.
 *
 * @param {Date}   date
 * @param {string} timeSlot  "HH:MM"
 * @returns {number}  seats available (0 = fully booked)
 */
function getAvailableSeats(date, timeSlot) {
  const key = `${dateKey(date)} ${timeSlot}`;
  const booked = BOOKED_SEATS[key] || 0;
  return Math.max(0, MAX_CAPACITY - booked);
}

/* ══════════════════════════════════════════════════════════════
   UI — runs after DOM is ready
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM refs ── */
  const timeSelect    = document.getElementById('co-time');
  const timeHint      = document.getElementById('co-time-hint');
  const guestsValue   = document.getElementById('co-guests-value');
  const guestsMinus   = document.getElementById('co-guests-minus');
  const guestsPlus    = document.getElementById('co-guests-plus');
  const seatsHint     = document.getElementById('co-seats-hint');
  const submitBtn     = document.getElementById('co-submit-btn');
  const nameInput     = document.getElementById('co-name');
  const lastnameInput = document.getElementById('co-lastname');
  const emailInput    = document.getElementById('co-email');

  if (!timeSelect) return; // checkout modal not on this page

  let selectedDate   = new Date(); // updated when checkout opens
  let guestCount     = 1;
  let availableSeats = MAX_CAPACITY;

  /* ── Populate time slots ── */
  function populateTimeSlots(date) {
    selectedDate = date;
    timeSelect.innerHTML = '<option value="" disabled selected>Select time…</option>';

    const slots = generateTimeSlots(date);

    if (slots.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.disabled = true;
      opt.textContent = 'Restaurant closed this day';
      timeSelect.appendChild(opt);
      timeHint.textContent = 'The restaurant is closed on this day.';
      timeHint.style.color = 'var(--red-glow)';
      updateSubmitState();
      return;
    }

    timeHint.textContent = '';
    slots.forEach(slot => {
      const seatsLeft = getAvailableSeats(date, slot);
      const opt = document.createElement('option');
      opt.value = slot;
      if (seatsLeft === 0) {
        opt.textContent = `${slot} — Fully booked`;
        opt.disabled = true;
      } else if (seatsLeft <= 5) {
        opt.textContent = `${slot} — Only ${seatsLeft} seats left!`;
      } else {
        opt.textContent = slot;
      }
      timeSelect.appendChild(opt);
    });

    updateSeatsHint();
    updateSubmitState();
  }

  /* ── Update seat availability hint ── */
  function updateSeatsHint() {
    const slot = timeSelect.value;
    if (!slot) {
      seatsHint.textContent = '';
      return;
    }

    availableSeats = getAvailableSeats(selectedDate, slot);

    if (availableSeats === 0) {
      seatsHint.textContent = '✗ Fully booked at this time.';
      seatsHint.style.color = 'var(--red-glow)';
    } else if (guestCount > availableSeats) {
      seatsHint.textContent = `✗ Only ${availableSeats} seat${availableSeats > 1 ? 's' : ''} available — reduce guest count.`;
      seatsHint.style.color = 'var(--red-glow)';
    } else if (availableSeats <= 5) {
      seatsHint.textContent = `⚠ Only ${availableSeats} seat${availableSeats > 1 ? 's' : ''} left at this time!`;
      seatsHint.style.color = '#fbbf24';
    } else {
      seatsHint.textContent = `✓ ${availableSeats} seats available`;
      seatsHint.style.color = '#4ade80';
    }

    updateSubmitState();
  }

  /* ── Guest counter ── */
  guestsMinus.addEventListener('click', () => {
    if (guestCount > 1) {
      guestCount--;
      guestsValue.textContent = guestCount;
      updateSeatsHint();
    }
  });

  guestsPlus.addEventListener('click', () => {
    if (guestCount < MAX_CAPACITY) {
      guestCount++;
      guestsValue.textContent = guestCount;
      updateSeatsHint();
    }
  });

  /* ── Time slot change ── */
  timeSelect.addEventListener('change', updateSeatsHint);

  /* ── Form field changes → recheck submit state ── */
  [nameInput, lastnameInput, emailInput].forEach(el => {
    el?.addEventListener('input', updateSubmitState);
  });

  /* ── Submit button state ── */
  function updateSubmitState() {
    if (!submitBtn) return;

    const slot     = timeSelect.value;
    const name     = nameInput?.value.trim()     || '';
    const lastname = lastnameInput?.value.trim() || '';
    const email    = emailInput?.value.trim()    || '';
    const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const seatsOk  = slot && availableSeats > 0 && guestCount <= availableSeats;
    const fieldsOk = name && lastname && emailOk;

    submitBtn.disabled = !(seatsOk && fieldsOk);

    if (submitBtn.disabled) {
      submitBtn.style.opacity    = '0.45';
      submitBtn.style.cursor     = 'not-allowed';
    } else {
      submitBtn.style.opacity    = '1';
      submitBtn.style.cursor     = 'pointer';
    }
  }

  /* ── Expose populateTimeSlots so order.js can call it ──
   * order.js calls window.prepareCheckout(date) before opening the modal.
   * ── */
  window.prepareCheckout = function(date) {
    guestCount = 1;
    guestsValue.textContent = 1;
    populateTimeSlots(date || new Date());
  };

  /* ── Attach to checkout form submit (supplement order.js handler) ── */
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', () => {
      // order.js handles the actual submit logic
      // This just logs the extra fields for now
      console.log('Checkout extras:', {
        time:   timeSelect.value,
        guests: guestCount
      });
    });
  }

  /* ── Initial call if modal is already visible on load ── */
  populateTimeSlots(new Date());
});
