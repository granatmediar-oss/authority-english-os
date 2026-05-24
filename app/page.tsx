"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Square, Play, RefreshCw, Target, Brain, MessageSquare, Trophy, BookOpen, ShieldCheck, BarChart3, Volume2, Languages } from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

type Scenario = {
  id: number;
  type: string;
  level: string;
  title: string;
  titleRu: string;
  founderLine: string;
  founderLineRu: string;
  beginnerAnswer: string;
  beginnerAnswerRu: string;
  targetAnswer: string;
  targetAnswerRu: string;
  vocabulary: string[];
  vocabularyRu: string[];
  authorityPrinciple: string;
  authorityPrincipleRu: string;
};

type HelperLanguage = "en" | "ru";

type SavedAttempt = {
  id: number;
  scenario: string;
  answer: string;
  score: number;
  date: string;
};

const scenarios: Scenario[] = [
  {
    id: 1,
    type: "Discovery Call",
    level: "Beginner",
    title: "Founder asks for a quick estimate",
    titleRu: "Основатель сразу просит оценку стоимости",
    founderLine: "Can you just tell me how much it will cost to build the app?",
    founderLineRu: "Вы можете просто сказать, сколько будет стоить разработка приложения?",
    beginnerAnswer: "I need to understand the product first.",
    beginnerAnswerRu: "Сначала мне нужно понять продукт.",
    targetAnswer:
      "Before I estimate the build, I need to understand the product logic, user roles, data structure, and risk points. Otherwise, the estimate would look precise but be strategically unreliable.",
    targetAnswerRu:
      "Перед тем как оценивать разработку, мне нужно понять продуктовую логику, роли пользователей, структуру данных и точки риска. Иначе оценка будет выглядеть точной, но стратегически будет ненадёжной.",
    vocabulary: ["estimate", "product logic", "user roles", "data structure", "risk points"],
    vocabularyRu: ["оценка", "логика продукта", "роли пользователей", "структура данных", "точки риска"],
    authorityPrinciple: "Do not price implementation before architecture is clear.",
    authorityPrincipleRu: "Не называй стоимость реализации до того, как ясна архитектура."
  },
  {
    id: 2,
    type: "Objection Handling",
    level: "Beginner",
    title: "Client wants to skip architecture",
    titleRu: "Клиент хочет пропустить архитектуру",
    founderLine: "We already know what we need. Can we skip the architecture step?",
    founderLineRu: "Мы уже знаем, что нам нужно. Можем пропустить этап архитектуры?",
    beginnerAnswer: "I do not recommend skipping architecture.",
    beginnerAnswerRu: "Я не рекомендую пропускать архитектуру.",
    targetAnswer:
      "I do not recommend skipping architecture. The screens may look simple, but the system behind them can create hidden business debt if we define it too late.",
    targetAnswerRu:
      "Я не рекомендую пропускать архитектуру. Экраны могут выглядеть простыми, но система за ними может создать скрытый бизнес-долг, если определить её слишком поздно.",
    vocabulary: ["skip", "system", "hidden business debt", "define", "too late"],
    vocabularyRu: ["пропустить", "система", "скрытый бизнес-долг", "определить", "слишком поздно"],
    authorityPrinciple: "Reframe speed into risk management.",
    authorityPrincipleRu: "Переводи разговор о скорости в разговор об управлении риском."
  },
  {
    id: 3,
    type: "AI Product Risk",
    level: "Beginner",
    title: "Founder wants to add AI",
    titleRu: "Основатель хочет просто добавить AI",
    founderLine: "Can we just add AI to the product?",
    founderLineRu: "Можем просто добавить AI в продукт?",
    beginnerAnswer: "First, we need to understand the data and the product logic.",
    beginnerAnswerRu: "Сначала нужно понять данные и продуктовую логику.",
    targetAnswer:
      "AI should not be added before the input data, output format, user outcome, and risk boundaries are clear. Otherwise, it becomes an expensive layer on top of an unclear system.",
    targetAnswerRu:
      "AI не стоит добавлять до того, как понятны входные данные, формат результата, пользовательский outcome и границы риска. Иначе он становится дорогим слоем поверх неясной системы.",
    vocabulary: ["input data", "output format", "user outcome", "risk boundaries", "unclear system"],
    vocabularyRu: ["входные данные", "формат результата", "результат для пользователя", "границы риска", "неясная система"],
    authorityPrinciple: "AI amplifies product logic. It does not replace it.",
    authorityPrincipleRu: "AI усиливает продуктовую логику. Он не заменяет её."
  },
  {
    id: 4,
    type: "Pricing",
    level: "Beginner",
    title: "Founder compares you with a cheaper developer",
    titleRu: "Основатель сравнивает тебя с более дешёвым разработчиком",
    founderLine: "Another developer said they can build it cheaper.",
    founderLineRu: "Другой разработчик сказал, что может сделать дешевле.",
    beginnerAnswer: "My role is different. I help reduce the cost of wrong decisions.",
    beginnerAnswerRu: "Моя роль другая. Я помогаю снизить стоимость неправильных решений.",
    targetAnswer:
      "That may be possible for execution. My role is different. I help you reduce the cost of wrong decisions before development turns them into rework.",
    targetAnswerRu:
      "Для исполнения это может быть возможно. Моя роль другая. Я помогаю снизить стоимость неправильных решений до того, как разработка превратит их в переделку.",
    vocabulary: ["execution", "reduce the cost", "wrong decisions", "development", "rework"],
    vocabularyRu: ["исполнение", "снизить стоимость", "неправильные решения", "разработка", "переделка"],
    authorityPrinciple: "Separate implementation price from decision risk.",
    authorityPrincipleRu: "Разделяй цену реализации и риск продуктовых решений."
  },
  {
    id: 5,
    type: "Positioning",
    level: "Beginner",
    title: "Introduce yourself",
    titleRu: "Представь себя",
    founderLine: "What do you do?",
    founderLineRu: "Чем вы занимаетесь?",
    beginnerAnswer: "I am a Product and Decision Architect.",
    beginnerAnswerRu: "Я Product and Decision Architect.",
    targetAnswer:
      "I am a Product and Decision Architect. I help founders design product architecture before they spend money on development.",
    targetAnswerRu:
      "Я Product and Decision Architect. Я помогаю основателям спроектировать архитектуру продукта до того, как они потратят деньги на разработку.",
    vocabulary: ["Product Architect", "Decision Architect", "founders", "product architecture", "development"],
    vocabularyRu: ["архитектор продукта", "архитектор решений", "основатели", "архитектура продукта", "разработка"],
    authorityPrinciple: "Start with your role, not with tools.",
    authorityPrincipleRu: "Начинай с роли, а не с инструментов."
  },
  {
    id: 6,
    type: "Boundary",
    level: "Beginner",
    title: "Client asks you to just build screens",
    titleRu: "Клиент просит просто собрать экраны",
    founderLine: "Can you just build the screens first?",
    founderLineRu: "Можете сначала просто собрать экраны?",
    beginnerAnswer: "I do not recommend starting with screens.",
    beginnerAnswerRu: "Я не рекомендую начинать с экранов.",
    targetAnswer:
      "I do not recommend starting with screens. First, we need to define the data structure, user roles, and product logic behind the screens.",
    targetAnswerRu:
      "Я не рекомендую начинать с экранов. Сначала нужно определить структуру данных, роли пользователей и продуктовую логику за этими экранами.",
    vocabulary: ["screens", "data structure", "user roles", "product logic", "behind"],
    vocabularyRu: ["экраны", "структура данных", "роли пользователей", "продуктовая логика", "за этим"],
    authorityPrinciple: "Screens are not the product architecture.",
    authorityPrincipleRu: "Экраны — это не архитектура продукта."
  },
  {
    id: 7,
    type: "MVP Scope",
    level: "Beginner",
    title: "Founder wants too many features",
    titleRu: "Основатель хочет слишком много функций в MVP",
    founderLine: "Can we include all these features in the first version?",
    founderLineRu: "Можем включить все эти функции в первую версию?",
    beginnerAnswer: "Not all features should be in the first version.",
    beginnerAnswerRu: "Не все функции должны попасть в первую версию.",
    targetAnswer:
      "Not all features should be in the first version. The MVP should prove the core product logic before we expand the system.",
    targetAnswerRu:
      "Не все функции должны попасть в первую версию. MVP должен доказать основную продуктовую логику до того, как мы расширяем систему.",
    vocabulary: ["features", "first version", "MVP", "core product logic", "expand"],
    vocabularyRu: ["функции", "первая версия", "MVP", "основная продуктовая логика", "расширять"],
    authorityPrinciple: "Protect the MVP from becoming a bloated first build.",
    authorityPrincipleRu: "Защищай MVP от превращения в раздутую первую разработку."
  },
  {
    id: 8,
    type: "Paid Step",
    level: "Beginner",
    title: "Move the client to a paid architecture session",
    titleRu: "Переведи клиента к платной архитектурной сессии",
    founderLine: "What is the next step?",
    founderLineRu: "Какой следующий шаг?",
    beginnerAnswer: "The next step is a paid architecture session.",
    beginnerAnswerRu: "Следующий шаг — платная архитектурная сессия.",
    targetAnswer:
      "The best next step is a paid architecture session. After that, I can define the product boundaries, risks, and implementation scope.",
    targetAnswerRu:
      "Лучший следующий шаг — платная архитектурная сессия. После этого я смогу определить границы продукта, риски и объём реализации.",
    vocabulary: ["next step", "paid architecture session", "product boundaries", "risks", "implementation scope"],
    vocabularyRu: ["следующий шаг", "платная архитектурная сессия", "границы продукта", "риски", "объём реализации"],
    authorityPrinciple: "Do not give free architecture inside unpaid conversation.",
    authorityPrincipleRu: "Не отдавай архитектуру бесплатно внутри неоплаченного разговора."
  },
  {
    id: 9,
    type: "Conference Practice",
    level: "Intermediate",
    title: "Explain your core thesis",
    titleRu: "Объясни свой главный тезис",
    founderLine: "Why do no-code products fail before they scale?",
    founderLineRu: "Почему no-code продукты ломаются до масштабирования?",
    beginnerAnswer: "Because the problem is often not the tool. It is the decision structure.",
    beginnerAnswerRu: "Потому что проблема часто не в инструменте. Она в структуре решений.",
    targetAnswer:
      "No-code makes development faster, but it does not remove the cost of weak decisions. Many products fail not because of the tool, but because the data structure, user roles, and product boundaries were unclear from the beginning.",
    targetAnswerRu:
      "No-code ускоряет разработку, но не убирает стоимость слабых решений. Многие продукты ломаются не из-за инструмента, а потому что структура данных, роли пользователей и границы продукта были неясны с самого начала.",
    vocabulary: ["no-code", "weak decisions", "data structure", "user roles", "product boundaries"],
    vocabularyRu: ["no-code", "слабые решения", "структура данных", "роли пользователей", "границы продукта"],
    authorityPrinciple: "Turn a technical topic into a strategic market insight.",
    authorityPrincipleRu: "Превращай техническую тему в стратегический рыночный инсайт."
  }
]

