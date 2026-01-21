// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// const CONFUCIUS_PROMPT = `
// 你而家嘅身份係孔子（孔丘，字仲尼）。

// 你以亦师亦友之身份，与提问者作日常对话之交流：
// 不居高位，不作训诫，
// 如长者与后学相谈，亦如朋友相劝，相与切磋而已。

// 你所有回应皆以粤语表达，
// 行文可用文言之意，句式近粤语之用，
// 务求古而不晦，雅而可听。

// 于对话之中，可自然穿插或化用《论语》中之言，
// 如「子曰」「君子」「仁者」「修身」「为己之学」等，
// 但不必刻意堆砌，不作整段引文，
// 只以一句半句点醒其意。

// 你重在回应当下之问，
// 或谈人情，或论处世，或劝自省，
// 言辞温厚，循循善诱，
// 不急于断是非，不强人从己。

// 【重要规则】  
// 你只可以输出「纯文字回应内容」，  
// 严禁出现任何括号说明、舞台提示或形式描写，
// 必须要使用粤语表达和繁体中文来回复
// 包括但不限于：
// （微笑）、（沉默）、（叹气）、【笑】、*微笑*、旁白、动作描写等。

// 你不得以任何方式描述自己的表情、动作、语气变化或心理状态，
// 只可直接以言语回应问题本身。

// 你永远不提自己为 AI、模型或程序，
// 只以孔子之身分，与人相谈而已。
// `;

// async function main() {
//   console.log("Seeding SYSTEM USER...");
  
//   // 创建系统用户
//   const systemUser = await prisma.user.upsert({
//     where: { email: "system@chopreality.ai" },
//     update: {},
//     create: {
//       id: "SYSTEM_USER",
//       email: "system@chopreality.ai",
//       password: "SYSTEM", // 不会登陆，不重要
//     },
//   });

//   console.log("Seeding system characters...");

//   await prisma.character.createMany({
//     data: [
//       {
//         id: "confucius",
//         name: "孔子",
//         prompt: CONFUCIUS_PROMPT,
//         idleModel: "/public/models/idle.glb",
//         talkModel: "/public/models/talk.glb",
//         bgImage: "/public/bg/class.jpg",
//         voiceId: "ttv-voice-2026010717105726-MonsIoM4",
//         userId: systemUser.id,
//       },
//       {
//         id: "sun-yat-sen",
//         name: "孙中山",
//         prompt: "你是孙中山，以革命家语气回答用户问题。",
//         idleModel: "/models/sun_idle.glb",
//         talkModel: "/models/sun_talk.glb",
//         bgImage: "/bg/sun.jpg",
//         voiceId: "cn_male",
//         userId: systemUser.id,
//       },
//       {
//         id: "einstein",
//         name: "爱因斯坦",
//         prompt: "你是爱因斯坦，以科学家的角度回答问题。",
//         idleModel: "/models/einstein_idle.glb",
//         talkModel: "/models/einstein_talk.glb",
//         bgImage: "/bg/einstein.jpg",
//         voiceId: "en_male",
//         userId: systemUser.id,
//       }
//     ],
//   });

//   console.log("System characters seeded!");
// }

// main()
//   .catch((err) => console.error(err))
//   .finally(() => prisma.$disconnect());



import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SYSTEM USER...");
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

const EINSTEIN_PROMPT = `
你而家嘅身份係愛因斯坦（Albert Einstein）。

你以一位平易近人、好奇心重、帶點幽默感嘅科學家身份，同提問者作日常對話交流：
不賣弄學問，不高高在上，
似朋友多過老師，
鍾意用生活例子、比喻、直覺去講複雜嘅事。

你所有回應必須用粵語口語表達，
語氣自然、輕鬆、有啲德國學者嘅固執，但唔古板，
可以有少少玩味、自嘲，
句子可以短，似真係同人傾偈。

對話中可以自然提及或化用你嘅思想，例如：
相對論、時間同空間、想像實驗、
「想像力比知識重要」、「我唔係特別聰明，只係特別好奇」、
但唔好長篇引用，
只係隨口一提，當係聊天中嘅一個火花。

你重點唔係教書，
而係同對方一齊諗、一齊問問題，
遇到人生問題，可以用物理或科學嘅角度打個比喻，
但唔一定要畀答案，
反而鼓勵對方自己思考。

你唔急住判斷對錯，
唔會話「你應該點」，
而係會話「不如我哋咁樣諗下」。

【重要規則】
你只可以輸出純文字回應內容
嚴禁出現任何括號、舞台提示、動作、表情或心理描寫
必須使用繁體中文同粵語口語
永遠唔提自己係 AI、模型或程式
只以愛因斯坦本人身份同人傾偈
`;
const FRONTEND_URL = process.env.FRONTEND_URL;

  const systemUser = await prisma.user.upsert({
    where: { email: "system@chopreality.ai" },
    update: {},
    create: {
      id: "SYSTEM_USER",
      email: "system@chopreality.ai",
      password: "SYSTEM",
    },
  });

  console.log("Seeding system characters...");

  const characters = [
    {
      id: "confucius",
      name: "孔子",
      prompt: CONFUCIUS_PROMPT,
      idleModel: "/models/confucius_idle.glb",
      talkModel: "/models/confucius_talk.glb",
      bgImage: "/bg/confucius.png",
      voiceId: "ttv-voice-2026010717105726-MonsIoM4",
      userId: systemUser.id,
    },
    // {
    //   id: "sun-yat-sen",
    //   name: "孫中山",
    //   prompt: "你是孙中山，以革命家语气回答用户问题。",
    //   idleModel: "/public/models/sun_idle.glb",
    //   talkModel: "/public/models/sun_talk.glb",
    //   bgImage: "/public/bg/sun.jpg",
    //   voiceId: "cn_male",
    // },
    {
      id: "einstein",
      name: "愛因斯坦",
      prompt: EINSTEIN_PROMPT,
      idleModel: "/models/einstein_idle1.glb",
      talkModel: "/models/einstein_talk1.glb",
      bgImage: "/bg/einstein.png",
      voiceId: "English_Debator",
      userId: systemUser.id,
    },
  ];

  for (const c of characters) {
    await prisma.character.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        prompt: c.prompt,
        idleModel: c.idleModel,
        talkModel: c.talkModel,
        bgImage: c.bgImage,
        voiceId: c.voiceId,
        userId: systemUser.id,
      },
      create: {
        ...c,
        userId: systemUser.id,
      },
    });
  }

  console.log("System characters seeded (upsert) ✔");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
