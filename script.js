// =============================================
// script.js - 撒旦不入天堂
// 互动小说 / Galgame 游戏逻辑
// =============================================

// ==================== 场景数据 ====================
// ★ 照葫芦画瓢：在这里添加/修改你的故事场景 ★
// 每个场景的字段说明：
//   background : 背景图路径，格式 /images/xxxx
//   speaker    : 说话者名字，显示在对话框左上角
//   text       : 对话文本内容
//   choices    : (可选) 选项数组，每个选项有 text(按钮文字) 和 nextId(目标场景ID)
//   nextId     : (可选) 如果没有choices，自动跳转到此场景ID
//   若既无choices也无nextId，则为结局场景
const scenes = {
    // ---- 示例场景 ----
    'prologue': {
        background: '/images/bg_hell_border.jpg',
        speaker: '旁白',
        text: '天堂与地狱的边界，雾气弥漫。撒旦站在灰色地带，凝视着远方那扇散发着柔和光芒的大门。他已经很久没有来到这里了。',
        choices: [
            { text: '迈步走向天堂之门', nextId: 'approach_gate' },
            { text: '驻足观望，犹豫不决', nextId: 'hesitate' },
            { text: '转身，返回地狱深处', nextId: 'return_hell' }
        ]
    },
    'approach_gate': {
        background: '/images/bg_heaven_gate.jpg',
        speaker: '撒旦',
        text: '光芒越来越亮，那扇门近在咫尺。他感受不到任何灼烧——这本应是地狱之主最畏惧的东西。',
        nextId: 'gatekeeper_appears'
    },
    'gatekeeper_appears': {
        background: '/images/bg_heaven_gate.jpg',
        speaker: '守门天使',
        text: '停下脚步，堕落者。天堂不欢迎你。你早已做出了选择。',
        choices: [
            { text: '「我来此并非寻求宽恕。」', nextId: 'explain_purpose' },
            { text: '沉默不语，继续向前', nextId: 'force_entry' }
        ]
    },
    'hesitate': {
        background: '/images/bg_gray_wasteland.jpg',
        speaker: '撒旦',
        text: '他停在这片灰色地带，寒风从地狱的方向吹来，也夹杂着天堂飘来的暖意。两种力量在他体内拉扯。',
        nextId: 'inner_voice'
    },
    'inner_voice': {
        background: '/images/bg_gray_wasteland.jpg',
        speaker: '内心的声音',
        text: '你究竟想要什么？是复仇？是和解？还是……只是想看看那扇门后面是否还留着你曾经的位置？',
        choices: [
            { text: '「我不知道。」', nextId: 'admit_uncertainty' },
            { text: '「我只是想亲眼看看。」', nextId: 'curiosity' }
        ]
    },
    'return_hell': {
        background: '/images/bg_hell_throne.jpg',
        speaker: '旁白',
        text: '撒旦转身，回到了属于他的王座。火焰在四周燃烧，臣民们跪拜在地。他闭上眼，那扇门的影像却依旧挥之不去。',
        nextId: 'hell_ending'
    },
    'hell_ending': {
        background: '/images/bg_hell_throne.jpg',
        speaker: '旁白',
        text: '他选择了熟悉的黑暗。但心中的疑问，或许永远不会有答案。\n\n—— 结局：王座之上 ——',
        // 无 choices 也无 nextId → 结局
    },
    'explain_purpose': {
        background: '/images/bg_heaven_gate.jpg',
        speaker: '撒旦',
        text: '「我来此并非寻求宽恕。我只想知道……当年的决定，是否真的不可逆转。」',
        nextId: 'angel_response'
    },
    'angel_response': {
        background: '/images/bg_heaven_gate.jpg',
        speaker: '守门天使',
        text: '天使沉默了片刻，眼中流露出一丝复杂的情绪。「每一个灵魂都有回头的可能……但你，撒旦，你是所有堕落者的象征。你进入天堂，意味着秩序的崩塌。」',
        choices: [
            { text: '「那就让秩序崩塌好了。」', nextId: 'rebellion_ending' },
            { text: '「我明白了。」转身离开', nextId: 'understanding_ending' }
        ]
    },
    'force_entry': {
        background: '/images/bg_heaven_gate_bright.jpg',
        speaker: '旁白',
        text: '撒旦没有回答，他的沉默本身便是回答。光芒大盛，一股力量将他推了回去。天堂之门，确实对他紧闭着。',
        nextId: 'rejected_ending'
    },
    'rejected_ending': {
        background: '/images/bg_gray_wasteland.jpg',
        speaker: '旁白',
        text: '他仰面倒在灰色地带，天空既不是天堂的金色也不是地狱的暗红。他笑了，笑声在空旷的原野上回荡。\n\n—— 结局：永恒的边界 ——',
    },
    'admit_uncertainty': {
        background: '/images/bg_gray_wasteland.jpg',
        speaker: '撒旦',
        text: '「我不知道。」他轻声承认。这或许是几千年来，他第一次对自己诚实。',
        nextId: 'dawn_arrives'
    },
    'curiosity': {
        background: '/images/bg_gray_wasteland.jpg',
        speaker: '撒旦',
        text: '「我只是想亲眼看看。」他的声音平静，「看看那个我曾经属于的地方，如今变成了什么模样。」',
        nextId: 'dawn_arrives'
    },
    'dawn_arrives': {
        background: '/images/bg_dawn.jpg',
        speaker: '旁白',
        text: '灰色地带的天际，第一次出现了黎明的曙光。那不是天堂的光，也不是地狱的火——那是属于撒旦自己的光。\n\n—— 结局：黎明 ——',
    },
    'rebellion_ending': {
        background: '/images/bg_heaven_gate_bright.jpg',
        speaker: '旁白',
        text: '撒旦的羽翼展开，黑暗与光明交织。他不再是堕落者，也不再是天使——他成为了崭新的存在。\n\n—— 结局：新生 ——',
    },
    'understanding_ending': {
        background: '/images/bg_gray_wasteland.jpg',
        speaker: '旁白',
        text: '他理解了。有些门关上了便不会再开，但这不代表前方没有路。撒旦转身，走向了那条属于他自己的道路。\n\n—— 结局：领悟 ——',
    }
};

