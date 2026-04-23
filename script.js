let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentChat = null;

// 🔐 LOGIN
function showLogin() {
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function login() {
  const name = document.getElementById("username").value;
  if (!name) return;

  localStorage.setItem("user", name);
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  newChat();
  renderHistory();
}

// 📂 NEW CHAT
function newChat() {
  const id = "chat_" + Date.now();
  chats[id] = { title: "New Chat", messages: [] };
  currentChat = id;
  saveChats();
  renderHistory();
  renderChat();
}

// 💾 SAVE
function saveChats() {
  localStorage.setItem("chats", JSON.stringify(chats));
}

// 📚 HISTORY
function renderHistory() {
  const history = document.getElementById("history");
  history.innerHTML = "";

  Object.keys(chats).forEach(id => {
    const div = document.createElement("div");
    div.className = "p-2 bg-gray-800 rounded flex justify-between items-center";

    const title = document.createElement("span");
    title.innerText = chats[id].title.slice(0,15);

    title.onclick = () => {
      currentChat = id;
      renderChat();
    };

    // ✏️ rename
    const rename = document.createElement("button");
    rename.innerText = "✏️";
    rename.onclick = () => {
      const newName = prompt("Rename chat:");
      if (newName) chats[id].title = newName;
      saveChats();
      renderHistory();
    };

    // 🗑 delete
    const del = document.createElement("button");
    del.innerText = "🗑";
    del.onclick = () => {
      delete chats[id];
      currentChat = null;
      saveChats();
      renderHistory();
      document.getElementById("chatBox").innerHTML = "";
    };

    div.append(title, rename, del);
    history.appendChild(div);
  });
}

// 💬 CHAT RENDER
function renderChat() {
  const box = document.getElementById("chatBox");
  box.innerHTML = "";

  chats[currentChat].messages.forEach(m => {
    addMessage(m.text, m.type, false);
  });
}

// 🧠 MARKDOWN FORMAT
function format(text) {
  return text
    .replace(/## (.*)/g, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/- (.*)/g, "<li>$1</li>")
    .replace(/\n/g, "<br>");
}

// ➕ MESSAGE
function addMessage(text, type, save=true) {
  const box = document.getElementById("chatBox");

  const div = document.createElement("div");
  div.className = "p-3 rounded max-w-[75%] " +
    (type==="user" ? "user ml-auto" : "ai");

  div.innerHTML = type==="ai" ? format(text) : text;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;

  if (save && currentChat) {
    chats[currentChat].messages.push({text,type});
    saveChats();
  }
}

// 🤖 AI
async function learnTopic() {
  const topic = document.getElementById("topic").value;
  if (!topic) return;

  addMessage(topic,"user");

  const res = await fetch("/api/tutor", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({topic})
  });

  const data = await res.json();
  addMessage(data.result,"ai");

  document.getElementById("topic").value="";
}
