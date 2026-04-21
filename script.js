async function learnTopic() {
  const topic = document.getElementById("topic").value;

  const res = await fetch("/api/tutor", {
    method: "POST",
    body: JSON.stringify({ topic })
  });

  const data = await res.json();
  document.getElementById("output").innerText = data.result;
}

async function generateQuiz() {
  const topic = document.getElementById("topic").value;

  const res = await fetch("/api/quiz", {
    method: "POST",
    body: JSON.stringify({ topic })
  });

  const data = await res.json();
  document.getElementById("output").innerText = data.result;
}

async function chat() {
  const message = document.getElementById("chatInput").value;

  const res = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  document.getElementById("chatOutput").innerText = data.result;
}