// 初始场景ID（"开始"按钮从这里开始）
const INITIAL_SCENE_ID = 'prologue';

// localStorage 键名
const STORAGE_KEY_SAVED = 'satanGame_savedSceneId';
const STORAGE_KEY_SETTINGS = 'satanGame_settings';

// ==================== 游戏状态 ====================
let currentSceneId = null; // 当前场景ID
let savedSceneId = null; // 已保存的场景ID（从localStorage读取）
let isTextAnimating = false; // 是否正在逐字显示
let textAnimationTimer = null; // 逐字显示定时器
let fullText = ''; // 当前场景完整文本
let displayedTextLength = 0; // 已显示的字符数
let textSpeed = 35; // 文字速度（毫秒/字符），默认中等
let menuOpen = false; // 右上角菜单是否打开
let currentChoices = null; // 当前场景的选项

// ==================== DOM 元素引用 ====================
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const gameBg = document.getElementById('game-bg');
const speakerTag = document.getElementById('speaker-tag');
const dialogText = document.getElementById('dialog-text');
const choicesContainer = document.getElementById('choices-container');
const continueHint = document.getElementById('continue-hint');
const dialogClickArea = document.getElementById('dialog-click-area');
const dialogBox = document.getElementById('dialog-box');

const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnSettingsTitle = document.getElementById('btn-settings-title');
const btnMenuToggle = document.getElementById('btn-menu-toggle');
const menuDropdown = document.getElementById('menu-dropdown');
const btnSave = document.getElementById('btn-save');
const btnExit = document.getElementById('btn-exit');

const modalRestart = document.getElementById('modal-restart');
const modalSave = document.getElementById('modal-save');
const modalExit = document.getElementById('modal-exit');
const modalSettings = document.getElementById('modal-settings');

const btnRestartYes = document.getElementById('btn-restart-yes');
const btnRestartNo = document.getElementById('btn-restart-no');
const btnSaveYes = document.getElementById('btn-save-yes');
const btnSaveNo = document.getElementById('btn-save-no');
const btnExitSave = document.getElementById('btn-exit-save');
const btnExitNosave = document.getElementById('btn-exit-nosave');
const btnExitClose = document.getElementById('btn-exit-close');
const btnSettingsClose = document.getElementById('btn-settings-close');

const rangeTextSpeed = document.getElementById('range-text-speed');
const rangeBgm = document.getElementById('range-bgm');
const rangeSfx = document.getElementById('range-sfx');