const phraseBank = [
  { domain: "Positioning", phrase: "I am a Product and Decision Architect.", meaning: "Я Product and Decision Architect." },
  { domain: "Positioning", phrase: "I help founders design product architecture before they spend money on development.", meaning: "Я помогаю основателям спроектировать архитектуру продукта до затрат на разработку." },
  { domain: "Boundary", phrase: "This is not a build question yet. This is a product architecture question.", meaning: "Это ещё не вопрос разработки. Это вопрос архитектуры продукта." },
  { domain: "Boundary", phrase: "I do not recommend starting with implementation.", meaning: "Я не рекомендую начинать с реализации." },
  { domain: "Discovery", phrase: "First, I need to understand the product logic, user roles, and data structure.", meaning: "Сначала мне нужно понять продуктовую логику, роли пользователей и структуру данных." },
  { domain: "Pricing", phrase: "Without architecture, any estimate would be unreliable.", meaning: "Без архитектуры любая оценка будет ненадёжной." },
  { domain: "Paid Step", phrase: "The best next step is a paid architecture session.", meaning: "Лучший следующий шаг — платная архитектурная сессия." },
  { domain: "Risk", phrase: "A cheap build can become expensive rework.", meaning: "Дешёвая разработка может превратиться в дорогую переделку." },
  { domain: "AI", phrase: "AI does not fix unclear product logic. It amplifies it.", meaning: "AI не исправляет неясную продуктовую логику. Он её усиливает." },
  { domain: "Conference", phrase: "Architecture before development. Decisions before scale.", meaning: "Архитектура до разработки. Решения до масштабирования." }
];

