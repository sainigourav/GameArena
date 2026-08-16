const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const livesElement = document.getElementById("lives");
const coinsElement = document.getElementById("coins");
const scoreElement = document.getElementById("score");
const worldElement = document.getElementById("world");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const winScreen = document.getElementById("winScreen");

const startButton = document.getElementById("startButton");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");
const nextButton = document.getElementById("nextButton");

const finalScoreElement = document.getElementById("finalScore");
const winScoreElement = document.getElementById("winScore");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const jumpButton = document.getElementById("jumpButton");

const WIDTH = 1280;
const HEIGHT = 720;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const GRAVITY = 0.72;
const MAX_FALL_SPEED = 16;
const MOVE_ACCELERATION = 0.65;
const AIR_ACCELERATION = 0.42;
const MAX_SPEED = 6.5;
const FRICTION = 0.78;
const JUMP_FORCE = -13.5;

const keys = {
  left: false,
  right: false,
  jump: false
};

let gameState = "start";
let animationId = null;
let lastTime = 0;
let cameraX = 0;

let score = 0;
let coins = 0;
let lives = 3;

let particles = [];
let floatingTexts = [];
let enemies = [];
let level = null;

const player = {
  x: 100,
  y: 450,
  width: 34,
  height: 48,
  vx: 0,
  vy: 0,
  grounded: false,
  facing: 1,
  jumpLocked: false,
  invincible: 0,
  spawnX: 100,
  spawnY: 450
};

const COLORS = {
  sky: "#71c8f4",
  skyDark: "#4ca7d7",
  cloud: "#f8fafc",
  hill: "#65b96e",
  hillDark: "#3d9655",
  ground: "#9b5b32",
  groundDark: "#754126",
  grass: "#3f9f4d",
  block: "#e9a83b",
  blockDark: "#bd7424",
  brick: "#b95b37",
  brickDark: "#803c29",
  player: "#ef4444",
  playerDark: "#b91c1c",
  skin: "#f4b183",
  skinDark: "#d17b4f",
  shirt: "#2563eb",
  shirtDark: "#1d4ed8",
  shoe: "#27272a",
  enemy: "#8b5cf6",
  enemyDark: "#5b21b6",
  coin: "#facc15",
  coinDark: "#d97706",
  flag: "#22c55e",
  flagDark: "#15803d"
};

