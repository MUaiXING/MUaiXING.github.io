// ==================== 场景数据 ====================
// 这是您的故事数据模板，请照葫芦画瓢来编写自己的故事
// type: 'dialogue' | 'choice' | 'narration' | 'end'
// speaker: 说话人（dialogue和choice类型使用，narration和end不需要）
// text: 对话内容或全屏文字
// background: 场景背景图路径，格式 /images/xxxx
// nextId: 下一个场景的id（dialogue和narration类型使用）
// choices: 选项数组（仅choice类型使用），每个选项包含 text 和 nextId
// end类型：显示结局文字后返回标题界面，清除进度

const SCENES = [
    // ===== 示例场景0：普通对话 =====
    {
        id: 0,
        type: 'dialogue',
        background: '/images/scene-church.jpg',
        speaker: '旁白',
        text: '天堂之门紧闭，钟声在虚空中回荡。撒旦站在云层之上，望向那遥不可及的光。',
        nextId: 1
    },
    // ===== 示例场景1：全屏叙述（无对话框） =====
    {
        id: 1,
        type: 'narration',
        background: '/images/scene-sky.jpg',
        text: '千百年来，他从未想过要踏入那片圣地。\n但今天，一切都将改变。',
        nextId: 2
    },
    // ===== 示例场景2：选择分支 =====
    {
        id: 2,
        type: 'choice',
        background: '/images/scene-gate.jpg',
        speaker: '撒旦',
        text: '我该怎么做？',
        choices: [
            { text: '叩响天堂之门', nextId: 3 },
            { text: '转身离开，回到地狱', nextId: 5 }
        ]
    },
    // ===== 示例场景3：分支A - 对话 =====
    {
        id: 3,
        type: 'dialogue',
        background: '/images/scene-gate-knock.jpg',
        speaker: '天使长',
        text: '谁在外面？这里不欢迎你。',
        nextId: 4
    },
    // ===== 示例场景4：分支A - 结局 =====
    {
        id: 4,
        type: 'end',
        background: '/images/scene-ending-a.jpg',
        text: '天堂之门始终没有为他打开。\n但撒旦第一次感受到，那扇门后传来的微光，似乎不再那么遥远。\n\n——结局A：叩门者',
        nextId: null
    },
    // ===== 示例场景5：分支B - 对话 =====
    {
        id: 5,
        type: 'dialogue',
        background: '/images/scene-hell.jpg',
        speaker: '撒旦',
        text: '也许那里本就不属于我。地狱才是我的归宿。',
        nextId: 6
    },
    // ===== 示例场景6：分支B - 全屏叙述 =====
    {
        id: 6,
        type: 'narration',
        background: '/images/scene-hell-throne.jpg',
        text: '他回到那熟悉的王座，火焰依旧在四周燃烧。\n只是这一次，他看向上方的目光中，多了一丝难以言说的情绪。',
        nextId: 7
    },
    // ===== 示例场景7：分支B - 结局 =====
    {
        id: 7,
        type: 'end',
        background: '/images/scene-ending-b.jpg',
        text: '撒旦依然是地狱之主。\n但那一天在天堂门前的徘徊，成为了他永恒的秘密。\n\n——结局B：归位者',
        nextId: null
    }
];

// ==================== 游戏状态 ====================
const STORAGE_KEY_PROGRESS = 'satan_heaven_game_progress';
const STORAGE_KEY_SETTINGS = 'satan_heaven_game_settings';

const gameState = {
    currentSceneId: 0,
    lastSavedSceneId: null, // 上次保存的场景ID，用于判断是否需要提示保存
    isTyping: false, // 是否正在逐字显示
    typingTimer: null,
    typingIndex: 0,
    fullText: '',
    currentScene: null,
    choiceVisible: false,
    narrationVisible: false,
    isTransitioning: false, // 防止快速点击
};

// ==================== 设置 ====================
const defaultSettings = {
    textSpeed: 50, // 逐字显示速度（ms/字符）
    bgmVolume: 80,
    sfxVolume: 80,
};

let settings = { ...defaultSettings };

// ==================== DOM元素缓存 ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// 标题界面
const titleScreen = $('#title-screen');
const titleButtons = $('#title-buttons');

