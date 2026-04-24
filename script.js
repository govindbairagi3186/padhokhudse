let username = localStorage.getItem("username") || "";

// 🌙 THEME
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
}

// 🚀 START
function startApp(){
  document.getElementById("landing").style.display="none";
  document.getElementById("loaderPage").style.display="flex";

  setTimeout(()=>{
    document.getElementById("loaderPage").style.display="none";
    document.getElementById("app").style.display="flex";

    if(!username){
      username = prompt("Enter your name:");
      localStorage.setItem("username", username);
    }

    addAI(`👋 Hello ${username}! Ready to learn something new today? 🚀`);

  },2000);
}

// 💬 CHAT
function addUser(text){
  const d=document.createElement("div");
  d.className="chat-user p-3 rounded ml-auto max-w-xl fade-in";
  d.innerText=text;
  chatBox.appendChild(d);
}

function addAI(text){
  const d=document.createElement("div");
  d.className="chat-ai p-3 rounded max-w-xl fade-in cursor";
  chatBox.appendChild(d);
  stream(d, format(text));
}

// ⚡ STREAM
function stream(el,text){
  let i=0;
  function run(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i);
      i+=6;
      setTimeout(run,5);
    } else el.classList.remove("cursor");
  }
  run();
}

// 🧠 FORMAT
function format(t){
  return t
    .replace(/## (.*)/g,"<h2 class='text-lg font-bold text-blue-400 mt-3'>$1</h2>")
    .replace(/- (.*)/g,"<li>• $1</li>")
    .replace(/\n/g,"<br>");
}

// 🤖 THINK
function thinking(msg="🤖 Thinking..."){
  const d=document.createElement("div");
  d.className="chat-ai p-3 animate-pulse";
  d.innerText=msg;
  chatBox.appendChild(d);
  return d;
}

// 🔽
function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
}

// 🤖 AI
async function learnTopic(){
  const text=topic.value;
  if(!text) return;

  addUser(text);
  topic.value="";

  const t=thinking();

  const mode=document.getElementById("mode").value;

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text,mode})
  });

  const data=await res.json();
  t.remove();
  addAI(data.result);
  scrollBottom();
}

// 📝 QUIZ
async function generateQuiz(){
  const text=topic.value;
  if(!text) return alert("Enter topic");

  const t=thinking("🧠 AI is creating your quiz...");

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text+" quiz"})
  });

  const data=await res.json();
  t.remove();

  const quiz=JSON.parse(data.result.replace(/```json|```/g,""));
  renderQuiz(quiz);
}

// 🎯 QUIZ
function renderQuiz(qs){
  const box=document.createElement("div");
  box.className="chat-ai p-4 rounded fade-in";

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
    addAI(`🎯 Score: ${score}/${qs.length} 🚀`);
  };

  box.appendChild(submit);
  chatBox.appendChild(box);
}

// 📊 DASHBOARD
function showDashboard(){
  addAI("📊 Dashboard coming soon with charts 📈");
}

// INIT
loadHistory?.();
