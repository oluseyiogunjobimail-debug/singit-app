export default async function handler(req, res) {
  try {
    const { prompt, name } = req.body;

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: `Sing an Afrobeats song mentioning ${name}. ${prompt}`,
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
