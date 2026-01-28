import fetch from "node-fetch";

export async function askLLM(systemPrompt, userPrompt) {
  const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6
    })
  });

  const data = await r.json();
  return data?.choices?.[0]?.message?.content || "子曰：此问尚需细思。";
}
