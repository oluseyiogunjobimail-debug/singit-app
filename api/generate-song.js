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

/* ✅ Your working ElevenLabs Voice ID */
const VOICE_ID = "HAvvFKatz0uu0Fv55Riy";

/* Make sure ELEVENLABS_API_KEY is set in Vercel */

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
text: `Sing a happy Afrobeats song for ${name}. ${prompt}. Use Nigerian accent, emotional singing style.`,
model_id: "eleven_multilingual_v2",
voice_settings: {
stability: 0.5,
similarity_boost: 0.8
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
