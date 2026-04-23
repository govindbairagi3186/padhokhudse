let progress = { quizzes: 0, correct: 0 };

// THEME
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
  themeBtn.innerText = document.documentElement.classList.contains("dark") ? "🌙":"☀️";
}
toggleTheme();

// FRONT PAGE TYPE EFFECT
const text = "Learn smarter with AI • Quiz • Progress • Fast Learning";
let i=0;
function type(){
  if(i<text.length){
    typingText.innerHTML += text[i];
    i++;
    setTimeout(type,40);
  }
}
type();

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

  addAI(`Hey ${name}! 👋 Welcome to PADHOKHUDSE 🚀`);
}

// CHAT
function newChat(){ chatBox.innerHTML=""; }

function addUser(text){
  chatBox.innerHTML += `<div class="chat-user ml-auto p-3 rounded">${text}</div>`;
  scrollBottom();
}

function addAI(text){
  const div=document.createElement("div");
  div.className="chat-ai p-3 rounded";
  chatBox.appendChild(div);
  stream(div,text);
}

// STREAM
function stream(el,text){
  let i=0;
  function run(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i);
      i+=5;
      setTimeout(run,5);
    } else el.innerHTML=text;
  }
  run();
}

// SCROLL
function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
}

// AI CHAT
async function learnTopic(){
  const text=topic.value;
  if(!text) return;

  addUser(text);
  topic.value="";

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text})
  });

  const data=await res.json();
  addAI(data.result);
}

// 🧠 HYBRID QUIZ (5+ MCQ GUARANTEE)
async function generateQuiz(){
  const text=topic.value;
  if(!text) return alert("Enter topic");

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      topic:`Create 5 MCQ quiz on ${text} return JSON`
    })
  });

  const data=await res.json();

  let quiz;
  try {
    quiz = JSON.parse(data.result.replace(/```json|```/g,""));
  } catch {
    quiz = fallbackQuiz(text);
  }

  while(quiz.length<5){
    quiz.push(randomQ(text));
  }

  renderQuiz(quiz);
}

// fallback
function fallbackQuiz(t){
  return Array.from({length:5},()=>randomQ(t));
}

function randomQ(t){
  return {
    question:`Basic ${t} question?`,
    options:["A","B","C","D"],
    answer:0
  };
}

// QUIZ UI
function renderQuiz(quiz){
  const box=document.createElement("div");
  box.className="chat-ai p-4 rounded";

  let score=0;

  quiz.forEach((q,i)=>{
    const d=document.createElement("div");
    d.innerHTML=`<b>Q${i+1}. ${q.question}</b>`;

    q.options.forEach((o,idx)=>{
      const b=document.createElement("button");
      b.innerText=o;
      b.className="block w-full mt-2 p-2 border rounded";

      b.onclick=()=>{
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

  const submit=document.createElement("button");
  submit.innerText="Submit";
  submit.className="mt-4 bg-blue-500 text-white px-4 py-2 rounded";

  submit.onclick=()=>{
    progress.quizzes++;
    progress.correct+=score;
    addAI(`🎯 Score ${score}/${quiz.length}`);
  };

  box.appendChild(submit);
  chatBox.appendChild(box);
}

// DASHBOARD
function showDashboard(){
  addAI(`📊 Progress\nQuizzes: ${progress.quizzes}\nCorrect: ${progress.correct}`);
}
