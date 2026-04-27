let username = localStorage.getItem("username") || "User";

function startApp(){
  landing.style.display="none";
  app.style.display="flex";
  newChat();
}

function showPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(page+"Page").classList.add("active");

  if(page==="dashboard") loadDashboard();
  if(page==="notes") loadNotes();
  if(page==="shared") loadShared();
}

/* ===== AI NAME ===== */
function getAIName(){
  return document.body.classList.contains("dark") ? "VED 🤖" : "SHASTRA 📘";
}

/* ===== CHAT ===== */
function newChat(){
  chatBox.innerHTML="";
  addAI(`Hello ${username}! Ask me anything 🚀`);
}

function addUser(text){
  const row=document.createElement("div");
  row.className="chat-row justify-end";

  const bubble=document.createElement("div");
  bubble.className="bubble user-bubble";
  bubble.innerText=text;

  const avatar=document.createElement("div");
  avatar.className="avatar user-avatar";
  avatar.innerText="🙂";

  row.appendChild(bubble);
  row.appendChild(avatar);

  chatBox.appendChild(row);
}

/* ===== AI MESSAGE ===== */
function addAI(text){
  const row=document.createElement("div");
  row.className="chat-row";

  const avatar=document.createElement("div");
  avatar.className="avatar ai-avatar";
  avatar.innerText="🤖";

  const container=document.createElement("div");

  const name=document.createElement("div");
  name.className="text-xs text-gray-400";
  name.innerText=getAIName();

  const bubble=document.createElement("div");
  bubble.className="bubble ai-bubble";

  container.appendChild(name);
  container.appendChild(bubble);

  row.appendChild(avatar);
  row.appendChild(container);

  chatBox.appendChild(row);

  stream(bubble,text);
}

/* ===== STREAM ===== */
function stream(el,text){
  let i=0;
  function run(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i);
      i+=20;
      requestAnimationFrame(run);
    }
  }
  run();
}

/* ===== THINKING ===== */
function showThinking(){
  const row=document.createElement("div");
  row.className="chat-row";

  const avatar=document.createElement("div");
  avatar.className="avatar ai-avatar";
  avatar.innerText="🤖";

  const box=document.createElement("div");

  const name=document.createElement("div");
  name.className="text-xs text-gray-400";
  name.innerText=getAIName()+" is thinking...";

  const bubble=document.createElement("div");
  bubble.className="bubble ai-bubble";

  bubble.innerHTML=`<div class="typing"><span></span><span></span><span></span></div>`;

  box.appendChild(name);
  box.appendChild(bubble);

  row.appendChild(avatar);
  row.appendChild(box);

  chatBox.appendChild(row);
  return row;
}

/* ===== AI CALL ===== */
async function learnTopic(){
  const text=topic.value;
  if(!text) return;

  addUser(text);
  topic.value="";

  const t=showThinking();

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text})
  });

  const data=await res.json();

  t.remove();
  addAI(data.result);
}

/* ===== QUIZ ===== */
async function startQuiz(){
  const text=quizTopic.value;
  if(!text) return;

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text+" quiz"})
  });

  const data=await res.json();
  const quiz=JSON.parse(data.result.replace(/```json|```/g,""));

  quizBox.innerHTML="";
  quiz.forEach(q=>{
    const d=document.createElement("div");
    d.innerHTML="<b>"+q.question+"</b>";
    quizBox.appendChild(d);
  });
}

/* ===== PRACTICE ===== */
function startPractice(){
  topic.value=practiceTopic.value+" practice";
  showPage("chat");
  learnTopic();
}

/* ===== EXAM ===== */
function startExam(){
  let t=60;
  examTimer.innerText="Time: "+t;

  const x=setInterval(()=>{
    t--;
    examTimer.innerText="Time: "+t;
    if(t<=0){clearInterval(x);alert("Time up");}
  },1000);

  startQuiz();
}

/* ===== DASHBOARD ===== */
function loadDashboard(){
  dLevel.innerText="1";
  dXP.innerText="0";

  new Chart(chart,{
    type:"bar",
    data:{
      labels:["XP"],
      datasets:[{label:"Progress",data:[10]}]
    }
  });
}

/* ===== NOTES ===== */
function loadNotes(){
  notesBox.innerHTML="No notes yet";
}

/* ===== SHARED ===== */
function loadShared(){
  sharedBox.innerHTML="No shared questions";
}
