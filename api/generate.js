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

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
