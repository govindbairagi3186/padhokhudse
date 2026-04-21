export default async function handler(req, res) {
  try {
    const { topic } = JSON.parse(req.body);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
     body: JSON.stringify({
  model: "openchat/openchat-3.5",
  messages: [
    {
      role: "user",
      content: `Explain ${topic} in a detailed and simple way for a student`
    }
  ]
})

    const data = await response.json();

    // 🔴 DEBUG LINE (important)
    console.log("API RESPONSE:", data);

    // ❌ If API fails
    if (!data.choices) {
      return res.status(500).json({
        result: "❌ API Error: " + JSON.stringify(data)
      });
    }

    // ✅ Success
    res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      result: "❌ Server Error: " + error.message
    });
  }
}
