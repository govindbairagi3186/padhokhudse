export default async function handler(req, res) {
  try {
    const { topic } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

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
            content: `Explain ${topic} in this format:

## Topic Overview
Simple explanation

## Key Points
- point 1
- point 2

## Example
Give example

## Summary
Short conclusion`
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return res.status(500).json({ result: "❌ API Error: " + JSON.stringify(data) });
    }

    res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ result: "❌ Server Error: " + err.message });
  }
}
