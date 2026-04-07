/* eslint-disable no-unused-vars */

// ===== MODAL HALLINTA =====
function openModal(id) {
   const modal = document.getElementById(id);
   if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
   const modal = document.getElementById(id);
   if (modal) modal.style.display = 'none';
}

// Sulje modal, jos klikataan overlayta
window.onclick = function (e) {
   if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
   }
};

// ===== LISÄÄ TUOTE =====
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

// ===== LASKETAAN YHTEISSUMMA =====
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
   const totalEl = document.getElementById('orderTotal');
   if (totalEl) totalEl.textContent = total.toFixed(2) + '€';
}

// ===== TALLENNA TILAUS =====
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

      if (product) {
         items.push({product, qty, price});
      }
   });

   if (!name || !email || items.length === 0) {
      alert('Täytä kaikki pakolliset kentät ja lisää vähintään yksi tuote!');
      return;
   }

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
   resetModal();
   renderOrders();
}

// Tyhjennä modal seuraavaa tilausta varten
function resetModal() {
   const modal = document.getElementById('orderModal');
   if (!modal) return;

   modal.querySelector('input[type="text"]').value = '';
   modal.querySelector('input[type="email"]').value = '';
   modal.querySelector('textarea').value = '';
   modal.querySelectorAll('.order-row').forEach((row, index) => {
      if (index === 0) {
         row.querySelector('input[type="text"]').value = '';
         row.querySelector('.qty').value = 1;
         row.querySelector('.price').value = 0;
      } else {
         row.remove();
      }
   });
   calculateTotal();
}

// ===== RENDERÖI TILAUKSET =====
function renderOrders() {
   const container = document.querySelector('.orders-grid');
   if (!container) return;

   // Poista vanhat tilaukset (älä poista modal)
   container.querySelectorAll('.order').forEach((el) => el.remove());

   const orders = JSON.parse(localStorage.getItem('orders')) || [];

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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
   renderOrders();
});
