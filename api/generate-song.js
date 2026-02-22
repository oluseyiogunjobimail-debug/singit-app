export default async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let body = req.body;

    if (!body || typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const { name, prompt } = body;

    if (!name || !prompt) {
      return res.status(400).json({ error: "Missing name or prompt" });
    }

    // ✅ Your Custom Nigerian Voice
    const VOICE_ID = "jtJcRvH7INfhd6c0RFKF";

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: `Perform in modern Nigerian Afrobeats vocal style. Use natural Lagos intonation, expressive melodic phrasing, and rhythmic bounce. Sing for ${name}. ${prompt}.`,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      return res.status(500).json({
        error: "ElevenLabs error",
        details: errorText
      });
    }

    const audioBuffer = await elevenResponse.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    return res.send(Buffer.from(audioBuffer));

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
}
