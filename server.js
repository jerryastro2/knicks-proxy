const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.SPORTRADAR_API_KEY || 'v5xGfgarWECET89dMDzBm3BdrUuVUjDLkwaJl9xh';
const GAME_ID = process.env.GAME_ID || 'sr:match:70505022';

// Serve the frontend HTML
app.use(express.static(path.join(__dirname, 'public')));

// CORS headers for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Proxy endpoint — browser calls this, server calls SportRadar
app.get('/api/pbp', async (req, res) => {
  try {
    const url = `https://api.sportradar.us/nba/trial/v8/en/games/${GAME_ID}/pbp.json?api_key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: `SportRadar returned ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check — Railway uses this to confirm the server is up
app.get('/health', (req, res) => res.json({ status: 'ok', gameId: GAME_ID }));

app.listen(PORT, () => {
  console.log(`Knicks proxy running on port ${PORT}`);
  console.log(`Game ID: ${GAME_ID}`);
});
