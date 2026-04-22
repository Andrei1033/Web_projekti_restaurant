document
  .getElementById("login-form")
  .addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const email = document.getElementById("login-identifier").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Login failed");
      }

      console.log("LOGIN OK:", json);

      localStorage.setItem("user", JSON.stringify(json.user));
    } catch (e) {
      console.log("LOGIN ERROR:", e.message);
    }
  });

document
  .getElementById("register-form")
  .addEventListener("submit", async (evt) => {
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
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Register failed");
      }

      console.log("REGISTER OK:", json);

      alert("Account created 🐺");
    } catch (e) {
      console.log("REGISTER ERROR:", e.message);
    }
  });
