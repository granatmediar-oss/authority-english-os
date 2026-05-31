"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  HelpCircle,
  Languages,
  Map,
  Mic,
  Play,
  RefreshCw,
  ShieldCheck,
  Square,
  Target,
  Users,
  Volume2,
} from "lucide-react";

type UI = "ru" | "en";
type GoalId = "authority" | "new-country" | "job" | "parent-child" | "conversation";
type LevelId = "zero" | "a1" | "a2" | "b1";
type TargetLang = "en" | "es" | "it" | "de" | "zh" | "ko" | "ru";
type LearnerType = "adult" | "child";
type SchoolGrade = "3" | "4" | "5" | "6" | "7";
type TextbookLine = "spotlight" | "rainbow" | "forward" | "other";
type SchoolMode = "summer-review" | "explain-topic" | "help-homework" | "check-answer";
type AccessPlan = "beta" | "paid" | "admin";
type AccessRoute = GoalId | "school" | "all";
type AccessState = {
  enabled: boolean;
  code: string;
  plan: AccessPlan;
  routes: AccessRoute[];
  name: string;
  contact: string;
  expiresAt: string;
  createdAt: string;
};

type Scenario = {
  id: string;
  goal: GoalId;
  level: LevelId[];
  typeEn: string;
  typeRu: string;
  titleEn: string;
  titleRu: string;
  situationEn: string;
  situationRu: string;
  beginner: string;
  beginnerRu: string;
  readRu: string;
  stronger: string;
  strongerRu: string;
  strongerReadRu: string;
  keywords: string[];
  principleEn: string;
  principleRu: string;
  emergency?: boolean;
};

type GeneratedRouteDay = {
  day: number;
  focus: string;
  focusRu: string;
  scenarioTitle: string;
  scenarioTitleRu: string;
  situation: string;
  situationRu: string;
  beginnerPhrase: string;
  beginnerTranslationRu: string;
  pronunciationRu: string;
  strongerPhrase: string;
  strongerTranslationRu: string;
  emergencyPhrases: string[];
  dailyPhrases: string[];
  dialogue: { role: "user" | "other"; text: string; translationRu: string }[];
  successCriteria: string;
  successCriteriaRu: string;
};

type GeneratedRoute = {
  routeTitle: string;
  routeTitleRu: string;
  summary: string;
  summaryRu: string;
  days: GeneratedRouteDay[];
};

type GeneratedRouteResponse = {
  source: "openai" | "fallback";
  warning?: string;
  route: GeneratedRoute;
};

type AiFeedback = {
  source: "openai" | "fallback";
  warning?: string;
  totalScore: number;
  vocabularyScore: number;
  positionScore: number;
  clarityScore: number;
  meaningScore: number;
  correctedAnswer: string;
  strongerVersion: string;
  feedbackRu: string;
  feedbackEn: string;
  nextActionRu: string;
  nextActionEn: string;
  keyPhrasesToRepeat: string[];
};

const uiText = {
  ru: {
    productBadge: "Goal-Based Language OS",
    title: "Language Goal OS",
    subtitle:
      "Платформа, где язык изучается через конкретную жизненную или профессиональную задачу, а не через случайные уроки.",
    targetTitle: "Путь под цель",
    targetSubtitle: "Выбор цели → уровень → сценарии → ежедневная тренировка → понятный прогресс.",
    interfaceLang: "Язык интерфейса",
    howTo: "Как пользоваться",
    start: "Начать",
    training: "Тренировка",
    scenarios: "Сценарии",
    phrases: "Фразы",
    path: "Маршрут",
    progress: "Прогресс",
    goalQuestion: "С какой задачей вы пришли?",
    goalSubtitle: "Выберите боль или реальную ситуацию. Платформа покажет маршрут, сценарии и фразы под эту задачу.",
    targetLanguage: "Какой язык вы изучаете?",
    levelQuestion: "Ваш стартовый уровень",
    startRoute: "Начать маршрут",
    selected: "Выбрано",
    today: "Сегодня",
    todayPlan: "1 сценарий · 3 фразы · 1 голосовая попытка · 1 повторение старой фразы",
    scenario: "Сценарий",
    phraseSet: "3 фразы на сегодня",
    oldPhrase: "Повторение старой фразы",
    founderSays: "Ситуация / собеседник говорит",
    beginnerAnswer: "Минимальный ответ",
    stronger: "Сильная версия",
    principle: "Зачем так говорить",
    voiceMode: "Голосовая практика",
    record: "Записать",
    stop: "Стоп",
    clear: "Очистить",
    analyze: "Проверить ответ",
    next: "Следующий сценарий",
    listen: "Слушать",
    typeManual: "Если микрофон не работает, скажите ответ вслух и введите его вручную.",
    statusReady: "Готово к записи. Говорите на изучаемом языке.",
    noAttempts: "Пока нет попыток. Попытка появляется после кнопки “Проверить ответ”.",
    clearProgress: "Очистить прогресс",
    attempts: "Попытки",
    avg: "Средний балл",
    best: "Лучший балл",
    last: "Последний балл",
    whySimple: "Сейчас задача — быть понятным, а не идеальным.",
    feedbackTitle: "Фидбек",
    aiFeedback: "AI-фидбек",
    aiAnalyzing: "AI анализирует ответ...",
    aiFallback: "Пока используется безопасный базовый фидбек. Добавьте OPENAI_API_KEY, чтобы включить настоящий AI-анализ.",
    meaning: "Смысл",
    corrected: "Исправленная версия",
    nextAction: "Следующее действие",
    repeatPhrases: "Фразы для повторения",
    total: "Общий балл",
    vocab: "Слова",
    authority: "Позиция",
    clarity: "Ясность",
    pronunciation: "Сомневаюсь, как прочитать",
    translation: "Перевод смысла",
    routeStructure: "Структура 30-дневного маршрута",
    aiLater: "AI-слой позже будет генерировать сценарии, озвучку и фидбек под выбранный язык и уровень.",
    aiGenerator: "AI-генератор маршрута",
    generateRoute: "Сгенерировать 30-дневный AI-маршрут",
    generatingRoute: "Генерирую маршрут...",
    generatedRoute: "AI-маршрут готов",
    routeSourceFallback: "Пока используется демо-маршрут без OpenAI. Добавьте OPENAI_API_KEY, чтобы включить настоящую генерацию.",
    routeSourceOpenAI: "Маршрут сгенерирован через OpenAI.",
    routeError: "Не получилось сгенерировать маршрут. Показан безопасный демо-маршрут.",
    day: "День",
    dailyPhrases: "3 фразы дня",
    emergencyPhrases: "Экстренные фразы",
    dialogue: "Мини-диалог",
    successCriteria: "Критерий успеха",
    startDay: "Тренировать этот день",
    mainFearLabel: "Что больше всего мешает говорить?",
    mainFearPlaceholder: "Например: боюсь не понять врача, зависаю на интервью, стыдно ошибиться",
    syncOn: "Прогресс сохраняется в Supabase",
    syncOff: "Сейчас прогресс хранится только в этом браузере",
    syncSaving: "Сохраняю...",
    syncSaved: "Сохранено",
    syncError: "Ошибка сохранения",
  },
  en: {
    productBadge: "Goal-Based Language OS",
    title: "Language Goal OS",
    subtitle:
      "A platform where language is trained through a real life or professional goal, not random lessons.",
    targetTitle: "Goal-based route",
    targetSubtitle: "Goal → level → scenarios → daily practice → clear progress.",
    interfaceLang: "Interface language",
    howTo: "How to use",
    start: "Start",
    training: "Training",
    scenarios: "Scenarios",
    phrases: "Phrases",
    path: "Route",
    progress: "Progress",
    goalQuestion: "What problem do you need language for?",
    goalSubtitle: "Choose a real situation. The platform shows a route, scenarios, and phrases for this task.",
    targetLanguage: "Which language are you learning?",
    levelQuestion: "Your starting level",
    startRoute: "Start route",
    selected: "Selected",
    today: "Today",
    todayPlan: "1 scenario · 3 phrases · 1 voice attempt · 1 old phrase review",
    scenario: "Scenario",
    phraseSet: "3 phrases for today",
    oldPhrase: "Old phrase review",
    founderSays: "Situation / other person says",
    beginnerAnswer: "Beginner answer",
    stronger: "Stronger version",
    principle: "Why this works",
    voiceMode: "Voice practice",
    record: "Record",
    stop: "Stop",
    clear: "Clear",
    analyze: "Analyze answer",
    next: "Next scenario",
    listen: "Listen",
    typeManual: "If the microphone does not work, say the answer aloud and type it manually.",
    statusReady: "Ready to record. Speak in your target language.",
    noAttempts: "No attempts yet. Attempts appear after you click “Analyze answer”.",
    clearProgress: "Clear progress",
    attempts: "Attempts",
    avg: "Average score",
    best: "Best score",
    last: "Last score",
    whySimple: "Your task now is to be understood, not perfect.",
    feedbackTitle: "Feedback",
    aiFeedback: "AI feedback",
    aiAnalyzing: "AI is analyzing the answer...",
    aiFallback: "Safe basic feedback is used for now. Add OPENAI_API_KEY to enable real AI analysis.",
    meaning: "Meaning",
    corrected: "Corrected version",
    nextAction: "Next action",
    repeatPhrases: "Phrases to repeat",
    total: "Total",
    vocab: "Vocabulary",
    authority: "Position",
    clarity: "Clarity",
    pronunciation: "Not sure how to pronounce it",
    translation: "Meaning translation",
    routeStructure: "30-day route structure",
    aiLater: "Later, the AI layer will generate scenarios, voice, and feedback for the selected language and level.",
    aiGenerator: "AI route generator",
    generateRoute: "Generate 30-day AI route",
    generatingRoute: "Generating route...",
    generatedRoute: "AI route is ready",
    routeSourceFallback: "A demo route is being used without OpenAI. Add OPENAI_API_KEY to enable real generation.",
    routeSourceOpenAI: "Route generated with OpenAI.",
    routeError: "Route generation failed. A safe demo route is shown.",
    day: "Day",
    dailyPhrases: "3 daily phrases",
    emergencyPhrases: "Emergency phrases",
    dialogue: "Mini dialogue",
    successCriteria: "Success criteria",
    startDay: "Practice this day",
    mainFearLabel: "What blocks you most when speaking?",
    mainFearPlaceholder: "For example: I freeze in interviews, I fear doctor calls, I am afraid of mistakes",
    syncOn: "Progress is saved in Supabase",
    syncOff: "Progress is stored only in this browser now",
    syncSaving: "Saving...",
    syncSaved: "Saved",
    syncError: "Sync error",
  },
};

const targetLanguages: { id: TargetLang; ru: string; en: string; flag: string }[] = [
  { id: "en", ru: "Английский", en: "English", flag: "🇬🇧" },
  { id: "es", ru: "Испанский", en: "Spanish", flag: "🇪🇸" },
  { id: "it", ru: "Итальянский", en: "Italian", flag: "🇮🇹" },
  { id: "de", ru: "Немецкий", en: "German", flag: "🇩🇪" },
  { id: "zh", ru: "Китайский", en: "Chinese", flag: "🇨🇳" },
  { id: "ko", ru: "Корейский", en: "Korean", flag: "🇰🇷" },
  { id: "ru", ru: "Русский", en: "Russian", flag: "🇷🇺" },
];

const goals: { id: GoalId; ru: string; en: string; descRu: string; descEn: string; promiseRu: string; promiseEn: string }[] = [
  {
    id: "new-country",
    ru: "Новая страна",
    en: "New country",
    descRu: "аренда, банк, врач, документы, школа, соседи",
    descEn: "rent, bank, doctor, documents, school, neighbours",
    promiseRu: "Для первых разговоров, где важно не растеряться и попросить помощь.",
    promiseEn: "For first conversations where you need to stay calm and ask for help.",
  },
  {
    id: "job",
    ru: "Работа и интервью",
    en: "Work and interview",
    descRu: "собеседования, письма, созвоны, самопрезентация",
    descEn: "interviews, emails, calls, self-introduction",
    promiseRu: "Для тех, кому язык нужен для работы, клиентов и уверенного общения.",
    promiseEn: "For people who need language for work, clients, and confident communication.",
  },
  {
    id: "parent-child",
    ru: "Родитель и ребёнок",
    en: "Parent and child",
    descRu: "прогресс ребёнка, школа, поддержка без хаоса",
    descEn: "child progress, school, support without chaos",
    promiseRu: "Для родителей, которым нужна ясная система поддержки ребёнка.",
    promiseEn: "For parents who need a clear support system for their child.",
  },
  {
    id: "conversation",
    ru: "Живой разговор",
    en: "Real conversation",
    descRu: "для тех, кто знает слова, но теряется в разговоре",
    descEn: "for people who know words but freeze in live conversation",
    promiseRu: "Для быстрых реакций, переспросов и снятия страха ошибки.",
    promiseEn: "For quick reactions, clarification phrases, and fear reduction.",
  },
  {
    id: "authority",
    ru: "Профессиональная позиция",
    en: "Professional authority",
    descRu: "переговоры, клиенты, цена, выступления",
    descEn: "negotiations, clients, pricing, speaking",
    promiseRu: "Для экспертов, которым важно не потерять позицию на другом языке.",
    promiseEn: "For experts who must not lose authority in another language.",
  },
];


type RouteTheme = {
  nameRu: string;
  nameEn: string;
  badgeRu: string;
  badgeEn: string;
  gradient: string;
  glow: string;
  border: string;
  softBg: string;
  text: string;
  button: string;
  promiseRu: string;
  promiseEn: string;
};

