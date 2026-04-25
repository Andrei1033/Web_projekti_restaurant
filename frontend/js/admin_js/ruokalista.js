"use strict";

const API_BASE = "http://localhost:3000/api";

// ===== APIN KUTSUT =====

async function fetchAllMenuItems() {
  try {
    const response = await fetch(`${API_BASE}/dishes`);
    if (!response.ok) throw new Error("Failed to fetch menu");
    return await response.json();
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
}

async function fetchMenuByDate(date) {
  try {
    const response = await fetch(`${API_BASE}/menu/day?date=${date}`);
    if (!response.ok) throw new Error("Failed to fetch menu for date");
    return await response.json();
  } catch (error) {
    console.error("Error fetching menu by date:", error);
    return null;
  }
}

async function saveDayTheme(date, themeTitle, themeImage = null) {
  try {
    // Hae päivän nimi
    const dateObj = new Date(date);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[dateObj.getUTCDay()];

    const response = await fetch(`${API_BASE}/menu/days`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: date,
        day_name: dayName,
        theme_title: themeTitle,
        theme_image: themeImage,
      }),
    });
    if (!response.ok) throw new Error("Failed to save theme");
    return await response.json();
  } catch (error) {
    console.error("Error saving theme:", error);
    return null;
  }
}

async function updateDayTheme(menuId, themeTitle, themeImage = null) {
  try {
    const response = await fetch(`${API_BASE}/menu/days/${menuId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme_title: themeTitle,
        theme_image: themeImage,
      }),
    });
    if (!response.ok) throw new Error("Failed to update theme");
    return await response.json();
  } catch (error) {
    console.error("Error updating theme:", error);
    return null;
  }
}

async function addDish(dishData) {
  try {
    const response = await fetch(`${API_BASE}/dishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dishData),
    });
    if (!response.ok) throw new Error("Failed to add dish");
    return await response.json();
  } catch (error) {
    console.error("Error adding dish:", error);
    return null;
  }
}

