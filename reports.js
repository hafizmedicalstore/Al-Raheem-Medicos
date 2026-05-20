console.log("Reports System Started");

/* =========================
   STORAGE
========================= */

let sales =
    JSON.parse(
        localStorage.getItem("sales")
    ) || [];

/* =========================
   ELEMENTS
========================= */

const salesTable =
    document.getElementById("salesTable");

/* =========================
   LOAD REPORTS
========================= */

function loadReports() {

    renderTable(sales);

    updateCards();

    renderCharts();

}

/* =========================
   RENDER TABLE
========================= */

function renderTable(data) {

    salesTable.innerHTML = "";

    if (data.length === 0) {

        salesTable.innerHTML = `

            <tr>

                <td colspan="6">

                    No sales found

                </td>

            </tr>

        `;

        return;

    }

    data.forEach(sale => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>
                ${sale.date || "-"}
            </td>

            <td>
                ${sale.time || "-"}
            </td>

            <td>
                ${sale.customerName || "-"}
            </td>

            <td>
                ${sale.customerPhone || "-"}
            </td>

            <td>
                Rs ${sale.amount || 0}
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteSale(${sale.id})"
                >
                    Delete
                </button>

            </td>

        `;

        salesTable.appendChild(tr);

    });

}

/* =========================
   UPDATE CARDS
========================= */

function updateCards() {

    let totalSales = 0;

    sales.forEach(sale => {

        totalSales +=
            Number(sale.amount || 0);

    });

    const todaySales =
        localStorage.getItem(
            "todaySales"
        ) || 0;

    document.getElementById(
        "totalSales"
    ).innerText =
        `Rs ${totalSales}`;

    document.getElementById(
        "todaySales"
    ).innerText =
        `Rs ${todaySales}`;

    document.getElementById(
        "totalBills"
    ).innerText =
        sales.length;

}

/* =========================
   DELETE SALE
========================= */

function deleteSale(id) {

    const ok =
        confirm(
            "Delete this sale?"
        );

    if (!ok) return;

    sales =
        sales.filter(
            sale => sale.id !== id
        );

    saveSales();

    loadReports();

}

/* =========================
   SAVE SALES
========================= */

function saveSales() {

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );

}

/* =========================
   FILTER SALES
========================= */

function filterSales() {

    const date =
        document.getElementById(
            "filterDate"
        ).value;

    if (!date) {

        renderTable(sales);

        return;

    }

    const filtered =
        sales.filter(sale => {

            return sale.date === date;

        });

    renderTable(filtered);

}

/* =========================
   SHOW ALL
========================= */

function showAllSales() {

    renderTable(sales);

}

/* =========================
   RESET REPORTS
========================= */

function resetReports() {

    const ok =
        confirm(
            "Delete all reports?"
        );

    if (!ok) return;

    localStorage.removeItem(
        "sales"
    );

    localStorage.removeItem(
        "todaySales"
    );

    localStorage.removeItem(
        "monthlySales"
    );

    sales = [];

    loadReports();

}

/* =========================
   LIVE BARS
========================= */

function createBars(id, total) {

    const container =
        document.getElementById(id);

    container.innerHTML = "";

    for (let i = 0; i < 20; i++) {

        const bar =
            document.createElement("div");

        bar.className = "bar";

        let height;

        if (total <= 0) {

            height = 3;

        } else {

            const random =
                Math.random() * total;

            height =
                Math.max(
                    3,
                    (random / total) * 180
                );

        }

        bar.style.height =
            height + "px";

        container.appendChild(bar);

    }

}

/* =========================
   RENDER CHARTS
========================= */

function renderCharts() {

    const today =
        Number(
            localStorage.getItem(
                "todaySales"
            ) || 0
        );

    const monthly =
        Number(
            localStorage.getItem(
                "monthlySales"
            ) || 0
        );

    createBars(
        "todayChart",
        today
    );

    createBars(
        "monthlyChart",
        monthly
    );

}

/* =========================
   START
========================= */

loadReports();

function applyTheme() {

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

applyTheme();