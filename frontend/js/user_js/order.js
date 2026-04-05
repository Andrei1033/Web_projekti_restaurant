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

'use strict';

/* ── Config ────────────────────────────────────────────────── */

/**
 * Placeholder menu data.
 * Key = "YYYY-MM-DD" (the actual date).
 * Each day is an array of dish objects.
 *
 * diet: array — possible values: 'vegan', 'glutenfree', 'lactosefree'
 * img: path to image file in assets/menu/
 */
const DAILY_MENU = {
  '2026-04-06': [
    {
      id: 'mon-1',
      name: 'Shoyu Ramen',
      desc: 'Clear soy broth, wavy noodles, chashu pork belly, soft-boiled egg & nori.',
      price: 15.90,
      img: '../assets/menu/ramen.jpg',
      diet: ['lactosefree']
    },
    {
      id: 'mon-2',
      name: 'Miso Veggie Ramen',
      desc: 'Rich white miso broth, tofu, shiitake mushrooms & spring onion.',
      price: 14.50,
      img: '../assets/menu/ramen_veg.jpg',
      diet: ['vegan', 'lactosefree']
    },
    {
      id: 'mon-3',
      name: 'Gyoza (6 pcs)',
      desc: 'Pan-fried pork & cabbage dumplings with yuzu ponzu dipping sauce.',
      price: 9.00,
      img: '../assets/menu/gyoza.jpg',
      diet: []
    }
  ],
  '2026-04-07': [
    {
      id: 'tue-1',
      name: 'Smash Burger',
      desc: 'Double smash patty, aged cheddar, caramelised onion & wolf sauce.',
      price: 13.90,
      img: '../assets/menu/burger.jpg',
      diet: ['glutenfree']
    },
    {
      id: 'tue-2',
      name: 'Mushroom Smash',
      desc: 'Portobello patty, vegan cheese, sriracha aioli & pickled jalapeño.',
      price: 13.50,
      img: '../assets/menu/burger_veg.jpg',
      diet: ['vegan', 'glutenfree']
    },
    {
      id: 'tue-3',
      name: 'Wolf Fries',
      desc: 'Crispy fries with rosemary salt & house aioli.',
      price: 5.00,
      img: '../assets/menu/fries.jpg',
      diet: ['vegan', 'glutenfree', 'lactosefree']
    }
  ],
  '2026-04-09': [
    {
      id: 'wed-1',
      name: 'Birria Tacos',
      desc: 'Braised beef in adobo, Oaxaca cheese, consommé for dipping.',
      price: 14.00,
      img: '../assets/menu/tacos.jpg',
      diet: []
    },
    {
      id: 'wed-2',
      name: 'Jackfruit Tacos',
      desc: 'Pulled jackfruit, guacamole, pico de gallo & lime crema.',
      price: 13.00,
      img: '../assets/menu/tacos_veg.jpg',
      diet: ['vegan', 'glutenfree']
    }
  ]
  // Add more dates as needed — or replace with API call
};

/* ── Diet tag config ── */
const DIET_LABELS = {
  vegan:       { label: 'Vegan',         css: 'tag-vegan'   },
  glutenfree:  { label: 'Gluten-free',   css: 'tag-gluten'  },
  lactosefree: { label: 'Lactose-free',  css: 'tag-lactose' }
};

/* ── Helpers ── */

/** Format a Date as "YYYY-MM-DD" */
function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Format a Date as "7 Apr 2026" */
function fmtDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Day name from Date */
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* ── State ── */
const TODAY        = new Date();
TODAY.setHours(0,0,0,0);

let currentDate    = new Date(TODAY); // the date currently shown
let cart           = {};              // { itemId: { item, qty } }

/* ── DOM refs ── */
const grid          = document.getElementById('order-menu-list');
const displayName   = document.getElementById('display-day-name');
const displayDate   = document.getElementById('display-date');
const todayPill     = document.getElementById('order-today-pill');
const summaryBar    = document.getElementById('order-summary-bar');
const osbCount      = document.getElementById('osb-item-count');
const osbTotal      = document.getElementById('osb-total');
const checkoutBtn   = document.getElementById('osb-checkout-btn');

/* ── Render day ── */
function renderDay(date) {
  const key      = toDateKey(date);
  const isToday  = key === toDateKey(TODAY);
  const items    = DAILY_MENU[key] || null;

  // Update header labels
  displayName.textContent = DAY_NAMES[date.getDay()].toUpperCase();
  displayDate.textContent = fmtDate(date);
  todayPill.classList.toggle('hidden', !isToday);

  // Fade out
  grid.classList.add('fading');

  setTimeout(() => {
    grid.innerHTML = '';

    if (!items || items.length === 0) {
      grid.innerHTML = `
        <div class="order-empty-state">
          <span class="empty-wolf">🐺</span>
          <h3>No menu yet</h3>
          <p>The kitchen is still planning this day's theme.<br>Check back soon!</p>
        </div>`;
    } else {
      items.forEach((item, i) => {
        const card = buildItemCard(item, i);
        grid.appendChild(card);
      });
    }

    grid.classList.remove('fading');
  }, 180);
}