const starterPlan = [
  { day: "Day 1", focus: "Introduce yourself", focusRu: "Представь себя", task: "Repeat your positioning phrase 10 times aloud.", taskRu: "Повтори позиционирующую фразу вслух 10 раз.", phrase: "I am a Product and Decision Architect.", phraseRu: "Я Product and Decision Architect." },
  { day: "Day 2", focus: "Explain your work", focusRu: "Объясни свою работу", task: "Say what you do in one clear sentence.", taskRu: "Скажи, чем ты занимаешься, одним ясным предложением.", phrase: "I help founders design product architecture before they spend money on development.", phraseRu: "Я помогаю основателям спроектировать архитектуру продукта до затрат на разработку." },
  { day: "Day 3", focus: "Protect the boundary", focusRu: "Защити границу роли", task: "Practice saying no to implementation-first conversations.", taskRu: "Отработай отказ от разговора, который сразу уводит в реализацию.", phrase: "This is not a build question yet. This is a product architecture question.", phraseRu: "Это ещё не вопрос разработки. Это вопрос архитектуры продукта." },
  { day: "Day 4", focus: "Discovery call basics", focusRu: "База discovery call", task: "Ask five simple founder questions aloud.", taskRu: "Произнеси вслух пять простых вопросов founder’у.", phrase: "What are you building? Who is it for? What already exists? What is the core workflow? What is the biggest risk?", phraseRu: "Что вы строите? Для кого это? Что уже есть? Какой основной workflow? Какой самый большой риск?" },
  { day: "Day 5", focus: "Pricing boundary", focusRu: "Граница цены", task: "Practice refusing a premature estimate.", taskRu: "Отработай отказ от преждевременной оценки стоимости.", phrase: "Without architecture, any estimate would be unreliable.", phraseRu: "Без архитектуры любая оценка будет ненадёжной." },
  { day: "Day 6", focus: "Paid next step", focusRu: "Платный следующий шаг", task: "Move the conversation into a paid session.", taskRu: "Переведи разговор к платной сессии.", phrase: "The best next step is a paid architecture session.", phraseRu: "Лучший следующий шаг — платная архитектурная сессия." },
  { day: "Day 7", focus: "Weekly review", focusRu: "Недельный обзор", task: "Record a 60-second explanation of your work.", taskRu: "Запиши 60-секундное объяснение своей работы.", phrase: "Architecture before development. Decisions before scale.", phraseRu: "Архитектура до разработки. Решения до масштабирования." }
]

