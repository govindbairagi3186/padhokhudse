// 🌙 THEME
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
}

// 🚀 START APP
function startApp(){
  document.getElementById("landing").style.display = "none";
  document.getElementById("app").style.display = "flex";
}

// 💬 CHAT
let chats = JSON.parse(localStorage.getItem("chats")) || [];
let progress = { quizzes:0, correct:0 };

function addUser(text){
  const div=document.createElement("div");
  div.className="chat-user ml-auto p-3 rounded max-w-xl";
  div.innerText=text;
  chatBox.appendChild(div);
}

function addAI(text){
  const div=document.createElement("div");
  div.className="chat-ai p-3 rounded max-w-xl";
  chatBox.appendChild(div);
  stream(div, format(text));
}

// ⚡ FAST STREAM
function stream(el,text){
  let i=0;
  function run(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i);
      i+=8;
      setTimeout(run,3);
    } else el.innerHTML=text;
  }
  run();
}

// 🧠 FORMAT
function format(text){
  return text
    .replace(/## (.*)/g,"<h2 class='text-lg font-bold mt-3 text-blue-400'>$1</h2>")
    .replace(/- (.*)/g,"<li>• $1</li>")
    .replace(/\n/g,"<br>");
}

// 🤖 THINKING
function thinking(){
  const d=document.createElement("div");
  d.className="chat-ai p-3 animate-pulse";
  d.innerText="🤖 AI thinking...";
  chatBox.appendChild(d);
  return d;
}

// 🔽 SCROLL
function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
}

// 💾 SAVE
function saveChat(q,a){
  chats.unshift({q,a});
  localStorage.setItem("chats",JSON.stringify(chats));
  loadHistory();
}

// 📜 HISTORY
function loadHistory(){
  const h=document.getElementById("history");
  h.innerHTML="";
  chats.slice(0,10).forEach(c=>{
    const b=document.createElement("button");
    b.innerText=c.q.slice(0,25)+"...";
    b.className="block w-full text-left p-2 hover:bg-gray-300 dark:hover:bg-gray-700";
    b.onclick=()=>{addUser(c.q);addAI(c.a);}
    h.appendChild(b);
  });
}

// 🤖 AI
async function learnTopic(){
  const text=topic.value;
  if(!text) return;

  addUser(text);
  topic.value="";

  const t=thinking();

  try{
    const res=await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic:text})
    });

    const data=await res.json();

    t.remove();
    addAI(data.result);
    saveChat(text,data.result);

  }catch{
    t.innerText="❌ Error";
  }

  scrollBottom();
}

// 📝 QUIZ
async function generateQuiz(){
  const text=topic.value;
  if(!text) return alert("Enter topic");

  const t=thinking();

  let quiz;

  try{
    const res=await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic:text+" quiz"})
    });

    const data=await res.json();
    quiz=JSON.parse(data.result.replace(/```json|```/g,""));

  }catch{
    quiz=Array.from({length:5},()=>({
      question:"Basic question?",
      options:["A","B","C","D"],
      answer:0
    }));
  }

  t.remove();
  renderQuiz(quiz);
}

// 🎯 QUIZ UI
function renderQuiz(qs){
  const box=document.createElement("div");
  box.className="chat-ai p-4 rounded";

  let score=0;

  qs.forEach((q,i)=>{
    const d=document.createElement("div");
    d.innerHTML=`<b>Q${i+1}. ${q.question}</b>`;

    q.options.forEach((o,idx)=>{
      const b=document.createElement("button");
      b.innerText=o;
      b.className="block w-full mt-2 border p-2 rounded";

      b.onclick=()=>{
        d.querySelectorAll("button").forEach(x=>x.disabled=true);
        if(idx===q.answer){b.style.background="green";score++;}
        else b.style.background="red";
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
    addAI(`🎯 Score: ${score}/${qs.length}`);
  };

  box.appendChild(submit);
  chatBox.appendChild(box);
}

// 📊 DASHBOARD
function showDashboard(){
  const acc = progress.quizzes
    ? Math.round((progress.correct/(progress.quizzes*5))*100)
    : 0;

  addAI(`📊 Dashboard

📝 Quizzes: ${progress.quizzes}
✅ Correct: ${progress.correct}
🎯 Accuracy: ${acc}% 🚀`);
}

// 💬 NEW CHAT
function newChat(){
  chatBox.innerHTML="";
}

// INIT
loadHistory();
