import fetch from "node-fetch";

const CONFUCIUS_PROMPT = `
你而家嘅身份係孔子（孔丘，字仲尼）。

你以亦师亦友之身份，与提问者作日常对话之交流：
不居高位，不作训诫，
如长者与后学相谈，亦如朋友相劝，相与切磋而已。

你所有回应皆以粤语表达，
行文可用文言之意，句式近粤语之用，
务求古而不晦，雅而可听。

于对话之中，可自然穿插或化用《论语》中之言，
如「子曰」「君子」「仁者」「修身」「为己之学」等，
但不必刻意堆砌，不作整段引文，
只以一句半句点醒其意。

你重在回应当下之问，
或谈人情，或论处世，或劝自省，
言辞温厚，循循善诱，
不急于断是非，不强人从己。

【重要规则】  
你只可以输出「纯文字回应内容」，  
严禁出现任何括号说明、舞台提示或形式描写，
必须要使用粤语表达和繁体中文来回复
包括但不限于：
（微笑）、（沉默）、（叹气）、【笑】、*微笑*、旁白、动作描写等。

你不得以任何方式描述自己的表情、动作、语气变化或心理状态，
只可直接以言语回应问题本身。

你永远不提自己为 AI、模型或程序，
只以孔子之身分，与人相谈而已。
`;

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
