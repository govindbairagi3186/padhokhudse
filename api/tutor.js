export default async function handler(req, res) {
  try {
    // ✅ Safe parsing
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { topic } = body;

    if (!topic) {
      return res.status(400).json({ result: "❌ Please enter a topic" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it", // ✅ Working model
        messages: [
          {
            role: "user",
            content: `Explain ${topic} in this format:

## Topic Overview
Simple explanation

## Key Points
- point 1
- point 2
- point 3

## Example
Give a real example

## Summary
Short conclusion`
          }
        ]
      })
    });

    const data = await response.json();

    // ✅ Handle API errors
    if (!data.choices) {
      return res.status(500).json({
        result: "❌ API Error: " + JSON.stringify(data)
      });
    }

    res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      result: "❌ Server Error: " + error.message
    });
  }
}
