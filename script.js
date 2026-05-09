// =====================
// 剧情模板（你可以在这里创作）
// =====================
const scenes = {
  start: {
    background: "bg1.jpg", // 背景图
    character: "dean.png", // 立绘
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
// 引擎部分（无需修改）
// =====================
const textBox = document.getElementById("text");
const choicesBox = document.getElementById("choices");
const game = document.getElementById("game");
const characterImg = document.getElementById("character");

function showScene(key) {
  const scene = scenes[key];
  if (!scene) return;

  game.style.backgroundImage = `url(${scene.background})`;
  characterImg.src = scene.character || "";

  textBox.textContent = scene.text;
  choicesBox.innerHTML = "";

  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.onclick = () => showScene(choice.next);
    choicesBox.appendChild(btn);
  });
}

showScene("start");