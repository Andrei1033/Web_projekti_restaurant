document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('modal-overlay');
    const allModals = document.querySelectorAll('.modal-content');
    const closeBtns = document.querySelectorAll('.close-modal');

    // Funktio modaalin avaamiseen
    const openModal = (modalId) => {
        allModals.forEach(m => m.classList.add('hidden')); // Piilota muut
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('active'), 10);
        document.getElementById(modalId).classList.remove('hidden');
    };

    // Funktio modaalin sulkemiseen
    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.classList.add('hidden');
            allModals.forEach(m => m.classList.add('hidden'));
        }, 300);
    };

    // Header-nappien kuuntelijat
    document.getElementById('login_button').addEventListener('click', () => openModal('login-modal'));
    document.getElementById('to-login').addEventListener('click', () => openModal('login-modal'));
    document.getElementById('register_button').addEventListener('click', () => openModal('register-modal'));
    document.getElementById('shopping_list').addEventListener('click', () => openModal('cart-modal'));
    document.getElementById('profile_button').addEventListener('click', () => openModal('profile-modal'));
    document.getElementById('lang_select_button').addEventListener('click', () => openModal('lang-modal'));

    // Sulkeminen
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
});
