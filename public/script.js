document.addEventListener("keydown", function(e) {
    if (e.key.toLowerCase() === "x") {
        const overlay = document.getElementById("imageOverlay");
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    }
});

document.addEventListener("keydown", function(e) {
    if (e.key.toLowerCase() === "y") {
        const overlay = document.getElementById("imageOverlayFR");
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    }
});

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("messageInput");
const sendButtonEl = document.getElementById("sendButton");

// Eine pseudo-"User-ID" pro Browser-Tab (nur fürs Styling "self")
const SESSION_ID = Math.random().toString(36).slice(2);

// Nachricht senden
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  sendButtonEl.disabled = true;

  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      console.error("Fehler beim Senden");
    } else {
      inputEl.value = "";
      autoResizeTextarea();
      await loadMessages();
      scrollToBottom();
    }
  } catch (err) {
    console.error("Netzwerkfehler", err);
  } finally {
    sendButtonEl.disabled = false;
  }
}

// Nachrichten laden
async function loadMessages() {
  try {
    const res = await fetch("/api/messages");
    const data = await res.json();
    renderMessages(data);
  } catch (err) {
    console.error("Fehler beim Laden der Nachrichten", err);
  }
}

// Nachrichten im DOM anzeigen
function renderMessages(msgs) {
  messagesEl.innerHTML = "";

  msgs.forEach((m, index) => {
    const row = document.createElement("div");
    row.className = "message-row";

    // Fake-Zuordnung: jede 3. Nachricht gehört "dir"
    const isSelf = (index + SESSION_ID.length) % 3 === 0;
    if (isSelf) row.classList.add("self");

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = m.text;

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const date = new Date(m.createdAt);
    const timeStr = date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    });

    meta.textContent = timeStr;

    row.appendChild(bubble);
    row.appendChild(meta);

    messagesEl.appendChild(row);
  });
}

// Auto-Scroll ganz nach unten
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Textarea auto-resize
function autoResizeTextarea() {
  inputEl.style.height = "auto";
  inputEl.style.height = inputEl.scrollHeight + "px";
}

/* Event Listener */

sendButtonEl.addEventListener("click", sendMessage);

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

inputEl.addEventListener("input", autoResizeTextarea);

/* Polling: alle 2 Sekunden Nachrichten aktualisieren */
setInterval(async () => {
  await loadMessages();
}, 2000);

// Initial
loadMessages();
scrollToBottom();
autoResizeTextarea();

