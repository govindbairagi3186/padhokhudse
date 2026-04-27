function startApp(){
  landing.style.display="none";
  app.style.display="flex";
  newChat();
}

function showPage(p){
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  document.getElementById(p+"Page").classList.add("active");
}

/* AI NAME */
function getAIName(){
  return document.body.classList.contains("dark") ? "VED 🤖" : "SHASTRA 📘";
}

/* CHAT */
function newChat(){
  chatBox.innerHTML="";
  addAI("Hello! Ask me anything 🚀");
}

function addUser(text){
  const row=document.createElement("div");
  row.className="chat-row";

  const bubble=document.createElement("div");
  bubble.className="bubble user-bubble";
  bubble.innerText=text;

  row.appendChild(bubble);
  chatBox.appendChild(row);
}

/* AI */
function addAI(text){
  const row=document.createElement("div");
  row.className="chat-row";

  const avatar=document.createElement("div");
  avatar.className="avatar ai-avatar";
  avatar.innerText="🤖";

  const bubble=document.createElement("div");
  bubble.className="bubble ai-bubble";
  bubble.innerText=text;

  row.appendChild(avatar);
  row.appendChild(bubble);

  chatBox.appendChild(row);
}

/* THINKING */
function thinking(){
  const row=document.createElement("div");
  row.className="chat-row";

  const avatar=document.createElement("div");
  avatar.className="avatar ai-avatar";
  avatar.innerText="🤖";

  const bubble=document.createElement("div");
  bubble.className="bubble ai-bubble";
  bubble.innerHTML=`<div class="typing"><span></span><span></span><span></span></div>`;

  row.appendChild(avatar);
  row.appendChild(bubble);

  chatBox.appendChild(row);
  return row;
}

/* AI CALL */
async function learnTopic(){
  const text=topic.value;
  if(!text) return;

  addUser(text);
  topic.value="";

  const t=thinking();

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text})
  });

  const data=await res.json();

  t.remove();
  addAI(data.result);
}

/* QUIZ */
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

  quiz.forEach((q,i)=>{
    const d=document.createElement("div");
    d.innerHTML=`<b>${i+1}. ${q.question}</b>`;
    
    q.options.forEach((o,idx)=>{
      const btn=document.createElement("button");
      btn.innerText=o;
      btn.onclick=()=>{
        btn.style.background = idx===q.answer ? "green":"red";
      };
      d.appendChild(btn);
    });

    quizBox.appendChild(d);
  });
}

/* PRACTICE */
function startPractice(){
  topic.value=practiceTopic.value;
  showPage("chat");
  learnTopic();
}

/* EXAM */
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
