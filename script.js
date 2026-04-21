function showOutput(text) {
  const box = document.getElementById("output");
  box.style.display = "block";
  box.innerText = text;
}
function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

function animateOutput(id, text) {
  const box = document.getElementById(id);
  box.style.opacity = 0;

  setTimeout(() => {
    box.innerText = text;
    box.style.opacity = 1;
  }, 200);
}

// Learn Topic
async function learnTopic() {
  const topic = document.getElementById("topic").value;

  showLoader();

  const res = await fetch("/api/tutor", {
    method: "POST",
    body: JSON.stringify({ topic })
  });

  const data = await res.json();

  hideLoader();
  showOutput(data.result);
}

// Quiz
async function generateQuiz() {
  const topic = document.getElementById("topic").value;

  showLoader();

  const res = await fetch("/api/quiz", {
    method: "POST",
    body: JSON.stringify({ topic })
  });

  const data = await res.json();

  hideLoader();
  showOutput(data.result);
}

// Chat
async function chat() {
  const message = document.getElementById("chatInput").value;

  showLoader();

  const res = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  hideLoader();
  showOutput(data.result);
}
function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}