async function updateDish(dishId, dishData) {
  try {
    const response = await fetch(`${API_BASE}/dishes/${dishId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dishData),
    });
    if (!response.ok) throw new Error("Failed to update dish");
    return await response.json();
  } catch (error) {
    console.error("Error updating dish:", error);
    return null;
  }
}

async function deleteDish(dishId) {
  try {
    const response = await fetch(`${API_BASE}/dishes/${dishId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete dish");
    return true;
  } catch (error) {
    console.error("Error deleting dish:", error);
    return false;
  }
}

async function deleteDayTheme(date) {
  try {
    const response = await fetch(`${API_BASE}/menu/theme/${date}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete theme and dishes");
    return true;
  } catch (error) {
    console.error("Error deleting theme:", error);
    return false;
  }
}

// ===== MODAL HALLINTA =====

function openModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
  // Tyhjennä lomake
  if (id === "themeModal") {
    document.getElementById("themeDate").value = "";
    document.getElementById("themeTitle").value = "";
    document.getElementById("themeImage").value = "";
    delete document.getElementById("saveThemeBtn").dataset.editDate;
  }
  if (id === "dishModal") {
    document.getElementById("dishName").value = "";
    document.getElementById("dishPrice").value = "";
    document.getElementById("dishDescription").value = "";
    document.getElementById("dishDate").value = "";
    document.getElementById("dishTheme").value = "";
    document.getElementById("dishImage").value = "";
    document
      .querySelectorAll('#dishModal input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    delete document.getElementById("saveDishBtn").dataset.editId;
    delete document.getElementById("saveDishBtn").dataset.editDate;
  }
}

window.onclick = function (e) {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("show");
  }
};

// ===== PÄIVIEN RENDERÖINTI =====

let currentData = {}; // { "2026-04-20": { theme, dishes, date } }
let filterMode = "upcoming"; // 'upcoming' = only future; 'all' = include past + future

async function loadAndRender() {
  const container = document.getElementById("daysContainer");
  if (!container) return;

  container.innerHTML = '<div class="loading">Ladataan ruokalistaa...</div>';

  try {
    // Kokoa päivämäärät näkymään: joko vain tulevat tai menneet + tulevat
    const today = new Date();
    const dates = [];
    const pastDays = 60;
    const futureDays = 60;
    const start = filterMode === "all" ? -pastDays : 0;
    const end = futureDays;
    for (let i = start; i <= end; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    currentData = {};
    for (const date of dates) {
      const data = await fetchMenuByDate(date);

      // ✅ TARKISTUS: Näytetään VAIN jos on teema TAI ruokalajeja
      const hasTheme = data && data.theme_title && data.theme_title !== null;
      const hasDishes = data && data.dishes && data.dishes.length > 0;

      if (hasTheme || hasDishes) {
        currentData[date] = {
          theme: data.theme_title || null,
          theme_image: data.theme_image || null,
          menu_id: data.menu_id || null,
          dishes: data.dishes || [],
          date: date,
        };
      }
      // Jos ei ole teemaa eikä ruokalajeja, älä lisää currentDataan
    }

    // Tarkista onko yhtään päivää
    if (Object.keys(currentData).length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <p>📅 Ei yhtään päivää teemoilla tai ruokalajeilla</p>
                    <button class="primary-btn" id="addFirstThemeBtn">+ Lisää ensimmäinen päiväteema</button>
                </div>`;

      document
        .getElementById("addFirstThemeBtn")
        ?.addEventListener("click", () => {
          document.getElementById("themeDate").disabled = false;
          document.getElementById("themeDate").value = new Date()
            .toISOString()
            .slice(0, 10);
          document.getElementById("themeTitle").value = "";
          document.getElementById("themeImage").value = "";
          openModal("themeModal");
        });
      return;
    }

    renderDays();
  } catch (error) {
    console.error("Error loading menu:", error);
    container.innerHTML =
      '<div class="error">Virhe ladattaessa ruokalistaa</div>';
  }
}

function renderDays() {
  const container = document.getElementById("daysContainer");
  if (!container) return;

  const sortedDates = Object.keys(currentData).sort();
  container.innerHTML = "";

  sortedDates.forEach((date) => {
    const dayData = currentData[date];
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString("fi-FI", { weekday: "long" });
    const formattedDate = dateObj.toLocaleDateString("fi-FI", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const dayCard = document.createElement("div");
    dayCard.className = "day-card";
    dayCard.dataset.date = date;

    // Header
    const headerHTML = `
            <div class="day-header">
                <div>
                    <h3>${dayName}</h3>
                    <p>${formattedDate}</p>
                </div>
                <div class="day-actions">
                    <button class="icon-btn edit-theme" data-date="${date}">✎ Teema</button>
                    ${dayData.theme ? `<button class="icon-btn red delete-theme" data-date="${date}">🗑 Poista teema</button>` : ""}
                </div>
            </div>
        `;

    // Teema
    const themeHTML = dayData.theme
      ? `<div class="day-theme">
                   <span class="theme-badge">🎨 ${dayData.theme}</span>
                   ${dayData.theme_image ? `<img src="http://localhost:3000${dayData.theme_image}" alt="${dayData.theme}" class="theme-preview">` : ""}
               </div>`
      : `<div class="day-theme empty-theme">
                   <span>⚠️ Ei teemaa</span>
                   <button class="small-btn add-theme" data-date="${date}">+ Lisää teema</button>
               </div>`;

    // Ruokalistat
    let dishesHTML = '<div class="dishes-list">';
    if (dayData.dishes.length === 0) {
      dishesHTML += `<div class="empty-dishes">
                              <p>Ei ruokalajeja</p>
                              <button class="small-btn add-dish" data-date="${date}">+ Lisää ruokalaji</button>
                           </div>`;
    } else {
      dayData.dishes.forEach((dish) => {
        dishesHTML += `
                    <div class="dish-item" data-dish-id="${dish.id}">
                        <div class="dish-info">
                            <strong>${dish.name}</strong>
                            <p class="dish-desc">${dish.description || "Ei kuvausta"}</p>
                            <div class="dish-meta">
                                <span class="dish-price">${parseFloat(dish.price).toFixed(2)} €</span>
                                ${
                                  dish.dietary_tags
                                    ? dish.dietary_tags
                                        .split(",")
                                        .map(
                                          (tag) =>
                                            `<span class="diet-tag">${tag}</span>`,
                                        )
                                        .join("")
                                    : ""
                                }
                            </div>
                        </div>
                        <div class="dish-actions">
                            <button class="icon-btn edit-dish" data-id="${dish.id}" data-date="${date}">✎</button>
                            <button class="icon-btn red delete-dish" data-id="${dish.id}" data-date="${date}">🗑</button>
                        </div>
                    </div>
                `;
      });
      dishesHTML += `<div class="add-dish-footer"><button class="small-btn add-dish" data-date="${date}">+ Lisää uusi ruokalaji</button></div>`;
    }
    dishesHTML += "</div>";

    dayCard.innerHTML = headerHTML + themeHTML + dishesHTML;
    container.appendChild(dayCard);
  });

  // Lisää event listenerit
  attachEventListeners();
}

function attachEventListeners() {
  // Teeman muokkaus
  document.querySelectorAll(".edit-theme").forEach((btn) => {
    btn.addEventListener("click", () => openThemeModal(btn.dataset.date));
  });

  // Teeman poisto
  document.querySelectorAll(".delete-theme").forEach((btn) => {
    btn.addEventListener("click", () => deleteTheme(btn.dataset.date));
  });

  // Teeman lisäys (tyhjälle)
  document.querySelectorAll(".add-theme").forEach((btn) => {
    btn.addEventListener("click", () => openThemeModal(btn.dataset.date));
  });

  // Ruokalajin lisäys
  document.querySelectorAll(".add-dish").forEach((btn) => {
    btn.addEventListener("click", () => openDishModal(btn.dataset.date));
  });

  // Ruokalajin muokkaus
  document.querySelectorAll(".edit-dish").forEach((btn) => {
    btn.addEventListener("click", () =>
      openDishModal(btn.dataset.date, btn.dataset.id),
    );
  });

  // Ruokalajin poisto
  document.querySelectorAll(".delete-dish").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteDishHandler(btn.dataset.id, btn.dataset.date),
    );
  });
}

