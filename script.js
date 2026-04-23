let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentChat = null;

// 📂 CREATE NEW CHAT
function newChat() {
  const id = "chat_" + Date.now();
  chats[id] = [];
  currentChat = id;
  saveChats();
  renderHistory();
  renderChat();
}

// 💾 SAVE
function saveChats() {
  localStorage.setItem("chats", JSON.stringify(chats));
}

// 📚 SIDEBAR
function renderHistory() {
  const history = document.getElementById("history");
  history.innerHTML = "";

  Object.keys(chats).forEach(id => {
    const btn = document.createElement("button");
    btn.className = "w-full text-left p-2 bg-gray-800 rounded";

    const firstMsg = chats[id][0]?.text || "New Chat";
    btn.innerText = firstMsg.slice(0, 20);

    btn.onclick = () => {
      currentChat = id;
      renderChat();
    };

    history.appendChild(btn);
  });
}

// 💬 RENDER CHAT
function renderChat() {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";

  if (!currentChat) return;

  chats[currentChat].forEach(msg => {
    addMessage(msg.text, msg.type, false);
  });
}

// ➕ ADD MESSAGE
function addMessage(text, type, save = true) {
  const chatBox = document.getElementById("chatBox");

  const msg = document.createElement("div");
  msg.className = "p-3 rounded max-w-[75%] " +
    (type === "user" ? "user ml-auto" : "ai");

  msg.innerText = text;
  chatBox.appendChild(msg);

  chatBox.scrollTop = chatBox.scrollHeight;

  if (save && currentChat) {
    chats[currentChat].push({ text, type });
    saveChats();
    renderHistory();
  }
}

// 🤖 AI CALL
async function learnTopic() {
  const topic = document.getElementById("topic").value;
  if (!topic || !currentChat) return;

  addMessage(topic, "user");
  document.getElementById("topic").value = "";

  document.getElementById("loader").classList.remove("hidden");

  try {
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic })
    });

    const data = await res.json();

    document.getElementById("loader").classList.add("hidden");
    addMessage(data.result, "ai");

  } catch (err) {
    document.getElementById("loader").classList.add("hidden");
    addMessage("Error: " + err.message, "ai");
  }
}

// INIT
newChat();
renderHistory();
