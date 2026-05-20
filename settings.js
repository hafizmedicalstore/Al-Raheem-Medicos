console.log("Settings Loaded");

/* =========================
   LOAD SETTINGS
========================= */

function loadSettings() {

    document.getElementById("shopName").value =
        localStorage.getItem("shopName") || "";

    document.getElementById("shopPhone").value =
        localStorage.getItem("shopPhone") || "";

    document.getElementById("shopAddress").value =
        localStorage.getItem("shopAddress") || "";

    document.getElementById("invoicePrefix").value =
        localStorage.getItem("invoicePrefix") || "INV";

    document.getElementById("autoPrint").checked =
        localStorage.getItem("autoPrint") === "true";

    document.getElementById("darkModeToggle").checked =
        localStorage.getItem("theme") === "dark";

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }

}

/* =========================
   SAVE SETTINGS
========================= */

function saveSettings() {

    localStorage.setItem(
        "shopName",
        document.getElementById("shopName").value
    );

    localStorage.setItem(
        "shopPhone",
        document.getElementById("shopPhone").value
    );

    localStorage.setItem(
        "shopAddress",
        document.getElementById("shopAddress").value
    );

    localStorage.setItem(
        "invoicePrefix",
        document.getElementById("invoicePrefix").value
    );

    localStorage.setItem(
        "autoPrint",
        document.getElementById("autoPrint").checked
    );

    alert("Settings Saved!");

}

/* =========================
   THEME
========================= */

const darkToggle = document.getElementById("darkModeToggle");

darkToggle.addEventListener("change", (e) => {

    if (e.target.checked) {

        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");

    } else {

        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }

});

/* =========================
   BACKUP DOWNLOAD
========================= */

function downloadBackup() {

    const backupData = {

        // INVENTORY
        items: JSON.parse(localStorage.getItem("items")) || [],

        // SALES / REPORTS
        sales: JSON.parse(localStorage.getItem("sales")) || [],

        // STATS
        todaySales: localStorage.getItem("todaySales") || 0,
        monthlySales: localStorage.getItem("monthlySales") || 0,
        totalBills: localStorage.getItem("totalBills") || 0,

        // SETTINGS
        settings: {
            shopName: localStorage.getItem("shopName") || "",
            shopPhone: localStorage.getItem("shopPhone") || "",
            shopAddress: localStorage.getItem("shopAddress") || "",
            invoicePrefix: localStorage.getItem("invoicePrefix") || "INV",
            autoPrint: localStorage.getItem("autoPrint") || "false",
            theme: localStorage.getItem("theme") || "light"
        }
    };

    const blob = new Blob(
        [JSON.stringify(backupData, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "medical-store-backup.json";

    a.click();

    URL.revokeObjectURL(url);

    alert("Backup Downloaded Successfully!");
}

/* =========================
   RESTORE BACKUP
========================= */

function uploadBackup() {

    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {

            try {

                const data = JSON.parse(event.target.result);

                // INVENTORY
                if (data.items) {
                    localStorage.setItem(
                        "items",
                        JSON.stringify(data.items)
                    );
                }

                // SALES
                if (data.sales) {
                    localStorage.setItem(
                        "sales",
                        JSON.stringify(data.sales)
                    );
                }

                // STATS
                if (data.todaySales) {
                    localStorage.setItem(
                        "todaySales",
                        data.todaySales
                    );
                }

                if (data.monthlySales) {
                    localStorage.setItem(
                        "monthlySales",
                        data.monthlySales
                    );
                }

                if (data.totalBills) {
                    localStorage.setItem(
                        "totalBills",
                        data.totalBills
                    );
                }

                // SETTINGS
                if (data.settings) {

                    Object.keys(data.settings).forEach(key => {

                        localStorage.setItem(
                            key,
                            data.settings[key]
                        );

                    });
                }

                alert("Backup Restored Successfully!");

                location.reload();

            } catch (err) {

                console.error(err);

                alert("Invalid Backup File!");
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

/* =========================
   START
========================= */

loadSettings();