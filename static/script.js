// Toggle logic – do not touch your existing chat functions
const toggleBtn = document.getElementById('chat-toggle');
const chatWidget = document.getElementById('chat-container');
toggleBtn.addEventListener('click', () => {
  chatWidget.classList.toggle('visible');
});

// --- your existing code below ---

const chatBox = document.getElementById("chat-box");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

let conversation = [];

// helper to render a message
function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", role);
  const msg = document.createElement("div");
  msg.classList.add("text");
  msg.textContent = text;
  wrapper.appendChild(msg);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// send current input
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  // render user msg
  appendMessage("user", text);
  conversation.push({ role: "user", content: text });
  inputEl.value = "";

  // call backend
  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation })
    });
    const { reply } = await res.json();
    appendMessage("assistant", reply);
    conversation.push({ role: "assistant", content: reply });
  } catch (err) {
    appendMessage("assistant", "⚠️ Error contacting server.");
    console.error(err);
  }
}

// event listeners
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});
