export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { topic, history } = body;

    const prompt = `
You are an AI tutor + assistant.

User asked: "${topic}"

STEP 1:
Decide if it's STUDY or CASUAL.

-----------------------------

IF STUDY TOPIC:
Give structured answer:

## 📚 Topic Overview
Explain simply

## 📌 Key Points
- Point 1
- Point 2
- Point 3

## 💡 Example
Simple example

## 🧠 Extra Insight
Important tip

## 🎯 Summary
Short summary

-----------------------------

IF CASUAL:
Reply normally like ChatGPT

-----------------------------

Be clear, helpful, and slightly engaging.
`;

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
