// ============================================================
// SUPER MARIO STYLE GAME
// 15 LEVELS + 7 ANIMAL ENEMIES + RUNNING + SOUND SYSTEM
// ============================================================


// ============================================================
// CANVAS
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const coinsElement = document.getElementById("coins");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");

const message = document.getElementById("message");
const messageIcon = document.getElementById("messageIcon");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const restartButton = document.getElementById("restartButton");
const scoreLabel = document.getElementById("scoreLabel");
const coinsLabel = document.getElementById("coinsLabel");
const livesLabel = document.getElementById("livesLabel");
const levelLabel = document.getElementById("levelLabel");
const moveControl = document.getElementById("moveControl");
const jumpControl = document.getElementById("jumpControl");


// ============================================================
// CANVAS SIZE
// ============================================================

function resizeCanvas() {

  const rect = canvas.getBoundingClientRect();

  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ============================================================
// GAME VARIABLES
// ============================================================

const TOTAL_LEVELS = 30;

let score = 0;
let coins = 0;
let lives = 3;

let currentLevel = 1;

let cameraX = 0;

let gameOver = false;
let gameWon = false;
let changingLevel = false;
let gameRunning = false;

let animationId = null;

let platforms = [];
let enemies = [];
let coinList = [];

let hazards = [];

let goal = null;

let currentWorld = null;
let currentLevelWidth = 0;

let levelStartScore = 0;
let levelStartCoins = 0;


// ============================================================
// SOUND SYSTEM
// ============================================================

let audioContext = null;

let masterGain = null;

let soundEnabled = true;

let musicTimer = null;

let musicStep = 0;


// ------------------------------------------------------------
// CREATE AUDIO CONTEXT
// ------------------------------------------------------------

function initAudio() {

  if (!audioContext) {

    const AudioCtx =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioCtx) {
      return;
    }

    audioContext =
      new AudioCtx();

    masterGain =
      audioContext.createGain();

    masterGain.gain.value =
      0.16;

    masterGain.connect(
      audioContext.destination
    );
  }


  if (
    audioContext.state === "suspended"
  ) {

    audioContext.resume();
  }
}


// ------------------------------------------------------------
// MASTER VOLUME
// ------------------------------------------------------------

function setMasterVolume(value) {

  if (!masterGain) {
    return;
  }

  masterGain.gain.setTargetAtTime(
    value,
    audioContext.currentTime,
    0.03
  );
}


// ------------------------------------------------------------
// GENERIC SOUND
// ------------------------------------------------------------

function playTone(
  frequency,
  duration,
  type = "square",
  volume = 0.15,
  slide = 0
) {

  if (!soundEnabled) {
    return;
  }

  initAudio();

  if (!audioContext) {
    return;
  }


  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();


  oscillator.type =
    type;

  oscillator.frequency.setValueAtTime(
    frequency,
    audioContext.currentTime
  );


  if (slide !== 0) {

    oscillator.frequency.linearRampToValueAtTime(
      frequency + slide,
      audioContext.currentTime +
      duration
    );
  }


  gain.gain.setValueAtTime(
    0.0001,
    audioContext.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    volume,
    audioContext.currentTime + 0.01
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime +
    duration
  );


  oscillator.connect(gain);

  gain.connect(masterGain);


  oscillator.start();

  oscillator.stop(
    audioContext.currentTime +
    duration +
    0.02
  );
}


// ============================================================
// GAME SOUNDS
// ============================================================


// ------------------------------------------------------------
// JUMP
// ------------------------------------------------------------

function soundJump(isRunning = false) {

  if (isRunning) {

    playTone(
      260,
      0.09,
      "square",
      0.13,
      260
    );

    setTimeout(() => {

      playTone(
        520,
        0.12,
        "square",
        0.1,
        180
      );

    }, 60);

  } else {

    playTone(
      300,
      0.08,
      "square",
      0.12,
      170
    );

    setTimeout(() => {

      playTone(
        470,
        0.1,
        "square",
        0.08,
        100
      );

    }, 50);
  }
}


// ------------------------------------------------------------
// COIN
// ------------------------------------------------------------

function soundCoin() {

  playTone(
    880,
    0.07,
    "square",
    0.12,
    180
  );

  setTimeout(() => {

    playTone(
      1320,
      0.1,
      "square",
      0.1,
      100
    );

  }, 65);
}


// ------------------------------------------------------------
// STOMP ENEMY
// ------------------------------------------------------------

function soundEnemyStomp() {

  playTone(
    170,
    0.07,
    "square",
    0.13,
    -80
  );

  setTimeout(() => {

    playTone(
      90,
      0.08,
      "triangle",
      0.08,
      -40
    );

  }, 40);
}


// ------------------------------------------------------------
// ENEMY HIT
// ------------------------------------------------------------

function soundEnemyHit() {

  playTone(
    120,
    0.12,
    "sawtooth",
    0.1,
    -90
  );
}


// ------------------------------------------------------------
// PLAYER DAMAGE
// ------------------------------------------------------------

function soundDamage() {

  playTone(
    220,
    0.12,
    "sawtooth",
    0.12,
    -130
  );

  setTimeout(() => {

    playTone(
      100,
      0.18,
      "square",
      0.1,
      -40
    );

  }, 90);
}


// ------------------------------------------------------------
// GAME OVER
// ------------------------------------------------------------

function soundGameOver() {

  const notes = [
    440,
    370,
    310,
    220
  ];


  notes.forEach(
    (note, index) => {

      setTimeout(() => {

        playTone(
          note,
          0.22,
          "square",
          0.09,
          -30
        );

      }, index * 170);
    }
  );
}


// ------------------------------------------------------------
// EXTRA LIFE
// ------------------------------------------------------------

function soundExtraLife() {

  playTone(
    523,
    0.08,
    "square",
    0.09,
    100
  );

  setTimeout(() => {

    playTone(
      659,
      0.08,
      "square",
      0.09,
      120
    );

  }, 80);

  setTimeout(() => {

    playTone(
      784,
      0.14,
      "square",
      0.1,
      80
    );

  }, 160);
}


// ------------------------------------------------------------
// LEVEL COMPLETE
// ------------------------------------------------------------

function soundLevelComplete() {

  const notes = [
    523,
    659,
    784,
    1046
  ];


  notes.forEach(
    (note, index) => {

      setTimeout(() => {

        playTone(
          note,
          0.16,
          "square",
          0.09,
          60
        );

      }, index * 120);
    }
  );
}


// ------------------------------------------------------------
// FINAL VICTORY
// ------------------------------------------------------------

function soundVictory() {

  const notes = [
    523,
    659,
    784,
    1046,
    784,
    1046,
    1318
  ];


  notes.forEach(
    (note, index) => {

      setTimeout(() => {

        playTone(
          note,
          0.22,
          "square",
          0.1,
          40
        );

      }, index * 150);
    }
  );
}


// ------------------------------------------------------------
// BUTTON
// ------------------------------------------------------------

function soundButton() {

  playTone(
    500,
    0.06,
    "square",
    0.07,
    100
  );
}


// ------------------------------------------------------------
// RUNNING SOUND
// ------------------------------------------------------------

let lastRunSound = 0;

function soundRunning() {

  const now =
    performance.now();


  if (
    now - lastRunSound <
    180
  ) {
    return;
  }


  lastRunSound = now;


  playTone(
    95,
    0.035,
    "triangle",
    0.025,
    -20
  );
}


// ============================================================
// BACKGROUND MUSIC
// ============================================================

const musicTracks = [

  // Level 1
  [
    262,
    330,
    392,
    330,
    294,
    349,
    440,
    349
  ],

  // Level 2
  [
    294,
    370,
    440,
    494,
    440,
    370,
    330,
    294
  ],

  // Level 3
  [
    220,
    262,
    330,
    392,
    330,
    262,
    220,
    196
  ],

  // Level 4
  [
    330,
    392,
    494,
    587,
    494,
    392,
    330,
    294
  ],

  // Level 5
  [
    294,
    349,
    440,
    523,
    440,
    349,
    294,
    262
  ],

  // Level 6
  [
    196,
    233,
    294,
    349,
    294,
    233,
    196,
    175
  ],

  // Level 7
  [
    147,
    175,
    220,
    262,
    220,
    175,
    147,
    131
  ]

];


function startMusic() {

  stopMusic();

  if (!soundEnabled) {
    return;
  }


  initAudio();

  if (!audioContext) {
    return;
  }


  musicStep = 0;


  musicTimer =
    setInterval(() => {

      if (
        !gameRunning ||
        gameOver ||
        gameWon
      ) {
        return;
      }


      const track =
        musicTracks[
          (currentLevel - 1) % musicTracks.length
        ];


      const note =
        track[
          musicStep %
          track.length
        ];


      playTone(
        note,
        0.11,
        "triangle",
        0.018,
        0
      );


      musicStep++;

    }, 230);
}


function stopMusic() {

  if (
    musicTimer !== null
  ) {

    clearInterval(
      musicTimer
    );

    musicTimer = null;
  }
}


function toggleSound() {

  soundEnabled =
    !soundEnabled;


  if (soundEnabled) {

    initAudio();

    setMasterVolume(0.16);

    startMusic();

  } else {

    setMasterVolume(0);

    stopMusic();
  }


  updateSoundButton();
}


// ============================================================
// SOUND BUTTON
// ============================================================

let soundButtonElement = null;


function createSoundButton() {

  if (
    document.getElementById(
      "soundToggle"
    )
  ) {

    soundButtonElement =
      document.getElementById(
        "soundToggle"
      );

    updateSoundButton();

    return;
  }


  soundButtonElement =
    document.createElement(
      "button"
    );


  soundButtonElement.id =
    "soundToggle";


  soundButtonElement.type =
    "button";


  soundButtonElement.textContent =
    "🔊";


  soundButtonElement.title =
    "تشغيل / إيقاف الصوت";


  soundButtonElement.style.position =
    "fixed";


  soundButtonElement.style.top =
    "18px";


  soundButtonElement.style.right =
    "18px";


  soundButtonElement.style.zIndex =
    "9999";


  soundButtonElement.style.width =
    "48px";


  soundButtonElement.style.height =
    "48px";


  soundButtonElement.style.border =
    "2px solid rgba(255,255,255,.7)";


  soundButtonElement.style.borderRadius =
    "50%";


  soundButtonElement.style.background =
    "rgba(20,25,40,.8)";


  soundButtonElement.style.color =
    "#fff";


  soundButtonElement.style.fontSize =
    "22px";


  soundButtonElement.style.cursor =
    "pointer";


  soundButtonElement.style.backdropFilter =
    "blur(6px)";


  soundButtonElement.style.boxShadow =
    "0 4px 15px rgba(0,0,0,.3)";


  soundButtonElement.addEventListener(
    "click",
    () => {

      initAudio();

      toggleSound();
    }
  );


  document.body.appendChild(
    soundButtonElement
  );


  updateSoundButton();
}


function updateSoundButton() {

  if (
    !soundButtonElement
  ) {
    return;
  }


  soundButtonElement.textContent =
    soundEnabled
      ? "🔊"
      : "🔇";
}


createSoundButton();


// ============================================================
// KEYBOARD
// ============================================================

const keys = {};

document.addEventListener(
  "keydown",
  e => {

    // تفعيل الصوت عند أول تفاعل
    initAudio();


    const key =
      e.key.toLowerCase();


    keys[key] = true;


    if (
      [
        "arrowleft",
        "arrowright",
        "arrowup",
        " ",
        "a",
        "d",
        "w",
        "shift"
      ].includes(key)
    ) {

      e.preventDefault();
    }
  }
);


document.addEventListener(
  "keyup",
  e => {

    keys[
      e.key.toLowerCase()
    ] = false;
  }
);


// ============================================================
// PLAYER
// ============================================================

const player = {

  x: 100,

  y: 400,

  width: 42,

  height: 58,

  vx: 0,

  vy: 0,

  walkSpeed: 4.2,

  runSpeed: 7.5,

  normalJump: 13.5,

  runJump: 16.5,

  runAcceleration: 0.75,

  walkAcceleration: 0.55,

  friction: 0.78,

  gravity: 0.62,

  ground: false,

  direction: 1,

  running: false
};