// ===== TEEMA MODAL =====

function openThemeModal(date) {
  const dayData = currentData[date];
  document.getElementById("themeDate").value = date;
  document.getElementById("themeDate").disabled = true;
  document.getElementById("themeTitle").value = dayData?.theme || "";
  document.getElementById("themeImage").value = dayData?.theme_image || "";

  openModal("themeModal");
}

async function saveTheme() {
  const date = document.getElementById("themeDate").value;
  const themeTitle = document.getElementById("themeTitle").value.trim();
  const themeImage = document.getElementById("themeImage").value.trim();

  if (!themeTitle) {
    alert("Teeman nimi on pakollinen!");
    return;
  }

  const result = await saveDayTheme(date, themeTitle, themeImage || null);
  if (result) {
    alert("Teema tallennettu!");
    closeModal("themeModal");
    await loadAndRender();
  } else {
    alert("Virhe tallennettaessa teemaa");
  }
}

async function deleteTheme(date) {
  if (
    !confirm(
      "Haluatko varmasti poistaa tämän päivän teeman? Kaikki päivän ruokalajit poistetaan myös!",
    )
  )
    return;

  const success = await deleteDayTheme(date);
  if (success) {
    alert("Teema poistettu");
    await loadAndRender();
  } else {
    alert("Virhe poistettaessa teemaa");
  }
}

// ===== RUOKALAJI MODAL =====

