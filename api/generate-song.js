export default async function handler(req, res) {
  try {
    const { prompt, name } = req.body;

    if (!prompt || !name) {
      return res.status(400).json({ error: "Missing prompt or name" });
    }

    const VOICE_ID = "auq43ws1oslv0tO4BDa7";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: `Sing an emotional Afrobeats song for ${name}. ${prompt}. Use Nigerian accent.`,
          model_id: "eleven_multilingual_v2"
        })
      }
    );

    const audio = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audio));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
}
