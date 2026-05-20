console.log("Medical POS Started");

let medicines = [];
let cart = [];

/* =========================
   PAGE SWITCHING
========================= */

const navButtons = document.querySelectorAll(".nav-btn");

const inventoryPage = document.getElementById("inventoryPage");
const billingPage = document.getElementById("billingPage");

const pageTitle = document.getElementById("pageTitle");

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        navButtons.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        const page = button.dataset.page;

        if (page === "inventory") {

            inventoryPage.classList.add("active-page");
            billingPage.classList.remove("active-page");

            pageTitle.innerText = "Inventory System";

        } else {

            billingPage.classList.add("active-page");
            inventoryPage.classList.remove("active-page");

            pageTitle.innerText = "Billing System";

        }

    });

});

/* =========================
   ADD MEDICINE
========================= */

const addMedicineBtn = document.getElementById("addMedicineBtn");

addMedicineBtn.addEventListener("click", addMedicine);

function addMedicine() {

    const name = document.getElementById("medName").value.trim();

    const company = document.getElementById("medCompany").value.trim();

    const type = document.getElementById("medType").value;

    const stock = parseInt(document.getElementById("medStock").value);

    const price = parseFloat(document.getElementById("medPrice").value);

    if (!name || !company || isNaN(stock) || isNaN(price)) {

        alert("Please fill all fields");
        return;

    }

    const medicine = {
        id: Date.now(),
        name,
        company,
        type,
        stock,
        price
    };

    medicines.push(medicine);

    renderMedicines();

    clearInputs();

}

/* =========================
   RENDER MEDICINES
========================= */

function renderMedicines() {

    const tbody = document.getElementById("inventoryTableBody");

    tbody.innerHTML = "";

    medicines.forEach(med => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
      <td>${med.name}</td>
      <td>${med.company}</td>
      <td>${med.type}</td>
      <td>${med.stock}</td>
      <td>Rs. ${med.price}</td>
      <td>
        <button onclick="deleteMedicine(${med.id})">
          Delete
        </button>
      </td>
    `;

        tbody.appendChild(tr);

    });

    updateBillingDropdown();

}

/* =========================
   DELETE MEDICINE
========================= */

function deleteMedicine(id) {

    medicines = medicines.filter(med => med.id !== id);

    renderMedicines();

}

/* =========================
   CLEAR INPUTS
========================= */

function clearInputs() {

    document.getElementById("medName").value = "";

    document.getElementById("medCompany").value = "";

    document.getElementById("medStock").value = "";

    document.getElementById("medPrice").value = "";

}

/* =========================
   SEARCH
========================= */

const searchMedicine = document.getElementById("searchMedicine");

searchMedicine.addEventListener("input", () => {

    const value = searchMedicine.value.toLowerCase();

    const rows = document.querySelectorAll("#inventoryTableBody tr");

    rows.forEach(row => {

        const text = row.innerText.toLowerCase();

        row.style.display = text.includes(value)
            ? ""
            : "none";

    });

});

/* =========================
   BILLING
========================= */

function updateBillingDropdown() {

    const select = document.getElementById("billingMedicine");

    select.innerHTML = "";

    medicines.forEach(med => {

        const option = document.createElement("option");

        option.value = med.id;

        option.textContent =
            `${med.name} (Stock: ${med.stock})`;

        select.appendChild(option);

    });

}

document
    .getElementById("addToCartBtn")
    .addEventListener("click", addToCart);

function addToCart() {

    const medId = Number(
        document.getElementById("billingMedicine").value
    );

    const qty = parseInt(
        document.getElementById("billingQty").value
    );

    if (isNaN(qty) || qty <= 0) {

        alert("Invalid quantity");
        return;

    }

    const medicine = medicines.find(
        med => med.id === medId
    );

    if (!medicine) {

        alert("Medicine not found");
        return;

    }

    if (qty > medicine.stock) {

        alert("Not enough stock");
        return;

    }

    medicine.stock -= qty;

    const cartItem = {
        name: medicine.name,
        qty,
        price: medicine.price,
        total: qty * medicine.price
    };

    cart.push(cartItem);

    renderCart();

    renderMedicines();

}

function renderCart() {

    const tbody = document.getElementById("cartTableBody");

    tbody.innerHTML = "";

    let grandTotal = 0;

    cart.forEach(item => {

        grandTotal += item.total;

        const tr = document.createElement("tr");

        tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>Rs. ${item.price}</td>
      <td>Rs. ${item.total}</td>
    `;

        tbody.appendChild(tr);

    });

    document.getElementById("grandTotal").innerText =
        grandTotal;

}