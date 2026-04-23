export default async function handler(req, res) {
  try {
    const { topic } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          {
            role: "user",
            content: `Explain ${topic} clearly, structured and fast.

Use:
- short sections
- bullets
- examples if needed

Keep it simple and engaging.`
          }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      result: data.choices?.[0]?.message?.content || "Error"
    });

  } catch (err) {
    res.status(500).json({ result: err.message });
  }
}
