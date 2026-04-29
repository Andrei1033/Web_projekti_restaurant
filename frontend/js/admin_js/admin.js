import { getCurrentUser, logout } from "./auth.js";

const userName = document.getElementById("adminUserName");
const logoutBtn = document.getElementById("logoutBtn");

function initAdmin() {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  userName.textContent = user.name;
}

logoutBtn.addEventListener("click", () => {
  logout();
  window.location.href = "index.html";
});

document.addEventListener("DOMContentLoaded", initAdmin);
