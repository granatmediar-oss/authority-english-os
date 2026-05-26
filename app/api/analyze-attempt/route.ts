import { NextResponse } from "next/server";

type AnalyzeRequest = {
  interfaceLanguage?: "ru" | "en";
  targetLanguage?: string;
  goal?: string;
  level?: string;
  metricLabels?: string[];
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

function normalizeAnswer(text: string) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[.,!?;:()\[\]{}"“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function phraseSimilarity(userText: string, targetText: string) {
  const user = normalizeAnswer(userText);
  const target = normalizeAnswer(targetText);
  if (!user || !target) return 0;
  if (user === target || user.includes(target) || target.includes(user)) {
    const lengthRatio = Math.min(user.length, target.length) / Math.max(user.length, target.length);
    return clamp(70 + lengthRatio * 30);
  }
  const targetWords = target.split(" ").filter(Boolean);
  if (targetWords.length <= 1) return user.includes(target) || target.includes(user) ? 100 : 0;
  const matchedWords = targetWords.filter((word) => user.includes(word)).length;
  return clamp((matchedWords / Math.max(1, targetWords.length)) * 100);
}

function fallbackAnalyze(body: AnalyzeRequest) {
  const transcript = (body.transcript || "").trim();
  const scenario = body.scenario || {};
  const goal = body.goal || "conversation";
  const level = body.level || "zero";
  const clean = normalizeAnswer(transcript);
  const keywords = scenario.keywords || [];
  const matched = keywords.filter((word) => clean.includes(normalizeAnswer(String(word)))).length;
  const keywordScore = clamp((matched / Math.max(1, keywords.length)) * 100);
  const beginnerMatch = phraseSimilarity(transcript, scenario.beginner || "");
  const strongerMatch = phraseSimilarity(transcript, scenario.stronger || "");

  const meaningScore = level === "zero" && beginnerMatch >= 65 ? Math.max(85, beginnerMatch) : Math.max(keywordScore, beginnerMatch, Math.round(strongerMatch * 0.9));
  const tokenCount = clean ? clean.split(/\s+/).length : 0;
  const minimalEnough = level === "zero" ? (beginnerMatch >= 65 || clean.length >= 2) : tokenCount >= 3;
  const clarityScore = clamp((minimalEnough ? 72 : 30) + Math.min(18, tokenCount * 3));
  const usefulPhraseScore = Math.max(beginnerMatch, keywordScore);
  const structureSignals = ["because", "before", "first", "please", "need", "can", "could", "understand", "thank", "sorry"];
  const structureScore = clamp(structureSignals.filter((word) => clean.includes(word)).length * 12 + 35);
  const authoritySignals = ["risk", "architecture", "decision", "scope", "data", "logic", "founder", "product", "estimate", "before"];
  const authorityScore = clamp(authoritySignals.filter((word) => clean.includes(word)).length * 12 + Math.max(25, keywordScore));

  let vocabularyScore = usefulPhraseScore;
  let positionScore = structureScore;
  if (goal === "authority") {
    vocabularyScore = Math.max(keywordScore, Math.round((beginnerMatch + keywordScore) / 2));
    positionScore = authorityScore;
  } else if (goal === "parent-child") {
    positionScore = Math.max(usefulPhraseScore, clean.includes("mistake") || clean.includes("practice") || clean.includes("child") ? 80 : 45);
  } else if (goal === "conversation") {
    positionScore = Math.max(clarityScore, clean.includes("moment") || clean.includes("repeat") || clean.includes("more") ? 85 : 50);
  }

  const totalScore = clamp((meaningScore + vocabularyScore + positionScore + clarityScore) / 4);
  const stronger = scenario.stronger || scenario.beginner || transcript;
  const goalSpecificRu = goal === "authority"
    ? "Оценка учитывает экспертную позицию: звучит ли ответ как стратегический, а не исполнительский."
    : "Оценка учитывает задачу сценария: удалось ли передать смысл и использовать полезную фразу.";
  const goalSpecificEn = goal === "authority"
    ? "The score includes expert position: whether the answer sounds strategic, not execution-first."
    : "The score reflects the scenario task: whether you communicated the meaning and used a useful phrase.";

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
        ? `Начните с минимального ответа. Сейчас важно сказать одну понятную фразу без паники. ${goalSpecificRu}`
        : meaningScore >= 80
          ? `Ситуация засчитана: смысл передан. Теперь повторите сильную версию и попробуйте без подсказки. ${goalSpecificRu}`
          : `Смысл уже появляется. Добавьте ключевую фразу из сценария и повторите ответ ещё раз. ${goalSpecificRu}`,
    feedbackEn:
      totalScore < 35
        ? `Start with the beginner answer. One clear phrase is enough for now. ${goalSpecificEn}`
        : meaningScore >= 80
          ? `Scenario passed: the meaning was communicated. Repeat the stronger version and try without help. ${goalSpecificEn}`
          : `The meaning is starting to appear. Add the key phrase from the scenario and repeat once more. ${goalSpecificEn}`,
    nextActionRu: "Повторите минимальный ответ 3 раза. Затем произнесите сильную версию и запишите ответ снова без подсказки.",
    nextActionEn: "Repeat the beginner answer 3 times. Then say the stronger version and record again without looking.",
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

Evaluate functionally, not academically. For zero/A1 learners, a short correct target-language phrase can be a full success. Do not punish brevity when the scenario only requires a survival phrase.

Important scoring architecture:
- If the goal is Product Architect/authority, positionScore must measure strategic expert position, not execution-first behavior.
- If the goal is new-country, do NOT score authority. Treat positionScore as "useful survival phrase".
- If the goal is conversation, treat positionScore as "natural response / ability to stay in the conversation".
- If the goal is job, treat positionScore as "structure / professional self-presentation".
- If the goal is parent-child, treat positionScore as "supportive, clear communication".
- meaningScore must measure whether the user communicated the real-life task, even with a very short phrase.

Return scores 0-100 for total, vocabulary/route-specific phrase strength, position/route-specific second metric, clarity, and meaning. Return a corrected answer, a stronger version, feedback in Russian and English, one concrete next action, and key phrases to repeat.`;

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
