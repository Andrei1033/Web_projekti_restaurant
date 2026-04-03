// Esimerkkidata (oikeassa työssä haetaan API:sta)
const menuData = {
    "Monday": [
        { id: 1, name: "Wolf Burger", price: "16.50", desc: "Smoked beef, chili mayo, brioche", tags: ["L"] },
        { id: 2, name: "Midnight Salad", price: "14.00", desc: "Roasted roots, kale, nuts", tags: ["G", "VEG"] }
    ],
    "Tuesday": [
        { id: 3, name: "Red Moon Pasta", price: "15.00", desc: "Spicy tomato sauce, nduja, basil", tags: ["L"] },
        { id: 4, name: "Forest Risotto", price: "18.00", desc: "Wild mushrooms, truffle oil", tags: ["G"] }
    ]
    // Lisää muut päivät...
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let currentDayIndex = 0; // Aloitetaan maanantaista

document.addEventListener('DOMContentLoaded', () => {
    updateMenu();

    document.getElementById('next-day').addEventListener('click', () => {
        currentDayIndex = (currentDayIndex + 1) % days.length;
        updateMenu();
    });

    document.getElementById('prev-day').addEventListener('click', () => {
        currentDayIndex = (currentDayIndex - 1 + days.length) % days.length;
        updateMenu();
    });
});

function updateMenu() {
    const dayName = days[currentDayIndex];
    document.getElementById('display-day-name').innerText = dayName;

    const menuList = document.getElementById('order-menu-list');
    menuList.innerHTML = ""; // Tyhjennetään vanha

    const items = menuData[dayName] || [];

    if (items.length === 0) {
        menuList.innerHTML = "<p class='wm-empty-msg'>Kitchen is closed this day.</p>";
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'order-item-card';
        card.innerHTML = `
            <div>
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${item.price}€</span>
                </div>
                <p class="item-desc">${item.desc}</p>
                <div class="diet-tags">
                    ${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${item.id})">ADD TO ORDER</button>
        `;
        menuList.appendChild(card);
    });
}

/*
function addToCart(id) {
    console.log("Added item to cart:", id);
    // Tähän myöhemmin ostoskorilogiikka
}*/
