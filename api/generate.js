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

    // 🔥 Send request to Suno API
    const sunoResponse = await fetch("https://api.sunoapi.org/api/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        title: title,
        prompt: lyrics,
        style: "Afrobeats, Nigerian, modern, high quality vocals"
      })
    });

    const sunoData = await sunoResponse.json();

    if (!sunoResponse.ok) {
      return res.status(500).json({
        error: sunoData.message || "Suno generation failed"
      });
    }

    return res.status(200).json({
      success: true,
      data: sunoData
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
