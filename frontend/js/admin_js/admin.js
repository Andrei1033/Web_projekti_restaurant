/* eslint-disable no-unused-vars */
// Open modal
function openModal(id) {
   document.getElementById(id).style.display = 'flex';
}

// Close modal
function closeModal(id) {
   document.getElementById(id).style.display = 'none';
}

// Close when clicking the overlay/background
window.onclick = function (e) {
   document.querySelectorAll('.modal').forEach((modal) => {
      if (e.target === modal) modal.style.display = 'none';
   });
};

// Load modals.html automatically
document.addEventListener('DOMContentLoaded', () => {
   fetch('modals.html')
      .then((res) => res.text())
      .then((data) => {
         document.body.insertAdjacentHTML('beforeend', data);
      });
});

// add new product row
document.addEventListener('click', function (e) {
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
});

// ===== LASKE YHTEISSUMMA =====
document.addEventListener('input', function (e) {
   if (e.target.closest('.modal')) {
      calculateTotal();
   }
});

function calculateTotal() {
   let total = 0;

   document.querySelectorAll('.order-row').forEach((row) => {
      const qty = Number(row.querySelector('.qty')?.value || 0);
      const price = Number(row.querySelector('.price')?.value || 0);
      total += qty * price;
   });

   document.getElementById('orderTotal').textContent = total.toFixed(2) + '€';
}

// ===== TALLENNA TILAUS =====
function saveOrder() {
   const name = document.querySelector('#orderModal input[type="text"]').value;
   const email = document.querySelector('#orderModal input[type="email"]').value;

   const items = [];
   document.querySelectorAll('.order-row').forEach((row) => {
      const product = row.children[0].value;
      const qty = row.children[1].value;
      const price = row.children[2].value;

      if (product) {
         items.push({product, qty, price});
      }
   });

   const order = {
      id: 'ORD-' + Date.now(),
      name,
      email,
      items,
      total: document.getElementById('orderTotal').textContent,
      date: new Date().toLocaleString('fi-FI'),
   };

   const orders = JSON.parse(localStorage.getItem('orders')) || [];
   orders.push(order);
   localStorage.setItem('orders', JSON.stringify(orders));

   closeModal('orderModal');
   renderOrders();
}

// ===== RENDERÖI TILAUKSET =====

function loadOrders() {
   renderOrders();
}

function renderOrders() {
   const container = document.querySelector('.orders-grid');
   const orders = JSON.parse(localStorage.getItem('orders')) || [];

   // Poista vanhat (paitsi modal)
   container.querySelectorAll('.order').forEach((el) => el.remove());

   orders.forEach((order) => {
      const div = document.createElement('section');
      div.className = 'card order';

      let itemsHTML = '';
      order.items.forEach((item) => {
         itemsHTML += `
            <div class="item-row">
               <span>${item.qty}x ${item.product}</span>
               <span>${item.price}€</span>
            </div>
         `;
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
