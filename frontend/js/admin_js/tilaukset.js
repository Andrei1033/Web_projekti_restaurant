// tilaukset.js

// ===== TOKEN HALLINTA =====
function getToken() {
  return localStorage.getItem("token");
}

function checkAuth() {
  const token = getToken();
  if (!token) {
    alert("Sinun täytyy kirjautua sisään!");
    window.location.href = "../user_html/index.html";
    return false;
  }
  return true;
}

// API konfiguraatio
const API_BASE_URL = "http://localhost:3000";

// Globaalit muuttujat
let allOrders = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentFilter = "all";
let currentEditOrder = null; // Tallennetaan muokattava tilaus
let dayMenuItems = []; // Päivän menu tuotteet

// Tilauksen status vaihtoehdot suomeksi (vain näytettäväksi)
const statusOptions = {
  pending: "Odottaa",
  confirmed: "Vahvistettu",
  ready: "Valmis noudettavaksi",
  completed: "Valmis",
  cancelled: "Peruttu",
};

// Status värit
const statusColors = {
  pending: "#ffc107",
  confirmed: "#28a745",
  ready: "#17a2b8",
  completed: "#6c757d",
  cancelled: "#dc3545",
};

// DOM elementit
document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners();
  fetchAllOrders();
});

// Event listenerien alustus
function initializeEventListeners() {
  const filterBtn = document.getElementById("filter-btn");
  if (filterBtn) {
    filterBtn.addEventListener("click", toggleFilterDropdown);
  }

  document.querySelectorAll(".filter-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      const status = e.target.dataset.status;
      currentFilter = status;
      currentPage = 1;
      updateActiveFilter(status);
      filterAndDisplayOrders();
      closeFilterDropdown();
    });
  });

  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      fetchAllOrders();
    });
  }

  document.getElementById("prev-page")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterAndDisplayOrders();
    }
  });

  document.getElementById("next-page")?.addEventListener("click", () => {
    const totalPages = Math.ceil(getFilteredOrders().length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      filterAndDisplayOrders();
    }
  });

  document.querySelector(".modal-close")?.addEventListener("click", closeModal);
  document.querySelector(".modal")?.addEventListener("click", (e) => {
    if (e.target === document.querySelector(".modal")) {
      closeModal();
    }
  });
}

// Hae kaikki tilaukset API:sta
async function fetchAllOrders() {
  showLoading();

  try {
    let url = `${API_BASE_URL}/api/orders/admin/all`;

    console.log("Haetaan tilaukset URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Saatu data:", data);

    if (Array.isArray(data)) {
      allOrders = data;
    } else if (data.orders && Array.isArray(data.orders)) {
      allOrders = data.orders;
    } else {
      allOrders = [];
    }

    filterAndDisplayOrders();
  } catch (error) {
    console.error("Virhe tilauksia haettaessa:", error);
    showError(`Tilausten hakeminen epäonnistui: ${error.message}`);
    document.querySelector(".orders-grid").innerHTML = `
            <div class="error-message">
                <p>⚠️ Tilausten hakeminen epäonnistui</p>
                <p style="font-size: 12px; color: #666;">${error.message}</p>
                <button onclick="location.reload()" class="retry-btn">Yritä uudelleen</button>
            </div>
        `;
  } finally {
    hideLoading();
  }
}

// Hae yksittäinen tilaus ID:llä
async function fetchOrderById(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Virhe tilauksen haussa:", error);
    return null;
  }
}

