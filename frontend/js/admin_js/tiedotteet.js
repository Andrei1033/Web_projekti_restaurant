/* eslint-disable no-unused-vars */

/* eslint-disable no-unused-vars */

let editingId = null;

// ===== MODAL =====
function openModal(id) {
   const modal = document.getElementById(id);
   if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
   const modal = document.getElementById(id);
   if (modal) modal.style.display = 'none';
   editingId = null;
}

// ===== OVERLAY CLOSE =====
window.onclick = function (e) {
   if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
      editingId = null;
   }
};

// ===== SAVE / UPDATE =====
document.addEventListener('click', function (e) {
   if (e.target.matches('.primary-btn') && e.target.textContent.includes('Julkaise')) {
      saveNotice();
   }
});

function saveNotice() {
   const modal = document.getElementById('noticeModal');

   const title = modal.querySelector('input[type="text"]').value;
   const message = modal.querySelector('textarea').value;
   const type = modal.querySelector('select').value;
   const expire = modal.querySelector('input[type="date"]').value;
   const active = modal.querySelector('input[type="checkbox"]').checked;

   if (!title || !message) {
      alert('Täytä pakolliset kentät!');
      return;
   }

   let notices = JSON.parse(localStorage.getItem('notices')) || [];

   if (editingId) {
      // 🔁 UPDATE
      notices = notices.map((n) => (n.id === editingId ? {...n, title, message, type, expire, active} : n));
   } else {
      // ➕ CREATE
      const notice = {
         id: 'NOTICE-' + Date.now(),
         title,
         message,
         type,
         expire,
         active,
         date: new Date().toLocaleString('fi-FI'),
      };
      notices.push(notice);
   }

   localStorage.setItem('notices', JSON.stringify(notices));

   closeModal('noticeModal');
   resetModal();
   renderNotices();
}

// ===== EDIT =====
document.addEventListener('click', function (e) {
   if (e.target.matches('.edit-btn')) {
      const id = e.target.dataset.id;
      const notices = JSON.parse(localStorage.getItem('notices')) || [];
      const notice = notices.find((n) => n.id === id);

      if (!notice) return;

      editingId = id;

      const modal = document.getElementById('noticeModal');

      modal.querySelector('input[type="text"]').value = notice.title;
      modal.querySelector('textarea').value = notice.message;
      modal.querySelector('select').value = notice.type;
      modal.querySelector('input[type="date"]').value = notice.expire || '';
      modal.querySelector('input[type="checkbox"]').checked = notice.active;

      openModal('noticeModal');
   }
});

// ===== DELETE =====
document.addEventListener('click', function (e) {
   if (e.target.matches('.delete-btn')) {
      const id = e.target.dataset.id;

      let notices = JSON.parse(localStorage.getItem('notices')) || [];
      notices = notices.filter((n) => n.id !== id);

      localStorage.setItem('notices', JSON.stringify(notices));
      renderNotices();
   }
});

// ===== RESET =====
function resetModal() {
   const modal = document.getElementById('noticeModal');

   modal.querySelector('input[type="text"]').value = '';
   modal.querySelector('textarea').value = '';
   modal.querySelector('input[type="date"]').value = '';
   modal.querySelector('input[type="checkbox"]').checked = true;
   editingId = null;
}

// ===== RENDER =====
function renderNotices() {
   const container = document.querySelector('.container');
   const notices = JSON.parse(localStorage.getItem('notices')) || [];

   document.querySelectorAll('.notice').forEach((el) => el.remove());

   notices.forEach((notice) => {
      const div = document.createElement('section');
      div.className = `card notice ${getColor(notice.type)}`;

      div.innerHTML = `
         <div class="notice-top">
            <div>
               <h3>${notice.title}</h3>
               <small>${notice.type}</small>
            </div>
            <div class="notice-actions">
               <button class="icon-btn edit-btn" data-id="${notice.id}">✎</button>
               <button class="icon-btn red delete-btn" data-id="${notice.id}">🗑</button>
            </div>
         </div>

         <p class="notice-desc">${notice.message}</p>

         <div class="notice-meta">
            <span>📅 Luotu: ${notice.date}</span>
            ${notice.expire ? `<span>📅 Vanhenee: ${notice.expire}</span>` : ''}
         </div>
      `;

      container.appendChild(div);
   });
}

