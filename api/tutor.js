export default async function handler(req, res) {
  try {
    // ✅ Parse body safely (Vercel fix)
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic } = body;

    if (!topic) {
      return res.status(400).json({ result: "No topic provided" });
    }

    // 🎯 Detect quiz request
    const isQuiz = topic.toLowerCase().includes("quiz");

    // 🧠 Prompt Engineering
    const prompt = isQuiz
      ? `Create EXACTLY 5 multiple choice questions on "${topic.replace("quiz","")}".

Return ONLY JSON. No explanation.

Format strictly:
[
  {
    "question": "Question here",
    "options": ["A","B","C","D"],
    "answer": 0
  }
]`
      : `Explain "${topic}" in a structured, easy way for students.

Use this format:

## 📘 Overview
Simple explanation

## 🔑 Key Points
- point 1
- point 2
- point 3

## 💡 Example
Give a simple real-life example

## 🧠 Summary
Short conclusion

Make it clean, clear, and engaging.`;

    // 🌐 API Call (STABLE MODEL)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct", // ✅ WORKING MODEL
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    // 🔴 Error handling
    if (!data.choices) {
      return res.status(500).json({
        result: "❌ API Error: " + JSON.stringify(data)
      });
    }

    let output = data.choices[0].message.content;

    // 🧹 Clean response (important for quiz JSON)
    output = output
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // ✅ Send result
    res.status(200).json({
      result: output
    });

  } catch (error) {
    res.status(500).json({
      result: "❌ Server Error: " + error.message
    });
  }
}
