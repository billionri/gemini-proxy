const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GEMINI_KEY = "AIzaSyAd_kMiYgJCFJlh4dE-s6m9izZkzmO8T0c";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_KEY;

// Serve the HTML app at /app
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/ping', (req, res) => {
  res.json({ ok: true, status: "Gemini proxy live" });
});

// AI proxy endpoint
app.post('/ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.json({ ok: false, error: "No prompt" });

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
      })
    });

    const data = await response.json();
    if (data.error) return res.json({ ok: false, error: data.error.message });

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.json({ ok: false, error: "Empty response from Gemini" });

    res.json({ ok: true, text });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));