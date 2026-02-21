export default async function handler(req, res) {
  try {
    // Fix: manually parse body if needed
    let body = req.body;

    if (!body || typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const { prompt, name } = body;

    if (!prompt || !name) {
      return res.status(400).json({ error: "Missing prompt or name" });
    }

    const VOICE_ID = "wFOtYWBAKv6z33WjceQa";

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
          text: `Sing a happy Afrobeats song for ${name}. ${prompt}. Use Nigerian accent, emotional singing, melodic Afrobeats style.`,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.9,
            style: 0.7,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const audioBuffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
