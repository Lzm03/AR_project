// import fetch from "node-fetch";

// export async function askLLM(systemPrompt, userPrompt) {
//   const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       model: "deepseek-chat",
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt }
//       ],
//       temperature: 0.6
//     })
//   });

//   const data = await r.json();
//   return data?.choices?.[0]?.message?.content || "子曰：此问尚需细思。";
// }


import fetch from "node-fetch";

export async function askLLM(systemPrompt, userPrompt, onData) {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
      stream: true,
      temperature: 0.6
    })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let done = false;
  let fullText = "";

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;

    if (!value) continue;

    const chunk = decoder.decode(value);

    // 流式数据按行（SSE 格式）解析
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.replace("data: ", "").trim();
        if (data === "[DONE]") return fullText; // 流结束

        try {
          const json = JSON.parse(data);
          const token = json.choices?.[0]?.delta?.content;
          if (token) {
            fullText += token;
            onData(token); // 回调给 UI
          }
        } catch (err) {
          // JSON 解析出错就跳过
        }
      }
    }
  }

  return fullText || "子曰：此问尚需细思。";
}
