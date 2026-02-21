export default async function handler(req, res) {
  try {
    const { prompt, name } = req.body;

    if (!prompt || !name) {
      return res.status(400).json({ error: "Missing prompt or name" });
    }

    const VOICE_ID = "auq43ws1oslv0t04BDa7";

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `Sing an emotional Afrobeats song for ${name}. ${prompt}. Use Nigerian accent and expressive singing style.`,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      console.error(errorText);
      return res.status(500).json({ error: "ElevenLabs API failed" });
    }

    const audioBuffer = await elevenResponse.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
