/* eslint-disable no-unused-vars */
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("modal-overlay");
  const allModals = document.querySelectorAll(".modal-content");
  const closeBtns = document.querySelectorAll(".close-modal");

  // Funktio modaalin avaamiseen
  const openModal = (modalId) => {
    allModals.forEach((m) => m.classList.add("hidden")); // Piilota muut
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.add("active"), 10);
    document.getElementById(modalId).classList.remove("hidden");
  };

  // Funktio modaalin sulkemiseen
  const closeModal = () => {
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.classList.add("hidden");
      allModals.forEach((m) => m.classList.add("hidden"));
    }, 300);
  };

  // Header-nappien kuuntelijat
  document
    .getElementById("login_button")
    .addEventListener("click", () => openModal("login-modal"));
  document
    .getElementById("to-login")
    .addEventListener("click", () => openModal("login-modal"));
  document
    .getElementById("register_button")
    .addEventListener("click", () => openModal("register-modal"));
  document
    .getElementById("shopping_list")
    .addEventListener("click", () => openModal("cart-modal"));
  document
    .getElementById("profile_button")
    .addEventListener("click", () => openModal("profile-modal"));
  document
    .getElementById("lang_select_button")
    .addEventListener("click", () => openModal("lang-modal"));

  // pay modal
  document
    .getElementById("osb-checkout-btn")
    ?.addEventListener("click", () => openModal("checkout-modal"));

  // Profile form handling: load/save + avatar preview (uses localStorage for demo)
  const profileForm = document.getElementById("profile-form");
  const avatarInput = document.getElementById("avatar-input");
  const avatarPreview = document.getElementById("avatar-preview");
  const avatarPlaceholder = document.getElementById("avatar-placeholder");
  const avatarUploadBtn = document.getElementById("avatar-upload-btn");

  const loadProfile = () => {
    try {
      const raw = localStorage.getItem("nw_profile");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!profileForm) return;
      profileForm.querySelector("#profile-name").value = data.name || "";
      profileForm.querySelector("#profile-email").value = data.email || "";
      profileForm.querySelector("#profile-phone").value = data.phone || "";
      // Do not prefill password for security; leave placeholder
      if (data.avatar) {
        avatarPreview.src = data.avatar;
        if (avatarPlaceholder) avatarPlaceholder.style.display = "none";
      }
    } catch (err) {
      // ignore
    }
  };

  const saveProfile = (obj) => {
    try {
      localStorage.setItem("nw_profile", JSON.stringify(obj));
    } catch (err) {
      /* ignore */
    }
  };

  if (avatarUploadBtn && avatarInput) {
    avatarUploadBtn.addEventListener("click", () => avatarInput.click());
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (avatarPreview) avatarPreview.src = reader.result;
        if (avatarPlaceholder) avatarPlaceholder.style.display = "none";
      };
      reader.readAsDataURL(file);
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = profileForm.querySelector("#profile-name")?.value || "";
      const email = profileForm.querySelector("#profile-email")?.value || "";
      const phone = profileForm.querySelector("#profile-phone")?.value || "";
      const password =
        profileForm.querySelector("#profile-password")?.value || "";
      const avatarSrc = avatarPreview?.src || "";
      saveProfile({
        name,
        email,
        phone,
        password: password ? "set" : "",
        avatar: avatarSrc,
      });
      // simple feedback: close modal
      closeModal();
    });

    // logout/clear
    const logoutBtn = document.getElementById("profile-logout");
    if (logoutBtn)
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("nw_profile");
        if (avatarPreview) avatarPreview.src = "../assets/default-avatar.png";
        if (avatarPlaceholder) avatarPlaceholder.style.display = "";
        profileForm.reset();
        closeModal();
      });
  }

  // populate when modal opens (ensure loaded profile values are shown)
  document
    .getElementById("profile_button")
    ?.addEventListener("click", loadProfile);

  // Sulkeminen
  closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
});