const routeThemes: Record<GoalId | "school", RouteTheme> = {
  "new-country": {
    nameRu: "Новая страна",
    nameEn: "New country",
    badgeRu: "Survival route",
    badgeEn: "Survival route",
    gradient: "from-orange-500 to-amber-300",
    glow: "bg-orange-500/20",
    border: "border-orange-400/40",
    softBg: "bg-orange-500/10",
    text: "text-orange-300",
    button: "bg-orange-500 hover:bg-orange-600",
    promiseRu: "После оплаты открывается отдельная страница маршрута: врач, банк, аренда, документы, школа и первые разговоры.",
    promiseEn: "After payment, the user enters a dedicated route page: doctor, bank, rent, documents, school, and first conversations.",
  },
  job: {
    nameRu: "Работа и интервью",
    nameEn: "Work and interview",
    badgeRu: "Career route",
    badgeEn: "Career route",
    gradient: "from-sky-500 to-cyan-300",
    glow: "bg-sky-500/20",
    border: "border-sky-400/40",
    softBg: "bg-sky-500/10",
    text: "text-sky-300",
    button: "bg-sky-500 hover:bg-sky-600",
    promiseRu: "После оплаты открывается рабочий маршрут: интервью, созвоны, письма, клиенты и самопрезентация.",
    promiseEn: "After payment, the user enters a work route: interviews, calls, emails, clients, and self-introduction.",
  },
  "parent-child": {
    nameRu: "Родитель и ребёнок",
    nameEn: "Parent and child",
    badgeRu: "Parent route",
    badgeEn: "Parent route",
    gradient: "from-emerald-500 to-lime-300",
    glow: "bg-emerald-500/20",
    border: "border-emerald-400/40",
    softBg: "bg-emerald-500/10",
    text: "text-emerald-300",
    button: "bg-emerald-500 hover:bg-emerald-600",
    promiseRu: "После оплаты родитель получает кабинет динамики, а ребёнок — отдельный лёгкий интерфейс без перегруза.",
    promiseEn: "After payment, the parent gets a progress dashboard, while the child gets a simple focused interface.",
  },
  conversation: {
    nameRu: "Живой разговор",
    nameEn: "Real conversation",
    badgeRu: "Speaking route",
    badgeEn: "Speaking route",
    gradient: "from-violet-500 to-fuchsia-300",
    glow: "bg-violet-500/20",
    border: "border-violet-400/40",
    softBg: "bg-violet-500/10",
    text: "text-violet-300",
    button: "bg-violet-500 hover:bg-violet-600",
    promiseRu: "После оплаты открывается маршрут живого диалога: быстрые реакции, переспросы и снятие страха ошибки.",
    promiseEn: "After payment, the user enters a live conversation route: quick reactions, clarification, and fear reduction.",
  },
  authority: {
    nameRu: "Профессиональная позиция",
    nameEn: "Professional authority",
    badgeRu: "Authority route",
    badgeEn: "Authority route",
    gradient: "from-amber-400 to-orange-500",
    glow: "bg-amber-500/20",
    border: "border-amber-400/40",
    softBg: "bg-amber-500/10",
    text: "text-amber-300",
    button: "bg-amber-500 hover:bg-amber-600",
    promiseRu: "После оплаты открывается premium-маршрут: переговоры, цена, границы, клиенты и выступления.",
    promiseEn: "After payment, the user enters a premium route: negotiation, pricing, boundaries, clients, and speaking.",
  },
  school: {
    nameRu: "Школьный английский",
    nameEn: "School English",
    badgeRu: "School beta route",
    badgeEn: "School beta route",
    gradient: "from-emerald-500 to-lime-300",
    glow: "bg-emerald-500/20",
    border: "border-emerald-400/40",
    softBg: "bg-emerald-500/10",
    text: "text-emerald-300",
    button: "bg-emerald-500 hover:bg-emerald-600",
    promiseRu: "После оплаты родитель регистрирует ребёнка, видит динамику, темы, ошибки и рекомендации. Ребёнок занимается в отдельном лёгком интерфейсе с Buddy.",
    promiseEn: "After payment, the parent registers the child and sees progress, topics, mistakes, and recommendations. The child studies in a separate light interface with Buddy.",
  },
};

function getRouteTheme(learnerType: LearnerType, goal: GoalId) {
  return learnerType === "child" ? routeThemes.school : routeThemes[goal];
}

const levels: { id: LevelId; ru: string; en: string; descRu: string; descEn: string }[] = [
  { id: "zero", ru: "Уровень 0", en: "Zero", descRu: "Почти не говорю. Нужны короткие безопасные фразы.", descEn: "I almost do not speak. I need short safe phrases." },
  { id: "a1", ru: "A1", en: "A1", descRu: "Понимаю отдельные слова и могу сказать простые фразы.", descEn: "I understand some words and can say simple phrases." },
  { id: "a2", ru: "A2", en: "A2", descRu: "Могу говорить, но теряюсь в живом диалоге.", descEn: "I can speak, but I freeze in real dialogue." },
  { id: "b1", ru: "B1+", en: "B1+", descRu: "Хочу звучать увереннее, точнее и взрослее.", descEn: "I want to sound more confident, precise, and mature." },
];

const schoolGrades: { id: SchoolGrade; label: string; noteRu: string; noteEn: string }[] = [
  { id: "3", label: "3 класс", noteRu: "простые слова, чтение, базовые фразы", noteEn: "basic words, reading, simple phrases" },
  { id: "4", label: "4 класс", noteRu: "база, вопросы, короткие тексты", noteEn: "basics, questions, short texts" },
  { id: "5", label: "5 класс", noteRu: "переход в среднюю школу, Present Simple", noteEn: "middle school transition, Present Simple" },
  { id: "6", label: "6 класс", noteRu: "времена, тексты, самостоятельность", noteEn: "tenses, texts, independence" },
  { id: "7", label: "7 класс", noteRu: "закрепление грамматики и говорения", noteEn: "grammar and speaking reinforcement" },
];

const textbookLines: { id: TextbookLine; ru: string; en: string }[] = [
  { id: "spotlight", ru: "Spotlight / Английский в фокусе", en: "Spotlight" },
  { id: "rainbow", ru: "Rainbow English", en: "Rainbow English" },
  { id: "forward", ru: "Forward", en: "Forward" },
  { id: "other", ru: "Другой учебник", en: "Other textbook" },
];

const schoolModes: { id: SchoolMode; ru: string; en: string; descRu: string; descEn: string }[] = [
  { id: "summer-review", ru: "Летнее повторение", en: "Summer review", descRu: "мягко повторить слабые темы к сентябрю", descEn: "review weak topics before September" },
  { id: "explain-topic", ru: "Объяснить тему", en: "Explain a topic", descRu: "короткое объяснение правила простыми словами", descEn: "a short simple explanation" },
  { id: "help-homework", ru: "Помочь с заданием", en: "Help with homework", descRu: "не готовый ответ, а шаги к самостоятельному решению", descEn: "steps toward independent work" },
  { id: "check-answer", ru: "Проверить ответ", en: "Check my answer", descRu: "объяснить ошибку и что повторить", descEn: "explain the mistake and what to repeat" },
];


const defaultAccessState: AccessState = {
  enabled: false,
  code: "",
  plan: "beta",
  routes: [],
  name: "",
  contact: "",
  expiresAt: "",
  createdAt: "",
};

const betaAccessCodes: Record<string, { plan: AccessPlan; routes: AccessRoute[]; days: number; labelRu: string; labelEn: string }> = {
  "SCHOOL-BETA-001": { plan: "beta", routes: ["school"], days: 14, labelRu: "Школьный beta-доступ", labelEn: "School beta access" },
  "WORK-BETA-001": { plan: "beta", routes: ["job"], days: 30, labelRu: "Работа и интервью · beta", labelEn: "Work and interview · beta" },
  "COUNTRY-BETA-001": { plan: "beta", routes: ["new-country"], days: 30, labelRu: "Новая страна · beta", labelEn: "New country · beta" },
  "TALK-BETA-001": { plan: "beta", routes: ["conversation"], days: 30, labelRu: "Живой разговор · beta", labelEn: "Conversation · beta" },
  "PRO-BETA-001": { plan: "beta", routes: ["authority"], days: 30, labelRu: "Профессиональная позиция · beta", labelEn: "Professional authority · beta" },
  "ALL-BETA-001": { plan: "beta", routes: ["all"], days: 30, labelRu: "Все beta-маршруты", labelEn: "All beta routes" },
  "SCHOOL-PAID-001": { plan: "paid", routes: ["school"], days: 30, labelRu: "Школьный оплаченный доступ", labelEn: "School paid access" },
  "WORK-PAID-001": { plan: "paid", routes: ["job"], days: 30, labelRu: "Работа и интервью · оплачено", labelEn: "Work and interview · paid" },
};

function resolveAccessCode(rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  const preset = betaAccessCodes[code];
  if (!preset) return null;
  const expires = new Date();
  expires.setDate(expires.getDate() + preset.days);
  return { code, preset, expiresAt: expires.toISOString() };
}

function routeNameForAccess(route: AccessRoute, ui: UI) {
  if (route === "all") return ui === "ru" ? "все маршруты" : "all routes";
  if (route === "school") return ui === "ru" ? "школьный английский" : "school English";
  const found = goals.find((item) => item.id === route);
  return found ? (ui === "ru" ? found.ru : found.en) : route;
}

const schoolScenarios: Scenario[] = [
  {
    id: "school-present-simple",
    goal: "parent-child",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "School topic",
    typeRu: "Школьная тема",
    titleEn: "Present Simple: daily routine",
    titleRu: "Present Simple: распорядок дня",
    situationEn: "The child needs to make simple sentences about daily routine.",
    situationRu: "Ребёнку нужно составить простые предложения о распорядке дня.",
    beginner: "I get up at seven o’clock.",
    beginnerRu: "Я встаю в семь часов.",
    readRu: "Ай гэт ап эт сэвэн о-клок.",
    stronger: "I get up at seven o’clock and go to school in the morning.",
    strongerRu: "Я встаю в семь часов и утром иду в школу.",
    strongerReadRu: "Ай гэт ап эт сэвэн о-клок энд гоу ту скул ин зэ морнинг.",
    keywords: ["get", "up", "school", "morning", "seven"],
    principleEn: "The child learns the pattern I + verb for regular actions.",
    principleRu: "Ребёнок закрепляет схему I + глагол для регулярных действий.",
  },
  {
    id: "school-be",
    goal: "parent-child",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "School topic",
    typeRu: "Школьная тема",
    titleEn: "To be: about myself",
    titleRu: "To be: рассказ о себе",
    situationEn: "The child needs to say simple sentences about themselves.",
    situationRu: "Ребёнку нужно сказать простые предложения о себе.",
    beginner: "I am a student.",
    beginnerRu: "Я ученик / ученица.",
    readRu: "Ай эм э стьюдэнт.",
    stronger: "I am a student and I like English.",
    strongerRu: "Я ученик / ученица, и мне нравится английский.",
    strongerReadRu: "Ай эм э стьюдэнт энд ай лайк инглиш.",
    keywords: ["i", "am", "student", "like", "english"],
    principleEn: "The child learns when to use am/is/are without long grammar explanations.",
    principleRu: "Ребёнок учится использовать am/is/are без длинных объяснений.",
  },
  {
    id: "school-have-got",
    goal: "parent-child",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "School topic",
    typeRu: "Школьная тема",
    titleEn: "Have got: family and things",
    titleRu: "Have got: семья и вещи",
    situationEn: "The child needs to say what they have.",
    situationRu: "Ребёнку нужно сказать, что у него есть.",
    beginner: "I have got a book.",
    beginnerRu: "У меня есть книга.",
    readRu: "Ай хэв гот э бук.",
    stronger: "I have got a book and a pencil in my bag.",
    strongerRu: "У меня в сумке есть книга и карандаш.",
    strongerReadRu: "Ай хэв гот э бук энд э пэнсил ин май бэг.",
    keywords: ["have", "got", "book", "pencil", "bag"],
    principleEn: "The child sees the structure have got and uses it in a real sentence.",
    principleRu: "Ребёнок видит структуру have got и использует её в реальной фразе.",
  },
  {
    id: "school-question",
    goal: "parent-child",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "School speaking",
    typeRu: "Школьное говорение",
    titleEn: "Ask a simple question",
    titleRu: "Задать простой вопрос",
    situationEn: "The child needs to ask a short question in English.",
    situationRu: "Ребёнку нужно задать короткий вопрос на английском.",
    beginner: "Do you like English?",
    beginnerRu: "Тебе нравится английский?",
    readRu: "Ду ю лайк инглиш?",
    stronger: "Do you like English or another school subject?",
    strongerRu: "Тебе нравится английский или другой школьный предмет?",
    strongerReadRu: "Ду ю лайк инглиш ор эназэр скул сабджект?",
    keywords: ["do", "you", "like", "english", "subject"],
    principleEn: "The child practices question order through one safe phrase.",
    principleRu: "Ребёнок тренирует порядок слов в вопросе через одну безопасную фразу.",
  },
  {
    id: "school-check-answer",
    goal: "parent-child",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Check answer",
    typeRu: "Проверка ответа",
    titleEn: "Find and fix one mistake",
    titleRu: "Найти и исправить одну ошибку",
    situationEn: "The child writes an answer, and the system helps find one mistake.",
    situationRu: "Ребёнок пишет ответ, а система помогает найти одну ошибку.",
    beginner: "She likes apples.",
    beginnerRu: "Ей нравятся яблоки.",
    readRu: "Ши лайкс эплз.",
    stronger: "She likes apples, but I like bananas.",
    strongerRu: "Ей нравятся яблоки, а мне нравятся бананы.",
    strongerReadRu: "Ши лайкс эплз, бат ай лайк бананэз.",
    keywords: ["she", "likes", "apples", "i", "like"],
    principleEn: "The child learns that he/she often needs -s in Present Simple.",
    principleRu: "Ребёнок закрепляет, что после he/she часто нужно добавить -s в Present Simple.",
  },
];


