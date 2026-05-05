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

// ── Config
const API_BASE = "http://localhost:3000";

// ── Diet tags ──
const DIET_LABELS = {
  vegan: { label: "Vegan", css: "tag-vegan" },
  glutenfree: { label: "Gluten-free", css: "tag-gluten" },
  lactosefree: { label: "Lactose-free", css: "tag-lactose" },
};

// ── Helpers ──
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fmtDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
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

// ── State ──
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

let currentDate = new Date(TODAY);
let cart = {}; // { dishId: { item, qty } }

// ── API ──
async function fetchDayMenu(dateStr) {
  try {
    const res = await fetch(`${API_BASE}/api/menu/day?date=${dateStr}`);
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchDayMenu:", err);
    return null;
  }
}

async function submitOrder(payload) {
  try {
    const token = localStorage.getItem("nw_token");
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `${res.status}`);
    return { ok: true, order: data };
  } catch (err) {
    console.error("submitOrder:", err);
    return { ok: false, error: err.message };
  }
}

//══════════════════════════════════════════════════════════════
//All DOM logic inside DOMContentLoaded
//══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("order-menu-list");
  const displayName = document.getElementById("display-day-name");
  const displayDate = document.getElementById("display-date");
  const todayPill = document.getElementById("order-today-pill");
  const summaryBar = document.getElementById("order-summary-bar");
  const osbCount = document.getElementById("osb-item-count");
  const osbTotal = document.getElementById("osb-total");
  const checkoutBtn = document.getElementById("osb-checkout-btn");

  // ── Render day
  async function renderDay(date) {
    const key = toDateKey(date);
    const isToday = key === toDateKey(TODAY);

    displayName.textContent = DAY_NAMES[date.getDay()].toUpperCase();
    displayDate.textContent = fmtDate(date);
    todayPill?.classList.toggle("hidden", !isToday);

    grid.innerHTML = `<div class="order-empty-state">
      <span class="empty-wolf">🐺</span><h3>Loading…</h3></div>`;

    const data = await fetchDayMenu(key);
    const items = data?.dishes || [];

    grid.classList.add("fading");
    setTimeout(() => {
      grid.innerHTML = "";
      if (items.length === 0) {
        grid.innerHTML = `
          <div class="order-empty-state">
            <span class="empty-wolf">🐺</span>
            <h3>No menu yet</h3>
            <p>The kitchen is still planning this day's theme.<br>Check back soon!</p>
          </div>`;
      } else {
        items.forEach((dish, i) => {
          // Normalize dish → item shape
          const item = {
            id: dish.id,
            name: dish.name,
            desc: dish.description || "",
            price: parseFloat(dish.price),
            img: getImageUrl(dish.current_dish_image || dish.image_url),
            diet: dish.dietary_tags
              ? dish.dietary_tags.split(",").map((t) => t.trim())
              : [],
          };
          grid.appendChild(buildItemCard(item, i));
        });
      }
      grid.classList.remove("fading");
    }, 180);
  }

  // ── Item card
  function buildItemCard(item, index) {
    const card = document.createElement("div");
    card.className = "order-item-card";
    card.style.animationDelay = `${index * 60}ms`;

    const tagsHTML = item.diet
      .map((d) =>
        DIET_LABELS[d]
          ? `<span class="tag ${DIET_LABELS[d].css}">${DIET_LABELS[d].label}</span>`
          : "",
      )
      .join("");

    card.innerHTML = `
      <div class="order-item-img${item.img ? "" : " no-img"}">
        ${
          item.img
            ? `<img src="${item.img}" alt="${escapeHtml(item.name)}"
               onerror="this.parentElement.classList.add('no-img');this.remove();">`
            : ""
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
          <div class="qty-control">
            <button class="qty-btn qty-minus" aria-label="Decrease">−</button>
            <span class="qty-value">1</span>
            <button class="qty-btn qty-plus"  aria-label="Increase">+</button>
          </div>
          <button class="add-to-cart-btn">Add to cart</button>
        </div>
      </div>`;

    const qtyDisplay = card.querySelector(".qty-value");
    const addBtn = card.querySelector(".add-to-cart-btn");
    let localQty = 1;

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
      addToCart(item, localQty);
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

  // ── Cart ──
  function addToCart(item, qty) {
    if (cart[item.id]) cart[item.id].qty += qty;
    else cart[item.id] = { item, qty };
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
    summaryBar?.classList.toggle("visible", hasItems);
    if (checkoutBtn) checkoutBtn.disabled = !hasItems;
  }

  // Open checkout modal
  function openCheckoutModal() {
    const summary = document.getElementById("checkout-summary");
    const totalEl = document.getElementById("checkout-total-price");
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById("checkout-modal");
    if (!summary || !modal || !overlay) return;

    // Populate order rows
    summary.innerHTML = "";
    let total = 0;
    Object.values(cart).forEach(({ item, qty }) => {
      const line = item.price * qty;
      total += line;
      const row = document.createElement("div");
      row.className = "checkout-summary-row";
      row.innerHTML = `
        <span class="csr-name">${escapeHtml(item.name)}</span>
        <span class="csr-qty">×${qty}</span>
        <span class="csr-price">${line.toFixed(2)} €</span>`;
      summary.appendChild(row);
    });
    if (totalEl) totalEl.textContent = `${total.toFixed(2)} €`;

    // Tell checkout.js which date we're ordering for
    // checkout.js listens for this and fills time slots + checks availability
    if (typeof window.prepareCheckout === "function") {
      window.prepareCheckout(currentDate);
    }

    // Open modal — use modals.js if available, otherwise manual
    if (typeof window.openModal === "function") {
      window.openModal("checkout-modal");
    } else {
      overlay.classList.remove("hidden");
      modal.classList.remove("hidden");
    }
  }

  // ── Checkout form submit ──
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Fields from checkout modal
      const name = document.getElementById("co-name")?.value.trim();
      const surname = document.getElementById("co-lastname")?.value.trim();
      const email = document.getElementById("co-email")?.value.trim();
      const time = document.getElementById("co-time")?.value;
      const guestCount = parseInt(
        document.getElementById("co-guests-value")?.textContent || "1",
        10,
      );

      if (!name || !surname || !email || !time) {
        alert("Please fill in all required fields and select a pickup time.");
        return;
      }

      const submitBtn = document.getElementById("co-submit-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Placing order…";
      }

      // Build payload — all items must be from currentDate
      const payload = {
        guest_name: `${name} ${surname}`,
        guest_email: email,
        pickup_date: toDateKey(currentDate),
        pickup_time: time,
        guest_count: guestCount,
        items: Object.values(cart).map(({ item, qty }) => ({
          dish_id: item.id,
          quantity: qty,
          unit_price: item.price,
        })),
      };

      const result = await submitOrder(payload);

      if (result.ok) {
        // Clear cart
        cart = {};
        updateSummaryBar();

        // Close modal
        if (typeof window.closeModal === "function") {
          window.closeModal();
        } else {
          document.getElementById("modal-overlay")?.classList.add("hidden");
          document.getElementById("checkout-modal")?.classList.add("hidden");
        }
        form.reset();
        alert(
          `Thank you, ${name}! Order #${result.order.id} confirmed.\nConfirmation sent to ${email}.`,
        );
      } else {
        alert(`Order failed: ${result.error}`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Place Order";
        }
      }
    });

    document
      .getElementById("checkout-register-link")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof window.openModal === "function")
          window.openModal("register-modal");
      });
  }

  // ----- Day navigation
  function changeDay(direction) {
    // Clear cart when changing day — can't mix days in one order
    if (Object.keys(cart).length > 0) {
      const ok = confirm("Changing the day will clear your cart. Continue?");
      if (!ok) return;
      cart = {};
      updateSummaryBar();
    }
    currentDate.setDate(currentDate.getDate() + direction);
    renderDay(currentDate);
  }

  document
    .getElementById("prev-day")
    ?.addEventListener("click", () => changeDay(-1));
  document
    .getElementById("next-day")
    ?.addEventListener("click", () => changeDay(+1));
  checkoutBtn?.addEventListener("click", openCheckoutModal);

  // ── URL params → jump to date
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get("date");

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    currentDate = new Date(dateParam + "T00:00:00");
  }

  renderDay(currentDate);
});
