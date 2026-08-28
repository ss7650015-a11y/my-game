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

const TOTAL_LEVELS = 45;

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
      0.24;

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
        0.16,
        "triangle",
        0.045,
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


// Sound is always enabled; no mute/sound button is created.


// ============================================================
// KEYBOARD
// ============================================================

const keys = {};

// ============================================================
// XBOX / GAMEPAD SUPPORT
// Xbox controllers use the standard browser Gamepad API mapping:
// Left Stick = move, A = jump, RT = run, X = laser.
// ============================================================
let activeGamepad = null;
let gamepadPrevFire = false;

function pollGamepad() {
  if (!navigator.getGamepads) return;
  const pads = navigator.getGamepads();
  activeGamepad = null;
  for (const pad of pads) {
    if (pad && pad.connected) { activeGamepad = pad; break; }
  }
  if (!activeGamepad) {
    keys.__gpLeft = false;
    keys.__gpRight = false;
    keys.__gpJump = false;
    keys.__gpRun = false;
    gamepadPrevFire = false;
    return;
  }

  const axis = Number(activeGamepad.axes?.[0] || 0);
  const dead = 0.22;
  keys.__gpLeft = axis < -dead;
  keys.__gpRight = axis > dead;
  keys.__gpJump = !!activeGamepad.buttons?.[0]?.pressed; // A
  keys.__gpRun = !!activeGamepad.buttons?.[7]?.pressed;  // RT

  // X button fires once per press, matching the keyboard F/X behavior.
  const fireNow = !!activeGamepad.buttons?.[2]?.pressed; // X
  if (fireNow && !gamepadPrevFire) {
    document.dispatchEvent(new KeyboardEvent("keydown", {key:"x", code:"KeyX", bubbles:true}));
  }
  gamepadPrevFire = fireNow;
}

