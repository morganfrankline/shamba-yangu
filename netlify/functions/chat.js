exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const { messages, systemPrompt } = JSON.parse(event.body);
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role === "model" ? "assistant" : m.role, content: m.parts[0].text }))
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": "https://nimble-pasca-3791d9.netlify.app",
        "X-Title": "Shamba Yangu Farm Assistant"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: formattedMessages,
        max_tokens: 800
      })
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || data.error?.message || "No response";
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ reply })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ reply: "Connection error: " + e.message }) };
  }
};
