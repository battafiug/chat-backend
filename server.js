const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Nachrichten-Speicher
const messages = [];

// API: Nachricht senden
app.post("/api/messages", (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Nachricht darf nicht leer sein." });
  }

  const message = {
    id: Date.now(),
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  messages.push(message);

  if (messages.length > 200) {
    messages.shift();
  }

  res.status(201).json(message);
});

// API: Nachrichten holen
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
