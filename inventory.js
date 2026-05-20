console.log("Inventory System Started 🚀");

/* =========================
   STORAGE
========================= */

let items = JSON.parse(localStorage.getItem("items")) || [];

/* =========================
   TABLE
========================= */

const table = document.getElementById("table");

/* =========================
   SAVE
========================= */

function saveItems() {
    localStorage.setItem("items", JSON.stringify(items));
    window.dispatchEvent(new Event("storage"));
}

/* =========================
   STOCK (IMPORTANT)
   STOCK = LIVE VALUE (NO STORAGE)
========================= */

function getStock(item) {

    if (item.type === "tablet") {
        return Number(item.strips || 0);
    }

    return Number(item.quantity || 0);
}

/* =========================
   ADD ITEM
========================= */

function addItem() {

    const name = document.getElementById("name").value.trim();
    const company = document.getElementById("company").value.trim();
    const type = document.getElementById("type").value;

    const stockAlert = Number(document.getElementById("stockAlertInput").value) || 0;
    const strips = Number(document.getElementById("strips").value) || 0;
    const quantity = Number(document.getElementById("quantity").value) || 0;

    const perStrip = Number(document.getElementById("perStrip").value) || 0;
    const price = Number(document.getElementById("price").value) || 0;
    const expiry = document.getElementById("expiry").value;
    const piecePrice = Number(document.getElementById("piecePrice").value) || 0;

    if (!name || !company || !type || !price) {
        alert("Fill required fields");
        return;
    }

    let item = {
        id: Date.now(),
        name,
        company,
        type,
        stockAlert,
        strips,
        quantity,
        perStrip,
        price,
        expiry,
        piecePrice,
        soldTablets: 0
    };

    addOrUpdate(item);
    clearInputs();
}

/* =========================
   ADD / UPDATE (FIXED)
========================= */

function addOrUpdate(newItem) {

    let existing = items.find(m =>
        m.name.toLowerCase() === newItem.name.toLowerCase() &&
        m.company.toLowerCase() === newItem.company.toLowerCase() &&
        m.type === newItem.type
    );

    if (existing) {

        if (existing.type === "tablet") {
            existing.strips += newItem.strips;
        } else {
            existing.quantity += newItem.quantity;
        }

    } else {
        items.push(newItem);
    }

    saveItems();
    renderItems();
}

/* =========================
   RENDER
========================= */

function renderItems(data = items) {

    table.innerHTML = "";

    data.forEach(item => {

        const stock = getStock(item);

        let stockDisplay = stock;

        // 🟢🔴 STOCK ALERT LOGIC
        if (item.stockAlert > 0) {

            if (stock <= item.stockAlert) {
                stockDisplay = `<span style="color:red; font-weight:bold;">${stock} ●</span>`;
            } else {
                stockDisplay = `<span style="color:green; font-weight:bold;">${stock} ●</span>`;
            }
        }

        const tr = document.createElement("tr");

        // 🔴 LOW STOCK ROW BACKGROUND (optional but nice)
        if (stock <= item.stockAlert && item.stockAlert > 0) {
            tr.style.background = "#fee2e2";
        }

        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.company}</td>
            <td>${item.type}</td>

            <td>
                ${item.type === "tablet" ? item.strips : item.quantity}
            </td>

            <td>Rs ${item.price}</td>
            <td>${item.expiry || "-"}</td>
            <td>${item.piecePrice || "-"}</td>

            <td>${stockDisplay}</td>

            <td>
                <button onclick="deleteItem(${item.id})" style="background-color: red; color: white;">Delete</button>
            </td>
        `;

        table.appendChild(tr);
    });
}

/* =========================
   DELETE
========================= */

function deleteItem(id) {

    const ok = confirm("Delete this medicine?");
    if (!ok) return;

    items = items.filter(i => i.id !== id);

    saveItems();
    renderItems();
}

/* =========================
   SEARCH
========================= */

document.getElementById("search")?.addEventListener("input", e => {

    const val = e.target.value.toLowerCase();

    const filtered = items.filter(i =>
        i.name.toLowerCase().includes(val) ||
        i.company.toLowerCase().includes(val)
    );

    renderItems(filtered);
});

/* =========================
   TYPE HANDLER
========================= */

function handleType() {

    const type = document.getElementById("type").value;

    const quantity = document.getElementById("quantity");
    const strips = document.getElementById("strips");
    const perStrip = document.getElementById("perStrip");
    const piecePrice = document.getElementById("piecePrice");

    // 👉 SOLID MEDICINE (tablet)
    if (type === "tablet") {

        quantity.disabled = true;

        strips.disabled = false;
        perStrip.disabled = false;
        piecePrice.disabled = false;   // ✅ only tablet can use it
    }

    // 👉 ALL OTHER TYPES
    else if (type) {

        quantity.disabled = false;

        strips.disabled = true;
        perStrip.disabled = true;
        piecePrice.disabled = true;    // ✅ disable for all non-solid medicines
    }

    // 👉 DEFAULT (nothing selected)
    else {

        quantity.disabled = true;

        strips.disabled = true;
        perStrip.disabled = true;
        piecePrice.disabled = true;
    }
}

/* =========================
   CLEAR
========================= */

function clearInputs() {

    document.getElementById("name").value = "";
    document.getElementById("company").value = "";
    document.getElementById("type").value = "";
    document.getElementById("stockAlertInput").value = "";
    document.getElementById("strips").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("perStrip").value = "";
    document.getElementById("price").value = "";
    document.getElementById("expiry").value = "";
    document.getElementById("piecePrice").value = "";
}

/* =========================
   INIT
========================= */

renderItems();
handleType();

function applyTheme() {

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

applyTheme();