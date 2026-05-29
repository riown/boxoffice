import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI client (with recommended settings)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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

// API route: generate review using Gemini 3.5 Flash server-side
app.post("/api/review", async (req, res) => {
  try {
    const { movieNm, keywords, director, actors, genre } = req.body;
    
    if (!movieNm || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
      res.status(400).json({ error: "영화 제목과 키워드가 필요합니다." });
      return;
    }

    const keywordList = keywords.slice(0, 3).join(", ");
    
    // Prompt structure
    const prompt = `당신은 위트 있고 깊은 통찰력을 갖춘 영화 평론가입니다. 영화 "${movieNm}"에 대한 한글 감상평(3~4문장 분량)을 조리 있고 흥미롭게 작성해 주세요.
반드시 다음 세 개의 키워드를 감상평 문장들 속에 자연스럽게 일체화하여 직접 녹여내야 합니다: [ ${keywordList} ]

참고용 영화 세부 정보 (어울린다면 평론에 스며들도록 적절히 조합하고 불필요시 무시하세요):
- 감독: ${director || "정보 없음"}
- 주요 출연진: ${actors || "정보 없음"}
- 장르: ${genre || "정보 없음"}

감상평은 정답만 바로 진중하게 답하고, 서론('네, 감상평입니다' 등)이나 종결 안내 문구 없이 오직 훌륭한 평론 글귀 자체만 반환하세요.`;

    console.log(`Generating Gemini review for: ${movieNm} with keywords: [${keywordList}]`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "감상평을 생성하지 못했습니다. 다시 시도해 주세요.";
    res.json({ review: text.trim() });
  } catch (error: any) {
    console.error("Error generating AI review:", error);
    res.status(500).json({ error: error.message || "감상평 생성 도중 예기치 못한 실패가 발생했습니다." });
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
