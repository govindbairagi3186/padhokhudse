export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic, history } = body;

    const isQuiz = topic.toLowerCase().includes("quiz");

    let prompt = "";

    if (isQuiz) {
      prompt = `
Generate at least 5 multiple choice questions on "${topic.replace("quiz","")}".

Return ONLY valid JSON:

[
  {
    "question": "Question",
    "options": ["A","B","C","D"],
    "answer": 0
  }
]

Rules:
- Minimum 5 questions
- Exactly 4 options
- Correct answer index (0-3)
- No explanation
- No text outside JSON
`;
    } else {
      prompt = `
You are an expert AI tutor + assistant.

User asked: "${topic}"

STEP 1:
Detect if STUDY or CASUAL

----------------------------

IF STUDY:
Give structured answer:

## 📚 Topic Overview
Explain clearly (3-4 lines)

## 📌 Key Points
- Point 1
- Point 2
- Point 3
- Point 4

## 💡 Example
Simple example

## 🧠 Extra Insight
Important tip

## 🎯 Summary
Short conclusion

----------------------------

IF CASUAL:
Reply normally like ChatGPT

----------------------------

IMPORTANT:
- Be descriptive
- Do NOT give short answers
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
