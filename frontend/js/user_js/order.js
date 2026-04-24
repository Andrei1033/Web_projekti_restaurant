/**
 * NightWolf Kitchen — Order Page Module
 *
 * Handles:
 *  - Day navigation (prev/next, today highlighted)
 *  - Rendering menu items from DAILY_MENU data
 *  - Quantity controls per item
 *  - Cart state (item count + running total)
 *  - Sticky summary bar (slides up when cart is non-empty)
 *  - Checkout modal population & form submission
 *
 * LATER: replace DAILY_MENU lookup with:
 *   const items = await fetch(`/api/menu/day?date=YYYY-MM-DD`).then(r => r.json());
 */

"use strict";

/* ── Config ────────────────────────────────────────────────── */
const API_BASE = "http://localhost:3000/api";

/* ── Diet tag config ── */
const DIET_LABELS = {
  vegan: { label: "Vegan", css: "tag-vegan" },
  glutenfree: { label: "Gluten-free", css: "tag-gluten" },
  lactosefree: { label: "Lactose-free", css: "tag-lactose" },
};

/* ── Helpers ── */

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function fmtDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Fetch menu for specific date from API
 * @param {string} date - "YYYY-MM-DD"
 * @returns {Promise<Object>} - Menu data
 */
async function fetchDayMenu(date) {
  try {
    const response = await fetch(`${API_BASE}/menu/day?date=${date}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching day menu:", error);
    return null;
  }
}

/**
 * Get image URL
 */
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/uploads")) return `${API_BASE}${imagePath}`;
  return `../assets/menu/${imagePath}`;
}

/* ── State ── */
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

let currentDate = new Date(TODAY);
let cart = {};

/* ── DOM refs ── */
const grid = document.getElementById("order-menu-list");
const displayName = document.getElementById("display-day-name");
const displayDate = document.getElementById("display-date");
const todayPill = document.getElementById("order-today-pill");
const summaryBar = document.getElementById("order-summary-bar");
const osbCount = document.getElementById("osb-item-count");
const osbTotal = document.getElementById("osb-total");
const checkoutBtn = document.getElementById("osb-checkout-btn");

/* ── Render day ── */
async function renderDay(date) {
  const key = toDateKey(date);
  const isToday = key === toDateKey(TODAY);

  // Update header labels
  displayName.textContent = DAY_NAMES[date.getDay()].toUpperCase();
  displayDate.textContent = fmtDate(date);
  todayPill.classList.toggle("hidden", !isToday);

  // Show loading state
  grid.classList.add("fading");
  grid.innerHTML = '<div class="loading-spinner">Loading menu...</div>';

  try {
    // Fetch real data from API
    const menuData = await fetchDayMenu(key);

    setTimeout(() => {
      grid.innerHTML = "";

      if (!menuData || !menuData.dishes || menuData.dishes.length === 0) {
        grid.innerHTML = `
          <div class="order-empty-state">
            <span class="empty-wolf">🐺</span>
            <h3>No menu yet</h3>
            <p>The kitchen is still planning this day's theme.<br>Check back soon!</p>
          </div>`;
      } else {
        // Transform API dishes to format needed for display
        const items = menuData.dishes.map((dish) => ({
          id: dish.id,
          name: dish.name,
          desc: dish.description || "Delicious dish prepared with care",
          price: parseFloat(dish.price),
          img: getImageUrl(dish.current_dish_image),
          diet: dish.dietary_tags ? dish.dietary_tags.split(",") : [],
        }));

        items.forEach((item, i) => {
          const card = buildItemCard(item, i);
          grid.appendChild(card);
        });
      }

      grid.classList.remove("fading");
    }, 180);
  } catch (error) {
    console.error("Error rendering day:", error);
    grid.innerHTML = `
      <div class="order-empty-state">
        <span class="empty-wolf">⚠️</span>
        <h3>Error loading menu</h3>
        <p>Failed to load menu. Please try again later.</p>
      </div>`;
    grid.classList.remove("fading");
  }
}

/* ── Build a single menu item card ── */
function buildItemCard(item, index) {
  const card = document.createElement("div");
  card.className = "order-item-card";
  card.style.animationDelay = `${index * 60}ms`;

  const tagsHTML =
    item.diet && item.diet.length
      ? item.diet
          .map((d) => {
            const t = DIET_LABELS[d.trim()];
            return t ? `<span class="tag ${t.css}">${t.label}</span>` : "";
          })
          .join("")
      : "";

  const currentQty = cart[item.id]?.qty || 0;

  card.innerHTML = `
    <div class="order-item-img${item.img ? "" : " no-img"}">
      ${
        item.img
          ? `<img src="${item.img}" alt="${item.name}"
               onerror="this.parentElement.classList.add('no-img'); this.remove();">`
          : '<div class="placeholder-img"></div>'
      }
    </div>
    <div class="order-item-body">
      <div class="item-header">
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-price">${item.price.toFixed(2)} €</span>
      </div>
      <p class="item-desc">${escapeHtml(item.desc)}</p>
      ${tagsHTML ? `<div class="diet-tags">${tagsHTML}</div>` : ""}
      <div class="item-actions">
        <div class="qty-control" data-id="${item.id}">
          <button class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
          <span class="qty-value">${currentQty}</span>
          <button class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
        </div>
        <button class="add-to-cart-btn" data-id="${item.id}">
          Add to cart
        </button>
      </div>
    </div>
  `;

  let localQty = currentQty;
  const qtyDisplay = card.querySelector(".qty-value");
  const addBtn = card.querySelector(".add-to-cart-btn");

  card.querySelector(".qty-minus").addEventListener("click", () => {
    if (localQty > 1) {
      localQty--;
      qtyDisplay.textContent = localQty;
    }
  });

  card.querySelector(".qty-plus").addEventListener("click", () => {
    localQty++;
    qtyDisplay.textContent = localQty;
  });

  addBtn.addEventListener("click", () => {
    const qty = Math.max(localQty, 1);
    addToCart(item, qty);
    addBtn.textContent = "Added!";
    addBtn.classList.add("added");
    setTimeout(() => {
      addBtn.textContent = "Add to cart";
      addBtn.classList.remove("added");
    }, 1400);
    localQty = 1;
    qtyDisplay.textContent = 1;
  });

  return card;
}

/* ── Cart logic ── */
function addToCart(item, qty) {
  if (cart[item.id]) {
    cart[item.id].qty += qty;
  } else {
    cart[item.id] = { item, qty };
  }
  updateSummaryBar();
}

function updateSummaryBar() {
  const totalQty = Object.values(cart).reduce((s, e) => s + e.qty, 0);
  const totalPrice = Object.values(cart).reduce(
    (s, e) => s + e.item.price * e.qty,
    0,
  );

  osbCount.textContent = `${totalQty} item${totalQty !== 1 ? "s" : ""}`;
  osbTotal.textContent = `${totalPrice.toFixed(2)} €`;

  const hasItems = totalQty > 0;
  summaryBar.classList.toggle("visible", hasItems);
  checkoutBtn.disabled = !hasItems;
}

/* ── Helper to escape HTML ── */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ── Checkout modal population ── */
function openCheckoutModal() {
  const summary = document.getElementById("checkout-summary");
  const totalEl = document.getElementById("checkout-total-price");
  const overlay = document.getElementById("modal-overlay");
  const modal = document.getElementById("checkout-modal");

  if (!summary || !modal) return;

  summary.innerHTML = "";
  let total = 0;

  Object.values(cart).forEach(({ item, qty }) => {
    const lineTotal = item.price * qty;
    total += lineTotal;
    const row = document.createElement("div");
    row.className = "checkout-summary-row";
    row.innerHTML = `
      <span class="csr-name">${escapeHtml(item.name)}</span>
      <span class="csr-qty">×${qty}</span>
      <span class="csr-price">${lineTotal.toFixed(2)} €</span>
    `;
    summary.appendChild(row);
  });

  totalEl.textContent = `${total.toFixed(2)} €`;
  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");
}

/* ── Checkout form submit ── */
async function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("co-name").value.trim();
    const surname = document.getElementById("co-lastname").value.trim();
    const email = document.getElementById("co-email").value.trim();

    if (!name || !surname || !email) return;

    const orderData = {
      guest_name: `${name} ${surname}`,
      guest_email: email,
      pickup_date: toDateKey(currentDate),
      items: Object.values(cart).map(({ item, qty }) => ({
        dish_id: item.id,
        quantity: qty,
        unit_price: item.price,
      })),
    };

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Order submission failed");

      cart = {};
      updateSummaryBar();
      document.getElementById("modal-overlay").classList.add("hidden");
      document.getElementById("checkout-modal").classList.add("hidden");
      form.reset();

      alert(
        `Thank you, ${name}! Your order has been received. Confirmation sent to ${email}.`,
      );
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Sorry, there was an error placing your order. Please try again.");
    }
  });

  const regLink = document.getElementById("checkout-register-link");
  if (regLink) {
    regLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("checkout-modal").classList.add("hidden");
      document.getElementById("register-modal")?.classList.remove("hidden");
    });
  }
}

/* ── Day navigation ── */
function changeDay(direction) {
  currentDate.setDate(currentDate.getDate() + direction);
  renderDay(currentDate);
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get("date");

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    currentDate = new Date(dateParam);
    currentDate.setHours(0, 0, 0, 0);
  } else {
    const dayParam = params.get("day");
    const weekParam = params.get("week");
    if (dayParam && weekParam) {
      const [yearStr, wStr] = weekParam.split("-W");
      const year = parseInt(yearStr, 10);
      const weekNum = parseInt(wStr, 10);
      const jan4 = new Date(year, 0, 4);
      const monday = new Date(jan4);
      monday.setDate(
        jan4.getDate() - ((jan4.getDay() + 6) % 7) + (weekNum - 1) * 7,
      );
      const dayOffset = ["mon", "tue", "wed", "thu", "fri"].indexOf(dayParam);
      if (dayOffset >= 0) {
        currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + dayOffset);
        currentDate.setHours(0, 0, 0, 0);
      }
    }
  }

  renderDay(currentDate);

  document
    .getElementById("prev-day")
    ?.addEventListener("click", () => changeDay(-1));
  document
    .getElementById("next-day")
    ?.addEventListener("click", () => changeDay(+1));

  checkoutBtn?.addEventListener("click", openCheckoutModal);
  setupCheckoutForm();
});
