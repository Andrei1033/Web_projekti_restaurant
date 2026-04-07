// ===== MODAL HALLINTA =====
function openModal(id) {
   document.getElementById(id).classList.add('show');
}

function closeModal(id) {
   document.getElementById(id).classList.remove('show');
}

// Klikkaus overlaylla sulkee modalin
window.onclick = function (e) {
   if (e.target.classList.contains('modal')) {
      e.target.classList.remove('show');
   }
};

// ===== RUOKALISTAN HALLINTA =====
document.addEventListener('click', function (e) {
   // Lisää uusi ruokalaji tilausmodalissa
   if (e.target.matches('.add-item')) {
      const row = document.createElement('div');
      row.className = 'order-row';
      row.innerHTML = `
            <input type="text" placeholder="Tuotteen nimi">
            <input type="number" value="1" class="qty">
            <input type="number" value="0" class="price">
        `;
      e.target.before(row);
   }

   // Lisää tai päivitä ruokalaji ruokalista-modalissa
   if (e.target.matches('#addMenuItem')) {
      const menus = JSON.parse(localStorage.getItem('menus')) || [];
      const index = e.target.dataset.editIndex;

      const itemData = {
         name: document.querySelector('#foodModal input[name="name"]').value,
         price: document.querySelector('#foodModal input[name="price"]').value,
         desc: document.querySelector('#foodModal textarea[name="desc"]').value,
         date: document.querySelector('#foodModal input[name="date"]').value,
         theme: document.querySelector('#foodModal input[name="theme"]').value,
         allergens: Array.from(document.querySelectorAll('#foodModal input[type="checkbox"]:checked')).map((cb) => cb.parentElement.textContent.trim()),
      };

      if (index !== undefined) {
         menus[index] = itemData;
         delete e.target.dataset.editIndex; // Poista edit-indeksi
      } else {
         menus.push(itemData);
      }

      localStorage.setItem('menus', JSON.stringify(menus));
      closeModal('foodModal');
      renderMenu();
   }

   // ✎ Muokkaa ruokalajia
   if (e.target.matches('.menu-card .icon-btn') && !e.target.classList.contains('red')) {
      const card = e.target.closest('.menu-card');
      const menus = JSON.parse(localStorage.getItem('menus')) || [];
      const index = Array.from(document.querySelectorAll('.menu-card')).indexOf(card);
      if (index > -1) {
         const item = menus[index];
         openModal('foodModal');
         document.querySelector('#foodModal input[name="name"]').value = item.name;
         document.querySelector('#foodModal input[name="price"]').value = item.price;
         document.querySelector('#foodModal textarea[name="desc"]').value = item.desc;
         document.querySelector('#foodModal input[name="date"]').value = item.date;
         document.querySelector('#foodModal input[name="theme"]').value = item.theme;
         document.querySelectorAll('#foodModal input[type="checkbox"]').forEach((cb) => {
            cb.checked = item.allergens.includes(cb.parentElement.textContent.trim());
         });
         document.getElementById('addMenuItem').dataset.editIndex = index;
      }
   }

   // 🗑 Poista ruokalaji
   if (e.target.matches('.menu-card .icon-btn.red')) {
      const card = e.target.closest('.menu-card');
      const menus = JSON.parse(localStorage.getItem('menus')) || [];
      const index = Array.from(document.querySelectorAll('.menu-card')).indexOf(card);
      if (index > -1) {
         menus.splice(index, 1);
         localStorage.setItem('menus', JSON.stringify(menus));
         renderMenu();
      }
   }

   // 🗑 Poista tilaus
   if (e.target.matches('.order .icon-btn.red')) {
      const card = e.target.closest('.order');
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const index = Array.from(document.querySelectorAll('.order')).indexOf(card);
      if (index > -1) {
         orders.splice(index, 1);
         localStorage.setItem('orders', JSON.stringify(orders));
         renderOrders();
      }
   }
});

