export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic, history } = body;

    const isQuiz = topic.toLowerCase().includes("quiz");

    let prompt = "";

    // ===== QUIZ =====
    if (isQuiz) {
      prompt = `
Generate at least 5 MCQs on "${topic.replace("quiz","")}".

Return ONLY JSON:

[
  {
    "question": "Question",
    "options": ["A","B","C","D"],
    "answer": 0,
    "explanation": "Why correct"
  }
]
`;
    }

    // ===== CHATGPT STYLE =====
    else {
      prompt = `
You are a smart AI tutor + assistant.

User: "${topic}"

Respond like ChatGPT:

- Natural conversational tone
- Short paragraphs (2–4 lines)
- Clear explanation
- Add examples if helpful
- Add simple diagrams only if useful
- Avoid rigid headings
- Keep it engaging and easy to read

If study topic → explain clearly
If casual → respond normally

Do NOT sound robotic.
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
          ...(history || []),
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      result: data.choices?.[0]?.message?.content || "❌ AI Error"
    });

  } catch (error) {
    res.status(500).json({
      result: "❌ Server Error: " + error.message
    });
  }
}