const scenarios: Scenario[] = [
  {
    id: "nc-repeat",
    goal: "new-country",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Emergency phrase",
    typeRu: "Экстренная фраза",
    titleEn: "Ask someone to repeat slowly",
    titleRu: "Попросить повторить медленнее",
    situationEn: "The person speaks too fast and you do not understand.",
    situationRu: "Собеседник говорит слишком быстро, и вы не понимаете.",
    beginner: "Sorry, I don’t understand. Can you repeat, please?",
    beginnerRu: "Извините, я не понимаю. Можете повторить, пожалуйста?",
    readRu: "Сори, ай доунт андэрстэнд. Кэн ю рипит, плиз?",
    stronger: "Sorry, I don’t understand yet. Could you speak a little more slowly, please?",
    strongerRu: "Извините, я пока не понимаю. Можете говорить немного медленнее, пожалуйста?",
    strongerReadRu: "Сори, ай доунт андэрстэнд йет. Куд ю спик э литл мор слоули, плиз?",
    keywords: ["sorry", "understand", "repeat", "slowly", "please"],
    principleEn: "This phrase gives you time and keeps the conversation safe.",
    principleRu: "Эта фраза даёт время и сохраняет контроль в разговоре.",
    emergency: true,
  },
  {
    id: "nc-doctor",
    goal: "new-country",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Doctor",
    typeRu: "Врач",
    titleEn: "Make a doctor appointment",
    titleRu: "Записаться к врачу",
    situationEn: "You need to call a clinic and make an appointment.",
    situationRu: "Вам нужно позвонить в клинику и записаться на приём.",
    beginner: "I need to make an appointment with a doctor.",
    beginnerRu: "Мне нужно записаться к врачу.",
    readRu: "Ай ниид ту мэйк эн эпойнтмэнт уиз э доктор.",
    stronger: "I need to make an appointment with a doctor as soon as possible.",
    strongerRu: "Мне нужно записаться к врачу как можно скорее.",
    strongerReadRu: "Ай ниид ту мэйк эн эпойнтмэнт уиз э доктор эз сун эз посибл.",
    keywords: ["appointment", "doctor", "need", "possible"],
    principleEn: "For survival scenarios, simple and clear is better than perfect.",
    principleRu: "В бытовых ситуациях простота и ясность важнее идеальности.",
  },
  {
    id: "nc-rent",
    goal: "new-country",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Rent",
    typeRu: "Аренда",
    titleEn: "Ask about an apartment",
    titleRu: "Спросить про квартиру",
    situationEn: "You want to ask if an apartment is still available.",
    situationRu: "Вы хотите спросить, свободна ли ещё квартира.",
    beginner: "Is this apartment still available?",
    beginnerRu: "Эта квартира ещё доступна?",
    readRu: "Из зис апартмэнт стил эвэйлэбл?",
    stronger: "Hello, is this apartment still available, and can I schedule a viewing?",
    strongerRu: "Здравствуйте, эта квартира ещё доступна, и можно ли записаться на просмотр?",
    strongerReadRu: "Хэллоу, из зис апартмэнт стил эвэйлэбл, энд кэн ай скеджул э вьюинг?",
    keywords: ["apartment", "available", "schedule", "viewing"],
    principleEn: "A short question helps you start without overexplaining.",
    principleRu: "Короткий вопрос помогает начать разговор без лишнего объяснения.",
  },
  {
    id: "job-intro",
    goal: "job",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Interview",
    typeRu: "Собеседование",
    titleEn: "Answer: Tell me about yourself",
    titleRu: "Ответить: расскажите о себе",
    situationEn: "The interviewer asks you to introduce yourself.",
    situationRu: "Интервьюер просит коротко рассказать о себе.",
    beginner: "I have experience in this field, and I am ready to learn.",
    beginnerRu: "У меня есть опыт в этой области, и я готов(а) учиться.",
    readRu: "Ай хэв экспириэнс ин зис филд, энд ай эм рэди ту лёрн.",
    stronger: "I have experience in this field, and I am looking for a role where I can grow and bring practical value.",
    strongerRu: "У меня есть опыт в этой области, и я ищу роль, где смогу развиваться и приносить практическую пользу.",
    strongerReadRu: "Ай хэв экспириэнс ин зис филд, энд ай эм лукинг фор э роул уэр ай кэн гроу энд бринг практикал вэлью.",
    keywords: ["experience", "field", "ready", "learn", "value"],
    principleEn: "Start with a simple professional identity, then add value.",
    principleRu: "Начните с простой профессиональной позиции, потом добавьте ценность.",
  },
  {
    id: "job-email",
    goal: "job",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Email",
    typeRu: "Письмо",
    titleEn: "Send a follow-up after a call",
    titleRu: "Написать follow-up после созвона",
    situationEn: "You had a call and need to send a short follow-up email.",
    situationRu: "У вас был созвон, и нужно отправить короткое письмо после встречи.",
    beginner: "Thank you for the call. I will send the next steps soon.",
    beginnerRu: "Спасибо за созвон. Я скоро отправлю следующие шаги.",
    readRu: "Сэнк ю фор зэ кол. Ай вил сэнд зэ некст степс сун.",
    stronger: "Thank you for the call. I’ll summarize the key points and send the next steps today.",
    strongerRu: "Спасибо за созвон. Я сегодня подведу основные итоги и отправлю следующие шаги.",
    strongerReadRu: "Сэнк ю фор зэ кол. Айл саммарайз зэ ки пойнтс энд сэнд зэ некст степс тудэй.",
    keywords: ["thank", "call", "summarize", "next", "steps"],
    principleEn: "A clear follow-up makes you sound organized and reliable.",
    principleRu: "Чёткий follow-up показывает организованность и надёжность.",
  },
  {
    id: "job-call",
    goal: "job",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Work call",
    typeRu: "Рабочий созвон",
    titleEn: "Say you need to clarify the task",
    titleRu: "Сказать, что нужно уточнить задачу",
    situationEn: "A colleague or client explains something, but the task is not clear.",
    situationRu: "Коллега или клиент что-то объяснил, но задача остаётся неясной.",
    beginner: "I need to clarify the task first.",
    beginnerRu: "Сначала мне нужно уточнить задачу.",
    readRu: "Ай ниид ту клэрифай зэ таск фёрст.",
    stronger: "Before I start, I need to clarify the task, the expected result, and the deadline.",
    strongerRu: "Перед началом мне нужно уточнить задачу, ожидаемый результат и срок.",
    strongerReadRu: "Бифор ай старт, ай ниид ту клэрифай зэ таск, зэ экспектэд ризалт, энд зэ дэдлайн.",
    keywords: ["clarify", "task", "result", "deadline"],
    principleEn: "Clarifying the task protects you from misunderstanding and rework.",
    principleRu: "Уточнение задачи защищает от недопонимания и переделок.",
  },
  {
    id: "parent-teacher",
    goal: "parent-child",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "School",
    typeRu: "Школа",
    titleEn: "Ask the teacher about progress",
    titleRu: "Спросить учителя о прогрессе ребёнка",
    situationEn: "You want to ask the teacher how your child is doing.",
    situationRu: "Вы хотите спросить учителя, как у ребёнка дела.",
    beginner: "How is my child doing in class?",
    beginnerRu: "Как мой ребёнок занимается на уроках?",
    readRu: "Хау из май чайлд дуинг ин класс?",
    stronger: "Could you tell me how my child is doing in class and what we should practice at home?",
    strongerRu: "Можете сказать, как мой ребёнок занимается на уроках и что нам повторить дома?",
    strongerReadRu: "Куд ю тэл ми хау май чайлд из дуинг ин класс энд уот уи шуд практис эт хоум?",
    keywords: ["child", "class", "practice", "home"],
    principleEn: "The parent needs clear next actions, not abstract progress.",
    principleRu: "Родителю нужны понятные следующие действия, а не абстрактный прогресс.",
  },
  {
    id: "parent-support",
    goal: "parent-child",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Support",
    typeRu: "Поддержка",
    titleEn: "Support your child without pressure",
    titleRu: "Поддержать ребёнка без давления",
    situationEn: "Your child is afraid of making mistakes in English.",
    situationRu: "Ребёнок боится ошибаться на английском.",
    beginner: "It is okay to make mistakes.",
    beginnerRu: "Ошибаться — нормально.",
    readRu: "Ит из окэй ту мэйк мистэйкс.",
    stronger: "It is okay to make mistakes. The most important thing is to try and be understood.",
    strongerRu: "Ошибаться нормально. Самое важное — пробовать и быть понятым.",
    strongerReadRu: "Ит из окэй ту мэйк мистэйкс. Зэ мост импортэнт синг из ту трай энд би андэрстуд.",
    keywords: ["okay", "mistakes", "try", "understood"],
    principleEn: "Safety reduces fear and helps the child speak more.",
    principleRu: "Ощущение безопасности снижает страх и помогает ребёнку говорить больше.",
  },
  {
    id: "conv-freeze",
    goal: "conversation",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Live conversation",
    typeRu: "Живой разговор",
    titleEn: "When you freeze and need time",
    titleRu: "Когда зависли и нужно время",
    situationEn: "Someone asks you a question, and you freeze.",
    situationRu: "Вам задают вопрос, и вы зависаете.",
    beginner: "Give me a moment, please.",
    beginnerRu: "Дайте мне минуту, пожалуйста.",
    readRu: "Гив ми э моумэнт, плиз.",
    stronger: "Give me a moment, please. I understand the question, but I need a second to answer.",
    strongerRu: "Дайте мне минуту. Я понимаю вопрос, но мне нужна секунда, чтобы ответить.",
    strongerReadRu: "Гив ми э моумэнт, плиз. Ай андэрстэнд зэ квэсчэн, бат ай ниид э сэкэнд ту ансэр.",
    keywords: ["moment", "understand", "question", "answer"],
    principleEn: "This phrase prevents panic and keeps you in the conversation.",
    principleRu: "Эта фраза предотвращает панику и удерживает вас в разговоре.",
    emergency: true,
  },
  {
    id: "conv-smalltalk",
    goal: "conversation",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Small talk",
    typeRu: "Small talk",
    titleEn: "Keep a simple conversation going",
    titleRu: "Поддержать простой разговор",
    situationEn: "Someone tells you about their day, and you need to respond.",
    situationRu: "Кто-то рассказывает о своём дне, и вам нужно ответить.",
    beginner: "That sounds interesting.",
    beginnerRu: "Звучит интересно.",
    readRu: "Зэт саундс интэрэстинг.",
    stronger: "That sounds interesting. Can you tell me a little more about it?",
    strongerRu: "Звучит интересно. Можете рассказать немного больше?",
    strongerReadRu: "Зэт саундс интэрэстинг. Кэн ю тэл ми э литл мор эбаут ит?",
    keywords: ["interesting", "tell", "more"],
    principleEn: "Simple follow-up questions help you avoid silence.",
    principleRu: "Простые уточняющие вопросы помогают избежать неловкого молчания.",
  },
  {
    id: "auth-position",
    goal: "authority",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Positioning",
    typeRu: "Позиционирование",
    titleEn: "Introduce yourself as an expert",
    titleRu: "Представиться как эксперт",
    situationEn: "A founder asks what you do.",
    situationRu: "Основатель спрашивает, чем вы занимаетесь.",
    beginner: "I am a Product and Decision Architect.",
    beginnerRu: "Я Product and Decision Architect.",
    readRu: "Ай эм э продакт энд дисижн архитэкт.",
    stronger: "I am a Product and Decision Architect. I help founders design product architecture before they spend money on development.",
    strongerRu: "Я Product and Decision Architect. Я помогаю основателям спроектировать архитектуру продукта до затрат на разработку.",
    strongerReadRu: "Ай эм э продакт энд дисижн архитэкт. Ай хэлп фаундэрс дизайн продакт архитэкчэр бифор зэй спэнд мани он дивэлопмэнт.",
    keywords: ["product", "decision", "architect", "founders", "architecture"],
    principleEn: "Start with your role, not with tools.",
    principleRu: "Начинайте с роли, а не с инструментов.",
  },
  {
    id: "auth-estimate",
    goal: "authority",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "Pricing",
    typeRu: "Цена",
    titleEn: "Founder asks for a quick estimate",
    titleRu: "Клиент просит быструю оценку",
    situationEn: "Can you just tell me how much it will cost to build the app?",
    situationRu: "Можете просто сказать, сколько будет стоить разработка приложения?",
    beginner: "I need to understand the product first.",
    beginnerRu: "Сначала мне нужно понять продукт.",
    readRu: "Ай ниид ту андэрстэнд зэ продакт фёрст.",
    stronger: "Before I estimate the build, I need to understand the product logic, user roles, data structure, and risk points.",
    strongerRu: "Перед оценкой разработки мне нужно понять продуктовую логику, роли пользователей, структуру данных и точки риска.",
    strongerReadRu: "Бифор ай эстимэйт зэ билд, ай ниид ту андэрстэнд зэ продакт лоджик, юзер роулз, дэйта стракчэр, энд риск пойнтс.",
    keywords: ["estimate", "product", "logic", "roles", "data", "risk"],
    principleEn: "Do not price implementation before architecture is clear.",
    principleRu: "Не оценивайте реализацию до ясности архитектуры.",
  },
  {
    id: "auth-ai",
    goal: "authority",
    level: ["zero", "a1", "a2", "b1"],
    typeEn: "AI risk",
    typeRu: "AI-риск",
    titleEn: "Founder wants to add AI",
    titleRu: "Клиент хочет добавить AI",
    situationEn: "Can we just add AI to the product?",
    situationRu: "Можем просто добавить AI в продукт?",
    beginner: "First, we need to understand the data and the product logic.",
    beginnerRu: "Сначала нужно понять данные и продуктовую логику.",
    readRu: "Фёрст, уи ниид ту андэрстэнд зэ дэйта энд зэ продакт лоджик.",
    stronger: "AI should not be added before the input data, output format, user outcome, and risk boundaries are clear.",
    strongerRu: "AI не стоит добавлять, пока не ясны входные данные, формат результата, пользовательская цель и границы риска.",
    strongerReadRu: "Эй-ай шуд нот би эдэд бифор зэ инпут дэйта, аутпут формат, юзер ауткам, энд риск баундэриз ар клир.",
    keywords: ["ai", "data", "output", "outcome", "risk", "clear"],
    principleEn: "AI amplifies product logic. It does not replace it.",
    principleRu: "AI усиливает продуктовую логику, а не заменяет её.",
  },
];

const routeDays = [
  { day: 1, ru: "Одна безопасная фраза", en: "One safe phrase" },
  { day: 2, ru: "Повторить и сказать без подсказки", en: "Repeat and say without help" },
  { day: 3, ru: "Мини-диалог", en: "Mini dialogue" },
  { day: 4, ru: "Попросить повторить / уточнить", en: "Ask to repeat / clarify" },
  { day: 5, ru: "Сказать своими словами", en: "Say it in your own words" },
  { day: 6, ru: "Письменная версия", en: "Written version" },
  { day: 7, ru: "Повторение недели", en: "Weekly review" },
];

function normalizeAnswer(text: string) {
  return text
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
    return Math.round(70 + lengthRatio * 30);
  }
  const targetWords = target.split(" ").filter(Boolean);
  if (targetWords.length <= 1) return user.includes(target) || target.includes(user) ? 100 : 0;
  const matchedWords = targetWords.filter((word) => user.includes(word)).length;
  return Math.round((matchedWords / Math.max(1, targetWords.length)) * 100);
}

function getScoreLabels(goal: GoalId, ui: UI) {
  const labels = {
    authority: { ru: ["Словарь", "Позиция", "Ясность"], en: ["Vocabulary", "Position", "Clarity"] },
    "new-country": { ru: ["Смысл", "Полезная фраза", "Ясность"], en: ["Meaning", "Useful phrase", "Clarity"] },
    job: { ru: ["Самопрезентация", "Структура", "Ясность"], en: ["Self-presentation", "Structure", "Clarity"] },
    "parent-child": { ru: ["Понимание", "Поддержка", "Ясность"], en: ["Understanding", "Support", "Clarity"] },
    conversation: { ru: ["Реакция", "Естественность", "Ясность"], en: ["Response", "Naturalness", "Clarity"] },
  } as const;
  return labels[goal][ui];
}

function scoreAttempt(text: string, scenario: Scenario, level: LevelId, helpOpens: number, goal: GoalId) {
  const clean = normalizeAnswer(text);
  const beginnerMatch = phraseSimilarity(text, scenario.beginner);
  const strongerMatch = phraseSimilarity(text, scenario.stronger);
  const keywordMatches = scenario.keywords.filter((word) => clean.includes(normalizeAnswer(String(word)))).length;
  const keywordScore = Math.min(100, Math.round((keywordMatches / Math.max(1, scenario.keywords.length)) * 100));

  // For level zero, one correct short survival phrase is success. Do not punish a beginner for being brief.
  const phraseScore = Math.max(beginnerMatch, Math.round(strongerMatch * 0.9), keywordScore);
  const meaningScore = level === "zero" && beginnerMatch >= 65 ? Math.max(85, beginnerMatch) : Math.max(phraseScore, keywordScore);

  const tokenCount = clean ? clean.split(/\s+/).length : 0;
  const charCount = clean.length;
  const minimalEnough = level === "zero" ? (beginnerMatch >= 65 || charCount >= 2) : tokenCount >= 3;
  const clarityBase = minimalEnough ? 72 : 30;
  const supportPenalty = Math.min(15, helpOpens * 3);
  const clarityBonus = Math.min(18, tokenCount * 3);
  const clarityScore = Math.max(10, Math.min(100, clarityBase + clarityBonus - supportPenalty));

  const usefulPhraseScore = Math.max(beginnerMatch, keywordScore);
  const structureSignals = ["because", "before", "first", "please", "need", "can", "could", "understand", "thank", "sorry"];
  const structureScore = Math.min(100, structureSignals.filter((word) => clean.includes(word)).length * 12 + 35);
  const authoritySignals = ["risk", "architecture", "decision", "scope", "data", "logic", "founder", "product", "estimate", "before"];
  const authorityScore = Math.min(100, authoritySignals.filter((word) => clean.includes(word)).length * 12 + Math.max(25, keywordScore));

  let vocabularyScore = usefulPhraseScore;
  let positionScore = structureScore;

  if (goal === "authority") {
    vocabularyScore = Math.max(keywordScore, Math.round((beginnerMatch + keywordScore) / 2));
    positionScore = authorityScore;
  } else if (goal === "job") {
    vocabularyScore = Math.max(meaningScore, keywordScore);
    positionScore = structureScore;
  } else if (goal === "parent-child") {
    vocabularyScore = meaningScore;
    positionScore = Math.max(usefulPhraseScore, clean.includes("mistake") || clean.includes("practice") || clean.includes("child") ? 80 : 45);
  } else if (goal === "conversation") {
    vocabularyScore = Math.max(usefulPhraseScore, beginnerMatch);
    positionScore = Math.max(clarityScore, clean.includes("moment") || clean.includes("repeat") || clean.includes("more") ? 85 : 50);
  }

  const total = Math.round((meaningScore + vocabularyScore + positionScore + clarityScore) / 4);
  return { vocabularyScore, clarityScore, positionScore, meaningScore, total };
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored));
    } catch {}
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

