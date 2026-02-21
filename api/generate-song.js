export default async function handler(req, res) {
  try {
    const { prompt, name } = req.body;

    if (!prompt || !name) {
      return res.status(400).json({ error: "Missing prompt or name" });
    }

    const VOICE_ID = "wFOtYWBAKv6z33WjceQa";

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
          text: `Sing a happy Afrobeats song for ${name}. ${prompt}. Use Nigerian accent and emotional melodic Afrobeats singing.`,
          model_id: "eleven_multilingual_v2"
        })
      }
    );

    if (!elevenResponse.ok) {
      const errText = await elevenResponse.text();
      return res.status(500).json({ error: errText });
    }

    const audioBuffer = await elevenResponse.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