function createLevel() {
  return {
    width: 6800,
    platforms: [
      { x: 0, y: 625, w: 850, h: 95, type: "ground" },
      { x: 980, y: 625, w: 720, h: 95, type: "ground" },
      { x: 1830, y: 625, w: 760, h: 95, type: "ground" },
      { x: 2710, y: 625, w: 690, h: 95, type: "ground" },
      { x: 3520, y: 625, w: 820, h: 95, type: "ground" },
      { x: 4460, y: 625, w: 760, h: 95, type: "ground" },
      { x: 5360, y: 625, w: 1440, h: 95, type: "ground" },

      { x: 260, y: 500, w: 170, h: 28, type: "brick" },
      { x: 520, y: 420, w: 160, h: 28, type: "brick" },
      { x: 1130, y: 500, w: 190, h: 28, type: "brick" },
      { x: 1410, y: 430, w: 180, h: 28, type: "brick" },
      { x: 1940, y: 510, w: 170, h: 28, type: "brick" },
      { x: 2190, y: 420, w: 190, h: 28, type: "brick" },
      { x: 2830, y: 500, w: 190, h: 28, type: "brick" },
      { x: 3110, y: 400, w: 180, h: 28, type: "brick" },
      { x: 3670, y: 480, w: 180, h: 28, type: "brick" },
      { x: 3940, y: 390, w: 180, h: 28, type: "brick" },
      { x: 4600, y: 500, w: 180, h: 28, type: "brick" },
      { x: 4900, y: 415, w: 200, h: 28, type: "brick" },
      { x: 5560, y: 500, w: 180, h: 28, type: "brick" },
      { x: 5850, y: 430, w: 180, h: 28, type: "brick" },
      { x: 6200, y: 360, w: 220, h: 28, type: "brick" },

      { x: 700, y: 340, w: 70, h: 28, type: "block" },
      { x: 760, y: 340, w: 70, h: 28, type: "block" },
      { x: 1260, y: 330, w: 70, h: 28, type: "block" },
      { x: 1330, y: 330, w: 70, h: 28, type: "block" },
      { x: 1680, y: 300, w: 70, h: 28, type: "block" },
      { x: 1750, y: 300, w: 70, h: 28, type: "block" },
      { x: 2390, y: 330, w: 70, h: 28, type: "block" },
      { x: 2460, y: 330, w: 70, h: 28, type: "block" },
      { x: 3290, y: 300, w: 70, h: 28, type: "block" },
      { x: 4140, y: 300, w: 70, h: 28, type: "block" },
      { x: 4210, y: 300, w: 70, h: 28, type: "block" },
      { x: 5080, y: 300, w: 70, h: 28, type: "block" },
      { x: 6150, y: 240, w: 70, h: 28, type: "block" },
      { x: 6220, y: 240, w: 70, h: 28, type: "block" },

      { x: 880, y: 540, w: 100, h: 28, type: "brick" },
      { x: 1700, y: 540, w: 130, h: 28, type: "brick" },
      { x: 2590, y: 540, w: 120, h: 28, type: "brick" },
      { x: 3400, y: 540, w: 120, h: 28, type: "brick" },
      { x: 4340, y: 540, w: 120, h: 28, type: "brick" },
      { x: 5220, y: 540, w: 140, h: 28, type: "brick" }
    ],

    coins: [
      [300, 460], [360, 460], [550, 380], [610, 380],
      [730, 300], [800, 300], [1160, 460], [1220, 460],
      [1300, 290], [1370, 290], [1480, 380],
      [1710, 260], [1780, 260], [1960, 470], [2020, 470],
      [2220, 370], [2290, 370], [2410, 290], [2480, 290],
      [2870, 460], [2940, 460], [3140, 350], [3210, 350],
      [3310, 250], [3710, 440], [3780, 440],
      [3970, 340], [4040, 340], [4160, 250],
      [4630, 460], [4700, 460], [4930, 365], [5000, 365],
      [5110, 265], [5590, 460], [5660, 460],
      [5880, 380], [5950, 380], [6170, 190],
      [6240, 190], [6300, 310], [6370, 310]
    ].map(([x, y]) => ({
      x,
      y,
      collected: false,
      radius: 12,
      phase: Math.random() * Math.PI * 2
    })),

    finishX: 6550
  };
}

function createEnemies() {
  return [
    { x: 610, y: 570, width: 38, height: 40, vx: -1.2, minX: 450, maxX: 810, alive: true },
    { x: 1230, y: 570, width: 38, height: 40, vx: 1.1, minX: 1000, maxX: 1650, alive: true },
    { x: 2020, y: 570, width: 38, height: 40, vx: -1.3, minX: 1850, maxX: 2550, alive: true },
    { x: 2910, y: 570, width: 38, height: 40, vx: 1.4, minX: 2730, maxX: 3370, alive: true },
    { x: 3800, y: 570, width: 38, height: 40, vx: -1.4, minX: 3540, maxX: 4320, alive: true },
    { x: 4700, y: 570, width: 38, height: 40, vx: 1.5, minX: 4480, maxX: 5200, alive: true },
    { x: 5650, y: 570, width: 38, height: 40, vx: -1.6, minX: 5380, maxX: 6100, alive: true },
    { x: 6150, y: 570, width: 38, height: 40, vx: 1.4, minX: 5800, maxX: 6500, alive: true }
  ];
}

function resetGame() {
  score = 0;
  coins = 0;
  lives = 3;
  cameraX = 0;
  particles = [];
  floatingTexts = [];

  level = createLevel();
  enemies = createEnemies();

  resetPlayer();
  updateHud();
}

function resetPlayer() {
  player.x = player.spawnX;
  player.y = player.spawnY;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.invincible = 1000;
}

function updateHud() {
  livesElement.textContent = lives;
  coinsElement.textContent = coins;
  scoreElement.textContent = score;
  worldElement.textContent = "1-1";
}