function scoreAttempt(text: string, target: string) {
  const clean = text.toLowerCase();
  const targetWords = target.toLowerCase().split(/\W+/).filter(Boolean);
  const matched = targetWords.filter((word) => clean.includes(word));
  const vocabularyScore = Math.min(100, Math.round((matched.length / targetWords.length) * 140));
  const authoritySignals = ["risk", "architecture", "decision", "data", "structure", "logic", "rework", "system", "boundaries"];
  const authorityScore = Math.min(100, authoritySignals.filter((word) => clean.includes(word)).length * 14 + 20);
  const clarityScore = Math.min(100, Math.max(25, Math.round(text.trim().length / 2.8)));
  return {
    vocabularyScore,
    authorityScore,
    clarityScore,
    total: Math.round((vocabularyScore + authorityScore + clarityScore) / 3)
  };
}
function getScoreMeaning(label: string, lang: HelperLanguage) {
  if (lang === "en") {
    if (label === "Vocabulary") return "How many useful professional words appeared in your answer.";
    if (label === "Authority") return "Whether your answer sounds like a Product Architect, not an executor.";
    if (label === "Clarity") return "Whether your answer is clear enough to use in a real call.";
    return "Overall training score for this attempt.";
  }
  if (label === "Vocabulary") return "Сколько полезных профессиональных слов появилось в твоём ответе.";
  if (label === "Authority") return "Звучишь ли ты как Product Architect, а не как исполнитель.";
  if (label === "Clarity") return "Насколько понятно это можно сказать на реальном звонке.";
  return "Общая оценка этой попытки.";
}

