console.log("Billing Loaded 🚀");

let printConfirmed = false;
let pendingSale = false;
let backupMedicines = [];
let backupTodaySales = 0;
let backupMonthlySales = 0;
let backupTotalBills = 0;
let saleConfirmed = false;
let todaySales = 0;
let monthlySales = 0;
let totalBills = 0;
let discountPercent = 0;
let cart = [];
let medicines = [];

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

    window.addEventListener("storage", function (e) {

        if (e.key === "items") {
            loadMedicines();
        }

    });

    const btn = document.getElementById("sellAllBtn");

    if (btn) {
        btn.addEventListener("click", sellAllItems);
    }

    loadMedicines();
    renderCart();
    loadStats();
    checkAutoReset();
    setInterval(checkAutoReset, 60000);

});

function isExpired(expiry) {

    if (!expiry) return false;

    let expDate = new Date(expiry);
    let now = new Date();

    // normalize time to 12:00 AM comparison
    expDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    return now > expDate;
}

function loadStats() {

    todaySales = Number(localStorage.getItem("todaySales")) || 0;
    monthlySales = Number(localStorage.getItem("monthlySales")) || 0;
    totalBills = Number(localStorage.getItem("totalBills")) || 0;

    updateStatsUI();
}

function saveStats() {

    localStorage.setItem("todaySales", String(todaySales));
    localStorage.setItem("monthlySales", String(monthlySales));
    localStorage.setItem("totalBills", String(totalBills));
}

function updateStatsUI() {

    document.getElementById("todaySales").innerText = "Rs " + todaySales;
    document.getElementById("monthlySales").innerText = "Rs " + monthlySales;
    document.getElementById("totalBills").innerText = totalBills;
}

function checkAutoReset() {

    let lastDate = localStorage.getItem("lastDate");
    let lastMonth = localStorage.getItem("lastMonth");

    let now = new Date();

    let today = now.toDateString();
    let month = now.getMonth();

    // DAILY RESET
    if (lastDate !== today) {

        todaySales = 0;

        localStorage.setItem("todaySales", 0);
        localStorage.setItem("lastDate", today);
    }

    // MONTHLY RESET
    if (lastMonth != month) {

        monthlySales = 0;

        localStorage.setItem("monthlySales", 0);
        localStorage.setItem("lastMonth", month);
    }

    saveStats();
    updateStatsUI();
}

/* ================= LOAD ================= */

/* ================= LOAD MEDICINES ================= */

function loadMedicines() {

    let data = localStorage.getItem("items");

    console.log("RAW ITEMS:", data); // 🔥 DEBUG

    if (!data) {
        medicines = [];
        renderMedicines([]);
        return;
    }

    try {
        medicines = JSON.parse(data);
    } catch (e) {
        console.error("JSON ERROR:", e);
        medicines = [];
    }

    // SAFE NORMALIZATION
    medicines.forEach(m => {
        if (m.type === "tablet") {
            if (m.strips === undefined) m.strips = 0;
            if (m.perStrip === undefined) m.perStrip = 8;
            if (m.soldTablets === undefined) m.soldTablets = 0;
        } else {
            if (m.quantity === undefined) m.quantity = 0;
        }
    });

    console.log("MEDICINES LOADED:", medicines); // 🔥 DEBUG

    renderMedicines(medicines);
}

/* ================= RENDER MEDICINES ================= */