// 游戏界面
const gameScreen = $('#game-screen');
const sceneBgImg = $('#scene-bg-img');
const sceneBackground = $('#scene-background');
const narrationOverlay = $('#narration-overlay');
const narrationText = $('#narration-text');
const dialogueBox = $('#dialogue-box');
const dialogueSpeaker = $('#dialogue-speaker');
const dialogueText = $('#dialogue-text');
const dialogueChoices = $('#dialogue-choices');
const dialogueHint = $('#dialogue-hint');
const gameMenuBtn = $('#game-menu-btn');
const gameDropdown = $('#game-dropdown');
const dropdownBackdrop = $('#dropdown-backdrop');

// 模态弹窗
const modalRestartOverlay = $('#modal-restart-overlay');
const modalSaveOverlay = $('#modal-save-overlay');
const modalExitOverlay = $('#modal-exit-overlay');
const modalSettingsOverlay = $('#modal-settings-overlay');

// 设置元素
const settingsTextSpeed = $('#settings-text-speed');
const settingsBgmVolume = $('#settings-bgm-volume');
const settingsSfxVolume = $('#settings-sfx-volume');
const settingsSpeedLabel = $('#settings-speed-label');
const settingsBgmLabel = $('#settings-bgm-label');
const settingsSfxLabel = $('#settings-sfx-label');

// ==================== 工具函数 ====================
function hasProgress() {
    return localStorage.getItem(STORAGE_KEY_PROGRESS) !== null;
}

function getSavedProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_PROGRESS);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function saveProgressToStorage(sceneId) {
    const data = { sceneId: sceneId, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
    gameState.lastSavedSceneId = sceneId;
}

function deleteProgressFromStorage() {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    gameState.lastSavedSceneId = null;
}

function loadSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (data) {
            settings = { ...defaultSettings, ...JSON.parse(data) };
        }
    } catch {
        settings = { ...defaultSettings };
    }
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

function isProgressDirty() {
    return gameState.lastSavedSceneId !== null && gameState.currentSceneId !== gameState.lastSavedSceneId;
}

// ==================== 标题界面 ====================
function renderTitleButtons() {
    const hasProg = hasProgress();
    let html = '';

    if (hasProg) {
        html += '<button class="title-btn title-btn-start" id="btn-continue">继续故事</button>';
        html += '<button class="title-btn title-btn-restart" id="btn-restart">重新开始</button>';
    } else {
        html += '<button class="title-btn title-btn-start" id="btn-start">开始</button>';
    }
    html += '<button class="title-btn title-btn-settings" id="btn-settings-title">设置</button>';

    titleButtons.innerHTML = html;

    // 绑定事件
    if (hasProg) {
        $('#btn-continue')?.addEventListener('click', onContinueStory);
        $('#btn-restart')?.addEventListener('click', onRestartClick);
    } else {
        $('#btn-start')?.addEventListener('click', onStartGame);
    }
    $('#btn-settings-title')?.addEventListener('click', openSettingsModal);
}

function showTitleScreen() {
    // 确保游戏界面内容不可见
    gameScreen.classList.remove('active');
    narrationOverlay.classList.remove('active');
    dialogueBox.classList.remove('active');
    dialogueChoices.classList.remove('active');
    gameDropdown.classList.remove('open');
    dropdownBackdrop.classList.remove('active');
    closeAllModals();

    titleScreen.classList.add('active');
    renderTitleButtons();
}

function showGameScreen() {
    titleScreen.classList.remove('active');
    gameScreen.classList.add('active');
}

// ==================== 场景加载与渲染 ====================
function findScene(id) {
    return SCENES.find(s => s.id === id) || null;
}

function loadScene(sceneId) {
    if (gameState.isTransitioning) return;
    gameState.isTransitioning = true;

    const scene = findScene(sceneId);
    if (!scene) {
        // 场景不存在，返回标题
        returnToTitle();
        return;
    }

    gameState.currentSceneId = sceneId;
    gameState.currentScene = scene;
    gameState.choiceVisible = false;
    gameState.narrationVisible = false;
    gameState.isTyping = false;
    if (gameState.typingTimer) clearTimeout(gameState.typingTimer);
    gameState.typingTimer = null;
    gameState.typingIndex = 0;
    gameState.fullText = '';

    // 切换背景
    changeBackground(scene.background, () => {
        // 根据场景类型渲染
        switch (scene.type) {
            case 'dialogue':
                renderDialogue(scene);
                break;
            case 'choice':
                renderDialogue(scene); // choice先显示对话，选项在文字完成后出现
                break;
            case 'narration':
                renderNarration(scene);
                break;
            case 'end':
                renderNarration(scene); // end类似narration，但点击后返回标题
                break;
            default:
                renderDialogue(scene);
        }
        gameState.isTransitioning = false;
    });
}

