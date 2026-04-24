export default async function handler(req, res) {
  const { topic, mode } = req.body;

  const prompt = topic.includes("quiz")
    ? `Create 5 MCQs on ${topic}. Return JSON only.`
    : `Explain "${topic}" clearly.

Auto-detect if topic is coding/math/theory.

Mode: ${mode}

Use:
## Overview
## Key Points
## Example
## Summary

Make it engaging.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:"POST",
    headers:{
      "Authorization":"Bearer "+process.env.OPENROUTER_API_KEY,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:"meta-llama/llama-3-8b-instruct",
      messages:[{role:"user",content:prompt}]
    })
  });

  const data=await response.json();

  res.status(200).json({
    result:data.choices?.[0]?.message?.content || "Error"
  });
}
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
