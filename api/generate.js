export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, lyrics } = req.body;

    if (!title || !lyrics) {
      return res.status(400).json({
        error: "Title and lyrics are required"
      });
    }

    const API_KEY = process.env.SUNO_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: "Missing SUNO_API_KEY"
      });
    }

    // STEP 1 — Create task
    const generateResponse = await fetch(
      "https://api.sunoapi.org/api/v1/generate",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customMode: true,
          instrumental: false,
          model: "V4_5ALL",
          title: title,
          prompt: lyrics,
          style: "Afrobeats"
        })
      }
    );

    const generateData = await generateResponse.json();

    if (!generateResponse.ok) {
      return res.status(500).json(generateData);
    }

    if (!generateData.data || !generateData.data.taskId) {
      return res.status(500).json(generateData);
    }

    const taskId = generateData.data.taskId;

    // STEP 2 — Poll for result
    let streamUrl = null;
    let attempts = 0;

    while (!streamUrl && attempts < 20) {
      await new Promise(r => setTimeout(r, 5000));

      const statusResponse = await fetch(
        `https://api.sunoapi.org/api/v1/generate/record?taskId=${taskId}`,
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`
          }
        }
      );

      const statusData = await statusResponse.json();

      if (
        statusData.code === 200 &&
        statusData.data &&
        statusData.data.status === "SUCCESS"
      ) {
        streamUrl = statusData.data.streamUrl;
        break;
      }

      attempts++;
    }

    if (!streamUrl) {
      return res.status(500).json({
        error: "Song generation timed out"
      });
    }

    return res.status(200).json({
      success: true,
      streamUrl
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