function renderMedicines(list) {

    const table = document.getElementById("medicineTableBody");

    if (!table) {
        console.error("TABLE NOT FOUND");
        return;
    }

    table.innerHTML = "";

    if (!list || list.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8">No medicines found</td>
            </tr>
        `;
        return;
    }

    list.forEach(m => {

        const stock = m.type === "tablet" ? m.strips : m.quantity;

        const tr = document.createElement("tr");

        tr.innerHTML = `

    <td>${m.name}</td>

    <td>${m.expiry || "-"}</td>

    <td>${m.type}</td>

    <td>${m.price}</td>

    <td>${m.piecePrice || "-"}</td>

    <td>${stock}</td>

    <td>${m.perStrip || "-"}</td>

    <td>

        ${isExpired(m.expiry) ? `
    <button style="
        background:red;
        color:white;
        padding:6px 10px;
        border:none;
        font-weight:bold;
        border-radius:4px;
        cursor:not-allowed;
    ">
        EXPIRED
    </button>
` : `
    <div class="action-row">

        <input
            type="number"
            id="qty-${m.id}"
            value="1"
            min="1"
        >

        <button onclick="addToCart('${m.id}')">
            Add
        </button>

    </div>
`}

        ${m.type === "tablet" ? `

        <div class="action-row">

            <input
                type="number"
                id="full-${m.id}"
                value="1"
                min="1"
            >

            ${isExpired(m.expiry) ? '' : `
    <button onclick="addFull('${m.id}')">
        FULL
    </button>
`}

        </div>

        ` : ""}

    </td>
`;
        table.appendChild(tr);
    });
}

/* ================= LIVE SYNC (OPTIONAL BUT STRONG) ================= */

/* ================= ADD TABLETS ================= */

function addToCart(id) {

    let med = medicines.find(m => String(m.id) === String(id));
    if (!med) return;

    let qty = parseInt(document.getElementById("qty-" + id).value) || 1;

    // 🟢 LIQUID / NORMAL STOCK
    if (med.type !== "tablet") {

        let available = Number(med.quantity) || 0;

        if (available < qty) {
            alert("Not enough stock!");
            return;
        }

        med.quantity -= qty;

        cart.push({
            id: med.id,
            name: med.name,
            qty: qty,
            price: med.price,
            total: qty * med.price,
            cartType: "liquid"
        });

        save();
        renderMedicines(medicines);
        renderCart();
        return;
    }

    // 🟡 TABLET LOGIC (your existing system)
    let perStrip = med.perStrip || 8;

    let available =
        (med.strips * perStrip) - (med.soldTablets || 0);

    if (available < qty) {
        alert("Not enough tablets!");
        return;
    }

    med.soldTablets =
        (med.soldTablets || 0) + qty;

    while (med.soldTablets >= perStrip) {
        med.strips -= 1;
        med.soldTablets -= perStrip;
    }

    cart.push({
        id: med.id,
        name: med.name,
        qty: qty,
        price: med.price,
        total: qty * med.price,
        cartType: "tablet",
        perStrip: perStrip
    });

    save();
    renderMedicines(medicines);
    renderCart();
}

/* ================= ADD FULL STRIP ================= */

function addFull(id) {

    let med = medicines.find(m => String(m.id) === String(id));

    if (!med) return;

    let qty =
        parseInt(document.getElementById("full-" + id).value) || 1;

    if (med.strips < qty) {
        alert("Not enough strips!");
        return;
    }

    med.strips -= qty;

    cart.push({
        id: med.id,
        name: med.name + " (FULL " + qty + ")",

        qty: qty,
        price: med.price,

        total: qty * med.price,

        cartType: "full",

        strips: qty
    });

    save();

    renderMedicines(medicines);

    renderCart();
}

/* ================= CART ================= */

function renderCart() {

    const table = document.getElementById("cartTableBody");
    table.innerHTML = "";

    let total = 0;

    cart.forEach((c, i) => {

        total += c.total;

        table.innerHTML += `
        <tr>
            <td>${c.name}</td>
            <td>${c.qty}</td>
            <td>${c.price}</td>
            <td>${c.total}</td>
            <td><button onclick="remove(${i})">X</button></td>
        </tr>
        `;
    });

    updateCartSummary();
}

/* ================= REMOVE ================= */

function remove(i) {

    let item = cart[i];

    let med =
        medicines.find(m => String(m.id) === String(item.id));

    if (med) {

        // TABLET RETURN
        if (item.cartType === "tablet") {

            med.soldTablets -= item.qty;

            if (med.soldTablets < 0) {

                med.strips += 1;

                med.soldTablets += item.perStrip;
            }
        }

        // FULL STRIP RETURN
        else if (item.cartType === "full") {

            med.strips += item.strips;
        }

        // 🟢 LIQUID RETURN (NEW FIX)
        else if (item.cartType === "liquid") {

            med.quantity += item.qty;
        }
    }

    // REMOVE ITEM
    cart.splice(i, 1);

    save();

    renderMedicines(medicines);

    renderCart();
}

/* ================= SAVE ================= */

function save() {
    localStorage.setItem("items", JSON.stringify(medicines));
}

/* ================= SEARCH (FIXED) ================= */

const searchInput = document.getElementById("medicineSearch");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        let val = this.value.toLowerCase();

        let filtered = medicines.filter(m =>
            m.name.toLowerCase().includes(val)
        );

        renderMedicines(filtered);
    });

}

function generateInvoice() {

    // 🏪 SHOP INFO FROM SETTINGS
    const shopName = localStorage.getItem("shopName") || "My Medical Store";
    const shopPhone = localStorage.getItem("shopPhone") || "-";
    const shopAddress = localStorage.getItem("shopAddress") || "-";

    const customerName = document.getElementById("customerName").value || "Walk-in Customer";
    const customerPhone = document.getElementById("customerPhone").value || "-";

    const invoiceItems = document.getElementById("invItems");
    const invoiceTotal = document.getElementById("invTotal");


    invoiceItems.innerHTML = "";

    let total = 0;

    // 👉 CUSTOMER INFO ADD IN TOP
    invoiceItems.innerHTML += `
        <tr>
            <td colspan="4" style="text-align:left; font-weight:bold;">
                Customer: ${customerName} <br>
                Phone: ${customerPhone}
            </td>
        </tr>
    `;

    // 🏪 SHOP HEADER IN INVOICE
    invoiceItems.innerHTML += `
    <tr>
        <td colspan="4" style="text-align:center; font-weight:bold; font-size:18px;">
            ${shopName}
        </td>
    </tr>

    <tr>
        <td colspan="4" style="text-align:center;">
            Phone: ${shopPhone} | ${shopAddress}
        </td>
    </tr>

    <tr><td colspan="4"><hr></td></tr>
`;

    cart.forEach(item => {

        total += item.total;

        invoiceItems.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.price}</td>
                <td>${item.total}</td>
            </tr>
        `;
    });

    let discountAmount =
        (total * discountPercent) / 100;

    let netTotal =
        total - discountAmount;

    invoiceItems.innerHTML += `

    <tr>
        <td colspan="3" style="text-align:right;">
            Sub Total
        </td>

        <td>
            Rs ${total}
        </td>
    </tr>

    <tr>
        <td colspan="3" style="text-align:right;">
            Discount (${discountPercent}%)
        </td>

        <td>
            - Rs ${discountAmount}
        </td>
    </tr>

`;

    invoiceTotal.innerText = "Rs " + netTotal;
}