// Hae päivän menu tietyn päivämäärän mukaan
async function fetchMenuByDate(date) {
  try {
    const dateStr = new Date(date).toISOString().split("T")[0];
    const response = await fetch(
      `${API_BASE_URL}/api/menu/day?date=${dateStr}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    // Backend returns an object: { date, day_name, dishes: [...] }
    return Array.isArray(data) ? data : data.dishes || [];
  } catch (error) {
    console.error("Virhe päivän menun haussa:", error);
    return [];
  }
}

// Suodata ja näytä tilaukset
function getFilteredOrders() {
  let filtered = [...allOrders];

  if (currentFilter === "upcoming") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = filtered.filter((order) => {
      if (!order.pickup_date) return false;
      const d = new Date(order.pickup_date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    });
  }

  return filtered;
}

function filterAndDisplayOrders() {
  const filteredOrders = getFilteredOrders();
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(start, start + itemsPerPage);

  displayOrders(paginatedOrders);
  updatePagination(currentPage, totalPages);
  updateStats(filteredOrders.length);
}

function displayOrders(orders) {
  const ordersGrid = document.querySelector(".orders-grid");

  if (!orders || orders.length === 0) {
    ordersGrid.innerHTML = `
            <div class="no-orders">
                <p>🔍 Ei tilauksia näytettäväksi</p>
                <small>Kokeile muuttaa suodattimia tai luo uusi tilaus</small>
            </div>
        `;
    return;
  }

  ordersGrid.innerHTML = orders.map((order) => createOrderCard(order)).join("");

  orders.forEach((order) => {
    const card = document.querySelector(
      `.order-card[data-order-id="${order.id}"]`,
    );
    if (card) {
      const viewBtn = card.querySelector(".view-order-btn");
      const editBtn = card.querySelector(".edit-order-btn");
      const deleteBtn = card.querySelector(".delete-order-btn");

      viewBtn?.addEventListener("click", () => viewOrderDetails(order.id));
      editBtn?.addEventListener("click", () => editOrder(order.id));
      deleteBtn?.addEventListener("click", () => confirmDeleteOrder(order.id));
    }
  });
}

function createOrderCard(order) {
  const pickupTime = order.pickup_time ? order.pickup_time.substring(0, 5) : "";
  const customerName =
    order.guest_name || order.username || "Rekisteröitynyt käyttäjä";

  const statusColor = statusColors[order.status] || "#6c757d";

  return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-id">#${order.id}</div>

            </div>
            <div class="order-body">
                <div class="order-info">
                    <div class="info-row">
                        <span class="info-label">👤 Asiakas:</span>
                        <span class="info-value">${escapeHtml(customerName)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📅 Noutopäivä:</span>
                        <span class="info-value">${formatDate(order.pickup_date)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">⏰ Noutoaika:</span>
                        <span class="info-value">${pickupTime}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">👥 Henkilöä:</span>
                        <span class="info-value">${order.guest_count}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">💰 Hinta:</span>
                        <span class="info-value">${parseFloat(order.total_price).toFixed(2)} €</span>
                    </div>
                </div>
                <div class="order-items-preview">
                    <strong>Tuotteet:</strong>
                    <div class="items-list">
                        ${order.items
                          ?.slice(0, 3)
                          .map(
                            (item) =>
                              `<div>${item.quantity}x ${escapeHtml(item.dish_name)} (${parseFloat(item.unit_price).toFixed(2)} €)</div>`,
                          )
                          .join("")}
                        ${order.items?.length > 3 ? `<div>... ja ${order.items.length - 3} muuta</div>` : ""}
                    </div>
                </div>
            </div>
            <div class="order-footer">
                <button class="btn-view view-order-btn">👁️ Näytä</button>
                <button class="btn-edit edit-order-btn">✏️ Muokkaa</button>
                <button class="btn-delete delete-order-btn">🗑️ Poista</button>
            </div>
        </div>
    `;
}

// Näytä tilauksen yksityiskohdat modaalissa (vain näkymä, ei muokkausta)
async function viewOrderDetails(orderId) {
  const order = await fetchOrderById(orderId);
  if (!order) {
    showError("Tilauksen tietojen hakeminen epäonnistui");
    return;
  }

  const modal = document.getElementById("orderModal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");

  modalTitle.textContent = `Tilaus #${order.id}`;

  const pickupTime = order.pickup_time ? order.pickup_time.substring(0, 5) : "";
  const customerName =
    order.guest_name || order.username || "Rekisteröitynyt käyttäjä";
  const statusColor = statusColors[order.status] || "#6c757d";

  modalBody.innerHTML = `
        <div class="order-details">
            <div class="detail-section">
                <h3>Asiakastiedot</h3>
                <p><strong>Nimi:</strong> ${escapeHtml(customerName)}</p>
                <p><strong>Sähköposti:</strong> ${escapeHtml(order.guest_email || order.user_email || "Ei sähköpostia")}</p>
                ${order.notes ? `<p><strong>Lisätiedot:</strong> ${escapeHtml(order.notes)}</p>` : ""}
            </div>
            
            <div class="detail-section">
                <h3>Tilauksen tiedot</h3>
                <p><strong>Noutopäivä:</strong> ${formatDate(order.pickup_date)}</p>
                <p><strong>Noutoaika:</strong> ${pickupTime}</p>
                <p><strong>Henkilömäärä:</strong> ${order.guest_count}</p>
                <p><strong>Luotu:</strong> ${formatDateTime(order.created_at)}</p>
            </div>
            
            <div class="detail-section">
                <h3>Tilatut tuotteet</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Tuote</th>
                            <th>Määrä</th>
                            <th>Hinta/kpl</th>
                            <th>Yhteensä</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          order.items
                            ?.map(
                              (item) => `
                            <tr>
                                <td>${escapeHtml(item.dish_name)}</td>
                                <td>${item.quantity}</td>
                                <td>${parseFloat(item.unit_price).toFixed(2)} €</td>
                                <td>${(item.quantity * parseFloat(item.unit_price)).toFixed(2)} €</td>
                            </tr>
                        `,
                            )
                            .join("") ||
                          '<tr><td colspan="4">Ei tuotteita</td></tr>'
                        }
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>Yhteensä</strong></td>
                            <td><strong>${parseFloat(order.total_price).toFixed(2)} €</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div class="form-actions" style="margin-top: 20px;">
                <button class="btn-cancel" onclick="closeModal()">Sulje</button>
            </div>
        </div>
    `;

  modal.style.display = "flex";
}

// Muokkaa tilausta (ilman status ja päivämäärä muokkausta)
async function editOrder(orderId) {
  const order = await fetchOrderById(orderId);
  if (!order) {
    showError("Tilauksen tietojen hakeminen epäonnistui");
    return;
  }

  currentEditOrder = order;

  // Hae päivän menu noutopäivän mukaan
  dayMenuItems = await fetchMenuByDate(order.pickup_date);

  const modal = document.getElementById("orderModal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");

  modalTitle.textContent = `Muokkaa tilausta #${order.id}`;

  const pickupTime = order.pickup_time ? order.pickup_time.substring(0, 5) : "";

  modalBody.innerHTML = `
        <div class="edit-order-form">
            <div class="form-group">
                <label>📅 Noutopäivä (ei voi muokata):</label>
                <input type="date" class="form-control" value="${order.pickup_date}" disabled>
            </div>
            
            <div class="form-group">
                <label>⏰ Noutoaika:</label>
                <input type="time" id="edit-pickup-time" class="form-control" value="${pickupTime}">
            </div>
            
            <div class="form-group">
                <label>👥 Henkilömäärä:</label>
                <input type="number" id="edit-guest-count" class="form-control" value="${order.guest_count}" min="1">
            </div>
            
            <div class="form-group">
                <label>📝 Lisätiedot:</label>
                <textarea id="edit-notes" class="form-control" rows="2">${order.notes || ""}</textarea>
            </div>
            
            <div class="form-group">
                <label>🛒 Tuotteet:</label>
                <div id="edit-items-list" class="edit-items-list">
                    ${renderEditItemsList(order.items)}
                </div>
            </div>
            
            <div class="form-group">
                <label>➕ Lisää uusi tuote (päivän menusta):</label>
                <select id="add-product-select" class="form-control">
                    <option value="">-- Valitse tuote --</option>
                    ${dayMenuItems
                      .map(
                        (item) => `
                        <option value='${JSON.stringify({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                        })}'>
                            ${escapeHtml(item.name)} - ${parseFloat(item.price).toFixed(2)} €
                        </option>
                    `,
                      )
                      .join("")}
                </select>
                <button type="button" class="btn-add-item" onclick="addItemToEdit()" style="margin-top: 8px;">➕ Lisää tuote</button>
            </div>
            
            <div class="form-group">
                <label>💰 Yhteensä:</label>
                <div id="edit-total-price" class="total-price-display">${parseFloat(order.total_price).toFixed(2)} €</div>
            </div>
            
            <div class="form-actions">
                <button class="btn-save" onclick="saveOrderChanges(${order.id})">💾 Tallenna muutokset</button>
                <button class="btn-cancel" onclick="closeModal()">Peruuta</button>
            </div>
        </div>
    `;

  modal.style.display = "flex";
}

// Renderöi muokattavien tuotteiden lista
function renderEditItemsList(items) {
  if (!items || items.length === 0) {
    return '<div class="no-items">Ei tuotteita</div>';
  }

  return items
    .map(
      (item, index) => `
    <div class="edit-item-row" data-item-index="${index}">
        <span class="item-name">${escapeHtml(item.dish_name)}</span>
        <div class="item-controls">
            <label>Määrä:</label>
            <input type="number" class="item-quantity" value="${item.quantity}" min="0" step="1" 
                   data-item-id="${item.id}" data-item-price="${item.unit_price}" 
                   onchange="updateItemQuantity(${index}, this.value)">
            <span class="item-price">${(item.quantity * parseFloat(item.unit_price)).toFixed(2)} €</span>
            <button type="button" class="btn-remove-item" onclick="removeItemFromEdit(${index})">🗑️</button>
        </div>
    </div>
  `,
    )
    .join("");
}

// Lisää uusi tuote muokattavaan tilaukseen
window.addItemToEdit = function () {
  const select = document.getElementById("add-product-select");
  const selectedValue = select.value;

  if (!selectedValue) {
    showError("Valitse tuote listasta");
    return;
  }

  const product = JSON.parse(selectedValue);

  // Tarkista onko tuote jo lisätty
  const existingItem = currentEditOrder.items.find(
    (item) => item.dish_name === product.name,
  );

  if (existingItem) {
    existingItem.quantity++;
    updateTotalPriceDisplay();
    refreshEditItemsList();
  } else {
    currentEditOrder.items.push({
      id: product.id,
      dish_name: product.name,
      unit_price: parseFloat(product.price),
      quantity: 1,
    });
    refreshEditItemsList();
  }

  select.value = "";
  showSuccess(`Tuote ${product.name} lisätty`);
};

// Poista tuote muokkauksesta
window.removeItemFromEdit = function (index) {
  if (confirm("Haluatko varmasti poistaa tämän tuotteen?")) {
    currentEditOrder.items.splice(index, 1);
    refreshEditItemsList();
    showSuccess("Tuote poistettu");
  }
};

// Päivitä tuotteen määrä
window.updateItemQuantity = function (index, newQuantity) {
  const quantity = parseInt(newQuantity);
  if (isNaN(quantity) || quantity < 0) {
    return;
  }

  if (quantity === 0) {
    removeItemFromEdit(index);
  } else {
    currentEditOrder.items[index].quantity = quantity;
    updateTotalPriceDisplay();
    refreshEditItemsList();
  }
};

// Päivitä kokonaishinta näyttö
function updateTotalPriceDisplay() {
  const total = currentEditOrder.items.reduce((sum, item) => {
    return sum + item.quantity * parseFloat(item.unit_price);
  }, 0);

  const totalElement = document.getElementById("edit-total-price");
  if (totalElement) {
    totalElement.textContent = `${total.toFixed(2)} €`;
  }
}

// Päivitä tuotelista näkymä
function refreshEditItemsList() {
  const container = document.getElementById("edit-items-list");
  if (container) {
    container.innerHTML = renderEditItemsList(currentEditOrder.items);
    updateTotalPriceDisplay();
  }
}

// Tallenna tilauksen muutokset (vain aika, henkilöt, huomiot ja tuotteet)
async function saveOrderChanges(orderId) {
  const newPickupTime = document.getElementById("edit-pickup-time")?.value;
  const guestCount = document.getElementById("edit-guest-count")?.value;
  const notes = document.getElementById("edit-notes")?.value;

  if (!newPickupTime) {
    showError("Noutoaika on pakollinen");
    return;
  }

  // Laske uusi kokonaishinta
  const newTotalPrice = currentEditOrder.items.reduce((sum, item) => {
    return sum + item.quantity * parseFloat(item.unit_price);
  }, 0);

  showLoading();

  try {
    // Päivitä tilauksen perustiedot
    const updateResponse = await fetch(
      `${API_BASE_URL}/api/orders/${orderId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup_time: newPickupTime,
          guest_count: parseInt(guestCount),
          notes: notes || "",
          total_price: newTotalPrice,
          items: currentEditOrder.items.map((item) => ({
            dish_id: item.id,
            dish_name: item.dish_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }),
      },
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.error || "Tilauksen päivitys epäonnistui");
    }

    showSuccess("Tilaus päivitetty onnistuneesti");
    closeModal();

    // Päivitä tilauslista
    await fetchAllOrders();
  } catch (error) {
    console.error("Virhe tilauksen päivityksessä:", error);
    showError(`Tilauksen päivitys epäonnistui: ${error.message}`);
  } finally {
    hideLoading();
  }
}

// Vahvista tilauksen poisto
function confirmDeleteOrder(orderId) {
  if (
    confirm(
      "Haluatko varmasti poistaa tämän tilauksen? Tätä toimintoa ei voi peruuttaa.",
    )
  ) {
    deleteOrder(orderId);
  }
}

// Poista tilaus
async function deleteOrder(orderId) {
  showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Tilauksen poisto epäonnistui");
    }

    showSuccess("Tilaus poistettu onnistuneesti");
    await fetchAllOrders();
  } catch (error) {
    console.error("Virhe tilauksen poistossa:", error);
    showError(`Tilauksen poisto epäonnistui: ${error.message}`);
  } finally {
    hideLoading();
  }
}

// Päivitä tilastot
function updateStats(totalOrders) {
  const statsElement = document.querySelector(".stats");
  if (statsElement) {
    statsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Kaikki tilaukset:</span>
                <span class="stat-value">${allOrders.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Suodatetut:</span>
                <span class="stat-value">${totalOrders}</span>
            </div>
        `;
  }
}

// Päivitä sivutus
function updatePagination(currentPage, totalPages) {
  const pageInfo = document.getElementById("page-info");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (pageInfo) {
    pageInfo.textContent = `Sivu ${currentPage} / ${totalPages || 1}`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  }
}

// Päivitä aktiivinen suodatin
function updateActiveFilter(status) {
  document.querySelectorAll(".filter-option").forEach((option) => {
    if (option.dataset.status === status) {
      option.classList.add("active");
    } else {
      option.classList.remove("active");
    }
  });
}

// Apufunktiot
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fi-FI");
}

function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("fi-FI");
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showLoading() {
  const container = document.querySelector(".orders-grid");
  if (container && container.innerHTML.includes("Ladataan")) {
    return;
  }
  if (container && !container.querySelector(".loading")) {
    container.innerHTML = '<div class="loading">⏳ Ladataan tilauksia...</div>';
  }
}

function hideLoading() {}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-toast";
  errorDiv.innerHTML = `❌ ${message}`;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "success-toast";
  successDiv.innerHTML = `✅ ${message}`;
  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function toggleFilterDropdown() {
  const dropdown = document.getElementById("filter-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

function closeFilterDropdown() {
  const dropdown = document.getElementById("filter-dropdown");
  if (dropdown) {
    dropdown.classList.remove("show");
  }
}

function closeModal() {
  const modal = document.getElementById("orderModal");
  if (modal) {
    modal.style.display = "none";
  }
  currentEditOrder = null;
}

// Vie funktiot globaaliin scopeen
window.viewOrderDetails = viewOrderDetails;
window.editOrder = editOrder;
window.confirmDeleteOrder = confirmDeleteOrder;
window.saveOrderChanges = saveOrderChanges;
window.closeModal = closeModal;
window.fetchAllOrders = fetchAllOrders;
window.addItemToEdit = addItemToEdit;
window.removeItemFromEdit = removeItemFromEdit;
window.updateItemQuantity = updateItemQuantity;
