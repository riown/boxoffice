const KOBIS_API_KEY = process.env.KOBIS_API_KEY || "c8c3a7ff168e1f60d6058a0d72ce0c86";

export default async function handler(req: any, res: any) {
  // Support CORS if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { date } = req.query;
    if (!date || typeof date !== "string" || !/^\d{8}$/.test(date)) {
       return res.status(400).json({ error: "Invalid date format. Expected YYYYMMDD." });
    }

    const apiUrl = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${date}`;
    console.log(`Vercel Serverless: Fetching daily box office for: ${date}`);
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`KOBIS API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Vercel Serverless: Error fetching box office list:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch box office list." });
  }
}
