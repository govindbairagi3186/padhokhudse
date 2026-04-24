let username = localStorage.getItem("username") || "";
let isLoading = false;

// 🎯 MOTIVATION
const lines = [
  "💡 Keep learning, you're growing!",
  "🚀 Your future is built today!",
  "🔥 Stay consistent!",
  "📚 Knowledge is power!",
  "🌟 You can do it!"
];

// 🚀 START
function startApp(){
  landing.style.display="none";
  loaderPage.style.display="flex";

  motivation.innerText = lines[Math.floor(Math.random()*lines.length)];

  setTimeout(()=>{
    loaderPage.style.display="none";
    app.style.display="flex";

    if(!username){
      username = prompt("Enter your name:");
      localStorage.setItem("username", username);
    }

    newChat();
  },1200);
}

// 💬 NEW CHAT
function newChat(){
  chatBox.innerHTML="";
  addAI(`👋 Hello ${username}! Ready to learn something new today? 🚀`);
}

// 👤 USER
function addUser(text){
  const d=document.createElement("div");
  d.className="chat-user p-3 rounded ml-auto max-w-xl fade";
  d.innerText=text;
  chatBox.appendChild(d);
  scrollBottom();
}

// 🤖 AI
function addAI(text){
  const d=document.createElement("div");
  d.className="chat-ai p-4 rounded max-w-xl fade cursor";
  chatBox.appendChild(d);
  stream(d, format(text));
}

// ⚡ FAST STREAM
function stream(el,text){
  let i=0;
  function run(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i);
      i+=25;
      requestAnimationFrame(run);
    } else {
      el.innerHTML=text;
      el.classList.remove("cursor");
    }
  }
  run();
}

// 🎨 FORMAT
function format(t){
  return t
    .replace(/## (.*)/g,"<h2 class='text-blue-400 font-bold mt-3'>$1</h2>")
    .replace(/\*\*(.*?)\*\*/g,"<b>$1</b>")
    .replace(/- (.*)/g,"<li>• $1</li>")
    .replace(/\n/g,"<br>");
}

// 🤖 THINKING
function thinking(msg="🤖 Thinking..."){
  const d=document.createElement("div");
  d.className="chat-ai p-3 animate-pulse";
  d.innerText=msg;
  chatBox.appendChild(d);
  scrollBottom();
  return d;
}

// 🔽 SCROLL
function scrollBottom(){
  setTimeout(()=>{
    chatBox.scrollTop = chatBox.scrollHeight;
  },50);
}

// 🤖 AI CALL (FIXED)
async function learnTopic(){
  if(isLoading) return;
  isLoading = true;

  const text=topic.value;
  if(!text){
    isLoading=false;
    return;
  }

  addUser(text);
  topic.value="";

  const t=thinking();

  try{
    const res=await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        topic:text,
        mode:document.getElementById("mode").value
      })
    });

    const data=await res.json();
    t.remove();

    addAI(data.result || "⚠️ No response");

  }catch{
    t.remove();
    addAI("❌ Server error, try again");
  }

  isLoading=false;
}

// 📝 QUIZ (FIXED)
async function generateQuiz(){
  if(isLoading) return;
  isLoading=true;

  const text=topic.value;
  if(!text){
    alert("Enter topic");
    isLoading=false;
    return;
  }

  const t=thinking("🧠 AI is making quiz...");

  try{
    const res=await fetch("/api/tutor",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic:text+" quiz"})
    });

    const data=await res.json();
    t.remove();

    const quiz=JSON.parse(data.result.replace(/```json|```/g,""));
    renderQuiz(quiz);

  }catch{
    t.remove();
    addAI("❌ Quiz failed");
  }

  isLoading=false;
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
  submit.className="mt-4 bg-blue-500 px-4 py-2 rounded";

  submit.onclick=()=>{
    addAI(`🎯 Score: ${score}/${qs.length} 🚀`);
  };

  box.appendChild(submit);
  chatBox.appendChild(box);
}

// 📊 DASHBOARD
function showDashboard(){
  addAI("📊 Dashboard coming soon 🚀");
}
