// ---------- Dino Run game ----------
const dinoWin = document.getElementById("win-dino");
const dinoCanvas = document.getElementById("dino-canvas");
const dinoCtx = dinoCanvas.getContext("2d");

const GROUND_Y = 150;   // y position of the ground line
const GRAVITY = 0.6;
const JUMP_POWER = -11; // negative means up

let dinoState = "ready"; // "ready", "running", or "over"
let dinoFrame = 0;
let dinoSpeed = 5;
let dinoScore = 0;
let dinoHigh = Number(localStorage.getItem("dino-high") || 0);
let dinoCacti = [];
let dinoNextCactus = 0;

const dino = {
  x: 40,
  y: GROUND_Y - 44,
  w: 40,
  h: 44,
  vy: 0,
  onGround: true,
};

// Puts everything back to the start and begins running
function dinoReset() {
  dino.y = GROUND_Y - dino.h;
  dino.vy = 0;
  dino.onGround = true;
  dinoCacti = [];
  dinoFrame = 0;
  dinoScore = 0;
  dinoSpeed = 5;
  dinoNextCactus = 60;
  dinoState = "running";
}

// One action for Space, the Up arrow, and clicks
function dinoAction() {
  if (dinoState !== "running") {
    dinoReset();
  }
  if (dino.onGround) {
    dino.vy = JUMP_POWER;
    dino.onGround = false;
  }
}

function dinoGameOver() {
  dinoState = "over";
  if (dinoScore > dinoHigh) {
    dinoHigh = dinoScore;
    localStorage.setItem("dino-high", String(dinoHigh));
  }
}

// Creates a new cactus at the right edge
function dinoSpawnCactus() {
  const sizes = [
    { w: 20, h: 40 },
    { w: 28, h: 50 },
    { w: 40, h: 40 },
  ];
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  dinoCacti.push({
    x: dinoCanvas.width,
    y: GROUND_Y - size.h,
    w: size.w,
    h: size.h,
  });
  // The gap between cacti gets smaller as the speed goes up
  dinoNextCactus = Math.max(35, 60 + Math.random() * 60 - dinoSpeed * 3);
}

// Moves everything one frame forward
function dinoUpdate() {
  if (dinoState !== "running") return;

  // Gravity pulls the dino back down to the ground
  dino.vy += GRAVITY;
  dino.y += dino.vy;
  if (dino.y >= GROUND_Y - dino.h) {
    dino.y = GROUND_Y - dino.h;
    dino.vy = 0;
    dino.onGround = true;
  }

  dinoFrame++;
  dinoScore = Math.floor(dinoFrame / 5);
  dinoSpeed = Math.min(14, 5 + dinoScore / 300);

  dinoNextCactus--;
  if (dinoNextCactus <= 0) dinoSpawnCactus();

  dinoCacti.forEach((c) => (c.x -= dinoSpeed));
  dinoCacti = dinoCacti.filter((c) => c.x + c.w > 0);

  // Collision check. The padding lets near-misses count as safe.
  const hit = dinoCacti.some(
    (c) =>
      dino.x + 6 < c.x + c.w &&
      dino.x + dino.w - 6 > c.x &&
      dino.y + 4 < c.y + c.h &&
      dino.y + dino.h > c.y
  );
  if (hit) dinoGameOver();
}

// Draws the current frame
function dinoDraw() {
  const ctx = dinoCtx;
  const W = dinoCanvas.width;
  const x = dino.x;
  const y = dino.y;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, dinoCanvas.height);

  // Ground line
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, GROUND_Y, W, 2);

  // Dino: body, head, tail
  ctx.fillRect(x + 6, y + 14, 26, 18);
  ctx.fillRect(x + 18, y + 2, 20, 16);
  ctx.fillRect(x, y + 18, 8, 6);

  // Eye (white square on the black head)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 28, y + 6, 4, 4);
  ctx.fillStyle = "#000000";

  // Legs alternate every few frames to look like running
  const stepA = dinoState === "running" && dino.onGround && Math.floor(dinoFrame / 6) % 2 === 0;
  const legTop1 = stepA ? 32 : 36;
  const legTop2 = stepA ? 36 : 32;
  ctx.fillRect(x + 10, y + legTop1, 6, 44 - legTop1);
  ctx.fillRect(x + 20, y + legTop2, 6, 44 - legTop2);

  // Cacti
  dinoCacti.forEach((c) => ctx.fillRect(c.x, c.y, c.w, c.h));

  // Score: high score and current score
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText(
    `HI ${String(dinoHigh).padStart(5, "0")}   ${String(dinoScore).padStart(5, "0")}`,
    W - 10,
    22
  );

  // Messages for the start and end of a game
  ctx.textAlign = "center";
  if (dinoState === "ready") {
    ctx.fillText("Press Space or click to start", W / 2, 80);
  }
  if (dinoState === "over") {
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText("GAME OVER", W / 2, 80);
    ctx.font = "14px 'Courier New', monospace";
    ctx.fillText("Press Space to retry", W / 2, 105);
  }
}

function dinoLoop() {
  dinoUpdate();
  dinoDraw();
  requestAnimationFrame(dinoLoop);
}

// Keyboard: only when the Dino window is the front window
document.addEventListener("keydown", (e) => {
  const isFront = dinoWin.dataset.state === "open" && activeWindow === dinoWin;
  if (!isFront) return;
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault(); // stops the page from scrolling
    dinoAction();
  }
});

// Mouse: a click on the game jumps
dinoCanvas.addEventListener("pointerdown", dinoAction);

// Start up
dinoDraw();
dinoLoop();