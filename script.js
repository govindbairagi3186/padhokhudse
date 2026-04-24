let user = "";
let currentTopic = "";
let quizData = [];

// THEME
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
}

// NAV
function showLogin(){
  document.getElementById("landing").style.display="none";
  document.getElementById("loginPage").style.display="flex";
}

function login(){
  user = document.getElementById("username").value;
  document.getElementById("loginPage").style.display="none";
  document.getElementById("app").style.display="flex";
  addMessage("ai", `👋 Welcome ${user}! Ask me anything.`);
}

function newChat(){
  document.getElementById("chatBox").innerHTML = "";
}

// CHAT SYSTEM
function addMessage(type, text){
  const div = document.createElement("div");
  div.className = `p-3 rounded ${type === "user" ? "chat-user ml-auto w-fit" : "chat-ai w-fit"}`;
  div.innerHTML = text;
  document.getElementById("chatBox").appendChild(div);
  scrollBottom();
}

function scrollBottom(){
  document.getElementById("chatBox").scrollTop =
  document.getElementById("chatBox").scrollHeight;
}

// THINKING ANIMATION
function showThinking(){
  const div = document.createElement("div");
  div.id = "thinking";
  div.className = "chat-ai p-3 rounded w-fit";
  div.innerHTML = "🧠 AI is thinking<span class='typing'>...</span>";
  document.getElementById("chatBox").appendChild(div);
  scrollBottom();
}

function removeThinking(){
  const t = document.getElementById("thinking");
  if(t) t.remove();
}

// MAIN AI CHAT (RULE + SIMPLE AI)
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
      📘 <b>Topic:</b> ${input}<br><br>

      🔹 Definition:<br>
      This is a basic explanation of ${input}.<br><br>

      🔹 Key Points:<br>
      • Important concept 1<br>
      • Important concept 2<br>
      • Important concept 3<br><br>

      🔹 Example:<br>
      Real-life example of ${input}.<br><br>

      ✅ Summary:<br>
      ${input} is an important topic to understand.
    `;

    addMessage("ai", response);
  }, 1200);
}

// QUIZ ENGINE (FIXED)
function generateQuiz(){
  document.getElementById("quizBox").style.display = "block";
  document.getElementById("quizContent").innerHTML = "";

  showThinking();

  setTimeout(()=>{
    removeThinking();

    quizData = [];

    for(let i=1;i<=5;i++){
      quizData.push({
        q: `Sample question ${i} on ${currentTopic || "general knowledge"}?`,
        options: ["Option A","Option B","Option C","Option D"],
        ans: 0
      });
    }

    renderQuiz();
  },1000);
}

// RENDER QUIZ
function renderQuiz(){
  let html = "";

  quizData.forEach((q, index)=>{
    html += `
      <div class="glass p-4 mb-4">
        <p class="font-bold">${index+1}. ${q.q}</p>
        ${q.options.map((o,i)=>`
          <label class="block mt-2">
            <input type="radio" name="q${index}" value="${i}">
            ${o}
          </label>
        `).join("")}
      </div>
    `;
  });

  html += `<button onclick="submitQuiz()" class="bg-green-500 text-white px-4 py-2 rounded">
    Submit Quiz
  </button>`;

  document.getElementById("quizContent").innerHTML = html;
}

// QUIZ RESULT
function submitQuiz(){
  let score = 0;

  quizData.forEach((q,i)=>{
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if(selected && parseInt(selected.value) === q.ans){
      score++;
    }
  });

  document.getElementById("quizContent").innerHTML = `
    <div class="text-xl font-bold">
      🎯 Your Score: ${score}/5
    </div>
  `;
}
