let progress = { quizzes: 0, correct: 0 };

// 🌙 THEME
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
  themeBtn.innerText =
    document.documentElement.classList.contains("dark") ? "🌙" : "☀️";
}
toggleTheme();

// ⌨️ FRONT PAGE TYPING
const typingMsg = "Learn smarter with AI • Quiz • Progress • Fast Learning 🚀";
let ti = 0;
function typeEffect(){
  if(ti < typingMsg.length){
    typingText.innerHTML += typingMsg[ti];
    ti++;
    setTimeout(typeEffect, 35);
  }
}
typeEffect();

// 🚀 NAVIGATION
function showLogin(){
  landing.style.display = "none";
  loginPage.style.display = "flex";
}

function login(){
  const name = username.value;
  if(!name) return;

  loginPage.style.display = "none";
  app.style.display = "flex";

  addAI(`Hey ${name}! 👋 Welcome to PADHOKHUDSE 🇮🇳❤️`);
}

// 💬 CHAT SYSTEM
function newChat(){
  chatBox.innerHTML = "";
}

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
  scrollBottom();
}

// ⚡ STREAMING EFFECT
function stream(el, text){
  let i = 0;
  function run(){
    if(i < text.length){
      el.innerHTML = text.slice(0, i);
      i += 6;
      setTimeout(run, 5);
    } else {
      el.innerHTML = text;
    }
  }
  run();
}

// 🧠 FORMAT OUTPUT (BREAKDOWN FIX)
function format(text){
  return text
    .replace(/## (.*)/g, "<h2 class='text-lg font-bold mt-3'>$1</h2>")
    .replace(/- (.*)/g, "<li>$1</li>")
    .replace(/\n/g, "<br>");
}

// ⬇️ SCROLL
function scrollBottom(){
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🤖 AI CHAT
async function learnTopic(){
  const text = topic.value;
  if(!text) return;

  addUser(text);
  topic.value = "";

  const thinking = document.createElement("div");
  thinking.className = "chat-ai p-3 rounded";
  thinking.innerText = "⚡ Thinking...";
  chatBox.appendChild(thinking);

  try{
    const res = await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ topic: text })
    });

    const data = await res.json();

    thinking.innerHTML = "";
    stream(thinking, format(data.result));

  }catch(err){
    thinking.innerHTML = "❌ Error loading response";
  }

  scrollBottom();
}

// 📝 QUIZ SYSTEM (HYBRID FIXED)
async function generateQuiz(){
  const text = topic.value;
  if(!text) return alert("Enter topic first");

  addAI("📝 Creating quiz...");

  let quiz;

  try{
    const res = await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ topic: text + " quiz" })
    });

    const data = await res.json();

    let clean = data.result
      .replace(/```json/g,"")
      .replace(/```/g,"")
      .trim();

    quiz = JSON.parse(clean);

  } catch(e){
    console.log("⚠️ Using fallback quiz");
    quiz = fallbackQuiz(text);
  }

  if(!Array.isArray(quiz)){
    quiz = fallbackQuiz(text);
  }

  while(quiz.length < 5){
    quiz.push(randomQ(text));
  }

  renderQuiz(quiz);
}

// 🛡️ FALLBACK QUIZ
function fallbackQuiz(topic){
  return Array.from({length:5}, () => randomQ(topic));
}

function randomQ(topic){
  return {
    question: `Basic concept of ${topic}?`,
    options: [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    answer: Math.floor(Math.random()*4)
  };
}

// 🎯 RENDER QUIZ UI
function renderQuiz(quiz){
  const container = document.createElement("div");
  container.className = "chat-ai p-4 rounded";

  let score = 0;

  quiz.forEach((q, i)=>{
    const qDiv = document.createElement("div");
    qDiv.className = "mb-4";

    qDiv.innerHTML = `<b>Q${i+1}. ${q.question}</b>`;

    q.options.forEach((opt, idx)=>{
      const btn = document.createElement("button");
      btn.innerText = opt;
      btn.className = "block w-full mt-2 p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700";

      btn.onclick = ()=>{
        qDiv.querySelectorAll("button").forEach(b => b.disabled = true);

        if(idx === q.answer){
          btn.style.background = "green";
          btn.innerText += " ✅";
          score++;
        } else {
          btn.style.background = "red";
          btn.innerText += " ❌";
        }
      };

      qDiv.appendChild(btn);
    });

    container.appendChild(qDiv);
  });

  const submit = document.createElement("button");
  submit.innerText = "Submit Quiz";
  submit.className = "mt-4 bg-blue-500 text-white px-4 py-2 rounded";

  submit.onclick = ()=>{
    progress.quizzes++;
    progress.correct += score;

    addAI(`🎯 Your Score: ${score}/${quiz.length}`);
  };

  container.appendChild(submit);
  chatBox.appendChild(container);

  scrollBottom();
}

// 📊 DASHBOARD
function showDashboard(){
  addAI(`📊 Progress Report

📝 Quizzes Attempted: ${progress.quizzes}
✅ Correct Answers: ${progress.correct}

Keep learning 🚀`);
}