// ===== COLOR =====
function getColor(type) {
   switch (type) {
      case 'Uutinen':
         return 'green';
      case 'Varoitus':
         return 'yellow';
      default:
         return 'blue';
   }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', renderNotices);

/*
// ===== MODAL =====
function openModal(id) {
   const modal = document.getElementById(id);
   if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
   const modal = document.getElementById(id);
   if (modal) modal.style.display = 'none';
}

// Sulje modal overlay klikkauksella
window.onclick = function (e) {
   if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
   }
};

// ===== TALLENNA TIEDOTE =====
document.addEventListener('click', function (e) {
   if (e.target.matches('.primary-btn') && e.target.textContent.includes('Julkaise')) {
      saveNotice();
   }
});

function saveNotice() {
   const modal = document.getElementById('noticeModal');

   const title = modal.querySelector('input[type="text"]').value;
   const message = modal.querySelector('textarea').value;
   const type = modal.querySelector('select').value;
   const expire = modal.querySelector('input[type="date"]').value;
   const active = modal.querySelector('input[type="checkbox"]').checked;

   if (!title || !message) {
      alert('Täytä pakolliset kentät!');
      return;
   }

   const notice = {
      id: 'NOTICE-' + Date.now(),
      title,
      message,
      type,
      expire,
      active,
      date: new Date().toLocaleString('fi-FI'),
   };

   const notices = JSON.parse(localStorage.getItem('notices')) || [];
   notices.push(notice);
   localStorage.setItem('notices', JSON.stringify(notices));

   closeModal('noticeModal');
   resetModal();
   renderNotices();
}

// ===== RESET MODAL =====
function resetModal() {
   const modal = document.getElementById('noticeModal');

   modal.querySelector('input[type="text"]').value = '';
   modal.querySelector('textarea').value = '';
   modal.querySelector('input[type="date"]').value = '';
   modal.querySelector('input[type="checkbox"]').checked = true;
}

// ===== RENDERÖINTI =====
function renderNotices() {
   const container = document.querySelector('.container');
   const notices = JSON.parse(localStorage.getItem('notices')) || [];

   // Poistetaan vanhat tiedotteet (ei modal)
   document.querySelectorAll('.notice').forEach((el) => el.remove());

   notices.forEach((notice) => {
      const div = document.createElement('section');
      div.className = `card notice ${getColor(notice.type)}`;

      div.innerHTML = `
         <div class="notice-top">
            <div>
               <h3>${notice.title}</h3>
               <small>${notice.type}</small>
            </div>
            <div class="notice-actions">
               <button class="icon-btn delete-btn" data-id="${notice.id}">🗑</button>
            </div>
         </div>

         <p class="notice-desc">${notice.message}</p>

         <div class="notice-meta">
            <span>📅 Luotu: ${notice.date}</span>
            ${notice.expire ? `<span>📅 Vanhenee: ${notice.expire}</span>` : ''}
         </div>
      `;

      container.appendChild(div);
   });
}

// ===== POISTO =====
document.addEventListener('click', function (e) {
   if (e.target.matches('.delete-btn')) {
      const id = e.target.dataset.id;

      let notices = JSON.parse(localStorage.getItem('notices')) || [];
      notices = notices.filter((n) => n.id !== id);
      localStorage.setItem('notices', JSON.stringify(notices));

      renderNotices();
   }
});

// ===== TYYPPI VÄRI =====
function getColor(type) {
   switch (type) {
      case 'Uutinen':
         return 'green';
      case 'Varoitus':
         return 'yellow';
      default:
         return 'blue';
   }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
   renderNotices();
});
*/