// ============================================================
// WORLD DATA
// ============================================================

function platform(
  x,
  y,
  width,
  height = 55
) {

  return {
    x,
    y,
    width,
    height
  };
}


function enemy(
  type,
  x,
  y,
  minX,
  maxX,
  speed
) {

  let width = 42;

  let height = 40;


  if (type === 2) {

    width = 38;
    height = 38;
  }


  if (type === 4) {

    width = 45;
    height = 35;
  }


  if (type === 5) {

    width = 55;
    height = 40;
  }


  if (type === 7) {

    width = 55;
    height = 42;
  }


  return {

    type,

    x,

    y,

    width,

    height,

    minX,

    maxX,

    speed,

    direction: 1,

    alive: true,

    vy: 0,

    gravity: 0.5,

    jumpPower: 9,

    baseY: y,

    time:
      Math.random() * 10,

    hits:
      type === 7
        ? 2
        : 1
  };
}


// ============================================================
// WORLDS
// ============================================================

const worlds = [

  { name: "المروج الخضراء", theme: "grass", sky1: "#54c9ff", sky2: "#e7fbff" },
  { name: "شاطئ الحيتان", theme: "ocean", sky1: "#45b9e8", sky2: "#d8f7ff" },
  { name: "الغابة البرية", theme: "forest", sky1: "#319f7a", sky2: "#bce8bd" },
  { name: "الصحراء الحمراء", theme: "desert", sky1: "#f2a94b", sky2: "#ffe7a5" },
  { name: "جبال الجليد", theme: "ice", sky1: "#6db8e6", sky2: "#e9fbff" },
  { name: "وادي البركان", theme: "volcano", sky1: "#381c2d", sky2: "#e16b3b" },
  { name: "قلعة الظلام", theme: "castle", sky1: "#11162f", sky2: "#574b7a" },
  { name: "مستنقع التماسيح", theme: "swamp", sky1: "#183f35", sky2: "#79b36b" },
  { name: "كهوف الخفافيش", theme: "cave", sky1: "#101522", sky2: "#4c5270" },
  { name: "مدينة العاصفة", theme: "storm", sky1: "#29344f", sky2: "#9aa9c7" },
  { name: "جزيرة القراصنة", theme: "pirate", sky1: "#178bb5", sky2: "#d9f3ff" },
  { name: "سهول العقارب", theme: "desertNight", sky1: "#291d3d", sky2: "#c16b65" },
  { name: "غابة الأشواك", theme: "thorn", sky1: "#173b2d", sky2: "#7fbf78" },
  { name: "بحيرة الوحوش", theme: "monsterLake", sky1: "#173d57", sky2: "#6db3c7" },
  { name: "قلعة النهاية", theme: "final", sky1: "#090b18", sky2: "#6f304a" },
  { name: "حدائق الزهور", theme: "flower", sky1: "#79d9ff", sky2: "#ffd4e8" },
  { name: "غابة النخيل", theme: "palm", sky1: "#38c7e8", sky2: "#fff0a8" },
  { name: "وادي النجوم", theme: "stars", sky1: "#10183d", sky2: "#394d8a" },
  { name: "مزارع القمح", theme: "wheat", sky1: "#71c9f0", sky2: "#ffe6a0" },
  { name: "قمم الثلج", theme: "snowmount", sky1: "#6ea8d8", sky2: "#f5fcff" },
  { name: "الغابة المطيرة", theme: "rainforest", sky1: "#1e9b7a", sky2: "#b7f0bd" },
  { name: "مملكة المطر", theme: "rain", sky1: "#4e6f91", sky2: "#b7c9d9" },
  { name: "بركان الرماد", theme: "ash", sky1: "#24202a", sky2: "#8f6258" },
  { name: "وادي الصخور", theme: "rocks", sky1: "#6f8795", sky2: "#d9c5a5" },
  { name: "البحر الفيروزي", theme: "turquoise", sky1: "#20bcd5", sky2: "#d7fbff" },
  { name: "الغابة الذهبية", theme: "goldforest", sky1: "#4c9d76", sky2: "#f3d77a" },
  { name: "جزيرة القمر", theme: "moon", sky1: "#111a3a", sky2: "#52668f" },
  { name: "مدينة البرق", theme: "lightning", sky1: "#202c4a", sky2: "#8c78aa" },
  { name: "القلعة الملكية", theme: "royal", sky1: "#261a45", sky2: "#9a5a82" }

];


// ============================================================
// LEVEL GENERATOR
// ============================================================

function createLevel(number) {

  // Deterministic level generation: retrying a level restores the exact same layout.
  let seed = (number * 10007 + 731) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // Difficulty: exactly 40% on level 1 -> 100% on level 15.
  const difficulty =
    0.40 + (number - 1) * (0.60 / 29);

  // Stage length: calibrated for roughly 1 minute of running.
  // Run speed is about 7.5 px/frame, so ~27,000 px is close to 60 seconds at 60 FPS.
  const width =
    27000 + (number - 1) * 120;

  const gap =
    Math.max(72, 155 - difficulty * 65);

  const list = [];
  const groundY = 550;
  let x = 0;

  list.push(platform(0, groundY, 420));
  x = 500;

  let index = 0;
  while (x < width - 360) {

    const pWidth =
      135 + rand() * (105 - difficulty * 35);

    const heightVariation =
      55 + difficulty * 145;

    const y =
      Math.min(515, 340 + rand() * heightVariation);

    list.push(
      platform(
        x,
        y,
        Math.max(105, pWidth)
      )
    );

    const localGap =
      gap + rand() * Math.max(25, 80 - difficulty * 45);

    x += pWidth + localGap;
    index++;
  }

  list.push(platform(width - 360, 500, 360));

  // Coins
  const generatedCoins = [];
  list.forEach((p, i) => {
    if (i === 0 || i === list.length - 1) return;

    const amount =
      1 + ((i + number) % 3 === 0 ? 1 : 0);

    for (let j = 0; j < amount; j++) {
      generatedCoins.push({
        x: p.x + 35 + j * 42,
        y: p.y - 52,
        collected: false
      });
    }
  });

  // Seven distinct animal enemy classes.
  const generatedEnemies = [];
  for (let i = 3; i < list.length - 1; i++) {
    const spawnChance = 0.52 + difficulty * 0.42;
    if (rand() < spawnChance) {
      const p = list[i];
      const type = ((i + number * 2) % 7) + 1;
      generatedEnemies.push(
        enemy(
          type,
          p.x + 30,
          p.y - 42,
          p.x + 8,
          p.x + p.width - 50,
          1.25 + difficulty * 2.0 + rand() * 0.55
        )
      );
    }
  }

  // Extra dangerous animals on later levels.
  if (number >= 5) {
    for (let i = 4; i < list.length - 1; i += 3) {
      const p = list[i];
      generatedEnemies.push(
        enemy(
          ((i + number + 4) % 7) + 1,
          p.x + Math.min(60, p.width * 0.35),
          p.y - 42,
          p.x + 12,
          p.x + p.width - 55,
          1.5 + difficulty * 2.2
        )
      );
    }
  }

  // Water hazards in selected gaps: rivers with whales/crocodiles.
  const generatedHazards = [];
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];
    const gapWidth = b.x - (a.x + a.width);

    if (gapWidth > 85 && (i + number) % 3 === 0) {
      generatedHazards.push({
        kind: (i + number) % 2 === 0 ? 'whale' : 'crocodile',
        x: a.x + a.width + 2,
        y: 548,
        width: gapWidth - 4,
        height: 95,
        phase: rand() * Math.PI * 2,
        active: true
      });
    }
  }

  return {
    width,
    difficulty,
    platforms: list,
    coins: generatedCoins,
    enemies: generatedEnemies,
    hazards: generatedHazards,
    goal: {
      x: width - 120,
      y: 390,
      width: 35,
      height: 110
    }
  };
}


// ============================================================
// LOAD LEVEL
// ============================================================

function loadLevel(number, snapshotProgress = true) {

  currentWorld =
    worlds[
      number - 1
    ];


  if (snapshotProgress) {
    levelStartScore = score;
    levelStartCoins = coins;
  }


  const data =
    createLevel(number);

  currentLevelWidth = data.width;

  platforms =
    data.platforms.map(
      p => ({
        ...p
      })
    );


  coinList =
    data.coins.map(
      c => ({
        ...c
      })
    );


  enemies =
    data.enemies.map(
      e => ({
        ...e
      })
    );


  hazards =
    (data.hazards || []).map(
      h => ({
        ...h
      })
    );


  goal =
    {
      ...data.goal
    };


  player.x = 100;

  player.y = 400;

  player.vx = 0;

  player.vy = 0;

  player.ground = false;

  player.running = false;


  cameraX = 0;

  changingLevel = false;


  levelElement.textContent =
    currentLevel;


  updateHUD();
  smartResetStage();
}


// ============================================================
// HUD
// ============================================================

function updateHUD() {

  if (scoreElement)
    scoreElement.textContent =
      score;

  if (coinsElement)
    coinsElement.textContent =
      coins;

  if (livesElement)
    livesElement.textContent =
      lives;

  if (levelElement)
    levelElement.textContent =
      currentLevel + " / 15";
}


// ============================================================
// COLLISION
// ============================================================

function intersects(a, b) {

  return (

    a.x <
    b.x + b.width &&

    a.x + a.width >
    b.x &&

    a.y <
    b.y + b.height &&

    a.y + a.height >
    b.y
  );
}


// ============================================================
// PLAYER UPDATE
// ============================================================

function updatePlayerCore() {

  const movingRight =
    keys["arrowright"] ||
    keys["d"];


  const movingLeft =
    keys["arrowleft"] ||
    keys["a"];


  const running =
    keys["shift"] &&
    (
      movingRight ||
      movingLeft
    );


  player.running =
    running;


  const targetSpeed =
    running
      ? player.runSpeed
      : player.walkSpeed;


  // ----------------------------------------------------------
  // MOVEMENT
  // ----------------------------------------------------------

  if (movingRight) {

    player.direction = 1;


    const acceleration =
      running
        ? player.runAcceleration
        : player.walkAcceleration;


    player.vx +=
      acceleration;


    if (
      player.vx >
      targetSpeed
    ) {

      player.vx =
        targetSpeed;
    }

  }

  else if (movingLeft) {

    player.direction = -1;


    const acceleration =
      running
        ? player.runAcceleration
        : player.walkAcceleration;


    player.vx -=
      acceleration;


    if (
      player.vx <
      -targetSpeed
    ) {

      player.vx =
        -targetSpeed;
    }

  }

  else {

    player.vx *=
      player.friction;


    if (
      Math.abs(
        player.vx
      ) < 0.05
    ) {

      player.vx = 0;
    }
  }


  // ----------------------------------------------------------
  // RUNNING SOUND
  // ----------------------------------------------------------

  if (
    running &&
    Math.abs(player.vx) > 4
  ) {

    soundRunning();
  }


  // ----------------------------------------------------------
  // JUMP
  // ----------------------------------------------------------

  const jumpPressed =
    keys["arrowup"] ||
    keys["w"] ||
    keys[" "];


  if (
    jumpPressed &&
    player.ground
  ) {

    if (running) {

      player.vy =
        -player.runJump;

      soundJump(true);

    } else {

      player.vy =
        -player.normalJump;

      soundJump(false);
    }


    player.ground =
      false;
  }


  // ----------------------------------------------------------
  // GRAVITY
  // ----------------------------------------------------------

  player.vy +=
    player.gravity;


  // ----------------------------------------------------------
  // POSITION
  // ----------------------------------------------------------

  player.x +=
    player.vx;

  player.y +=
    player.vy;


  if (
    player.x < 0
  ) {

    player.x = 0;

    player.vx = 0;
  }


  player.ground =
    false;


  // ----------------------------------------------------------
  // PLATFORM COLLISION
  // ----------------------------------------------------------

  for (
    const p of platforms
  ) {

    if (
      !intersects(
        player,
        p
      )
    ) {

      continue;
    }


    const previousBottom =
      player.y +
      player.height -
      player.vy;


    if (
      player.vy >= 0 &&
      previousBottom <=
      p.y + 10
    ) {

      player.y =
        p.y -
        player.height;

      player.vy = 0;

      player.ground =
        true;

    }

    else if (
      player.vy < 0
    ) {

      player.y =
        p.y +
        p.height;

      player.vy = 0;
    }
  }


  return (
    player.y <
    canvas.height +
    180
  );
}


