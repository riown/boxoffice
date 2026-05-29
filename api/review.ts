import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { movieNm, keywords, director, actors, genre } = req.body;
    
    if (!movieNm || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: "영화 제목과 키워드가 필요합니다." });
    }

    const keywordList = keywords.slice(0, 3).join(", ");
    
    const prompt = `당신은 위트 있고 깊은 통찰력을 갖춘 영화 평론가입니다. 영화 "${movieNm}"에 대한 한글 감상평(3~4문장 분량)을 조리 있고 흥미롭게 작성해 주세요.
반드시 다음 세 개의 키워드를 감상평 문장들 속에 자연스럽게 일체화하여 직접 녹여내야 합니다: [ ${keywordList} ]

참고용 영화 세부 정보 (어울린다면 평론에 스며들도록 적절히 조합하고 불필요시 무시하세요):
- 감독: ${director || "정보 없음"}
- 주요 출연진: ${actors || "정보 없음"}
- 장르: ${genre || "정보 없음"}

감상평은 정답만 바로 진중하게 답하고, 서론('네, 감상평입니다' 등)이나 종결 안내 문구 없이 오직 훌륭한 평론 글귀 자체만 반환하세요.`;

    console.log(`Vercel Serverless: Generating Gemini review for: ${movieNm}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "감상평을 생성하지 못했습니다. 다시 시도해 주세요.";
    return res.json({ review: text.trim() });
  } catch (error: any) {
    console.error("Vercel Serverless: Error generating AI review:", error);
    return res.status(500).json({ error: error.message || "감상평 생성 도중 예기치 못한 실패가 발생했습니다." });
  }
}
