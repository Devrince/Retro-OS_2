// time for taskbar
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([],  {
        hour: "2-digit",
        minute: "2-digit",
    });
    document.getElementById("clock").textContent = time;
}

updateClock();
setInterval(updateClock, 1000);

//  Window system 
let topZ = 10;
let activeWindow = null;
const allWindows = document.querySelectorAll(".window");

// window to the front 
function focusWindow(win) {
  topZ++;
  win.style.zIndex = topZ;
  activeWindow = win;
  allWindows.forEach((w) => w.classList.toggle("inactive", w !== win));
  updateTaskbar();
}

function openWindow(win) {
  if (win.dataset.state === "minimized") {
    win.style.display = "flex";
    void win.offsetWidth;
    win.classList.remove("minimized");
  } else {
    win.style.display = "flex";
  }
  win.dataset.state = "open";
  focusWindow(win);
}

function minimizeWindow(win) {
  win.classList.add("minimized");
  win.dataset.state = "minimized";
  setTimeout(() => {
    if (win.dataset.state === "minimized") {
      win.style.display = "none";
    }
  }, 250);
  updateTaskbar();
}

function closeWindow(win) {
  win.style.display = "none";
  win.classList.remove("minimized");
  win.dataset.state = "closed";
  updateTaskbar();
}

// taskbar button for every window
function updateTaskbar() {
  document.querySelectorAll(".task").forEach((btn) => {
    const win = document.getElementById(btn.dataset.target);
    btn.classList.toggle("show", win.dataset.state !== "closed");
    btn.classList.toggle("pressed", win === activeWindow && win.dataset.state === "open");
  });
}

// Drag a window 
function makeDraggable(win) {
  const bar = win.querySelector(".titlebar");
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".controls")) return;
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    bar.setPointerCapture(e.pointerId);
    focusWindow(win);
  });

  bar.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    win.style.left = e.clientX - offsetX + "px";
    win.style.top = e.clientY - offsetY + "px";
  });

  const stopDragging = () => {
    dragging = false;
  };
  bar.addEventListener("pointerup", stopDragging);
  bar.addEventListener("pointercancel", stopDragging);
}

// Set up every window
allWindows.forEach((win) => {
  win.dataset.state = "closed";
  makeDraggable(win);
  win.addEventListener("pointerdown", () => {
    if (win.dataset.state === "open") focusWindow(win);
  });
  win.querySelector(".ctrl-min").addEventListener("click", () => minimizeWindow(win));
  win.querySelector(".ctrl-close").addEventListener("click", () => closeWindow(win));
});

// Taskbar buttons: restore a minimized window, minimize the front one, or bring a window forward
document.querySelectorAll(".task").forEach((btn) => {
  btn.addEventListener("click", () => {
    const win = document.getElementById(btn.dataset.target);
    if (win.dataset.state === "minimized") {
      openWindow(win);
    } else if (win === activeWindow && win.dataset.state === "open") {
      minimizeWindow(win);
    } else {
      focusWindow(win);
    }
  });
});

// Desktop icons open their window on double-click
document.querySelectorAll(".icon").forEach((icon) => {
  icon.addEventListener("dblclick", () => {
    openWindow(document.getElementById(icon.dataset.target));
  });
});

// ---------- My Computer: drive and search ----------
const drive = { totalMB: 9, usedMB: 6 };
document.getElementById("drive-fill").style.width = (drive.usedMB / drive.totalMB) * 100 + "%";
document.getElementById("drive-info").textContent =
  `${drive.usedMB} MB used, ${drive.totalMB - drive.usedMB} MB free`;

const search = document.getElementById("search");
search.addEventListener("input", () => {
  const query = search.value.trim().toLowerCase();
  const matches = "local disk (c:)".includes(query);
  document.getElementById("drive-c").classList.toggle("hidden", !matches);
  document.getElementById("no-results").classList.toggle("hidden", matches);
});

// ---------- Bin ----------
document.getElementById("empty-bin").addEventListener("click", () => {
  document.getElementById("bin-status").textContent = "Nice try. This file is staying.";
});

document.getElementById("file-112").addEventListener("dblclick", () => {
  openWindow(document.getElementById("win-image"));
});

// ---------- Calendar ----------
function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  document.getElementById("cal-title").textContent = now.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  const grid = document.getElementById("cal-grid");
  grid.innerHTML = "";

  ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "head";
    cell.textContent = day;
    grid.appendChild(cell);
  });

  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells before the 1st
  for (let i = 0; i < firstWeekday; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.textContent = day;
    if (day === today) cell.classList.add("today");
    grid.appendChild(cell);
  }
}
renderCalendar();

// ---------- Calculator ----------
const display = document.getElementById("calc-display");
let current = "0";      // the number on screen
let stored = null;      // the first number, waiting for the second
let pendingOp = null;   // + - * /
let startNew = false;   // true right after an operator or =

function calculate(a, op, b) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? 0 : a / b;
}

// One listener on the whole keypad (event delegation)
document.querySelector(".calc-keys").addEventListener("click", (e) => {
  const key = e.target.dataset.key;
  if (!key) return;

  if ("0123456789.".includes(key)) {
    if (startNew) {
      current = "0";
      startNew = false;
    }
    if (key === "." && current.includes(".")) return;
    current = current === "0" && key !== "." ? key : current + key;
  } else if (key === "C") {
    current = "0";
    stored = null;
    pendingOp = null;
    startNew = false;
  } else if (key === "=") {
    if (pendingOp !== null && stored !== null) {
      current = String(calculate(stored, pendingOp, Number(current)));
    }
    stored = null;
    pendingOp = null;
    startNew = true;
  } else {
    // + - * /
    if (pendingOp !== null && stored !== null && !startNew) {
      current = String(calculate(stored, pendingOp, Number(current)));
    }
    stored = Number(current);
    pendingOp = key;
    startNew = true;
  }

  display.textContent = current;
});

// ---------- Start: everything is ready ----------
allWindows.forEach((w) => {
  if (w.dataset.state === "closed") updateTaskbar();
});