// ============================================================
// WATER / RIVER HAZARDS
// ============================================================

function checkLevelHazards() {

  for (const h of hazards) {
    if (!h.active) continue;

    const danger = {
      x: h.x,
      y: h.y + 12,
      width: h.width,
      height: h.height - 12
    };

    if (intersects(player, danger)) {
      return true;
    }
  }

  return false;
}

function updatePlayer() {
  const ok = updatePlayerCore();
  if (!ok) return false;
  if (checkLevelHazards()) return false;
  return true;
}


// ============================================================
// ENEMY UPDATE
// ============================================================

function updateEnemies() {

  for (
    const e of enemies
  ) {

    if (
      !e.alive
    ) {
      continue;
    }


    // --------------------------------------------------------
    // TYPES 1 / 2 / 5 / 7
    // --------------------------------------------------------

    if (
      e.type === 1 ||
      e.type === 2 ||
      e.type === 5 ||
      e.type === 7
    ) {

      e.x +=
        e.speed *
        e.direction;


      if (
        e.x <=
        e.minX
      ) {

        e.x =
          e.minX;

        e.direction =
          1;
      }


      if (
        e.x >=
        e.maxX
      ) {

        e.x =
          e.maxX;

        e.direction =
          -1;
      }
    }


    // --------------------------------------------------------
    // GREEN JUMPER
    // --------------------------------------------------------

    if (
      e.type === 3
    ) {

      e.x +=
        e.speed *
        e.direction;


      if (
        e.x <=
        e.minX
      ) {

        e.x =
          e.minX;

        e.direction =
          1;
      }


      if (
        e.x >=
        e.maxX
      ) {

        e.x =
          e.maxX;

        e.direction =
          -1;
      }


      e.vy +=
        e.gravity;


      e.y +=
        e.vy;


      if (
        e.y >=
        e.baseY
      ) {

        e.y =
          e.baseY;

        e.vy =
          -e.jumpPower;
      }
    }


    // --------------------------------------------------------
    // FLYING ENEMY
    // --------------------------------------------------------

    if (
      e.type === 4
    ) {

      e.time +=
        0.05;


      e.y =
        e.baseY +
        Math.sin(
          e.time
        ) * 38;


      e.x +=
        e.speed *
        e.direction;


      if (
        e.x <=
        e.minX
      ) {

        e.direction =
          1;
      }


      if (
        e.x >=
        e.maxX
      ) {

        e.direction =
          -1;
      }
    }


    // --------------------------------------------------------
    // PINK ENEMY
    // --------------------------------------------------------

    if (
      e.type === 6
    ) {

      e.time +=
        0.08;


      e.x +=
        e.speed *
        e.direction;


      e.y =
        e.baseY +
        Math.sin(
          e.time
        ) * 20;


      if (
        e.x <=
        e.minX
      ) {

        e.direction =
          1;
      }


      if (
        e.x >=
        e.maxX
      ) {

        e.direction =
          -1;
      }
    }


    // --------------------------------------------------------
    // COLLISION
    // --------------------------------------------------------

    if (
      intersects(
        player,
        e
      )
    ) {

      const previousBottom =
        player.y +
        player.height -
        player.vy;


      const stomp =
        player.vy > 0 &&
        previousBottom <=
        e.y + 12;


      if (stomp) {

        player.vy =
          -10;


        soundEnemyStomp();


        if (
          e.type === 7
        ) {

          e.hits--;

          score += 100;


          if (
            e.hits <= 0
          ) {

            e.alive =
              false;

            score += 300;
          }

        } else {

          e.alive =
            false;

          score +=
            50 * e.type;
        }


        updateHUD();

      }

      else {

        return false;
      }
    }
  }


  return true;
}


// ============================================================
// COINS
// ============================================================

function updateCoins() {

  for (
    const c of coinList
  ) {

    if (
      c.collected
    ) {
      continue;
    }


    const box = {

      x:
        c.x - 12,

      y:
        c.y - 12,

      width: 24,

      height: 24
    };


    if (
      intersects(
        player,
        box
      )
    ) {

      c.collected =
        true;


      coins++;

      score += 50;


      soundCoin();


      // كل 100 عملة = محاولة إضافية

      if (
        coins % 100 === 0
      ) {

        lives++;

        soundExtraLife();
      }


      updateHUD();
    }
  }
}


// ============================================================
// CAMERA
// ============================================================

function updateCamera() {

  cameraX =
    player.x -
    canvas.width *
    0.35;


  if (
    cameraX < 0
  ) {

    cameraX = 0;
  }


  const levelWidth = currentLevelWidth || createLevel(currentLevel).width;


  const max =
    Math.max(
      0,
      levelWidth -
      canvas.width
    );


  if (
    cameraX > max
  ) {

    cameraX = max;
  }
}


// ============================================================
// GOAL
// ============================================================

function checkGoal() {

  if (
    !goal ||
    changingLevel
  ) {

    return;
  }


  const box = {

    x: goal.x,

    y: goal.y,

    width: 70,

    height:
      goal.height
  };


  if (
    intersects(
      player,
      box
    )
  ) {

    nextLevel();
  }
}


// ============================================================
// NEXT LEVEL
// ============================================================

function nextLevel() {

  if (
    changingLevel
  ) {

    return;
  }


  changingLevel =
    true;


  stopGame();


  soundLevelComplete();

  // Save only after the player reaches the goal.
  try {
    localStorage.setItem("naughtyBoyFinishSaveV1", JSON.stringify({
      nextLevel: currentLevel < TOTAL_LEVELS ? currentLevel + 1 : TOTAL_LEVELS,
      completedLevel: currentLevel,
      score,
      coins,
      timestamp: Date.now()
    }));
  } catch (e) {}


  if (
    currentLevel >=
    TOTAL_LEVELS
  ) {

    gameWon = true;


    soundVictory();


    messageIcon.textContent =
      "🏆";


    messageTitle.textContent =
      menuText[selectedLanguage].victory;


    messageText.textContent =
      "لقد أنهيت جميع المراحل الـ30!";


    restartButton.textContent =
      menuText[selectedLanguage].newGame;


    message.classList.remove(
      "hidden"
    );


    return;
  }


  score += 500;

  currentLevel++;


  loadLevel(
    currentLevel
  );


  messageIcon.textContent =
    getWorldIcon(
      currentLevel
    );


  messageTitle.textContent =
    menuText[selectedLanguage].levelStart +
    currentLevel;


  messageText.textContent =
    worlds[
      currentLevel - 1
    ].name +
    " — " + menuText[selectedLanguage].nextInfo + "!";


  restartButton.textContent =
    "▶ ابدأ المرحلة";


  message.classList.remove(
    "hidden"
  );


  setTimeout(() => {

    if (
      gameWon
    ) {

      return;
    }


    message.classList.add(
      "hidden"
    );


    changingLevel =
      false;


    startGame();

  }, 1500);
}


// ============================================================
// PLAYER DEATH
// ============================================================

function playerDied() {

  if (
    gameOver ||
    gameWon ||
    changingLevel
  ) {

    return;
  }


  stopGame();


  soundDamage();


  lives--;


  updateHUD();


  if (
    lives > 0
  ) {

    setTimeout(() => {

      resetCurrentLevel();

      startGame();

    }, 350);


    return;
  }


  // ----------------------------------------------------------
  // GAME OVER
  // ----------------------------------------------------------

  gameOver = true;


  soundGameOver();


  messageIcon.textContent =
    "💀";


  messageTitle.textContent =
    menuText[selectedLanguage].gameOver;


  messageText.textContent =
    "خسرت الأرواح الثلاثة في المرحلة " +
    currentLevel +
    ". اضغط الزر للبدء من جديد بثلاث أرواح.";


  restartButton.textContent =
    menuText[selectedLanguage].restart;


  message.classList.remove(
    "hidden"
  );
}


// ============================================================
// RESET CURRENT LEVEL
// ============================================================

function resetCurrentLevel() {

  const savedLives = lives;

  score = levelStartScore;
  coins = levelStartCoins;

  loadLevel(currentLevel, false);

  lives = savedLives;

  updateHUD();
}


// ============================================================
// RESTART
// ============================================================

function restartGame() {

  initAudio();

  soundButton();


  stopGame();


  // ----------------------------------------------------------
  // GAME OVER
  // ----------------------------------------------------------

  if (
    gameOver
  ) {

    lives = 3;

    gameOver = false;

    resetCurrentLevel();
  }


  // ----------------------------------------------------------
  // GAME WON
  // ----------------------------------------------------------

  else if (
    gameWon
  ) {

    currentLevel = 1;

    score = 0;

    coins = 0;

    lives = 3;

    gameWon = false;

    gameOver = false;

    resetCurrentLevel();
  }


  // ----------------------------------------------------------
  // NORMAL RESTART
  // ----------------------------------------------------------

  else {

    gameOver = false;

    resetCurrentLevel();
  }


  message.classList.add(
    "hidden"
  );


  startGame();
}


// ============================================================
// RESTART BUTTON
// ============================================================

restartButton.addEventListener(
  "click",
  restartGame
);


// ============================================================
// WORLD ICON
// ============================================================

function getWorldIcon(level) {

  const icons = [

    "🌿",
    "🌊",
    "🌲",
    "🏜️",
    "❄️",
    "🌋",
    "🏰",
    "🐊",
    "🦇",
    "⛈️",
    "🏴‍☠️",
    "🦂",
    "🌿",
    "🐋",
    "🔥"

  ];


  return icons[
    level - 1
  ];
}


// ============================================================
// BACKGROUND
// ============================================================

function drawBackgroundCore() {

  const world =
    currentWorld;


  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );


  gradient.addColorStop(
    0,
    world.sky1
  );


  gradient.addColorStop(
    1,
    world.sky2
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (
    world.theme ===
    "grass"
  ) {

    drawSun();

    drawClouds();

    drawMountains();

    drawGrassWorld();

  }

  else if (
    world.theme ===
    "ocean"
  ) {

    drawSun();

    drawClouds();

    drawOceanWorld();

  }

  else if (
    world.theme ===
    "forest"
  ) {

    drawForestWorld();

  }

  else if (
    world.theme ===
    "desert"
  ) {

    drawDesertWorld();

  }

  else if (
    world.theme ===
    "ice"
  ) {

    drawIceWorld();

  }

  else if (
    world.theme ===
    "volcano"
  ) {

    drawVolcanoWorld();

  }

  else if (
    world.theme ===
    "castle"
  ) {

    drawCastleWorld();
  }
  else if (world.theme === "swamp") {
    drawSwampWorld();
  }
  else if (world.theme === "cave") {
    drawCaveWorld();
  }
  else if (world.theme === "storm") {
    drawStormWorld();
  }
  else if (world.theme === "pirate") {
    drawPirateWorld();
  }
  else if (world.theme === "desertNight") {
    drawDesertNightWorld();
  }
  else if (world.theme === "thorn") {
    drawThornWorld();
  }
  else if (world.theme === "monsterLake") {
    drawMonsterLakeWorld();
  }
  else if (world.theme === "final") {
    drawFinalWorld();
  }
}


function drawBackground() {
  drawBackgroundCore();
  drawLevelHazards();
}


function drawSwampWorld() {
  ctx.fillStyle='rgba(15,60,45,.22)';
  for(let i=0;i<12;i++){ const x=i*150-(cameraX*.2%150); ctx.fillRect(x,canvas.height*.35,28,canvas.height*.45); }
  ctx.fillStyle='rgba(80,130,65,.35)';
  for(let i=0;i<10;i++){ const x=i*190-(cameraX*.15%190); ctx.beginPath(); ctx.ellipse(x,canvas.height*.72,75,25,0,0,Math.PI*2); ctx.fill(); }
}

