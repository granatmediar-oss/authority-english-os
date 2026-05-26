import { NextResponse } from "next/server";

type AnalyzeRequest = {
  interfaceLanguage?: "ru" | "en";
  targetLanguage?: string;
  goal?: string;
  level?: string;
  transcript?: string;
  scenario?: {
    titleEn?: string;
    titleRu?: string;
    situationEn?: string;
    situationRu?: string;
    beginner?: string;
    beginnerRu?: string;
    stronger?: string;
    strongerRu?: string;
    keywords?: string[];
    principleEn?: string;
    principleRu?: string;
  };
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

const goalLabels: Record<string, string> = {
  "new-country": "new country survival",
  job: "work and interview",
  "parent-child": "parent and child",
  conversation: "real conversation confidence",
  authority: "professional calls and meetings as a Product Architect",
};

const feedbackSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    totalScore: { type: "number" },
    vocabularyScore: { type: "number" },
    positionScore: { type: "number" },
    clarityScore: { type: "number" },
    meaningScore: { type: "number" },
    correctedAnswer: { type: "string" },
    strongerVersion: { type: "string" },
    feedbackRu: { type: "string" },
    feedbackEn: { type: "string" },
    nextActionRu: { type: "string" },
    nextActionEn: { type: "string" },
    keyPhrasesToRepeat: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } },
  },
  required: [
    "totalScore",
    "vocabularyScore",
    "positionScore",
    "clarityScore",
    "meaningScore",
    "correctedAnswer",
    "strongerVersion",
    "feedbackRu",
    "feedbackEn",
    "nextActionRu",
    "nextActionEn",
    "keyPhrasesToRepeat",
  ],
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function fallbackAnalyze(body: AnalyzeRequest) {
  const transcript = (body.transcript || "").trim();
  const scenario = body.scenario || {};
  const clean = transcript.toLowerCase();
  const keywords = scenario.keywords || [];
  const matched = keywords.filter((word) => clean.includes(String(word).toLowerCase())).length;
  const vocabularyScore = clamp((matched / Math.max(1, keywords.length)) * 100);
  const clarityScore = clamp(Math.max(20, transcript.length / (body.level === "zero" ? 1.5 : 2.3)));
  const meaningSignals = ["need", "understand", "please", "repeat", "appointment", "help", "product", "risk", "architecture", "work"];
  const meaningScore = clamp(meaningSignals.filter((word) => clean.includes(word)).length * 14 + 20);
  const positionSignals = ["need", "clarify", "understand", "risk", "architecture", "decision", "scope", "data", "first"];
  const positionScore = clamp(positionSignals.filter((word) => clean.includes(word)).length * 13 + 20);
  const totalScore = clamp((vocabularyScore + clarityScore + meaningScore + positionScore) / 4);
  const stronger = scenario.stronger || scenario.beginner || transcript;
  return {
    totalScore,
    vocabularyScore,
    positionScore,
    clarityScore,
    meaningScore,
    correctedAnswer: transcript || scenario.beginner || "",
    strongerVersion: stronger,
    feedbackRu:
      totalScore < 35
        ? "Начните с минимального ответа. Сейчас важно сказать одну понятную фразу без паники, а не построить идеальное предложение."
        : vocabularyScore < 45
          ? "Смысл уже есть. Добавьте 1–2 ключевых слова из сценария, чтобы ответ стал точнее."
          : "Хорошая попытка. Теперь повторите сильную версию и запишите ответ ещё раз без подсказки.",
    feedbackEn:
      totalScore < 35
        ? "Start with the beginner answer. Your goal now is one clear phrase, not a perfect sentence."
        : vocabularyScore < 45
          ? "The meaning is there. Add 1–2 key words from the scenario to make the answer stronger."
          : "Good attempt. Repeat the stronger version and record once again without looking.",
    nextActionRu: "Повторите stronger version 3 раза вслух. Потом очистите поле и запишите ответ снова без подсказки.",
    nextActionEn: "Repeat the stronger version aloud 3 times. Then clear the field and record again without looking.",
    keyPhrasesToRepeat: [scenario.beginner, stronger].filter(Boolean).slice(0, 3) as string[],
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as AnalyzeRequest;
  const fallback = fallbackAnalyze(body);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ source: "fallback", ...fallback });
  }

  const targetLanguage = languageLabels[body.targetLanguage || "en"] || "English";
  const goal = goalLabels[body.goal || "conversation"] || "real conversation confidence";
  const level = body.level || "zero";
  const scenario = body.scenario || {};

  const prompt = `Analyze this language-learning speaking attempt.
Target language: ${targetLanguage}.
User goal: ${goal}.
Level: ${level}.
Scenario: ${scenario.titleEn || scenario.titleRu || "scenario"}.
Situation: ${scenario.situationEn || scenario.situationRu || ""}.
Expected beginner answer: ${scenario.beginner || ""}.
Stronger model answer: ${scenario.stronger || ""}.
User transcript: ${body.transcript || ""}.

Evaluate functionally, not academically. For zero/A1 learners, reward clear meaning. Do not over-correct. Give scores 0-100 for total, vocabulary, position/confidence, clarity, and meaning. Return a corrected answer, a stronger version, feedback in Russian and English, one concrete next action, and key phrases to repeat. For Product Architect/authority goals, positionScore must reflect whether the answer sounds strategic rather than executor-like.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        input: [
          { role: "system", content: "You are an expert language teacher, communication coach, and product learning architect. Return only valid structured JSON." },
          { role: "user", content: prompt },
        ],
        text: { format: { type: "json_schema", name: "speaking_attempt_feedback", schema: feedbackSchema, strict: true } },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ source: "fallback", warning: await response.text(), ...fallback });
    }

    const data = await response.json();
    const rawText = data.output_text || data.output?.[0]?.content?.[0]?.text || "";
    const parsed = JSON.parse(rawText);
    return NextResponse.json({ source: "openai", ...parsed });
  } catch (error: any) {
    return NextResponse.json({ source: "fallback", warning: error?.message || "AI feedback failed", ...fallback });
  }
}