function changeBackground(newSrc, callback) {
    // 淡出
    sceneBackground.style.opacity = '0.5';
    setTimeout(() => {
        sceneBgImg.src = newSrc || '';
        // 等待图片加载
        const img = new Image();
        img.onload = () => {
            sceneBackground.style.opacity = '1';
            if (callback) setTimeout(callback, 200);
        };
        img.onerror = () => {
            sceneBackground.style.opacity = '1';
            if (callback) setTimeout(callback, 200);
        };
        img.src = newSrc || '';
        // 兜底：如果加载太慢
        setTimeout(() => {
            if (sceneBackground.style.opacity === '0.5') {
                sceneBackground.style.opacity = '1';
                if (callback) callback();
            }
        }, 1200);
    }, 250);
}

// ==================== 对话渲染 ====================
function renderDialogue(scene) {
    // 隐藏全屏文字
    narrationOverlay.classList.remove('active');
    narrationText.classList.remove('visible');
    gameState.narrationVisible = false;

    // 显示对话框
    dialogueBox.classList.add('active');
    dialogueChoices.classList.remove('active');
    dialogueSpeaker.textContent = scene.speaker || '';
    dialogueText.textContent = '';
    dialogueHint.style.opacity = '0.7';
    gameState.choiceVisible = false;

    // 逐字显示
    gameState.fullText = scene.text || '';
    gameState.typingIndex = 0;
    gameState.isTyping = true;
    if (gameState.typingTimer) clearTimeout(gameState.typingTimer);
    typeNextChar();
}

function typeNextChar() {
    if (!gameState.isTyping) return;
    if (gameState.typingIndex >= gameState.fullText.length) {
        // 文字显示完毕
        gameState.isTyping = false;
        gameState.typingTimer = null;
        dialogueText.textContent = gameState.fullText;
        // 如果是choice类型，显示选项
        if (gameState.currentScene && gameState.currentScene.type === 'choice') {
            showChoices(gameState.currentScene);
        }
        return;
    }
    dialogueText.textContent = gameState.fullText.substring(0, gameState.typingIndex + 1);
    gameState.typingIndex++;
    gameState.typingTimer = setTimeout(typeNextChar, settings.textSpeed);
}

function skipTyping() {
    if (gameState.isTyping) {
        // 立即完成文字显示
        gameState.isTyping = false;
        if (gameState.typingTimer) clearTimeout(gameState.typingTimer);
        gameState.typingTimer = null;
        gameState.typingIndex = gameState.fullText.length;
        dialogueText.textContent = gameState.fullText;
        // 如果是choice类型，显示选项
        if (gameState.currentScene && gameState.currentScene.type === 'choice') {
            showChoices(gameState.currentScene);
        }
        return true; // 表示跳过了逐字显示
    }
    return false; // 文字已显示完毕
}

function showChoices(scene) {
    if (!scene.choices || scene.choices.length === 0) return;
    dialogueChoices.innerHTML = '';
    scene.choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (gameState.isTransitioning) return;
            loadScene(choice.nextId);
        });
        dialogueChoices.appendChild(btn);
    });
    dialogueChoices.classList.add('active');
    dialogueBox.classList.add('has-choices');
    dialogueHint.style.opacity = '0';
    gameState.choiceVisible = true;
}

// ==================== 全屏叙述渲染 ====================
function renderNarration(scene) {
    // 隐藏对话框
    dialogueBox.classList.remove('active');
    dialogueChoices.classList.remove('active');
    dialogueBox.classList.remove('has-choices');
    dialogueHint.style.opacity = '0';
    gameState.choiceVisible = false;
    gameState.isTyping = false;
    if (gameState.typingTimer) clearTimeout(gameState.typingTimer);
    gameState.typingTimer = null;

    // 显示全屏文字层
    narrationText.textContent = scene.text || '';
    narrationText.classList.remove('visible');
    narrationOverlay.classList.add('active');
    gameState.narrationVisible = true;

    // 触发渐显动画
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            narrationText.classList.add('visible');
        });
    });
}