async function openDishModal(date, dishId = null) {
  document.getElementById("dishDate").value = date;
  document.getElementById("dishDate").disabled = true;

  if (dishId) {
    // Muokkaus - etsi ruokalaji
    const dayData = currentData[date];
    const dish = dayData.dishes.find((d) => d.id == dishId);
    if (dish) {
      document.getElementById("dishName").value = dish.name;
      document.getElementById("dishPrice").value = dish.price;
      document.getElementById("dishDescription").value = dish.description || "";
      document.getElementById("dishTheme").value =
        dish.theme_title || dayData.theme || "";
      document.getElementById("dishImage").value =
        dish.current_dish_image || "";

      const tags = dish.dietary_tags ? dish.dietary_tags.split(",") : [];
      document
        .querySelectorAll('#dishModal input[type="checkbox"]')
        .forEach((cb) => {
          cb.checked = tags.includes(cb.value);
        });

      document.getElementById("saveDishBtn").dataset.editId = dishId;
    }
  } else {
    // Uusi
    document.getElementById("dishName").value = "";
    document.getElementById("dishPrice").value = "";
    document.getElementById("dishDescription").value = "";
    document.getElementById("dishTheme").value = currentData[date]?.theme || "";
    document.getElementById("dishImage").value = "";
    document
      .querySelectorAll('#dishModal input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    delete document.getElementById("saveDishBtn").dataset.editId;
  }
  document.getElementById("saveDishBtn").dataset.editDate = date;

  openModal("dishModal");
}

async function saveDish() {
  const date = document.getElementById("dishDate").value;
  const name = document.getElementById("dishName").value.trim();
  const price = parseFloat(document.getElementById("dishPrice").value);
  const description = document.getElementById("dishDescription").value.trim();
  const theme = document.getElementById("dishTheme").value.trim();
  const image = document.getElementById("dishImage").value.trim();

  const dietaryTags = [];
  document
    .querySelectorAll('#dishModal input[type="checkbox"]:checked')
    .forEach((cb) => {
      dietaryTags.push(cb.value);
    });

  if (!name || isNaN(price) || price <= 0) {
    alert("Nimi ja kelvollinen hinta ovat pakollisia!");
    return;
  }

  const dishData = {
    name,
    price,
    description,
    theme_title: theme,
    date,
    dietary_tags: dietaryTags.join(","),
    current_dish_image: image || null,
  };

  const editId = document.getElementById("saveDishBtn").dataset.editId;
  let result;

  if (editId) {
    result = await updateDish(editId, dishData);
    if (result) alert("Ruokalaji päivitetty!");
  } else {
    // 1) Luo ruokalaji
    const createdDish = await addDish(dishData);
    if (!createdDish) {
      alert("Virhe lisättäessä ruokalajia");
      return;
    }

    // 2) Varmista että päiväteema (daily_menu) on olemassa ja hae sen id
    let menuId = currentData[date]?.menu_id || null;
    if (!menuId) {
      // Yritä luoda päivä (käyttää teemakenttää, voi olla tyhjä)
      const createdDay = await saveDayTheme(date, theme || "");
      if (createdDay && (createdDay.id || createdDay.menu_id)) {
        menuId = createdDay.id || createdDay.menu_id;
      } else {
        // Fallback: hae päivästä tiedot uudelleen
        const dayInfo = await fetchMenuByDate(date);
        menuId = dayInfo?.menu_id || null;
      }
    }

    // 3) Liitä luotu ruokalaji päivään
    if (menuId) {
      const addRes = await addDishToMenu(menuId, createdDish.id);
      if (!addRes) {
        alert("Ruokalaji lisätty, mutta sitä ei saatu liitettyä päivään");
      }
    } else {
      alert("Ruokalaji tallennettu, mutta päivää ei voitu luoda tai löytää");
    }

    result = createdDish;
    if (result) alert("Ruokalaji lisätty!");
  }

  if (result) {
    closeModal("dishModal");
    await loadAndRender();
  } else {
    alert("Virhe tallennettaessa ruokalajia");
  }
}

// Lisää annoksen liittäminen päivään
async function addDishToMenu(menuId, dishId, sort_order = 0) {
  try {
    const response = await fetch(`${API_BASE}/menu/days/${menuId}/dishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dish_id: dishId, sort_order }),
    });
    if (!response.ok) throw new Error("Failed to add dish to day");
    return await response.json();
  } catch (error) {
    console.error("Error adding dish to menu:", error);
    return null;
  }
}

async function deleteDishHandler(dishId, date) {
  if (!confirm("Haluatko varmasti poistaa tämän ruokalajin?")) return;

  const success = await deleteDish(dishId);
  if (success) {
    alert("Ruokalaji poistettu");
    await loadAndRender();
  } else {
    alert("Virhe poistettaessa ruokalajia");
  }
}

// ===== FILTERÖINTI =====

function filterByDate() {
  const datePicker = document.getElementById("dateFilter");
  const selectedDate = datePicker.value;
  if (!selectedDate) {
    loadAndRender();
    return;
  }

  const container = document.getElementById("daysContainer");
  const allDays = container.querySelectorAll(".day-card");
  allDays.forEach((day) => {
    if (day.dataset.date === selectedDate) {
      day.style.display = "block";
    } else {
      day.style.display = "none";
    }
  });
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
  // Lisää modaleiden HTML jos ei ole
  addModalHTML();

  // Napit
  document.getElementById("addThemeBtn")?.addEventListener("click", () => {
    document.getElementById("themeDate").disabled = false;
    document.getElementById("themeDate").value = new Date()
      .toISOString()
      .slice(0, 10);
    document.getElementById("themeTitle").value = "";
    document.getElementById("themeImage").value = "";
    openModal("themeModal");
  });

  document.getElementById("saveThemeBtn")?.addEventListener("click", saveTheme);
  document.getElementById("saveDishBtn")?.addEventListener("click", saveDish);
  document
    .getElementById("filterDateBtn")
    ?.addEventListener("click", filterByDate);

  // Näkymän valitsimet: vain tulevat / koko menu
  const showUpcomingBtn = document.getElementById("showUpcomingBtn");
  const showAllBtn = document.getElementById("showAllBtn");
  if (showUpcomingBtn && showAllBtn) {
    const updateViewButtons = () => {
      showUpcomingBtn.classList.toggle("active", filterMode === "upcoming");
      showAllBtn.classList.toggle("active", filterMode === "all");
    };

    showUpcomingBtn.addEventListener("click", () => {
      filterMode = "upcoming";
      updateViewButtons();
      loadAndRender();
    });

    showAllBtn.addEventListener("click", () => {
      filterMode = "all";
      updateViewButtons();
      loadAndRender();
    });

    updateViewButtons();
  }

  // Alustus
  loadAndRender();
});

function addModalHTML() {
  // Teema modali
  if (!document.getElementById("themeModal")) {
    const themeModal = document.createElement("div");
    themeModal.id = "themeModal";
    themeModal.className = "modal";
    themeModal.innerHTML = `
            <div class="modal-content">
                <h2>Lisää/muokkaa päivän teemaa</h2>
                <div class="form-group">
                    <label>Päivämäärä</label>
                    <input type="date" id="themeDate" />
                </div>
                <div class="form-group">
                    <label>Teeman nimi *</label>
                    <input type="text" id="themeTitle" placeholder="Esim. Ramen-ilta, Taco Tuesday..." />
                </div>
                <div class="form-group">
                    <label>Teemakuva (polku)</label>
                    <input type="text" id="themeImage" placeholder="uploads/menu/kuva.jpg" />
                </div>
                <div class="modal-actions">
                    <button class="primary-btn" id="saveThemeBtn">💾 Tallenna teema</button>
                    <button onclick="closeModal('themeModal')">Peruuta</button>
                </div>
            </div>
        `;
    document.body.appendChild(themeModal);
  }

  // Ruokalaji modali
  if (!document.getElementById("dishModal")) {
    const dishModal = document.createElement("div");
    dishModal.id = "dishModal";
    dishModal.className = "modal";
    dishModal.innerHTML = `
            <div class="modal-content wide">
                <h2>Lisää/muokkaa ruokalajia</h2>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nimi *</label>
                        <input type="text" id="dishName" />
                    </div>
                    <div class="form-group">
                        <label>Hinta (€) *</label>
                        <input type="number" id="dishPrice" step="0.01" />
                    </div>
                    <div class="form-group full">
                        <label>Kuvaus</label>
                        <textarea id="dishDescription" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Päivämäärä *</label>
                        <input type="date" id="dishDate" />
                    </div>
                    <div class="form-group">
                        <label>Teema</label>
                        <input type="text" id="dishTheme" placeholder="Teema (vapaaehtoinen)" />
                    </div>
                    <div class="form-group full">
                        <label>Erityisruokavaliot</label>
                        <div class="checkboxes">
                            <label><input type="checkbox" value="vegan" /> Vegaaninen</label>
                            <label><input type="checkbox" value="glutenfree" /> Gluteeniton</label>
                            <label><input type="checkbox" value="lactosefree" /> Laktoositon</label>
                        </div>
                    </div>
                    <div class="form-group full">
                        <label>Ruokakuva (polku)</label>
                        <input type="text" id="dishImage" placeholder="uploads/menu/ruoka.jpg" />
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="primary-btn" id="saveDishBtn">💾 Tallenna ruokalaji</button>
                    <button onclick="closeModal('dishModal')">Peruuta</button>
                </div>
            </div>
        `;
    document.body.appendChild(dishModal);
  }
}
