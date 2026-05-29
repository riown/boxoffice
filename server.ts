import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// API Key fallback to user-supplied key if env variable is not specified
const KOBIS_API_KEY = process.env.KOBIS_API_KEY || "c8c3a7ff168e1f60d6058a0d72ce0c86";

// CORS Headers (just in case)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// JSON parsing
app.use(express.json());

// API route: daily box office
app.get("/api/boxoffice", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== "string" || !/^\d{8}$/.test(date)) {
       res.status(400).json({ error: "Invalid date format. Expected YYYYMMDD." });
       return;
    }

    const apiUrl = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${date}`;
    console.log(`Fetching daily box office for: ${date}`);
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`KOBIS API returned status ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching box office details:", error);
    res.status(500).json({ error: error.message || "Failed to fetch box office list." });
  }
});

// API route: movie details
app.get("/api/movie", async (req, res) => {
  try {
    const { movieCd } = req.query;
    if (!movieCd || typeof movieCd !== "string") {
       res.status(400).json({ error: "movieCd parameter is required." });
       return;
    }

    const apiUrl = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${movieCd}`;
    console.log(`Fetching movie details for code: ${movieCd}`);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`KOBIS API returned status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ error: error.message || "Failed to fetch movie details." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
