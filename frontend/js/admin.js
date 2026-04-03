// Avaa modal
function openModal(id) {
   document.getElementById(id).style.display = 'flex';
}

// Sulje modal
function closeModal(id) {
   document.getElementById(id).style.display = 'none';
}

// Sulje kun klikataan taustaa
window.onclick = function (e) {
   document.querySelectorAll('.modal').forEach((modal) => {
      if (e.target === modal) {
         modal.style.display = 'none';
      }
   });
};

// Lataa modals.html automaattisesti
document.addEventListener('DOMContentLoaded', () => {
   fetch('modals.html')
      .then((res) => res.text())
      .then((data) => {
         document.body.insertAdjacentHTML('beforeend', data);
      });
});

// lisää uusi tuoterivi
document.addEventListener('click', function (e) {
   if (e.target.classList.contains('add-item')) {
      const row = document.createElement('div');
      row.className = 'order-row';
      row.innerHTML = `
      <input type="text" placeholder="Tuotteen nimi">
      <input type="number" value="1">
      <input type="number" value="0">
    `;
      e.target.before(row);
   }
});