export default function LanguageGoalOS() {
  const [ui, setUi] = useLocalStorage<UI>("lgos_ui", "ru");
  const [learnerType, setLearnerType] = useLocalStorage<LearnerType>("lgos_learner_type", "adult");
  const [schoolGrade, setSchoolGrade] = useLocalStorage<SchoolGrade>("lgos_school_grade", "5");
  const [textbookLine, setTextbookLine] = useLocalStorage<TextbookLine>("lgos_textbook_line", "spotlight");
  const [schoolMode, setSchoolMode] = useLocalStorage<SchoolMode>("lgos_school_mode", "summer-review");
  const [schoolTopic, setSchoolTopic] = useLocalStorage<string>("lgos_school_topic", "Present Simple / to be / have got");
  const [targetLang, setTargetLang] = useLocalStorage<TargetLang>("lgos_target_lang", "en");
  const [goal, setGoal] = useLocalStorage<GoalId>("lgos_goal", "new-country");
  const [level, setLevel] = useLocalStorage<LevelId>("lgos_level", "zero");
  const [activeTab, setActiveTab] = useState("start");
  const [attempt, setAttempt] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [helpOpens, setHelpOpens] = useState(0);
  const [attempts, setAttempts] = useLocalStorage<any[]>("lgos_attempts", []);
  const [generatedRoute, setGeneratedRoute] = useLocalStorage<GeneratedRoute | null>("lgos_generated_route", null);
  const [generatedRouteSource, setGeneratedRouteSource] = useLocalStorage<"openai" | "fallback" | "">("lgos_generated_route_source", "");
  const [mainFear, setMainFear] = useLocalStorage<string>("lgos_main_fear", "");
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [routeGenerationError, setRouteGenerationError] = useState("");
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [isAnalyzingAttempt, setIsAnalyzingAttempt] = useState(false);
  const [clientKey, setClientKey] = useLocalStorage<string>("lgos_client_key", "");
  const [syncStatus, setSyncStatus] = useState("");
  const [accessState, setAccessState] = useLocalStorage<AccessState>("lgos_access_state", defaultAccessState);
  const [betaFeedbackText, setBetaFeedbackText] = useLocalStorage<string>("lgos_beta_feedback_text", "");
  const [betaFeedbackSent, setBetaFeedbackSent] = useLocalStorage<boolean>("lgos_beta_feedback_sent", false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(uiText[ui].statusReady);
  const recognitionRef = useRef<any>(null);
  const recordingBaseRef = useRef<string>("");
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  const t = uiText[ui];
  const accessExpired = Boolean(accessState.enabled && accessState.expiresAt && new Date(accessState.expiresAt).getTime() < Date.now());
  const accessActive = Boolean(accessState.enabled && !accessExpired);
  const hasAllAccess = accessState.routes.includes("all");
  const canUseChild = hasAllAccess || accessState.routes.includes("school");
  const allowedAdultGoals = hasAllAccess ? goals : goals.filter((item) => accessState.routes.includes(item.id));
  const canUseAdult = hasAllAccess || allowedAdultGoals.length > 0;
  const accessLabel = accessState.enabled
    ? `${accessState.plan === "paid" ? (ui === "ru" ? "Оплачен" : "Paid") : ui === "ru" ? "Beta" : "Beta"}: ${accessState.routes.map((route) => routeNameForAccess(route, ui)).join(", ")}`
    : ui === "ru" ? "Доступ не активирован" : "Access not activated";
  const selectedGoal = goals.find((g) => g.id === goal)!;
  const routeTheme = getRouteTheme(learnerType, goal);
  const selectedLang = targetLanguages.find((l) => l.id === targetLang)!;
  const selectedSchoolGrade = schoolGrades.find((g) => g.id === schoolGrade)!;
  const selectedTextbook = textbookLines.find((book) => book.id === textbookLine)!;
  const selectedSchoolMode = schoolModes.find((mode) => mode.id === schoolMode)!;
  const displayGoal = learnerType === "child"
    ? { promiseRu: "Для ребёнка: короткая понятная задача, помощь без решебника и вывод для родителя.", promiseEn: "For a child: a short clear task, guided help, and a parent summary." }
    : selectedGoal;
  const generatedScenarios = useMemo(() => routeToScenarios(generatedRoute, goal, level), [generatedRoute, goal, level]);
  const routeScenarios = useMemo(() => {
    if (learnerType === "child") return schoolScenarios.filter((s) => s.level.includes(level));
    const base = scenarios.filter((s) => s.goal === goal && s.level.includes(level));
    return generatedScenarios.length > 0 ? generatedScenarios : base;
  }, [learnerType, goal, level, generatedScenarios]);
  const [activeScenarioId, setActiveScenarioId] = useState(routeScenarios[0]?.id || scenarios[0].id);

  useEffect(() => {
    const first = routeScenarios[0]?.id;
    if (first && !routeScenarios.some((s) => s.id === activeScenarioId)) setActiveScenarioId(first);
  }, [routeScenarios, activeScenarioId]);

  useEffect(() => {
    if (!accessActive) return;
    if (!canUseAdult && canUseChild && learnerType !== "child") {
      setLearnerType("child");
      setGoal("parent-child");
      setTargetLang("en");
      return;
    }
    if (!canUseChild && canUseAdult && learnerType !== "adult") {
      setLearnerType("adult");
      const firstGoal = allowedAdultGoals[0]?.id || "job";
      setGoal(firstGoal);
    }
    if (learnerType === "adult" && !hasAllAccess && allowedAdultGoals.length > 0 && !allowedAdultGoals.some((item) => item.id === goal)) {
      setGoal(allowedAdultGoals[0].id);
    }
  }, [accessActive, canUseAdult, canUseChild, learnerType, goal, hasAllAccess, allowedAdultGoals, setLearnerType, setGoal, setTargetLang]);

  useEffect(() => setRecordingStatus(uiText[ui].statusReady), [ui]);


  useEffect(() => {
    if (!clientKey) {
      const key = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `lgos-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setClientKey(key);
    }
  }, [clientKey, setClientKey]);

  useEffect(() => {
    if (!supabaseClient || !clientKey) {
      setSyncStatus(isSupabaseConfigured() ? "" : t.syncOff);
      return;
    }
    const db = supabaseClient!;
    let cancelled = false;
    async function loadCloudState() {
      setSyncStatus(t.syncSaving);
      const [{ data: profile }, { data: cloudAttempts, error }] = await Promise.all([
        db
          .from("user_profiles")
          .select("interface_language,target_language,goal,level")
          .eq("client_key", clientKey)
          .maybeSingle(),
        db
          .from("learning_attempts")
          .select("*")
          .eq("client_key", clientKey)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (cancelled) return;
      if (profile) {
        setUi(profile.interface_language as UI);
        setTargetLang(profile.target_language as TargetLang);
        setGoal(profile.goal as GoalId);
        setLevel(profile.level as LevelId);
      }
      if (cloudAttempts && cloudAttempts.length > 0) {
        setAttempts(
          cloudAttempts.map((row: any) => ({
            id: row.id,
            date: new Date(row.created_at).toLocaleString(),
            goal: row.goal,
            level: row.level,
            targetLang: row.target_language,
            scenarioId: row.scenario_id,
            scenarioTitle: row.scenario_title,
            answer: row.answer,
            total: row.score_total,
            vocabularyScore: row.score_vocabulary,
            positionScore: row.score_position,
            clarityScore: row.score_clarity,
            helpOpens: row.help_opens,
          }))
        );
      }
      setSyncStatus(error ? t.syncError : t.syncSaved);
    }

    loadCloudState();
    return () => {
      cancelled = true;
    };
  }, [supabaseClient, clientKey]);

  useEffect(() => {
    if (!supabaseClient || !clientKey) return;
    const db = supabaseClient!;
    const timer = setTimeout(async () => {
      setSyncStatus(t.syncSaving);
      const { error } = await db.from("user_profiles").upsert(
        {
          client_key: clientKey,
          interface_language: ui,
          target_language: targetLang,
          goal,
          level,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_key" }
      );
      setSyncStatus(error ? t.syncError : t.syncSaved);
    }, 500);

    return () => clearTimeout(timer);
  }, [supabaseClient, clientKey, ui, targetLang, goal, level]);

  const activeScenario = routeScenarios.find((s) => s.id === activeScenarioId) || scenarios.find((s) => s.id === activeScenarioId) || routeScenarios[0] || scenarios[0];
  const scoringGoal = activeScenario?.goal || goal;
  const score = useMemo(() => scoreAttempt(attempt, activeScenario, level, helpOpens, scoringGoal), [attempt, activeScenario, level, helpOpens, scoringGoal]);
  const scoreLabels = learnerType === "child"
    ? (ui === "ru" ? ["Понимание", "Самостоятельность", "Ясность"] : ["Understanding", "Independence", "Clarity"])
    : getScoreLabels(scoringGoal, ui);
  const metricOneValue = aiFeedback?.meaningScore ?? score.meaningScore;
  const metricTwoValue = scoringGoal === "authority" ? (aiFeedback?.positionScore ?? score.positionScore) : (aiFeedback?.vocabularyScore ?? score.vocabularyScore);
  const metricThreeValue = aiFeedback?.clarityScore ?? score.clarityScore;

  const fallbackFeedback: AiFeedback = {
    source: "fallback",
    totalScore: score.total,
    vocabularyScore: score.vocabularyScore,
    positionScore: score.positionScore,
    clarityScore: score.clarityScore,
    meaningScore: score.meaningScore,
    correctedAnswer: attempt,
    strongerVersion: activeScenario.stronger,
    feedbackRu: makeRuFeedback(score, level),
    feedbackEn: makeEnFeedback(score, level),
    nextActionRu: "Повторите сильную версию 3 раза вслух. Потом очистите поле и запишите ответ снова без подсказки.",
    nextActionEn: "Repeat the stronger version aloud 3 times. Then clear the field and record again without looking.",
    keyPhrasesToRepeat: [activeScenario.beginner, activeScenario.stronger].filter(Boolean),
  };

  const analyzeAttemptWithAI = async (): Promise<AiFeedback> => {
    try {
      const response = await fetch("/api/analyze-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interfaceLanguage: ui,
          targetLanguage: targetLang,
          goal: scoringGoal,
          level,
          metricLabels: getScoreLabels(scoringGoal, ui),
          transcript: attempt,
          scenario: {
            titleEn: activeScenario.titleEn,
            titleRu: activeScenario.titleRu,
            situationEn: activeScenario.situationEn,
            situationRu: activeScenario.situationRu,
            beginner: activeScenario.beginner,
            beginnerRu: activeScenario.beginnerRu,
            stronger: activeScenario.stronger,
            strongerRu: activeScenario.strongerRu,
            keywords: activeScenario.keywords,
            principleEn: activeScenario.principleEn,
            principleRu: activeScenario.principleRu,
          },
        }),
      });
      if (!response.ok) throw new Error("AI feedback failed");
      const data = (await response.json()) as AiFeedback;
      return data;
    } catch {
      return fallbackFeedback;
    }
  };

  const saveAttempt = async () => {
    if (!attempt.trim()) return;
    setIsAnalyzingAttempt(true);
    setShowFeedback(true);
    const feedback = await analyzeAttemptWithAI();
    setAiFeedback(feedback);
    setIsAnalyzingAttempt(false);

    const finalScores = {
      total: Math.round(feedback.totalScore ?? score.total),
      vocabularyScore: Math.round(feedback.vocabularyScore ?? score.vocabularyScore),
      positionScore: Math.round(feedback.positionScore ?? score.positionScore),
      clarityScore: Math.round(feedback.clarityScore ?? score.clarityScore),
      meaningScore: Math.round(feedback.meaningScore ?? score.meaningScore),
    };

    const row = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      learnerType,
      goal: scoringGoal,
      level,
      targetLang,
      scenarioId: activeScenario.id,
      scenarioTitle: ui === "ru" ? activeScenario.titleRu : activeScenario.titleEn,
      answer: attempt,
      ...finalScores,
      helpOpens,
      feedbackSource: feedback.source,
      nextAction: ui === "ru" ? feedback.nextActionRu : feedback.nextActionEn,
    };
    setAttempts([row, ...attempts]);

    const db = supabaseClient!;
    if (db && clientKey) {
      setSyncStatus(t.syncSaving);
      const { error } = await db.from("learning_attempts").insert({
        client_key: clientKey,
        goal: scoringGoal,
        level,
        target_language: targetLang,
        scenario_id: activeScenario.id,
        scenario_title: row.scenarioTitle,
        answer: attempt,
        score_total: finalScores.total,
        score_vocabulary: finalScores.vocabularyScore,
        score_position: finalScores.positionScore,
        score_clarity: finalScores.clarityScore,
        help_opens: helpOpens,
      });
      setSyncStatus(error ? t.syncError : t.syncSaved);
    }
  };

  const clearAllProgress = async () => {
    setAttempts([]);
    const db = supabaseClient!;
    if (db && clientKey) {
      setSyncStatus(t.syncSaving);
      const { error } = await db.from("learning_attempts").delete().eq("client_key", clientKey);
      setSyncStatus(error ? t.syncError : t.syncSaved);
    }
  };

  const generateAiRoute = async () => {
    setIsGeneratingRoute(true);
    setRouteGenerationError("");
    try {
      const response = await fetch("/api/generate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interfaceLanguage: ui, targetLanguage: targetLang, goal, level, mainFear, timeFrame: "30 days" }),
      });
      const data = (await response.json()) as GeneratedRouteResponse;
      if (!data?.route?.days?.length) throw new Error("Route is empty");
      setGeneratedRoute(data.route);
      setGeneratedRouteSource(data.source);
      const first = routeToScenarios(data.route, goal, level)[0];
      if (first) {
        setActiveScenarioId(first.id);
        setAttempt("");
        setShowFeedback(false);
        setAiFeedback(null);
      }
      if (data.warning) setRouteGenerationError(t.routeError);
    } catch (error: any) {
      setRouteGenerationError(error?.message || t.routeError);
    } finally {
      setIsGeneratingRoute(false);
    }
  };

  const startRoute = () => {
    const first = routeScenarios[0] || scenarios.find((s) => s.goal === goal) || scenarios[0];
    setActiveScenarioId(first.id);
    setAttempt("");
    setShowFeedback(false);
    setAiFeedback(null);
    setActiveTab("training");
  };

  const startScenario = (scenario: Scenario) => {
    setActiveScenarioId(scenario.id);
    setAttempt("");
    setShowFeedback(false);
    setAiFeedback(null);
    setActiveTab("training");
  };

  const nextScenario = () => {
    const currentIndex = routeScenarios.findIndex((s) => s.id === activeScenario.id);
    const next = routeScenarios[(currentIndex + 1) % routeScenarios.length] || routeScenarios[0] || scenarios[0];
    startScenario(next);
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingStatus(ui === "ru" ? "Распознавание речи не поддерживается здесь. Используйте ручной ввод." : "Speech recognition is not supported here. Use manual input.");
      return;
    }

    // Important: browser SpeechRecognition returns interim results many times.
    // If we append every interim result to the text area, the answer becomes duplicated:
    // "I... I am... I am product...". So we keep the text that existed before recording
    // as a base and replace the live transcript instead of appending every partial result.
    recordingBaseRef.current = attempt.trim();

    const recognition = new SpeechRecognition();
    recognition.lang = targetLang === "en" ? "en-US" : targetLang === "de" ? "de-DE" : targetLang === "es" ? "es-ES" : targetLang === "it" ? "it-IT" : targetLang === "ru" ? "ru-RU" : targetLang === "zh" ? "zh-CN" : "ko-KR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingStatus(ui === "ru" ? "Запись идёт. Говорите сейчас." : "Recording. Speak now.");
    };
    recognition.onresult = (event: any) => {
      const finalParts: string[] = [];
      const interimParts: string[] = [];

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.trim();
        if (!text) continue;
        if (event.results[i].isFinal) finalParts.push(text);
        else interimParts.push(text);
      }

      const liveTranscript = [...finalParts, ...interimParts].join(" ").replace(/\s+/g, " ").trim();
      const base = recordingBaseRef.current;
      setAttempt([base, liveTranscript].filter(Boolean).join(" ").trim());
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setRecordingStatus(ui === "ru" ? "Запись не запустилась. Используйте ручной ввод." : "Recording failed. Use manual input.");
    };
    recognition.onend = () => {
      setIsRecording(false);
      setRecordingStatus(ui === "ru" ? "Запись остановлена. Теперь проверьте ответ." : "Recording stopped. Analyze your answer now.");
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => recognitionRef.current?.stop?.();

  const speak = (text: string, slow = false) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang === "en" ? "en-US" : targetLang === "de" ? "de-DE" : targetLang === "es" ? "es-ES" : targetLang === "it" ? "it-IT" : targetLang === "ru" ? "ru-RU" : targetLang === "zh" ? "zh-CN" : "ko-KR";
    utterance.rate = slow ? 0.72 : 0.88;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const avg = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.total, 0) / attempts.length) : 0;
  const best = attempts.length ? Math.max(...attempts.map((item) => item.total)) : 0;
  const last = attempts[0]?.total || 0;
  const completedSituationMap = attempts.reduce<Record<string, (typeof attempts)[number]>>((acc, item) => {
    const score = Number(item.total) || 0;
    if (score < 70) return acc;
    const key = item.scenarioId || item.scenarioTitle;
    if (!acc[key]) acc[key] = item;
    return acc;
  }, {});
  const completedSituations = Object.values(completedSituationMap);
  const completionLabel = ui === "ru" ? "Ситуаций уже можно пройти" : "Situations you can handle";
  const completedLabel = ui === "ru" ? "Засчитано как реальная ситуация" : "Counted as a real-life situation";
  const isChildRoute = learnerType === "child";
  const childMissionPhrases = [activeScenario.beginner, activeScenario.stronger, "I can say it myself."]
    .filter((phrase, index, arr) => Boolean(phrase) && arr.indexOf(phrase) === index)
    .slice(0, 3);
  const childScore = aiFeedback?.totalScore ?? score.total;
  const childResultLabel = childScore >= 80
    ? (ui === "ru" ? "Получилось" : "Done")
    : childScore >= 55
      ? (ui === "ru" ? "Почти получилось" : "Almost there")
      : (ui === "ru" ? "Давай повторим" : "Let’s repeat");
  const childResultMessage = childScore >= 80
    ? (ui === "ru" ? "Отлично: смысл понятен. Теперь повтори фразу ещё раз без подсказки." : "Great: the meaning is clear. Now repeat the phrase once more without looking.")
    : childScore >= 55
      ? (ui === "ru" ? "Почти получилось. Повтори медленнее и попробуй ещё раз." : "Almost there. Repeat more slowly and try again.")
      : (ui === "ru" ? "Ничего страшного. Послушай фразу, скажи её вместе с помощником и запиши ещё раз." : "That is okay. Listen to the phrase, say it with the helper, and record again.");
  const childBotState: VoiceBotState = isRecording
    ? "listening"
    : showFeedback && childScore >= 80
      ? "success"
      : showFeedback && childScore >= 55
        ? "almost"
        : showFeedback
          ? "repeat"
          : "ready";
  const childBotMessage = childBotState === "listening"
    ? (ui === "ru" ? "Я слушаю. Скажи фразу спокойно, можно медленно." : "I am listening. Say the phrase calmly, slowly is okay.")
    : childBotState === "success"
      ? (ui === "ru" ? "Получилось. Теперь попробуй сказать ещё раз без подсказки." : "Done. Now try to say it again without looking.")
      : childBotState === "almost"
        ? (ui === "ru" ? "Почти получилось. Давай повторим медленнее вместе." : "Almost there. Let’s repeat it more slowly together.")
        : childBotState === "repeat"
          ? (ui === "ru" ? "Ничего страшного. Послушай фразу и попробуй ещё раз." : "That is okay. Listen to the phrase and try again.")
          : (ui === "ru" ? "Привет, я Lingua Buddy. Сначала послушай фразу, потом повтори голосом." : "Hi, I am Lingua Buddy. First listen to the phrase, then repeat it aloud.");

  if (!accessActive) {
    return (
      <AccessGate
        ui={ui}
        onUiChange={setUi}
        expired={accessExpired}
        previousCode={accessState.code}
        onUnlock={(nextAccess) => {
          setAccessState(nextAccess);
          setBetaFeedbackSent(false);
          setBetaFeedbackText("");
          if (nextAccess.routes.includes("school") && !nextAccess.routes.includes("all")) {
            setLearnerType("child");
            setGoal("parent-child");
            setTargetLang("en");
          } else {
            setLearnerType("adult");
            const firstRoute = nextAccess.routes.find((route) => route !== "all" && route !== "school") as GoalId | undefined;
            setGoal(firstRoute || "job");
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <header className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Badge className="mb-4 bg-orange-500 text-white hover:bg-orange-500">{t.productBadge}</Badge>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{t.title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-neutral-300">{t.subtitle}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 w-fit">
              <Languages className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-neutral-400">{t.interfaceLang}</span>
              <Button size="sm" variant={ui === "en" ? "default" : "outline"} className={ui === "en" ? "bg-orange-500 hover:bg-orange-600" : "border-neutral-700 bg-transparent text-neutral-100"} onClick={() => setUi("en")}>EN</Button>
              <Button size="sm" variant={ui === "ru" ? "default" : "outline"} className={ui === "ru" ? "bg-orange-500 hover:bg-orange-600" : "border-neutral-700 bg-transparent text-neutral-100"} onClick={() => setUi("ru")}>RU / РФ</Button>
              <HelpButton ui={ui} title={ui === "ru" ? "Как пользоваться" : "How to use"} body={ui === "ru" ? "Сначала выберите язык, цель и уровень. Потом каждый день проходите один сценарий: прочитать, сказать, записать, проверить, повторить сильную версию." : "Choose language, goal, and level. Then complete one daily scenario: read, speak, record, analyze, repeat the stronger version."} />
              <Badge variant="outline" className="border-neutral-700 text-neutral-300">
                {supabaseClient ? t.syncOn : t.syncOff}{syncStatus && ` · ${syncStatus}`}
              </Badge>
              <Badge variant="outline" className={`${routeTheme.border} ${routeTheme.text}`}>
                {accessLabel}
              </Badge>
              <Button size="sm" variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800" onClick={() => setAccessState(defaultAccessState)}>
                {ui === "ru" ? "Сменить доступ" : "Change access"}
              </Button>
            </div>
          </div>
          <Card className={`relative overflow-hidden border-neutral-800 bg-neutral-900 text-neutral-50 ${routeTheme.border}`}>
            <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full ${routeTheme.glow} blur-3xl`} />
            <CardContent className="relative z-10 p-6">
              <div className="mb-3 flex items-center gap-3"><Target className={`h-5 w-5 ${routeTheme.text}`} /><h2 className="text-2xl font-semibold">{t.targetTitle}</h2></div>
              <p className="mb-4 text-neutral-300">{t.targetSubtitle}</p>
              <Badge variant="outline" className={`${routeTheme.border} ${routeTheme.text} mb-4`}>{ui === "ru" ? routeTheme.badgeRu : routeTheme.badgeEn}</Badge>
              <Metric label={ui === "ru" ? "Маршрут выбран" : "Route selected"} value={goal ? 100 : 0} />
              <Metric label={ui === "ru" ? "Уровень задан" : "Level set"} value={level ? 100 : 0} />
              <Metric label={ui === "ru" ? "Сценарии доступны" : "Scenarios ready"} value={routeScenarios.length ? 100 : 0} />
            </CardContent>
          </Card>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {learnerType === "child" ? (
            <TabsList className="grid w-full grid-cols-2 bg-neutral-900 md:grid-cols-4">
              <TabsTrigger value="start">{ui === "ru" ? "Настройка" : "Setup"}</TabsTrigger>
              <TabsTrigger value="training">{ui === "ru" ? "Миссия" : "Mission"}</TabsTrigger>
              <TabsTrigger value="phrases">{ui === "ru" ? "Фразы" : "Phrases"}</TabsTrigger>
              <TabsTrigger value="progress">{ui === "ru" ? "Для родителя" : "For parent"}</TabsTrigger>
            </TabsList>
          ) : (
            <TabsList className="grid w-full grid-cols-2 bg-neutral-900 md:grid-cols-6">
              <TabsTrigger value="start">{t.start}</TabsTrigger>
              <TabsTrigger value="training">{t.training}</TabsTrigger>
              <TabsTrigger value="scenarios">{t.scenarios}</TabsTrigger>
              <TabsTrigger value="phrases">{t.phrases}</TabsTrigger>
              <TabsTrigger value="path">{t.path}</TabsTrigger>
              <TabsTrigger value="progress">{t.progress}</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="start">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Badge className="bg-orange-500 text-white hover:bg-orange-500">{ui === "ru" ? "Маршрут под цель" : "Goal route"}</Badge>
                    <HelpButton ui={ui} title={ui === "ru" ? "Зачем этот экран" : "Why this screen"} body={ui === "ru" ? "Это главный экран платформы. Он не про уроки. Он выясняет боль: зачем человеку нужен язык, какой язык он учит и с какого уровня начинает." : "This is the main platform screen. It identifies why the person needs the language, what language they learn, and their starting level."} />
                  </div>
                  <h2 className="mb-2 text-3xl font-semibold">{learnerType === "child" ? (ui === "ru" ? "Школьный английский" : "School English") : t.goalQuestion}</h2>
                  <p className="mb-6 text-neutral-300">
                    {learnerType === "child"
                      ? (ui === "ru" ? "Отдельный beta-маршрут для ребёнка: летнее повторение, понятные объяснения и прогресс для родителя. Взрослый маршрут не меняется." : "A separate beta route for a child: summer review, simple explanations, and parent progress. The adult flow stays unchanged.")
                      : t.goalSubtitle}
                  </p>

                  <SectionTitle icon={<Users className="h-5 w-5" />} title={ui === "ru" ? "Кто будет заниматься?" : "Who will study?"} />
                  <div className="mb-6 grid gap-3 md:grid-cols-2">
                    <button
                      disabled={!canUseAdult}
                      onClick={() => canUseAdult && setLearnerType("adult")}
                      className={`rounded-2xl border p-5 text-left transition ${!canUseAdult ? "cursor-not-allowed border-neutral-900 bg-neutral-950 opacity-40" : learnerType === "adult" ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}
                    >
                      <h3 className="mb-2 text-xl font-semibold">{ui === "ru" ? "Взрослый" : "Adult"}</h3>
                      <p className="text-neutral-400">{ui === "ru" ? "Работа, интервью, новая страна, живой разговор, профессиональная позиция." : "Work, interviews, new country, real conversation, professional authority."}</p>
                    </button>
                    <button
                      disabled={!canUseChild}
                      onClick={() => { if (!canUseChild) return; setLearnerType("child"); setTargetLang("en"); setGoal("parent-child"); }}
                      className={`rounded-2xl border p-5 text-left transition ${!canUseChild ? "cursor-not-allowed border-neutral-900 bg-neutral-950 opacity-40" : learnerType === "child" ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}
                    >
                      <h3 className="mb-2 text-xl font-semibold">{ui === "ru" ? "Ребёнок / школьник" : "Child / school student"}</h3>
                      <p className="text-neutral-400">{ui === "ru" ? "Школьный английский: повторить тему, понять правило, сделать задание осознанно." : "School English: review a topic, understand the rule, and work independently."}</p>
                    </button>
                  </div>

                  {learnerType === "adult" ? (
                    <>
                      <SectionTitle icon={<Languages className="h-5 w-5" />} title={t.targetLanguage} />
                      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {targetLanguages.map((lang) => (
                          <button key={lang.id} onClick={() => setTargetLang(lang.id)} className={`rounded-2xl border p-4 text-left transition ${targetLang === lang.id ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
                            <div className="text-lg font-semibold">{lang.flag} {ui === "ru" ? lang.ru : lang.en}</div>
                          </button>
                        ))}
                      </div>

                      <SectionTitle icon={<Map className="h-5 w-5" />} title={ui === "ru" ? "Выберите цель" : "Choose your goal"} />
                      <div className="mb-6 grid gap-4 md:grid-cols-2">
                        {allowedAdultGoals.map((item) => (
                          <button key={item.id} onClick={() => setGoal(item.id)} className={`rounded-2xl border p-5 text-left transition ${goal === item.id ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
                            <h3 className="mb-2 text-xl font-semibold">{ui === "ru" ? item.ru : item.en}</h3>
                            <p className="mb-3 text-neutral-400">{ui === "ru" ? item.descRu : item.descEn}</p>
                            <p className="text-sm text-orange-300">{ui === "ru" ? item.promiseRu : item.promiseEn}</p>
                          </button>
                        ))}
                      </div>

                      <SectionTitle icon={<Brain className="h-5 w-5" />} title={t.levelQuestion} />
                      <div className="mb-6 grid gap-3 md:grid-cols-4">
                        {levels.map((item) => (
                          <button key={item.id} onClick={() => setLevel(item.id)} className={`rounded-2xl border p-4 text-left transition ${level === item.id ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
                            <div className="mb-2 font-semibold">{ui === "ru" ? item.ru : item.en}</div>
                            <p className="text-sm text-neutral-400">{ui === "ru" ? item.descRu : item.descEn}</p>
                          </button>
                        ))}
                      </div>

                      <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                        <div className="mb-3 flex items-center gap-2 text-orange-300"><Brain className="h-5 w-5" /> <span className="font-semibold">{t.aiGenerator}</span></div>
                        <label className="mb-2 block text-sm text-neutral-300">{t.mainFearLabel}</label>
                        <Textarea
                          value={mainFear}
                          onChange={(e) => setMainFear(e.target.value)}
                          placeholder={t.mainFearPlaceholder}
                          className="mb-4 min-h-24 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600"
                        />
                        <div className="flex flex-wrap gap-3">
                          <Button onClick={generateAiRoute} disabled={isGeneratingRoute} className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50">
                            <Brain className="mr-2 h-4 w-4" />{isGeneratingRoute ? t.generatingRoute : t.generateRoute}
                          </Button>
                          {generatedRoute && <Badge className="bg-neutral-800 text-neutral-200 hover:bg-neutral-800">{t.generatedRoute}</Badge>}
                        </div>
                        {generatedRouteSource && (
                          <p className="mt-3 text-sm text-neutral-400">{generatedRouteSource === "openai" ? t.routeSourceOpenAI : t.routeSourceFallback}</p>
                        )}
                        {routeGenerationError && <p className="mt-3 text-sm text-orange-300">{routeGenerationError}</p>}
                      </div>

                      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                        <div className="mb-3 text-neutral-300">{t.selected}: <b>{selectedLang.flag} {ui === "ru" ? selectedLang.ru : selectedLang.en}</b> · <b>{ui === "ru" ? selectedGoal.ru : selectedGoal.en}</b> · <b>{levels.find((l) => l.id === level)?.[ui === "ru" ? "ru" : "en"]}</b></div>
                        {!generatedRoute && targetLang !== "en" && (
                          <div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-100">{t.aiLater}</div>
                        )}
                        <Button onClick={startRoute} className="w-full bg-orange-500 text-white hover:bg-orange-600 md:w-auto"><Play className="mr-2 h-4 w-4" />{t.startRoute}</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
                        <div className="mb-2 text-sm font-semibold text-orange-300">{ui === "ru" ? "Летняя beta-логика" : "Summer beta logic"}</div>
                        <p className="text-neutral-100">
                          {ui === "ru"
                            ? "Сейчас каникулы, поэтому школьный маршрут подаём не как домашку, а как мягкое повторение: 10 минут в день, одна тема, одна попытка, понятный вывод для родителя."
                            : "During summer, the school route is positioned as soft review: 10 minutes a day, one topic, one attempt, and a clear parent summary."}
                        </p>
                      </div>

                      <SectionTitle icon={<BookOpen className="h-5 w-5" />} title={ui === "ru" ? "Класс ребёнка" : "Child grade"} />
                      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {schoolGrades.map((item) => (
                          <button key={item.id} onClick={() => setSchoolGrade(item.id)} className={`rounded-2xl border p-4 text-left transition ${schoolGrade === item.id ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
                            <div className="mb-2 text-lg font-semibold">{item.label}</div>
                            <p className="text-sm text-neutral-400">{ui === "ru" ? item.noteRu : item.noteEn}</p>
                          </button>
                        ))}
                      </div>

                      <SectionTitle icon={<BookOpen className="h-5 w-5" />} title={ui === "ru" ? "Учебник / УМК" : "Textbook line"} />
                      <div className="mb-6 grid gap-3 md:grid-cols-2">
                        {textbookLines.map((item) => (
                          <button key={item.id} onClick={() => setTextbookLine(item.id)} className={`rounded-2xl border p-4 text-left transition ${textbookLine === item.id ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
                            <div className="font-semibold">{ui === "ru" ? item.ru : item.en}</div>
                          </button>
                        ))}
                      </div>

                      <SectionTitle icon={<Brain className="h-5 w-5" />} title={ui === "ru" ? "Что нужно сейчас?" : "What do you need now?"} />
                      <div className="mb-6 grid gap-3 md:grid-cols-2">
                        {schoolModes.map((item) => (
                          <button key={item.id} onClick={() => setSchoolMode(item.id)} className={`rounded-2xl border p-5 text-left transition ${schoolMode === item.id ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
                            <h3 className="mb-2 font-semibold">{ui === "ru" ? item.ru : item.en}</h3>
                            <p className="text-sm text-neutral-400">{ui === "ru" ? item.descRu : item.descEn}</p>
                          </button>
                        ))}
                      </div>

                      <SectionTitle icon={<Brain className="h-5 w-5" />} title={ui === "ru" ? "Стартовый уровень ребёнка" : "Child starting level"} />
                      <div className="mb-6 grid gap-3 md:grid-cols-4">
                        {levels.map((item) => (
                          <button key={item.id} onClick={() => setLevel(item.id)} className={`rounded-2xl border p-4 text-left transition ${level === item.id ? "border-orange-400 bg-orange-500/15" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
                            <div className="mb-2 font-semibold">{ui === "ru" ? item.ru : item.en}</div>
                            <p className="text-sm text-neutral-400">{ui === "ru" ? item.descRu : item.descEn}</p>
                          </button>
                        ))}
                      </div>

                      <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                        <label className="mb-2 block text-sm text-neutral-300">{ui === "ru" ? "Какая тема или сложность сейчас важна?" : "Which topic or difficulty matters now?"}</label>
                        <Textarea
                          value={schoolTopic}
                          onChange={(e) => setSchoolTopic(e.target.value)}
                          placeholder={ui === "ru" ? "Например: Present Simple, чтение, слова по модулю, вопросы" : "For example: Present Simple, reading, module vocabulary, questions"}
                          className="min-h-24 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600"
                        />
                      </div>

                      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                        <div className="mb-3 text-neutral-300">
                          {t.selected}: <b>{selectedSchoolGrade.label}</b> · <b>{ui === "ru" ? selectedTextbook.ru : selectedTextbook.en}</b> · <b>{ui === "ru" ? selectedSchoolMode.ru : selectedSchoolMode.en}</b>
                        </div>
                        <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
                          {ui === "ru" ? "Важно: это не решебник. Платформа объясняет и ведёт ребёнка к самостоятельному ответу." : "Important: this is not an answer key. The platform explains and guides the child toward independent work."}
                        </div>
                        <Button onClick={startRoute} className="w-full bg-orange-500 text-white hover:bg-orange-600 md:w-auto"><Play className="mr-2 h-4 w-4" />{ui === "ru" ? "Начать школьный маршрут" : "Start school route"}</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <RouteWorkspaceCard ui={ui} theme={routeTheme} learnerType={learnerType} selectedGoal={selectedGoal} selectedLang={selectedLang} schoolGrade={selectedSchoolGrade.label} textbook={ui === "ru" ? selectedTextbook.ru : selectedTextbook.en} />
              {learnerType === "child" && <ParentDashboardPreview ui={ui} theme={routeTheme} />}
              <DailyPlanCard ui={ui} goal={displayGoal} t={t} scenario={activeScenario} />
            </div>
          </TabsContent>

          <TabsContent value="training">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <Badge className="mb-3 bg-neutral-800 text-neutral-200 hover:bg-neutral-800">{ui === "ru" ? activeScenario.typeRu : activeScenario.typeEn}</Badge>
                      <h2 className="text-2xl font-semibold">{ui === "ru" ? activeScenario.titleRu : activeScenario.titleEn}</h2>
                    </div>
                    <HelpButton ui={ui} title={ui === "ru" ? "Как проходить тренировку" : "How to train"} body={ui === "ru" ? "Сначала прочитайте ситуацию. Потом произнесите минимальный ответ. Затем запишите свою версию, нажмите проверку и повторите сильную версию." : "Read the situation, say the beginner answer, record your version, analyze it, then repeat the stronger version."} />
                  </div>
                  <InfoBlock label={t.founderSays} text={ui === "ru" ? activeScenario.situationRu : activeScenario.situationEn} />
                  <div className="mt-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
                    <div className="mb-2 text-sm font-medium text-orange-300">{t.beginnerAnswer}</div>
                    <p className="text-xl text-neutral-100">{activeScenario.beginner}</p>
                    <p className="mt-2 text-neutral-400">{activeScenario.beginnerRu}</p>
                    <PronunciationHelp ui={ui} text={activeScenario.readRu} onOpen={() => setHelpOpens((v) => v + 1)} />
                  </div>

                  {isChildRoute && (
                    <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="mb-1 text-sm font-medium text-amber-300">{ui === "ru" ? "Голосовая мини-миссия" : "Voice mini-mission"}</div>
                          <h3 className="text-xl font-semibold text-neutral-100">{ui === "ru" ? "Скажи 3 фразы голосом" : "Say 3 phrases aloud"}</h3>
                        </div>
                        <Badge variant="outline" className="border-amber-500/40 text-amber-200">5 min</Badge>
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-neutral-300">
                        {ui === "ru"
                          ? "Для ребёнка это не тест. Это короткая миссия: послушать, повторить, попробовать самому и получить мягкий фидбек."
                          : "For a child, this is not a test. It is a short mission: listen, repeat, try alone, and get soft feedback."}
                      </p>
                      <div className="mb-4 rounded-2xl border border-amber-500/30 bg-neutral-950 p-4">
                        <VoiceBot
                          ui={ui}
                          state="ready"
                          compact
                          message={ui === "ru" ? "Я помогу пройти миссию: сначала слушаем, потом повторяем, потом пробуем сами." : "I will help with the mission: first we listen, then repeat, then try alone."}
                          phrase={activeScenario.beginner}
                          onListen={() => speak(activeScenario.beginner, true)}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        {childMissionPhrases.map((phrase, index) => (
                          <div key={phrase} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
                              {ui === "ru" ? `Фраза ${index + 1}` : `Phrase ${index + 1}`}
                            </div>
                            <p className="mb-3 text-neutral-100">{phrase}</p>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" onClick={() => speak(phrase, true)} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800">
                                <Volume2 className="mr-2 h-4 w-4" />{ui === "ru" ? "Послушать" : "Listen"}
                              </Button>
                              {index === 0 && (
                                <Button size="sm" onClick={startRecording} disabled={isRecording} className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50">
                                  <Mic className="mr-2 h-4 w-4" />{ui === "ru" ? "Повторить" : "Repeat"}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
                        {ui === "ru"
                          ? "Детский режим: сначала важен смысл и смелость сказать вслух. Идеальное произношение — не цель первого шага."
                          : "Child mode: meaning and courage to speak come first. Perfect pronunciation is not the first goal."}
                      </div>
                    </div>
                  )}

                  <InfoBlock label={t.principle} text={ui === "ru" ? activeScenario.principleRu : activeScenario.principleEn} orange />
                  <div className="mt-5 text-sm text-neutral-400">{t.whySimple}</div>
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3"><Mic className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">{isChildRoute ? (ui === "ru" ? "Говорим голосом" : "Voice mission") : t.voiceMode}</h2></div>
                  <p className="mb-4 text-neutral-400">
                    {isChildRoute
                      ? (ui === "ru" ? "Ребёнок может просто сказать ответ голосом. Если микрофон не сработал, взрослый может вписать фразу вручную." : "The child can simply say the answer aloud. If the microphone fails, an adult can type the phrase manually.")
                      : t.typeManual}
                  </p>
                  {isChildRoute && (
                    <VoiceBot
                      ui={ui}
                      state={childBotState}
                      message={childBotMessage}
                      phrase={activeScenario.beginner}
                      onListen={() => speak(activeScenario.beginner, true)}
                    />
                  )}
                  {isChildRoute && (
                    <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-medium text-emerald-300">{ui === "ru" ? "Мягкая проверка для ребёнка" : "Soft check for the child"}</div>
                        <HelpButton
                          ui={ui}
                          title={ui === "ru" ? "Что увидит ребёнок?" : "What will the child see?"}
                          body={ui === "ru"
                            ? "После проверки ребёнок видит короткий результат без строгих оценок: получилось, почти получилось или давай повторим. Подробные баллы и выводы показываются ниже в блоке для родителя."
                            : "After analysis, the child sees a short result without strict scores: done, almost there, or let’s repeat. Detailed scores and insights are shown below for the parent."}
                        />
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-200">
                        {ui === "ru"
                          ? "Сначала важно, чтобы ребёнок смело сказал фразу голосом. Подробный разбор будет отдельно для взрослого."
                          : "First, the child only needs to say the phrase aloud. Detailed analysis is separated for the adult."}
                      </p>
                    </div>
                  )}
                  <Textarea value={attempt} onChange={(e) => setAttempt(e.target.value)} placeholder={ui === "ru" ? "Здесь появится расшифровка или ручной ввод..." : "Transcript or manual input appears here..."} className="min-h-36 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600" />
                  <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <p className="mb-4 text-sm text-neutral-500">{recordingStatus}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={startRecording} disabled={isRecording} className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"><Mic className="mr-2 h-4 w-4" />{t.record}</Button>
                      <Button onClick={stopRecording} disabled={!isRecording} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800 disabled:opacity-50"><Square className="mr-2 h-4 w-4" />{t.stop}</Button>
                      <Button onClick={() => { setAttempt(""); recordingBaseRef.current = ""; }} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800">{t.clear}</Button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={saveAttempt} className="bg-orange-500 text-white hover:bg-orange-600"><Brain className="mr-2 h-4 w-4" />{t.analyze}</Button>
                    <Button onClick={nextScenario} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800"><RefreshCw className="mr-2 h-4 w-4" />{t.next}</Button>
                  </div>

                  {showFeedback && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                      {isAnalyzingAttempt && <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-100">{t.aiAnalyzing}</div>}
                      {isChildRoute && (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                          <div className="mb-2 text-sm font-medium text-amber-300">{ui === "ru" ? "Результат для ребёнка" : "Result for the child"}</div>
                          <h3 className="text-3xl font-semibold text-neutral-100">{childResultLabel}</h3>
                          <p className="mt-3 text-neutral-300">{childResultMessage}</p>
                        </div>
                      )}
                      {!isChildRoute && (
                        <div className="grid gap-3 md:grid-cols-4">
                          <Score label={t.total} value={aiFeedback?.totalScore ?? score.total} />
                          <Score label={scoreLabels[0]} value={metricOneValue} />
                          <Score label={scoreLabels[1]} value={metricTwoValue} />
                          <Score label={scoreLabels[2]} value={metricThreeValue} />
                        </div>
                      )}
                      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-orange-300">{t.stronger}</div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => speak(aiFeedback?.strongerVersion || activeScenario.stronger, true)} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800"><Volume2 className="mr-2 h-4 w-4" />Slow</Button>
                            <Button size="sm" onClick={() => speak(aiFeedback?.strongerVersion || activeScenario.stronger)} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800"><Volume2 className="mr-2 h-4 w-4" />{t.listen}</Button>
                          </div>
                        </div>
                        <p className="text-xl leading-relaxed text-neutral-100">{aiFeedback?.strongerVersion || activeScenario.stronger}</p>
                        <p className="mt-3 text-neutral-400"><span className="text-orange-300">{t.translation}:</span> {activeScenario.strongerRu}</p>
                        <PronunciationHelp ui={ui} text={activeScenario.strongerReadRu} onOpen={() => setHelpOpens((v) => v + 1)} />
                      </div>
                      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                        <div className="mb-2 text-sm font-medium text-neutral-300">{isChildRoute ? (ui === "ru" ? "Подробно для родителя" : "Details for the parent") : t.aiFeedback}</div>
                        {aiFeedback?.source === "fallback" && <p className="mb-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-100">{t.aiFallback}</p>}
                        <p className="text-neutral-300">{ui === "ru" ? (aiFeedback?.feedbackRu || makeRuFeedback(score, level)) : (aiFeedback?.feedbackEn || makeEnFeedback(score, level))}</p>
                        {aiFeedback?.correctedAnswer && (
                          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                            <div className="mb-2 text-sm text-orange-300">{t.corrected}</div>
                            <p className="text-neutral-100">{aiFeedback.correctedAnswer}</p>
                          </div>
                        )}
                        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                          <div className="mb-2 text-sm text-orange-300">{t.nextAction}</div>
                          <p className="text-neutral-100">{ui === "ru" ? (aiFeedback?.nextActionRu || fallbackFeedback.nextActionRu) : (aiFeedback?.nextActionEn || fallbackFeedback.nextActionEn)}</p>
                        </div>
                        {!!aiFeedback?.keyPhrasesToRepeat?.length && (
                          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                            <div className="mb-2 text-sm text-orange-300">{t.repeatPhrases}</div>
                            <ul className="space-y-1 text-sm text-neutral-200">{aiFeedback.keyPhrasesToRepeat.map((phrase) => <li key={phrase}>• {phrase}</li>)}</ul>
                          </div>
                        )}
                        {isChildRoute && (
                          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <div className="mb-3 text-sm text-emerald-300">{ui === "ru" ? "Вывод для родителя" : "Parent summary"}</div>
                            <div className="mb-4 grid gap-3 md:grid-cols-4">
                              <Score label={t.total} value={aiFeedback?.totalScore ?? score.total} />
                              <Score label={scoreLabels[0]} value={metricOneValue} />
                              <Score label={scoreLabels[1]} value={metricTwoValue} />
                              <Score label={scoreLabels[2]} value={metricThreeValue} />
                            </div>
                            <p className="text-neutral-100">
                              {ui === "ru"
                                ? `Сегодня ребёнок потренировал тему: ${activeScenario.titleRu}. Результат: ${childResultLabel}. Повторить завтра: ${activeScenario.beginner}.`
                                : `Today the child practiced: ${activeScenario.titleEn}. Result: ${childResultLabel}. Repeat tomorrow: ${activeScenario.beginner}.`}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scenarios">
            <div className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-neutral-300">
              {ui === "ru" ? "Сценарии показываются под выбранную цель и уровень." : "Scenarios are filtered by selected goal and level."} <b>{selectedLang.flag} {ui === "ru" ? selectedLang.ru : selectedLang.en}</b> · <b>{ui === "ru" ? selectedGoal.ru : selectedGoal.en}</b>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routeScenarios.map((s) => (
                <Card key={s.id} className="border-neutral-800 bg-neutral-900 text-neutral-50">
                  <CardContent className="p-5">
                    <Badge className="mb-3 bg-neutral-800 text-neutral-200 hover:bg-neutral-800">{ui === "ru" ? s.typeRu : s.typeEn}</Badge>
                    <h3 className="mb-3 text-xl font-semibold">{ui === "ru" ? s.titleRu : s.titleEn}</h3>
                    <p className="mb-4 text-neutral-400">{ui === "ru" ? s.situationRu : s.situationEn}</p>
                    <Button onClick={() => startScenario(s)} className="w-full bg-orange-500 text-white hover:bg-orange-600"><Play className="mr-2 h-4 w-4" />{ui === "ru" ? "Начать тренировку" : "Practice"}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="phrases">
            <Card className="border-neutral-800 bg-neutral-900 text-neutral-50">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3"><BookOpen className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">{t.phrases}</h2></div>
                <div className="grid gap-4 md:grid-cols-2">
                  {routeScenarios.flatMap((s) => [
                    { phrase: s.beginner, translation: s.beginnerRu, pronunciation: s.readRu, kind: t.beginnerAnswer },
                    { phrase: s.stronger, translation: s.strongerRu, pronunciation: s.strongerReadRu, kind: t.stronger },
                  ]).slice(0, 8).map((item, index) => (
                    <div key={item.phrase + index} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                      <Badge variant="outline" className="mb-3 border-orange-500/40 text-orange-300">{item.kind}</Badge>
                      <p className="mb-2 text-lg font-medium text-neutral-100">{item.phrase}</p>
                      <p className="text-sm text-neutral-400">{item.translation}</p>
                      <PronunciationHelp ui={ui} text={item.pronunciation} onOpen={() => setHelpOpens((v) => v + 1)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="path">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6">
                <h2 className="mb-2 text-2xl font-semibold">{generatedRoute ? (ui === "ru" ? generatedRoute.routeTitleRu : generatedRoute.routeTitle) : t.routeStructure}</h2>
                {generatedRoute && <p className="mb-5 text-neutral-400">{ui === "ru" ? generatedRoute.summaryRu : generatedRoute.summary}</p>}
                <div className="space-y-4">
                  {generatedRoute ? generatedRoute.days.map((d) => (
                    <GeneratedDayCard key={d.day} day={d} ui={ui} t={t} onPractice={() => startScenario(routeToScenarios(generatedRoute, goal, level).find((s) => s.id === `ai-day-${d.day}`) || routeToScenarios(generatedRoute, goal, level)[0])} />
                  )) : routeDays.map((d) => <div key={d.day} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><Badge variant="outline" className="mb-3 border-orange-500/40 text-orange-300">Day {d.day}</Badge><p className="text-neutral-100">{ui === "ru" ? d.ru : d.en}</p></div>)}
                </div>
              </CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6">
                <h2 className="mb-5 text-2xl font-semibold">{ui === "ru" ? "Как система адаптируется" : "How the system adapts"}</h2>
                <div className="space-y-4 text-neutral-300">
                  <AdaptiveLine title="Level 0" text={ui === "ru" ? "1 фраза, перевод, скрытая подсказка чтения, медленное повторение." : "1 phrase, translation, hidden pronunciation help, slow repetition."} />
                  <AdaptiveLine title="A1" text={ui === "ru" ? "2–3 варианта ответа, короткий диалог, простые вопросы." : "2–3 answer options, short dialogue, simple questions."} />
                  <AdaptiveLine title="A2" text={ui === "ru" ? "Живые сценарии, разные ответы собеседника, письмо или сообщение." : "Live scenarios, different responses, email or message."} />
                  <AdaptiveLine title="B1+" text={ui === "ru" ? "Возражения, неожиданные вопросы, role-play, созвон, самостоятельный ответ." : "Objections, unexpected questions, role-play, calls, independent answer."} />
                </div>
              </CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">{t.progress}</h2></div>{attempts.length > 0 && <Button variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800" onClick={clearAllProgress}>{t.clearProgress}</Button>}</div>
              <div className="mb-6 grid gap-3 md:grid-cols-4"><Score label={completionLabel} value={completedSituations.length} /><Score label={t.attempts} value={attempts.length} /><Score label={t.avg} value={avg} /><Score label={t.best} value={best} /></div>
              {learnerType === "child" && (
                <ParentProgressDashboard ui={ui} theme={routeTheme} attempts={attempts} activeScenario={activeScenario} childResultLabel={childResultLabel} />
              )}
              {completedSituations.length > 0 && (
                <div className="mb-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
                  <div className="mb-3 text-sm font-medium text-orange-300">{completionLabel}</div>
                  <ul className="space-y-2 text-neutral-100">
                    {completedSituations.slice(0, 6).map((item: any) => <li key={item.id}>• {item.scenarioTitle} <span className="text-neutral-400">— {item.total}/100</span></li>)}
                  </ul>
                </div>
              )}
              {attempts.length >= 3 && (
                <BetaFeedbackPanel
                  ui={ui}
                  sent={betaFeedbackSent}
                  value={betaFeedbackText}
                  onChange={setBetaFeedbackText}
                  onSend={() => setBetaFeedbackSent(true)}
                />
              )}
              {attempts.length === 0 ? <p className="text-neutral-400">{t.noAttempts}</p> : <div className="space-y-4">{attempts.map((item) => <div key={item.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 flex items-center justify-between gap-3"><h3 className="font-semibold text-neutral-100">{item.scenarioTitle}</h3><Badge className={(Number(item.total) || 0) >= 70 ? "bg-orange-500 hover:bg-orange-500" : "bg-neutral-700 hover:bg-neutral-700"}>{(Number(item.total) || 0) >= 70 ? `${completedLabel} · ` : ""}{item.total}/100</Badge></div><p className="mb-2 text-sm text-neutral-500">{item.date}</p><p className="text-neutral-300">{item.answer}</p></div>)}</div>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


function AccessGate({ ui, onUiChange, onUnlock, expired, previousCode }: { ui: UI; onUiChange: (ui: UI) => void; onUnlock: (access: AccessState) => void; expired: boolean; previousCode: string }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const activate = () => {
    const resolved = resolveAccessCode(code);
    if (!resolved) {
      setError(ui === "ru" ? "Код не найден. Проверьте код или запросите beta-доступ через сайт." : "Code not found. Check the code or request beta access through the website.");
      return;
    }
    onUnlock({
      enabled: true,
      code: resolved.code,
      plan: resolved.preset.plan,
      routes: resolved.preset.routes,
      name: name.trim(),
      contact: contact.trim(),
      expiresAt: resolved.expiresAt,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-[1.05fr_0.95fr] md:px-8">
        <div>
          <Badge className="mb-4 bg-orange-500 text-white hover:bg-orange-500">Managed Beta Product</Badge>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Language Goal OS</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">
            {ui === "ru"
              ? "Вход открыт по beta-коду или оплаченному доступу. Так мы связываем заявку, маршрут, тест, feedback и решение о монетизации."
              : "Access is opened by beta code or paid access. This connects application, route, testing, feedback, and monetization decision."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="sm" variant={ui === "ru" ? "default" : "outline"} className={ui === "ru" ? "bg-orange-500 hover:bg-orange-600" : "border-neutral-700 bg-transparent text-neutral-100"} onClick={() => onUiChange("ru")}>RU / РФ</Button>
            <Button size="sm" variant={ui === "en" ? "default" : "outline"} className={ui === "en" ? "bg-orange-500 hover:bg-orange-600" : "border-neutral-700 bg-transparent text-neutral-100"} onClick={() => onUiChange("en")}>EN</Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"><div className="text-sm text-neutral-500">1</div><div className="mt-1 font-semibold">{ui === "ru" ? "Заявка" : "Application"}</div></div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"><div className="text-sm text-neutral-500">2</div><div className="mt-1 font-semibold">{ui === "ru" ? "Beta-код" : "Beta code"}</div></div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"><div className="text-sm text-neutral-500">3</div><div className="mt-1 font-semibold">{ui === "ru" ? "Маршрут + feedback" : "Route + feedback"}</div></div>
          </div>
        </div>

        <Card className="border-neutral-800 bg-neutral-900 text-neutral-50 shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-orange-400" />
              <div>
                <h2 className="text-2xl font-semibold">{ui === "ru" ? "Активировать доступ" : "Activate access"}</h2>
                <p className="text-sm text-neutral-400">{ui === "ru" ? "Введите код, который выдали после заявки или оплаты." : "Enter the code issued after application or payment."}</p>
              </div>
            </div>
            {expired && (
              <div className="mb-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-100">
                {ui === "ru" ? `Доступ по коду ${previousCode} закончился. Введите новый код.` : `Access for code ${previousCode} has expired. Enter a new code.`}
              </div>
            )}
            <div className="space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={ui === "ru" ? "Имя" : "Name"} className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-orange-500" />
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={ui === "ru" ? "Email или Telegram" : "Email or Telegram"} className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-orange-500" />
              <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }} placeholder="SCHOOL-BETA-001" className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 font-mono text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-orange-500" />
              {error && <p className="text-sm text-orange-300">{error}</p>}
              <Button onClick={activate} className="w-full bg-orange-500 py-6 text-base font-semibold text-white hover:bg-orange-600">
                {ui === "ru" ? "Открыть маршрут" : "Open route"}
              </Button>
            </div>
            <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-400">
              {ui === "ru"
                ? "Для бесплатного beta-теста код выдаётся вручную после заявки. Для платного запуска этот экран будет открываться автоматически после оплаты."
                : "For free beta, the code is issued manually after application. For paid launch, this screen will open automatically after payment."}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BetaFeedbackPanel({ ui, sent, value, onChange, onSend }: { ui: UI; sent: boolean; value: string; onChange: (value: string) => void; onSend: () => void }) {
  if (sent) {
    return (
      <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <div className="mb-2 font-semibold text-emerald-300">{ui === "ru" ? "Feedback сохранён" : "Feedback saved"}</div>
        <p className="text-neutral-300">{ui === "ru" ? "В beta-версии это локальная фиксация. Для публичного теста подключим Make → Google Sheets → Telegram." : "In beta this is stored locally. For public testing we will connect Make → Google Sheets → Telegram."}</p>
      </div>
    );
  }
  return (
    <div className="mb-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
      <div className="mb-2 font-semibold text-orange-300">{ui === "ru" ? "Помогите улучшить маршрут" : "Help improve the route"}</div>
      <p className="mb-4 text-sm leading-relaxed text-neutral-300">
        {ui === "ru"
          ? "Вы уже прошли несколько тренировок. Напишите, что было полезно, где возникло непонимание и готовы ли вы платить за такой формат."
          : "You have completed several practices. Write what was useful, what was unclear, and whether you would pay for this format."}
      </p>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="mb-3 min-h-28 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600" placeholder={ui === "ru" ? "Что было полезно? Что мешало? Какая цена кажется нормальной?" : "What was useful? What blocked you? What price feels fair?"} />
      <Button onClick={onSend} className="bg-orange-500 text-white hover:bg-orange-600">{ui === "ru" ? "Сохранить feedback" : "Save feedback"}</Button>
    </div>
  );
}


function normalizePhraseKey(text: string) {
  return text.toLowerCase().replace(/[’']/g, "").replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim();
}

const pronunciationHintsRu: Record<string, string> = {
  "what is your budget": "Уот из ёр баджет?",
  "can we adjust the price": "Кэн уи эджаст зэ прайс?",
  "what do you need": "Уот ду ю ниид?",
  "can you explain your requirements": "Кэн ю иксплэйн ёр реквайрмэнтс?",
  "our price is 3000": "Ауэр прайс из сри таузэнд.",
  "this price includes services": "Зис прайс инклюдс сёрвисэз.",
  "i understand your concern": "Ай андэрстэнд ёр консёрн.",
  "we offer value for this price": "Уи офэр вэлью фор зис прайс.",
  "i am a product and decision architect": "Ай эм э продакт энд дисижн архитэкт.",
  "i need to understand the product first": "Ай ниид ту андэрстэнд зэ продакт фёрст.",
  "sorry i dont understand can you repeat please": "Сори, ай доунт андэрстэнд. Кэн ю рипит, плиз?",
  "hello": "Хэллоу.",
  "thank you": "Сэнк ю.",
  "give me a moment please": "Гив ми э моумэнт, плиз.",
};

function getSafePronunciationRu(phrase: string, fallbackPronunciation: string, fallbackPhrase?: string) {
  const key = normalizePhraseKey(phrase);
  const fallbackKey = fallbackPhrase ? normalizePhraseKey(fallbackPhrase) : "";

  if (pronunciationHintsRu[key]) return pronunciationHintsRu[key];

  // Use the supplied pronunciation only when it belongs to the same phrase.
  // This prevents wrong hints like “Can we adjust the price?” → “Уот из ёр баджет?”.
  if (fallbackKey && key === fallbackKey) return fallbackPronunciation;

  return "Подсказка чтения для этой фразы пока не добавлена. Используйте кнопку Slow / Слушать и повторите фразу по аудио.";
}

function routeToScenarios(route: GeneratedRoute | null, goal: GoalId, level: LevelId): Scenario[] {
  if (!route?.days?.length) return [];
  return route.days.map((day) => ({
    id: `ai-day-${day.day}`,
    goal,
    level: [level],
    typeEn: `AI Route · Day ${day.day}`,
    typeRu: `AI-маршрут · День ${day.day}`,
    titleEn: day.scenarioTitle,
    titleRu: day.scenarioTitleRu,
    situationEn: day.situation,
    situationRu: day.situationRu,
    beginner: day.beginnerPhrase,
    beginnerRu: day.beginnerTranslationRu,
    readRu: day.pronunciationRu,
    stronger: day.strongerPhrase,
    strongerRu: day.strongerTranslationRu,
    strongerReadRu: getSafePronunciationRu(day.strongerPhrase, day.pronunciationRu, day.beginnerPhrase),
    keywords: [...day.dailyPhrases, ...day.emergencyPhrases]
      .join(" ")
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean)
      .slice(0, 8),
    principleEn: day.successCriteria,
    principleRu: day.successCriteriaRu,
    emergency: day.day <= 7,
  }));
}

function GeneratedDayCard({ day, ui, t, onPractice }: { day: GeneratedRouteDay; ui: UI; t: any; onPractice: () => void }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Badge variant="outline" className="border-orange-500/40 text-orange-300">{t.day} {day.day}</Badge>
        <Button size="sm" onClick={onPractice} className="bg-orange-500 text-white hover:bg-orange-600">
          <Play className="mr-2 h-4 w-4" />{t.startDay}
        </Button>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-100">{ui === "ru" ? day.scenarioTitleRu : day.scenarioTitle}</h3>
      <p className="mb-4 text-neutral-400">{ui === "ru" ? day.focusRu : day.focus}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-2 text-sm text-orange-300">{t.dailyPhrases}</div>
          <ul className="space-y-1 text-sm text-neutral-200">{day.dailyPhrases.map((phrase) => <li key={phrase}>• {phrase}</li>)}</ul>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-2 text-sm text-orange-300">{t.emergencyPhrases}</div>
          <ul className="space-y-1 text-sm text-neutral-200">{day.emergencyPhrases.map((phrase) => <li key={phrase}>• {phrase}</li>)}</ul>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-2 text-sm text-orange-300">{t.successCriteria}</div>
        <p className="text-sm text-neutral-300">{ui === "ru" ? day.successCriteriaRu : day.successCriteria}</p>
      </div>
    </div>
  );
}

function makeRuFeedback(score: any, level: LevelId) {
  if (score.total < 35) return "Начни с минимального ответа. Тебе не нужно говорить идеально. Скажи одну понятную фразу и повтори её 3 раза.";
  if (score.vocabularyScore < 45) return "Смысл уже появляется. Теперь добавь 1–2 ключевых слова из сценария, чтобы ответ звучал точнее.";
  if (score.clarityScore < 50) return "Ответ нужно сделать понятнее: кто, что нужно, какой следующий шаг. Не усложняй.";
  return level === "zero" ? "Хорошо для старта. Теперь попробуй сказать ту же мысль без подсказки." : "Хороший ответ. Следующий шаг — сказать это естественнее и быстрее в живом диалоге.";
}
function makeEnFeedback(score: any, level: LevelId) {
  if (score.total < 35) return "Start with the beginner answer. You do not need to be perfect. Say one clear phrase and repeat it 3 times.";
  if (score.vocabularyScore < 45) return "The meaning is starting to appear. Add 1–2 key scenario words to make the answer stronger.";
  if (score.clarityScore < 50) return "Make the answer clearer: who, what you need, and the next step. Keep it simple.";
  return level === "zero" ? "Good start. Now try to say the same idea without help." : "Good answer. Next step: make it more natural and faster in a live dialogue.";
}

function RouteWorkspaceCard({ ui, theme, learnerType, selectedGoal, selectedLang, schoolGrade, textbook }: { ui: UI; theme: RouteTheme; learnerType: LearnerType; selectedGoal: any; selectedLang: any; schoolGrade: string; textbook: string }) {
  const isChild = learnerType === "child";
  return (
    <Card className={`relative overflow-hidden border ${theme.border} bg-neutral-900 text-neutral-50`}>
      <div className={`absolute -right-20 -top-20 h-56 w-56 rounded-full ${theme.glow} blur-3xl`} />
      <CardContent className="relative z-10 p-6">
        <Badge className={`mb-4 bg-gradient-to-r ${theme.gradient} text-black hover:opacity-90`}>{ui === "ru" ? theme.badgeRu : theme.badgeEn}</Badge>
        <h2 className="mb-3 text-2xl font-semibold">{ui === "ru" ? theme.nameRu : theme.nameEn}</h2>
        <p className="mb-5 leading-relaxed text-neutral-300">{ui === "ru" ? theme.promiseRu : theme.promiseEn}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800 bg-black/25 p-4">
            <div className="mb-1 text-xs uppercase tracking-widest text-neutral-500">{ui === "ru" ? "Страница после оплаты" : "After-payment workspace"}</div>
            <div className="font-semibold text-neutral-100">{isChild ? (ui === "ru" ? "Кабинет родителя + детская миссия" : "Parent dashboard + child mission") : (ui === "ru" ? selectedGoal.ru : selectedGoal.en)}</div>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-black/25 p-4">
            <div className="mb-1 text-xs uppercase tracking-widest text-neutral-500">{ui === "ru" ? "Настройка" : "Setup"}</div>
            <div className="font-semibold text-neutral-100">{isChild ? `${schoolGrade} · ${textbook}` : `${selectedLang.flag} ${ui === "ru" ? selectedLang.ru : selectedLang.en}`}</div>
          </div>
        </div>
        <div className={`mt-5 rounded-2xl border ${theme.border} ${theme.softBg} p-4`}>
          <div className={`mb-2 text-sm font-medium ${theme.text}`}>{ui === "ru" ? "Архитектурное решение" : "Architecture decision"}</div>
          <p className="text-sm leading-relaxed text-neutral-200">
            {isChild
              ? (ui === "ru" ? "У ребёнка не будет перегруженного интерфейса: только миссия, Buddy, фраза и мягкий результат. Подробная статистика остаётся у родителя." : "The child does not see a complex interface: only the mission, Buddy, phrase, and soft result. Detailed analytics stays with the parent.")
              : (ui === "ru" ? "Каждый взрослый маршрут сохраняет свой визуальный тон, сценарии, критерии оценки и ежедневный план." : "Each adult route keeps its own visual tone, scenarios, scoring criteria, and daily plan.")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ParentDashboardPreview({ ui, theme }: { ui: UI; theme: RouteTheme }) {
  return (
    <Card className={`border ${theme.border} bg-neutral-900 text-neutral-50`}>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Users className={`h-5 w-5 ${theme.text}`} />
          <h2 className="text-2xl font-semibold">{ui === "ru" ? "Кабинет родителя" : "Parent dashboard"}</h2>
        </div>
        <p className="mb-5 text-neutral-300">
          {ui === "ru" ? "Родитель видит динамику, темы, попытки, ошибки и рекомендацию на завтра. Ребёнок видит только лёгкую голосовую миссию." : "The parent sees dynamics, topics, attempts, mistakes, and tomorrow’s recommendation. The child sees only a simple voice mission."}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[ui === "ru" ? "Темы повторены" : "Topics reviewed", ui === "ru" ? "Попытки ребёнка" : "Child attempts", ui === "ru" ? "Что повторить" : "What to repeat", ui === "ru" ? "Рекомендация" : "Recommendation"].map((item) => (
            <div key={item} className="rounded-2xl border border-neutral-800 bg-black/25 p-4 text-neutral-200">{item}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ParentProgressDashboard({ ui, theme, attempts, activeScenario, childResultLabel }: { ui: UI; theme: RouteTheme; attempts: any[]; activeScenario: Scenario; childResultLabel: string }) {
  const childAttempts = attempts.filter((item) => item.learnerType === "child" || item.goal === "parent-child");
  const average = childAttempts.length ? Math.round(childAttempts.reduce((sum, item) => sum + (Number(item.total) || 0), 0) / childAttempts.length) : 0;
  const strongAttempts = childAttempts.filter((item) => (Number(item.total) || 0) >= 70).length;
  const lastTopic = childAttempts[0]?.scenarioTitle || (ui === "ru" ? activeScenario.titleRu : activeScenario.titleEn);

  return (
    <div className={`mb-6 rounded-2xl border ${theme.border} ${theme.softBg} p-5`}>
      <div className="mb-4 flex items-center gap-3">
        <BarChart3 className={`h-5 w-5 ${theme.text}`} />
        <div>
          <h3 className="text-xl font-semibold text-neutral-100">{ui === "ru" ? "Динамика ребёнка" : "Child dynamics"}</h3>
          <p className="text-sm text-neutral-400">{ui === "ru" ? "Этот блок видит родитель, не ребёнок." : "This block is for the parent, not for the child."}</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Score label={ui === "ru" ? "Занятий" : "Sessions"} value={childAttempts.length} />
        <Score label={ui === "ru" ? "Средний результат" : "Average"} value={average} />
        <Score label={ui === "ru" ? "Уверенных попыток" : "Confident attempts"} value={strongAttempts} />
        <Score label={ui === "ru" ? "Сегодня" : "Today"} value={Math.round(Number(childAttempts[0]?.total) || 0)} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-800 bg-black/25 p-4">
          <div className={`mb-2 text-sm font-medium ${theme.text}`}>{ui === "ru" ? "Последняя тема" : "Latest topic"}</div>
          <p className="text-neutral-100">{lastTopic}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-black/25 p-4">
          <div className={`mb-2 text-sm font-medium ${theme.text}`}>{ui === "ru" ? "Что повторить завтра" : "Repeat tomorrow"}</div>
          <p className="text-neutral-100">{activeScenario.beginner}</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-neutral-800 bg-black/25 p-4">
        <div className={`mb-2 text-sm font-medium ${theme.text}`}>{ui === "ru" ? "Вывод для родителя" : "Parent insight"}</div>
        <p className="text-neutral-200">
          {ui === "ru"
            ? `Сейчас результат ребёнка: ${childResultLabel}. Сохраняем мягкую подачу для ребёнка, а подробную динамику показываем взрослому.`
            : `Current child result: ${childResultLabel}. The child keeps a soft experience, while detailed dynamics are shown to the adult.`}
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="mb-3"><div className="mb-1 flex justify-between text-sm text-neutral-400"><span>{label}</span><span>{value}%</span></div><Progress value={value} /></div>; }
type VoiceBotState = "ready" | "listening" | "success" | "almost" | "repeat";

function VoiceBot({ ui, state, message, phrase, onListen, compact = false }: { ui: UI; state: VoiceBotState; message: string; phrase?: string; onListen?: () => void; compact?: boolean }) {
  const stateStyles: Record<VoiceBotState, { ring: string; glow: string; labelRu: string; labelEn: string; face: string }> = {
    ready: { ring: "border-sky-400/40", glow: "bg-sky-400/20", labelRu: "Готов помочь", labelEn: "Ready to help", face: "•‿•" },
    listening: { ring: "border-orange-400/60", glow: "bg-orange-400/25", labelRu: "Слушаю", labelEn: "Listening", face: "◕‿◕" },
    success: { ring: "border-emerald-400/60", glow: "bg-emerald-400/25", labelRu: "Получилось", labelEn: "Done", face: "＾‿＾" },
    almost: { ring: "border-amber-400/60", glow: "bg-amber-400/25", labelRu: "Почти", labelEn: "Almost", face: "•ᴗ•" },
    repeat: { ring: "border-violet-400/60", glow: "bg-violet-400/25", labelRu: "Повторим", labelEn: "Repeat", face: "•_•" },
  };
  const style = stateStyles[state];
  const isActive = state === "listening";

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${style.ring} bg-neutral-950 ${compact ? "p-4" : "p-5"}`}>
      <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-full ${style.glow} blur-3xl`} />
      <div className="relative z-10 flex items-start gap-4">
        <motion.div
          animate={isActive ? { scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] } : state === "success" ? { y: [0, -4, 0] } : { scale: 1 }}
          transition={{ duration: isActive ? 1.1 : 0.7, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
          className={`relative flex ${compact ? "h-16 w-16" : "h-20 w-20"} shrink-0 items-center justify-center rounded-3xl border ${style.ring} bg-gradient-to-br from-neutral-800 to-neutral-950 shadow-2xl`}
        >
          {isActive && (
            <motion.span
              className="absolute inset-0 rounded-3xl border border-orange-400/40"
              animate={{ scale: [1, 1.35], opacity: [0.65, 0] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          )}
          <Bot className={`${compact ? "h-7 w-7" : "h-9 w-9"} text-orange-300`} />
          <div className="absolute -bottom-2 rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-neutral-200">{style.face}</div>
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-orange-500/40 text-orange-200">Lingua Buddy</Badge>
            <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-neutral-400">{ui === "ru" ? style.labelRu : style.labelEn}</span>
          </div>
          <p className={`${compact ? "text-sm" : "text-base"} leading-relaxed text-neutral-200`}>{message}</p>
          {phrase && (
            <div className="mt-3 rounded-xl border border-neutral-800 bg-black/30 p-3">
              <p className="text-xs uppercase tracking-widest text-neutral-500">{ui === "ru" ? "Фраза миссии" : "Mission phrase"}</p>
              <p className="mt-1 font-medium text-neutral-100">{phrase}</p>
            </div>
          )}
          {onListen && (
            <Button size="sm" onClick={onListen} variant="outline" className="mt-3 border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800">
              <Volume2 className="mr-2 h-4 w-4" />{ui === "ru" ? "Послушать с Buddy" : "Listen with Buddy"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) { const safeValue = Math.round(Number(value) || 0); return <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-1 text-3xl font-semibold text-neutral-100">{safeValue}</div><Progress value={Math.min(100, safeValue)} className="mt-3" /></div>; }
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-100"> <span className="text-orange-400">{icon}</span>{title}</div>; }
function InfoBlock({ label, text, orange = false }: { label: string; text: string; orange?: boolean }) { return <div className={`mt-5 rounded-2xl border p-5 ${orange ? "border-orange-500/30 bg-orange-500/10" : "border-neutral-800 bg-neutral-950"}`}><div className={`mb-2 text-sm font-medium ${orange ? "text-orange-300" : "text-neutral-400"}`}>{label}</div><p className="text-lg leading-relaxed text-neutral-100">{text}</p></div>; }
function HelpButton({ ui, title, body }: { ui: UI; title: string; body: string }) { const [open, setOpen] = useState(false); return <div className="relative"><Button size="sm" variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800" onClick={() => setOpen((v) => !v)}><HelpCircle className="mr-2 h-4 w-4" />{title}</Button>{open && <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300 shadow-2xl"><div className="mb-2 font-semibold text-neutral-100">{title}</div>{body}</div>}</div>; }
function PronunciationHelp({ ui, text, onOpen }: { ui: UI; text: string; onOpen: () => void }) { const [open, setOpen] = useState(false); return <div className="mt-4"><button className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-orange-300 hover:bg-neutral-800" onClick={() => { const next = !open; setOpen(next); if (next) onOpen(); }}>▸ {ui === "ru" ? "Сомневаюсь, как прочитать" : "Not sure how to pronounce it"}</button>{open && <p className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-neutral-300">{text}</p>}</div>; }
function AdaptiveLine({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 text-orange-300">{title}</div><p>{text}</p></div>; }
function DailyPlanCard({ ui, goal, t, scenario }: { ui: UI; goal: any; t: any; scenario: Scenario }) { return <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><Badge className="mb-4 bg-orange-500 text-white hover:bg-orange-500">{t.today}</Badge><h2 className="mb-2 text-3xl font-semibold">{ui === "ru" ? "Ежедневный план без хаоса" : "Daily plan without chaos"}</h2><p className="mb-5 text-neutral-300">{t.todayPlan}</p><div className="space-y-4"><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 text-sm text-orange-300">{t.scenario}</div><p className="text-neutral-100">{ui === "ru" ? scenario.titleRu : scenario.titleEn}</p></div><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 text-sm text-orange-300">{t.phraseSet}</div><p className="text-neutral-300">1. {scenario.beginner}</p><p className="text-neutral-300">2. {scenario.stronger}</p><p className="text-neutral-300">3. Sorry, can you repeat, please?</p></div><div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><div className="mb-2 text-sm text-orange-300">{ui === "ru" ? "Психологическая опора" : "Psychological support"}</div><p className="text-neutral-100">{ui === "ru" ? goal.promiseRu : goal.promiseEn}</p></div></div></CardContent></Card>; }
