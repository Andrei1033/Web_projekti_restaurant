document.addEventListener("DOMContentLoaded", () => {
  const conceptEl = document.getElementById("concept");
  const dietsEl = document.getElementById("diets");
  const sustainabilityEl = document.getElementById("sustainability");
  const openingHoursEl = document.getElementById("openingHours");
  const capacityEl = document.getElementById("capacity");
  const saveAboutBtn = document.getElementById("save-about");

  const API_BASE = "http://10.120.32.64/app";

  function getHeaders(isJson = false) {
    const token = localStorage.getItem("token");
    const headers = {};
    if (isJson) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  const announcementsList = document.getElementById("announcements-list");
  const newTitle = document.getElementById("new-title");
  const newBody = document.getElementById("new-body");
  const addAnnouncementBtn = document.getElementById("add-announcement");
  const saveAnnouncementsBtn = document.getElementById("save-announcements");

  let announcements = [];

  async function fetchAbout() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/about`, {
        headers: getHeaders(),
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      conceptEl.value = data.concept || "";
      dietsEl.value = data.diets || "";
      sustainabilityEl.value = data.sustainability || "";
      openingHoursEl.value = (data.openingHours || [])
        .map((h) => `${h.day}|${h.hours}`)
        .join("\n");
      if (capacityEl) capacityEl.value = data.capacity || "";
    } catch (e) {
      console.error("fetchAbout error", e);
    }
  }

  async function saveAbout() {
    const payload = {
      concept: conceptEl.value,
      diets: dietsEl.value,
      sustainability: sustainabilityEl.value,
      capacity: capacityEl ? parseInt(capacityEl.value || 0, 10) : 0,
      openingHours: openingHoursEl.value
        .split("\n")
        .map((line) => {
          const [day, hours] = line.split("|").map((s) => s && s.trim());
          return { day: day || "", hours: hours || "" };
        })
        .filter((x) => x.day || x.hours),
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/about`, {
        method: "PUT",
        headers: getHeaders(true),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("About tallennettu");
      } else {
        alert("Tallenus epäonnistui");
      }
    } catch (e) {
      console.error("saveAbout error", e);
      alert("Virhe tallennettaessa");
    }
  }

  async function fetchAnnouncements() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/announcements`, {
        headers: getHeaders(),
        credentials: "include",
      });
      if (!res.ok) return;
      announcements = await res.json();
      renderAnnouncements();
    } catch (e) {
      console.error("fetchAnnouncements error", e);
    }
  }

  function renderAnnouncements() {
    announcementsList.innerHTML = "";
    announcements.forEach((item, idx) => {
      const container = document.createElement("div");
      container.className = "announcement-item";

      const titleInput = document.createElement("input");
      titleInput.className = "ann-title";
      titleInput.value = item.title || "";
      titleInput.addEventListener("input", (e) => {
        announcements[idx].title = e.target.value;
      });

      const bodyArea = document.createElement("textarea");
      bodyArea.className = "ann-body";
      bodyArea.rows = 3;
      bodyArea.value = item.body || "";
      bodyArea.addEventListener("input", (e) => {
        announcements[idx].body = e.target.value;
      });

      const dateSpan = document.createElement("div");
      dateSpan.className = "ann-date";
      dateSpan.textContent = item.date || "";

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-ann";
      removeBtn.textContent = "Poista";
      removeBtn.addEventListener("click", () => {
        announcements.splice(idx, 1);
        renderAnnouncements();
      });

      container.appendChild(titleInput);
      container.appendChild(bodyArea);
      container.appendChild(dateSpan);
      container.appendChild(removeBtn);

      announcementsList.appendChild(container);
    });
  }

  addAnnouncementBtn.addEventListener("click", () => {
    const title = newTitle.value.trim();
    const body = newBody.value.trim();
    if (!title && !body) return alert("Täytä otsikko tai sisältö");
    const id = announcements.length
      ? Math.max(...announcements.map((a) => a.id || 0)) + 1
      : 1;
    announcements.unshift({
      id,
      title,
      body,
      date: new Date().toISOString().slice(0, 10),
    });
    newTitle.value = "";
    newBody.value = "";
    renderAnnouncements();
  });

  saveAnnouncementsBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/announcements`, {
        method: "PUT",
        headers: getHeaders(true),
        credentials: "include",
        body: JSON.stringify(announcements),
      });
      if (res.ok) alert("Tiedotteet tallennettu");
      else alert("Tallenus epäonnistui");
    } catch (e) {
      console.error("saveAnnouncements error", e);
      alert("Virhe tallennettaessa tiedotteita");
    }
  });

  saveAboutBtn.addEventListener("click", saveAbout);

  // Initial load
  fetchAbout();
  fetchAnnouncements();
});