function drawCaveWorld() {
  ctx.fillStyle='rgba(5,7,14,.55)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<14;i++){ const x=i*120-(cameraX*.35%120); ctx.fillStyle='rgba(30,35,55,.9)'; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+55,75+(i%4)*25); ctx.lineTo(x+105,0); ctx.closePath(); ctx.fill(); }
}

function drawStormWorld() {
  ctx.fillStyle='rgba(90,105,130,.28)';
  for(let i=0;i<7;i++){ const x=i*190-(cameraX*.18%190); ctx.beginPath(); ctx.ellipse(x,150+(i%2)*80,100,35,0,0,Math.PI*2); ctx.fill(); }
  if(Math.sin(performance.now()*.0015)>0.85){ ctx.fillStyle='rgba(255,255,220,.35)'; ctx.fillRect(0,0,canvas.width,canvas.height); }
}

function drawPirateWorld() {
  drawSun(); drawClouds();
  ctx.fillStyle='rgba(120,80,40,.35)';
  for(let i=0;i<6;i++){ const x=i*230-(cameraX*.22%230); ctx.fillRect(x,canvas.height*.52,20,120); ctx.beginPath(); ctx.moveTo(x+10,canvas.height*.52); ctx.lineTo(x+70,canvas.height*.62); ctx.lineTo(x+10,canvas.height*.72); ctx.fill(); }
}

function drawDesertNightWorld() {
  ctx.fillStyle='rgba(255,245,190,.65)'; ctx.beginPath(); ctx.arc(820-cameraX*.08,90,45,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.7)'; for(let i=0;i<35;i++){ const x=(i*97-cameraX*.12)%canvas.width; const y=30+(i*53)%180; ctx.fillRect(x,y,2,2); }
}

function drawThornWorld() {
  ctx.fillStyle='rgba(25,80,40,.4)';
  for(let i=0;i<18;i++){ const x=i*90-(cameraX*.25%90); ctx.beginPath(); ctx.moveTo(x,canvas.height*.72); ctx.lineTo(x+28,canvas.height*.25); ctx.lineTo(x+50,canvas.height*.72); ctx.fill(); }
}

function drawMonsterLakeWorld() {
  ctx.fillStyle='rgba(20,90,115,.45)';
  ctx.fillRect(0,canvas.height*.55,canvas.width,canvas.height*.45);
  for(let i=0;i<9;i++){ const x=i*170-(cameraX*.18%170); ctx.fillStyle='rgba(20,70,80,.7)'; ctx.beginPath(); ctx.arc(x,canvas.height*.52,42,Math.PI,Math.PI*2); ctx.fill(); }
}

function drawFinalWorld() {
  ctx.fillStyle='rgba(150,30,45,.25)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='rgba(255,100,60,.18)';
  for(let i=0;i<8;i++){ const x=i*180-(cameraX*.12%180); ctx.beginPath(); ctx.moveTo(x,canvas.height); ctx.lineTo(x+55,canvas.height*.35); ctx.lineTo(x+110,canvas.height); ctx.fill(); }
}


// ============================================================
// SUN
// ============================================================

function drawSun() {

  const x =
    800 -
    cameraX *
    0.08;


  const y = 90;


  ctx.fillStyle =
    "rgba(255,240,130,.22)";


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    100,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "#ffe36e";


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    40,
    0,
    Math.PI * 2
  );

  ctx.fill();
}


// ============================================================
// CLOUDS
// ============================================================

