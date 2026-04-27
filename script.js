let username = localStorage.getItem("username") || "";
let isLoading = false;

let pdfPages = [];
let chatMemory = [];

let gameData = JSON.parse(localStorage.getItem("gameData")) || {
  xp:0, level:1, streak:0, lastActive:null, badges:[]
};

// ================= START =================
function startApp(){
  landing.style.display="none";
  app.style.display="flex";

  if(!username){
    username = prompt("Enter your name:");
    localStorage.setItem("username", username);
  }

  updateStreak();
  newChat();
}

// ================= CHAT =================
function newChat(){
  chatBox.innerHTML="";
  addAI(`👋 Hello ${username}! I'm your AI tutor 🤖📚`);
}

function addUser(text){
  const d=document.createElement("div");
  d.className="chat-user p-3 rounded ml-auto max-w-xl";
  d.innerText=text;

  const share=document.createElement("button");
  share.innerText="📤";
  share.onclick=()=>shareQuestion(text);

  d.appendChild(share);
  chatBox.appendChild(d);
  scrollBottom();
}

function addAI(text){
  const d=document.createElement("div");
  d.className="chat-ai p-4 rounded max-w-xl";
  chatBox.appendChild(d);

  stream(d, format(text));

  const save=document.createElement("button");
  save.innerText="📒 Save";
  save.onclick=()=>saveNote(text);
  d.appendChild(save);
}

// ================= FORMAT =================
function format(t){
  return t
    .replace(/## (.*)/g,"<h2 class='text-blue-400 font-bold mt-3'>$1</h2>")
    .replace(/- (.*)/g,"<li>• $1</li>")
    .replace(/\n/g,"<br>");
}

// ================= STREAM =================
function stream(el,text){
  let i=0;
  function run(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i);
      i+=30;
      requestAnimationFrame(run);
    }
  }
  run();
}

function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
}

// ================= AI =================
async function learnTopic(){
  if(isLoading) return;
  isLoading=true;

  const text=topic.value;
  if(!text){isLoading=false;return;}

  addUser(text);
  topic.value="";

  const t=thinking();

  try{
    const res=await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        topic:text,
        history:chatMemory.slice(-5)
      })
    });

    const data=await res.json();
    t.remove();

    addAI(data.result);

    chatMemory.push({role:"user",content:text});
    chatMemory.push({role:"assistant",content:data.result});

    addXP(10);
    checkBadges();

  }catch{
    t.remove();
    addAI("❌ Error");
  }

  isLoading=false;
}

// ================= QUIZ =================
async function generateQuiz(){
  const text=topic.value;
  if(!text) return alert("Enter topic");

  const t=thinking("🧠 Creating smart quiz...");

  try{
    const res=await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic:text+" quiz"})
    });

    const data=await res.json();
    t.remove();

    let quiz;

    try{
      const clean=data.result.replace(/```json|```/g,"").trim();
      quiz=JSON.parse(clean);
    }catch{
      quiz=Array.from({length:5}).map((_,i)=>({
        question:`${text} Q${i+1}?`,
        options:["A","B","C","D"],
        answer:Math.floor(Math.random()*4),
        explanation:"Revise concept"
      }));
    }

    renderQuiz(quiz);

  }catch{
    t.remove();
    addAI("❌ Quiz failed");
  }
}

function renderQuiz(qs){
  const box=document.createElement("div");
  let score=0;

  qs.forEach((q,i)=>{
    const d=document.createElement("div");
    d.className="mb-4 p-3 rounded bg-gray-800";

    d.innerHTML=`<b>Q${i+1}. ${q.question}</b><br>`;

    let answered=false;

    q.options.forEach((o,idx)=>{
      const b=document.createElement("button");
      b.innerText=o;
      b.className="block my-1 px-3 py-1 bg-gray-700 rounded";

      b.onclick=()=>{
        if(answered) return;
        answered=true;

        if(idx===q.answer){
          score++;
          b.style.background="green";
        } else {
          b.style.background="red";
        }

        d.querySelectorAll("button").forEach((btn,i2)=>{
          if(i2===q.answer){
            btn.style.border="2px solid yellow";
          }
        });

        const exp=document.createElement("div");
        exp.className="text-yellow-300 mt-2";
        exp.innerText="💡 "+q.explanation;
        d.appendChild(exp);
      };

      d.appendChild(b);
    });

    box.appendChild(d);
  });

  const submit=document.createElement("button");
  submit.innerText="Submit";
  submit.className="bg-blue-500 px-4 py-2 rounded";

  submit.onclick=()=>{
    addAI(`🎯 Score: ${score}/${qs.length}`);
    detectWeak(score, qs.length);
    addXP(score*5);
  };

  box.appendChild(submit);
  chatBox.appendChild(box);
}

// ================= OTHER =================
function practiceMode(){ topic.value+=" practice"; learnTopic(); }
function examMode(){ generateQuiz(); }

function detectWeak(s,t){
  if(s/t<0.5){
    addAI("⚠️ Weak area detected. Revise again!");
  }
}

function thinking(msg="🤖 Thinking..."){
  const d=document.createElement("div");
  d.innerText=msg;
  chatBox.appendChild(d);
  return d;
}

// ================= STORAGE =================
function saveNote(t){
  let n=JSON.parse(localStorage.getItem("notes")||"[]");
  n.push(t);
  localStorage.setItem("notes",JSON.stringify(n));
}

function showNotes(){
  JSON.parse(localStorage.getItem("notes")||"[]")
    .forEach(n=>addAI("📒 "+n));
}

function shareQuestion(q){
  let d=JSON.parse(localStorage.getItem("shared")||"[]");
  d.push(q);
  localStorage.setItem("shared",JSON.stringify(d));
}

function showShared(){
  JSON.parse(localStorage.getItem("shared")||"[]")
    .forEach(q=>addAI("💬 "+q));
}

// ================= GAME =================
function addXP(x){
  gameData.xp+=x;
  if(gameData.xp>=gameData.level*100){
    gameData.level++;
    gameData.xp=0;
    addAI("🎉 Level Up!");
  }
  saveGame();
}

function updateStreak(){
  const t=new Date().toDateString();
  if(gameData.lastActive!==t){
    gameData.streak++;
    gameData.lastActive=t;
    addAI(`🔥 Streak: ${gameData.streak}`);
  }
}

function checkBadges(){
  if(gameData.streak>=3 && !gameData.badges.includes("🔥")){
    gameData.badges.push("🔥");
    addAI("🏅 Badge unlocked!");
  }
}

function saveGame(){
  localStorage.setItem("gameData",JSON.stringify(gameData));
}

function showDashboard(){
  addAI(`
📊 Progress

Level: ${gameData.level}
XP: ${gameData.xp}
Streak: ${gameData.streak}
Badges: ${gameData.badges.join(",")}
  `);
}