function startGame() {
  resetGame();
  gameState = "playing";
  startScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  winScreen.classList.add("hidden");

  lastTime = performance.now();

  if (!animationId) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function pauseGame() {
  if (gameState !== "playing") return;

  gameState = "paused";
  pauseScreen.classList.remove("hidden");
}

function resumeGame() {
  if (gameState !== "paused") return;

  gameState = "playing";
  pauseScreen.classList.add("hidden");
  lastTime = performance.now();
}

function showGameOver() {
  gameState = "gameover";
  stopGameLoop();
  finalScoreElement.textContent = score;
  gameOverScreen.classList.remove("hidden");
}

function showWin() {
  gameState = "won";
  stopGameLoop();
  winScoreElement.textContent = score;
  winScreen.classList.remove("hidden");
}

function stopGameLoop() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function getPlatformCollisions(previousX, previousY) {
  const collisions = [];

  for (const platform of level.platforms) {
    if (
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.w &&
      player.y + player.height > platform.y &&
      player.y < platform.y + platform.h
    ) {
      collisions.push(platform);
    }
  }

  return collisions;
}

function updatePlayer(dt) {
  const previousY = player.y;

  const acceleration = player.grounded
    ? MOVE_ACCELERATION
    : AIR_ACCELERATION;

  if (keys.left) {
    player.vx -= acceleration * dt;
    player.facing = -1;
  }

  if (keys.right) {
    player.vx += acceleration * dt;
    player.facing = 1;
  }

  if (!keys.left && !keys.right) {
    player.vx *= Math.pow(FRICTION, dt);
  }

  player.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.vx));

  if (keys.jump && player.grounded && !player.jumpLocked) {
    player.vy = JUMP_FORCE;
    player.grounded = false;
    player.jumpLocked = true;
    createJumpParticles();
  }

  if (!keys.jump) {
    player.jumpLocked = false;
  }

  player.vy += GRAVITY * dt;
  player.vy = Math.min(player.vy, MAX_FALL_SPEED);

  player.x += player.vx * dt;

  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }

  if (player.x + player.width > level.width) {
    player.x = level.width - player.width;
  }

  player.y += player.vy * dt;
  player.grounded = false;

  const collisions = getPlatformCollisions(player.x, previousY);

  for (const platform of collisions) {
    const wasAbove = previousY + player.height <= platform.y + 8;
    const wasBelow = previousY >= platform.y + platform.h - 8;

    if (player.vy >= 0 && wasAbove) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.grounded = true;
    } else if (player.vy < 0 && wasBelow) {
      player.y = platform.y + platform.h;
      player.vy = 0;
    }
  }

  if (player.y > HEIGHT + 120) {
    loseLife();
  }

  if (player.invincible > 0) {
    player.invincible -= 16.67 * dt;
  }
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    enemy.x += enemy.vx * dt;

    if (enemy.x <= enemy.minX) {
      enemy.x = enemy.minX;
      enemy.vx = Math.abs(enemy.vx);
    }

    if (enemy.x + enemy.width >= enemy.maxX) {
      enemy.x = enemy.maxX - enemy.width;
      enemy.vx = -Math.abs(enemy.vx);
    }

    const enemyRect = {
      x: enemy.x,
      y: enemy.y,
      width: enemy.width,
      height: enemy.height
    };

    if (rectsOverlap(player, enemyRect)) {
      const playerBottom = player.y + player.height;
      const enemyTop = enemy.y;

      if (player.vy > 0 && playerBottom - enemyTop < 24) {
        enemy.alive = false;
        player.vy = -9;
        score += 150;
        addFloatingText(enemy.x, enemy.y, "+150");
        createEnemyParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        updateHud();
      } else if (player.invincible <= 0) {
        loseLife();
      }
    }
  }
}

function updateCoins(dt) {
  for (const coin of level.coins) {
    if (coin.collected) continue;

    coin.phase += 0.06 * dt;

    const coinRect = {
      x: coin.x - coin.radius,
      y: coin.y - coin.radius,
      width: coin.radius * 2,
      height: coin.radius * 2
    };

    if (rectsOverlap(player, coinRect)) {
      coin.collected = true;
      coins += 1;
      score += 50;

      addFloatingText(coin.x, coin.y, "+50");
      createCoinParticles(coin.x, coin.y);

      if (coins % 10 === 0) {
        lives += 1;
        addFloatingText(player.x, player.y - 20, "1-UP!");
      }

      updateHud();
    }
  }
}