// ===== RUOKALISTAN RENDERÖINTI =====
function renderMenu() {
   const container = document.querySelector('.menu-container');
   if (!container) return;

   container.innerHTML = '';
   const menus = JSON.parse(localStorage.getItem('menus')) || [];

   menus.forEach((item) => {
      const div = document.createElement('section');
      div.className = 'card menu-card';

      const allergensHTML = item.allergens.map((a) => `<span class="allergen">${a}</span>`).join(' ');

      div.innerHTML = `
            <div class="menu-left">
                <h3>${item.name}</h3>
                <div class="meta-row">
                    <span class="chip">📅 ${item.date}</span>
                    <span class="badge">${item.theme}</span>
                </div>
                <p class="menu-desc">${item.desc}</p>
                ${allergensHTML}
            </div>
            <div class="menu-right">
                <div class="price">${item.price}€</div>
                <div class="actions">
                    <button class="icon-btn">✎</button>
                    <button class="icon-btn red">🗑</button>
                </div>
            </div>
        `;
      container.appendChild(div);
   });
}

// ===== TILAUKSET =====
function calculateTotal() {
   let total = 0;
   document.querySelectorAll('.order-row').forEach((row) => {
      const qty = Number(row.querySelector('.qty')?.value || 0);
      const price = Number(row.querySelector('.price')?.value || 0);
      total += qty * price;
   });
   const totalEl = document.getElementById('orderTotal');
   if (totalEl) totalEl.textContent = total.toFixed(2) + '€';
}

document.addEventListener('input', function (e) {
   if (e.target.closest('.modal')) {
      calculateTotal();
   }
});

function saveOrder() {
   const modal = document.getElementById('orderModal');
   if (!modal) return;

   const name = modal.querySelector('input[type="text"]').value;
   const email = modal.querySelector('input[type="email"]').value;

   const items = [];
   modal.querySelectorAll('.order-row').forEach((row) => {
      const product = row.children[0].value;
      const qty = row.children[1].value;
      const price = row.children[2].value;
      if (product) items.push({product, qty, price});
   });

   const order = {
      id: 'ORD-' + Date.now(),
      name,
      email,
      items,
      total: document.getElementById('orderTotal')?.textContent || '0€',
      date: new Date().toLocaleString('fi-FI'),
   };

   const orders = JSON.parse(localStorage.getItem('orders')) || [];
   orders.push(order);
   localStorage.setItem('orders', JSON.stringify(orders));

   closeModal('orderModal');
   renderOrders();
}

function renderOrders() {
   const container = document.querySelector('.orders-grid');
   if (!container) return;

   container.querySelectorAll('.order').forEach((el) => el.remove());
   const orders = JSON.parse(localStorage.getItem('orders')) || [];

   orders.forEach((order) => {
      const div = document.createElement('section');
      div.className = 'card order';

      let itemsHTML = '';
      order.items.forEach((item) => {
         itemsHTML += `<div class="item-row"><span>${item.qty}x ${item.product}</span><span>${item.price}€</span></div>`;
      });

      div.innerHTML = `
            <div class="order-top">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-info">
                        <span>${order.date}</span>
                        <span>👤 ${order.name}</span>
                        <span>✉️ ${order.email}</span>
                    </div>
                </div>
            </div>
            <div class="order-items">
                ${itemsHTML}
                <div class="total-row">
                    <span>Yhteensä:</span>
                    <span>${order.total}</span>
                </div>
            </div>
        `;
      container.prepend(div);
   });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
   renderMenu();
   renderOrders();
});

