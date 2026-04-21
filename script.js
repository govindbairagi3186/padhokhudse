function addMessage(text, type) {
  const chatBox = document.getElementById("chatBox");

  const msg = document.createElement("div");
  msg.className = "p-3 rounded-md text-sm " + (type === "user" ? "user-msg self-end" : "ai-msg");

  msg.innerText = text;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

// LEARN
async function learnTopic() {
  const topic = document.getElementById("topic").value;
  if (!topic) return;

  addMessage(topic, "user");
  showLoader();

  const res = await fetch("/api/tutor", {
    method: "POST",
    body: JSON.stringify({ topic })
  });

  const data = await res.json();

  hideLoader();
  addMessage(data.result, "ai");

  document.getElementById("topic").value = "";
}

// QUIZ
async function generateQuiz() {
  const topic = document.getElementById("topic").value;
  if (!topic) return;

  addMessage("Generate quiz on " + topic, "user");
  showLoader();

  const res = await fetch("/api/quiz", {
    method: "POST",
    body: JSON.stringify({ topic })
  });

  const data = await res.json();

  hideLoader();
  addMessage(data.result, "ai");
}
