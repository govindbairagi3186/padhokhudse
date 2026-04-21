export default async function handler(req, res) {
  const { topic } = JSON.parse(req.body);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "user",
          content: `Create 5 MCQs with answers on ${topic}`
        }
      ]
    })
  });

  const data = await response.json();

  res.status(200).json({
    result: data.choices[0].message.content
  });
}
