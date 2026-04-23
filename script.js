function addMessage(text, type) {
  const chatBox = document.getElementById("chatBox");

  const msg = document.createElement("div");
  msg.className = "p-3 rounded-md text-sm " + 
    (type === "user" ? "bg-gray-700 fade-in" : "bg-gray-900 fade-in");

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

async function learnTopic() {
  const topic = document.getElementById("topic").value;
  if (!topic) return;

  addMessage(topic, "user");
  showLoader();

  try {
    const res = await fetch("/api/tutor", {
      method: "POST",
      body: JSON.stringify({ topic })
    });

    const data = await res.json();

    hideLoader();
    addMessage(data.result, "ai");

  } catch (error) {
    hideLoader();
    addMessage("❌ Error: " + error.message, "ai");
  }

  document.getElementById("topic").value = "";
}
