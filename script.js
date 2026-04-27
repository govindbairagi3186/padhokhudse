let username = localStorage.getItem("username") || "";
let isLoading = false;
let chatMemory = [];

// START
function startApp(){
  landing.style.display="none";
  app.style.display="flex";

  if(!username){
    username = prompt("Enter your name:");
    localStorage.setItem("username", username);
  }

  newChat();
}

// NEW CHAT
function newChat(){
  chatBox.innerHTML="";
  addAI(`👋 Hello ${username}! Ask me anything 📚🤖`);
}

// USER
function addUser(text){
  const d=document.createElement("div");
  d.className="chat-user p-3 rounded ml-auto max-w-xl";
  d.innerText=text;
  chatBox.appendChild(d);
  scrollBottom();
}

// AI
function addAI(text){
  const d=document.createElement("div");
  d.className="chat-ai p-4 rounded max-w-xl";
  chatBox.appendChild(d);
  stream(d, format(text));
}

// STREAM
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

// FORMAT
function format(t){
  return t
    .replace(/## (.*)/g,"<h2 class='text-blue-400 font-bold mt-3'>$1</h2>")
    .replace(/\*\*(.*?)\*\*/g,"<b>$1</b>")
    .replace(/- (.*)/g,"<li>• $1</li>")
    .replace(/\n/g,"<br>");
}

// THINKING
function thinking(){
  const d=document.createElement("div");
  d.innerText="🤖 Thinking...";
  chatBox.appendChild(d);
  return d;
}

// SCROLL
function scrollBottom(){
  chatBox.scrollTop=chatBox.scrollHeight;
}

// MAIN AI CALL
async function learnTopic(){
  if(isLoading) return;
  isLoading=true;

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
        history:chatMemory.slice(-6)
      })
    });

    const data=await res.json();
    t.remove();

    addAI(data.result);

    chatMemory.push({role:"user",content:text});
    chatMemory.push({role:"assistant",content:data.result});

  }catch{
    t.remove();
    addAI("❌ Error fetching response");
  }

  isLoading=false;
}