// ==================== 初始化 ====================
function init() {
    loadSettings();
    loadSavedProgress();
    updateTitleButtons();
    showScreen('title');
    bindEvents();
    // 初始化设置面板的控件值
    rangeTextSpeed.value = Math.round(6 - (textSpeed / 15)); // 映射速度到1-5
    rangeBgm.value = 70;
    rangeSfx.value = 80;
}

function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (raw) {
            const settings = JSON.parse(raw);
            textSpeed = settings.textSpeed || 35;
        }
    } catch (e) {
        textSpeed = 35;
    }
}

function saveSettingsToStorage() {
    const settings = {
        textSpeed: textSpeed,
        bgmVolume: parseInt(rangeBgm.value) || 70,
        sfxVolume: parseInt(rangeSfx.value) || 80
    };
    try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
        // localStorage 不可用
    }
}

function loadSavedProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_SAVED);
        savedSceneId = saved ? saved : null;
    } catch (e) {
        savedSceneId = null;
    }
}

function updateTitleButtons() {
    if (savedSceneId && scenes[savedSceneId]) {
        // 有已保存的进度
        btnStart.textContent = '继续故事';
        btnStart.classList.add('has-progress');
        btnRestart.style.display = 'block';
    } else {
        btnStart.textContent = '开始';
        btnStart.classList.remove('has-progress');
        btnRestart.style.display = 'none';
    }
}

function showScreen(screenName) {
    titleScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    if (screenName === 'title') {
        titleScreen.classList.add('active');
        closeAllModals();
        closeMenu();
    } else if (screenName === 'game') {
        gameScreen.classList.add('active');
        closeAllModals();
        closeMenu();
    }
}

// ==================== 事件绑定 ====================
function bindEvents() {
    // 标题界面按钮
    btnStart.addEventListener('click', onStartOrContinue);
    btnRestart.addEventListener('click', onRestartClick);
    btnSettingsTitle.addEventListener('click', () => openModal(modalSettings));

    // 右上角菜单
    btnMenuToggle.addEventListener('click', toggleMenu);
    document.addEventListener('click', onDocumentClick);

    // 菜单选项
    btnSave.addEventListener('click', () => {
        closeMenu();
        openModal(modalSave);
    });
    btnExit.addEventListener('click', () => {
        closeMenu();
        onExitClick();
    });

    // 弹窗按钮
    btnRestartYes.addEventListener('click', onRestartConfirm);
    btnRestartNo.addEventListener('click', () => closeModal(modalRestart));
    btnSaveYes.addEventListener('click', onSaveConfirm);
    btnSaveNo.addEventListener('click', () => closeModal(modalSave));
    btnExitSave.addEventListener('click', onExitSaveConfirm);
    btnExitNosave.addEventListener('click', onExitNosaveConfirm);
    btnExitClose.addEventListener('click', () => closeModal(modalExit));
    btnSettingsClose.addEventListener('click', () => {
        applySettingsFromPanel();
        closeModal(modalSettings);
    });

    // 对话框点击（继续/跳过动画）
    dialogClickArea.addEventListener('click', onDialogClick);

    // 键盘事件
    document.addEventListener('keydown', onKeyDown);

    // 设置面板实时预览
    rangeTextSpeed.addEventListener('input', () => {
        // 实时更新文字速度（但不保存）
        const val = parseInt(rangeTextSpeed.value);
        textSpeed = Math.round((6 - val) * 15);
        if (textSpeed < 5) textSpeed = 5;
    });
}

function onDocumentClick(e) {
    // 点击右上角菜单外部时关闭菜单
    if (menuOpen) {
        const wrapper = document.getElementById('game-menu-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            closeMenu();
        }
    }
}