function updateCamera() {
  const target = player.x - WIDTH * 0.38;

  cameraX += (target - cameraX) * 0.08;

  cameraX = Math.max(0, Math.min(cameraX, level.width - WIDTH));
}

function loseLife() {
  if (gameState !== "playing") return;

  lives -= 1;
  updateHud();

  if (lives <= 0) {
    showGameOver();
    return;
  }

  createDeathParticles(player.x + player.width / 2, player.y + player.height / 2);

  player.spawnX = Math.max(100, Math.floor(player.x / 800) * 800 + 80);
  player.spawnY = 450;

  resetPlayer();
}

function checkFinish() {
  if (player.x + player.width >= level.finishX) {
    score += 1000 + coins * 10;
    updateHud();
    showWin();
  }
}

function addFloatingText(x, y, text) {
  floatingTexts.push({
    x,
    y,
    text,
    life: 900,
    maxLife: 900
  });
}

function updateFloatingTexts(dt) {
  for (const item of floatingTexts) {
    item.y -= 0.8 * dt;
    item.life -= 16.67 * dt;
  }

  floatingTexts = floatingTexts.filter((item) => item.life > 0);
}

function createCoinParticles(x, y) {
  for (let i = 0; i < 10; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 5,
      size: Math.random() * 5 + 2,
      life: 500,
      maxLife: 500,
      type: "coin"
    });
  }
}

function createJumpParticles() {
  for (let i = 0; i < 5; i += 1) {
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 2,
      size: Math.random() * 4 + 2,
      life: 350,
      maxLife: 350,
      type: "dust"
    });
  }
}

function createEnemyParticles(x, y) {
  for (let i = 0; i < 12; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      size: Math.random() * 5 + 2,
      life: 450,
      maxLife: 450,
      type: "enemy"
    });
  }
}

function createDeathParticles(x, y) {
  for (let i = 0; i < 22; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: Math.random() * 7 + 2,
      life: 700,
      maxLife: 700,
      type: "death"
    });
  }
}

function updateParticles(dt) {
  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 0.15 * dt;
    particle.life -= 16.67 * dt;
  }

  particles = particles.filter((particle) => particle.life > 0);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#4bb6ea");
  gradient.addColorStop(0.62, "#9be0f5");
  gradient.addColorStop(1, "#d5f2fa");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawClouds();
  drawMountains();
  drawHills();
}

function drawClouds() {
  const offset = (cameraX * 0.12) % 500;

  for (let i = -1; i < 6; i += 1) {
    const x = i * 310 - offset;
    const y = 95 + (i % 2) * 45;

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 34, y - 17, 38, 0, Math.PI * 2);
    ctx.arc(x + 74, y, 29, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(x - 4, y, 82, 25);
  }
}

