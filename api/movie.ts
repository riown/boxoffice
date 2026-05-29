const KOBIS_API_KEY = process.env.KOBIS_API_KEY || "c8c3a7ff168e1f60d6058a0d72ce0c86";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { movieCd } = req.query;
    if (!movieCd || typeof movieCd !== "string") {
       return res.status(400).json({ error: "movieCd parameter is required." });
    }

    const apiUrl = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${KOBIS_API_KEY}&movieCd=${movieCd}`;
    console.log(`Vercel Serverless: Fetching movie details for code: ${movieCd}`);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`KOBIS API returned status ${response.status}`);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Vercel Serverless: Error fetching movie details:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch movie details." });
  }
}