// ==================== 对话框点击处理 ====================
dialogueBox.addEventListener('click', (e) => {
    // 如果点击的是选项按钮，不处理
    if (e.target.classList.contains('choice-btn')) return;
    if (gameState.isTransitioning) return;
    if (!dialogueBox.classList.contains('active')) return;

    // 如果选项可见，不处理（需要点击选项）
    if (gameState.choiceVisible) return;

    // 如果正在逐字显示，跳过
    if (gameState.isTyping) {
        skipTyping();
        return;
    }

    // 文字已显示完毕，推进场景
    const scene = gameState.currentScene;
    if (scene && (scene.type === 'dialogue')) {
        if (scene.nextId !== null && scene.nextId !== undefined) {
            loadScene(scene.nextId);
        } else {
            returnToTitle();
        }
    }
});

// ==================== 全屏文字点击处理 ====================
narrationOverlay.addEventListener('click', () => {
    if (gameState.isTransitioning) return;
    if (!gameState.narrationVisible) return;

    const scene = gameState.currentScene;
    if (!scene) return;

    if (scene.type === 'end') {
        // 结局：清除进度并返回标题
        deleteProgressFromStorage();
        returnToTitle();
    } else if (scene.type === 'narration') {
        if (scene.nextId !== null && scene.nextId !== undefined) {
            loadScene(scene.nextId);
        } else {
            returnToTitle();
        }
    }
});

// ==================== 右上角菜单 ====================
gameMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = gameDropdown.classList.contains('open');
    if (isOpen) {
        closeDropdown();
    } else {
        openDropdown();
    }
});

dropdownBackdrop.addEventListener('click', () => {
    closeDropdown();
});

function openDropdown() {
    gameDropdown.classList.add('open');
    dropdownBackdrop.classList.add('active');
}

function closeDropdown() {
    gameDropdown.classList.remove('open');
    dropdownBackdrop.classList.remove('active');
}

// 保存进度选项
$('#dropdown-save').addEventListener('click', () => {
    closeDropdown();
    openSaveModal();
});

// 退出选项
$('#dropdown-exit').addEventListener('click', () => {
    closeDropdown();
    if (isProgressDirty()) {
        openExitModal();
    } else {
        // 进度已保存，直接退出
        returnToTitle();
    }
});

// ==================== 模态弹窗管理 ====================
function closeAllModals() {
    modalRestartOverlay.classList.remove('active');
    modalSaveOverlay.classList.remove('active');
    modalExitOverlay.classList.remove('active');
    modalSettingsOverlay.classList.remove('active');
}

// --- 重新开始弹窗 ---
function onRestartClick() {
    closeAllModals();
    modalRestartOverlay.classList.add('active');
}

$('#modal-restart-no').addEventListener('click', () => {
    modalRestartOverlay.classList.remove('active');
});

$('#modal-restart-yes').addEventListener('click', () => {
    deleteProgressFromStorage();
    modalRestartOverlay.classList.remove('active');
    renderTitleButtons();
});

// --- 保存弹窗 ---
function openSaveModal() {
    closeAllModals();
    modalSaveOverlay.classList.add('active');
}

$('#modal-save-no').addEventListener('click', () => {
    modalSaveOverlay.classList.remove('active');
});

$('#modal-save-yes').addEventListener('click', () => {
    saveProgressToStorage(gameState.currentSceneId);
    modalSaveOverlay.classList.remove('active');
});

// --- 退出弹窗（含X按钮） ---
function openExitModal() {
    closeAllModals();
    modalExitOverlay.classList.add('active');
}

$('#modal-exit-x').addEventListener('click', () => {
    modalExitOverlay.classList.remove('active');
});

$('#modal-exit-nosave').addEventListener('click', () => {
    modalExitOverlay.classList.remove('active');
    returnToTitle();
});

$('#modal-exit-save').addEventListener('click', () => {
    saveProgressToStorage(gameState.currentSceneId);
    modalExitOverlay.classList.remove('active');
    returnToTitle();
});

// --- 设置弹窗 ---
function openSettingsModal() {
    closeAllModals();
    // 同步设置值到UI
    settingsTextSpeed.value = settings.textSpeed;
    settingsBgmVolume.value = settings.bgmVolume;
    settingsSfxVolume.value = settings.sfxVolume;
    settingsSpeedLabel.textContent = settings.textSpeed + 'ms';
    settingsBgmLabel.textContent = settings.bgmVolume + '%';
    settingsSfxLabel.textContent = settings.sfxVolume + '%';
    modalSettingsOverlay.classList.add('active');
}