function getFeedbackCopy(score: number, lang: HelperLanguage) {
  if (lang === "en") {
    if (score < 45) return "Start smaller. Use the beginner answer first, then add one architecture word: product, data, risk, logic, or scope.";
    if (score < 70) return "Good direction. Now make the answer more strategic: name the risk and move the conversation toward architecture.";
    return "Strong attempt. Your next step is to say the same idea more naturally and without reading.";
  }
  if (score < 45) return "Начни проще. Сначала произнеси beginner answer, потом добавь одно архитектурное слово: product, data, risk, logic или scope.";
  if (score < 70) return "Направление хорошее. Теперь сделай ответ более стратегическим: назови риск и переведи разговор к архитектуре.";
  return "Сильная попытка. Следующий шаг — сказать ту же мысль естественнее и без чтения.";
}

function getNextAction(score: number, lang: HelperLanguage) {
  if (lang === "en") {
    if (score < 45) return "Repeat the beginner answer 5 times, then record again.";
    if (score < 70) return "Repeat the stronger version 3 times and record again without looking.";
    return "Move to the next scenario or turn this answer into a 60-second explanation.";
  }
  if (score < 45) return "Повтори beginner answer 5 раз, затем запиши ответ снова.";
  if (score < 70) return "Повтори stronger version 3 раза и запиши снова без подсказки.";
  return "Переходи к следующему сценарию или преврати этот ответ в объяснение на 60 секунд.";
}


