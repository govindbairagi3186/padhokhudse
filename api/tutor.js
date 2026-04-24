export default async function handler(req, res) {
  try {
    const { topic } = req.body;

    // 🎯 Detect quiz request
    const isQuiz = topic.toLowerCase().includes("quiz");

    const prompt = isQuiz
      ? `Create EXACTLY 5 MCQs on "${topic.replace("quiz","")}".

Return ONLY valid JSON.
No explanation.

Format:
[
  {
    "question": "Question",
    "options": ["A","B","C","D"],
    "answer": 0
  }
]`
      : `Explain "${topic}" in structured format:

## 📘 Overview
Simple explanation

## 🔑 Key Points
- point
- point

## 💡 Example
Give example

## 🧠 Summary
Short conclusion`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }]
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
