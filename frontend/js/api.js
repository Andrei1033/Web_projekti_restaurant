// ==========================
// TOAST NOTIFICATION SYSTEM
// ==========================

function showToast(message, type = "info", duration = 3000) {
  const toastContainer =
    document.getElementById("toast-container") || createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  document.body.appendChild(container);
  return container;
}

// Add toast styles
function addToastStyles() {
  if (document.getElementById("toast-styles")) return;
  const style = document.createElement("style");
  style.id = "toast-styles";
  style.textContent = `
    .toast {
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transform: translateX(400px);
      transition: all 0.3s ease;
      word-break: break-word;
    }
    .toast.show {
      opacity: 1;
      transform: translateX(0);
    }
    .toast-success {
      background-color: #4caf50;
      color: white;
    }
    .toast-error {
      background-color: #f44336;
      color: white;
    }
    .toast-info {
      background-color: #2196f3;
      color: white;
    }
    .toast-warning {
      background-color: #ff9800;
      color: white;
    }
  `;
  document.head.appendChild(style);
}

// Initialize toast styles
addToastStyles();

// ==========================
// HELPERS
// ==========================

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function updateUIForLogin(user) {
  const loginBtn = document.getElementById("login_button");
  const profileBtn = document.getElementById("profile_button");

  if (loginBtn) loginBtn.classList.add("hidden");
  if (profileBtn) profileBtn.classList.remove("hidden");
}

function updateUIForLogout() {
  const loginBtn = document.getElementById("login_button");
  const profileBtn = document.getElementById("profile_button");

  if (loginBtn) loginBtn.classList.remove("hidden");
  if (profileBtn) profileBtn.classList.add("hidden");
}

function closeAllModals() {
  const overlay = document.getElementById("modal-overlay");
  const allModals = document.querySelectorAll(".modal-content");

  if (overlay) overlay.classList.remove("active");
  setTimeout(() => {
    if (overlay) overlay.classList.add("hidden");
    allModals.forEach((m) => m.classList.add("hidden"));
  }, 300);
}

function setButtonLoading(btn, isLoading) {
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = "Loading...";
    btn.style.opacity = "0.6";
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.style.opacity = "1";
  }
}

// ==========================
// INPUT VALIDATION
// ==========================

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

// ==========================
// LOGIN
// ==========================

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const email = document.getElementById("login-identifier").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = loginForm.querySelector("button[type='submit']");

    // Validation
    if (!email) {
      showToast("Please enter your email", "warning");
      return;
    }
    if (!validateEmail(email)) {
      showToast("Please enter a valid email", "warning");
      return;
    }
    if (!password) {
      showToast("Please enter your password", "warning");
      return;
    }

    setButtonLoading(submitBtn, true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Login failed");
      }

      setUser(json.user);
      console.log("LOGIN OK:", json.user);

      showToast("Login successful 🐺", "success", 2000);
      loginForm.reset();

      // Close modal immediately
      closeAllModals();

      // Update UI
      updateUIForLogin(json.user);

      // Redirect for admin after a short delay
      if (json.user.role === "admin") {
        setTimeout(() => {
          window.location.href = "../admin_html/ruokalista.html";
        }, 500);
      }
    } catch (e) {
      console.log("LOGIN ERROR:", e.message);
      showToast(e.message, "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// ==========================
// REGISTER
// ==========================

const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm-password").value;
    const submitBtn = registerForm.querySelector("button[type='submit']");

    // Validation
    if (!username) {
      showToast("Please enter a username", "warning");
      return;
    }
    if (!email) {
      showToast("Please enter your email", "warning");
      return;
    }
    if (!validateEmail(email)) {
      showToast("Please enter a valid email", "warning");
      return;
    }
    if (!validatePassword(password)) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }
    if (password !== confirm) {
      showToast("Passwords do not match", "warning");
      return;
    }

    setButtonLoading(submitBtn, true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Registration failed");
      }

      showToast("Account created successfully 🐺", "success", 2000);
      registerForm.reset();

      // Switch to login modal
      setTimeout(() => {
        const overlay = document.getElementById("modal-overlay");
        const allModals = document.querySelectorAll(".modal-content");
        allModals.forEach((m) => m.classList.add("hidden"));
        document.getElementById("login-modal").classList.remove("hidden");
      }, 500);
    } catch (e) {
      console.log("REGISTER ERROR:", e.message);
      showToast(e.message, "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// ==========================
// ADMIN LOGIN
// ==========================

const adminLoginForm = document.getElementById("admin-login-form");

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const email = document
      .getElementById("admin-login-identifier")
      .value.trim();
    const password = document.getElementById("admin-login-password").value;
    const submitBtn = adminLoginForm.querySelector("button[type='submit']");

    // Validation
    if (!email) {
      showToast("Please enter your email", "warning");
      return;
    }
    if (!validateEmail(email)) {
      showToast("Please enter a valid email", "warning");
      return;
    }
    if (!password) {
      showToast("Please enter your password", "warning");
      return;
    }

    setButtonLoading(submitBtn, true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Login failed");
      }

      // Check if user has admin role
      if (json.user.role !== "admin") {
        throw new Error("This account does not have admin privileges");
      }

      setUser(json.user);
      console.log("ADMIN LOGIN OK:", json.user);

      showToast("Admin login successful 🐺", "success", 2000);
      adminLoginForm.reset();

      // Close modal immediately
      closeAllModals();

      // Redirect to admin page
      setTimeout(() => {
        window.location.href = "../admin_html/ruokalista.html";
      }, 500);
    } catch (e) {
      console.log("ADMIN LOGIN ERROR:", e.message);
      showToast(e.message, "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// ==========================
// AUTO UI ON PAGE LOAD
// ==========================

const user = getUser();

if (user) {
  console.log("Logged in:", user);
  updateUIForLogin(user);
}

// ==========================
// LOGOUT
// ==========================

const logoutBtn = document.getElementById("profile-logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Confirmation dialog
    const confirmed = confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setButtonLoading(logoutBtn, true);

    try {
      // Optional: Call logout endpoint if backend provides one
      // await fetch("http://localhost:3000/api/auth/logout", { method: "POST" });

      localStorage.removeItem("user");
      showToast("Logged out successfully", "success", 2000);

      updateUIForLogout();
      closeAllModals();

      // Reload page to reflect changes
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (e) {
      console.log("LOGOUT ERROR:", e.message);
      showToast("Logout failed", "error");
      setButtonLoading(logoutBtn, false);
    }
  });
}