function drawClouds() {

  const offset =
    -(cameraX * 0.12) %
    500;


  for (
    let i = -2;
    i < 8;
    i++
  ) {

    const x =
      i * 500 +
      offset;


    const y =
      90 +
      Math.sin(
        i * 4
      ) * 20;


    ctx.fillStyle =
      "rgba(255,255,255,.82)";


    ctx.beginPath();

    ctx.arc(
      x,
      y,
      25,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x + 30,
      y - 12,
      34,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x + 65,
      y,
      27,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}


// ============================================================
// MOUNTAINS
// ============================================================

function drawMountains() {

  drawMountainLayer(
    0.1,
    430,
    170,
    "#b5d7ca",
    420
  );


  drawMountainLayer(
    0.2,
    500,
    210,
    "#579878",
    500
  );
}


function drawMountainLayer(
  parallax,
  base,
  height,
  color,
  spacing
) {

  const offset =
    -(cameraX * parallax) %
    spacing;


  ctx.fillStyle =
    color;


  ctx.beginPath();


  ctx.moveTo(
    -spacing,
    canvas.height
  );


  for (
    let i = -2;
    i < 10;
    i++
  ) {

    const x =
      i * spacing +
      offset;


    const peak =
      x +
      spacing / 2;


    ctx.lineTo(
      x,
      base
    );


    ctx.lineTo(
      peak,
      base - height
    );


    ctx.lineTo(
      x + spacing,
      base
    );
  }


  ctx.lineTo(
    canvas.width,
    canvas.height
  );


  ctx.closePath();

  ctx.fill();
}


// ============================================================
// GRASS
// ============================================================

function drawGrassWorld() {

  drawTrees(
    0.28,
    "#2e7d32",
    "#17652b"
  );


  drawFlowers();
}


function drawTrees(
  parallax,
  leafColor,
  darkColor
) {

  const spacing = 180;


  const offset =
    -(cameraX * parallax) %
    spacing;


  for (
    let i = -3;
    i < 12;
    i++
  ) {

    const x =
      i * spacing +
      offset;


    const y = 520;


    ctx.fillStyle =
      "#654321";


    ctx.fillRect(
      x - 8,
      y - 70,
      16,
      70
    );


    ctx.fillStyle =
      leafColor;


    ctx.beginPath();


    ctx.arc(
      x,
      y - 90,
      42,
      0,
      Math.PI * 2
    );


    ctx.arc(
      x - 30,
      y - 65,
      30,
      0,
      Math.PI * 2
    );


    ctx.arc(
      x + 30,
      y - 65,
      30,
      0,
      Math.PI * 2
    );


    ctx.fill();


    ctx.fillStyle =
      darkColor;


    ctx.beginPath();


    ctx.arc(
      x + 10,
      y - 80,
      15,
      0,
      Math.PI * 2
    );


    ctx.fill();
  }
}


function drawFlowers() {

  const offset =
    -(cameraX * 0.4) %
    90;


  for (
    let i = -5;
    i < 20;
    i++
  ) {

    const x =
      i * 90 +
      offset;


    const y = 525;


    ctx.strokeStyle =
      "#31853b";


    ctx.lineWidth = 2;


    ctx.beginPath();


    ctx.moveTo(
      x,
      y
    );


    ctx.lineTo(
      x,
      y - 16
    );


    ctx.stroke();


    ctx.fillStyle =
      i % 2 === 0
        ? "#ff5c8a"
        : "#ffd740";


    ctx.beginPath();


    ctx.arc(
      x,
      y - 18,
      5,
      0,
      Math.PI * 2
    );


    ctx.fill();
  }
}


// ============================================================
// OCEAN
// ============================================================

function drawOceanWorld() {

  const waterY = 470;


  ctx.fillStyle =
    "#128ec4";


  ctx.fillRect(
    0,
    waterY,
    canvas.width,
    canvas.height -
    waterY
  );


  const t =
    performance.now() *
    0.002;


  for (
    let row = 0;
    row < 7;
    row++
  ) {

    const y =
      waterY +
      15 +
      row * 24;


    ctx.strokeStyle =
      "rgba(180,245,255,.6)";


    ctx.lineWidth = 3;


    ctx.beginPath();


    for (
      let x = -50;
      x <
      canvas.width + 50;
      x += 45
    ) {

      const yy =
        y +
        Math.sin(
          x * 0.04 +
          t +
          row
        ) * 5;


      if (
        x === -50
      ) {

        ctx.moveTo(
          x,
          yy
        );

      } else {

        ctx.lineTo(
          x,
          yy
        );
      }
    }


    ctx.stroke();
  }


  for (
    let i = -2;
    i < 12;
    i++
  ) {

    const x =
      i * 420 -
      cameraX *
      0.25;


    ctx.fillStyle =
      "#8bc34a";


    ctx.beginPath();


    ctx.ellipse(
      x,
      510,
      110,
      35,
      0,
      0,
      Math.PI * 2
    );


    ctx.fill();


    ctx.fillStyle =
      "#f3d28b";


    ctx.beginPath();


    ctx.ellipse(
      x,
      525,
      85,
      22,
      0,
      0,
      Math.PI * 2
    );


    ctx.fill();
  }
}


// ============================================================
// FOREST
// ============================================================

function drawForestWorld() {

  for (
    let i = -3;
    i < 15;
    i++
  ) {

    const x =
      i * 150 -
      cameraX *
      0.15;


    ctx.fillStyle =
      "#174f36";


    ctx.fillRect(
      x - 12,
      330,
      24,
      220
    );


    ctx.beginPath();


    ctx.moveTo(
      x,
      180
    );


    ctx.lineTo(
      x - 80,
      390
    );


    ctx.lineTo(
      x + 80,
      390
    );


    ctx.closePath();

    ctx.fill();


    ctx.beginPath();


    ctx.moveTo(
      x,
      240
    );


    ctx.lineTo(
      x - 100,
      450
    );


    ctx.lineTo(
      x + 100,
      450
    );


    ctx.closePath();

    ctx.fill();
  }


  drawMushrooms();
}


function drawMushrooms() {

  for (
    let i = -3;
    i < 20;
    i++
  ) {

    const x =
      i * 110 -
      cameraX *
      0.45;


    const y = 530;


    ctx.fillStyle =
      "#eee";


    ctx.fillRect(
      x - 4,
      y - 15,
      8,
      15
    );


    ctx.fillStyle =
      i % 2
        ? "#e53935"
        : "#9c27b0";


    ctx.beginPath();


    ctx.arc(
      x,
      y - 17,
      11,
      Math.PI,
      Math.PI * 2
    );


    ctx.fill();
  }
}


// ============================================================
// DESERT
// ============================================================

function drawDesertWorld() {

  ctx.fillStyle =
    "rgba(255,220,100,.25)";


  ctx.beginPath();


  ctx.arc(
    850 -
    cameraX * 0.1,
    100,
    90,
    0,
    Math.PI * 2
  );


  ctx.fill();


  ctx.fillStyle =
    "#ffe082";


  ctx.beginPath();


  ctx.arc(
    850 -
    cameraX * 0.1,
    100,
    40,
    0,
    Math.PI * 2
  );


  ctx.fill();


  for (
    let i = -2;
    i < 10;
    i++
  ) {

    const x =
      i * 500 -
      cameraX *
      0.18;


    ctx.fillStyle =
      i % 2
        ? "#e4a84f"
        : "#d99238";


    ctx.beginPath();


    ctx.moveTo(
      x,
      550
    );


    ctx.quadraticCurveTo(
      x + 220,
      390,
      x + 500,
      550
    );


    ctx.closePath();

    ctx.fill();
  }


  drawCacti();

  drawDesertRocks();
}


function drawCacti() {

  for (
    let i = -3;
    i < 15;
    i++
  ) {

    const x =
      i * 260 -
      cameraX *
      0.35;


    ctx.fillStyle =
      "#388e3c";


    ctx.fillRect(
      x - 8,
      450,
      16,
      80
    );


    ctx.fillRect(
      x - 28,
      470,
      20,
      12
    );


    ctx.fillRect(
      x + 8,
      435,
      20,
      12
    );
  }
}


function drawDesertRocks() {

  for (
    let i = -2;
    i < 15;
    i++
  ) {

    const x =
      i * 230 -
      cameraX *
      0.45;


    ctx.fillStyle =
      "#8d5a2b";


    ctx.beginPath();


    ctx.moveTo(
      x,
      530
    );


    ctx.lineTo(
      x + 35,
      500
    );


    ctx.lineTo(
      x + 65,
      530
    );


    ctx.closePath();

    ctx.fill();
  }
}


// ============================================================
// ICE
// ============================================================

function drawIceWorld() {

  for (
    let i = -3;
    i < 10;
    i++
  ) {

    const x =
      i * 500 -
      cameraX *
      0.18;


    ctx.fillStyle =
      "#b5d8e8";


    ctx.beginPath();


    ctx.moveTo(
      x,
      520
    );


    ctx.lineTo(
      x + 250,
      170
    );


    ctx.lineTo(
      x + 500,
      520
    );


    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
      "#ffffff";


    ctx.beginPath();


    ctx.moveTo(
      x + 250,
      170
    );


    ctx.lineTo(
      x + 170,
      285
    );


    ctx.lineTo(
      x + 250,
      260
    );


    ctx.lineTo(
      x + 325,
      285
    );


    ctx.closePath();

    ctx.fill();
  }


  drawSnow();

  drawIceCrystals();
}


function drawSnow() {

  const t =
    performance.now() *
    0.0005;


  ctx.fillStyle =
    "rgba(255,255,255,.8)";


  for (
    let i = 0;
    i < 100;
    i++
  ) {

    const x =
      (
        i * 83 +
        Math.sin(
          t * 2 + i
        ) * 30
      ) %
      canvas.width;


    const y =
      (
        i * 47 +
        t * 100
      ) %
      500;


    ctx.beginPath();


    ctx.arc(
      x,
      y,
      2 + i % 3,
      0,
      Math.PI * 2
    );


    ctx.fill();
  }
}


function drawIceCrystals() {

  for (
    let i = -2;
    i < 18;
    i++
  ) {

    const x =
      i * 150 -
      cameraX *
      0.4;


    ctx.fillStyle =
      "rgba(220,250,255,.8)";


    ctx.beginPath();


    ctx.moveTo(
      x,
      530
    );


    ctx.lineTo(
      x + 20,
      460
    );


    ctx.lineTo(
      x + 35,
      530
    );


    ctx.closePath();

    ctx.fill();
  }
}


// ============================================================
// VOLCANO
// ============================================================

function drawVolcanoWorld() {

  const gradient =
    ctx.createRadialGradient(
      canvas.width / 2,
      500,
      50,
      canvas.width / 2,
      500,
      500
    );


  gradient.addColorStop(
    0,
    "rgba(255,90,30,.35)"
  );


  gradient.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  for (
    let i = -2;
    i < 10;
    i++
  ) {

    const x =
      i * 550 -
      cameraX *
      0.18;


    ctx.fillStyle =
      "#34272a";


    ctx.beginPath();


    ctx.moveTo(
      x,
      550
    );


    ctx.lineTo(
      x + 275,
      180
    );


    ctx.lineTo(
      x + 550,
      550
    );


    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
      "#ff5722";


    ctx.beginPath();


    ctx.moveTo(
      x + 235,
      230
    );


    ctx.lineTo(
      x + 275,
      210
    );


    ctx.lineTo(
      x + 315,
      230
    );


    ctx.lineTo(
      x + 295,
      390
    );


    ctx.lineTo(
      x + 255,
      390
    );


    ctx.closePath();

    ctx.fill();
  }


  drawLava();

  drawAsh();
}


function drawLava() {

  ctx.fillStyle =
    "#d32f2f";


  ctx.fillRect(
    0,
    520,
    canvas.width,
    130
  );


  const t =
    performance.now() *
    0.002;


  ctx.strokeStyle =
    "#ffb300";


  ctx.lineWidth = 5;


  for (
    let y = 540;
    y < 650;
    y += 30
  ) {

    ctx.beginPath();


    for (
      let x = -50;
      x <
      canvas.width + 50;
      x += 40
    ) {

      const yy =
        y +
        Math.sin(
          x * 0.03 + t
        ) * 7;


      if (
        x === -50
      ) {

        ctx.moveTo(
          x,
          yy
        );

      } else {

        ctx.lineTo(
          x,
          yy
        );
      }
    }


    ctx.stroke();
  }
}


function drawAsh() {

  ctx.fillStyle =
    "rgba(30,30,30,.7)";


  for (
    let i = 0;
    i < 80;
    i++
  ) {

    const x =
      (
        i * 93 +
        performance.now() *
        0.01
      ) %
      canvas.width;


    const y =
      (
        i * 37 +
        performance.now() *
        0.03
      ) %
      450;


    ctx.beginPath();


    ctx.arc(
      x,
      y,
      2 + i % 3,
      0,
      Math.PI * 2
    );


    ctx.fill();
  }
}


// ============================================================
// CASTLE
// ============================================================

function drawCastleWorld() {

  ctx.fillStyle =
    "#f4f1c9";


  ctx.beginPath();


  ctx.arc(
    820 -
    cameraX * 0.08,
    90,
    45,
    0,
    Math.PI * 2
  );


  ctx.fill();


  ctx.fillStyle =
    "rgba(255,255,255,.9)";


  for (
    let i = 0;
    i < 70;
    i++
  ) {

    const x =
      (
        i * 127 -
        cameraX *
        0.04
      ) %
      canvas.width;


    const y =
      i * 59 % 300;


    ctx.fillRect(
      x,
      y,
      2,
      2
    );
  }


  const castleX =
    750 -
    cameraX *
    0.16;


  ctx.fillStyle =
    "#202238";


  ctx.fillRect(
    castleX,
    270,
    430,
    280
  );


  ctx.fillRect(
    castleX - 55,
    220,
    100,
    330
  );


  ctx.fillRect(
    castleX + 385,
    220,
    100,
    330
  );


  ctx.fillStyle =
    "#111321";


  ctx.beginPath();


  ctx.moveTo(
    castleX - 65,
    220
  );


  ctx.lineTo(
    castleX - 5,
    145
  );


  ctx.lineTo(
    castleX + 55,
    220
  );


  ctx.closePath();

  ctx.fill();


  ctx.beginPath();


  ctx.moveTo(
    castleX + 375,
    220
  );


  ctx.lineTo(
    castleX + 435,
    145
  );


  ctx.lineTo(
    castleX + 495,
    220
  );


  ctx.closePath();

  ctx.fill();


  ctx.fillStyle =
    "#ffcc66";


  for (
    let i = 0;
    i < 5;
    i++
  ) {

    ctx.fillRect(
      castleX +
      60 +
      i * 75,
      320,
      20,
      35
    );
  }


  ctx.fillStyle =
    "#080910";


  ctx.beginPath();


  ctx.arc(
    castleX + 215,
    500,
    55,
    Math.PI,
    Math.PI * 2
  );


  ctx.fill();


  ctx.fillRect(
    castleX + 160,
    500,
    110,
    50
  );


  drawTorch(
    castleX + 100,
    400
  );


  drawTorch(
    castleX + 330,
    400
  );
}


function drawTorch(x, y) {

  const t =
    performance.now() *
    0.01;


  ctx.fillStyle =
    "#754c24";


  ctx.fillRect(
    x,
    y,
    7,
    35
  );


  ctx.fillStyle =
    "#ff9800";


  ctx.beginPath();


  ctx.arc(
    x + 3,
    y - 5,
    13 +
    Math.sin(t) * 3,
    0,
    Math.PI * 2
  );


  ctx.fill();


  ctx.fillStyle =
    "#ffe082";


  ctx.beginPath();


  ctx.arc(
    x + 3,
    y - 6,
    6,
    0,
    Math.PI * 2
  );


  ctx.fill();
}


// ============================================================
// PLATFORMS
// ============================================================

function drawPlatforms() {

  for (
    const p of platforms
  ) {

    const x =
      p.x -
      cameraX;


    if (
      x + p.width < 0 ||
      x > canvas.width
    ) {

      continue;
    }


    let topColor =
      "#35a853";

    let soilColor =
      "#8b572a";

    let bottomColor =
      "#6d421f";


    if (
      currentWorld.theme ===
      "desert"
    ) {

      topColor =
        "#d8a24a";

      soilColor =
        "#b97935";

      bottomColor =
        "#925c2a";

    }

    else if (
      currentWorld.theme ===
      "ice"
    ) {

      topColor =
        "#e8fbff";

      soilColor =
        "#8fc9df";

      bottomColor =
        "#5799b5";

    }

    else if (
      currentWorld.theme ===
      "volcano"
    ) {

      topColor =
        "#3f4b42";

      soilColor =
        "#29252a";

      bottomColor =
        "#18161a";

    }

    else if (
      currentWorld.theme ===
      "castle"
    ) {

      topColor =
        "#555b70";

      soilColor =
        "#343746";

      bottomColor =
        "#222430";
    }


    ctx.fillStyle =
      topColor;


    ctx.fillRect(
      x,
      p.y,
      p.width,
      12
    );


    ctx.fillStyle =
      soilColor;


    ctx.fillRect(
      x,
      p.y + 12,
      p.width,
      p.height - 12
    );


    ctx.fillStyle =
      bottomColor;


    ctx.fillRect(
      x,
      p.y +
      p.height -
      10,
      p.width,
      10
    );


    ctx.fillStyle =
      "rgba(0,0,0,.15)";


    for (
      let i = 15;
      i < p.width;
      i += 45
    ) {

      ctx.fillRect(
        x + i,
        p.y + 28,
        5,
        5
      );
    }


    if (
      currentWorld.theme ===
      "grass" ||
      currentWorld.theme ===
      "forest"
    ) {

      ctx.strokeStyle =
        "#55c65d";


      ctx.lineWidth = 2;


      for (
        let i = 8;
        i < p.width;
        i += 25
      ) {

        ctx.beginPath();


        ctx.moveTo(
          x + i,
          p.y + 11
        );


        ctx.lineTo(
          x + i - 3,
          p.y + 3
        );


        ctx.moveTo(
          x + i,
          p.y + 11
        );


        ctx.lineTo(
          x + i + 4,
          p.y + 4
        );


        ctx.stroke();
      }
    }
  }
}


// ============================================================
// COINS DRAW
// ============================================================

function drawCoins() {

  for (
    const c of coinList
  ) {

    if (
      c.collected
    ) {

      continue;
    }


    const x =
      c.x -
      cameraX;


    const scale =
      0.85 +
      Math.sin(
        performance.now() *
        0.006 +
        c.x
      ) *
      0.12;


    ctx.fillStyle =
      "rgba(255,215,0,.2)";


    ctx.beginPath();


    ctx.arc(
      x,
      c.y,
      20,
      0,
      Math.PI * 2
    );


    ctx.fill();


    ctx.save();


    ctx.translate(
      x,
      c.y
    );


    ctx.scale(
      scale,
      1
    );


    ctx.fillStyle =
      "#ffd700";


    ctx.beginPath();


    ctx.ellipse(
      0,
      0,
      11,
      15,
      0,
      0,
      Math.PI * 2
    );


    ctx.fill();


    ctx.strokeStyle =
      "#b8860b";


    ctx.lineWidth = 2;

    ctx.stroke();


    ctx.fillStyle =
      "#fff4a3";


    ctx.fillRect(
      -2,
      -9,
      3,
      18
    );


    ctx.restore();
  }
}


// ============================================================
// ENEMIES DRAW
// ============================================================

function drawEnemies() {

  for (const e of enemies) {
    if (!e.alive) continue;

    const x = e.x - cameraX;
    const y = e.y;
    const w = e.width;
    const h = e.height;

    ctx.save();

    // Type 1: Wild boar - red/brown
    if (e.type === 1) {
      ctx.fillStyle = '#8d3f2f';
      ctx.beginPath();
      ctx.ellipse(x + w/2, y + h*0.58, w*0.47, h*0.34, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#c46a4a';
      ctx.beginPath();
      ctx.ellipse(x + w*0.78, y + h*0.57, w*0.20, h*0.18, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#5a261d';
      ctx.beginPath();
      ctx.moveTo(x+w*0.15,y+h*0.35); ctx.lineTo(x+w*0.28,y+h*0.05); ctx.lineTo(x+w*0.40,y+h*0.35);
      ctx.moveTo(x+w*0.60,y+h*0.35); ctx.lineTo(x+w*0.74,y+h*0.05); ctx.lineTo(x+w*0.86,y+h*0.35);
      ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+w*.68,y+h*.51,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+w*.69,y+h*.51,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f4d3c3'; ctx.beginPath(); ctx.ellipse(x+w*.87,y+h*.61,6,4,0,0,Math.PI*2); ctx.fill();
    }

    // Type 2: Snake - blue
    else if (e.type === 2) {
      ctx.strokeStyle = '#1769aa';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x+w*.08,y+h*.78);
      ctx.quadraticCurveTo(x+w*.35,y+h*.25,x+w*.58,y+h*.70);
      ctx.quadraticCurveTo(x+w*.72,y+h*.95,x+w*.90,y+h*.38);
      ctx.stroke();
      ctx.fillStyle='#2587d1';
      ctx.beginPath(); ctx.ellipse(x+w*.88,y+h*.34,12,10,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+w*.92,y+h*.30,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+w*.93,y+h*.30,1.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#e53935'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+w*.99,y+h*.38); ctx.lineTo(x+w*1.07,y+h*.34); ctx.stroke();
    }

    // Type 3: Poison frog - green jumper
    else if (e.type === 3) {
      ctx.fillStyle = '#39a852';
      ctx.beginPath(); ctx.ellipse(x+w/2,y+h*.62,w*.45,h*.34,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#8bc34a';
      ctx.beginPath(); ctx.arc(x+w*.32,y+h*.28,10,0,Math.PI*2); ctx.arc(x+w*.68,y+h*.28,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+w*.32,y+h*.28,5,0,Math.PI*2); ctx.arc(x+w*.68,y+h*.28,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+w*.32,y+h*.28,2.5,0,Math.PI*2); ctx.arc(x+w*.68,y+h*.28,2.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#d32f2f'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+w*.38,y+h*.70); ctx.quadraticCurveTo(x+w*.5,y+h*.80,x+w*.62,y+h*.70); ctx.stroke();
    }

    // Type 4: Bat - purple flying animal
    else if (e.type === 4) {
      ctx.fillStyle='#6a1b9a';
      ctx.beginPath();
      ctx.moveTo(x+w*.5,y+h*.48);
      ctx.quadraticCurveTo(x+w*.15,y+h*.05,x,y+h*.22);
      ctx.quadraticCurveTo(x+w*.12,y+h*.48,x+w*.28,y+h*.60);
      ctx.quadraticCurveTo(x+w*.5,y+h*.75,x+w*.72,y+h*.60);
      ctx.quadraticCurveTo(x+w*.88,y+h*.48,x+w,y+h*.22);
      ctx.quadraticCurveTo(x+w*.85,y+h*.05,x+w*.5,y+h*.48);
      ctx.fill();
      ctx.fillStyle='#ab47bc'; ctx.beginPath(); ctx.arc(x+w*.5,y+h*.42,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffeb3b'; ctx.beginPath(); ctx.arc(x+w*.43,y+h*.40,3,0,Math.PI*2); ctx.arc(x+w*.57,y+h*.40,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+w*.43,y+h*.40,1.5,0,Math.PI*2); ctx.arc(x+w*.57,y+h*.40,1.5,0,Math.PI*2); ctx.fill();
    }

    // Type 5: Scorpion - orange
    else if (e.type === 5) {
      ctx.fillStyle='#e65100';
      ctx.beginPath(); ctx.ellipse(x+w*.5,y+h*.58,w*.32,h*.30,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ff9800'; ctx.lineWidth=6; ctx.lineCap='round';
      for(let i=0;i<3;i++){ const yy=y+h*(.35+i*.2); ctx.beginPath(); ctx.moveTo(x+w*.25,yy); ctx.lineTo(x+w*.05,yy-8); ctx.moveTo(x+w*.75,yy); ctx.lineTo(x+w*.95,yy-8); ctx.stroke(); }
      ctx.strokeStyle='#e65100'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(x+w*.72,y+h*.35); ctx.quadraticCurveTo(x+w*1.05,y+h*.02,x+w*.78,y-h*.02); ctx.stroke();
      ctx.fillStyle='#ff5722'; ctx.beginPath(); ctx.arc(x+w*.78,y+h*.02,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+w*.40,y+h*.50,3,0,Math.PI*2); ctx.arc(x+w*.60,y+h*.50,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+w*.40,y+h*.50,1.5,0,Math.PI*2); ctx.arc(x+w*.60,y+h*.50,1.5,0,Math.PI*2); ctx.fill();
    }

    // Type 6: Wild wolf - pink/red-gray
    else if (e.type === 6) {
      ctx.fillStyle='#c62828';
      ctx.beginPath(); ctx.ellipse(x+w*.5,y+h*.60,w*.38,h*.30,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x+w*.18,y+h*.40); ctx.lineTo(x+w*.24,y+h*.02); ctx.lineTo(x+w*.40,y+h*.30); ctx.moveTo(x+w*.60,y+h*.30); ctx.lineTo(x+w*.78,y+h*.02); ctx.lineTo(x+w*.82,y+h*.40); ctx.fill();
      ctx.fillStyle='#ef5350'; ctx.beginPath(); ctx.ellipse(x+w*.80,y+h*.57,w*.18,h*.15,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+w*.66,y+h*.49,4,0,Math.PI*2); ctx.arc(x+w*.80,y+h*.49,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+w*.67,y+h*.49,2,0,Math.PI*2); ctx.arc(x+w*.81,y+h*.49,2,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+w*.75,y+h*.67); ctx.lineTo(x+w*.75,y+h*.76); ctx.stroke();
    }

    // Type 7: Vulture - black/gold, two hits
    else {
      ctx.fillStyle='#263238';
      ctx.beginPath(); ctx.ellipse(x+w*.5,y+h*.58,w*.36,h*.30,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#37474f';
      ctx.beginPath(); ctx.moveTo(x+w*.40,y+h*.55); ctx.lineTo(x+w*.02,y+h*.25); ctx.lineTo(x+w*.20,y+h*.68); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x+w*.60,y+h*.55); ctx.lineTo(x+w*.98,y+h*.25); ctx.lineTo(x+w*.80,y+h*.68); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#f9a825'; ctx.beginPath(); ctx.arc(x+w*.5,y+h*.36,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+w*.45,y+h*.34,2.5,0,Math.PI*2); ctx.arc(x+w*.55,y+h*.34,2.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffca28'; ctx.beginPath(); ctx.moveTo(x+w*.55,y+h*.42); ctx.lineTo(x+w*.85,y+h*.48); ctx.lineTo(x+w*.55,y+h*.52); ctx.closePath(); ctx.fill();
    }

    ctx.restore();
  }
}


function drawEyes(
  x,
  y,
  width
) {

  ctx.fillStyle =
    "#fff";


  ctx.beginPath();


  ctx.arc(
    x + width * 0.3,
    y + 15,
    6,
    0,
    Math.PI * 2
  );


  ctx.arc(
    x + width * 0.7,
    y + 15,
    6,
    0,
    Math.PI * 2
  );


  ctx.fill();


  ctx.fillStyle =
    "#111";


  ctx.beginPath();


  ctx.arc(
    x + width * 0.3,
    y + 15,
    2.5,
    0,
    Math.PI * 2
  );


  ctx.arc(
    x + width * 0.7,
    y + 15,
    2.5,
    0,
    Math.PI * 2
  );


  ctx.fill();
}


// ============================================================
// PLAYER DRAW
// ============================================================

function drawPlayer() {

  const x = player.x - cameraX;
  const y = player.y;
  const t = performance.now() * 0.012;
  const moving = Math.abs(player.vx) > 0.2;
  const step = moving
    ? Math.sin(t * (player.running ? 1.7 : 1.0)) * 4
    : 0;
  const bob = moving
    ? Math.abs(Math.sin(t * (player.running ? 1.7 : 1.0))) * 1.3
    : 0;

  ctx.save();
  ctx.translate(x + player.width / 2, y + bob);
  ctx.scale(player.direction || 1, 1);
  ctx.translate(-player.width / 2, 0);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath();
  ctx.ellipse(21, 59, player.running ? 27 : 23, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back leg
  ctx.strokeStyle = '#253b73';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(22, 43);
  ctx.lineTo(17 - step * 0.7, 54);
  ctx.stroke();

  // Front leg
  ctx.beginPath();
  ctx.moveTo(27, 43);
  ctx.lineTo(31 + step * 0.7, 54);
  ctx.stroke();

  // Shoes pointing forward
  ctx.fillStyle = '#242424';
  ctx.beginPath();
  ctx.roundRect(11 - step * 0.7, 51, 18, 8, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(27 + step * 0.7, 51, 18, 8, 4);
  ctx.fill();

  // Hoodie / shirt body
  ctx.fillStyle = player.running ? '#e85d2a' : '#ef6a2f';
  ctx.beginPath();
  ctx.roundRect(7, 22, 28, 24, 8);
  ctx.fill();

  // Hoodie pocket
  ctx.fillStyle = '#d94e25';
  ctx.beginPath();
  ctx.roundRect(14, 35, 17, 8, 4);
  ctx.fill();

  // Back arm
  ctx.strokeStyle = '#d95429';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(10, 27);
  ctx.lineTo(5, 39 - step);
  ctx.stroke();

  // Front arm swinging forward
  ctx.strokeStyle = '#ef6a2f';
  ctx.beginPath();
  ctx.moveTo(32, 27);
  ctx.lineTo(40, 36 + step);
  ctx.stroke();

  // Hands
  ctx.fillStyle = '#f2b58d';
  ctx.beginPath();
  ctx.arc(5, 40 - step, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(40, 37 + step, 5, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = '#d99068';
  ctx.fillRect(22, 17, 8, 8);

  // Side-profile head: nose projects forward, one eye visible.
  ctx.fillStyle = '#f2b58d';
  ctx.beginPath();
  ctx.ellipse(23, 13, 15, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back ear
  ctx.beginPath();
  ctx.arc(9, 15, 4, 0, Math.PI * 2);
  ctx.fill();

  // Nose pointing in movement direction
  ctx.beginPath();
  ctx.moveTo(34, 17);
  ctx.quadraticCurveTo(43, 20, 34, 23);
  ctx.closePath();
  ctx.fill();

  // Hair visible under cap
  ctx.fillStyle = '#2b1b16';
  ctx.beginPath();
  ctx.arc(21, 6, 13, Math.PI, Math.PI * 2);
  ctx.fill();

  // Naughty cap with visor pointing forward
  ctx.fillStyle = '#d32f2f';
  ctx.beginPath();
  ctx.arc(21, 2, 13, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(9, 1, 24, 5);
  ctx.fillStyle = '#b71c1c';
  ctx.beginPath();
  ctx.ellipse(35, 6, 13, 4, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // One visible eyebrow
  ctx.strokeStyle = '#4e2b22';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(25, 11);
  ctx.lineTo(32, 12);
  ctx.stroke();

  // One visible eye looking forward
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(29, 16, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(30, 16, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Mischievous smile in profile
  ctx.strokeStyle = '#6d2e28';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(29, 22, 6, 0.05, 1.05);
  ctx.stroke();

  // Small motion streaks while running
  if (player.running && Math.abs(player.vx) > 2) {
    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(4 - i * 6, 26 + i * 8);
      ctx.lineTo(-12 - i * 8, 26 + i * 8);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ============================================================
// RIVER / WATER HAZARDS DRAW
// ============================================================

function drawLevelHazards() {

  for (const h of hazards) {
    const x = h.x - cameraX;
    const y = h.y;
    const w = h.width;

    if (x + w < 0 || x > canvas.width) continue;

    // Water only. The animated crocodile/whale is rendered once
    // by the smart hazard system below.
    const g = ctx.createLinearGradient(0, y, 0, y + h.height);
    g.addColorStop(0, '#20b8e8');
    g.addColorStop(0.45, '#0d86bd');
    g.addColorStop(1, '#075a93');

    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h.height);

    ctx.strokeStyle = 'rgba(220,250,255,.9)';
    ctx.lineWidth = 2;

    for (let wx = x; wx < x + w; wx += 34) {
      const wave = Math.sin(performance.now() * 0.004 + wx * 0.03) * 3;

      ctx.beginPath();
      ctx.moveTo(wx, y + 8 + wave);
      ctx.quadraticCurveTo(wx + 8, y + 2 + wave, wx + 17, y + 8 + wave);
      ctx.quadraticCurveTo(wx + 25, y + 14 + wave, wx + 34, y + 8 + wave);
      ctx.stroke();
    }
  }
}


// ============================================================
// GOAL DRAW
// ============================================================

function drawGoal() {

  if (!goal) {
    return;
  }

  const x = goal.x - cameraX;

  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(x, goal.y, 6, goal.height);

  const colors = [
    "#2196f3", "#00bcd4", "#4caf50", "#ffc107", "#03a9f4",
    "#ff5722", "#e91e63", "#9c27b0", "#673ab7", "#795548",
    "#009688", "#8bc34a", "#ff9800", "#f44336", "#3f51b5"
  ];

  ctx.fillStyle = colors[(currentLevel - 1) % colors.length];
  ctx.beginPath();
  ctx.moveTo(x + 6, goal.y);
  ctx.lineTo(x + 66, goal.y + 25);
  ctx.lineTo(x + 6, goal.y + 50);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(x + 3, goal.y - 5, 8, 0, Math.PI * 2);
  ctx.fill();
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  drawBackground();

  drawPlatforms();

  drawCoins();

  drawEnemies();

  drawGoal();

  drawPlayer();
}


// ============================================================
// START GAME
// ============================================================

function startGame() {

  if (
    gameRunning
  ) {

    return;
  }


  if (
    gameOver ||
    gameWon ||
    changingLevel
  ) {

    return;
  }


  gameRunning =
    true;


  startMusic();


  animationId =
    requestAnimationFrame(
      loop
    );
}



/* ============================================================
   SMART ENEMIES + MOVING OBSTACLES + STAGE STARS
   ============================================================ */
let smartEnemies = [];
let smartProjectiles = [];
let smartObstacles = [];
let smartStageCoinsStart = 0;
let smartStageLivesStart = 3;
let smartStageCompleted = false;
let smartStageStartTimeSafe = Date.now();

function smartDifficulty() {
  return 0.40 + ((currentLevel - 1) / 14) * 0.60;
}
function smartRect(a){return{x:a.x,y:a.y,width:a.w,height:a.h};}
function smartHit(a,b){return intersects(smartRect(a),smartRect(b));}
function smartPlayerHit(o){
  return player && smartHit(o,{x:player.x,y:player.y,w:player.width,h:player.height});
}
function smartResetStage(){
  smartEnemies=[]; smartProjectiles=[]; smartObstacles=[];
  smartStageCoinsStart=coins; smartStageLivesStart=lives;
  smartStageCompleted=false; smartStageStartTimeSafe=Date.now();
  const w=currentLevelWidth||81000, d=smartDifficulty();
  const step=Math.max(4000,w*.11);
  for(let i=0;i<2+Math.floor(d*5);i++){
    smartEnemies.push({type:i%5,x:5200+i*step,y:485,w:46,h:48,vx:0,vy:0,
      hidden:false,attackTimer:70+i*35,shootTimer:100+i*30,jumpTimer:60+i*20});
  }
  for(let i=0;i<3+Math.floor(d*4);i++){
    smartObstacles.push({kind:"platform",x:7000+i*Math.max(7000,w*.12),
      y:400-(i%2)*60,baseY:400-(i%2)*60,w:150,h:22,phase:i*1.7,active:true});
  }
  for(let i=0;i<3+Math.floor(d*3);i++){
    smartObstacles.push({kind:i%2?"whale":"crocodile",
      x:12000+i*Math.max(9000,w*.13),y:535,w:i%2?90:70,h:40,
      timer:100+i*50,phase:i*2,active:true});
  }
  for(let i=0;i<3+Math.floor(d*5);i++){
    smartObstacles.push({kind:"rock",x:17000+i*Math.max(8500,w*.10),
      y:-100,w:38,h:38,vy:0,triggered:false,active:true});
  }
  for(let i=0;i<2+Math.floor(d*3);i++){
    smartObstacles.push({kind:"bridge",x:25000+i*Math.max(12000,w*.14),
      y:510,w:220,h:24,timer:0,falling:false,active:true});
  }
}
function smartShoot(e){
  smartProjectiles.push({x:e.x+e.w/2,y:e.y+18,w:15,h:8,
    vx:(player.x<e.x?-1:1)*(5+smartDifficulty()*4),life:150});
}
function updateSmartEnemies(){
  const d=smartDifficulty();
  for(const e of smartEnemies){
    if(!e.active)continue;
    const dist=Math.abs(player.x-e.x);
    if(e.type===0)e.x+=(player.x<e.x?-1:1)*(dist<700?(2+d*2.5):.3);
    if(e.type===1){
      e.hidden=dist>390;
      if(!e.hidden){e.attackTimer--;if(e.attackTimer<=0){e.vx=(player.x<e.x?-1:1)*(5+d*3);e.attackTimer=110;}e.x+=e.vx;}
    }
    if(e.type===2){
      e.jumpTimer--;if(e.jumpTimer<=0){e.vy=-(8+d*3);e.jumpTimer=Math.max(45,100-d*35);}
      e.vy+=.35;e.y+=e.vy;if(e.y>=485){e.y=485;e.vy=0;}
      e.x+=(player.x<e.x?-1:1)*(1.2+d*2);
    }
    if(e.type===3){
      e.shootTimer--;if(dist<900&&e.shootTimer<=0){smartShoot(e);e.shootTimer=Math.max(45,120-d*55);}
    }
    if(e.type===4)e.x+=(player.x<e.x?-1:1)*(2.5+d*5.5);
    if(!e.hidden&&smartPlayerHit(e)){playerDied();return;}
  }
  for(let i=smartProjectiles.length-1;i>=0;i--){
    const q=smartProjectiles[i];q.x+=q.vx;q.life--;
    if(q.life<=0){smartProjectiles.splice(i,1);continue;}
    if(smartPlayerHit(q)){smartProjectiles.splice(i,1);playerDied();return;}
  }
}
function updateSmartObstacles(){
  const d=smartDifficulty();
  for(const o of smartObstacles){
    if(!o.active)continue;
    if(o.kind==="platform"){o.phase+=.025+d*.015;o.y=o.baseY+Math.sin(o.phase)*70;}
    if(o.kind==="crocodile"){
      o.timer--;if(o.timer<=0){o.active=!o.active;o.timer=o.active?100:70;}
      o.y=o.active?535+Math.sin(Date.now()/180)*4:565;
      if(o.active&&smartPlayerHit(o)){playerDied();return;}
    }
    if(o.kind==="whale"){
      o.timer--;if(o.timer<=0){o.timer=160-d*35;o.phase=0;}
      o.phase+=.08;const j=Math.sin(o.phase);
      o.y=j>0?535-j*(150+d*60):535;
      if(j>.15&&smartPlayerHit(o)){playerDied();return;}
    }
    if(o.kind==="rock"){
      if(!o.triggered&&player.x>o.x-500){o.triggered=true;o.vy=1;}
      if(o.triggered){o.vy+=.35;o.y+=o.vy;if(o.y>570)o.active=false;if(smartPlayerHit(o)){playerDied();return;}}
    }
    if(o.kind==="bridge"){
      if(!o.falling&&player.x>o.x-90){o.timer++;if(o.timer>55-d*20)o.falling=true;}
      if(o.falling){o.y+=5+d*3;if(smartPlayerHit(o)){playerDied();return;}if(o.y>700)o.active=false;}
    }
  }
}
function drawSmartFeatures(){
  if(typeof ctx==="undefined")return;
  ctx.save();ctx.textAlign="center";
  for(const e of smartEnemies){
    if(!e.active||e.hidden)continue;
    ctx.font="38px sans-serif";
    ctx.fillText(e.type===0?"🐺":e.type===1?"🦎":e.type===2?"🐗":e.type===3?"🦅":"🐆",e.x-cameraX,e.y+35);
  }
  for(const q of smartProjectiles){ctx.fillStyle="#ff7a00";ctx.beginPath();ctx.arc(q.x-cameraX,q.y+4,6,0,Math.PI*2);ctx.fill();}
  for(const o of smartObstacles){
    if(!o.active)continue;const x=o.x-cameraX;
    ctx.font="40px sans-serif";
    if(o.kind==="crocodile")ctx.fillText("🐊",x+o.w/2,o.y+28);
    if(o.kind==="whale")ctx.fillText("🐋",x+o.w/2,o.y+35);
    if(o.kind==="rock")ctx.fillText("🪨",x+o.w/2,o.y+35);
    if(o.kind==="platform"){ctx.fillStyle="#795548";ctx.fillRect(x,o.y,o.w,o.h);ctx.fillStyle="#8bc34a";ctx.fillRect(x,o.y,o.w,6);}
    if(o.kind==="bridge"){ctx.fillStyle="#7b4f2c";ctx.fillRect(x,o.y,o.w,o.h);}
  }
  ctx.restore();
}
function smartAwardStars(){
  if(smartStageCompleted)return;
  smartStageCompleted=true;
  const total=Math.max(1,coinList.length);
  const gained=Math.max(0,coins-smartStageCoinsStart);
  let stars=1;
  if(gained>=20||gained/total>=.40)stars=2;
  if(gained/total>=.70&&lives>=smartStageLivesStart)stars=3;
  try{
    const k="naughtyBoySaveV5",d=JSON.parse(localStorage.getItem(k)||"{}");
    d.stars=d.stars||{};d.stars[currentLevel]=Math.max(Number(d.stars[currentLevel]||0),stars);
    localStorage.setItem(k,JSON.stringify(d));
  }catch(_){}
  const msg=stars===3?"⭐⭐⭐":stars===2?"⭐⭐":"⭐";
  if(typeof announce==="function")announce(msg+" "+(selectedLanguage==="en"?(stars===3?"Perfect stage!":stars===2?"Great job!":"Stage complete!"):(stars===3?"مرحلة مثالية!":stars===2?"أداء رائع!":"تم إنهاء المرحلة!")));
}


// ============================================================
// STOP GAME
// ============================================================

function stopGame() {

  gameRunning =
    false;


  stopMusic();


  if (
    animationId !== null
  ) {

    cancelAnimationFrame(
      animationId
    );


    animationId =
      null;
  }
}


// ============================================================
// GAME LOOP
// ============================================================

function loop() {

  if (
    !gameRunning
  ) {

    return;
  }


  if (
    gameOver ||
    gameWon ||
    changingLevel
  ) {

    stopGame();

    draw();

    return;
  }


  if (
    !updatePlayer()
  ) {

    playerDied();

    return;
  }


  if (
    !updateEnemies()
  ) {

    playerDied();

    return;
  }

  updateSmartEnemies();

  if (gameOver || gameWon || changingLevel) return;

  updateSmartObstacles();


  updateCoins();

  updateCamera();

  checkGoal();

  draw();
  drawSmartFeatures();


  animationId =
    requestAnimationFrame(
      loop
    );
}


// ============================================================
// INITIALIZE
// ============================================================

loadLevel(1);

updateHUD();

// ============================================================
// START MENU / SETTINGS / LANGUAGE
// ============================================================

let selectedLanguage = localStorage.getItem('gameLanguage') || 'ar';
let startMenu = null;
let settingsPanel = null;

const menuText = {
  ar: {
    title: 'مغامرة الولد المشاغب',
    play: '▶ ابدأ اللعب',
    settings: '⚙ الإعدادات',
    load: '▶ تحميل الحفظ',
    settingsTitle: 'الإعدادات',
    language: 'اللغة',
    exit: '✕ خروج',
    mainMenu: '⏹ القائمة الرئيسية',
    laser: '🔫 مسدس الليزر',
    fire: 'إطلاق',
    shots: 'الطلقات',
    arabic: '🇸🇦 العربية',
    english: '🇺🇸 English',
    close: 'إغلاق',
    difficulty: 'الصعوبة',
    stage: 'المرحلة',
    score: 'النقاط', coins: 'العملات', lives: 'الأرواح',
    move: '← → للحركة', jump: 'SPACE / ↑ للقفز',
    gameOver: 'انتهت المحاولات!', restart: '🔄 إعادة المرحلة — 3 أرواح',
    tryAgain: 'حاول مرة أخرى',
    victory: 'مبروك!', newGame: '🔄 اللعب من جديد',
    levelStart: 'المرحلة ', nextInfo: 'الصعوبة تزداد!'
  },
  en: {
    title: 'Naughty Boy Adventure',
    play: '▶ START PLAY',
    settings: '⚙ Settings',
    load: '▶ Load Game',
    settingsTitle: 'Settings',
    language: 'Language',
    exit: '✕ Exit',
    mainMenu: '⏹ Main Menu',
    laser: '🔫 Laser Gun',
    fire: 'Fire',
    shots: 'Shots',
    arabic: '🇸🇦 العربية',
    english: '🇺🇸 English',
    close: 'Close',
    difficulty: 'Difficulty',
    stage: 'Stage',
    score: 'Score', coins: 'Coins', lives: 'Lives',
    move: '← → Move', jump: 'SPACE / ↑ Jump',
    gameOver: 'Game Over!', restart: '🔄 Restart Level — 3 Lives',
    tryAgain: 'Try again',
    victory: 'Congratulations!', newGame: '🔄 Play Again',
    levelStart: 'Level ', nextInfo: 'Difficulty increases!'
  }
};

function setLanguage(lang) {
  selectedLanguage = lang === 'en' ? 'en' : 'ar';
  localStorage.setItem('gameLanguage', selectedLanguage);
  document.documentElement.lang = selectedLanguage === 'en' ? 'en' : 'ar';
  document.documentElement.dir = selectedLanguage === 'en' ? 'ltr' : 'rtl';
  updateAllLanguageTexts();
  updateStartMenuTexts();
  updateHUD();
}

function updateAllLanguageTexts() {
  const t = menuText[selectedLanguage];
  if (scoreLabel) scoreLabel.textContent = t.score;
  if (coinsLabel) coinsLabel.textContent = t.coins;
  if (livesLabel) livesLabel.textContent = t.lives;
  if (levelLabel) levelLabel.textContent = t.stage;
  if (moveControl) moveControl.textContent = t.move;
  if (jumpControl) jumpControl.textContent = t.jump;
  if (messageTitle && gameOver) messageTitle.textContent = t.gameOver;
  if (messageText && gameOver) messageText.textContent = t.restart.replace('🔄 ', '').replace(' — 3 Lives','');
  if (restartButton && gameOver) restartButton.textContent = t.restart;
  if (messageTitle && gameWon) messageTitle.textContent = t.victory;
  if (restartButton && gameWon) restartButton.textContent = t.newGame;
}

function updateStartMenuTexts() {
  if (!startMenu) return;
  const t = menuText[selectedLanguage];
  startMenu.querySelector('.game-title').textContent = t.title;
  startMenu.querySelector('.play-btn').textContent = t.play;
  startMenu.querySelector('.settings-btn').textContent = t.settings;
  const loadButton = startMenu.querySelector('.load-btn');
  if (loadButton) loadButton.textContent = t.load;
  const exitButton = startMenu.querySelector('.exit-btn');
  if (exitButton) exitButton.textContent = t.exit;
  if (settingsPanel) {
    settingsPanel.querySelector('.settings-title').textContent = t.settingsTitle;
    settingsPanel.querySelector('.language-label').textContent = t.language;
    settingsPanel.querySelector('.lang-ar').textContent = t.arabic;
    settingsPanel.querySelector('.lang-en').textContent = t.english;
    settingsPanel.querySelector('.close-settings').textContent = t.close;
  }
}

function initStartScreen() {

  // Always display stage 1 on first launch, regardless of HTML's default HUD text.
  currentLevel = 1;
  updateHUD();

  // Draw the first level behind the menu so the opening screen matches level 1.
  loadLevel(1, true);
  updateHUD();
  draw();

  startMenu = document.createElement('div');
  startMenu.id = 'gameStartMenu';
  startMenu.style.cssText = `
    position:fixed; inset:0; z-index:10000;
    display:flex; align-items:center; justify-content:center;
    background:linear-gradient(rgba(10,30,35,.20),rgba(5,15,25,.48));
    backdrop-filter:blur(2px); font-family:Arial,sans-serif;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    width:min(92vw,520px); padding:34px 28px; text-align:center;
    border-radius:28px; background:rgba(8,20,30,.82);
    border:2px solid rgba(255,255,255,.25);
    box-shadow:0 25px 70px rgba(0,0,0,.42); color:#fff;
  `;

  card.innerHTML = `
    <div class="start-cap" aria-hidden="true" style="position:relative;width:92px;height:64px;margin:0 auto 6px">
      <div style="position:absolute;left:18px;top:5px;width:56px;height:42px;background:#d32f2f;border-radius:55px 55px 18px 18px;box-shadow:inset 0 -7px 0 #b71c1c"></div>
      <div style="position:absolute;left:48px;top:37px;width:48px;height:14px;background:#b71c1c;border-radius:50%;transform:rotate(7deg)"></div>
    </div>
    <h1 class="game-title" style="font-size:clamp(28px,6vw,46px);margin:12px 0 25px">${menuText[selectedLanguage].title}</h1>
    <button class="play-btn" style="display:block;width:100%;padding:17px 20px;border:0;border-radius:16px;background:#27ae60;color:#fff;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 8px 0 #176b3a">${menuText[selectedLanguage].play}</button>
    <button class="settings-btn" style="display:block;width:100%;margin-top:18px;padding:17px 20px;border:0;border-radius:16px;background:#27ae60;color:#fff;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 8px 0 #176b3a">${menuText[selectedLanguage].settings}</button>
    <button class="load-btn" style="display:none;width:100%;margin-top:18px;padding:17px 20px;border:0;border-radius:16px;background:#2980b9;color:#fff;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 8px 0 #1c5980">▶ تحميل الحفظ</button>
    <button class="exit-btn" style="display:block;width:100%;margin-top:18px;padding:17px 20px;border:0;border-radius:16px;background:#c0392b;color:#fff;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 8px 0 #7f241b">${menuText[selectedLanguage].exit}</button>
    <div style="margin-top:18px;font-size:13px;opacity:.75">30 مرحلة • 7 حيوانات • 3 أرواح</div>
    <div style="margin-top:8px;font-size:12px;opacity:.6">الصعوبة تبدأ من 40% وتصل إلى 100%</div>
  `;

  startMenu.appendChild(card);
  document.body.appendChild(startMenu);

  settingsPanel = document.createElement('div');
  settingsPanel.style.cssText = `
    display:none; position:fixed; inset:0; z-index:10001;
    align-items:center; justify-content:center; background:rgba(0,0,0,.55);
  `;
  settingsPanel.innerHTML = `
    <div style="width:min(90vw,420px);padding:28px;border-radius:24px;background:#17232e;color:#fff;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <h2 class="settings-title" style="margin-top:0">${menuText[selectedLanguage].settingsTitle}</h2>
      <div class="language-label" style="margin:18px 0 12px;font-size:18px">${menuText[selectedLanguage].language}</div>
      <div style="display:flex;gap:10px">
        <button class="lang-ar" style="flex:1;padding:12px;border:0;border-radius:12px;cursor:pointer">${menuText[selectedLanguage].arabic}</button>
        <button class="lang-en" style="flex:1;padding:12px;border:0;border-radius:12px;cursor:pointer">${menuText[selectedLanguage].english}</button>
      </div>
      <button class="close-settings" style="margin-top:20px;width:100%;padding:12px;border:0;border-radius:12px;cursor:pointer">${menuText[selectedLanguage].close}</button>
    </div>
  `;
  document.body.appendChild(settingsPanel);

  card.querySelector('.play-btn').addEventListener('click', () => {
    initAudio();
    soundButton();

    // Always start a fresh game from stage 1.
    currentLevel = 1;
    score = 0;
    coins = 0;
    lives = 3;
    gameOver = false;
    gameWon = false;
    changingLevel = false;
    gameRunning = false;

    loadLevel(1, true);
    updateHUD();

    startMenu.remove();
    settingsPanel.remove();
    startMenu = null;
    settingsPanel = null;

    startGame();
  });

  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('naughtyBoyFinishSaveV1') || 'null'); } catch (e) { return null; }
  })();

  const loadButton = card.querySelector('.load-btn');
  if (saved && Number(saved.nextLevel) >= 2 && Number(saved.nextLevel) <= TOTAL_LEVELS) {
    loadButton.style.display = 'block';
  }

  if (loadButton) loadButton.addEventListener('click', () => {
    initAudio();
    currentLevel = Math.max(1, Math.min(TOTAL_LEVELS, Number(saved?.nextLevel) || 1));
    score = Number(saved?.score) || 0;
    coins = Number(saved?.coins) || 0;
    lives = 3;
    gameOver = false;
    gameWon = false;
    changingLevel = false;
    gameRunning = false;
    loadLevel(currentLevel, true);
    updateHUD();
    startMenu.remove();
    settingsPanel.remove();
    startMenu = null;
    settingsPanel = null;
    startGame();
  });

  card.querySelector('.settings-btn').addEventListener('click', () => {
    settingsPanel.style.display = 'flex';
  });

  card.querySelector('.exit-btn').addEventListener('click', () => {
    try {
      window.close();
    } catch (e) {}

    setTimeout(() => {
      if (!document.hidden) {
        alert(selectedLanguage === 'en'
          ? 'The browser may prevent closing this tab.'
          : 'قد يمنع المتصفح إغلاق علامة التبويب.');
      }
    }, 100);
  });

  settingsPanel.querySelector('.lang-ar').addEventListener('click', () => setLanguage('ar'));
  settingsPanel.querySelector('.lang-en').addEventListener('click', () => setLanguage('en'));
  settingsPanel.querySelector('.close-settings').addEventListener('click', () => {
    settingsPanel.style.display = 'none';
  });
}

initStartScreen();
setLanguage(selectedLanguage);

// Lightweight animated background layer: decorative birds, butterflies, clouds and stars.
(function installAmbientBackground(){
  const originalDrawBackground = drawBackground;
  drawBackground = function(){
    originalDrawBackground.apply(this, arguments);
    const now = performance.now() * 0.001;
    const theme = currentWorld ? currentWorld.theme : "grass";
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (["grass","forest","flower","palm","rainforest","goldforest","wheat","ocean","turquoise"].includes(theme)) {
      ctx.font = "19px sans-serif";
      for (let i=0;i<4;i++) {
        const x = ((i*330 + now*(35+i*8) - cameraX*.08) % (canvas.width+100)) - 50;
        const y = 65 + i*28 + Math.sin(now*1.6+i)*8;
        ctx.fillText("🕊️", x, y);
      }
      ctx.font = "20px sans-serif";
      for (let i=0;i<5;i++) {
        const x = ((i*190 - cameraX*.12 + now*(18+i*4)) % (canvas.width+80)) - 40;
        const y = 235 + (i%3)*55 + Math.sin(now*2+i)*14;
        ctx.fillText("🦋", x, y);
      }
    }

    if (["stars","moon","desertNight","castle","final","lightning","royal"].includes(theme)) {
      ctx.font = "13px sans-serif";
      for (let i=0;i<24;i++) {
        const x = (i*91 - cameraX*.04) % (canvas.width+20);
        const y = 35 + (i*43)%210 + Math.sin(now*1.5+i)*5;
        ctx.globalAlpha = .35 + .35*Math.sin(now*2+i);
        ctx.fillText("✨", x, y);
      }
      ctx.globalAlpha = 1;
    }

    if (["rain","storm"].includes(theme)) {
      ctx.strokeStyle = "rgba(220,240,255,.42)";
      ctx.lineWidth = 1;
      for (let i=0;i<45;i++) {
        const x=(i*53-cameraX*.03)%canvas.width;
        const y=(i*37+now*240)%canvas.height;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-4,y+13); ctx.stroke();
      }
    }

    if (["volcano","ash"].includes(theme)) {
      ctx.font = "12px sans-serif";
      for(let i=0;i<18;i++){
        const x=(i*73-cameraX*.05)%canvas.width;
        const y=(150+(i*41+now*55)%350);
        ctx.globalAlpha=.35+.25*Math.sin(now+i);
        ctx.fillText("🔥",x,y);
      }
      ctx.globalAlpha=1;
    }
    ctx.restore();
  };
})();

// ============================================================