/*
// ===== MODAL HALLINTA =====
function openModal(id) {
   document.getElementById(id).classList.add('show');
}

function closeModal(id) {
   document.getElementById(id).classList.remove('show');
}

// Klikkaus overlaylla sulkee modalin
window.onclick = function (e) {
   if (e.target.classList.contains('modal')) {
      e.target.classList.remove('show');
   }
};

// ===== RUOKALISTAN HALLINTA =====
document.addEventListener('click', function (e) {
   // Lisää ruokalaji modalissa
   if (e.target.matches('.add-item')) {
      const row = document.createElement('div');
      row.className = 'order-row';
      row.innerHTML = `
         <input type="text" placeholder="Tuotteen nimi">
         <input type="number" value="1" class="qty">
         <input type="number" value="0" class="price">
      `;
      e.target.before(row);
   }

   // Lisää ruokalaji ruokalista-modalissa
   if (e.target.matches('#addMenuItem')) {
      const name = document.querySelector('#foodModal input[name="name"]').value;
      const price = document.querySelector('#foodModal input[name="price"]').value;
      const desc = document.querySelector('#foodModal textarea[name="desc"]').value;
      const date = document.querySelector('#foodModal input[name="date"]').value;
      const theme = document.querySelector('#foodModal input[name="theme"]').value;

      const allergens = [];
      document.querySelectorAll('#foodModal input[type="checkbox"]:checked').forEach((cb) => {
         allergens.push(cb.parentElement.textContent.trim());
      });

      const menus = JSON.parse(localStorage.getItem('menus')) || [];
      menus.push({name, price, desc, date, theme, allergens});
      localStorage.setItem('menus', JSON.stringify(menus));

      closeModal('foodModal');
      renderMenu();
   }
});

// ===== RUOKALISTAN RENDERÖINTI =====
function renderMenu() {
   const container = document.querySelector('.menu-container');
   if (!container) return;

   container.innerHTML = '';
   const menus = JSON.parse(localStorage.getItem('menus')) || [];

   menus.forEach((item) => {
      const div = document.createElement('section');
      div.className = 'card menu-card';

      const allergensHTML = item.allergens.map((a) => `<span class="allergen">${a}</span>`).join(' ');

      div.innerHTML = `
         <div class="menu-left">
            <h3>${item.name}</h3>
            <div class="meta-row">
               <span class="chip">📅 ${item.date}</span>
               <span class="badge">${item.theme}</span>
            </div>
            <p class="menu-desc">${item.desc}</p>
            ${allergensHTML}
         </div>
         <div class="menu-right">
            <div class="price">${item.price}€</div>
            <div class="actions">
               <button class="icon-btn">✎</button>
               <button class="icon-btn red">🗑</button>
            </div>
         </div>
      `;

      container.appendChild(div);
   });
}

// ===== TILAUKSET =====
function calculateTotal() {
   let total = 0;
   document.querySelectorAll('.order-row').forEach((row) => {
      const qty = Number(row.querySelector('.qty')?.value || 0);
      const price = Number(row.querySelector('.price')?.value || 0);
      total += qty * price;
   });
   const totalEl = document.getElementById('orderTotal');
   if (totalEl) totalEl.textContent = total.toFixed(2) + '€';
}

document.addEventListener('input', function (e) {
   if (e.target.closest('.modal')) {
      calculateTotal();
   }
});

function saveOrder() {
   const modal = document.getElementById('orderModal');
   if (!modal) return;

   const name = modal.querySelector('input[type="text"]').value;
   const email = modal.querySelector('input[type="email"]').value;

   const items = [];
   modal.querySelectorAll('.order-row').forEach((row) => {
      const product = row.children[0].value;
      const qty = row.children[1].value;
      const price = row.children[2].value;
      if (product) items.push({product, qty, price});
   });

   const order = {
      id: 'ORD-' + Date.now(),
      name,
      email,
      items,
      total: document.getElementById('orderTotal')?.textContent || '0€',
      date: new Date().toLocaleString('fi-FI'),
   };

   const orders = JSON.parse(localStorage.getItem('orders')) || [];
   orders.push(order);
   localStorage.setItem('orders', JSON.stringify(orders));

   closeModal('orderModal');
   renderOrders();
}

function renderOrders() {
   const container = document.querySelector('.orders-grid');
   if (!container) return;

   container.querySelectorAll('.order').forEach((el) => el.remove());
   const orders = JSON.parse(localStorage.getItem('orders')) || [];

   orders.forEach((order) => {
      const div = document.createElement('section');
      div.className = 'card order';

      let itemsHTML = '';
      order.items.forEach((item) => {
         itemsHTML += `<div class="item-row"><span>${item.qty}x ${item.product}</span><span>${item.price}€</span></div>`;
      });

      div.innerHTML = `
         <div class="order-top">
            <div>
               <div class="order-id">${order.id}</div>
               <div class="order-info">
                  <span>${order.date}</span>
                  <span>👤 ${order.name}</span>
                  <span>✉️ ${order.email}</span>
               </div>
            </div>
         </div>
         <div class="order-items">
            ${itemsHTML}
            <div class="total-row">
               <span>Yhteensä:</span>
               <span>${order.total}</span>
            </div>
         </div>
      `;
      container.prepend(div);
   });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
   renderMenu();
   renderOrders();
});
*/