function drawMountains() {
  const offset = cameraX * 0.22;

  ctx.fillStyle = COLORS.hillDark;

  for (let i = -2; i < 8; i += 1) {
    const x = i * 360 - (offset % 360);

    ctx.beginPath();
    ctx.moveTo(x, 625);
    ctx.lineTo(x + 180, 330);
    ctx.lineTo(x + 360, 625);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = COLORS.hill;

  for (let i = -2; i < 8; i += 1) {
    const x = i * 420 - ((cameraX * 0.15) % 420);

    ctx.beginPath();
    ctx.moveTo(x, 625);
    ctx.lineTo(x + 210, 390);
    ctx.lineTo(x + 420, 625);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHills() {
  const offset = cameraX * 0.35;

  for (let i = -1; i < 8; i += 1) {
    const x = i * 260 - (offset % 260);

    ctx.fillStyle = "#4d9f58";
    ctx.beginPath();
    ctx.arc(x + 130, 610, 130, Math.PI, Math.PI * 2);
    ctx.fill();
  }
}

function drawWorld() {
  drawBackground();

  ctx.save();
  ctx.translate(-cameraX, 0);

  drawPlatforms();
  drawCoins();
  drawFinish();
  drawEnemies();
  drawPlayer();
  drawParticles();
  drawFloatingTexts();

  ctx.restore();
}

function drawPlatforms() {
  for (const platform of level.platforms) {
    if (
      platform.x + platform.w < cameraX - 50 ||
      platform.x > cameraX + WIDTH + 50
    ) {
      continue;
    }

    if (platform.type === "ground") {
      ctx.fillStyle = COLORS.ground;
      ctx.fillRect(platform.x, platform.y, platform.w, platform.h);

      ctx.fillStyle = COLORS.grass;
      ctx.fillRect(platform.x, platform.y, platform.w, 12);

      ctx.fillStyle = COLORS.groundDark;

      for (let x = platform.x; x < platform.x + platform.w; x += 45) {
        ctx.fillRect(x + 8, platform.y + 30, 20, 8);
        ctx.fillRect(x + 26, platform.y + 62, 14, 8);
      }
    } else {
      drawBlock(platform);
    }
  }
}

function drawBlock(platform) {
  const isBrick = platform.type === "brick";

  ctx.fillStyle = isBrick ? COLORS.brick : COLORS.block;
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);

  ctx.strokeStyle = isBrick ? COLORS.brickDark : COLORS.blockDark;
  ctx.lineWidth = 4;
  ctx.strokeRect(platform.x + 2, platform.y + 2, platform.w - 4, platform.h - 4);

  if (isBrick) {
    ctx.strokeStyle = COLORS.brickDark;
    ctx.lineWidth = 2;

    for (let x = platform.x + 40; x < platform.x + platform.w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, platform.y);
      ctx.lineTo(x, platform.y + platform.h);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(platform.x + 8, platform.y + 7, platform.w - 16, 5);
  }
}

function drawCoins() {
  for (const coin of level.coins) {
    if (coin.collected) continue;

    const squash = 0.25 + Math.abs(Math.sin(coin.phase)) * 0.75;

    ctx.save();
    ctx.translate(coin.x, coin.y);
    ctx.scale(squash, 1);

    ctx.fillStyle = COLORS.coinDark;
    ctx.beginPath();
    ctx.ellipse(0, 2, coin.radius + 2, coin.radius + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.coin;
    ctx.beginPath();
    ctx.ellipse(0, 0, coin.radius, coin.radius, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff3a3";
    ctx.fillRect(-3, -7, 4, 10);

    ctx.restore();
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const x = enemy.x;
    const y = enemy.y;

    ctx.fillStyle = COLORS.enemyDark;
    ctx.fillRect(x + 3, y + 8, enemy.width - 6, enemy.height - 8);

    ctx.fillStyle = COLORS.enemy;
    ctx.fillRect(x + 5, y + 4, enemy.width - 10, enemy.height - 10);

    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 9, y + 12, 7, 9);
    ctx.fillRect(x + 23, y + 12, 7, 9);

    ctx.fillStyle = "#111827";
    ctx.fillRect(x + 12, y + 15, 4, 5);
    ctx.fillRect(x + 25, y + 15, 4, 5);

    ctx.fillStyle = COLORS.enemyDark;
    ctx.fillRect(x + 2, y + enemy.height - 5, 13, 7);
    ctx.fillRect(x + 24, y + enemy.height - 5, 13, 7);
  }
}

function drawPlayer() {
  if (player.invincible > 0 && Math.floor(player.invincible / 80) % 2 === 0) {
    return;
  }

  const x = player.x;
  const y = player.y;

  ctx.save();

  if (player.facing === -1) {
    ctx.translate(x + player.width, y);
    ctx.scale(-1, 1);
    ctx.translate(-x, -y);
  }

  ctx.fillStyle = COLORS.shoe;
  ctx.fillRect(x + 3, y + 40, 13, 8);
  ctx.fillRect(x + 21, y + 40, 13, 8);

  ctx.fillStyle = COLORS.shirtDark;
  ctx.fillRect(x + 5, y + 24, 25, 19);

  ctx.fillStyle = COLORS.shirt;
  ctx.fillRect(x + 8, y + 21, 20, 20);

  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(x + 8, y + 8, 22, 17);

  ctx.fillStyle = COLORS.skinDark;
  ctx.fillRect(x + 26, y + 13, 8, 7);

  ctx.fillStyle = COLORS.playerDark;
  ctx.fillRect(x + 5, y + 4, 27, 8);

  ctx.fillStyle = COLORS.player;
  ctx.fillRect(x + 10, y, 21, 9);

  ctx.fillStyle = COLORS.skinDark;
  ctx.fillRect(x + 13, y + 15, 4, 4);

  ctx.fillStyle = "#111827";
  ctx.fillRect(x + 23, y + 12, 3, 4);

  ctx.restore();
}

function drawFinish() {
  const x = level.finishX;

  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(x, 260, 10, 365);

  ctx.fillStyle = COLORS.flagDark;
  ctx.fillRect(x + 10, 270, 105, 70);

  ctx.fillStyle = COLORS.flag;
  ctx.beginPath();
  ctx.moveTo(x + 10, 270);
  ctx.lineTo(x + 115, 270);
  ctx.lineTo(x + 10, 340);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#475569";
  ctx.fillRect(x - 12, 625, 55, 10);
}

function drawParticles() {
  for (const particle of particles) {
    const alpha = particle.life / particle.maxLife;

    ctx.globalAlpha = alpha;

    if (particle.type === "coin") {
      ctx.fillStyle = COLORS.coin;
    } else if (particle.type === "enemy") {
      ctx.fillStyle = COLORS.enemy;
    } else if (particle.type === "death") {
      ctx.fillStyle = COLORS.player;
    } else {
      ctx.fillStyle = "#f8fafc";
    }

    ctx.fillRect(
      particle.x - particle.size / 2,
      particle.y - particle.size / 2,
      particle.size,
      particle.size
    );
  }

  ctx.globalAlpha = 1;
}

function drawFloatingTexts() {
  ctx.textAlign = "center";
  ctx.font = "bold 18px Arial";

  for (const item of floatingTexts) {
    ctx.globalAlpha = item.life / item.maxLife;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(item.text, item.x, item.y);
  }

  ctx.globalAlpha = 1;
}

function gameLoop(timestamp) {
  if (gameState !== "playing") {
    animationId = null;
    return;
  }

  const delta = Math.min((timestamp - lastTime) / 16.67, 2);
  lastTime = timestamp;

  updatePlayer(delta);
  updateEnemies(delta);
  updateCoins(delta);
  updateParticles(delta);
  updateFloatingTexts(delta);
  updateCamera();
  checkFinish();

  drawWorld();

  animationId = requestAnimationFrame(gameLoop);
}

function setKeyState(direction, value) {
  keys[direction] = value;
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();

  if (
    key === "arrowleft" ||
    key === "arrowright" ||
    key === "arrowup" ||
    key === " " ||
    key === "a" ||
    key === "d" ||
    key === "w"
  ) {
    event.preventDefault();
  }

  if (key === "arrowleft" || key === "a") {
    setKeyState("left", true);
  }

  if (key === "arrowright" || key === "d") {
    setKeyState("right", true);
  }

  if (key === "arrowup" || key === "w" || key === " ") {
    setKeyState("jump", true);
  }

  if (key === "p") {
    if (gameState === "playing") {
      pauseGame();
    } else if (gameState === "paused") {
      resumeGame();
    }
  }

  if (key === "r" && gameState === "gameover") {
    startGame();
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") {
    setKeyState("left", false);
  }

  if (key === "arrowright" || key === "d") {
    setKeyState("right", false);
  }

  if (key === "arrowup" || key === "w" || key === " ") {
    setKeyState("jump", false);
  }
}

function bindMobileButton(button, direction) {
  const press = (event) => {
    event.preventDefault();
    setKeyState(direction, true);
  };

  const release = (event) => {
    event.preventDefault();
    setKeyState(direction, false);
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

startButton.addEventListener("click", startGame);
resumeButton.addEventListener("click", resumeGame);
restartButton.addEventListener("click", startGame);
nextButton.addEventListener("click", startGame);

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

bindMobileButton(leftButton, "left");
bindMobileButton(rightButton, "right");
bindMobileButton(jumpButton, "jump");

window.addEventListener("blur", () => {
  keys.left = false;
  keys.right = false;
  keys.jump = false;

  if (gameState === "playing") {
    pauseGame();
  }
});

level = createLevel();
enemies = createEnemies();
updateHud();
drawWorld();
