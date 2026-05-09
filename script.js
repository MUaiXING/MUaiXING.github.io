// =====================
// ★ 新增：存档系统
// =====================

// 读取存档
function loadProgress() {
  return localStorage.getItem("spn_save_scene");
}

// 保存存档
function saveProgress(sceneKey) {
  localStorage.setItem("spn_save_scene", sceneKey);
}

// 删除存档
function clearProgress() {
  localStorage.removeItem("spn_save_scene");
}


/* ============================
   你的原 scenes 数据保持不动！
   ============================ */

const scenes = {
  start: {
    background: "bg1.jpg",
    character: "dean.png",
    text: "你在汽油味的汽车旅馆房间醒来，迪恩正靠在门边盯着你。",
    choices: [
      { text: "问：发生了什么？", next: "ask" },
      { text: "沉默看着他", next: "silent" }
    ]
  },

  ask: {
    background: "bg1.jpg",
    character: "images/sam.png",
    text: "山姆走了进来：“昨晚的猎杀把你累坏了，我们需要谈谈。”",
    choices: [
      { text: "继续听他们说", next: "continue1" }
    ]
  },

  silent: {
    background: "bg2.jpg",
    character: "dean.png",
    text: "迪恩皱眉：“你这样让我有点不安。到底看到什么了？”",
    choices: [
      { text: "告诉他你看见的幻象", next: "vision" },
      { text: "摇头否认", next: "deny" }
    ]
  },

  continue1: {
    background: "bg2.jpg",
    character: "images/sam.png",
    text: "山姆继续解释昨晚的情况……(此处可扩写)",
    choices: []
  },

  vision: {
    background: "bg3.jpg",
    character: "",
    text: "你描述了那个让你心悸的幻象……(此处继续创作)",
    choices: []
  },

  deny: {
    background: "bg1.jpg",
    character: "dean.png",
    text: "迪恩显然不信，但也没逼你。(此处继续创作)",
    choices: []
  }
};

// =====================
// 引擎部分（你的原逻辑 + 存档）
// =====================

const textBox = document.getElementById("text");
const choicesBox = document.getElementById("choices");
const game = document.getElementById("game");
const characterImg = document.getElementById("character");

/* ★新增：记录当前场景，用于保存 */
let currentScene = "start";

function showScene(key) {
  const scene = scenes[key];
  if (!scene) return;

  currentScene = key; // ★新增：记录当前场景

  game.style.backgroundImage = `url(${scene.background})`;
  characterImg.src = scene.character || "";

  textBox.textContent = scene.text;
  choicesBox.innerHTML = "";

  // 动态生成选项
  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.onclick = () => showScene(choice.next);
    choicesBox.appendChild(btn);
  });
}

// =====================
// ★ 新增：主菜单功能
// =====================

// 显示主菜单
function showMainMenu() {
  document.getElementById("main-menu").style.display = "flex";

  const hasSave = loadProgress();
  const startBtn = document.getElementById("btn-start");
  const restartBtn = document.getElementById("btn-restart");

  if (hasSave) {
    startBtn.textContent = "继续故事";
    restartBtn.style.display = "block"; // 显示“重新开始”
  } else {
    startBtn.textContent = "开始";
    restartBtn.style.display = "none";
  }
}

// 点击开始/继续
function startGame() {
  const saved = loadProgress();
  showScene(saved || "start");
  document.getElementById("main-menu").style.display = "none";
}

// =====================
// ★ 新增：重新开始
// =====================

function confirmRestart() {
  document.getElementById("confirm-restart").style.display = "flex";
}

function doRestart() {
  clearProgress();
  showMainMenu();
  document.getElementById("confirm-restart").style.display = "none";
}

function closeRestart() {
  document.getElementById("confirm-restart").style.display = "none";
}

// =====================
// ★ 新增：游戏内菜单
// =====================

function openMenu() {
  const hasSave = loadProgress() === currentScene;
  document.getElementById("game-menu").style.display = "flex";
}

function closeMenu() {
  document.getElementById("game-menu").style.display = "none";
}

// 保存进度弹窗
function askSave() {
  document.getElementById("confirm-save").style.display = "flex";
}

function doSave() {
  saveProgress(currentScene);
  document.getElementById("confirm-save").style.display = "none";
  alert("已保存！");
}

function cancelSave() {
  document.getElementById("confirm-save").style.display = "none";
}

// 退出按钮
function askExit() {
  const saved = loadProgress();
  if (saved !== currentScene) {
    // 未保存，询问
    document.getElementById("confirm-exit").style.display = "flex";
  } else {
    // 已保存，直接退出
    showMainMenu();
  }
}

function exitWithoutSave() {
  showMainMenu();
  document.getElementById("confirm-exit").style.display = "none";
}

function saveAndExit() {
  saveProgress(currentScene);
  showMainMenu();
  document.getElementById("confirm-exit").style.display = "none";
}

function closeExit() {
  document.getElementById("confirm-exit").style.display = "none";
}

// =====================
// ★ 启动：先进入主菜单
// =====================
showMainMenu();