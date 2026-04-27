// ================== GLOBAL ==================
let username = localStorage.getItem("username") || "";
let isLoading = false;

let pdfPages = [];
let chatMemory = [];

let gameData = JSON.parse(localStorage.getItem("gameData")) || {
  xp:0, level:1, streak:0, lastActive:null, badges:[]
};

// ================== START ==================
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

// ================== CHAT ==================
function newChat(){
  chatBox.innerHTML="";
  addAI(`👋 Hello ${username}! I'm your AI assistant 🚀`);
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

  stream(d, text);

  const save=document.createElement("button");
  save.innerText="📒 Save";
  save.onclick=()=>saveNote(text);
  d.appendChild(save);
}

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

function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
}

// ================== AI ==================
async function learnTopic(){
  if(isLoading) return;
  isLoading=true;

  const text=topic.value;
  if(!text){isLoading=false;return;}

  addUser(text);
  topic.value="";

  const t=thinking();

  let context="";
  const pageMatch = text.match(/page\s*(\d+)/i);

  if(pageMatch && pdfPages.length){
    const p=parseInt(pageMatch[1]);
    const pg=pdfPages.find(x=>x.page===p);
    if(pg) context=pg.text.slice(0,2000);
  }

  try{
    const res=await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        topic: context ? `PDF:\n${context}\nQ:${text}` : text,
        history: chatMemory.slice(-5)
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

// ================== QUIZ ==================
async function generateQuiz(){
  const text=topic.value;
  if(!text) return alert("Enter topic");

  const t=thinking("🧠 Quiz loading...");

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text+" quiz"})
  });

  const data=await res.json();
  t.remove();

  let quiz;
  try{
    quiz=JSON.parse(data.result.replace(/```json|```/g,""));
  }catch{
    quiz=[{
      question:"Basic question?",
      options:["A","B","C","D"],
      answer:0
    }];
  }

  renderQuiz(quiz);
}

function renderQuiz(qs){
  const box=document.createElement("div");
  let score=0;

  qs.forEach((q,i)=>{
    const d=document.createElement("div");
    d.innerHTML=`<b>Q${i+1}. ${q.question}</b>`;

    q.options.forEach((o,idx)=>{
      const b=document.createElement("button");
      b.innerText=o;

      b.onclick=()=>{
        if(idx===q.answer){score++; b.style.background="green";}
        else b.style.background="red";
      };

      d.appendChild(b);
    });

    box.appendChild(d);
  });

  const submit=document.createElement("button");
  submit.innerText="Submit";

  submit.onclick=()=>{
    addAI(`🎯 Score: ${score}/${qs.length}`);
    detectWeak(score, qs.length);
    addXP(score*5);
  };

  box.appendChild(submit);
  chatBox.appendChild(box);
}

// ================== PRACTICE ==================
async function practiceMode(){
  topic.value += " practice";
  learnTopic();
}

// ================== EXAM ==================
async function examMode(){
  let time=60;
  const timer=setInterval(()=>{
    time--;
    if(time<=0){
      clearInterval(timer);
      addAI("⏱️ Time up!");
    }
  },1000);

  generateQuiz();
}

// ================== WEAK ==================
function detectWeak(score,total){
  if(score/total < 0.5){
    addAI("⚠️ Weak area detected. Revise this topic!");
  }
}

// ================== PDF ==================
async function handlePDF(){
  const file=document.getElementById("pdfUpload").files[0];
  if(!file) return;

  const reader=new FileReader();

  reader.onload=async function(){
    const pdf=await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;

    pdfPages=[];

    for(let i=1;i<=pdf.numPages;i++){
      const page=await pdf.getPage(i);
      const content=await page.getTextContent();
      const text=content.items.map(x=>x.str).join(" ");

      pdfPages.push({page:i,text});
    }

    addAI("📄 PDF ready!");
  };

  reader.readAsArrayBuffer(file);
}

// ================== NOTES ==================
function saveNote(text){
  let notes=JSON.parse(localStorage.getItem("notes")||"[]");
  notes.push(text);
  localStorage.setItem("notes",JSON.stringify(notes));
}

function showNotes(){
  const notes=JSON.parse(localStorage.getItem("notes")||"[]");
  notes.forEach(n=>addAI("📒 "+n));
}

// ================== SHARE ==================
function shareQuestion(q){
  let data=JSON.parse(localStorage.getItem("shared")||"[]");
  data.push(q);
  localStorage.setItem("shared",JSON.stringify(data));
}

function showShared(){
  const data=JSON.parse(localStorage.getItem("shared")||"[]");
  data.forEach(q=>addAI("💬 "+q));
}

// ================== GAME ==================
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
  const today=new Date().toDateString();
  if(gameData.lastActive!==today){
    gameData.streak++;
    gameData.lastActive=today;
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

// ================== DASHBOARD ==================
function showDashboard(){
  addAI(`
📊 Progress

Level: ${gameData.level}
XP: ${gameData.xp}
Streak: ${gameData.streak}
Badges: ${gameData.badges.join(",")}
  `);
}

// ================== THINKING ==================
function thinking(msg="🤖 Thinking..."){
  const d=document.createElement("div");
  d.innerText=msg;
  chatBox.appendChild(d);
  return d;
}