/* ── Build a single menu item card ── */
function buildItemCard(item, index) {
  const card = document.createElement('div');
  card.className = 'order-item-card';
  card.style.animationDelay = `${index * 60}ms`;

  // Diet tags HTML
  const tagsHTML = item.diet.length
    ? item.diet.map(d => {
        const t = DIET_LABELS[d];
        return t ? `<span class="tag ${t.css}">${t.label}</span>` : '';
      }).join('')
    : '';

  // Current quantity from cart
  const currentQty = cart[item.id]?.qty || 0;

  card.innerHTML = `
    <div class="order-item-img${item.img ? '' : ' no-img'}">
      ${item.img
        ? `<img src="${item.img}" alt="${item.name}"
               onerror="this.parentElement.classList.add('no-img'); this.remove();">`
        : ''}
    </div>
    <div class="order-item-body">
      <div class="item-header">
        <span class="item-name">${item.name}</span>
        <span class="item-price">${item.price.toFixed(2)} €</span>
      </div>
      <p class="item-desc">${item.desc}</p>
      ${tagsHTML ? `<div class="diet-tags">${tagsHTML}</div>` : ''}
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

  /* ── Wire up quantity buttons ── */
  // eslint-disable-next-line no-unused-vars
  const qtyControl = card.querySelector('.qty-control');
  const qtyDisplay = card.querySelector('.qty-value');
  const addBtn     = card.querySelector('.add-to-cart-btn');

  let localQty = currentQty;

  card.querySelector('.qty-minus').addEventListener('click', () => {
    if (localQty > 1) { localQty--; qtyDisplay.textContent = localQty; }
  });

  card.querySelector('.qty-plus').addEventListener('click', () => {
    localQty++;
    qtyDisplay.textContent = localQty;
  });

  addBtn.addEventListener('click', () => {
    const qty = Math.max(localQty, 1);
    addToCart(item, qty);
    // Flash "Added!" feedback
    addBtn.textContent = 'Added!';
    addBtn.classList.add('added');
    setTimeout(() => {
      addBtn.textContent = 'Add to cart';
      addBtn.classList.remove('added');
    }, 1400);
    // Reset local qty display to 1 after adding
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
  const totalQty   = Object.values(cart).reduce((s, e) => s + e.qty, 0);
  const totalPrice = Object.values(cart).reduce((s, e) => s + e.item.price * e.qty, 0);

  osbCount.textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;
  osbTotal.textContent  = `${totalPrice.toFixed(2)} €`;

  const hasItems = totalQty > 0;
  summaryBar.classList.toggle('visible', hasItems);
  checkoutBtn.disabled = !hasItems;
}

/* ── Checkout modal population ── */
function openCheckoutModal() {
  const summary   = document.getElementById('checkout-summary');
  const totalEl   = document.getElementById('checkout-total-price');
  const overlay   = document.getElementById('modal-overlay');
  const modal     = document.getElementById('checkout-modal');

  if (!summary || !modal) return;

  // Build summary rows
  summary.innerHTML = '';
  let total = 0;

  Object.values(cart).forEach(({ item, qty }) => {
    const lineTotal = item.price * qty;
    total += lineTotal;
    const row = document.createElement('div');
    row.className = 'checkout-summary-row';
    row.innerHTML = `
      <span class="csr-name">${item.name}</span>
      <span class="csr-qty">×${qty}</span>
      <span class="csr-price">${lineTotal.toFixed(2)} €</span>
    `;
    summary.appendChild(row);
  });

  totalEl.textContent = `${total.toFixed(2)} €`;

  // Show modal via existing modals.js overlay mechanism
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}

/* ── Checkout form submit ── */
function setupCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = document.getElementById('co-name').value.trim();
    const surname = document.getElementById('co-lastname').value.trim();
    const email   = document.getElementById('co-email').value.trim();

    if (!name || !surname || !email) return;

    // TODO: POST to /api/orders with cart data + customer info
    console.log('Order placed:', { name, surname, email, cart });

    // Clear cart & close
    cart = {};
    updateSummaryBar();
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('checkout-modal').classList.add('hidden');
    form.reset();

    // Simple confirmation — replace with a proper success screen later
    alert(`Thank you, ${name}! Your order has been received. Confirmation sent to ${email}.`);
  });

  // "Register here" inside checkout modal opens the register modal
  const regLink = document.getElementById('checkout-register-link');
  if (regLink) {
    regLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('checkout-modal').classList.add('hidden');
      document.getElementById('register-modal')?.classList.remove('hidden');
    });
  }
}

/* ── Day navigation ── */
function changeDay(direction) {
  currentDate.setDate(currentDate.getDate() + direction);
  renderDay(currentDate);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Check if URL has ?day=wed&week=2026-W14 from week menu link
  const params  = new URLSearchParams(window.location.search);
  const dayParam  = params.get('day');
  const weekParam = params.get('week');

  if (dayParam && weekParam) {
    // Parse week + day into a date
    const [yearStr, wStr] = weekParam.split('-W');
    const year    = parseInt(yearStr, 10);
    const weekNum = parseInt(wStr, 10);
    const jan4    = new Date(year, 0, 4);
    const monday  = new Date(jan4);
    monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (weekNum - 1) * 7);
    const dayOffset = ['mon','tue','wed','thu','fri'].indexOf(dayParam);
    if (dayOffset >= 0) {
      currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + dayOffset);
    }
  }

  renderDay(currentDate);

  document.getElementById('prev-day')?.addEventListener('click', () => changeDay(-1));
  document.getElementById('next-day')?.addEventListener('click', () => changeDay(+1));

  checkoutBtn?.addEventListener('click', openCheckoutModal);

  setupCheckoutForm();
});