function sellAllItems() {

    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    generateInvoice();
    document.getElementById("invoice").style.display = "block";

    setTimeout(() => {
        window.print();
    }, 300);
}


window.onafterprint = function () {

    document.getElementById("invoice").style.display = "none";

    // show custom modal
    document.getElementById("saleModal").style.display = "flex";

    document.getElementById("invoice").style.display = "none";

    // 👉 ASK USER WAS IT PRINT OR CANCEL

    if (!confirmSale) {

        // 🔴 CANCEL = NOTHING CHANGE
        return;
    }

    // 🟢 PRINT CONFIRMED = UPDATE EVERYTHING

    let subTotal = cart.reduce((sum, item) => sum + Number(item.total), 0);

    let discountAmount = (subTotal * discountPercent) / 100;

    let netTotal = subTotal - discountAmount;

    todaySales = Number(todaySales) + netTotal;
    monthlySales = Number(monthlySales) + netTotal;
    totalBills += 1;

    saveStats();
    updateStatsUI();

    // STOCK UPDATE SAVE
    save();

    // CLEAR CART
    cart = [];
    renderCart();

    // CLEAR CUSTOMER
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";

    discountPercent = 0;
    document.getElementById("discountInput").value = "";
};

function applyDiscount() {

    discountPercent =
        parseFloat(document.getElementById("discountInput").value) || 0;

    if (discountPercent < 0 || discountPercent > 100) {
        alert("Invalid discount!");
        discountPercent = 0;
        return;
    }

    alert("Discount Applied: " + discountPercent + "%");

    updateCartSummary();
}

function updateCartSummary() {

    let subTotal = 0;

    cart.forEach(item => {
        subTotal += item.total;
    });

    let discountAmount =
        (subTotal * discountPercent) / 100;

    let netTotal =
        subTotal - discountAmount;

    document.getElementById("subTotal").innerText =
        "Rs " + subTotal;

    document.getElementById("discountAmount").innerText =
        "Rs " + discountAmount;

    document.getElementById("netTotal").innerText =
        "Rs " + netTotal;
}

function confirmSell() {

    let subTotal = cart.reduce((sum, item) => sum + Number(item.total), 0);

    let discountAmount = (subTotal * discountPercent) / 100;

    let netTotal = subTotal - discountAmount;

    todaySales += netTotal;
    monthlySales += netTotal;
    totalBills += 1;

    // 🧾 SAVE SALE IN REPORTS
    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    let now = new Date();

    let saleRecord = {
        id: Date.now(),
        date: now.toISOString().split("T")[0],   // YYYY-MM-DD
        time: now.toLocaleTimeString(),
        customerName: document.getElementById("customerName").value || "Walk-in Customer",
        customerPhone: document.getElementById("customerPhone").value || "-",
        amount: netTotal,
        items: cart
    };

    sales.push(saleRecord);

    localStorage.setItem("sales", JSON.stringify(sales));

    saveStats();
    updateStatsUI();
    save();

    cart = [];
    renderCart();

    document.getElementById("saleModal").style.display = "none";
}

function restoreSale() {

    document.getElementById("saleModal").style.display = "none";

    // NOTHING changes → stock + sales same remain
}

function resetStats() {

    // reset variables
    todaySales = 0;
    monthlySales = 0;
    totalBills = 0;

    // reset localStorage
    localStorage.setItem("todaySales", "0");
    localStorage.setItem("monthlySales", "0");
    localStorage.setItem("totalBills", "0");

    // optional: reset last tracking too (safe clean)
    localStorage.removeItem("lastDate");
    localStorage.removeItem("lastMonth");

    // update UI
    updateStatsUI();
}

function applyTheme() {

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

applyTheme();