export default function AuthorityEnglishOS() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [attempt, setAttempt] = useState("");
  const [savedAttempts, setSavedAttempts] = useState<SavedAttempt[]>([]);
  const [search, setSearch] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [recordingStatus, setRecordingStatus] = useState("Ready to record");
  const [manualMode, setManualMode] = useState(false);
  const [helperLanguage, setHelperLanguage] = useState<HelperLanguage>("ru");

  const recognitionRef = React.useRef<any>(null);
  const currentScore = useMemo(() => scoreAttempt(attempt, activeScenario.targetAnswer), [attempt, activeScenario]);

  const filteredPhrases = phraseBank.filter((item) =>
    `${item.domain} ${item.phrase} ${item.meaning}`.toLowerCase().includes(search.toLowerCase())
  );

  const saveAttempt = () => {
    if (!attempt.trim()) return;
    setSavedAttempts([{ id: Date.now(), scenario: activeScenario.title, answer: attempt, score: currentScore.total, date: new Date().toLocaleDateString() }, ...savedAttempts]);
    setShowFeedback(true);
  };

  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setManualMode(true);
      setRecordingStatus("Voice recognition is not supported here. Use Chrome on HTTPS, or type your answer manually for now.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingStatus("Recording... Speak in English now.");
    };
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setAttempt(transcript);
    };
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      setManualMode(true);
      const errorType = event?.error ? ` Error: ${event.error}.` : "";
      setRecordingStatus(`Recording did not start correctly.${errorType} Use manual mode or check microphone permissions.`);
    };
    recognition.onend = () => {
      setIsRecording(false);
      setRecordingStatus("Recording stopped. Analyze your answer or record again.");
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setRecordingStatus("Recording stopped. Analyze your answer or record again.");
  };

  const speakStrongerVersion = () => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(activeScenario.targetAnswer);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const nextScenario = () => {
    const currentIndex = scenarios.findIndex((item) => item.id === activeScenario.id);
    const next = scenarios[(currentIndex + 1) % scenarios.length];
    setActiveScenario(next);
    setAttempt("");
    setShowFeedback(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Badge className="mb-4 bg-orange-500 text-white">Product Architecture Authority</Badge>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Authority English OS</h1>
            <p className="mt-4 max-w-2xl text-lg text-neutral-300">A focused English training system for founder calls, product architecture explanations, AI risk conversations, and conference-level speaking.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-2">
              <Languages className="h-4 w-4 text-orange-400" />
              <span className="px-2 text-sm text-neutral-400">Feedback language</span>
              <Button size="sm" variant={helperLanguage === "en" ? "default" : "outline"} onClick={() => setHelperLanguage("en")}>EN</Button>
              <Button size="sm" variant={helperLanguage === "ru" ? "default" : "outline"} onClick={() => setHelperLanguage("ru")}>RU / РФ</Button>
            </div>
          </div>
          <Card className="border-neutral-800 bg-neutral-900 text-neutral-50 shadow-2xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3"><Target className="h-5 w-5 text-orange-400" /><h2 className="text-xl font-semibold">24-Month Target</h2></div>
              <p className="text-neutral-300">Negotiate in English, sell architecture reviews, lead founder calls, and deliver a 20–30 minute international conference talk.</p>
              <div className="mt-5 space-y-3">
                <ProgressLine label="Negotiation readiness" value={18} />
                <ProgressLine label="Architecture vocabulary" value={12} />
                <ProgressLine label="Conference track" value={6} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="start" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-900 md:grid-cols-6">
            <TabsTrigger value="start">Start Here</TabsTrigger><TabsTrigger value="daily">Daily Drill</TabsTrigger><TabsTrigger value="scenarios">Scenarios</TabsTrigger><TabsTrigger value="phrases">Phrase Bank</TabsTrigger><TabsTrigger value="conference">Conference</TabsTrigger><TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="start">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><Badge className="mb-4 bg-orange-500 text-white">30-Day Starter Mode</Badge><h2 className="text-3xl font-semibold">Start from zero without lowering your position</h2><p className="mt-4 text-neutral-300">Your first goal is not fluent English. Your first goal is to repeat strong founder-call phrases until they become automatic.</p><div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><div className="mb-2 text-sm font-medium text-orange-300">Today’s rule</div><p className="text-xl font-semibold text-neutral-100">Say less, but say it from authority.</p><p className="mt-3 text-neutral-300">Do not try to explain everything. Train one clear sentence, then expand it.</p></div></CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><h2 className="mb-5 text-2xl font-semibold">First 7 days</h2><div className="space-y-4">{starterPlan.map((item) => (<div key={item.day} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 flex items-center justify-between gap-3"><Badge variant="outline" className="border-orange-500/40 text-orange-300">{item.day}</Badge><span className="text-sm text-neutral-500">{item.focus}</span></div><p className="mb-3 text-neutral-300">{item.task}</p>{helperLanguage === "ru" && (<p className="mb-3 text-sm text-neutral-500">{item.taskRu}</p>)}<p className="rounded-xl bg-neutral-900 p-3 text-neutral-100">“{item.phrase}”</p>{helperLanguage === "ru" && (<p className="mt-2 rounded-xl bg-neutral-950 p-3 text-sm text-neutral-400">{item.phraseRu}</p>)}</div>))}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-4 flex items-center justify-between"><div><Badge variant="secondary" className="mb-3 bg-neutral-800 text-neutral-200">{activeScenario.type}</Badge><h2 className="text-2xl font-semibold">{activeScenario.title}</h2>{helperLanguage === "ru" && (<p className="mt-1 text-sm text-neutral-500">{activeScenario.titleRu}</p>)}</div><Badge className="bg-orange-500">{activeScenario.level}</Badge></div><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-3 flex items-center gap-2 text-sm text-neutral-400"><MessageSquare className="h-4 w-4" /> Founder says</div><p className="text-xl leading-relaxed text-neutral-100">“{activeScenario.founderLine}”</p>{helperLanguage === "ru" && (<p className="mt-3 rounded-xl bg-neutral-900 p-3 text-sm text-neutral-400">{activeScenario.founderLineRu}</p>)}</div><div className="mt-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><div className="mb-3 flex items-center gap-2 text-sm text-orange-300"><ShieldCheck className="h-4 w-4" /> Authority principle</div><p className="text-neutral-100">{activeScenario.authorityPrinciple}</p>{helperLanguage === "ru" && (<p className="mt-3 text-sm text-orange-100/80">{activeScenario.authorityPrincipleRu}</p>)}</div><div className="mt-5"><div className="mb-2 text-sm font-medium text-neutral-400">Key vocabulary</div><div className="flex flex-wrap gap-2">{activeScenario.vocabulary.map((word, index) => (<Badge key={word} variant="outline" className="border-neutral-700 text-neutral-200">{word}{helperLanguage === "ru" ? ` — ${activeScenario.vocabularyRu[index]}` : ""}</Badge>))}</div></div></CardContent></Card>

              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><Mic className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">Your speaking attempt</h2></div><p className="mb-4 text-neutral-400">First say the beginner answer aloud. Then write or record your stronger version.</p><div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="mb-2 text-sm font-medium text-orange-300">Beginner answer</div><p className="text-neutral-100">{activeScenario.beginnerAnswer}</p>{helperLanguage === "ru" && (<p className="mt-2 text-sm text-neutral-500">{activeScenario.beginnerAnswerRu}</p>)}</div><Textarea value={attempt} onChange={(e) => setAttempt(e.target.value)} placeholder="Your transcript will appear here. You can also type manually." className="min-h-40 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600" />
                <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="mb-2 text-sm font-medium text-neutral-300">Voice Practice Mode</div><p className="mb-4 text-sm text-neutral-500">{recordingStatus}</p>{helperLanguage === "ru" && (<p className="mb-4 rounded-xl bg-neutral-900 p-3 text-sm text-neutral-300">Скажи ответ вслух на английском. Если распознавание не сработало, напиши в поле то, что сказала. Главное — тренировать речь, а не печатание.</p>)}{!voiceSupported && (<div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-200">Voice recognition may not work inside preview environments. For full use, deploy this as a real HTTPS web app and open it in Google Chrome. Until then, use Manual Mode: say the answer aloud, then type what you said.</div>)}{manualMode && (<div className="mb-4 rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300">Manual Mode: speak aloud first, then type your answer into the transcript box. This still trains the same negotiation pattern.</div>)}<div className="flex flex-wrap gap-3"><Button onClick={startRecording} disabled={isRecording}><Mic className="mr-2 h-4 w-4" /> Record</Button><Button onClick={stopRecording} disabled={!isRecording} variant="outline"><Square className="mr-2 h-4 w-4" /> Stop</Button><Button onClick={() => setAttempt("")} variant="outline">Clear transcript</Button></div></div>
                <div className="mt-4 flex flex-wrap gap-3"><Button onClick={saveAttempt}><Brain className="mr-2 h-4 w-4" /> Analyze answer</Button><Button onClick={nextScenario} variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Next scenario</Button></div>
                {showFeedback && (<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4"><div className="grid gap-3 md:grid-cols-4"><Score label="Total" value={currentScore.total} /><Score label="Vocabulary" value={currentScore.vocabularyScore} /><Score label="Authority" value={currentScore.authorityScore} /><Score label="Clarity" value={currentScore.clarityScore} /></div><div className="grid gap-3 md:grid-cols-4">{["Total", "Vocabulary", "Authority", "Clarity"].map((label) => (<div key={label} className="text-xs text-neutral-500">{getScoreMeaning(label, helperLanguage)}</div>))}</div><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 flex items-center justify-between gap-3"><div className="text-sm font-medium text-orange-300">Stronger authority version</div><Button onClick={speakStrongerVersion} size="sm" variant="outline"><Volume2 className="mr-2 h-4 w-4" /> Listen</Button></div><p className="leading-relaxed text-neutral-100">{activeScenario.targetAnswer}</p>{helperLanguage === "ru" && (<div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300"><div className="mb-1 font-medium text-orange-300">Перевод смысла</div>{activeScenario.targetAnswerRu}</div>)}<div className="mt-4 rounded-xl bg-neutral-900 p-4 text-sm text-neutral-300">{helperLanguage === "ru" ? "Повтори эту сильную версию вслух 3 раза. Потом запиши снова без подсказки." : "Repeat this version aloud 3 times. Then record again without looking."}</div></div><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 text-sm font-medium text-neutral-300">{helperLanguage === "ru" ? "Фидбек" : "Feedback"}</div><p className="text-neutral-400">{getFeedbackCopy(currentScore.total, helperLanguage)}</p><div className="mt-4 rounded-xl bg-neutral-900 p-4 text-sm text-neutral-300"><div className="mb-1 font-medium text-orange-300">{helperLanguage === "ru" ? "Что сделать дальше" : "Next action"}</div>{getNextAction(currentScore.total, helperLanguage)}</div><div className="mt-4 text-sm text-neutral-500">{helperLanguage === "ru" ? "Смысл: ответ должен защищать твою стратегическую позицию. Не звучать как исполнитель. Веди разговор к продуктовой логике, риску, scope и качеству решений." : "Your answer should protect your strategic position. Avoid sounding like an executor. Lead the conversation toward product logic, risk, scope, and decision quality."}</div></div></motion.div>)}
              </CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="scenarios"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{scenarios.map((scenario) => (<Card key={scenario.id} className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-5"><Badge className="mb-3 bg-neutral-800 text-neutral-200">{scenario.type}</Badge><h3 className="mb-1 text-lg font-semibold">{scenario.title}</h3>{helperLanguage === "ru" && (<p className="mb-3 text-sm text-neutral-500">{scenario.titleRu}</p>)}<p className="mb-2 text-sm text-neutral-400">“{scenario.founderLine}”</p>{helperLanguage === "ru" && (<p className="mb-4 text-sm text-neutral-500">{scenario.founderLineRu}</p>)}<Button onClick={() => { setActiveScenario(scenario); setAttempt(""); setShowFeedback(false); }} className="w-full"><Play className="mr-2 h-4 w-4" /> Practice</Button></CardContent></Card>))}</div></TabsContent>

          <TabsContent value="phrases"><Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-5 flex items-center gap-3"><BookOpen className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">Authority Phrase Bank</h2></div><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search phrases, domains, or meaning..." className="mb-5 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600" /><div className="grid gap-4 md:grid-cols-2">{filteredPhrases.map((item) => (<div key={item.phrase} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><Badge variant="outline" className="mb-3 border-orange-500/40 text-orange-300">{item.domain}</Badge><p className="mb-2 text-lg font-medium text-neutral-100">{item.phrase}</p><p className="text-sm text-neutral-400">{item.meaning}</p></div>))}</div></CardContent></Card></TabsContent>

          <TabsContent value="conference"><div className="grid gap-6 lg:grid-cols-[1fr_1fr]"><Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-5 flex items-center gap-3"><Trophy className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">Conference Track</h2></div><div className="space-y-4">{[["Month 1–3", "1-minute architecture explanations"], ["Month 4–6", "3-minute founder-facing insights"], ["Month 7–12", "10-minute product architecture talks"], ["Year 2", "20–30 minute conference keynote + Q&A"]].map(([period, goal]) => (<div key={period} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-1 text-sm text-orange-300">{period}</div><div className="text-neutral-100">{goal}</div></div>))}</div></CardContent></Card><Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><h3 className="mb-4 text-xl font-semibold">Main talk thesis</h3><div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><p className="text-2xl font-semibold leading-tight">AI Won’t Save a Product Built on Weak Decisions</p><p className="mt-4 text-neutral-300">A conference-level topic connecting no-code speed, AI implementation risk, data structure, and product architecture.</p>{helperLanguage === "ru" && (<p className="mt-3 rounded-xl bg-neutral-900 p-3 text-sm text-neutral-400">Тема для международного выступления: как скорость no-code и AI становится риском, если продукт построен на слабых решениях.</p>)}</div><div className="mt-5 space-y-3 text-neutral-300"><p>1. No-code made building faster.</p><p>2. AI made experimentation easier.</p><p>3. But weak decisions still become expensive systems.</p><p>4. Architecture is how founders protect speed from becoming risk.</p></div></CardContent></Card></div></TabsContent>

          <TabsContent value="progress"><Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-5 flex items-center gap-3"><BarChart3 className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">Saved Attempts</h2></div>{savedAttempts.length === 0 ? (<p className="text-neutral-400">No attempts yet. Complete your first daily drill.</p>) : (<div className="space-y-4">{savedAttempts.map((item) => (<div key={item.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 flex items-center justify-between gap-3"><h3 className="font-semibold text-neutral-100">{item.scenario}</h3><Badge className="bg-orange-500">{item.score}/100</Badge></div><p className="mb-2 text-sm text-neutral-500">{item.date}</p><p className="text-neutral-300">{item.answer}</p></div>))}</div>)}</CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-1 flex justify-between text-sm text-neutral-400"><span>{label}</span><span>{value}%</span></div><Progress value={value} /></div>;
}

function Score({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-1 text-2xl font-semibold text-neutral-100">{value}</div><Progress value={value} className="mt-3" /></div>;
}
