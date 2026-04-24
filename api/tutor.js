export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic, mode } = body;

    // 🧠 SMART PROMPT
    let prompt = "";

    if (topic.toLowerCase().includes("quiz")) {
      prompt = `Create 5 MCQs on "${topic}".
Return ONLY JSON like:
[
 { "question": "...", "options": ["A","B","C","D"], "answer": 0 }
]`;
    } else {
      prompt = `
You are a smart AI assistant like ChatGPT.

User asked: "${topic}"

👉 First understand the type:
- If coding → give code + explanation
- If math → solve step-by-step
- If theory → explain clearly
- If general → respond like helpful assistant

👉 Response style:
- Use emojis where useful
- Be engaging (not boring)
- Use headings

👉 Depth:
${mode === "long" ? "Give detailed explanation with examples and tips." : "Keep it short but clear."}

👉 Format (only if topic is educational):
## 🚀 Overview
## 📌 Key Points
## 💡 Example
## 🧠 Extra Insight
## 🎯 Summary

👉 If it's not educational:
Respond naturally like ChatGPT (no strict format)

👉 Always:
- Be helpful
- Be clear
- Be slightly conversational
`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

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
