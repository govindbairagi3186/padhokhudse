export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic, history } = body;

    const isQuiz = topic.toLowerCase().includes("quiz");

    let prompt = "";

    // ================= QUIZ =================
    if (isQuiz) {
      prompt = `
Generate at least 5 multiple choice questions on "${topic.replace("quiz","")}".

Return ONLY valid JSON:

[
  {
    "question": "Question",
    "options": ["A","B","C","D"],
    "answer": 0,
    "explanation": "Why this is correct"
  }
]

Rules:
- Minimum 5 questions
- Exactly 4 options
- Correct answer index (0-3)
- Include explanation
- No extra text
`;
    }

    // ================= STUDY / CHAT =================
    else {
      prompt = `
You are an expert AI tutor + assistant.

User asked: "${topic}"

STEP 1:
Detect if it is STUDY or CASUAL.

--------------------------------------

IF STUDY TOPIC:
Give FULL detailed explanation:

## 📚 Topic Overview
Explain clearly in 5-6 lines (easy + detailed)

## 🧩 Detailed Explanation
Explain concept deeply step-by-step

## 📌 Key Points
- Important point 1
- Important point 2
- Important point 3
- Important point 4
- Important point 5

## 💡 Example
Give real-life or coding example

## 🧠 Extra Insight
Give smart trick / deeper understanding

## 🎯 Summary
Short final revision

--------------------------------------

IF CASUAL:
Reply normally like ChatGPT (friendly + helpful)

--------------------------------------

IMPORTANT:
- Make answer DESCRIPTIVE
- Do NOT give short answers
- Make it useful for learning
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
