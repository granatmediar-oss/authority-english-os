import { NextResponse } from "next/server";

type RouteRequest = {
  interfaceLanguage?: "ru" | "en";
  targetLanguage?: string;
  goal?: string;
  level?: string;
  mainFear?: string;
  timeFrame?: string;
};

const goalLabels: Record<string, string> = {
  "new-country": "new country survival: rent, bank, doctor, documents, school, neighbours, first conversations",
  job: "work and interview: interviews, calls, emails, clients, confident self-introduction",
  "parent-child": "parent and child: child progress, school, parent support, learning without chaos",
  conversation: "real conversation confidence: user knows words but freezes in live conversation",
  authority: "professional authority: negotiations, clients, pricing, objections, public speaking",
};

const languageLabels: Record<string, string> = {
  en: "English",
  es: "Spanish",
  it: "Italian",
  de: "German",
  zh: "Chinese",
  ko: "Korean",
  ru: "Russian",
};

function fallbackRoute(body: RouteRequest) {
  const target = languageLabels[body.targetLanguage || "en"] || "English";
  const goal = goalLabels[body.goal || "new-country"] || goalLabels["new-country"];
  const level = body.level || "zero";
  const days = Array.from({ length: 30 }).map((_, index) => {
    const day = index + 1;
    const focusRu = day <= 7 ? "безопасные первые реакции" : day <= 14 ? "ключевые ситуации" : day <= 21 ? "диалог и небольшие сложности" : "уверенность и самостоятельный ответ";
    const focus = day <= 7 ? "safety and first reactions" : day <= 14 ? "core situation practice" : day <= 21 ? "dialogue and small complications" : "confidence and independent response";
    return {
      day,
      focus: `Day ${day}: ${focus}`,
      focusRu: `День ${day}: ${focusRu}`,
      scenarioTitle: day === 1 ? "Ask someone to repeat slowly" : `Practice a real ${target} situation`,
      scenarioTitleRu: day === 1 ? "Попросить повторить медленнее" : `Отработать реальную ситуацию на языке: ${target}`,
      situation: day === 1 ? "The person speaks too fast and you need to stay calm." : `You need to handle a ${goal} situation in ${target}.`,
      situationRu: day === 1 ? "Собеседник говорит слишком быстро, и нужно спокойно удержать разговор." : `Нужно справиться с ситуацией по цели: ${goal}.`,
      beginnerPhrase: day === 1 ? "Sorry, I don’t understand. Can you repeat, please?" : "I need a moment, please.",
      beginnerTranslationRu: day === 1 ? "Извините, я не понимаю. Можете повторить, пожалуйста?" : "Мне нужна минута, пожалуйста.",
      pronunciationRu: day === 1 ? "Сори, ай доунт андэрстэнд. Кэн ю рипит, плиз?" : "Ай ниид э моумэнт, плиз.",
      strongerPhrase: day === 1 ? "Sorry, I don’t understand yet. Could you speak a little more slowly, please?" : "Give me a moment, please. I understand the situation, but I need a second to answer clearly.",
      strongerTranslationRu: day === 1 ? "Извините, я пока не понимаю. Можете говорить немного медленнее, пожалуйста?" : "Дайте мне минуту, пожалуйста. Я понимаю ситуацию, но мне нужна секунда, чтобы ответить ясно.",
      emergencyPhrases: ["Can you repeat, please?", "Can you speak slowly, please?", "Can you write it down?"],
      dailyPhrases: ["I need a moment, please.", "Can you repeat, please?", "I understand."],
      dialogue: [
        { role: "other", text: "Can I help you?", translationRu: "Чем я могу помочь?" },
        { role: "user", text: "I need a moment, please.", translationRu: "Мне нужна минута, пожалуйста." },
      ],
      successCriteria: level === "zero" ? "Say one clear phrase without panic." : "Answer clearly and add one detail.",
      successCriteriaRu: level === "zero" ? "Сказать одну понятную фразу без паники." : "Ответить понятно и добавить одну деталь.",
    };
  });
  return {
    routeTitle: `${target} route for your goal`,
    routeTitleRu: `Маршрут: ${target} под выбранную цель`,
    summary: "A 30-day route built around real situations, not random grammar lessons.",
    summaryRu: "30-дневный маршрут вокруг реальных ситуаций, а не случайных грамматических тем.",
    days,
  };
}

const routeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    routeTitle: { type: "string" },
    routeTitleRu: { type: "string" },
    summary: { type: "string" },
    summaryRu: { type: "string" },
    days: {
      type: "array",
      minItems: 30,
      maxItems: 30,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          day: { type: "number" },
          focus: { type: "string" },
          focusRu: { type: "string" },
          scenarioTitle: { type: "string" },
          scenarioTitleRu: { type: "string" },
          situation: { type: "string" },
          situationRu: { type: "string" },
          beginnerPhrase: { type: "string" },
          beginnerTranslationRu: { type: "string" },
          pronunciationRu: { type: "string" },
          strongerPhrase: { type: "string" },
          strongerTranslationRu: { type: "string" },
          emergencyPhrases: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
          dailyPhrases: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          dialogue: {
            type: "array",
            minItems: 2,
            maxItems: 6,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                role: { type: "string", enum: ["user", "other"] },
                text: { type: "string" },
                translationRu: { type: "string" },
              },
              required: ["role", "text", "translationRu"],
            },
          },
          successCriteria: { type: "string" },
          successCriteriaRu: { type: "string" },
        },
        required: ["day", "focus", "focusRu", "scenarioTitle", "scenarioTitleRu", "situation", "situationRu", "beginnerPhrase", "beginnerTranslationRu", "pronunciationRu", "strongerPhrase", "strongerTranslationRu", "emergencyPhrases", "dailyPhrases", "dialogue", "successCriteria", "successCriteriaRu"],
      },
    },
  },
  required: ["routeTitle", "routeTitleRu", "summary", "summaryRu", "days"],
};

export async function POST(request: Request) {
  const body = (await request.json()) as RouteRequest;
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ source: "fallback", route: fallbackRoute(body) });
  const target = languageLabels[body.targetLanguage || "en"] || "English";
  const goal = goalLabels[body.goal || "new-country"] || goalLabels["new-country"];
  const level = body.level || "zero";
  const prompt = `Create a practical 30-day language learning route. Target language: ${target}. Goal: ${goal}. Starting level: ${level}. User's main fear or blocker: ${body.mainFear || "freezes in live conversation"}. Timeframe: ${body.timeFrame || "30 days"}. Rules: build around real-life tasks, not grammar chapters. Each day must contain exactly one scenario, three daily phrases, emergency phrases, a short dialogue, translations into Russian, and a Russian pronunciation helper. For zero/A1 level, keep phrases short and psychologically safe. Do not promise fluency. Focus on functional confidence and clear next actions.`;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        input: [
          { role: "system", content: "You are an expert language teacher, migration-support curriculum designer, and product learning architect. Return only valid structured JSON." },
          { role: "user", content: prompt },
        ],
        text: { format: { type: "json_schema", name: "language_goal_route", schema: routeSchema, strict: true } },
      }),
    });
    if (!response.ok) return NextResponse.json({ source: "fallback", warning: await response.text(), route: fallbackRoute(body) });
    const data = await response.json();
    const rawText = data.output_text || data.output?.[0]?.content?.[0]?.text || "";
    const route = JSON.parse(rawText);
    return NextResponse.json({ source: "openai", route });
  } catch (error: any) {
    return NextResponse.json({ source: "fallback", warning: error?.message || "Generation failed", route: fallbackRoute(body) });
  }
}
