let display = document.getElementById("display");
let buttons = document.querySelectorAll(".btn");

let expression = "";

/* =========================
   THEME
========================= */
function applyThemeToCalculator() {
    let calc = document.querySelector(".calc");
    if (!calc) return;

    let isDark = document.body.classList.contains("dark");

    if (isDark) {
        calc.style.background = "rgba(30,30,30,0.9)";
        display.style.background = "#0f172a";
        display.style.color = "#fff";
    } else {
        calc.style.background = "rgba(255,255,255,0.08)";
        display.style.background = "#fff";
        display.style.color = "#111827";
    }
}

window.addEventListener("DOMContentLoaded", applyThemeToCalculator);

new MutationObserver(applyThemeToCalculator).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
});

/* =========================
   BUTTONS
========================= */
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        handleInput(btn.dataset.key);
        animate(btn);
    });
});

/* =========================
   KEYBOARD
========================= */
document.addEventListener("keydown", (e) => {
    handleInput(e.key);
});

/* =========================
   INPUT HANDLER
========================= */
function handleInput(key) {
    if (!key) return;

    if (key === "C") {
        expression = "";
        update();
        return;
    }

    if (key === "Backspace") {
        expression = expression.slice(0, -1);
        update();
        return;
    }

    if (key === "=" || key === "Enter") {
        calculate();
        return;
    }

    // % SHOW + STORE
    if (key === "%") {
        expression += "%";
        update();
        return;
    }

    if ("0123456789+-*/.".includes(key)) {
        expression += key;
        update();
    }
}

/* =========================
   REAL CALCULATION ENGINE
========================= */
function calculate() {

    try {
        let exp = expression;

        // STEP 1: convert "100 % 80" => "100*(80/100)"
        exp = exp.replace(/(\d+)\s*%\s*(\d+)/g, "($1*($2/100))");

        // STEP 2: convert "50%" => "(50/100)"
        exp = exp.replace(/(\d+)%/g, "($1/100)");

        expression = eval(exp).toString();

    } catch (err) {
        expression = "Error";
    }

    update();
}

/* =========================
   DISPLAY
========================= */
function update() {
    display.value = expression;
}

/* =========================
   ANIMATION
========================= */
function animate(btn) {
    btn.classList.add("active", "glow");
    setTimeout(() => btn.classList.remove("active", "glow"), 150);
}

function applyTheme() {

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

applyTheme();