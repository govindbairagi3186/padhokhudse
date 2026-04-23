let historyStack = [];
let forwardStack = [];

// THEME
function toggleTheme(){
  document.documentElement.classList.toggle("dark");
}

// NAV
function showLogin(){
  landing.style.display="none";
  loginPage.style.display="flex";
}

function login(){
  const name=username.value;
  if(!name) return;

  localStorage.setItem("user",name);

  loginPage.style.display="none";
  app.style.display="flex";

  newChat();

  addAI(`Hey ${name}! 👋 I'm your AI tutor. Ask anything 🚀`);
}

// CHAT NAV
function goBack(){
  if(historyStack.length){
    forwardStack.push(chatBox.innerHTML);
    chatBox.innerHTML=historyStack.pop();
  }
}

function goForward(){
  if(forwardStack.length){
    historyStack.push(chatBox.innerHTML);
    chatBox.innerHTML=forwardStack.pop();
  }
}

// CHAT
function newChat(){
  chatBox.innerHTML="";
}

function addUser(text){
  historyStack.push(chatBox.innerHTML);
  forwardStack=[];

  const div=document.createElement("div");
  div.className="chat-user ml-auto max-w-xl p-3 rounded-lg";
  div.innerText=text;
  chatBox.appendChild(div);
}

function addAI(text){
  const div=document.createElement("div");
  div.className="chat-ai max-w-xl p-3 rounded-lg";
  chatBox.appendChild(div);

  streamText(div, formatAI(text));
}

// ⚡ NON-BLOCKING STREAM (IMPORTANT FIX)
function streamText(el, text){
  let i = 0;

  function render(){
    if(i < text.length){
      el.innerHTML = text.slice(0, i);
      i += 5;

      // 🔥 runs independently of scroll
      setTimeout(render, 5);
    } else {
      el.innerHTML = text;
    }
  }

  render();
}

// FORMAT
function formatAI(text){
  return text
    .replace(/\*\*(.*?)\*\*/g,"<b>$1</b>")
    .replace(/\n/g,"<br>")
    .replace(/- /g,"• ");
}

// SCROLL
function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
}

// QUICK
function quickTopic(t){
  showLogin();
  setTimeout(()=>{ topic.value=t },500);
}

// AI
async function learnTopic(){
  const input=topic;
  const text=input.value;
  if(!text) return;

  addUser(text);
  input.value="";

  const div=document.createElement("div");
  div.className="chat-ai max-w-xl p-3 rounded-lg";
  div.innerText="⚡ Thinking...";
  chatBox.appendChild(div);

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text})
  });

  const data=await res.json();

  div.innerHTML="";
  streamText(div, formatAI(data.result));
}
