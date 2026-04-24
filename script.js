// =========================
// GLOBAL STATE
// =========================
let progress = { quizzes: 0, correct: 0 };
let user = localStorage.getItem("user") || null;
let chats = JSON.parse(localStorage.getItem("chats")) || [];

// =========================
// THEME
// =========================
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
  themeBtn.innerText =
    document.documentElement.classList.contains("dark") ? "🌙" : "☀️";
}
toggleTheme();

// =========================
// LOGIN SYSTEM (LOCAL)
// =========================
function login(){
  const name = username.value;
  if(!name) return alert("Enter name");

  user = name;
  localStorage.setItem("user", name);

  loginPage.style.display = "none";
  app.style.display = "flex";

  loadChats();

  addAI(`Hey ${name}! 👋 Welcome back 🚀`);
}

// =========================
// CHAT UI
// =========================
function addUser(text){
  const div = document.createElement("div");
  div.className = "chat-user ml-auto p-3 rounded max-w-xl";
  div.innerText = text;
  chatBox.appendChild(div);
  scrollBottom();
}

function addAI(text){
  const div = document.createElement("div");
  div.className = "chat-ai p-3 rounded max-w-xl";
  chatBox.appendChild(div);

  stream(div, format(text));
}

// =========================
// FAST STREAMING
// =========================
function stream(el, text){
  let i = 0;
  function run(){
    if(i < text.length){
      el.innerHTML = text.slice(0, i);
      i += 10; // 🔥 faster
      setTimeout(run, 3);
    } else {
      el.innerHTML = text;
    }
  }
  run();
}

// =========================
// FORMAT OUTPUT (BETTER)
// =========================
function format(text){
  return text
    .replace(/## (.*)/g,"<h2 class='text-xl font-bold mt-3 text-blue-400'>$1</h2>")
    .replace(/- (.*)/g,"<li class='ml-4'>• $1</li>")
    .replace(/\n/g,"<br>");
}

// =========================
// THINKING LOADER
// =========================
function showThinking(){
  const div = document.createElement("div");
  div.className = "chat-ai p-3 rounded animate-pulse text-gray-400";
  div.innerText = "🤖 AI is thinking...";
  chatBox.appendChild(div);
  scrollBottom();
  return div;
}

// =========================
// SCROLL
// =========================
function scrollBottom(){
  chatBox.scrollTop = chatBox.scrollHeight;
}

// =========================
// SAVE CHAT
// =========================
function saveChat(q,a){
  chats.unshift({q,a});
  localStorage.setItem("chats", JSON.stringify(chats));
  loadChats();
}

// =========================
// LOAD SIDEBAR HISTORY
// =========================
function loadChats(){
  const sidebar = document.getElementById("history");
  if(!sidebar) return;

  sidebar.innerHTML = "";

  chats.slice(0,10).forEach(c=>{
    const btn = document.createElement("button");
    btn.innerText = c.q.slice(0,20)+"...";
    btn.className = "block w-full text-left p-2 hover:bg-gray-700 rounded";

    btn.onclick = ()=>{
      addUser(c.q);
      addAI(c.a);
    };

    sidebar.appendChild(btn);
  });
}

// =========================
// AI CHAT
// =========================
async function learnTopic(){
  const text = topic.value;
  if(!text) return;

  addUser(text);
  topic.value = "";

  const thinking = showThinking();

  try{
    const res = await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ topic: text })
    });

    const data = await res.json();

    thinking.remove();

    addAI(data.result);
    saveChat(text, data.result);

  }catch(err){
    thinking.innerText = "❌ Error loading";
  }
}

// =========================
// QUIZ (IMPROVED)
// =========================
async function generateQuiz(){
  const text = topic.value;
  if(!text) return alert("Enter topic");

  const thinking = showThinking();

  let quiz;

  try{
    const res = await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ topic: text + " quiz" })
    });

    const data = await res.json();

    let clean = data.result.replace(/```json|```/g,"").trim();
    quiz = JSON.parse(clean);

  } catch {
    quiz = fallbackQuiz(text);
  }

  thinking.remove();

  renderQuiz(quiz);
}

// =========================
// QUIZ FALLBACK
// =========================
function fallbackQuiz(topic){
  return Array.from({length:5},()=>({
    question:`Basic question of ${topic}?`,
    options:["A","B","C","D"],
    answer:0
  }));
}

// =========================
// QUIZ UI
// =========================
function renderQuiz(quiz){
  const box = document.createElement("div");
  box.className = "chat-ai p-4 rounded";

  let score = 0;

  quiz.forEach((q,i)=>{
    const d = document.createElement("div");
    d.innerHTML = `<b>Q${i+1}. ${q.question}</b>`;

    q.options.forEach((o,idx)=>{
      const b = document.createElement("button");
      b.innerText = o;
      b.className = "block w-full mt-2 p-2 border rounded";

      b.onclick = ()=>{
        d.querySelectorAll("button").forEach(x=>x.disabled=true);

        if(idx===q.answer){
          b.style.background="green";
          score++;
        } else b.style.background="red";
      };

      d.appendChild(b);
    });

    box.appendChild(d);
  });

  const submit = document.createElement("button");
  submit.innerText = "Submit";
  submit.className = "mt-4 bg-blue-500 text-white px-4 py-2 rounded";

  submit.onclick = ()=>{
    progress.quizzes++;
    progress.correct += score;
    addAI(`🎯 Score: ${score}/${quiz.length}`);
  };

  box.appendChild(submit);
  chatBox.appendChild(box);
}

// =========================
// DASHBOARD
// =========================
function showDashboard(){
  addAI(`📊 Progress

📝 Quizzes: ${progress.quizzes}
✅ Correct: ${progress.correct}

Keep learning 🚀`);
}