// ==================== 菜单 ====================
function toggleMenu() {
    if (menuOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

function openMenu() {
    menuDropdown.style.display = 'block';
    menuOpen = true;
}

function closeMenu() {
    menuDropdown.style.display = 'none';
    menuOpen = false;
}

// ==================== 弹窗系统 ====================
function openModal(modalEl) {
    closeAllModals();
    modalEl.style.display = 'flex';
}

function closeModal(modalEl) {
    modalEl.style.display = 'none';
}

function closeAllModals() {
    modalRestart.style.display = 'none';
    modalSave.style.display = 'none';
    modalExit.style.display = 'none';
    modalSettings.style.display = 'none';
}

function isAnyModalOpen() {
    return modalRestart.style.display === 'flex' ||
        modalSave.style.display === 'flex' ||
        modalExit.style.display === 'flex' ||
        modalSettings.style.display === 'flex';
}

// ==================== 游戏逻辑 ====================
function onStartOrContinue() {
    if (savedSceneId && scenes[savedSceneId]) {
        // 继续故事
        loadScene(savedSceneId);
    } else {
        // 新游戏
        loadScene(INITIAL_SCENE_ID);
        // 清除旧存档（如果有的话，确保干净开始）
        // 注意：不清除savedSceneId，直到玩家主动保存
    }
    showScreen('game');
}

function onRestartClick() {
    openModal(modalRestart);
}

function onRestartConfirm() {
    // 删除进度
    try {
        localStorage.removeItem(STORAGE_KEY_SAVED);
    } catch (e) { }
    savedSceneId = null;
    currentSceneId = null;
    updateTitleButtons();
    closeModal(modalRestart);
    // 保持在标题界面
}

function onSaveConfirm() {
    // 保存当前进度
    if (currentSceneId && scenes[currentSceneId]) {
        savedSceneId = currentSceneId;
        try {
            localStorage.setItem(STORAGE_KEY_SAVED, currentSceneId);
        } catch (e) { }
        updateTitleButtons();
    }
    closeModal(modalSave);
    // 可以给一个短暂的视觉反馈（可选）
    flashSaveIndicator();
}

function flashSaveIndicator() {
    // 简单的保存成功提示：短暂改变对话框边框颜色
    const origBorder = dialogBox.style.borderTopColor;
    dialogBox.style.borderTopColor = '#4CAF50';
    dialogBox.style.transition = 'border-top-color 0.3s';
    setTimeout(() => {
        dialogBox.style.borderTopColor = origBorder || '';
        setTimeout(() => {
            dialogBox.style.transition = '';
        }, 400);
    }, 600);
}

function onExitClick() {
    // 检查是否有未保存的进度
    if (currentSceneId && currentSceneId !== savedSceneId) {
        // 有未保存的进度
        openModal(modalExit);
    } else {
        // 没有未保存的进度，直接返回标题
        returnToTitle();
    }
}

function onExitSaveConfirm() {
    // 保存并退出
    if (currentSceneId && scenes[currentSceneId]) {
        savedSceneId = currentSceneId;
        try {
            localStorage.setItem(STORAGE_KEY_SAVED, currentSceneId);
        } catch (e) { }
        updateTitleButtons();
    }
    closeModal(modalExit);
    returnToTitle();
}

function onExitNosaveConfirm() {
    // 不保存并退出
    closeModal(modalExit);
    returnToTitle();
}

function returnToTitle() {
    stopTextAnimation();
    currentChoices = null;
    showScreen('title');
    updateTitleButtons();
}

// ==================== 场景加载与显示 ====================
function loadScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error('场景不存在:', sceneId);
        return;
    }

    stopTextAnimation();
    currentSceneId = sceneId;
    currentChoices = scene.choices || null;

    // 更新背景
    gameBg.style.backgroundImage = `url('${scene.background}')`;

    // 更新说话者
    speakerTag.textContent = scene.speaker || '???';

    // 清除选项
    choicesContainer.innerHTML = '';
    dialogClickArea.classList.remove('has-choices');

    // 显示文本（逐字动画）
    fullText = scene.text || '';
    displayedTextLength = 0;
    dialogText.textContent = '';
    continueHint.classList.add('hidden');

    if (currentChoices) {
        // 有选项时，先显示文本，文本显示完后出现选项
        startTextAnimation(() => {
            showChoices(currentChoices);
            dialogClickArea.classList.add('has-choices');
            continueHint.classList.add('hidden');
        });
    } else if (scene.nextId) {
        // 有下一场景，文本显示完后显示继续提示
        startTextAnimation(() => {
            continueHint.classList.remove('hidden');
            dialogClickArea.classList.remove('has-choices');
        });
    } else {
        // 结局场景，文本显示完后显示"返回标题"提示
        startTextAnimation(() => {
            continueHint.classList.remove('hidden');
            continueHint.textContent = '▼ 点击返回标题';
            dialogClickArea.classList.remove('has-choices');
        });
    }
}

