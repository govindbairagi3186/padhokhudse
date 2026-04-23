let progress = { quizzes: 0, correct: 0 };

// 🌗 THEME
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
  updateThemeIcon();
}

function updateThemeIcon(){
  themeBtn.innerText = document.documentElement.classList.contains("dark") ? "🌙" : "☀️";
}

updateThemeIcon();

// NAV
function showLogin(){
  landing.style.display="none";
  loginPage.style.display="flex";
}

function login(){
  const name=username.value;
  if(!name) return;

  loginPage.style.display="none";
  app.style.display="flex";

  addAI(`Hey ${name}! 👋 Ask anything 🚀`);
}

// CHAT
function newChat(){
  chatBox.innerHTML="";
}

function addUser(text){
  const div=document.createElement("div");
  div.className="chat-user ml-auto max-w-xl p-3 rounded";
  div.innerText=text;
  chatBox.appendChild(div);
}

function addAI(text){
  const div=document.createElement("div");
  div.className="chat-ai max-w-xl p-3 rounded";
  chatBox.appendChild(div);
  stream(div, format(text));
}

// FAST STREAM
function stream(el, text){
  let i=0;
  function run(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i);
      i+=6;
      setTimeout(run,5);
    } else el.innerHTML=text;
  }
  run();
}

// FORMAT
function format(t){
  return t.replace(/\n/g,"<br>").replace(/- /g,"• ");
}

// AI
async function learnTopic(){
  const text=topic.value;
  if(!text) return;

  addUser(text);
  topic.value="";

  const div=document.createElement("div");
  div.className="chat-ai p-3 rounded";
  div.innerText="⚡ Thinking...";
  chatBox.appendChild(div);

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text})
  });

  const data=await res.json();

  div.innerHTML="";
  stream(div, format(data.result));
}

// QUIZ
async function generateQuiz(){
  const text=topic.value;
  if(!text) return alert("Enter topic first");

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:`Create 3 MCQ quiz on ${text}`})
  });

  const data=await res.json();
  addAI("📝 Quiz:\n\n"+data.result);

  progress.quizzes++;
}

// DASHBOARD
function showDashboard(){
  addAI(`📊 Progress Dashboard

Total Quizzes: ${progress.quizzes}
Correct Answers: ${progress.correct}

Keep learning 🚀`);
}

// QUICK
function quickTopic(t){
  showLogin();
  setTimeout(()=>topic.value=t,500);
}
