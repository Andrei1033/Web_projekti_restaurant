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

function logout() {
  localStorage.removeItem("user");
  window.location.href = "../user_html/index.html";
}

// ==========================
// LOGIN
// ==========================

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const email = document.getElementById("login-identifier").value;
    const password = document.getElementById("login-password").value;

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

      // 🔥 ADMIN redirect
      if (json.user.role === "admin") {
        window.location.href = "../admin_html/ruokalista.html";
      } else {
        alert("Welcome 🐺");
        location.reload();
      }
    } catch (e) {
      console.log("LOGIN ERROR:", e.message);
      alert(e.message);
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

    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm-password").value;

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

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
        throw new Error(json.error || "Register failed");
      }

      alert("Account created 🐺");
    } catch (e) {
      console.log("REGISTER ERROR:", e.message);
      alert(e.message);
    }
  });
}

// ==========================
// AUTO UI
// ==========================

const user = getUser();

if (user) {
  console.log("Logged in:", user);

  const loginBtn = document.getElementById("login_button");
  const profileBtn = document.getElementById("profile_button");

  if (loginBtn) loginBtn.classList.add("hidden");
  if (profileBtn) profileBtn.classList.remove("hidden");
}

// ==========================
// LOGOUT
// ==========================

const logoutBtn = document.getElementById("profile-logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
