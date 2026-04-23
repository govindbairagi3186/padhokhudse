let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentChat = null;

// LOGIN
function showLogin(){ landing.style.display="none"; loginPage.style.display="flex"; }

function login(){
  const name=username.value;
  if(!name) return;

  localStorage.setItem("user",name);
  loginPage.style.display="none";
  app.style.display="flex";

  newChat();

  setTimeout(()=>{
    addMessage(`Hey ${name}! 👋

I'm your AI tutor 😊  
Ask me anything and I’ll explain it simply.

What do you want to learn today? 🚀`,"ai");
  },500);

  renderHistory();
}

// NEW CHAT
function newChat(){
  const id="chat_"+Date.now();
  chats[id]={messages:[]};
  currentChat=id;
  saveChats(); renderHistory(); renderChat();
}

function saveChats(){ localStorage.setItem("chats",JSON.stringify(chats)); }

// HISTORY
function renderHistory(){
  history.innerHTML="";
  Object.keys(chats).forEach(id=>{
    const div=document.createElement("div");
    div.className="p-2 bg-gray-800 rounded flex justify-between";

    const title=document.createElement("span");
    title.innerText="Chat";
    title.onclick=()=>{currentChat=id;renderChat();};

    const del=document.createElement("button");
    del.innerText="🗑";
    del.onclick=()=>{delete chats[id]; saveChats(); renderHistory(); chatBox.innerHTML="";};

    div.append(title,del);
    history.appendChild(div);
  });
}

// FORMAT
function format(text){
  text=text.replace(/```([\s\S]*?)```/g,(m,code)=>{
    return `<pre><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>${code}</code></pre>`;
  });

  return text
    .replace(/## Topic Overview/g,"📘 <b>Topic Overview</b>")
    .replace(/## Key Points/g,"🧠 <b>Key Points</b>")
    .replace(/## Example/g,"💡 <b>Example</b>")
    .replace(/## Summary/g,"📌 <b>Summary</b>")
    .replace(/- /g,"• ")
    .replace(/\n/g,"<br>");
}

// COPY
function copyCode(btn){
  const code=btn.nextElementSibling.innerText;
  navigator.clipboard.writeText(code);
  btn.innerText="Copied!";
  setTimeout(()=>btn.innerText="Copy",1500);
}

// TYPE
function typeStream(el,html){
  let i=0;
  function t(){
    if(i<html.length){
      el.innerHTML=html.slice(0,i)+'<span class="cursor"></span>';
      i+=3;
      setTimeout(t,10);
    } else el.innerHTML=html;
  }
  t();
}

// MESSAGE
function addMessage(text,type,save=true){
  const div=document.createElement("div");
  div.className="p-3 rounded-xl max-w-[75%] "+(type==="user"?"user ml-auto":"ai");

  if(type==="ai") typeStream(div,format(text));
  else div.innerText=text;

  chatBox.appendChild(div);
  chatBox.scrollTop=chatBox.scrollHeight;

  if(save){
    chats[currentChat].messages.push({text,type});
    saveChats();
  }
}

// LOADER
function showLoader(){
  const d=document.createElement("div");
  d.id="loader";
  d.innerText="Thinking...";
  chatBox.appendChild(d);
}
function hideLoader(){ const l=document.getElementById("loader"); if(l) l.remove(); }

// AI
async function learnTopic(){
  const input=document.getElementById("topic");
  const topic=input.value;
  if(!topic) return;

  addMessage(topic,"user");
  input.value="";
  showLoader();

  const res=await fetch("/api/tutor",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({topic})
  });

  const data=await res.json();
  hideLoader();
  addMessage(data.result,"ai");
}
