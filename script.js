// =====================
// 存档系统
// =====================
function loadProgress() {
    return localStorage.getItem("spn_save_scene");
}

function saveProgress(sceneKey) {
    localStorage.setItem("spn_save_scene", sceneKey);
    hasUnsavedChanges = false; // 保存后标记为无改动
}

function clearProgress() {
    localStorage.removeItem("spn_save_scene");
}

// =====================
// 剧情数据
// =====================
const scenes = {
    start: {
        background: "images/motel_room.jpg",
        character: "images/dean_normal.png",
        text: "你在汽油味的汽车旅馆房间醒来，迪恩正靠在门边盯着你。",
        choices: [
            { text: "问：发生了什么？", next: "ask" },
            { text: "沉默看着他", next: "silent" }
        ]
    },
    ask: {
        background: "images/motel_room.jpg",
        character: "images/sam_worried.png",
        text: "山姆走了进来：“昨晚的猎杀把你累坏了，我们需要谈谈。”",
        choices: [{ text: "继续听他们说", next: "continue1" }]
    },
    silent: {
        background: "images/impala_interior.jpg",
        character: "images/dean_angry.png",
        text: "迪恩皱眉：“你这样让我有点不安。到底看到什么了？”",
        choices: [
            { text: "告诉他你看见的幻象", next: "vision" },
            { text: "摇头否认", next: "deny" }
        ]
    },
    continue1: {
        background: "images/library.jpg",
        character: "images/sam_normal.png",
        text: "山姆继续解释昨晚的情况……",
        choices: []
    }
};

// =====================
// 游戏引擎逻辑
// =====================
let currentScene = "start";
let hasUnsavedChanges = false; // 追踪当前进度是否未保存

function showScene(key) {
    const scene = scenes[key];
    if (!scene) return;

    currentScene = key;
    hasUnsavedChanges = true; // 切换了场景，意味着产生了新进度

    const gameEl = document.getElementById("game");
    gameEl.style.backgroundImage = `url(${scene.background})`;
    
    const charImg = document.getElementById("character");
    if(scene.character) {
        charImg.src = scene.character;
        charImg.classList.remove("hidden");
    } else {
        charImg.classList.add("hidden");
    }

    document.getElementById("text").textContent = scene.text;
    const choicesBox = document.getElementById("choices");
    choicesBox.innerHTML = "";

    scene.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = choice.text;
        btn.onclick = () => showScene(choice.next);
        choicesBox.appendChild(btn);
    });
}

// =====================
// UI 控制逻辑
// =====================
const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const btnLeft = document.getElementById("popup-left");
const btnRight = document.getElementById("popup-right");
const btnClose = document.getElementById("popup-close");

function updateMenuButtons() {
    const hasSave = loadProgress();
    const btnStart = document.getElementById("btn-start");
    const btnRestart = document.getElementById("btn-restart");

    if (hasSave) {
        btnStart.textContent = "继续故事";
        btnRestart.classList.remove("hidden");
    } else {
        btnStart.textContent = "开始";
        btnRestart.classList.add("hidden");
    }
}

// 按钮点击：开始/继续
document.getElementById("btn-start").onclick = () => {
    const saved = loadProgress();
    mainMenu.classList.add("hidden");
    gameScreen.classList.remove("active", "hidden");
    showScene(saved || "start");
    // 如果是读取的存档，刚进去时视为“已保存”
    if(saved) hasUnsavedChanges = false; 
};

// 按钮点击：重新开始
document.getElementById("btn-restart").onclick = () => {
    showPopup("是否删除当前进度？这个操作是无法反悔的，请慎重考虑。", "restart");
};

// 游戏内菜单开关
function toggleInGameMenu() {
    const menu = document.getElementById("ingame-menu");
    menu.classList.toggle("hidden");
}

// 游戏内：保存进度
document.getElementById("btn-save-progress").onclick = () => {
    toggleInGameMenu();
    showPopup("保存当前进度？", "save");
};

// 游戏内：退出
document.getElementById("btn-exit-game").onclick = () => {
    toggleInGameMenu();
    if (hasUnsavedChanges) {
        showPopup("保存当前进度？", "exit_check");
    } else {
        location.reload(); // 直接回到主菜单界面
    }
};

// =====================
// 弹窗逻辑中心
// =====================
function showPopup(text, mode) {
    popup.classList.remove("hidden");
    popupText.textContent = text;
    
    // 【修复】加上安全检查：只有在找到关闭按钮时才操作它，防止报错卡死
    if (btnClose) {
        btnClose.classList.add("hidden");
    }
    
    // 【修复】安全地移除颜色类，而不是粗暴地清空整个 className
    btnLeft.classList.remove("btn-green", "btn-red");
    btnRight.classList.remove("btn-green", "btn-red");

    // 清空旧的点击事件，防止重复绑定
    btnLeft.onclick = null;
    btnRight.onclick = null;

    if (mode === "restart") {
        // 要求：左边绿色按钮“否”，右边红色按钮“是”
        btnLeft.textContent = "否";
        btnLeft.classList.add("btn-green");
        btnRight.textContent = "是";
        btnRight.classList.add("btn-red");
        
        btnLeft.onclick = () => {
            popup.classList.add("hidden");
        };
        btnRight.onclick = () => {
            clearProgress();
            updateMenuButtons();
            popup.classList.add("hidden");
        };
    } 
    else if (mode === "save") {
        // 保存：左边红色按钮“否”，右边绿色按钮“是”
        btnLeft.textContent = "否";
        btnLeft.classList.add("btn-red");
        btnRight.textContent = "是";
        btnRight.classList.add("btn-green");

        btnLeft.onclick = () => {
            popup.classList.add("hidden");
        };
        btnRight.onclick = () => {
            saveProgress(currentScene);
            popup.classList.add("hidden");
            alert("进度已保存");
        };
    } 
    else if (mode === "exit_check") {
        // 退出：带右上角 X 按钮
        if (btnClose) {
            btnClose.classList.remove("hidden"); // 显示右上角X
            btnClose.onclick = () => popup.classList.add("hidden");
        }
        
        btnLeft.textContent = "不保存并退出";
        btnLeft.classList.add("btn-red");
        btnRight.textContent = "保存并退出";
        btnRight.classList.add("btn-green");

        btnLeft.onclick = () => location.reload();
        btnRight.onclick = () => {
            saveProgress(currentScene);
            location.reload();
        };
    }
}

// 初始化
updateMenuButtons();