window.addEventListener("gamepadconnected", e => { activeGamepad = e.gamepad; });
window.addEventListener("gamepaddisconnected", () => { activeGamepad = null; });

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
  { name: "حدائق الربيع", theme: "grass", sky1: "#67d9c1", sky2: "#f4ffe8" },
  { name: "خليج المرجان", theme: "ocean", sky1: "#4bc9e8", sky2: "#e8ffff" },
  { name: "غابة الفراشات", theme: "forest", sky1: "#6fc9ff", sky2: "#d8ffd9" },
  { name: "وادي الرمال الذهبية", theme: "desert", sky1: "#f6b85c", sky2: "#fff1c2" },
  { name: "قمم الثلج", theme: "ice", sky1: "#79c9ef", sky2: "#ffffff" },
  { name: "سهول الحمم", theme: "volcano", sky1: "#3b1b26", sky2: "#ff8b52" },
  { name: "برج القمر", theme: "castle", sky1: "#171b43", sky2: "#766da8" },
  { name: "مستنقع الضباب", theme: "swamp", sky1: "#214b43", sky2: "#9fcf8a" },
  { name: "كهف الكريستال", theme: "cave", sky1: "#11182d", sky2: "#6378a8" },
  { name: "مدينة البرق", theme: "storm", sky1: "#263653", sky2: "#b7c7dc" },
  { name: "ميناء القراصنة", theme: "pirate", sky1: "#249bc0", sky2: "#ffe5a8" },
  { name: "صحراء القمر", theme: "desertNight", sky1: "#171437", sky2: "#9a6072" },
  { name: "غابة الكروم", theme: "thorn", sky1: "#1b4631", sky2: "#91d27f" },
  { name: "بحيرة التنين", theme: "monsterLake", sky1: "#19435e", sky2: "#7fc6d1" },
  { name: "بوابة الفجر", theme: "final", sky1: "#23152e", sky2: "#d15d62" }

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
    0.40 + (number - 1) * (0.60 / 44);

  // Stages are calibrated for about one minute of continuous running.
  // At run speed 7.5 px/frame and 60 FPS, 30,000 px is about 67 seconds.
  // A small increase per stage keeps later stages slightly longer.
  const width =
    13500 + (number - 1) * 60;

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

  // A normal level load starts from the beginning. resetCurrentLevel() passes false
  // so a life-loss respawn can preserve the checkpoint near the death location.
  if (snapshotProgress !== false) {
    respawnCheckpointX = 100;
    respawnCheckpointY = 400;
    lastSafeX = 100;
    lastSafeY = 400;
  }

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
      currentLevel + " / 45";
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
    keys["d"] ||
    keys.__gpRight;


  const movingLeft =
    keys["arrowleft"] ||
    keys["a"] ||
    keys.__gpLeft;


  const running =
    (keys["shift"] || keys.__gpRun) &&
    (movingRight || movingLeft);


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
    keys[" "] ||
    keys.__gpJump;


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

      const playerBottom = player.y + player.height;
      const previousBottom = playerBottom - player.vy;
      const enemyTop = e.y;
      const stompBand = Math.max(14, Math.min(24, e.height * 0.55));

      // Reliable stomp detection for every enemy type.  A stomp is
      // registered when the player is descending and crosses the top
      // portion of the enemy, with a small tolerance for fast jumps.
      const horizontalCenter = player.x + player.width / 2;
      const horizontalOnEnemy =
        horizontalCenter >= e.x - 8 &&
        horizontalCenter <= e.x + e.width + 8;
      const crossedEnemyTop =
        previousBottom <= enemyTop + stompBand &&
        playerBottom >= enemyTop;
      const safeTopOverlap =
        player.vy > 0 &&
        playerBottom <= enemyTop + stompBand;

      const stomp =
        player.vy > 0 &&
        horizontalOnEnemy &&
        (crossedEnemyTop || safeTopOverlap);

      if (stomp) {
        // All enemies die from a successful stomp, including type 7.
        e.alive = false;
        e.hits = 0;
        player.y = enemyTop - player.height;
        player.vy = -10;
        score += 100;
        soundEnemyStomp();
        updateHUD();
      } else {
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


      coins += 5;

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
// PERSIST COMPLETED STAGE
// ============================================================
function saveCompletedStage(stageNumber) {
  try {
    const key = "naughtyBoySaveV3";
    const old = JSON.parse(localStorage.getItem(key) || "{}");
    const completed = Math.max(Number(old.completedLevel || 0), stageNumber);
    const resumeLevel = Math.min(TOTAL_LEVELS, Math.max(Number(old.level || 1), stageNumber < TOTAL_LEVELS ? stageNumber + 1 : TOTAL_LEVELS));
    const data = {
      ...old,
      level: resumeLevel,
      completedLevel: completed,
      score: Number(score || 0),
      coins: Number(coins || 0),
      stars: old.stars || {}
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

// ============================================================
// NEXT LEVEL
// ============================================================

function nextLevel() {

  // Save immediately when the current stage is completed.
  saveCompletedStage(currentLevel);
  smartAwardStars();

  if (
    changingLevel
  ) {

    return;
  }


  changingLevel =
    true;


  stopGame();


  soundLevelComplete();


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
      "لقد أنهيت جميع المراحل الـ45!";


    restartButton.textContent =
      menuText[selectedLanguage].newGame;


    message.classList.remove(
      "hidden"
    );


    return;
  }


  score += 500;


  currentLevel++;

  // كل مرحلة جديدة تبدأ دائمًا بـ 3 أرواح مستقلة عن المرحلة السابقة.
  lives = 3;
  updateHUD();



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
// PLAYER DEATH / CHECKPOINT RESPAWN
// ============================================================
let respawnCheckpointX = 100;
let respawnCheckpointY = 400;
// Last position reached while the player was still safely inside the stage.
// This is used for life-loss respawns so a death never sends the player back to 100.
let lastSafeX = 100;
let lastSafeY = 400;
let damageInvulnerableUntil = 0;

function setRespawnCheckpointFromDeath() {
  // Respawn near the latest safe position, not at the beginning of the stage.
  // Move slightly backward so the same enemy/hazard does not immediately hit again.
  const sourceX = Math.max(100, lastSafeX, player.x);
  const sourceY = Number.isFinite(lastSafeY) ? lastSafeY : player.y;
  const back = player.direction >= 0 ? -160 : 160;
  respawnCheckpointX = Math.max(100, sourceX + back);
  respawnCheckpointY = Math.max(0, Math.min(520, sourceY));
}

function playerDied(reason = "enemy") {

  if (gameOver || gameWon || changingLevel) return;
  const now = Date.now();
  // Active timed protection always wins over enemy/hazard damage.
  if (typeof expansion !== "undefined" && now < Number(expansion.invincibleUntil || 0)) return;
  if (now < damageInvulnerableUntil) return;
  if (typeof expansion !== "undefined") {
    if (now < Number(expansion.invisibilityUntil || 0)) return;
    if (Number(expansion.shield || 0) > 0) {
      expansion.shield--;
      expansion.activeItem = expansion.shield > 0 ? "shield" : (expansion.laserPacks > 0 ? "laser" : (expansion.flightPacks > 0 ? "flight" : (expansion.invisibilityPacks > 0 ? "invisibility" : null)));
      damageInvulnerableUntil = Date.now() + 900;
      if (typeof saveShopState === "function") saveShopState();
      if (typeof updateUseButton === "function") updateUseButton();
      updateHUD(); soundDamage(); return;
    }
  }

  // Losing a heart no longer resets/reloads the level. The player keeps
  // playing from the exact position where the hit happened.
  lives--;
  damageInvulnerableUntil = Date.now() + 1200;
  updateHUD();
  soundDamage();

  // Only hazards/falling need a safety recovery. Enemy hits do NOT move
  // the player, so the player can keep fighting immediately.
  if (reason !== "enemy") {
    player.x = Math.max(100, Math.min(currentLevelWidth - player.width - 20, lastSafeX));
    player.y = Math.max(0, Math.min(520, lastSafeY));
    player.vx = 0;
    player.vy = 0;
    player.ground = true;
  }

  if (lives > 0) {
    // Keep all collected coins while the player still has hearts.
    if (typeof saveShopState === "function") saveShopState();
    return;
  }

  // All 3 hearts are gone: now (and only now) clear the current coin wallet
  // and end the attempt. The next restart begins the current level fresh.
  coins = 0;
  updateHUD();
  if (typeof saveShopState === "function") saveShopState();
  stopGame();
  gameOver = true;
  soundGameOver();
  messageIcon.textContent = "💀";
  messageTitle.textContent = menuText[selectedLanguage].gameOver;
  messageText.textContent =
    "خسرت الأرواح الثلاثة في المرحلة " + currentLevel +
    ". اضغط الزر للبدء من جديد من أول المرحلة.";
  restartButton.textContent = menuText[selectedLanguage].restart;
  message.classList.remove("hidden");
}

// ============================================================
// RESET CURRENT LEVEL
// ============================================================

function resetCurrentLevel() {

  const savedLives = lives;

  score = levelStartScore;
  coins = levelStartCoins;

  loadLevel(currentLevel, false);

  // Respawn at the latest death/checkpoint location while preserving the level.
  player.x = Math.max(100, Math.min(currentLevelWidth - player.width - 20, respawnCheckpointX));
  player.y = Math.max(0, Math.min(520, respawnCheckpointY));
  player.vx = 0;
  player.vy = 0;
  player.ground = false;

  lives = savedLives;

  updateHUD();
}


// ============================================================
// RESTART
// ============================================================

function restartGame() {

  initAudio();



  stopGame();


  // ----------------------------------------------------------
  // GAME OVER
  // ----------------------------------------------------------

  if (
    gameOver
  ) {

    lives = 3;
    coins = 0;
    levelStartCoins = 0;

    gameOver = false;

    respawnCheckpointX = 100;
    respawnCheckpointY = 400;
    lastSafeX = 100;
    lastSafeY = 400;
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

    respawnCheckpointX = 100;
    respawnCheckpointY = 400;
    lastSafeX = 100;
    lastSafeY = 400;
    resetCurrentLevel();
  }


  // ----------------------------------------------------------
  // NORMAL RESTART
  // ----------------------------------------------------------

  else {

    gameOver = false;

    respawnCheckpointX = 100;
    respawnCheckpointY = 400;
    lastSafeX = 100;
    lastSafeY = 400;
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
  const moving = Math.abs(player.vx) > 0.2;
  const running = player.running && Math.abs(player.vx) > 2;

  // Use the exact small boy from the game's cover as the player sprite.
  if (!window.coverBoySprite) {
    window.coverBoySprite = new Image();
    window.coverBoySprite.src = 'boy-cover.png';
  }

  const sprite = window.coverBoySprite;
  const bob = moving ? Math.abs(Math.sin(performance.now() * (running ? 0.018 : 0.012))) * 1.2 : 0;
  const drawW = 56;
  const drawH = 58;
  const drawY = y + player.height - drawH + bob;
  const dir = player.direction < 0 ? -1 : 1;

  ctx.save();

  // Ground shadow.
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath();
  ctx.ellipse(x + player.width / 2, y + player.height + 1, running ? 25 : 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (sprite.complete && sprite.naturalWidth > 0) {
    ctx.translate(x + player.width / 2, 0);
    ctx.scale(dir, 1);
    ctx.drawImage(sprite, -drawW / 2, drawY, drawW, drawH);
  }

  // Preserve the running trail effect.
  if (running) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const trailX = x + player.width / 2 - dir * (24 + i * 7);
      const trailY = y + 25 + i * 8;
      ctx.beginPath();
      ctx.moveTo(trailX, trailY);
      ctx.lineTo(trailX - dir * 15, trailY);
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
  return 0.40 + ((currentLevel - 1) / 29) * 0.60;
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
  const w=currentLevelWidth||30000, d=smartDifficulty();
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

  pollGamepad();

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


  if (!updatePlayer()) {
    playerDied("hazard");
    // Do NOT return here: the main animation loop must continue when hearts remain.
    // If all hearts are gone, the gameOver branch below handles stopping.
    if (gameOver) {
      draw();
      return;
    }
  }

  // Remember the latest successfully updated position. This becomes the
  // respawn point after losing a life.
  if (player.ground && Number.isFinite(player.x) && Number.isFinite(player.y) && player.y < 570) {
    lastSafeX = Math.max(100, player.x);
    lastSafeY = player.y;
  }


  if (!updateEnemies()) {
    playerDied("enemy");
    // Do NOT return here: losing a heart must not freeze the game.
    if (gameOver) {
      draw();
      return;
    }
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
    levelStart: 'Level ', nextInfo: 'Difficulty increases!', loadGame: '▶ Load Game'
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
  const loadButton = startMenu.querySelector('.load-btn');
  if (loadButton) loadButton.textContent = t.loadGame || (selectedLanguage === 'en' ? '▶ Load Game' : '▶ تحميل الحفظ');
  startMenu.querySelector('.settings-btn').textContent = t.settings;
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
    <button class="load-btn" style="display:block;width:100%;margin-top:18px;padding:17px 20px;border:0;border-radius:16px;background:#2980b9;color:#fff;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 8px 0 #1b4f72">▶ تحميل الحفظ</button>
    <button class="settings-btn" style="display:block;width:100%;margin-top:18px;padding:17px 20px;border:0;border-radius:16px;background:#27ae60;color:#fff;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 8px 0 #176b3a">${menuText[selectedLanguage].settings}</button>
    <button class="exit-btn" style="display:block;width:100%;margin-top:18px;padding:17px 20px;border:0;border-radius:16px;background:#c0392b;color:#fff;font-size:24px;font-weight:800;cursor:pointer;box-shadow:0 8px 0 #7f241b">${menuText[selectedLanguage].exit}</button>
    <div style="margin-top:18px;font-size:13px;opacity:.75">45 مراحل • 7 حيوانات • 3 أرواح</div>
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

  card.querySelector('.load-btn').addEventListener('click', () => {
    initAudio();
    soundButton();
    let data = {};
    try { data = JSON.parse(localStorage.getItem("naughtyBoySaveV3") || localStorage.getItem("naughtyBoySaveV5") || "{}"); } catch (_) {}
    const savedLevel = Math.max(1, Math.min(TOTAL_LEVELS, Number(data.level || data.completedLevel || 1)));
    currentLevel = savedLevel;
    score = Number(data.score || 0);
    coins = Number(data.coins || 0);
    lives = 3;
    gameOver = false; gameWon = false; changingLevel = false; gameRunning = false;
    loadLevel(currentLevel, true);
    updateHUD();
    startMenu.remove();
    settingsPanel.remove();
    startMenu = null; settingsPanel = null;
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

// ============================================================
// SAFE LEVEL HUD FIX
// Only removes the accidental trailing /07 from the level label.
// It does not alter gameplay, menus, settings, player, enemies,
// levels, camera, sound, or any other DOM content.
// ============================================================

(function fixAccidentalLevelSuffix() {
  function cleanLevelLabel(root) {
    if (!root) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

    const nodes = [];
    let node;

    while ((node = walker.nextNode())) {
      nodes.push(node);
    }

    for (const textNode of nodes) {
      const value = textNode.nodeValue;
      if (!value) continue;

      // Legacy cleanup for the old /15/07 label; current HUD uses /30.
      if (/^\s*(?:المرحلة\s*)?\d+\s*\/\s*15\s*\/\s*07\s*$/.test(value)) {
        textNode.nodeValue =
          value.replace(/\s*\/\s*07\s*$/, "");
      }
    }
  }

  function applyLevelText() {
    if (typeof levelElement !== "undefined" && levelElement) {
      levelElement.textContent = currentLevel + " / 45";
    }
    cleanLevelLabel(document.body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLevelText, { once: true });
  } else {
    applyLevelText();
  }

  const observer = new MutationObserver(() => {
    cleanLevelLabel(document.body);
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
})();


// ============================================================
// ADD-ON LAYER: LASER + MAIN MENU BUTTON
// Built separately so the original game systems remain untouched.
// ============================================================

(function installSafeAddons() {

  let laserPickup = null;
  let laserShots = 0;
  let laserBolts = [];
  let lastAddonLevel = null;
  let addonMainMenuButton = null;
  let addonFireButton = null;

  function languageText() {
    return selectedLanguage === "en";
  }

  function resetLaserForCurrentLevel() {
    const quarter = Math.max(500, currentLevelWidth * 0.25);

    let platformUnderPickup = null;

    if (Array.isArray(platforms)) {
      let bestDistance = Infinity;

      for (const p of platforms) {
        if (
          p.x < quarter + 100 &&
          p.x + p.width > quarter - 100
        ) {
          const distance =
            Math.abs((p.x + p.width / 2) - quarter);

          if (distance < bestDistance) {
            bestDistance = distance;
            platformUnderPickup = p;
          }
        }
      }
    }

    laserPickup = {
      x: quarter,
      y: platformUnderPickup
        ? platformUnderPickup.y - 38
        : 420,
      width: 38,
      height: 30,
      collected: false
    };

    laserShots = 0;
    laserBolts = [];
    lastAddonLevel = currentLevel;
  }

  function laserPickupCollision() {
    if (!laserPickup || laserPickup.collected) return;

    const a = player;
    const b = laserPickup;

    if (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    ) {
      laserPickup.collected = true;
      laserShots = 5;

      if (typeof soundCoin === "function") {
        soundCoin();
      } else if (typeof soundButton === "function") {
        soundButton();
      }
    }
  }

  // Expose the stable laser engine to the shop layer. The shop and the
  // original laser pickup live in separate closures, so they must communicate
  // through this small, explicit bridge instead of touching private variables.
  window.__shopLaserAddShots = function(amount) {
    laserShots = Math.max(0, Number(laserShots || 0) + Number(amount || 0));
    return laserShots;
  };
  window.__shopLaserGetShots = function() {
    return Math.max(0, Number(laserShots || 0));
  };
  window.__shopLaserFire = function() {
    fireLaser();
    return Math.max(0, Number(laserShots || 0));
  };

  function fireLaser() {
    if (
      !gameRunning ||
      gameOver ||
      gameWon ||
      laserShots <= 0
    ) {
      return;
    }

    laserShots--;

    const direction =
      player.direction >= 0 ? 1 : -1;

    laserBolts.push({
      x: player.x + (direction > 0 ? player.width - 2 : -16),
      y: player.y + 24,
      width: 18,
      height: 6,
      vx: direction * 13,
      life: 70
    });

    if (typeof playTone === "function") {
      playTone(620, 0.07, "square", 0.08, 180);
    }
  }

  function updateLaser() {

    if (!gameRunning) return;

    laserPickupCollision();

    for (let i = laserBolts.length - 1; i >= 0; i--) {

      const bolt = laserBolts[i];

      bolt.x += bolt.vx;
      bolt.life--;

      let hit = false;

      if (Array.isArray(enemies)) {

        for (let j = enemies.length - 1; j >= 0; j--) {

          const e = enemies[j];

          if (
            !e.alive ||
            bolt.x >= e.x + e.width ||
            bolt.x + bolt.width <= e.x ||
            bolt.y >= e.y + e.height ||
            bolt.y + bolt.height <= e.y
          ) {
            continue;
          }

          // Keep the original enemy hit system intact.
          if (typeof e.hits !== "number") {
            e.hits = 1;
          }

          e.hits--;

          if (e.hits <= 0) {
            e.alive = false;
            enemies.splice(j, 1);
            score += 100;
          }

          hit = true;
          break;
        }
      }

      if (
        hit ||
        bolt.life <= 0 ||
        bolt.x < cameraX - 100 ||
        bolt.x > cameraX + canvas.width + 100
      ) {
        laserBolts.splice(i, 1);
      }
    }
  }

  function drawLaser() {

    if (!gameRunning) return;

    if (laserPickup && !laserPickup.collected) {

      const x = laserPickup.x - cameraX;
      const y = laserPickup.y;

      ctx.save();

      // glow
      ctx.shadowColor = "#ff33ff";
      ctx.shadowBlur = 14;

      // laser body
      ctx.fillStyle = "#252525";
      ctx.fillRect(x, y + 7, 32, 12);

      ctx.fillStyle = "#8e44ad";
      ctx.fillRect(x + 7, y + 2, 17, 7);

      ctx.fillStyle = "#ff45ff";
      ctx.beginPath();
      ctx.arc(x + 29, y + 13, 5, 0, Math.PI * 2);
      ctx.fill();

      // handle
      ctx.fillStyle = "#444";
      ctx.fillRect(x + 10, y + 18, 9, 12);

      ctx.restore();
    }

    // laser bolts
    ctx.save();
    ctx.shadowColor = "#ff35ff";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#ff35ff";

    for (const bolt of laserBolts) {
      ctx.fillRect(
        bolt.x - cameraX,
        bolt.y,
        bolt.width,
        bolt.height
      );
    }

    ctx.restore();

    // Ammo display only after pickup.
    if (laserShots > 0) {

      ctx.save();

      ctx.fillStyle = "rgba(0,0,0,.58)";
      ctx.roundRect(
        16,
        92,
        145,
        38,
        10
      );
      ctx.fill();

      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";

      ctx.fillText(
        languageText()
          ? "🔫 Laser: " + laserShots
          : "🔫 الليزر: " + laserShots,
        27,
        117
      );

      ctx.restore();
    }
  }

  function makeMainMenuButton() {

    if (addonMainMenuButton) return;

    addonMainMenuButton =
      document.createElement("button");

    addonMainMenuButton.id =
      "safeMainMenuButton";

    addonMainMenuButton.style.cssText = `
      position:fixed;
      right:14px;
      top:14px;
      bottom:auto;
      z-index:10020;
      padding:8px 12px;
      border:0;
      border-radius:11px;
      background:rgba(18,25,32,.88);
      color:#fff;
      font:bold 13px Arial,sans-serif;
      cursor:pointer;
      box-shadow:0 4px 14px rgba(0,0,0,.28);
    `;

    addonMainMenuButton.addEventListener(
      "click",
      () => {

        if (typeof stopGame === "function") {
          stopGame();
        }

        if (addonMainMenuButton) {
          addonMainMenuButton.remove();
          addonMainMenuButton = null;
        }

        if (addonFireButton) {
          addonFireButton.remove();
          addonFireButton = null;
        }

        if (startMenu) {
          startMenu.remove();
          startMenu = null;
        }

        if (settingsPanel) {
          settingsPanel.remove();
          settingsPanel = null;
        }

        gameOver = false;
        gameWon = false;
        changingLevel = false;

        initStartScreen();
        setLanguage(selectedLanguage);
      }
    );

    document.body.appendChild(
      addonMainMenuButton
    );

    updateMainMenuButtonText();
  }

  function updateMainMenuButtonText() {
    if (!addonMainMenuButton) return;

    addonMainMenuButton.textContent =
      languageText()
        ? "⏹ Main Menu"
        : "⏹ القائمة الرئيسية";
  }

  function makeFireButton() {

    if (addonFireButton) return;

    addonFireButton =
      document.createElement("button");

    addonFireButton.id =
      "safeLaserFireButton";

    addonFireButton.style.cssText = `
      position:fixed;
      left:12px;
      bottom:12px;
      z-index:9998;
      width:58px;
      height:58px;
      border:0;
      border-radius:50%;
      background:#8e44ad;
      color:#fff;
      font-size:25px;
      cursor:pointer;
      box-shadow:0 5px 16px rgba(0,0,0,.3);
      display:none;
    `;

    addonFireButton.textContent = "🎒";

    addonFireButton.addEventListener(
      "pointerdown",
      event => {
        event.preventDefault();
        useActiveItem();
      }
    );

    document.body.appendChild(
      addonFireButton
    );
  }

  function syncButtons() {

    if (gameRunning) {
      makeMainMenuButton();
      makeFireButton();

      if (addonFireButton) {
        // The old laser button is replaced by the universal item-use button.
        addonFireButton.style.display = "none";
      }
      if (typeof updateUseButton === "function") updateUseButton();

      updateMainMenuButtonText();

    } else {

      if (addonMainMenuButton) {
        addonMainMenuButton.remove();
        addonMainMenuButton = null;
      }

      if (addonFireButton) {
        addonFireButton.remove();
        addonFireButton = null;
      }
    }
  }

  // Wrap loadLevel only after the original game is fully defined.
  // The original function remains responsible for creating the level.
  const originalLoadLevel = loadLevel;

  loadLevel = function(number, snapshotProgress = true) {

    originalLoadLevel(
      number,
      snapshotProgress
    );

    resetLaserForCurrentLevel();
  };

  // Keyboard laser: F or X.
  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "f" ||
        event.key === "F" ||
        event.key === "x" ||
        event.key === "X"
      ) {
        fireLaser();
      }
    }
  );

  // A small independent addon loop.
  // It does not replace or modify the original game loop.
  setInterval(
    () => {

      if (
        gameRunning &&
        currentLevel !== lastAddonLevel
      ) {
        resetLaserForCurrentLevel();
      }

      updateLaser();
      syncButtons();

      if (gameRunning) {
        drawLaser();
      }

    },
    30
  );

  // The first level has already been loaded by the stable game.
  resetLaserForCurrentLevel();

  // Keep the main-menu button available whenever gameplay is active.
  // This only creates the existing button; it does not alter the game loop.
  setInterval(() => {
    if (gameRunning) {
      makeMainMenuButton();
      updateMainMenuButtonText();
    }
  }, 120);

})();


/* ============================================================
   EXPANSION PACK — Power-ups, Bosses, Secrets, Stars, Timer,
   Save/Continue, Bonus Shop and Stage Challenges
   This layer is intentionally isolated from the original core.
   ============================================================ */
(function installExpansionPack() {
  if (window.__NaughtyExpansionInstalled) return;
  window.__NaughtyExpansionInstalled = true;

  const SAVE_KEY = "naughtyBoySaveV3";
  const shop = {
    shield: 25,
    laser: 30,
    flight: 35,
    invisibility: 45
  };

  let lastCompletionSavedLevel = 0;

  let expansion = {
    stageStars: 0,
    stageCoinsStart: 0,
    stageStartTime: 0,
    bonusCoins: 0,
    shield: 0,
    laserPacks: 0,
    flightPacks: 0,
    invisibilityPacks: 0,
    activeItem: null,
    activeTimedType: null,
    invincibleUntil: 0,
    invisibilityUntil: 0,
    flightUntil: 0,
    flightAltitude: 270,
    speedUntil: 0,
    jumpUntil: 0,
    powerUp: null,
    secret: null,
    boss: null,
    bossDefeated: false,
    timerVisible: true
  };

  function lang() {
    return (typeof selectedLanguage !== "undefined" && selectedLanguage === "en") ? "en" : "ar";
  }

  function t(ar, en) {
    return lang() === "en" ? en : ar;
  }

  function getStage() {
    return Math.max(1, Math.min(45, Number(
      typeof currentLevel !== "undefined" ? currentLevel : 1
    ) || 1));
  }

  function getScore() {
    return Number(typeof score !== "undefined" ? score : 0) || 0;
  }

  function getCoins() {
    return Number(typeof coins !== "undefined" ? coins : 0) || 0;
  }

  function saveProgress() {
    try {
      const old = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      const data = {
        level: Math.max(old.level || 1, getStage()),
        completedLevel: Math.max(old.completedLevel || 0, getStage()),
        coins: getCoins(),
        score: getScore(),
        shield: expansion.shield,
        bonusCoins: expansion.bonusCoins,
        stars: old.stars || {}
      };
      data.stars[getStage()] = Math.max(
        Number(data.stars[getStage()] || 0),
        expansion.stageStars
      );
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function loadProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      if (data && typeof data === "object") {
        expansion.shield = Number(data.shield || 0);
        expansion.bonusCoins = Number(data.bonusCoins || 0);
        return data;
      }
    } catch (_) {}
    return {};
  }

  function stageDifficulty() {
    return 0.40 + ((getStage() - 1) / 44) * 0.60;
  }

  function announce(text) {
    const old = document.getElementById("expansionToast");
    if (old) old.remove();

    const el = document.createElement("div");
    el.id = "expansionToast";
    el.textContent = text;
    el.style.cssText = `
      position:fixed;left:50%;top:18%;transform:translateX(-50%);
      z-index:10001;background:rgba(15,20,30,.92);color:white;
      padding:12px 18px;border-radius:14px;font-weight:800;
      box-shadow:0 8px 30px rgba(0,0,0,.35);text-align:center;
      pointer-events:none;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  function addStyle() {
    if (document.getElementById("expansionStyle")) return;
    const style = document.createElement("style");
    style.id = "expansionStyle";
    style.textContent = `
      #score{display:none!important;}
      #laserControl{display:none!important;}
      #expansionHud {
        position:fixed;left:12px;top:112px;z-index:9998;
        display:flex;gap:7px;flex-wrap:wrap;max-width:48%;
        font:700 13px system-ui,sans-serif;pointer-events:none;
      }
      #expansionHud span {
        background:rgba(15,20,30,.78);color:#fff;
        padding:6px 9px;border-radius:10px;
        box-shadow:0 3px 12px rgba(0,0,0,.22);
      }
      #expansionShop {
        position:fixed;inset:0;z-index:10003;
        display:none;align-items:center;justify-content:center;
        background:rgba(0,0,0,.65);padding:20px;
      }
      #expansionShop .box {
        width:min(430px,92vw);background:#fff;border-radius:20px;
        padding:20px;text-align:center;box-shadow:0 20px 70px rgba(0,0,0,.4);
      }
      #expansionShop button {
        width:100%;margin:6px 0;padding:11px;border:0;border-radius:12px;
        font-weight:800;cursor:pointer;
      }
      #nbStoreButton, #nbUseButton {
        position:fixed;top:12px;z-index:10002;width:50px;height:50px;border:0;border-radius:15px;
        background:linear-gradient(145deg,rgba(20,28,38,.96),rgba(5,10,16,.94));color:#fff;
        font-size:24px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.30);
        border:1px solid rgba(255,255,255,.16);transition:transform .15s ease,filter .15s ease;
      }
      #nbStoreButton:hover, #nbUseButton:hover { transform:translateY(-1px) scale(1.04); filter:brightness(1.12); }
      #nbStoreButton { right:72px; }
      #nbUseButton { right:128px; display:none; }
      @media (max-width:700px) and (pointer:coarse){
        #nbStoreButton, #nbUseButton { display:none !important; }
      }
      #nbPowerTimer {
        position:fixed; z-index:10002; display:none; min-width:86px; height:34px;
        padding:6px 10px; border-radius:12px; background:rgba(15,20,30,.92); color:#fff;
        font:900 14px system-ui,sans-serif; text-align:center; box-shadow:0 5px 16px rgba(0,0,0,.25);
        border:1px solid rgba(255,255,255,.15); pointer-events:none;
      }
      #expansionShop .box { font-family:system-ui,Segoe UI,Arial,sans-serif; }
      #expansionShop h2 { font-size:28px; margin:2px 0 8px; font-weight:900; }
      #expansionShop p { font-size:16px; font-weight:800; margin:0 0 12px; }
      #expansionShop button[data-buy] {
        background:linear-gradient(135deg,#f7f9fc,#e8eef7); color:#18202a;
        border:1px solid #d5dce6; font-size:16px; min-height:48px; text-align:right; padding:12px 15px;
      }
      #expansionShop button[data-buy]:hover { filter:brightness(.97); transform:translateY(-1px); }
      #expansionShop button[data-close] { background:#263238; color:#fff; font-size:16px; }
      @media(max-width:700px){ #nbStoreButton{right:68px} #nbUseButton{right:122px} #nbPowerTimer{right:178px;bottom:86px;top:auto} }
      @media(min-width:701px){ #nbPowerTimer{right:188px;bottom:88px;top:auto} }
      .expansionTouch {
        position:fixed;bottom:70px;z-index:9999;border:0;border-radius:50%;
        width:48px;height:48px;font-size:20px;background:rgba(20,25,35,.82);
        color:#fff;display:none;
      }
    `;
    document.head.appendChild(style);
  }

  function addHud() {
    if (document.getElementById("expansionHud")) return;
    const hud = document.createElement("div");
    hud.id = "expansionHud";
    hud.innerHTML = ``;
    document.body.appendChild(hud);
  }

  function getWallet() { return getCoins(); }

  function saveShopState() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      data.shopInventory = { shield: expansion.shield, laser: expansion.laserPacks, laserShots: Number(typeof laserShots !== 'undefined' ? laserShots : 0), flight: expansion.flightPacks, invisibility: expansion.invisibilityPacks };
      data.shopActive = expansion.activeItem;
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function loadShopState() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      const inv = data.shopInventory || {};
      expansion.shield = Number(inv.shield || data.shield || 0);
      expansion.laserPacks = Number(inv.laser || 0);
      if (typeof laserShots !== 'undefined') laserShots = Number(inv.laserShots || 0);
      expansion.flightPacks = Number(inv.flight || inv.star || 0);
      expansion.invisibilityPacks = Number(inv.invisibility || 0);
      expansion.activeItem = data.shopActive || null;
    } catch (_) {}
  }

  function ensureTopButtons() {
    if (!document.getElementById('nbStoreButton')) {
      const b = document.createElement('button'); b.id='nbStoreButton'; b.type='button'; b.textContent='🛒'; b.title=t('المتجر','Shop');
      b.onclick=()=>{ try{initAudio();}catch(_){} openShop(); }; document.body.appendChild(b);
    }
    if (!document.getElementById('nbUseButton')) {
      const b = document.createElement('button'); b.id='nbUseButton'; b.type='button'; b.title=t('استخدام العنصر','Use item');
      b.onclick=(ev)=>{ev.preventDefault();ev.stopPropagation();useActiveItem();}; b.addEventListener('pointerdown',(ev)=>{ev.preventDefault();ev.stopPropagation();}); document.body.appendChild(b);
    }
    if (!document.getElementById('nbPowerTimer')) {
      const timer = document.createElement('div'); timer.id='nbPowerTimer'; timer.setAttribute('aria-live','polite');
      document.body.appendChild(timer);
    }
    updateUseButton(); updatePowerTimer();
  }

  function updateUseButton() {
    const b=document.getElementById('nbUseButton'); if(!b) return;
    const icons={shield:'🛡️',laser:'🔫',flight:'✈️',invisibility:'👻'};
    const counts={
      shield: expansion.shield,
      laser: Math.max(Number(expansion.laserPacks || 0), Number(typeof laserShots !== 'undefined' ? laserShots : 0)),
      flight: expansion.flightPacks,
      invisibility: expansion.invisibilityPacks
    };
    const active=expansion.activeItem && counts[expansion.activeItem]>0 ? expansion.activeItem : null;
    b.style.display=(typeof gameRunning!=='undefined' && gameRunning && active)?'block':'none';
    b.textContent=active?icons[active]:'🎒';
    b.title=active?t('استخدام العنصر','Use item'):t('لا يوجد عنصر','No item');
    b.setAttribute('aria-label', active ? t('استخدام العنصر','Use item') : t('لا يوجد عنصر','No item'));
  }

  function updatePowerTimer() {
    const el=document.getElementById('nbPowerTimer');
    if(!el) return;
    const now=Date.now();
    let until=0, icon='', label='';
    if(now < Number(expansion.invisibilityUntil||0)) { until=Number(expansion.invisibilityUntil); icon='👻'; label=t('اختفاء','Invisible'); }
    else if(now < Number(expansion.flightUntil||0)) { until=Number(expansion.flightUntil); icon='✈️'; label=t('طيران','Flight'); }
    else if(now < Number(expansion.invincibleUntil||0)) { until=Number(expansion.invincibleUntil); icon='🛡️'; label=t('درع','Shield'); }
    if(until>now) {
      const sec=Math.ceil((until-now)/1000);
      el.textContent=icon+' '+sec+'s';
      el.title=label; el.style.display='block';
    } else { el.style.display='none'; expansion.activeTimedType=null; }
  }

  function useActiveItem() {
    const type=expansion.activeItem;
    if(!type) return;

    if(type==='laser'){
      // Use the real laser engine from the original laser add-on.
      // A pack is converted into 5 real shots only when the current magazine is empty.
      if (!gameRunning || gameOver || gameWon) return;
      let shots = typeof window.__shopLaserGetShots === 'function'
        ? window.__shopLaserGetShots() : 0;
      if (shots <= 0 && Number(expansion.laserPacks || 0) > 0) {
        expansion.laserPacks--;
        shots = typeof window.__shopLaserAddShots === 'function'
          ? window.__shopLaserAddShots(5) : 0;
      }
      if (shots <= 0) {
        expansion.activeItem = null;
        updateUseButton();
        saveShopState();
        return;
      }
      if (typeof window.__shopLaserFire === 'function') {
        window.__shopLaserFire();
      }
      shots = typeof window.__shopLaserGetShots === 'function'
        ? window.__shopLaserGetShots() : 0;
      if (shots <= 0 && Number(expansion.laserPacks || 0) <= 0) expansion.activeItem = null;
      saveShopState();
      updateUseButton();
      return;
    }

    const count=type==='shield'?expansion.shield:type==='flight'?expansion.flightPacks:expansion.invisibilityPacks;
    if(count<=0){ expansion.activeItem=null; updateUseButton(); return; }

    if(type==='shield'){
      // One purchased shield activates full protection for 10 seconds.
      // It is consumed on activation, not on the first enemy hit.
      expansion.invincibleUntil=Date.now()+10000;
      expansion.activeTimedType='shield';
      expansion.shield--;
    }
    if(type==='flight'){
      expansion.flightUntil=Date.now()+10000;
      expansion.activeTimedType='flight';
      expansion.flightPacks--;
      expansion.flightAltitude=270;
    }
    if(type==='invisibility'){
      expansion.invisibilityUntil=Date.now()+5000;
      expansion.activeTimedType='invisibility';
      expansion.invisibilityPacks--;
    }

    if((type==='shield'&&expansion.shield<=0)||(type==='flight'&&expansion.flightPacks<=0)||(type==='invisibility'&&expansion.invisibilityPacks<=0)) expansion.activeItem=null;
    saveShopState();
    updateUseButton();
    updatePowerTimer();
    announce(type==='flight' ? t('✈️ الطيران مفعل لمدة 10 ثوانٍ!','✈️ Flight active for 10 seconds!') : t('تم استخدام العنصر!','Item used!'));
  }

  function addShop() {
    if (document.getElementById("expansionShop")) return;
    ensureTopButtons();
    const wrap = document.createElement("div");
    wrap.id = "expansionShop";
    wrap.innerHTML = `
      <div class="box">
        <h2 id="shopTitle"></h2>
        <p id="shopCoins"></p>
        <button data-buy="shield"></button>
        <button data-buy="laser"></button>
        <button data-buy="flight"></button>
        <button data-buy="invisibility"></button>
        <button data-close></button>
      </div>`;
    document.body.appendChild(wrap);
    wrap.querySelector("[data-close]").onclick = () => wrap.style.display = "none";
    wrap.querySelectorAll("[data-buy]").forEach(btn => {
      btn.onclick = () => {
        const type=btn.dataset.buy, cost=shop[type];
        if(getWallet()<cost){ announce(t("العملات غير كافية","Not enough coins")); return; }
        coins-=cost;
        if(type==='shield') expansion.shield++;
        if(type==='laser') {
          expansion.laserPacks++;
          if (typeof window.__shopLaserAddShots === 'function') window.__shopLaserAddShots(5);
        }
        if(type==='flight') expansion.flightPacks++;
        if(type==='invisibility') expansion.invisibilityPacks++;
        expansion.activeItem=type;
        updateHUD(); saveShopState(); updateShopText(); updateUseButton();
        announce(t("تم الشراء! اضغط زر الاستخدام 🛒","Purchased! Press the use button."));
      };
    });
    updateShopText();
  }

  function updateShopText() {
    const box=document.getElementById("expansionShop"); if(!box) return;
    box.querySelector("#shopTitle").textContent=t("🛒 المتجر","🛒 Shop");
    box.querySelector("#shopCoins").textContent=t(`عملاتك: ${getWallet()}`,`Your coins: ${getWallet()}`);
    const labels={
      shield:t("🛡️ درع 10 ثوانٍ — 25 عملة","🛡️ Shield 10s — 25 coins"),
      laser:t("🔫 5 طلقات ليزر — 30 عملة","🔫 5 Laser shots — 30 coins"),
      flight:t("✈️ طيران 10 ثوانٍ — 35 عملة","✈️ Flight 10s — 35 coins"),
      invisibility:t("👻 اختفاء 5 ثوانٍ — 45 عملة","👻 Invisibility 5s — 45 coins")
    };
    box.querySelectorAll("[data-buy]").forEach(b=>b.textContent=labels[b.dataset.buy]);
    box.querySelector("[data-close]").textContent=t("إغلاق","Close");
  }

  function openShop() {
    addShop();
    updateShopText();
    document.getElementById("expansionShop").style.display = "flex";
  }

  function updateHud() {
    addHud();
    const stage = getStage();
    const elapsed = Math.max(0, (Date.now() - expansion.stageStartTime) / 1000);
    const remaining = Math.max(0, 30 - elapsed);
    const min = Math.floor(remaining / 60);
    const sec = Math.floor(remaining % 60);
    updateUseButton();
    updatePowerTimer();
  }

  function resetStageExtras() {
    expansion.stageCoinsStart = getCoins();
    expansion.stageStartTime = Date.now();
    expansion.stageStars = 0;
    expansion.invincibleUntil = 0;
    expansion.invisibilityUntil = 0;
    expansion.flightUntil = 0;
    expansion.flightAltitude = 270;
    expansion.activeTimedType = null;
    expansion.speedUntil = 0;
    expansion.jumpUntil = 0;
    expansion.bossDefeated = false;

    const width = Number(typeof levelWidth !== "undefined" ? levelWidth : 30000) || 30000;
    expansion.powerUp = {
      type: getStage() % 4 === 0 ? "flight" :
            getStage() % 3 === 0 ? "shield" :
            getStage() % 2 === 0 ? "speed" : "jump",
      x: Math.floor(width * 0.48),
      y: 480,
      collected: false
    };

    expansion.secret = {
      x: Math.floor(width * 0.66),
      y: 0,
      found: false
    };

    // Bosses on every fifth stage.
    expansion.boss = [5,10,15,20,25,30,35,40,45].includes(getStage()) ? {
      x: Math.floor(width * 0.91),
      y: 430,
      w: 95,
      h: 120,
      hp: getStage() === 45 ? 12 : 7,
      maxHp: getStage() === 45 ? 12 : 7,
      active: true
    } : null;

    updateHud();
  }

  function drawExtras() {
    if (typeof ctx === "undefined" || typeof cameraX === "undefined") return;

    const p = expansion.powerUp;
    if (p && !p.collected) {
      const x = p.x - cameraX, y = p.y;
      ctx.save();
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        p.type === "flight" ? "✈️" :
        p.type === "shield" ? "🛡️" :
        p.type === "speed" ? "⚡" : "🦘",
        x, y
      );
      ctx.restore();
    }

    if (Date.now() < Number(expansion.flightUntil || 0) && typeof player !== "undefined") {
      const altitude = Number(expansion.flightAltitude || 270);
      if (player.y > altitude) player.y = altitude;
      player.vy = 0;
      player.ground = false;
    }

    const s = expansion.secret;
    if (s && !s.found) {
      const x = s.x - cameraX;
      ctx.save();
      ctx.font = "25px sans-serif";
      ctx.fillText("❓", x, 230);
      ctx.restore();
    }

    if (Date.now() < Number(expansion.flightUntil || 0) && typeof player !== "undefined") {
      ctx.save();
      ctx.font = "42px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✈️", (player.x - cameraX) + player.width/2, player.y + player.height + 18);
      ctx.restore();
    }

    if (Date.now() < (expansion.invisibilityUntil || 0)) {
      ctx.save(); ctx.globalAlpha=0.28; ctx.fillStyle='#b8eaff';
      ctx.beginPath(); ctx.arc((player.x-cameraX)+player.width/2, player.y+player.height/2, 30, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }

    const b = expansion.boss;
    if (b && b.active) {
      const x = b.x - cameraX;
      ctx.save();
      ctx.font = "70px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(getStage() === 45 ? "👹" : "🐲", x + b.w/2, b.y + 75);
      ctx.fillStyle = "#222";
      ctx.fillRect(x, b.y - 16, b.w, 8);
      ctx.fillStyle = "#e53935";
      ctx.fillRect(x, b.y - 16, b.w * (b.hp / b.maxHp), 8);
      ctx.restore();
    }
  }

  function updateExtras() {
    if (typeof gameRunning !== "undefined" && !gameRunning) return;

    updateHud();

    const p = expansion.powerUp;
    if (p && !p.collected && typeof player !== "undefined") {
      if (Math.abs((player.x + player.width/2) - p.x) < 42 &&
          Math.abs((player.y + player.height/2) - p.y) < 60) {
        p.collected = true;
        if (p.type === "flight") { expansion.flightUntil = Date.now() + 10000; expansion.activeTimedType = "flight"; expansion.flightAltitude = 270; }
        if (p.type === "shield") expansion.shield++;
        if (p.type === "speed") expansion.speedUntil = Date.now() + 15000;
        if (p.type === "jump") expansion.jumpUntil = Date.now() + 15000;
        expansion.stageStars = Math.max(expansion.stageStars, 1);
        announce(
          p.type === "flight" ? t("✈️ حصلت على الطيران!", "✈️ Flight acquired!") :
          p.type === "shield" ? t("🛡️ حصلت على درع!", "🛡️ Shield acquired!") :
          p.type === "speed" ? t("⚡ سرعة إضافية!", "⚡ Speed boost!") :
          t("🦘 قفزة عالية!", "🦘 High jump!")
        );
      }
    }

    const s = expansion.secret;
    if (s && !s.found && typeof player !== "undefined") {
      if (Math.abs((player.x + player.width/2) - s.x) < 50 &&
          player.y < 300) {
        s.found = true;
        expansion.stageStars = Math.max(expansion.stageStars, 2);
        expansion.bonusCoins += 10;
        announce(t("💎 منطقة سرية! +10 عملات", "💎 Secret area! +10 coins"));
      }
    }

    if (Date.now() < (expansion.invisibilityUntil || 0)) {
      ctx.save(); ctx.globalAlpha=0.28; ctx.fillStyle='#b8eaff';
      ctx.beginPath(); ctx.arc((player.x-cameraX)+player.width/2, player.y+player.height/2, 30, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }

    const b = expansion.boss;
    if (b && b.active && typeof player !== "undefined") {
      const near = Math.abs((player.x + player.width/2) - (b.x + b.w/2)) < 300;
      if (near && typeof laserBolts !== "undefined") {
        for (let i = laserBolts.length - 1; i >= 0; i--) {
          const bolt = laserBolts[i];
          if (bolt.x < b.x + b.w && bolt.x + (bolt.width || 0) > b.x &&
              bolt.y < b.y + b.h && bolt.y + (bolt.height || 0) > b.y) {
            b.hp--;
            laserBolts.splice(i, 1);
            if (b.hp <= 0) {
              b.active = false;
              b.active = false;
              expansion.bossDefeated = true;
              expansion.stageStars = 3;
              expansion.bonusCoins += 25;
              announce(t("🏆 هزمت الزعيم! +25 عملة", "🏆 Boss defeated! +25 coins"));
            }
          }
        }
      }
    }

    // Award stage stars based on clean completion conditions.
    if (typeof levelComplete !== "undefined" && levelComplete && lastCompletionSavedLevel !== getStage()) {
      const elapsed = (Date.now() - expansion.stageStartTime) / 1000;
      if (elapsed <= 30) expansion.stageStars = Math.max(expansion.stageStars, 1);
      if (getCoins() - expansion.stageCoinsStart >= 20) expansion.stageStars = Math.max(expansion.stageStars, 2);
      if (expansion.boss && expansion.bossDefeated) expansion.stageStars = 3;
      saveProgress();
      lastCompletionSavedLevel = getStage();
    }
  }

  // Save a little extra currency for the shop without altering the original coin counter.
  function syncShopCoins() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      data.shopCoins = Number(data.shopCoins || 0) + expansion.bonusCoins;
      expansion.bonusCoins = 0;
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  // Damage protection: only intercept if the core exposes a common damage function.
  const damageNames = ["hurtPlayer", "takeDamage", "damagePlayer", "hitPlayer"];
  damageNames.forEach(name => {
    if (typeof window[name] === "function" && !window[name].__expWrapped) {
      const original = window[name];
      const wrapped = function(...args) {
        // Timed protection is authoritative: do not forward damage at all.
        if (Date.now() < Number(expansion.invincibleUntil || 0) ||
            Date.now() < Number(expansion.invisibilityUntil || 0)) return;
        return original.apply(this, args);
      };
      wrapped.__expWrapped = true;
      window[name] = wrapped;
    }
  });

  // Input: P opens the shop. E uses the currently selected item.
  document.addEventListener("keydown", e => {
    if (e.key === "p" || e.key === "P") { if (typeof gameRunning !== 'undefined' && gameRunning) openShop(); }
    if (e.key === "e" || e.key === "E") useActiveItem();
    if (e.key === "Escape") { const sh=document.getElementById("expansionShop"); if(sh) sh.style.display="none"; }
  });

  // Lightweight wrappers around level loading and drawing.
  const originalLoadLevel = typeof window.loadLevel === "function" ? window.loadLevel : null;
  if (originalLoadLevel && !originalLoadLevel.__expWrapped) {
    const wrappedLoad = function(...args) {
      const result = originalLoadLevel.apply(this, args);
      resetStageExtras();
      return result;
    };
    wrappedLoad.__expWrapped = true;
    window.loadLevel = wrappedLoad;
  }

  const originalDraw = typeof window.draw === "function" ? window.draw : null;
  if (originalDraw && !originalDraw.__expWrapped) {
    const wrappedDraw = function(...args) {
      const result = originalDraw.apply(this, args);
      drawExtras();
      return result;
    };
    wrappedDraw.__expWrapped = true;
    window.draw = wrappedDraw;
  }

  addStyle();
  addHud();
  addShop();
  loadProgress();
  loadShopState();
  ensureTopButtons();

  // Keep the use button and active-power timer responsive independently of the
  // game's render loop. This also guarantees the countdown remains visible.
  setInterval(() => {
    if (typeof gameRunning !== 'undefined' && gameRunning) {
      updateUseButton();
      updatePowerTimer();
    }
  }, 100);

  // Start extras after the original game has initialized.
  setTimeout(() => {
    resetStageExtras();
    updateShopText();
    updateUseButton();
    updatePowerTimer();
  }, 250);
  // Public bridges for mobile/desktop controls. These keep the expansion
  // inventory private while allowing the touch UI to invoke it safely.
  window.__nbShopOpen = openShop;
  window.__nbShopUse = useActiveItem;
  window.__nbShopGetActive = function(){
    const type = expansion.activeItem;
    if(!type) return null;
    const has = type==='shield' ? expansion.shield>0 :
                type==='laser' ? (expansion.laserPacks>0 || (typeof window.__shopLaserGetShots==='function' && window.__shopLaserGetShots()>0)) :
                type==='flight' ? expansion.flightPacks>0 :
                type==='invisibility' ? expansion.invisibilityPacks>0 : false;
    return has ? type : null;
  };

})();


/* ============================================================
   LITERAL SMART AI / MOVING HAZARDS PATCH
   Uses the real enemy and level objects already in the game.
   ============================================================ */
(function installLiteralSmartGameplay(){
  if (window.__LiteralSmartGameplayInstalled) return;
  window.__LiteralSmartGameplayInstalled = true;

  let aiProjectiles = [];
  let movingPlatforms = [];
  let movingHazards = [];
  let fallingRocks = [];
  let collapsingBridges = [];
  let lastLevelForAI = -1;
  let enemyHome = new WeakMap();

  function diff(){ return 0.40 + ((currentLevel - 1) / 44) * 0.60; }
  function rect(o){ return {x:o.x,y:o.y,width:o.width||o.w,height:o.height||o.h}; }
  function hit(a,b){ return intersects(rect(a),rect(b)); }
  function playerHit(o){ return player && hit(player,o); }

  function resetLiteralAI(){
    aiProjectiles=[]; movingPlatforms=[]; movingHazards=[]; fallingRocks=[]; collapsingBridges=[];
    enemyHome = new WeakMap();
    lastLevelForAI=currentLevel;
    const d=diff(), width=currentLevelWidth||30000;

    // Give every real enemy a distinct intelligence behavior.
    enemies.forEach((e,i)=>{
      e._aiType = ["chaser","ambush","jumper","shooter","barrierJumper","fast","hunter"][i%7];
      e._aiHomeX=e.x; e._aiHomeY=e.y; e._aiVY=0;
      e._aiHidden=false; e._aiAttack=50+i*18; e._aiShoot=80+i*25;
      e._aiJump=45+i*15; e._aiLastX=e.x;
      enemyHome.set(e,{x:e.x,y:e.y});
    });

    // Moving platforms: real collision platforms are added here.
    const count=3+Math.floor(d*3);
    for(let i=0;i<count;i++){
      const x=Math.floor(width*(0.22+i*0.18));
      const p={x,y:390-(i%2)*45,width:150,height:20,_baseY:390-(i%2)*45,_phase:i*1.7,_moving:true};
      movingPlatforms.push(p);
      platforms.push(p);
    }

    // Collapsing bridges are real platforms until they fall.
    const bridgeCount=2+Math.floor(d*2);
    for(let i=0;i<bridgeCount;i++){
      const x=Math.floor(width*(0.34+i*0.20));
      const b={x,y:500,width:210,height:22,_bridge:true,_timer:0,_falling:false,_baseX:x};
      collapsingBridges.push(b); platforms.push(b);
    }

    // Animated crocodiles and whales are placed above existing rivers.
    const waterList=hazards||[];
    waterList.forEach((h,i)=>{
      movingHazards.push({
        kind:h.kind,
        x:h.x+h.width*0.5,
        baseY:h.y+6,
        y:h.y+6,
        width:h.kind==='whale'?90:78,
        height:42,
        phase:h.phase||i,
        timer:70+i*25,
        visible:false,
        source:h
      });
    });

    // Extra falling rocks, clearly triggered by approaching the danger zone.
    const rockCount=2+Math.floor(d*4);
    for(let i=0;i<rockCount;i++){
      fallingRocks.push({
        x:Math.floor(width*(0.18+i*0.15)), y:-80, width:38,height:38,
        vy:0,triggered:false,active:true
      });
    }
  }

  function shootAtPlayer(e){
    const dir=player.x<e.x?-1:1;
    aiProjectiles.push({x:e.x+e.width/2,y:e.y+18,width:15,height:7,vx:dir*(5+diff()*4),life:160});
    if(typeof playTone==='function') playTone(760,0.045,"square",0.035,-180);
  }

  function updateLiteralEnemies(){
    const d=diff();
    for(const e of enemies){
      if(!e.alive) continue;
      const dist=player.x-e.x;
      const ad=Math.abs(dist);

      if(e._aiType==="chaser" || e._aiType==="hunter"){
        if(ad<850){
          e.direction=dist<0?-1:1;
          const speed=e._aiType==="hunter"?(2.8+d*3.2):(1.8+d*2.4);
          e.x += e.direction*speed;
        }
      }

      if(e._aiType==="ambush"){
        // Hide until the player gets close, then charge.
        if(ad>330){
          e._aiHidden=true;
          e.x=e._aiHomeX;
        }else{
          if(e._aiHidden){e._aiHidden=false;e._aiAttack=35;}
          e._aiAttack--;
          e.direction=dist<0?-1:1;
          e.x += e.direction*(e._aiAttack<=0?3.8+d*2.5:1.2);
        }
      }

      if(e._aiType==="jumper" || e._aiType==="barrierJumper"){
        e._aiJump--;
        if(e._aiJump<=0 && Math.abs(e.vy||0)<0.5){
          e.vy=-(8+d*3.5);
          e._aiJump=Math.max(38,95-d*38);
        }
        e.vy=(e.vy||0)+0.34;
        e.y+=e.vy;
        const ground=e._aiHomeY;
        if(e.y>=ground){e.y=ground;e.vy=0;}
        if(e._aiType==="barrierJumper" && ad<700){
          e.direction=dist<0?-1:1;e.x+=e.direction*(2+d*2);
        }
      }

      if(e._aiType==="shooter"){
        if(ad<1000){
          e._aiShoot--;
          if(e._aiShoot<=0){shootAtPlayer(e);e._aiShoot=Math.max(42,110-d*55);}
        }
      }

      if(e._aiType==="fast"){
        if(ad<1200){e.direction=dist<0?-1:1;e.x+=e.direction*(4+d*5.5);}
      }

      // Keep enemies inside their original platform area where possible.
      if(typeof e.minX==="number") e.x=Math.max(e.minX-80,Math.min(e.maxX+80,e.x));
    }

    for(let i=aiProjectiles.length-1;i>=0;i--){
      const q=aiProjectiles[i];q.x+=q.vx;q.life--;
      if(q.life<=0){aiProjectiles.splice(i,1);continue;}
      if(playerHit(q)){aiProjectiles.splice(i,1);playerDied();return;}
    }
  }

  function updateLiteralHazards(){
    const d=diff(), now=performance.now();

    for(const p of movingPlatforms){
      p._phase+=0.025+d*0.012;
      p.y=p._baseY+Math.sin(p._phase)*75;
      if(playerHit(p) && player.vy>=0 && player.y+player.height<=p.y+18){
        player.y=p.y-player.height;player.vy=0;player.ground=true;
      }
    }

    for(const b of collapsingBridges){
      if(!b._falling && player.x>b.x-100 && player.x<b.x+b.width+100){
        b._timer++;
        if(b._timer>Math.max(22,55-d*25)){
          b._falling=true;
          const idx=platforms.indexOf(b);if(idx>=0)platforms.splice(idx,1);
        }
      }
      if(b._falling){b.y+=5+d*3;if(playerHit(b))playerDied();}
    }

    for(const h of movingHazards){
      h.timer--;
      if(h.kind==='crocodile'){
        // Repeatedly submerge and surface. It is NOT permanently visible.
        if(h.timer<=0){h.visible=!h.visible;h.timer=h.visible?90:75;}
        h.y=h.baseY+(h.visible?Math.sin(now/180+h.phase)*3:28);
      }else{
        // Whale waits below water, then makes a real jump and falls back.
        if(h.timer<=0){h.timer=170-d*45;h.phase=0;}
        h.phase+=0.09;
        const s=Math.sin(h.phase);
        h.visible=s>0;
        h.y=h.baseY-(h.visible?s*(125+d*65):-18);
      }
    }

    for(const r of fallingRocks){
      if(!r.active)continue;
      if(!r.triggered && player.x>r.x-420){r.triggered=true;r.vy=1;}
      if(r.triggered){r.vy+=0.35;r.y+=r.vy;if(r.y>600)r.active=false;if(playerHit(r)){playerDied();return;}}
    }
  }

  function drawLiteralFeatures(){
    if(typeof ctx==="undefined") return;

    ctx.save();
    ctx.textAlign='center';

    // Only draw things that do not already have a renderer in the core:
    // projectiles, animated water animals and falling rocks.
    for(const q of aiProjectiles){
      const x=q.x-cameraX;
      ctx.fillStyle='#ff6b00';
      ctx.shadowColor='#ff9d00';
      ctx.shadowBlur=9;
      ctx.beginPath();
      ctx.arc(x,q.y+3,6,0,Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur=0;

    for(const h of movingHazards){
      if(!h.visible) continue;

      const x=h.x-cameraX;

      if(h.kind==='crocodile'){
        const y=h.y;
        ctx.save();

        // A clean cartoon crocodile emerging from the water.
        ctx.fillStyle='#3f8f3b';
        ctx.beginPath();
        ctx.roundRect(x-52,y+8,104,23,9);
        ctx.fill();

        ctx.fillStyle='#72b95c';
        ctx.beginPath();
        ctx.ellipse(x-26,y+8,13,9,0,0,Math.PI*2);
        ctx.ellipse(x+26,y+8,13,9,0,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle='#fff';
        ctx.beginPath();
        ctx.arc(x-24,y+5,4,0,Math.PI*2);
        ctx.arc(x+24,y+5,4,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle='#111';
        ctx.beginPath();
        ctx.arc(x-24,y+5,2,0,Math.PI*2);
        ctx.arc(x+24,y+5,2,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle='#fff9dc';
        for(let tooth=-3;tooth<=3;tooth++){
          ctx.beginPath();
          ctx.moveTo(x+tooth*12,y+27);
          ctx.lineTo(x+tooth*12+4,y+27);
          ctx.lineTo(x+tooth*12+2,y+34);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      } else {
        const y=h.y;

        ctx.save();
        ctx.fillStyle='#3e79ad';
        ctx.beginPath();
        ctx.ellipse(x,y+18,42,17,0,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle='#6ca6d3';
        ctx.beginPath();
        ctx.ellipse(x-12,y+13,16,7,0,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle='#3e79ad';
        ctx.beginPath();
        ctx.moveTo(x-28,y+12);
        ctx.quadraticCurveTo(x-44,y-4,x-34,y-15);
        ctx.quadraticCurveTo(x-25,y-5,x-18,y+10);
        ctx.fill();

        ctx.fillStyle='#fff';
        ctx.beginPath();
        ctx.arc(x+27,y+13,3,0,Math.PI*2);
        ctx.fill();

        ctx.fillStyle='#111';
        ctx.beginPath();
        ctx.arc(x+28,y+13,1.5,0,Math.PI*2);
        ctx.fill();

        ctx.strokeStyle='rgba(255,255,255,.8)';
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.moveTo(x-2,y+2);
        ctx.quadraticCurveTo(x-5,y-18,x+2,y-28);
        ctx.stroke();

        ctx.restore();
      }
    }

    for(const r of fallingRocks){
      if(!r.active) continue;
      const x=r.x-cameraX;
      ctx.save();
      ctx.font='34px sans-serif';
      ctx.fillText('🪨',x+19,r.y+30);
      ctx.restore();
    }

    ctx.restore();
  }

  // Hide only ambush enemies while they are actually hidden.
  // The original renderer is preserved for every other enemy.
  const originalDrawEnemies=drawEnemies;
  drawEnemies=function(){
    const hidden=[];
    for(const e of enemies){
      if(e._aiHidden && e.alive){
        hidden.push(e);
        e._drawHidden=true;
      }
    }

    for(const e of hidden) e.alive=false;
    originalDrawEnemies();
    for(const e of hidden){
      e.alive=true;
      e._drawHidden=false;
    }
  };

  // Reset after every real level load.
  const oldReset=smartResetStage;
  smartResetStage=function(){
    if(typeof oldReset==='function') oldReset();
    resetLiteralAI();
  };

  // The original loop already calls these names. Replace only the behavior functions.
  updateSmartEnemies=function(){updateLiteralEnemies();};
  updateSmartObstacles=function(){updateLiteralHazards();};
  drawSmartFeatures=function(){drawLiteralFeatures();};

  // First level may already be loaded.
  setTimeout(()=>{if(lastLevelForAI!==currentLevel)resetLiteralAI();},50);
})();


/* ============================================================
   VISUAL OVERHAUL — reference-style cartoon platformer
   This changes presentation only; collision/world data stays intact.
   ============================================================ */
(function installReferenceVisuals() {
  if (window.__ReferenceVisualsInstalled) return;
  window.__ReferenceVisualsInstalled = true;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // ---------- Background ----------
  drawMountains = function() {
    const layers = [
      { color: "#b7d9cd", base: 555, peak: 155, step: 550, parallax: 0.12 },
      { color: "#6da58c", base: 575, peak: 205, step: 470, parallax: 0.20 },
      { color: "#4e8f72", base: 590, peak: 270, step: 390, parallax: 0.30 }
    ];

    layers.forEach((m, layer) => {
      const offset = -((cameraX * m.parallax) % m.step);
      for (let i = -2; i < 8; i++) {
        const x = offset + i * m.step;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.moveTo(x, m.base);
        ctx.lineTo(x + m.step * .50, m.peak + layer * 20);
        ctx.lineTo(x + m.step, m.base);
        ctx.closePath();
        ctx.fill();

        // snow/soft highlight on distant peaks
        if (layer === 0) {
          ctx.fillStyle = "rgba(255,255,255,.28)";
          ctx.beginPath();
          ctx.moveTo(x + m.step*.50, m.peak);
          ctx.lineTo(x + m.step*.40, m.peak+48);
          ctx.lineTo(x + m.step*.50, m.peak+34);
          ctx.lineTo(x + m.step*.60, m.peak+48);
          ctx.closePath();
          ctx.fill();
        }
      }
    });
  };

  drawGrassWorld = function() {
    // distant rolling hills
    ctx.fillStyle = "#74a98d";
    ctx.beginPath();
    ctx.moveTo(0, 560);
    for (let x = -40; x <= canvas.width + 80; x += 100) {
      ctx.quadraticCurveTo(x + 50, 500 + (x/100 % 2) * 22, x + 100, 560);
    }
    ctx.lineTo(canvas.width, 650);
    ctx.lineTo(0, 650);
    ctx.closePath();
    ctx.fill();

    // foreground grass strip
    ctx.fillStyle = "#4e946f";
    ctx.fillRect(0, 555, canvas.width, 95);

    // repeating grass tufts
    for (let i = -2; i < 28; i++) {
      const x = i * 58 - ((cameraX * .55) % 58);
      ctx.strokeStyle = "#2f744f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 570);
      ctx.lineTo(x + 6, 552);
      ctx.lineTo(x + 12, 570);
      ctx.stroke();
    }

    // small flowers / stems like the reference
    for (let i = -1; i < 24; i++) {
      const x = i * 78 - ((cameraX * .45) % 78);
      const y = 575 + (i % 3) * 7;
      ctx.strokeStyle = "#367c51";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 28);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = i % 2 ? "#ff668d" : "#ffd34d";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  drawSun = function() {
    const x = 840 - cameraX * .06;
    const y = 86;
    const glow = ctx.createRadialGradient(x, y, 18, x, y, 90);
    glow.addColorStop(0, "rgba(255,245,150,.9)");
    glow.addColorStop(1, "rgba(255,245,150,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 100, y - 100, 200, 200);
    ctx.fillStyle = "#ffe36b";
    ctx.beginPath();
    ctx.arc(x, y, 38, 0, Math.PI * 2);
    ctx.fill();
  };

  drawClouds = function() {
    for (let i = -2; i < 8; i++) {
      const x = i * 260 - ((cameraX * .08) % 260);
      const y = 95 + (i % 3) * 38;
      ctx.fillStyle = "rgba(255,255,255,.72)";
      ctx.beginPath();
      ctx.arc(x + 20, y + 12, 22, 0, Math.PI * 2);
      ctx.arc(x + 48, y, 30, 0, Math.PI * 2);
      ctx.arc(x + 82, y + 14, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ---------- Platforms ----------
  drawPlatforms = function() {
    for (const p of platforms) {
      const x = p.x - cameraX;
      if (x > canvas.width + 80 || x + p.width < -80) continue;

      const radius = Math.min(10, p.height * .2);

      ctx.save();

      // dirt body
      ctx.fillStyle = "#8b552d";
      ctx.beginPath();
      ctx.roundRect(x, p.y, p.width, p.height, radius);
      ctx.fill();

      // warm soil highlight
      ctx.fillStyle = "#a86b36";
      ctx.fillRect(x + 4, p.y + 12, Math.max(0, p.width - 8), Math.min(13, p.height - 8));

      // grass cap
      ctx.fillStyle = "#4e9a62";
      ctx.fillRect(x, p.y - 5, p.width, 9);

      // grass blades
      ctx.strokeStyle = "#2f7749";
      ctx.lineWidth = 2;
      for (let gx = x + 8; gx < x + p.width - 4; gx += 18) {
        ctx.beginPath();
        ctx.moveTo(gx, p.y + 3);
        ctx.lineTo(gx + 4, p.y - 3);
        ctx.lineTo(gx + 8, p.y + 3);
        ctx.stroke();
      }

      // little dirt stones
      ctx.fillStyle = "rgba(72,42,23,.42)";
      for (let sx = x + 16; sx < x + p.width - 10; sx += 46) {
        ctx.beginPath();
        ctx.arc(sx, p.y + 28, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  };

  // ---------- Coins ----------
  drawCoins = function() {
    const now = performance.now();
    for (const c of coinList) {
      if (c.collected) continue;
      const x = c.x - cameraX;
      if (x < -30 || x > canvas.width + 30) continue;

      const bob = Math.sin(now * .006 + c.x * .03) * 4;
      const spin = Math.abs(Math.cos(now * .004 + c.x * .02));
      const rx = 11 * Math.max(.28, spin);

      ctx.save();
      ctx.translate(x, c.y + bob);

      ctx.shadowColor = "rgba(255,190,0,.45)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ffc928";
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#e49b00";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,.72)";
      ctx.beginPath();
      ctx.ellipse(-3, -6, 3, 6, -.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  };

  // ---------- Player: clean side-profile ----------
  drawPlayer = function() {
    const x = player.x - cameraX;
    const y = player.y;
    const dir = player.direction < 0 ? -1 : 1;
    const runBob = player.running && player.ground ? Math.sin(performance.now() * .025) * 2 : 0;

    ctx.save();
    ctx.translate(x + player.width/2, y + runBob);
    ctx.scale(dir, 1);

    // shadow
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.20)";
    ctx.beginPath();
    ctx.ellipse(x + player.width/2, y + player.height + 5, 19, 5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x + player.width/2, y + runBob);
    ctx.scale(dir, 1);

    // legs
    ctx.strokeStyle = "#263238";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    const stride = player.ground && player.running ? Math.sin(performance.now() * .035) * 5 : 0;
    ctx.beginPath();
    ctx.moveTo(-5, 27); ctx.lineTo(-7 - stride, 40);
    ctx.moveTo(7, 27); ctx.lineTo(9 + stride, 40);
    ctx.stroke();

    // shoes
    ctx.strokeStyle = "#15191d";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-11 - stride, 40); ctx.lineTo(0 - stride, 40);
    ctx.moveTo(5 + stride, 40); ctx.lineTo(15 + stride, 40);
    ctx.stroke();

    // orange shirt
    ctx.fillStyle = "#ef6b2e";
    ctx.beginPath();
    ctx.roundRect(-17, 2, 34, 29, 8);
    ctx.fill();

    // shirt highlight
    ctx.fillStyle = "#ff8b45";
    ctx.fillRect(-13, 7, 8, 17);

    // arm
    ctx.strokeStyle = "#f0b48c";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(20, 21);
    ctx.stroke();

    // neck
    ctx.fillStyle = "#e3a57d";
    ctx.fillRect(3, -5, 9, 10);

    // head profile
    ctx.fillStyle = "#f2bb91";
    ctx.beginPath();
    ctx.arc(7, -13, 17, 0, Math.PI * 2);
    ctx.fill();

    // ear
    ctx.fillStyle = "#d99a70";
    ctx.beginPath();
    ctx.arc(-7, -10, 5, 0, Math.PI * 2);
    ctx.fill();

    // hair
    ctx.fillStyle = "#2d201b";
    ctx.beginPath();
    ctx.arc(-1, -24, 13, Math.PI, Math.PI * 2);
    ctx.fill();

    // red cap with brim pointing forward
    ctx.fillStyle = "#d92f2f";
    ctx.beginPath();
    ctx.arc(3, -28, 15, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-9, -28, 23, 6);

    ctx.fillStyle = "#b71c1c";
    ctx.beginPath();
    ctx.ellipse(18, -22, 12, 4, -.08, 0, Math.PI * 2);
    ctx.fill();

    // single visible eye, nose and smile = clear side profile
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(15, -14, 4.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#171717";
    ctx.beginPath();
    ctx.arc(16, -14, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e3a57d";
    ctx.beginPath();
    ctx.moveTo(22, -12);
    ctx.lineTo(29, -9);
    ctx.lineTo(22, -7);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#8b4a36";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(18, -5, 5, .15, 1.05);
    ctx.stroke();

    ctx.restore();
  };

  // ---------- Enemies: polished animal silhouettes ----------
  drawEnemies = function() {
    for (const e of enemies) {
      if (!e.alive || e._aiHidden) continue;

      const x = e.x - cameraX;
      const y = e.y;
      if (x < -100 || x > canvas.width + 100) continue;

      const w = e.width, h = e.height;
      const bob = (e.type === 3 || e.type === 6) ? Math.sin(performance.now()*.01 + e.x)*3 : 0;

      ctx.save();
      ctx.translate(x, y + bob);

      // common shadow
      ctx.fillStyle = "rgba(0,0,0,.18)";
      ctx.beginPath();
      ctx.ellipse(w/2, h+4, w*.42, 4, 0, 0, Math.PI*2);
      ctx.fill();

      if (e.type === 1) {
        // boar
        ctx.fillStyle = "#8b4d2f";
        ctx.beginPath(); ctx.ellipse(w*.48,h*.55,w*.42,h*.34,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = "#6e3926";
        ctx.beginPath(); ctx.ellipse(w*.85,h*.58,w*.22,h*.20,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(w*.89,h*.48,4,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(w*.90,h*.48,2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = "#e4c7ad"; ctx.beginPath(); ctx.ellipse(w*.98,h*.66,6,4,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle="#4a291d"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(10,h*.72);ctx.lineTo(8,h);ctx.moveTo(28,h*.72);ctx.lineTo(28,h);ctx.stroke();
      } else if (e.type === 2) {
        // blue turtle
        ctx.fillStyle="#2578bd"; ctx.beginPath(); ctx.ellipse(w*.48,h*.55,w*.42,h*.34,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#54b5e8";ctx.beginPath();ctx.arc(w*.88,h*.48,9,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(w*.91,h*.40,3.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(w*.92,h*.40,1.5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#174f83";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(12,h*.78);ctx.lineTo(9,h);ctx.moveTo(27,h*.78);ctx.lineTo(29,h);ctx.stroke();
      } else if (e.type === 3) {
        // green frog
        ctx.fillStyle="#3cae55";ctx.beginPath();ctx.ellipse(w*.5,h*.58,w*.43,h*.38,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#75d35e";ctx.beginPath();ctx.arc(w*.30,h*.28,8,0,Math.PI*2);ctx.arc(w*.70,h*.28,8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(w*.30,h*.28,5,0,Math.PI*2);ctx.arc(w*.70,h*.28,5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(w*.30,h*.28,2.5,0,Math.PI*2);ctx.arc(w*.70,h*.28,2.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#2d7e3c";ctx.fillRect(w*.25,h*.72,w*.5,4);
      } else if (e.type === 4) {
        // purple bat
        ctx.fillStyle="#6a2d8f";
        ctx.beginPath();ctx.moveTo(w*.48,h*.52);ctx.lineTo(0,h*.15);ctx.lineTo(w*.15,h*.72);ctx.lineTo(w*.38,h*.62);ctx.lineTo(w*.50,h*.80);ctx.lineTo(w*.62,h*.62);ctx.lineTo(w*.85,h*.72);ctx.lineTo(w,h*.15);ctx.closePath();ctx.fill();
        ctx.fillStyle="#f7e84a";ctx.beginPath();ctx.arc(w*.43,h*.43,4,0,Math.PI*2);ctx.arc(w*.57,h*.43,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(w*.43,h*.43,1.8,0,Math.PI*2);ctx.arc(w*.57,h*.43,1.8,0,Math.PI*2);ctx.fill();
      } else if (e.type === 5) {
        // orange bird
        ctx.fillStyle="#e85a18";ctx.beginPath();ctx.ellipse(w*.48,h*.52,w*.34,h*.42,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#ff8a30";ctx.beginPath();ctx.moveTo(w*.70,h*.40);ctx.lineTo(w*.98,h*.52);ctx.lineTo(w*.70,h*.64);ctx.closePath();ctx.fill();
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(w*.55,h*.38,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(w*.56,h*.38,2,0,Math.PI*2);ctx.fill();
      } else if (e.type === 6) {
        // red fox
        ctx.fillStyle="#c9432d";ctx.beginPath();ctx.ellipse(w*.48,h*.58,w*.42,h*.32,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#ef684e";ctx.beginPath();ctx.moveTo(w*.63,h*.35);ctx.lineTo(w*.88,h*.05);ctx.lineTo(w*.86,h*.60);ctx.closePath();ctx.fill();
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(w*.69,h*.40,4,0,Math.PI*2);ctx.arc(w*.82,h*.40,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(w*.70,h*.40,2,0,Math.PI*2);ctx.arc(w*.83,h*.40,2,0,Math.PI*2);ctx.fill();
      } else {
        // dark crocodile
        ctx.fillStyle="#334d3c";ctx.beginPath();ctx.ellipse(w*.48,h*.58,w*.45,h*.30,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#607b59";ctx.beginPath();ctx.ellipse(w*.90,h*.50,w*.25,h*.22,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(w*.84,h*.30,5,0,Math.PI*2);ctx.arc(w*.96,h*.30,5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(w*.84,h*.30,2,0,Math.PI*2);ctx.arc(w*.96,h*.30,2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#fff4d8"; for(let tx=w*.70;tx<w*.98;tx+=8){ctx.beginPath();ctx.moveTo(tx,h*.64);ctx.lineTo(tx+3,h*.82);ctx.lineTo(tx+6,h*.64);ctx.closePath();ctx.fill();}
      }

      ctx.restore();
    }
  };

  // ---------- Main world draw stays the same, but receives a soft polish overlay ----------
  const oldDrawBackground = drawBackground;
  drawBackground = function() {
    oldDrawBackground();
    if (currentWorld && currentWorld.theme === "grass") {
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, "rgba(255,255,255,.08)");
      g.addColorStop(.55, "rgba(255,255,255,0)");
      g.addColorStop(1, "rgba(15,70,45,.08)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // ---------- Cleaner visual treatment for the main wrapper ----------
  const wrapper = document.getElementById("gameWrapper");
  if (wrapper) wrapper.classList.add("reference-platformer");

})();


/* --- Ground/soil correction: grass is never visually floating --- */
(function installGroundSoilFix() {
  if (window.__GroundSoilFixInstalled) return;
  window.__GroundSoilFixInstalled = true;

  const oldDrawGrassWorld = drawGrassWorld;
  drawGrassWorld = function() {
    oldDrawGrassWorld();

    // A continuous soil layer under the lower ground line.
    // It only applies to the world floor, not elevated platforms.
    const groundY = 555;
    ctx.save();

    ctx.fillStyle = "#b8753f";
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // layered sand/soil bands
    ctx.fillStyle = "#c8894d";
    ctx.fillRect(0, groundY + 16, canvas.width, 22);
    ctx.fillStyle = "#a96536";
    ctx.fillRect(0, groundY + 38, canvas.width, canvas.height - groundY - 38);

    // little stones and texture
    for (let i = -2; i < 30; i++) {
      const x = i * 54 - ((cameraX * .30) % 54);
      const y = groundY + 57 + ((i * 17) % 42);
      ctx.fillStyle = (i % 2) ? "rgba(91,55,31,.28)" : "rgba(255,190,100,.22)";
      ctx.beginPath();
      ctx.ellipse(x, y, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };
})();



/* --- Final player renderer: small child, true side profile --- */
(function installCharacter3DFinal() {
  drawPlayer = function() {
    const x = player.x - cameraX;
    const footY = player.y + player.height;
    const dir = player.direction < 0 ? -1 : 1;
    const moving = Math.abs(player.vx) > 0.2;
    const running = player.running && Math.abs(player.vx) > 2 && player.ground;
    const t = performance.now();

    // No sweat, breathing, looking-back, or idle bobbing.
    const stride = running ? Math.sin(t * 0.035) * 4.5 : 0;
    const armSwing = running ? Math.sin(t * 0.035 + Math.PI) * 3.0 : (moving ? Math.sin(t * 0.018) * 1.2 : 0);

    ctx.save();

    // Ground shadow.
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse(x + player.width / 2, footY + 1, 16, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Side-facing body.  The character always faces the last movement direction.
    ctx.translate(x + player.width / 2, player.y);
    ctx.scale(dir, 1);

    // Rear leg: mostly hidden, but still visibly attached so it never looks amputated.
    ctx.strokeStyle = "#111820";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-1, 29);
    ctx.lineTo(-2, 39);
    ctx.stroke();
    ctx.strokeStyle = "#20262b";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-4, 40);
    ctx.lineTo(3, 40);
    ctx.stroke();

    // Front leg.
    ctx.strokeStyle = "#151b20";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(6, 28);
    ctx.lineTo(7 + stride, 40);
    ctx.stroke();
    ctx.strokeStyle = "#20252a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(4 + stride, 40);
    ctx.lineTo(15 + stride, 40);
    ctx.stroke();

    // Black trousers.
    ctx.fillStyle = "#101418";
    ctx.beginPath();
    ctx.roundRect(-13, 23, 25, 11, 4);
    ctx.fill();

    // Red sweater.
    const shirt = ctx.createLinearGradient(-15, 0, 16, 30);
    shirt.addColorStop(0, "#ff4545");
    shirt.addColorStop(0.55, "#e51f2a");
    shirt.addColorStop(1, "#9d121c");
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-15, 2, 30, 27, 8);
    ctx.fill();

    // Collar.
    ctx.fillStyle = "#b5121b";
    ctx.beginPath();
    ctx.arc(3, 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // One visible front arm; rear arm stays behind the torso.
    const skin = ctx.createLinearGradient(4, 2, 23, 25);
    skin.addColorStop(0, "#ffd0aa");
    skin.addColorStop(1, "#c97955");
    ctx.strokeStyle = skin;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(10, 9);
    ctx.lineTo(19 + armSwing, 20);
    ctx.stroke();

    // Neck.
    ctx.fillStyle = "#e6a77f";
    ctx.fillRect(3, -5, 8, 9);

    // Child head in side profile.
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(5, -13, 16, 0, Math.PI * 2);
    ctx.fill();

    // Ear.
    ctx.fillStyle = "#d8926d";
    ctx.beginPath();
    ctx.arc(-7, -10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Hair.
    ctx.fillStyle = "#2a1c17";
    ctx.beginPath();
    ctx.arc(-1, -24, 13, Math.PI, Math.PI * 2);
    ctx.fill();

    // Red cap facing forward.
    const cap = ctx.createLinearGradient(-9, -38, 15, -20);
    cap.addColorStop(0, "#ff4b43");
    cap.addColorStop(0.55, "#e72f2f");
    cap.addColorStop(1, "#941c1c");
    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.arc(2, -28, 14, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-9, -28, 22, 6);

    // One eye and small nose establish the side direction.
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(14, -14, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#171717";
    ctx.beginPath();
    ctx.arc(15, -14, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d8926d";
    ctx.beginPath();
    ctx.moveTo(20, -12);
    ctx.lineTo(27, -9);
    ctx.lineTo(20, -7);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Running dust remains only while actually running.
    if (running) {
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const a = t * 0.012 + i * 2.1;
        const px = x + player.width / 2 - dir * (17 + i * 7);
        const py = footY - 2 + Math.sin(a) * 2;
        const r = 2.2 + i * 0.7;
        ctx.fillStyle = "rgba(235,215,180,.72)";
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };
})();

/* --- Single 3D-inspired crocodile --- */
(function installCrocodile3D() {
  const oldDrawEnemies = drawEnemies;
  drawEnemies = function() {
    // Draw normal enemies from the existing renderer, but skip crocodile entries.
    for (const e of enemies) {
      if (!e.alive || e._aiHidden || e.type === 7) continue;
      // Reuse the previous renderer by temporarily isolating this enemy.
      const old = enemies;
      // handled by original renderer below through filtered list
    }

    const filtered = enemies.filter(e => e.type !== 7);
    const originalEnemiesRef = enemies;
    // We cannot rebind a const, so render non-crocs with a local clone by
    // temporarily replacing the array contents.
    enemies.length = 0;
    filtered.forEach(e => enemies.push(e));
    try { oldDrawEnemies(); } finally {
      enemies.length = 0;
      originalEnemiesRef.forEach(e => enemies.push(e));
    }

    // Draw each crocodile exactly once.
    for (const e of originalEnemiesRef) {
      if (!e.alive || e._aiHidden || e.type !== 7) continue;
      const x = e.x - cameraX;
      const y = e.y;
      if (x < -120 || x > canvas.width + 120) continue;

      const w = e.width, h = e.height;
      const grd = ctx.createLinearGradient(x, y, x, y + h);
      grd.addColorStop(0, "#718f55");
      grd.addColorStop(.42, "#466842");
      grd.addColorStop(1, "#243b2c");

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.25)";
      ctx.shadowBlur = 7;
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(x + w*.45, y + h*.58, w*.46, h*.28, 0, 0, Math.PI*2);
      ctx.fill();

      // head / snout
      ctx.fillStyle = "#5e7e4d";
      ctx.beginPath();
      ctx.roundRect(x + w*.63, y + h*.30, w*.35, h*.38, 10);
      ctx.fill();

      // raised eyes
      ctx.fillStyle = "#718f55";
      ctx.beginPath();
      ctx.arc(x + w*.72, y + h*.30, 7, 0, Math.PI*2);
      ctx.arc(x + w*.91, y + h*.30, 7, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = "#f7f1d0";
      ctx.beginPath();
      ctx.arc(x + w*.72, y + h*.30, 4, 0, Math.PI*2);
      ctx.arc(x + w*.91, y + h*.30, 4, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = "#171717";
      ctx.beginPath();
      ctx.arc(x + w*.73, y + h*.30, 1.8, 0, Math.PI*2);
      ctx.arc(x + w*.92, y + h*.30, 1.8, 0, Math.PI*2);
      ctx.fill();

      // jaw and teeth
      ctx.fillStyle = "#2b4534";
      ctx.fillRect(x + w*.67, y + h*.60, w*.30, 5);
      ctx.fillStyle = "#fff4dc";
      for (let tx = x + w*.70; tx < x + w*.95; tx += 8) {
        ctx.beginPath();
        ctx.moveTo(tx, y + h*.62);
        ctx.lineTo(tx + 3, y + h*.79);
        ctx.lineTo(tx + 6, y + h*.62);
        ctx.closePath();
        ctx.fill();
      }

      // back ridges / scales
      ctx.fillStyle = "#36543a";
      for (let sx = x + 8; sx < x + w*.67; sx += 13) {
        ctx.beginPath();
        ctx.moveTo(sx, y + h*.35);
        ctx.lineTo(sx + 6, y + h*.18);
        ctx.lineTo(sx + 11, y + h*.35);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  };
})();


/* ============================================================
   FULL 3D-STYLE VISUAL REBUILD — ALL 15 LEVELS
   Gameplay/collision logic remains unchanged.
   ============================================================ */
(function installFull3DVisualRebuild() {
  if (window.__Full3DVisualRebuildInstalled) return;
  window.__Full3DVisualRebuildInstalled = true;

  const TAU = Math.PI * 2;

  function themeForLevel() {
    const n = Math.max(1, Math.min(45, Number(currentLevel) || 1));
    const base = ((n - 1) % 15) + 1;
    return [
      "meadow", "ocean", "forest", "desert", "ice",
      "volcano", "castle", "swamp", "cave", "storm",
      "pirate", "nightDesert", "thorn", "monsterLake", "final"
    ][base - 1];
  }

  function poly(points, fill, stroke = null, width = 1) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  function hill(x, base, width, peak, color) {
    poly([
      [x, base], [x + width * .48, peak],
      [x + width, base]
    ], color);
  }

  function roundedBox(x, y, w, h, r, fill, stroke = null) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function gradientRect(x, y, w, h, top, bottom) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  function draw3DSky(top, bottom) {
    gradientRect(0, 0, canvas.width, canvas.height, top, bottom);
  }

  function drawCloud(x, y, s = 1) {
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.beginPath();
    ctx.arc(x, y, 20*s, 0, TAU);
    ctx.arc(x + 25*s, y - 10*s, 28*s, 0, TAU);
    ctx.arc(x + 58*s, y, 22*s, 0, TAU);
    ctx.fill();
  }

  function drawSun3D(x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, r*.15, x, y, r*2.8);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(255,240,120,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x-r*3, y-r*3, r*6, r*6);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }

  function drawTree3D(x, ground, s, trunk, leaves) {
    // cast shadow
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.beginPath(); ctx.ellipse(x, ground+2, 28*s, 7*s, 0, 0, TAU); ctx.fill();
    // trunk bevel
    const tg = ctx.createLinearGradient(x-8*s, ground-75*s, x+12*s, ground);
    tg.addColorStop(0, "#a66a36"); tg.addColorStop(.55, trunk); tg.addColorStop(1, "#55351e");
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.roundRect(x-8*s, ground-80*s, 16*s, 80*s, 5*s);
    ctx.fill();
    // crown layers
    const lg = ctx.createLinearGradient(x-55*s, ground-150*s, x+45*s, ground-55*s);
    lg.addColorStop(0, "#8be36d"); lg.addColorStop(.45, leaves); lg.addColorStop(1, "#235a35");
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(x, ground-115*s, 38*s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x-30*s, ground-92*s, 29*s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x+30*s, ground-92*s, 29*s, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.beginPath(); ctx.arc(x-12*s, ground-127*s, 14*s, 0, TAU); ctx.fill();
  }

  function drawRock3D(x, y, s, a, b) {
    const g = ctx.createLinearGradient(x, y, x, y+45*s);
    g.addColorStop(0, a); g.addColorStop(1, b);
    poly([
      [x-30*s,y+30*s],[x-18*s,y+4*s],[x+7*s,y-7*s],
      [x+32*s,y+12*s],[x+25*s,y+38*s],[x,y+50*s]
    ], g);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    poly([[x-15*s,y+6*s],[x+7*s,y-3*s],[x+15*s,y+8*s],[x-2*s,y+15*s]], "rgba(255,255,255,.18)");
  }

  function drawWater3D(y, top, deep) {
    const g = ctx.createLinearGradient(0,y,0,canvas.height);
    g.addColorStop(0, top); g.addColorStop(1, deep);
    ctx.fillStyle = g; ctx.fillRect(0,y,canvas.width,canvas.height-y);
    for (let i=-1;i<12;i++) {
      const x=i*180-(cameraX*.28%180);
      ctx.strokeStyle="rgba(255,255,255,.28)";
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(x,y+5,45,Math.PI,TAU);
      ctx.stroke();
    }
  }

  function drawLevel3DBackground() {
    const rawN = Math.max(1, Math.min(45, Number(currentLevel)||1));
    const n = ((rawN - 1) % 15) + 1;
    const t = performance.now()*.001;
    const scroll = cameraX;

    // --- 1 Meadow ---
    if (n === 1) {
      draw3DSky("#70d5ff","#d9f4ff");
      drawSun3D(850-scroll*.04,82,36,"#ffe16b");
      for(let i=-2;i<8;i++) hill(i*470-(scroll*.10%470),570,470,220+(i%2)*30,"#8fc7a2");
      for(let i=-2;i<9;i++) hill(i*410-(scroll*.18%410),580,410,300+(i%3)*18,"#579b72");
      for(let i=-1;i<8;i++) drawCloud(i*250-(scroll*.08%250),95+(i%3)*35,.9);
      for(let i=-1;i<7;i++) drawTree3D(i*260-(scroll*.22%260),550,.85,"#87512c","#3f9457");
      gradientRect(0,550,canvas.width,canvas.height-550,"#6ea953","#9b6336");
    }

    // --- 2 Ocean ---
    else if (n === 2) {
      draw3DSky("#55c9f5","#d8f4ff");
      drawSun3D(820-scroll*.04,88,34,"#fff09a");
      for(let i=-2;i<9;i++) hill(i*420-(scroll*.12%420),500,420,250+(i%2)*25,"#73b6c5");
      drawWater3D(500,"#43b8df","#155a82");
      for(let i=-1;i<7;i++) {
        const x=i*270-(scroll*.25%270);
        ctx.fillStyle="#3f8d69"; ctx.beginPath();
        ctx.arc(x,500,28,Math.PI,TAU); ctx.fill();
      }
    }

    // --- 3 Forest ---
    else if (n === 3) {
      draw3DSky("#86d7ff","#e7f8ff");
      for(let i=-2;i<9;i++) hill(i*380-(scroll*.10%380),570,380,230+(i%3)*28,"#719e89");
      gradientRect(0,550,canvas.width,canvas.height-550,"#4e8d57","#6b482b");
      for(let i=-2;i<11;i++) drawTree3D(i*145-(scroll*.32%145),550,.75,"#714526","#2e7948");
    }

    // --- 4 Desert ---
    else if (n === 4) {
      draw3DSky("#69cdf4","#ffe7a4");
      drawSun3D(850-scroll*.04,75,43,"#ffd85a");
      for(let i=-2;i<9;i++) hill(i*450-(scroll*.13%450),555,450,330+(i%2)*30,"#d6ad62");
      gradientRect(0,550,canvas.width,canvas.height-550,"#e2b45c","#9d6231");
      for(let i=-1;i<8;i++) {
        const x=i*220-(scroll*.27%220);
        ctx.fillStyle="#3d8d62"; ctx.fillRect(x-5,490,10,60);
        ctx.fillStyle="#5aaa70"; ctx.beginPath();ctx.arc(x,480,25,0,TAU);ctx.fill();
      }
    }

    // --- 5 Ice ---
    else if (n === 5) {
      draw3DSky("#8ad9ff","#effbff");
      drawSun3D(840-scroll*.03,80,31,"#e8fbff");
      for(let i=-2;i<9;i++) hill(i*420-(scroll*.13%420),570,420,180+(i%2)*40,"#d8f3ff");
      gradientRect(0,550,canvas.width,canvas.height-550,"#dff8ff","#78b9d5");
      for(let i=-1;i<10;i++) {
        const x=i*150-(scroll*.25%150);
        poly([[x,550],[x+45,470],[x+90,550]],"rgba(255,255,255,.55)");
      }
    }

    // --- 6 Volcano ---
    else if (n === 6) {
      draw3DSky("#4d3347","#e07a49");
      for(let i=-2;i<8;i++) hill(i*430-(scroll*.13%430),555,430,170+(i%2)*40,"#392c3c");
      gradientRect(0,550,canvas.width,canvas.height-550,"#45413f","#171516");
      for(let i=-1;i<8;i++) {
        const x=i*250-(scroll*.2%250);
        ctx.fillStyle="rgba(255,83,35,.55)";
        ctx.beginPath();ctx.moveTo(x,550);ctx.lineTo(x+45,450);ctx.lineTo(x+90,550);ctx.fill();
      }
    }

    // --- 7 Castle ---
    else if (n === 7) {
      draw3DSky("#7284c4","#e5b5a2");
      for(let i=-2;i<8;i++) {
        const x=i*300-(scroll*.18%300);
        gradientRect(x,260,70,300,"#646b84","#2d3042");
        for(let j=0;j<4;j++) ctx.fillRect(x+j*20,245,13,18);
        ctx.fillStyle="#1f2230"; ctx.fillRect(x+24,410,22,45);
      }
      gradientRect(0,550,canvas.width,canvas.height-550,"#555b70","#292b37");
    }

    // --- 8 Swamp ---
    else if (n === 8) {
      draw3DSky("#648f82","#c0d39d");
      for(let i=-2;i<8;i++) hill(i*390-(scroll*.12%390),540,390,250+(i%2)*35,"#42685b");
      drawWater3D(510,"#567d67","#244c46");
      for(let i=-1;i<9;i++) drawTree3D(i*180-(scroll*.25%180),510,.65,"#5b3d28","#376444");
    }

    // --- 9 Cave ---
    else if (n === 9) {
      draw3DSky("#182136","#080c18");
      for(let i=-2;i<11;i++) {
        const x=i*160-(scroll*.28%160);
        poly([[x,0],[x+45,100+(i%3)*25],[x+90,0]],"#303a55");
        poly([[x,canvas.height],[x+55,canvas.height-120-(i%3)*20],[x+110,canvas.height]],"#1b2539");
      }
      for(let i=-1;i<9;i++) drawRock3D(i*210-(scroll*.22%210),470,1.0,"#61708a","#28344c");
      gradientRect(0,550,canvas.width,canvas.height-550,"#27344a","#101723");
    }

    // --- 10 Storm ---
    else if (n === 10) {
      draw3DSky("#485b7a","#a8b6c7");
      for(let i=-1;i<8;i++) drawCloud(i*230-(scroll*.14%230),90+(i%3)*65,1.3);
      gradientRect(0,550,canvas.width,canvas.height-550,"#526e70","#263e43");
      if(Math.sin(t*5)>0.96){
        ctx.fillStyle="rgba(255,255,220,.45)";ctx.fillRect(0,0,canvas.width,canvas.height);
      }
    }

    // --- 11 Pirate ---
    else if (n === 11) {
      draw3DSky("#58c7ed","#f0d58d");
      drawSun3D(850-scroll*.04,82,35,"#ffe17a");
      drawWater3D(500,"#35a8ca","#15526d");
      for(let i=-2;i<8;i++) drawTree3D(i*260-(scroll*.18%260),500,.65,"#6d4527","#2d784b");
      // distant ship
      const sx=650-scroll*.10;
      poly([[sx,425],[sx+145,425],[sx+120,455],[sx+20,455]],"#633f2b");
      ctx.fillStyle="#3b2b24";ctx.fillRect(sx+68,330,7,95);
      poly([[sx+75,340],[sx+130,385],[sx+75,385]],"#7d3035");
    }

    // --- 12 Desert Night ---
    else if (n === 12) {
      draw3DSky("#111d45","#4b3b5d");
      ctx.fillStyle="#fff2b5";ctx.beginPath();ctx.arc(850-scroll*.04,90,34,0,TAU);ctx.fill();
      for(let i=0;i<55;i++){
        const x=(i*113-scroll*.07)%canvas.width;
        const y=20+(i*47)%230;
        ctx.fillStyle="rgba(255,255,255,.75)";ctx.fillRect(x,y,2,2);
      }
      for(let i=-2;i<9;i++) hill(i*420-(scroll*.13%420),555,420,340+(i%2)*25,"#76546b");
      gradientRect(0,550,canvas.width,canvas.height-550,"#ad7748","#55372c");
    }

    // --- 13 Thorn ---
    else if (n === 13) {
      draw3DSky("#74c99a","#d8e7a0");
      for(let i=-2;i<8;i++) hill(i*400-(scroll*.12%400),550,400,220+(i%2)*35,"#5f8d58");
      gradientRect(0,550,canvas.width,canvas.height-550,"#668d4d","#3b5134");
      for(let i=-1;i<13;i++) {
        const x=i*115-(scroll*.35%115);
        poly([[x,550],[x+20,370],[x+42,550]],"#284f35");
        poly([[x+18,520],[x+65,460],[x+43,535]],"#315c39");
      }
    }

    // --- 14 Monster Lake ---
    else if (n === 14) {
      draw3DSky("#3a7e9d","#b6d5c9");
      for(let i=-2;i<8;i++) hill(i*420-(scroll*.13%420),500,420,210+(i%2)*30,"#47766d");
      drawWater3D(500,"#2f91aa","#123f59");
      for(let i=-1;i<8;i++) {
        const x=i*230-(scroll*.25%230);
        ctx.fillStyle="#3b5d49";ctx.beginPath();ctx.arc(x,500,34,Math.PI,TAU);ctx.fill();
      }
    }

    // --- 30 Final ---
    else {
      draw3DSky("#2b1a38","#8f3d3e");
      for(let i=-2;i<9;i++) hill(i*450-(scroll*.14%450),560,450,180+(i%2)*35,"#3a253d");
      gradientRect(0,550,canvas.width,canvas.height-550,"#4d3b3b","#1d171a");
      for(let i=-1;i<8;i++) {
        const x=i*250-(scroll*.25%250);
        ctx.fillStyle="rgba(255,87,44,.55)";
        ctx.beginPath();ctx.arc(x,510,16+Math.sin(t+i)*4,0,TAU);ctx.fill();
      }
      // final portal
      const px=760-scroll*.03, py=360;
      ctx.shadowColor="#ff6b38";ctx.shadowBlur=28;
      ctx.strokeStyle="#ff7c3d";ctx.lineWidth=9;
      ctx.beginPath();ctx.ellipse(px,py,52,90,0,0,TAU);ctx.stroke();
      ctx.shadowBlur=0;
    }

    // Animated ambient life/effects: every stage gets a distinct variation.
    const variant = rawN;
    if (variant % 3 === 1) {
      for (let i = 0; i < 5; i++) {
        const bx = (i * 260 + Math.sin(t * 0.7 + i) * 90 - scroll * 0.16) % (canvas.width + 180);
        const by = 150 + (i % 3) * 70 + Math.sin(t * 1.5 + i) * 12;
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.beginPath(); ctx.ellipse(bx, by, 4, 3, .4, 0, TAU); ctx.ellipse(bx+8, by-2, 4, 3, -.4, 0, TAU); ctx.fill();
        ctx.strokeStyle = "rgba(90,65,35,.75)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(bx+4,by); ctx.lineTo(bx+1,by+5); ctx.stroke();
      }
    } else if (variant % 3 === 2) {
      for (let i = 0; i < 6; i++) {
        const bx = (i * 190 + Math.sin(t * 1.1 + i * 2) * 100 - scroll * 0.22) % (canvas.width + 140);
        const by = 120 + (i % 4) * 65 + Math.cos(t * 1.7 + i) * 18;
        ctx.fillStyle = i % 2 ? "#ffd1e5" : "#fff3a8";
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, TAU); ctx.arc(bx+7, by-2, 4, 0, TAU); ctx.arc(bx+3, by+6, 4, 0, TAU); ctx.fill();
        ctx.fillStyle = "#f0a43c"; ctx.beginPath(); ctx.arc(bx+3,by+2,2.5,0,TAU); ctx.fill();
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const bx = (i * 170 - scroll * 0.12) % (canvas.width + 120);
        const by = 90 + (i % 4) * 85 + Math.sin(t * 1.4 + i) * 22;
        ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.beginPath(); ctx.arc(bx,by,2.2,0,TAU); ctx.fill();
      }
    }

    // Always draw a proper continuous soil floor at the exact collision Y.
    const groundY = 550;
    const soil = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    soil.addColorStop(0, "#9b6336");
    soil.addColorStop(.25, "#87512d");
    soil.addColorStop(1, "#56351f");
    ctx.fillStyle = soil;
    ctx.fillRect(0, groundY, canvas.width, canvas.height-groundY);

    // grass edge exactly on collision surface
    ctx.fillStyle = n===4 ? "#c79a4b" : (n===5 ? "#dff8ff" : "#4f965e");
    ctx.fillRect(0, groundY-7, canvas.width, 10);
    ctx.strokeStyle = n===4 ? "#b57b35" : "#2f6f45";
    ctx.lineWidth = 2;
    for(let x=-10;x<canvas.width+20;x+=18) {
      ctx.beginPath();ctx.moveTo(x,groundY+1);ctx.lineTo(x+4,groundY-6);ctx.lineTo(x+8,groundY+1);ctx.stroke();
    }
  }

  function draw3DPlatforms() {
    const n = Math.max(1, Math.min(45, Number(currentLevel)||1));
    for (const p of platforms) {
      const x=p.x-cameraX;
      if(x+p.width< -80 || x>canvas.width+80) continue;

      let top="#55a65c", side="#7b4b2a", dark="#4a2d1d";
      if(n===2||n===14){top="#51b6d3";side="#6d8f9a";dark="#355663";}
      if(n===4||n===12){top="#d7a75b";side="#a86d36";dark="#704323";}
      if(n===5){top="#e9fbff";side="#8fc9df";dark="#4c879c";}
      if(n===6||n===15){top="#5b514f";side="#3b2e2d";dark="#21191a";}
      if(n===7){top="#6f778d";side="#454b5c";dark="#292d38";}
      if(n===9){top="#68778f";side="#3d4a61";dark="#202b3e";}

      // cast shadow
      ctx.fillStyle="rgba(0,0,0,.22)";
      ctx.beginPath();ctx.roundRect(x+5,p.y+8,p.width,p.height,8);ctx.fill();

      // beveled side
      const g=ctx.createLinearGradient(x,p.y,x,p.y+p.height);
      g.addColorStop(0,side);g.addColorStop(.65,dark);g.addColorStop(1,"#171717");
      ctx.fillStyle=g;
      ctx.beginPath();ctx.roundRect(x,p.y,p.width,p.height,8);ctx.fill();

      // top bevel
      const tg=ctx.createLinearGradient(x,p.y,x,p.y+16);
      tg.addColorStop(0,"#ffffff");tg.addColorStop(.14,top);tg.addColorStop(1,side);
      ctx.fillStyle=tg;
      ctx.beginPath();ctx.roundRect(x,p.y,p.width,14,6);ctx.fill();

      // edge highlight
      ctx.strokeStyle="rgba(255,255,255,.24)";
      ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(x+7,p.y+2);ctx.lineTo(x+p.width-7,p.y+2);ctx.stroke();

      // texture
      ctx.fillStyle="rgba(0,0,0,.16)";
      for(let i=18;i<p.width-8;i+=42){
        ctx.beginPath();ctx.arc(x+i,p.y+28,3,0,TAU);ctx.fill();
      }
    }
  }

  function draw3DCoins() {
    for(const c of coinList){
      if(c.collected) continue;
      const x=c.x-cameraX;
      if(x<-30||x>canvas.width+30) continue;
      const t=performance.now()*.005+c.x*.02;
      const sx=.35+Math.abs(Math.cos(t))*.75;
      ctx.save();
      ctx.translate(x,c.y+Math.sin(t*1.5)*3);
      ctx.shadowColor="rgba(255,190,20,.6)";ctx.shadowBlur=14;
      const g=ctx.createLinearGradient(-12,-16,12,16);
      g.addColorStop(0,"#fff5a0");g.addColorStop(.35,"#ffd42e");g.addColorStop(.72,"#f2a900");g.addColorStop(1,"#a96a00");
      ctx.scale(sx,1);ctx.fillStyle=g;
      ctx.beginPath();ctx.ellipse(0,0,12,17,0,0,TAU);ctx.fill();
      ctx.shadowBlur=0;ctx.strokeStyle="#ffe889";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillRect(-4,-10,3,11);
      ctx.restore();
    }
  }

  function draw3DPlayer() {
    // IMPORTANT: use the collision box bottom as the exact foot line.
    const left=player.x-cameraX;
    const footY=player.y+player.height;
    const dir=player.direction<0?-1:1;
    const run=!!player.running && !!player.ground;
    const tt=performance.now()*.022;
    const stride=run?Math.sin(tt)*5:0;

    // Shadow sits exactly on the platform/floor.
    ctx.save();
    ctx.fillStyle="rgba(0,0,0,.24)";
    ctx.beginPath();ctx.ellipse(left+player.width/2,footY+1,18,4.5,0,0,TAU);ctx.fill();
    ctx.restore();

    // Character is drawn upward FROM footY, not from player.y.
    ctx.save();
    ctx.translate(left+player.width/2,footY);
    ctx.scale(dir,1);

    // shoes — their bottom is exactly footY
    ctx.fillStyle="#14181c";
    ctx.beginPath();ctx.roundRect(-13-stride, -8, 17, 8, 4);ctx.fill();
    ctx.beginPath();ctx.roundRect(4+stride, -8, 17, 8, 4);ctx.fill();

    // legs
    const lg=ctx.createLinearGradient(0,-37,0,-8);
    lg.addColorStop(0,"#4269b0");lg.addColorStop(1,"#1d3768");
    ctx.strokeStyle=lg;ctx.lineWidth=9;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-5,-10);ctx.lineTo(-7-stride,-32);ctx.moveTo(6,-10);ctx.lineTo(8+stride,-32);ctx.stroke();

    // body
    const bg=ctx.createLinearGradient(-20,-78,18,-32);
    bg.addColorStop(0,"#ff9a4c");bg.addColorStop(.45,"#ed642b");bg.addColorStop(1,"#a73a21");
    ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(-17,-76,34,43,10);ctx.fill();

    // arm
    const skin=ctx.createLinearGradient(-10,-75,24,-35);
    skin.addColorStop(0,"#ffd4ae");skin.addColorStop(1,"#b9684c");
    ctx.strokeStyle=skin;ctx.lineWidth=8;
    ctx.beginPath();ctx.moveTo(10,-65);ctx.lineTo(21,-48);ctx.stroke();

    // neck + head
    ctx.fillStyle=skin;ctx.fillRect(1,-87,10,13);
    ctx.beginPath();ctx.arc(6,-101,19,0,TAU);ctx.fill();

    // hair
    ctx.fillStyle="#281c18";ctx.beginPath();ctx.arc(0,-111,15,Math.PI,TAU);ctx.fill();

    // red cap, volumetric
    const cap=ctx.createLinearGradient(-15,-126,18,-100);
    cap.addColorStop(0,"#ff5b52");cap.addColorStop(.45,"#e72e2e");cap.addColorStop(1,"#8e1717");
    ctx.fillStyle=cap;ctx.beginPath();ctx.arc(3,-115,17,Math.PI,TAU);ctx.fill();
    ctx.fillRect(-10,-116,26,7);
    ctx.fillStyle="#a81c1c";ctx.beginPath();ctx.ellipse(21,-109,13,4,-.1,0,TAU);ctx.fill();

    // face profile
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(17,-101,4.5,0,TAU);ctx.fill();
    ctx.fillStyle="#111";ctx.beginPath();ctx.arc(18,-101,2,0,TAU);ctx.fill();
    ctx.fillStyle="#d88e6b";poly([[24,-99],[31,-95],[24,-93]],"#d88e6b");
    ctx.strokeStyle="#8a4939";ctx.lineWidth=2;ctx.beginPath();ctx.arc(19,-91,5,.15,1.05);ctx.stroke();

    // rim light
    ctx.strokeStyle="rgba(255,255,255,.20)";ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(6,-101,19,Math.PI*1.15,Math.PI*1.85);ctx.stroke();

    ctx.restore();
  }

  function draw3DEnemies() {
    const now=performance.now()*.001;
    for(const e of enemies){
      if(!e.alive||e._aiHidden) continue;
      const x=e.x-cameraX,y=e.y,w=e.width,h=e.height;
      if(x<-100||x>canvas.width+100) continue;

      const type=e.type;
      ctx.save();

      // shadow
      ctx.fillStyle="rgba(0,0,0,.20)";
      ctx.beginPath();ctx.ellipse(x+w/2,y+h+3,w*.38,4,0,0,TAU);ctx.fill();

      const palettes=[
        ["#d46b3a","#7c321e"],["#4ca8d1","#1e5470"],["#63c85a","#286b37"],
        ["#9b5bc0","#4a2169"],["#ef8131","#8b3e18"],["#e24c39","#7c1e20"],["#718f55","#263d2b"]
      ];
      const [light,dark]=palettes[(type-1)%7];
      const g=ctx.createLinearGradient(x,y,x,y+h);
      g.addColorStop(0,light);g.addColorStop(.6,dark);g.addColorStop(1,"#171b18");

      // body
      ctx.fillStyle=g;
      ctx.beginPath();ctx.ellipse(x+w*.46,y+h*.57,w*.42,h*.34,0,0,TAU);ctx.fill();

      if(type===4){
        // bat wings
        ctx.fillStyle=dark;
        poly([[x+w*.42,y+h*.5],[x,y+h*.08],[x+w*.12,y+h*.75],[x+w*.4,y+h*.63]],dark);
        poly([[x+w*.56,y+h*.5],[x+w,y+h*.08],[x+w*.88,y+h*.75],[x+w*.58,y+h*.63]],dark);
      } else if(type===3){
        // frog eye bumps
        ctx.fillStyle=light;
        ctx.beginPath();ctx.arc(x+w*.3,y+h*.28,8,0,TAU);ctx.arc(x+w*.68,y+h*.28,8,0,TAU);ctx.fill();
      } else if(type===7){
        // crocodile snout + raised eyes
        ctx.fillStyle=light;
        ctx.beginPath();ctx.roundRect(x+w*.58,y+h*.30,w*.40,h*.35,8);ctx.fill();
        ctx.fillStyle="#f9f2c9";
        ctx.beginPath();ctx.arc(x+w*.72,y+h*.28,5,0,TAU);ctx.arc(x+w*.91,y+h*.28,5,0,TAU);ctx.fill();
        ctx.fillStyle="#111";
        ctx.beginPath();ctx.arc(x+w*.72,y+h*.28,2,0,TAU);ctx.arc(x+w*.91,y+h*.28,2,0,TAU);ctx.fill();
        ctx.fillStyle="#fff3d7";
        for(let tx=x+w*.66;tx<x+w*.98;tx+=9){
          poly([[tx,y+h*.62],[tx+4,y+h*.79],[tx+7,y+h*.62]],"#fff3d7");
        }
        // scales
        ctx.fillStyle=dark;
        for(let sx=x+8;sx<x+w*.64;sx+=13) poly([[sx,y+h*.36],[sx+6,y+h*.18],[sx+11,y+h*.36]],dark);
      } else {
        // head
        ctx.fillStyle=light;
        ctx.beginPath();ctx.arc(x+w*.80,y+h*.38,12,0,TAU);ctx.fill();
      }

      // eyes for all except crocodile already handled
      if(type!==7){
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x+w*.72,y+h*.30,4.5,0,TAU);ctx.arc(x+w*.86,y+h*.30,4.5,0,TAU);ctx.fill();
        ctx.fillStyle="#111";ctx.beginPath();ctx.arc(x+w*.73,y+h*.30,2,0,TAU);ctx.arc(x+w*.87,y+h*.30,2,0,TAU);ctx.fill();
      }

      // legs/feet
      if(type!==4){
        ctx.strokeStyle=dark;ctx.lineWidth=5;ctx.lineCap="round";
        const s=Math.sin(now*7+e.x*.02)*3;
        ctx.beginPath();ctx.moveTo(x+w*.30,y+h*.78);ctx.lineTo(x+w*.27-s,y+h);ctx.moveTo(x+w*.62,y+h*.78);ctx.lineTo(x+w*.65+s,y+h);ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Replace all previous visual renderers.
  drawBackgroundCore = drawLevel3DBackground;
  drawPlatforms = draw3DPlatforms;
  drawCoins = draw3DCoins;
  drawPlayer = draw3DPlayer;
  drawEnemies = draw3DEnemies;

  // Exact ground visual line = collision ground Y.
  // This eliminates the old 5px floating grass strip.
  const oldDrawGrassWorld = window.drawGrassWorld;
  window.drawGrassWorld = function(){};

})();

/* ============================================================
   MOBILE TOUCH CONTROLS
   Added without replacing the original keyboard controls.
   ============================================================ */
(function addMobileTouchControls(){
  const touchQuery = window.matchMedia('(pointer: coarse)');
  let controls = null;
  const pressed = new Map();

  function isTouchDevice(){
    return touchQuery.matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  }

  function makeButton(id, label, className){
    const b = document.createElement('button');
    b.id = id;
    b.type = 'button';
    b.className = 'nb-touch-btn ' + className;
    b.textContent = label;
    b.setAttribute('aria-label', label);
    b.style.touchAction = 'none';
    b.style.userSelect = 'none';
    b.style.webkitUserSelect = 'none';
    b.style.webkitTapHighlightColor = 'transparent';
    return b;
  }

  function injectStyle(){
    if (document.getElementById('nbMobileTouchStyle')) return;
    const style = document.createElement('style');
    style.id = 'nbMobileTouchStyle';
    style.textContent = `
      .nb-touch-wrap{
        position:fixed;
        left:0;right:0;bottom:0;
        z-index:10000;
        pointer-events:none;
        display:none;
      }
      .nb-touch-btn{
        position:fixed;
        width:64px;height:64px;
        border:2px solid rgba(255,255,255,.62);
        border-radius:18px;
        background:rgba(20,25,35,.68);
        color:#fff;
        font-size:28px;
        font-weight:900;
        line-height:1;
        box-shadow:0 5px 18px rgba(0,0,0,.28);
        backdrop-filter:blur(6px);
        -webkit-backdrop-filter:blur(6px);
        pointer-events:auto;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        -webkit-tap-highlight-color:transparent;
      }
      .nb-touch-btn:active,.nb-touch-btn.nb-pressed{
        transform:translateY(3px) scale(.96);
        background:rgba(39,174,96,.82);
      }
      #nbTouchLeft{left:max(14px,env(safe-area-inset-left));bottom:max(18px,calc(18px + env(safe-area-inset-bottom)));}
      #nbTouchRight{left:88px;bottom:max(18px,calc(18px + env(safe-area-inset-bottom)));}
      #nbTouchRun{right:88px;bottom:max(18px,calc(18px + env(safe-area-inset-bottom)));}
      #nbTouchUse{right:14px;bottom:max(18px,calc(18px + env(safe-area-inset-bottom)));}
      #nbTouchStore{right:160px;bottom:max(18px,calc(18px + env(safe-area-inset-bottom)));}
      #nbTouchJump{right:14px;bottom:max(92px,calc(92px + env(safe-area-inset-bottom)));}
      #nbTouchFire{display:none !important;}
      @media (min-width: 900px) and (pointer: coarse){
        .nb-touch-btn{width:70px;height:70px;}
      }
    `;
    document.head.appendChild(style);
  }

  function setKey(key, value){
    keys[key] = value;
  }

  function releaseAll(){
    pressed.forEach((key, pointerId) => {
      setKey(key, false);
      pressed.delete(pointerId);
    });
    document.querySelectorAll('.nb-touch-btn.nb-pressed').forEach(b => b.classList.remove('nb-pressed'));
  }

  function bindHold(button, key){
    const down = e => {
      e.preventDefault();
      e.stopPropagation();
      try { initAudio(); } catch (_) {}
      setKey(key, true);
      pressed.set(e.pointerId, key);
      button.classList.add('nb-pressed');
      try { button.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const up = e => {
      e.preventDefault();
      e.stopPropagation();
      const k = pressed.get(e.pointerId) || key;
      setKey(k, false);
      pressed.delete(e.pointerId);
      button.classList.remove('nb-pressed');
    };
    button.addEventListener('pointerdown', down, {passive:false});
    button.addEventListener('pointerup', up, {passive:false});
    button.addEventListener('pointercancel', up, {passive:false});
    button.addEventListener('pointerleave', e => {
      if (pressed.has(e.pointerId)) up(e);
    }, {passive:false});
  }

  function bindJump(button){
    button.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      try { initAudio(); } catch (_) {}
      setKey('arrowup', true);
      button.classList.add('nb-pressed');
      // A short press prevents automatic repeated jumps while the finger is held.
      window.setTimeout(() => setKey('arrowup', false), 140);
      try { button.setPointerCapture(e.pointerId); } catch (_) {}
    }, {passive:false});
    ['pointerup','pointercancel','pointerleave'].forEach(type => {
      button.addEventListener(type, e => {
        e.preventDefault();
        button.classList.remove('nb-pressed');
        setKey('arrowup', false);
      }, {passive:false});
    });
  }

  function bindFire(button){
    button.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      try { initAudio(); } catch (_) {}
      if (typeof window.__nbShopUse === 'function') window.__nbShopUse();
      button.classList.add('nb-pressed');
      try { button.setPointerCapture(e.pointerId); } catch (_) {}
    }, {passive:false});
    ['pointerup','pointercancel','pointerleave'].forEach(type => {
      button.addEventListener(type, e => {
        e.preventDefault();
        button.classList.remove('nb-pressed');
      }, {passive:false});
    });
  }

  function create(){
    if (controls || !isTouchDevice()) return;
    injectStyle();

    controls = document.createElement('div');
    controls.className = 'nb-touch-wrap';
    controls.id = 'nbMobileTouchControls';

    const left = makeButton('nbTouchLeft','◀','left');
    const right = makeButton('nbTouchRight','▶','right');
    const run = makeButton('nbTouchRun','🏃','run');
    const jump = makeButton('nbTouchJump','⬆','jump');
    const use = makeButton('nbTouchUse','🎒','use');
    const store = makeButton('nbTouchStore','🛒','store');
    controls.append(left,right,run,use,store,jump);
    document.body.appendChild(controls);

    bindHold(left,'arrowleft');
    bindHold(right,'arrowright');
    bindHold(run,'shift');
    bindJump(jump);
    bindFire(use);
    store.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      try { initAudio(); } catch (_) {}
      if (typeof window.__nbShopOpen === 'function') window.__nbShopOpen();
      store.classList.add('nb-pressed');
      try { store.setPointerCapture(e.pointerId); } catch (_) {}
    }, {passive:false});
    ['pointerup','pointercancel','pointerleave'].forEach(type => store.addEventListener(type, e => {
      e.preventDefault(); store.classList.remove('nb-pressed');
    }, {passive:false}));

    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) releaseAll();
    });
  }

  function sync(){
    if (!controls) return;
    const active = isTouchDevice() && typeof gameRunning !== 'undefined' && gameRunning;
    controls.style.display = active ? 'block' : 'none';
    if (!active) releaseAll();
    const fire = document.getElementById('nbTouchFire');
    if (fire) fire.style.display = 'none';
    const use = document.getElementById('nbTouchUse');
    if (use) {
      const icons = {shield:'🛡️',laser:'🔫',flight:'✈️',invisibility:'👻'};
      const type = typeof window.__nbShopGetActive === 'function' ? window.__nbShopGetActive() : null;
      use.textContent = type ? icons[type] : '🎒';
      use.title = type ? 'استخدام العنصر' : 'لا يوجد عنصر';
      use.style.display = active && type ? 'block' : 'none';
    }
    const store = document.getElementById('nbTouchStore');
    if (store) store.style.display = active ? 'block' : 'none';
    if (typeof updateUseButton === 'function') updateUseButton();
  }

  function start(){
    create();
    sync();
  }

  start();
  window.setInterval(sync, 250);
  window.addEventListener('resize', sync);
  if (touchQuery.addEventListener) touchQuery.addEventListener('change', sync);
})();