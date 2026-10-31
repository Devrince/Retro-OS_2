// ---------- Terminal ----------
const termOutput = document.getElementById("term-output");
const termInput = document.getElementById("term-input");
const termBody = document.getElementById("term-body");

const OWNER_NAME = "your name"; // change this to your name

// Words you can use with "open", and the window each one opens
const appWindows = {
  music: "win-music",
  pdf: "win-pdf",
  terminal: "win-terminal",
  dino: "win-dino",
  calendar: "win-calendar",
  calculator: "win-calculator",
  computer: "win-computer",
  bin: "win-bin",
};

// Adds one line to the screen and scrolls to the bottom
function printLine(text) {
  const line = document.createElement("div");
  line.textContent = text;
  termOutput.appendChild(line);
  termBody.scrollTop = termBody.scrollHeight;
}

// Each command is a function. "args" holds the words typed after the command.
const commands = {
  help() {
    printLine("help          show this list");
    printLine("dir           list the PDF files");
    printLine("open <app>    open music, pdf, terminal, dino, calendar, calculator, computer or bin");
    printLine("date          show today's date");
    printLine("time          show the time");
    printLine("whoami        show the owner name");
    printLine("echo <text>   repeat what you typed");
    printLine("cls           clear the screen");
    printLine("ver           show the OS version");
  },

  dir() {
    if (pdfFiles.length === 0) {
      printLine("No files found.");
      return;
    }
    pdfFiles.forEach((file) => printLine(file.name));
  },

  open(args) {
    const app = (args[0] || "").toLowerCase();
    if (!app) {
      printLine("Usage: open <app>");
      return;
    }
    if (!Object.hasOwn(appWindows, app)) {
      printLine(`Unknown app: ${app}`);
      return;
    }
    openWindow(document.getElementById(appWindows[app]));
    printLine(`Opening ${app}...`);
  },

  date() {
    printLine(new Date().toLocaleDateString());
  },

  time() {
    printLine(new Date().toLocaleTimeString());
  },

  whoami() {
    printLine(OWNER_NAME);
  },

  echo(args) {
    printLine(args.join(" "));
  },

  cls() {
    termOutput.innerHTML = "";
  },

  ver() {
    printLine("Retro OS 2.0");
  },
};

// Splits what you typed into a command and its words, then runs it
function runCommand(text) {
  const parts = text.trim().split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (name === "") return;

  printLine("C:\\>" + text);

  if (Object.hasOwn(commands, name)) {
    commands[name](args);
  } else {
    printLine(`'${parts[0]}' is not recognized as a command. Type help.`);
  }
}

// Press Enter to run the command
termInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  runCommand(termInput.value);
  termInput.value = "";
});

// Clicking the terminal puts the cursor back in the input line
termBody.addEventListener("click", () => termInput.focus());

// Start up
printLine("Retro OS 2.0 Terminal");
printLine("Type help to see the commands.");