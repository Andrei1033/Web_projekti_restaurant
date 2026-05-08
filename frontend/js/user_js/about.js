document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "http://10.120.32.64/app";

  try {
    const res = await fetch(`${API_BASE}/api/about`);
    if (!res.ok) return;
    const data = await res.json();

    // Concept paragraph
    const storyPara = document.querySelector(".story-text p");
    if (storyPara && data.concept) storyPara.textContent = data.concept;

    // Diets and sustainability — value cards order assumed
    const valueParas = document.querySelectorAll(".value-card p");
    if (valueParas[0] && data.diets) valueParas[0].textContent = data.diets;
    if (valueParas[1] && data.sustainability)
      valueParas[1].textContent = data.sustainability;

    // Opening hours list
    const hoursList = document.querySelector(".opening-hours-list");
    if (hoursList && Array.isArray(data.openingHours)) {
      hoursList.innerHTML = data.openingHours
        .map(
          (h) =>
            `<li><span class="day">${h.day}</span><span class="hours">${h.hours}</span></li>`,
        )
        .join("");
    }
  } catch (e) {
    console.error("fetch about error", e);
  }
});
