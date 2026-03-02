export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { lyrics, title } = req.body;

    if (!lyrics || !title) {
      return res.status(400).json({
        error: "Lyrics and title are required",
      });
    }

    const API_KEY = process.env.SUNO_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "Missing SUNO_API_KEY",
      });
    }

    const response = await fetch(
      "https://api.sunoapi.org/api/v1/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          customMode: true,
          instrumental: false,
          model: "V5",
          prompt: lyrics,
          title: title,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Suno API error",
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