function startTextAnimation(onComplete) {
    stopTextAnimation();
    isTextAnimating = true;
    displayedTextLength = 0;
    dialogText.textContent = '';

    if (textSpeed <= 5 || fullText.length === 0) {
        // 速度极快或空文本，直接显示全部
        dialogText.textContent = fullText;
        displayedTextLength = fullText.length;
        isTextAnimating = false;
        if (onComplete) onComplete();
        return;
    }

    const charsPerTick = 1;
    let index = 0;

    function tick() {
        index += charsPerTick;
        if (index >= fullText.length) {
            dialogText.textContent = fullText;
            displayedTextLength = fullText.length;
            isTextAnimating = false;
            textAnimationTimer = null;
            if (onComplete) onComplete();
            return;
        }
        displayedTextLength = index;
        dialogText.textContent = fullText.substring(0, index);
        textAnimationTimer = setTimeout(tick, textSpeed);
    }

    textAnimationTimer = setTimeout(tick, textSpeed);
}

function stopTextAnimation() {
    if (textAnimationTimer) {
        clearTimeout(textAnimationTimer);
        textAnimationTimer = null;
    }
    isTextAnimating = false;
}

function skipTextAnimation() {
    if (isTextAnimating) {
        stopTextAnimation();
        dialogText.textContent = fullText;
        displayedTextLength = fullText.length;
        // 触发完成回调
        onTextAnimationComplete();
    }
}

function onTextAnimationComplete() {
    const scene = scenes[currentSceneId];
    if (!scene) return;

    if (currentChoices && choicesContainer.children.length === 0) {
        // 显示选项
        showChoices(currentChoices);
        dialogClickArea.classList.add('has-choices');
        continueHint.classList.add('hidden');
    } else if (scene.nextId) {
        continueHint.classList.remove('hidden');
        continueHint.textContent = '▼ 点击继续';
        dialogClickArea.classList.remove('has-choices');
    } else if (!currentChoices) {
        // 结局
        continueHint.classList.remove('hidden');
        continueHint.textContent = '▼ 点击返回标题';
        dialogClickArea.classList.remove('has-choices');
    }
}

function showChoices(choices) {
    choicesContainer.innerHTML = '';
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (choice.nextId && scenes[choice.nextId]) {
                currentChoices = null;
                choicesContainer.innerHTML = '';
                continueHint.classList.add('hidden');
                dialogClickArea.classList.remove('has-choices');
                loadScene(choice.nextId);
            }
        });
        choicesContainer.appendChild(btn);
    });
}

function onDialogClick() {
    if (isAnyModalOpen()) return;

    if (isTextAnimating) {
        // 跳过动画
        skipTextAnimation();
        return;
    }

    // 文本已完全显示
    const scene = scenes[currentSceneId];
    if (!scene) return;

    if (currentChoices) {
        // 有选项时，点击对话框不做跳转（需要点击具体选项）
        return;
    }

    if (scene.nextId && scenes[scene.nextId]) {
        // 进入下一场景
        continueHint.classList.add('hidden');
        loadScene(scene.nextId);
    } else if (!scene.nextId && !currentChoices) {
        // 结局，返回标题
        returnToTitle();
    }
}

function onKeyDown(e) {
    if (isAnyModalOpen()) {
        // 弹窗打开时，按Escape关闭最上层弹窗
        if (e.key === 'Escape') {
            if (modalExit.style.display === 'flex') closeModal(modalExit);
            else if (modalSave.style.display === 'flex') closeModal(modalSave);
            else if (modalRestart.style.display === 'flex') closeModal(modalRestart);
            else if (modalSettings.style.display === 'flex') {
                applySettingsFromPanel();
                closeModal(modalSettings);
            }
        }
        return;
    }

    if (gameScreen.classList.contains('active')) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            onDialogClick();
        }
        if (e.key === 'Escape') {
            // 在游戏中按Esc打开退出流程
            onExitClick();
        }
    }
}

// ==================== 设置面板 ====================
function applySettingsFromPanel() {
    const val = parseInt(rangeTextSpeed.value);
    textSpeed = Math.round((6 - val) * 15);
    if (textSpeed < 5) textSpeed = 5;
    saveSettingsToStorage();
}

// ==================== 启动 ====================
init();

console.log('✨《撒旦不入天堂》互动小说模板已就绪');
console.log('  - 标题界面已加载');
console.log('  - 场景数据包含 ' + Object.keys(scenes).length + ' 个场景');
console.log('  - 已保存进度:', savedSceneId || '无');
console.log('  - 文字速度:', textSpeed + 'ms/字符');
console.log('  🖊️ 照葫芦画瓢：编辑 script.js 中的 scenes 对象来编写你的故事');