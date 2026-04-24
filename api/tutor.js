export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic, mode } = body;

    const prompt = topic.includes("quiz")
      ? `Create 5 MCQs on "${topic}". 
Return ONLY JSON like this:
[
 { "question": "...", "options": ["A","B","C","D"], "answer": 0 }
]`
      : `Explain "${topic}" in a ${mode === "long" ? "detailed" : "short"} way.

Use this format:

## Overview
Simple explanation

## Key Points
- point 1
- point 2
- point 3

## Example
Give a simple example

## Summary
Short conclusion`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // ✅ WORKING MODEL
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    // 🔴 DEBUG LOG (IMPORTANT)
    console.log("API RESPONSE:", data);

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
