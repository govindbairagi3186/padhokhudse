function addMessage(text, type) {
  const chatBox = document.getElementById("chatBox");

  const msg = document.createElement("div");
  msg.className = "p-3 rounded-md text-sm " +
    (type === "user" ? "bg-gray-700" : "bg-gray-900");

  if (type === "ai") {
    typeWriter(msg, text); // typing effect
  } else {
    msg.innerText = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ✨ TYPING EFFECT
function typeWriter(element, text) {
  let i = 0;
  element.innerHTML = "";

  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, 15); // speed
    }
  }

  typing();
}

function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

// 🚀 MAIN FUNCTION
async function learnTopic() {
  const topic = document.getElementById("topic").value;
  if (!topic) return;

  addMessage(topic, "user");
  showLoader();

  try {
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic })
    });

    const data = await res.json();

    hideLoader();
    addMessage(formatText(data.result), "ai");

  } catch (error) {
    hideLoader();
    addMessage("❌ Error: " + error.message, "ai");
  }

  document.getElementById("topic").value = "";
}

// 🧠 FORMAT TEXT (HEADINGS + BULLETS)
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // bold
    .replace(/\n/g, "<br>") // line break
    .replace(/- /g, "• "); // bullets
}
