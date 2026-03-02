export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, lyrics } = req.body;

    if (!title || !lyrics) {
      return res.status(400).json({ error: "Title and lyrics are required" });
    }

    const API_KEY = process.env.SUNO_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing SUNO_API_KEY" });
    }

    const CALLBACK_URL = "https://mail-5400s-projects.vercel.app/api/callback";

    // STEP 1: Create generation task
    const createResponse = await fetch(
      "https://api.sunoapi.org/api/v1/generate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customMode: true,
          instrumental: false,
          model: "V4_5ALL",
          callBackUrl: CALLBACK_URL,
          title: title,
          prompt: lyrics,
          style: "Afrobeats"
        })
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      return res.status(createResponse.status).json(createData);
    }

    const taskId = createData?.data?.taskId;

    if (!taskId) {
      return res.status(500).json(createData);
    }

    // STEP 2: Poll for result
    let streamUrl = null;
    let attempts = 0;

    while (!streamUrl && attempts < 25) {
      await new Promise(r => setTimeout(r, 4000));

      const statusResponse = await fetch(
        `https://api.sunoapi.org/api/v1/generate/record?taskId=${taskId}`,
        {
          headers: { Authorization: `Bearer ${API_KEY}` }
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.code === 200 && statusData.data) {

        if (Array.isArray(statusData.data)) {
          const first = statusData.data[0];
          if (first?.streamUrl) {
            streamUrl = first.streamUrl;
            break;
          }
          if (first?.audioUrl) {
            streamUrl = first.audioUrl;
            break;
          }
        }

        if (statusData.data.streamUrl) {
          streamUrl = statusData.data.streamUrl;
          break;
        }

        if (statusData.data.audioUrl) {
          streamUrl = statusData.data.audioUrl;
          break;
        }
      }

      attempts++;
    }

    if (!streamUrl) {
      return res.status(500).json({
        error: "Song generation timed out or still processing."
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
