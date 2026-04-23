let chats = {};
let currentChat = null;

// 🌗 THEME
function updateThemeIcon(){
  const btn=document.getElementById("themeBtn");
  if(document.documentElement.classList.contains("dark")){
    btn.innerText="🌙";
  } else {
    btn.innerText="☀️";
  }
}

function toggleTheme(){
  const html=document.documentElement;
  if(html.classList.contains("dark")){
    html.classList.remove("dark");
    localStorage.setItem("theme","light");
  } else {
    html.classList.add("dark");
    localStorage.setItem("theme","dark");
  }
  updateThemeIcon();
}

(function(){
  const saved=localStorage.getItem("theme");
  if(saved==="dark"){
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
  cursorGlow.style.display="none";

  newChat();

  addAI(`Hey ${name}! 👋😊

I'm your AI tutor 🤖  
Ask me anything and I’ll explain it in a simple way ✨

What do you want to learn today? 🚀`);
}

// CHAT
function newChat(){
  chatBox.innerHTML="";
}

function addUser(text){
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

// STREAM
function typeStream(el,text){
  let i=0;
  function t(){
    if(i<text.length){
      el.innerHTML=text.slice(0,i)+"<span class='cursor'></span>";
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

// LOADER
function showLoader(){
  const d=document.createElement("div");
  d.id="loader";
  d.innerText="🤖 Thinking...";
  chatBox.appendChild(d);
}

function hideLoader(){
  const l=document.getElementById("loader");
  if(l) l.remove();
}

// AI
async function learnTopic(){
  const input=document.getElementById("topic");
  const text=input.value;
  if(!text) return;

  addUser(text);
  input.value="";
  showLoader();

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic:text})
  });

  const data=await res.json();
  hideLoader();

  addAI(data.result);
  scrollBottom();
}
