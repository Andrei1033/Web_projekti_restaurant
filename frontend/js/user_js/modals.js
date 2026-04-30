/* eslint-disable no-unused-vars */
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("modal-overlay");
  const allModals = document.querySelectorAll(".modal-content");
  const closeBtns = document.querySelectorAll(".close-modal");

  // Open modal function
  const openModal = (modalId) => {
    allModals.forEach((m) => m.classList.add("hidden"));
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.add("active"), 10);
    document.getElementById(modalId).classList.remove("hidden");
  };

  // Close modal function (exposed globally for api.js)
  window.closeAllModals = () => {
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.classList.add("hidden");
      allModals.forEach((m) => m.classList.add("hidden"));
    }, 300);
  };

  // Header button listeners
  const loginBtn = document.getElementById("login_button");
  const registerBtn = document.getElementById("register_button");
  const shoppingBtn = document.getElementById("shopping_list");
  const profileBtn = document.getElementById("profile_button");
  const langBtn = document.getElementById("lang_select_button");
  const toLoginBtn = document.getElementById("to-login");
  const checkoutBtn = document.getElementById("osb-checkout-btn");
  const adminLoginToggleBtn = document.getElementById("admin-login-toggle");
  const backToUserLoginBtn = document.getElementById("back-to-user-login");
  const userLoginLinkBtn = document.getElementById("user_login_link");

  if (loginBtn)
    loginBtn.addEventListener("click", () => openModal("login-modal"));
  if (toLoginBtn)
    toLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("login-modal");
    });
  if (registerBtn)
    registerBtn.addEventListener("click", () => openModal("register-modal"));
  if (shoppingBtn)
    shoppingBtn.addEventListener("click", () => openModal("cart-modal"));
  if (profileBtn)
    profileBtn.addEventListener("click", () => openModal("profile-modal"));
  if (langBtn) langBtn.addEventListener("click", () => openModal("lang-modal"));
  if (checkoutBtn)
    checkoutBtn.addEventListener("click", () => openModal("checkout-modal"));

  if (adminLoginToggleBtn)
    adminLoginToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("admin-login-modal");
    });

  // Admin login navigation buttons (only used in admin modal)
  if (backToUserLoginBtn)
    backToUserLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("login-modal");
    });

  if (userLoginLinkBtn)
    userLoginLinkBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("login-modal");
    });

  // Profile form handling: load/save + avatar preview
  const profileForm = document.getElementById("profile-form");
  const avatarInput = document.getElementById("avatar-input");
  const avatarPreview = document.getElementById("avatar-preview");
  const avatarPlaceholder = document.getElementById("avatar-placeholder");
  const avatarUploadBtn = document.getElementById("avatar-upload-btn");

  const loadProfile = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user || !profileForm) return;

      // Load user data from logged-in user
      profileForm.querySelector("#profile-name").value = user.username || "";
      profileForm.querySelector("#profile-email").value = user.email || "";
      profileForm.querySelector("#profile-phone").value = user.phone || "";
      // Do not prefill password for security
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  // Avatar upload handler
  if (avatarUploadBtn && avatarInput) {
    avatarUploadBtn.addEventListener("click", () => avatarInput.click());
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (avatarPreview) avatarPreview.src = reader.result;
        if (avatarPlaceholder) avatarPlaceholder.style.display = "none";
      };
      reader.readAsDataURL(file);
    });
  }

  // Profile form submission
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = profileForm.querySelector("button[type='submit']");

      try {
        const name = profileForm.querySelector("#profile-name")?.value || "";
        const email = profileForm.querySelector("#profile-email")?.value || "";
        const phone = profileForm.querySelector("#profile-phone")?.value || "";
        const password =
          profileForm.querySelector("#profile-password")?.value || "";

        // Validate
        if (!name || !email) {
          showToast("Name and email are required", "warning");
          return;
        }

        setButtonLoading(submitBtn, true);

        // TODO: Call API to update profile
        // const response = await fetch("http://localhost:3000/api/users/profile", {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ name, email, phone, password })
        // });

        // For now, just update localStorage
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user) {
          user.username = name;
          user.email = email;
          user.phone = phone;
          localStorage.setItem("user", JSON.stringify(user));
        }

        showToast("Profile updated successfully", "success", 2000);
        window.closeAllModals?.();
      } catch (err) {
        console.error("Profile update error:", err);
        showToast("Failed to update profile", "error");
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Load profile when modal opens
  if (profileBtn) {
    profileBtn.addEventListener("click", loadProfile);
  }

  // Close modal handlers
  closeBtns.forEach((btn) =>
    btn.addEventListener("click", window.closeAllModals),
  );
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) window.closeAllModals();
    });
  }
});
