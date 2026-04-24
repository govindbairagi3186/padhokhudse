let user = "";
let currentTopic = "";
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
let quizData = [];
let quizResults = JSON.parse(localStorage.getItem("quizResults")) || [];

/* ---------------- THEME ---------------- */
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
}

/* ---------------- NAV ---------------- */
function showLogin(){
  document.getElementById("landing").style.display="none";
  document.getElementById("loginPage").style.display="flex";
}

function login(){
  user = document.getElementById("username").value || "User";
  document.getElementById("loginPage").style.display="none";
  document.getElementById("app").style.display="flex";
  renderChat();
  addMessage("ai", `👋 Welcome ${user}! Ask any topic.`);
}

/* ---------------- CHAT STORAGE ---------------- */
function saveChat(){
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function addMessage(type, text){
  const msg = { type, text, time: new Date().toLocaleTimeString() };
  chatHistory.push(msg);
  saveChat();
  renderChat();
}

function renderChat(){
  const box = document.getElementById("chatBox");
  box.innerHTML = "";

  chatHistory.forEach(m=>{
    const div = document.createElement("div");
    div.className = `p-3 rounded max-w-[80%] ${
      m.type === "user"
        ? "ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white"
        : "bg-gray-200 dark:bg-[#1e293b]"
    }`;

    div.innerHTML = `
      <div>${m.text}</div>
      <div class="text-xs opacity-60 mt-1">${m.time}</div>
    `;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

/* ---------------- THINKING ---------------- */
function showThinking(){
  const box = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.id = "thinking";
  div.className = "p-3 bg-gray-300 dark:bg-[#334155] rounded w-fit";
  div.innerHTML = "🧠 Thinking...";
  box.appendChild(div);
}

function removeThinking(){
  const t = document.getElementById("thinking");
  if(t) t.remove();
}

/* ---------------- CHAT ENGINE ---------------- */
function learnTopic(){
  const input = document.getElementById("topic").value;
  if(!input) return;

  currentTopic = input;
  addMessage("user", input);

  document.getElementById("topic").value = "";
  showThinking();

  setTimeout(()=>{
    removeThinking();

    const response = `
      📘 <b>${input}</b><br><br>

      🔹 Concept:<br>
      This topic explains the basics of ${input}.<br><br>

      🔹 Key Points:<br>
      • Core idea of ${input}<br>
      • Applications<br>
      • Importance<br><br>

      🔹 Example:<br>
      Real-world example of ${input}<br><br>

      ✅ Summary:<br>
      ${input} is an important topic for learning.
    `;

    addMessage("ai", response);
  }, 1000);
}

/* ---------------- QUIZ ENGINE ---------------- */
function generateQuiz(){
  document.getElementById("quizBox").style.display = "block";

  quizData = [];

  for(let i=1;i<=5;i++){
    quizData.push({
      q: `${currentTopic || "General"} Question ${i}?`,
      options: ["Option A","Option B","Option C","Option D"],
      ans: Math.floor(Math.random()*4)
    });
  }

  renderQuiz();
}

function renderQuiz(){
  const box = document.getElementById("quizContent");
  box.innerHTML = "";

  quizData.forEach((q,i)=>{
    const div = document.createElement("div");
    div.className = "glass p-4 mb-4";

    div.innerHTML = `
      <p class="font-bold">${i+1}. ${q.q}</p>
      ${q.options.map((o,idx)=>`
        <label class="block mt-2">
          <input type="radio" name="q${i}" value="${idx}">
          ${o}
        </label>
      `).join("")}
    `;

    box.appendChild(div);
  });

  box.innerHTML += `
    <button onclick="submitQuiz()" class="bg-green-500 text-white px-4 py-2 rounded">
      Submit Quiz
    </button>
  `;
}

function submitQuiz(){
  let score = 0;

  quizData.forEach((q,i)=>{
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if(selected && parseInt(selected.value) === q.ans){
      score++;
    }
  });

  const result = {
    topic: currentTopic,
    score,
    total: quizData.length,
    time: new Date().toLocaleString()
  };

  quizResults.push(result);
  localStorage.setItem("quizResults", JSON.stringify(quizResults));

  document.getElementById("quizContent").innerHTML = `
    <div class="text-xl font-bold">
      🎯 Score: ${score}/5
    </div>
  `;
}

/* ---------------- DASHBOARD (FIXED) ---------------- */
function showDashboard(){
  const box = document.getElementById("chatBox");

  let html = `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">📊 Dashboard</h2>

      <h3 class="font-bold mb-2">📝 Quiz History</h3>
  `;

  quizResults.slice().reverse().forEach(q=>{
    html += `
      <div class="glass p-3 mb-2">
        Topic: ${q.topic}<br>
        Score: ${q.score}/${q.total}<br>
        Time: ${q.time}
      </div>
    `;
  });

  html += `
      <h3 class="font-bold mt-4 mb-2">💬 Chat Count</h3>
      <div class="glass p-3">
        Total Messages: ${chatHistory.length}
      </div>
    </div>
  `;

  box.innerHTML = html;
}

/* ---------------- CHAT RESET ---------------- */
function newChat(){
  chatHistory = [];
  saveChat();
  renderChat();
}
