let progress = { quizzes: 0, correct: 0 };

// THEME
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
  scrollBottom();
}

function addAI(text){
  const div=document.createElement("div");
  div.className="chat-ai max-w-xl p-3 rounded";
  chatBox.appendChild(div);
  stream(div, format(text));
  scrollBottom();
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

// SCROLL
function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
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
    body:JSON.stringify({
      topic:`Create 3 MCQ quiz on ${text} in JSON format:
[
{question:"", options:["A","B","C","D"], answer:0}
]`
    })
  });

  const data=await res.json();

  let quiz;
  try {
    quiz = JSON.parse(data.result);
  } catch {
    addAI("❌ Quiz error. Try again.");
    return;
  }

  renderQuiz(quiz);
}

function renderQuiz(quiz){
  const container=document.createElement("div");
  container.className="chat-ai p-4 rounded";

  quiz.forEach((q,i)=>{
    const qDiv=document.createElement("div");
    qDiv.innerHTML=`<b>Q${i+1}. ${q.question}</b>`;

    q.options.forEach((opt,idx)=>{
      const btn=document.createElement("button");
      btn.innerText=opt;
      btn.className="block w-full mt-2 p-2 border rounded";

      btn.onclick=()=>{
        if(idx===q.answer){
          btn.style.background="green";
          btn.innerText+=" ✅";
          progress.correct++;
        } else {
          btn.style.background="red";
          btn.innerText+=" ❌";
        }
      };

      qDiv.appendChild(btn);
    });

    container.appendChild(qDiv);
  });

  chatBox.appendChild(container);
  progress.quizzes++;
  scrollBottom();
}

// DASHBOARD
function showDashboard(){
  addAI(`📊 Progress

Quizzes: ${progress.quizzes}
Correct: ${progress.correct}

Keep going 🚀`);
}
