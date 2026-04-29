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

// ===== KUVAN UPLOAD =====

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE}/uploads/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Kuvan upload epäonnistui!");
    return null;
  }
}

// ===== GALLERIA =====

async function fetchGalleryImages() {
  try {
    const response = await fetch(`${API_BASE}/uploads/gallery`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch gallery");
    return await response.json();
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
}

function openGallery(targetInputId, currentValue = "") {
  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.id = "galleryModal";
  modal.innerHTML = `
    <div class="modal-content gallery-modal">
      <div class="gallery-header">
        <h2>Valitse kuva galleriasta</h2>
        <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <div class="gallery-upload-area">
        <div class="upload-box" id="galleryUploadBox">
          <span>📁</span>
          <p>Lataa uusi kuva</p>
          <small>Klikkaa tai raahaa tiedosto tähän</small>
          <input type="file" id="galleryUploadInput" accept="image/*" style="display:none">
        </div>
      </div>
      <div class="gallery-search">
        <input type="text" id="gallerySearch" placeholder="Hae kuvia..." class="search-input">
      </div>
      <div class="gallery-grid" id="galleryGrid">
        <div class="loading">Ladataan kuvia...</div>
      </div>
      <div class="modal-actions">
        <button class="secondary-btn" onclick="this.closest('.modal').remove()">Peruuta</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Lataa kuvat
  loadGalleryImages(targetInputId, currentValue);

  // Upload toiminnallisuus
  const uploadBox = document.getElementById("galleryUploadBox");
  const uploadInput = document.getElementById("galleryUploadInput");

  uploadBox.addEventListener("click", () => uploadInput.click());

  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("drag-over");
  });

  uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("drag-over");
  });

  uploadBox.addEventListener("drop", async (e) => {
    e.preventDefault();
    uploadBox.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      await handleGalleryUpload(file, targetInputId, currentValue);
    } else {
      alert("Tämä tiedosto ei ole kuva!");
    }
  });

  uploadInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleGalleryUpload(file, targetInputId, currentValue);
    }
  });
}

async function handleGalleryUpload(file, targetInputId, currentValue) {
  const uploadedUrl = await uploadImage(file);
  if (uploadedUrl) {
    // Päivitä kenttä
    document.getElementById(targetInputId).value = uploadedUrl;

    // Päivitä esikatselu
    updateImagePreview(targetInputId, uploadedUrl);

    // Sulje galleria ja avaa uudelleen (päivittää listan)
    document.getElementById("galleryModal").remove();
    openGallery(targetInputId, uploadedUrl);
  }
}

async function loadGalleryImages(targetInputId, currentValue) {
  const images = await fetchGalleryImages();
  const grid = document.getElementById("galleryGrid");

  if (images.length === 0) {
    grid.innerHTML = '<div class="empty-gallery">Ei kuvia galleriassa</div>';
    return;
  }

  const searchInput = document.getElementById("gallerySearch");
  let filteredImages = [...images];

  const renderImages = () => {
    const searchTerm = searchInput.value.toLowerCase();
    filteredImages = images.filter((img) =>
      img.toLowerCase().includes(searchTerm),
    );

    if (filteredImages.length === 0) {
      grid.innerHTML = '<div class="empty-gallery">Ei hakutuloksia</div>';
      return;
    }

    grid.innerHTML = filteredImages
      .map(
        (img) => `
      <div class="gallery-item ${currentValue === img ? "selected" : ""}" data-url="${img}">
        <img src="http://localhost:3000${img}" alt="${img}">
        <div class="gallery-item-overlay">
          <button class="select-image-btn">✓ Valitse</button>
        </div>
      </div>
    `,
      )
      .join("");

    // Lisää klikkaus tapahtumat
    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.classList.contains("select-image-btn")) {
          const url = item.dataset.url;
          document.getElementById(targetInputId).value = url;
          updateImagePreview(targetInputId, url);
          document.getElementById("galleryModal").remove();
        }
      });

      const selectBtn = item.querySelector(".select-image-btn");
      if (selectBtn) {
        selectBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const url = item.dataset.url;
          document.getElementById(targetInputId).value = url;
          updateImagePreview(targetInputId, url);
          document.getElementById("galleryModal").remove();
        });
      }
    });
  };

  renderImages();
  searchInput.addEventListener("input", renderImages);
}

function updateImagePreview(inputId, imageUrl) {
  const previewContainer = document.getElementById(`${inputId}-preview`);
  if (previewContainer) {
    if (imageUrl) {
      previewContainer.innerHTML = `
        <div class="image-preview">
          <img src="http://localhost:3000${imageUrl}" alt="Esikatselu">
          <button class="remove-image-btn" onclick="removeImage('${inputId}')">✕</button>
        </div>
      `;
    } else {
      previewContainer.innerHTML = "";
    }
  }
}

function removeImage(inputId) {
  document.getElementById(inputId).value = "";
  updateImagePreview(inputId, null);
}

// ===== MODAL HALLINTA =====

function openModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
  if (id === "themeModal") {
    document.getElementById("themeDate").value = "";
    document.getElementById("themeTitle").value = "";
    document.getElementById("themeImage").value = "";
    updateImagePreview("themeImage", null);
    delete document.getElementById("saveThemeBtn").dataset.editDate;
  }
  if (id === "dishModal") {
    document.getElementById("dishName").value = "";
    document.getElementById("dishPrice").value = "";
    document.getElementById("dishDescription").value = "";
    document.getElementById("dishDate").value = "";
    document.getElementById("dishTheme").value = "";
    document.getElementById("dishImage").value = "";
    updateImagePreview("dishImage", null);
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

let currentData = {};
let filterMode = "upcoming";

async function loadAndRender() {
  const container = document.getElementById("daysContainer");
  if (!container) return;

  container.innerHTML = '<div class="loading">Ladataan ruokalistaa...</div>';

  try {
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
    }

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
          updateImagePreview("themeImage", null);
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

    const headerHTML = `
      <div class="day-header">
        <div>
          <h3>${dayName}</h3>
          <p>${formattedDate}</p>
        </div>
        <div class="day-actions">
          <button class="icon-btn edit-theme" data-date="${date}">✎ Teema</button>
          ${
            dayData.theme
              ? `<button class="icon-btn red delete-theme" data-date="${date}">🗑 Poista teema</button>`
              : ""
          }
        </div>
      </div>
    `;

    const themeHTML = dayData.theme
      ? `<div class="day-theme">
          <span class="theme-badge">🎨 ${dayData.theme}</span>
          ${
            dayData.theme_image
              ? `<img src="http://localhost:3000${dayData.theme_image}" alt="${dayData.theme}" class="theme-preview">`
              : ""
          }
        </div>`
      : `<div class="day-theme empty-theme">
          <span>⚠️ Ei teemaa</span>
          <button class="small-btn add-theme" data-date="${date}">+ Lisää teema</button>
        </div>`;

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
                <span class="dish-price">${parseFloat(dish.price).toFixed(
                  2,
                )} €</span>
                ${
                  dish.dietary_tags
                    ? dish.dietary_tags
                        .split(",")
                        .map((tag) => `<span class="diet-tag">${tag}</span>`)
                        .join("")
                    : ""
                }
              </div>
              ${
                dish.current_dish_image
                  ? `<img src="http://localhost:3000${dish.current_dish_image}" class="dish-thumb">`
                  : ""
              }
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

  attachEventListeners();
}

function attachEventListeners() {
  document.querySelectorAll(".edit-theme").forEach((btn) => {
    btn.addEventListener("click", () => openThemeModal(btn.dataset.date));
  });

  document.querySelectorAll(".delete-theme").forEach((btn) => {
    btn.addEventListener("click", () => deleteTheme(btn.dataset.date));
  });

  document.querySelectorAll(".add-theme").forEach((btn) => {
    btn.addEventListener("click", () => openThemeModal(btn.dataset.date));
  });

  document.querySelectorAll(".add-dish").forEach((btn) => {
    btn.addEventListener("click", () => openDishModal(btn.dataset.date));
  });

  document.querySelectorAll(".edit-dish").forEach((btn) => {
    btn.addEventListener("click", () =>
      openDishModal(btn.dataset.date, btn.dataset.id),
    );
  });

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
  updateImagePreview("themeImage", dayData?.theme_image || null);
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
      updateImagePreview("dishImage", dish.current_dish_image || null);

      const tags = dish.dietary_tags ? dish.dietary_tags.split(",") : [];
      document
        .querySelectorAll('#dishModal input[type="checkbox"]')
        .forEach((cb) => {
          cb.checked = tags.includes(cb.value);
        });

      document.getElementById("saveDishBtn").dataset.editId = dishId;
    }
  } else {
    document.getElementById("dishName").value = "";
    document.getElementById("dishPrice").value = "";
    document.getElementById("dishDescription").value = "";
    document.getElementById("dishTheme").value = currentData[date]?.theme || "";
    document.getElementById("dishImage").value = "";
    updateImagePreview("dishImage", null);
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
    const createdDish = await addDish(dishData);
    if (!createdDish) {
      alert("Virhe lisättäessä ruokalajia");
      return;
    }

    let menuId = currentData[date]?.menu_id || null;
    if (!menuId) {
      const createdDay = await saveDayTheme(date, theme || "");
      if (createdDay && (createdDay.id || createdDay.menu_id)) {
        menuId = createdDay.id || createdDay.menu_id;
      } else {
        const dayInfo = await fetchMenuByDate(date);
        menuId = dayInfo?.menu_id || null;
      }
    }

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
  addModalHTML();

  document.getElementById("addThemeBtn")?.addEventListener("click", () => {
    document.getElementById("themeDate").disabled = false;
    document.getElementById("themeDate").value = new Date()
      .toISOString()
      .slice(0, 10);
    document.getElementById("themeTitle").value = "";
    document.getElementById("themeImage").value = "";
    updateImagePreview("themeImage", null);
    openModal("themeModal");
  });

  document.getElementById("saveThemeBtn")?.addEventListener("click", saveTheme);
  document.getElementById("saveDishBtn")?.addEventListener("click", saveDish);
  document
    .getElementById("filterDateBtn")
    ?.addEventListener("click", filterByDate);

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
          <label>Teemakuva</label>
          <div class="image-upload-container">
            <input type="text" id="themeImage" placeholder="Kuvan polku tai valitse galleriasta" readonly />
            <button type="button" class="secondary-btn gallery-btn" onclick="openGallery('themeImage', document.getElementById('themeImage').value)">📷 Valitse galleriasta</button>
            <button type="button" class="secondary-btn upload-btn" onclick="document.getElementById('themeImageUpload').click()">📁 Lataa uusi kuva</button>
            <input type="file" id="themeImageUpload" accept="image/*" style="display:none" />
          </div>
          <div id="themeImage-preview" class="image-preview-container"></div>
        </div>
        <div class="modal-actions">
          <button class="primary-btn" id="saveThemeBtn">💾 Tallenna teema</button>
          <button onclick="closeModal('themeModal')">Peruuta</button>
        </div>
      </div>
    `;
    document.body.appendChild(themeModal);

    // Upload handler for theme image
    document
      .getElementById("themeImageUpload")
      ?.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          const url = await uploadImage(file);
          if (url) {
            document.getElementById("themeImage").value = url;
            updateImagePreview("themeImage", url);
          }
        }
      });
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
            <label>Ruokakuva</label>
            <div class="image-upload-container">
              <input type="text" id="dishImage" placeholder="Kuvan polku tai valitse galleriasta" readonly />
              <button type="button" class="secondary-btn gallery-btn" onclick="openGallery('dishImage', document.getElementById('dishImage').value)">📷 Valitse galleriasta</button>
              <button type="button" class="secondary-btn upload-btn" onclick="document.getElementById('dishImageUpload').click()">📁 Lataa uusi kuva</button>
              <input type="file" id="dishImageUpload" accept="image/*" style="display:none" />
            </div>
            <div id="dishImage-preview" class="image-preview-container"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="primary-btn" id="saveDishBtn">💾 Tallenna ruokalaji</button>
          <button onclick="closeModal('dishModal')">Peruuta</button>
        </div>
      </div>
    `;
    document.body.appendChild(dishModal);

    // Upload handler for dish image
    document
      .getElementById("dishImageUpload")
      ?.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          const url = await uploadImage(file);
          if (url) {
            document.getElementById("dishImage").value = url;
            updateImagePreview("dishImage", url);
          }
        }
      });
  }
}
