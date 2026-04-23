let historyStack = [];
let forwardStack = [];

// THEME
function updateThemeIcon(){
  themeBtn.innerText = document.documentElement.classList.contains("dark") ? "🌙" : "☀️";
}

function toggleTheme(){
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark":"light");
  updateThemeIcon();
}

(function(){
  if(localStorage.getItem("theme")==="dark"){
    document.documentElement.classList.add("dark");
  }
  updateThemeIcon();
})();

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

  addAI(`Hey ${name}! 👋😊

I'm your AI tutor 🤖  
Ask anything and I’ll explain it clearly and in a fun way 🎯✨

What do you want to learn today? 🚀`);
}

// NAVIGATION STACK
function goBack(){
  if(historyStack.length){
    forwardStack.push(chatBox.innerHTML);
    chatBox.innerHTML = historyStack.pop();
  }
}

function goForward(){
  if(forwardStack.length){
    historyStack.push(chatBox.innerHTML);
    chatBox.innerHTML = forwardStack.pop();
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
  typeStream(div,text);
}

// TYPE
function typeStream(el,text){
  let i=0;
  function t(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i);
      i+=2;
      setTimeout(t,10);
    } else el.innerHTML=text;
  }
  t();
}

// SCROLL
function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
}

// QUICK TOPIC
function quickTopic(topic){
  showLogin();
  setTimeout(()=>{ document.getElementById("topic").value=topic; },500);
}

// AI
async function learnTopic(){
  const input=document.getElementById("topic");
  const text=input.value;
  if(!text) return;

  addUser(text);
  input.value="";

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text})
  });

  const data=await res.json();
  addAI(data.result);
  scrollBottom();
}
