require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());

const PORT = 5000;
const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.API_KEY;

// ❌ safety check
if (!API_KEY) {
  console.log("❌ API_KEY missing in .env");
  process.exit(1);
}

// ✅ FIXED FETCH FUNCTION (IMPORTANT)
async function fetchFromTMDB(url, res) {
  try {
    const response = await fetch(url);

    // 🔥 IMPORTANT FIX: check real errors
    if (!response.ok) {
      const text = await response.text();
      console.error("TMDB ERROR:", response.status, text);

      return res.status(response.status).json({
        error: "TMDB request failed",
        status: response.status,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("FETCH FAILED:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// ================= ROUTES =================

// Popular
app.get("/popular", (req, res) => {
  fetchFromTMDB(`${BASE_URL}/movie/popular?api_key=${API_KEY}`, res);
});

// Trending
app.get("/trending", (req, res) => {
  fetchFromTMDB(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, res);
});

// Top Rated
app.get("/toprated", (req, res) => {
  fetchFromTMDB(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`, res);
});

// Search
app.get("/search", (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ error: "Missing query" });
  }

  fetchFromTMDB(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`,
    res
  );
});

// Trailer
app.get("/trailer/:id", (req, res) => {
  fetchFromTMDB(
    `${BASE_URL}/movie/${req.params.id}/videos?api_key=${API_KEY}`,
    res
  );
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});