$('#modal-settings-x').addEventListener('click', () => {
    // 关闭时不保存设置变更（用户需要点确认按钮）
    modalSettingsOverlay.classList.remove('active');
});

$('#modal-settings-close').addEventListener('click', () => {
    // 保存设置
    settings.textSpeed = parseInt(settingsTextSpeed.value);
    settings.bgmVolume = parseInt(settingsBgmVolume.value);
    settings.sfxVolume = parseInt(settingsSfxVolume.value);
    saveSettings();
    modalSettingsOverlay.classList.remove('active');
});

// 设置滑块实时更新标签
settingsTextSpeed.addEventListener('input', () => {
    settingsSpeedLabel.textContent = settingsTextSpeed.value + 'ms';
});
settingsBgmVolume.addEventListener('input', () => {
    settingsBgmLabel.textContent = settingsBgmVolume.value + '%';
});
settingsSfxVolume.addEventListener('input', () => {
    settingsSfxLabel.textContent = settingsSfxVolume.value + '%';
});

// ==================== 标题界面按钮事件 ====================
function onStartGame() {
    gameState.currentSceneId = 0;
    gameState.lastSavedSceneId = null;
    showGameScreen();
    loadScene(0);
}

function onContinueStory() {
    const progress = getSavedProgress();
    if (progress && progress.sceneId !== undefined) {
        gameState.currentSceneId = progress.sceneId;
        gameState.lastSavedSceneId = progress.sceneId;
        showGameScreen();
        loadScene(progress.sceneId);
    } else {
        // 进度数据损坏，回退
        deleteProgressFromStorage();
        renderTitleButtons();
        onStartGame();
    }
}

// ==================== 返回标题界面 ====================
function returnToTitle() {
    gameState.isTransitioning = false;
    gameState.isTyping = false;
    if (gameState.typingTimer) clearTimeout(gameState.typingTimer);
    gameState.typingTimer = null;
    gameState.choiceVisible = false;
    gameState.narrationVisible = false;

    narrationOverlay.classList.remove('active');
    narrationText.classList.remove('visible');
    dialogueBox.classList.remove('active');
    dialogueChoices.classList.remove('active');
    dialogueBox.classList.remove('has-choices');
    closeDropdown();
    closeAllModals();

    showTitleScreen();
}

// ==================== 键盘快捷键（桌面端） ====================
document.addEventListener('keydown', (e) => {
    // ESC关闭所有弹窗
    if (e.key === 'Escape') {
        if (modalRestartOverlay.classList.contains('active') ||
            modalSaveOverlay.classList.contains('active') ||
            modalExitOverlay.classList.contains('active') ||
            modalSettingsOverlay.classList.contains('active')) {
            closeAllModals();
            return;
        }
        if (gameDropdown.classList.contains('open')) {
            closeDropdown();
            return;
        }
    }
    // 空格或回车推进对话
    if ((e.key === ' ' || e.key === 'Enter') && gameScreen.classList.contains('active')) {
        if (modalRestartOverlay.classList.contains('active') ||
            modalSaveOverlay.classList.contains('active') ||
            modalExitOverlay.classList.contains('active') ||
            modalSettingsOverlay.classList.contains('active')) {
            return;
        }
        if (gameDropdown.classList.contains('open')) return;
        if (gameState.narrationVisible && narrationOverlay.classList.contains('active')) {
            narrationOverlay.click();
            return;
        }
        if (dialogueBox.classList.contains('active') && !gameState.choiceVisible) {
            dialogueBox.click();
            return;
        }
    }
});

// ==================== 初始化 ====================
function init() {
    loadSettings();
    // 初始显示标题界面
    showTitleScreen();
    // 预加载标题背景（fallback已由CSS处理）
    sceneBgImg.src = '';
    sceneBackground.style.opacity = '1';
}

// 启动
init();

console.log('《撒旦不入天堂》互动小说模板已就绪。');
console.log('请修改 SCENES 数组来编写您的故事。');
console.log('图片路径格式：/images/xxxx，请将实际图片放入对应目录。');
console.log('支持场景类型：dialogue（对话）、choice（选项）、narration（全屏文字）、end（结局）。');