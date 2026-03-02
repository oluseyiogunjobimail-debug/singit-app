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

    // STEP 1: Create music generation task
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

    if (generateData.code !== 200) {
      return res.status(500).json({
        error: "Failed to create generation task",
        details: generateData
      });
    }

    const taskId = generateData.data.taskId;

    // STEP 2: Poll for result
    let songUrl = null;
    let attempts = 0;

    while (!songUrl && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 sec

      const statusResponse = await fetch(
        `https://api.sunoapi.org/api/v1/generate/record?taskId=${taskId}`,
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`
          }
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.code === 200 && statusData.data?.status === "SUCCESS") {
        songUrl = statusData.data.streamUrl;
        break;
      }

      attempts++;
    }

    if (!songUrl) {
      return res.status(500).json({
        error: "Song generation timed out"
      });
    }

    return res.status(200).json({
      success: true,
      streamUrl: songUrl
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
}
