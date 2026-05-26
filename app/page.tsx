"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  BookOpen,
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
  Volume2,
} from "lucide-react";

type UI = "ru" | "en";
type GoalId = "authority" | "new-country" | "job" | "parent-child" | "conversation";
type LevelId = "zero" | "a1" | "a2" | "b1";
type TargetLang = "en" | "es" | "it" | "de" | "zh" | "ko" | "ru";

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
    total: "Общий балл",
    vocab: "Слова",
    authority: "Позиция",
    clarity: "Ясность",
    pronunciation: "Сомневаюсь, как прочитать",
    translation: "Перевод смысла",
    routeStructure: "Структура 30-дневного маршрута",
    aiLater: "AI-слой позже будет генерировать сценарии, озвучку и фидбек под выбранный язык и уровень.",
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
    total: "Total",
    vocab: "Vocabulary",
    authority: "Position",
    clarity: "Clarity",
    pronunciation: "Not sure how to pronounce it",
    translation: "Meaning translation",
    routeStructure: "30-day route structure",
    aiLater: "Later, the AI layer will generate scenarios, voice, and feedback for the selected language and level.",
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

const levels: { id: LevelId; ru: string; en: string; descRu: string; descEn: string }[] = [
  { id: "zero", ru: "Уровень 0", en: "Zero", descRu: "Почти не говорю. Нужны короткие безопасные фразы.", descEn: "I almost do not speak. I need short safe phrases." },
  { id: "a1", ru: "A1", en: "A1", descRu: "Понимаю отдельные слова и могу сказать простые фразы.", descEn: "I understand some words and can say simple phrases." },
  { id: "a2", ru: "A2", en: "A2", descRu: "Могу говорить, но теряюсь в живом диалоге.", descEn: "I can speak, but I freeze in real dialogue." },
  { id: "b1", ru: "B1+", en: "B1+", descRu: "Хочу звучать увереннее, точнее и взрослее.", descEn: "I want to sound more confident, precise, and mature." },
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

function scoreAttempt(text: string, scenario: Scenario, level: LevelId, helpOpens: number) {
  const clean = text.toLowerCase();
  const matched = scenario.keywords.filter((word) => clean.includes(word.toLowerCase())).length;
  const vocabularyScore = Math.min(100, Math.round((matched / Math.max(1, scenario.keywords.length)) * 100));
  const clarityBase = Math.min(100, Math.max(15, Math.round(text.trim().length / (level === "zero" ? 1.4 : 2.2))));
  const structureSignals = ["because", "before", "first", "please", "need", "can", "could", "understand", "thank"];
  const structureScore = Math.min(100, structureSignals.filter((word) => clean.includes(word)).length * 12 + 25);
  const supportPenalty = Math.min(15, helpOpens * 3);
  const clarityScore = Math.max(10, Math.round((clarityBase + structureScore) / 2) - supportPenalty);
  const positionSignals = ["need", "clarify", "understand", "repeat", "please", "risk", "architecture", "value", "appointment"];
  const positionScore = Math.min(100, positionSignals.filter((word) => clean.includes(word)).length * 12 + 20);
  const total = Math.round((vocabularyScore + clarityScore + positionScore) / 3);
  return { vocabularyScore, clarityScore, positionScore, total };
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
  const [targetLang, setTargetLang] = useLocalStorage<TargetLang>("lgos_target_lang", "en");
  const [goal, setGoal] = useLocalStorage<GoalId>("lgos_goal", "new-country");
  const [level, setLevel] = useLocalStorage<LevelId>("lgos_level", "zero");
  const [activeTab, setActiveTab] = useState("start");
  const [attempt, setAttempt] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [helpOpens, setHelpOpens] = useState(0);
  const [attempts, setAttempts] = useLocalStorage<any[]>("lgos_attempts", []);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(uiText[ui].statusReady);
  const recognitionRef = useRef<any>(null);

  const t = uiText[ui];
  const selectedGoal = goals.find((g) => g.id === goal)!;
  const selectedLang = targetLanguages.find((l) => l.id === targetLang)!;
  const routeScenarios = useMemo(() => scenarios.filter((s) => s.goal === goal && s.level.includes(level)), [goal, level]);
  const [activeScenarioId, setActiveScenarioId] = useState(routeScenarios[0]?.id || scenarios[0].id);

  useEffect(() => {
    const first = routeScenarios[0]?.id;
    if (first && !routeScenarios.some((s) => s.id === activeScenarioId)) setActiveScenarioId(first);
  }, [routeScenarios, activeScenarioId]);

  useEffect(() => setRecordingStatus(uiText[ui].statusReady), [ui]);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || routeScenarios[0] || scenarios[0];
  const score = useMemo(() => scoreAttempt(attempt, activeScenario, level, helpOpens), [attempt, activeScenario, level, helpOpens]);

  const saveAttempt = () => {
    if (!attempt.trim()) return;
    const row = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      goal,
      level,
      targetLang,
      scenarioId: activeScenario.id,
      scenarioTitle: ui === "ru" ? activeScenario.titleRu : activeScenario.titleEn,
      answer: attempt,
      ...score,
      helpOpens,
    };
    setAttempts([row, ...attempts]);
    setShowFeedback(true);
  };

  const startRoute = () => {
    const first = routeScenarios[0] || scenarios.find((s) => s.goal === goal) || scenarios[0];
    setActiveScenarioId(first.id);
    setAttempt("");
    setShowFeedback(false);
    setActiveTab("training");
  };

  const startScenario = (scenario: Scenario) => {
    setActiveScenarioId(scenario.id);
    setAttempt("");
    setShowFeedback(false);
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
    const recognition = new SpeechRecognition();
    recognition.lang = targetLang === "en" ? "en-US" : targetLang === "de" ? "de-DE" : targetLang === "es" ? "es-ES" : targetLang === "it" ? "it-IT" : targetLang === "ru" ? "ru-RU" : targetLang === "zh" ? "zh-CN" : "ko-KR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingStatus(ui === "ru" ? "Запись идёт. Говорите сейчас." : "Recording. Speak now.");
    };
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setAttempt((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
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
            </div>
          </div>
          <Card className="border-neutral-800 bg-neutral-900 text-neutral-50">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3"><Target className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">{t.targetTitle}</h2></div>
              <p className="mb-5 text-neutral-300">{t.targetSubtitle}</p>
              <Metric label={ui === "ru" ? "Маршрут выбран" : "Route selected"} value={goal ? 100 : 0} />
              <Metric label={ui === "ru" ? "Уровень задан" : "Level set"} value={level ? 100 : 0} />
              <Metric label={ui === "ru" ? "Сценарии доступны" : "Scenarios ready"} value={routeScenarios.length ? 100 : 0} />
            </CardContent>
          </Card>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-900 md:grid-cols-6">
            <TabsTrigger value="start">{t.start}</TabsTrigger>
            <TabsTrigger value="training">{t.training}</TabsTrigger>
            <TabsTrigger value="scenarios">{t.scenarios}</TabsTrigger>
            <TabsTrigger value="phrases">{t.phrases}</TabsTrigger>
            <TabsTrigger value="path">{t.path}</TabsTrigger>
            <TabsTrigger value="progress">{t.progress}</TabsTrigger>
          </TabsList>

          <TabsContent value="start">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Badge className="bg-orange-500 text-white hover:bg-orange-500">{ui === "ru" ? "Маршрут под цель" : "Goal route"}</Badge>
                    <HelpButton ui={ui} title={ui === "ru" ? "Зачем этот экран" : "Why this screen"} body={ui === "ru" ? "Это главный экран платформы. Он не про уроки. Он выясняет боль: зачем человеку нужен язык, какой язык он учит и с какого уровня начинает." : "This is the main platform screen. It identifies why the person needs the language, what language they learn, and their starting level."} />
                  </div>
                  <h2 className="mb-2 text-3xl font-semibold">{t.goalQuestion}</h2>
                  <p className="mb-6 text-neutral-300">{t.goalSubtitle}</p>

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
                    {goals.map((item) => (
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

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                    <div className="mb-3 text-neutral-300">{t.selected}: <b>{selectedLang.flag} {ui === "ru" ? selectedLang.ru : selectedLang.en}</b> · <b>{ui === "ru" ? selectedGoal.ru : selectedGoal.en}</b> · <b>{levels.find((l) => l.id === level)?.[ui === "ru" ? "ru" : "en"]}</b></div>
                    {targetLang !== "en" && (
                      <div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-100">{t.aiLater}</div>
                    )}
                    <Button onClick={startRoute} className="w-full bg-orange-500 text-white hover:bg-orange-600 md:w-auto"><Play className="mr-2 h-4 w-4" />{t.startRoute}</Button>
                  </div>
                </CardContent>
              </Card>

              <DailyPlanCard ui={ui} goal={selectedGoal} t={t} scenario={activeScenario} />
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
                  <InfoBlock label={t.principle} text={ui === "ru" ? activeScenario.principleRu : activeScenario.principleEn} orange />
                  <div className="mt-5 text-sm text-neutral-400">{t.whySimple}</div>
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3"><Mic className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">{t.voiceMode}</h2></div>
                  <p className="mb-4 text-neutral-400">{t.typeManual}</p>
                  <Textarea value={attempt} onChange={(e) => setAttempt(e.target.value)} placeholder={ui === "ru" ? "Здесь появится расшифровка или ручной ввод..." : "Transcript or manual input appears here..."} className="min-h-36 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600" />
                  <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <p className="mb-4 text-sm text-neutral-500">{recordingStatus}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={startRecording} disabled={isRecording} className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"><Mic className="mr-2 h-4 w-4" />{t.record}</Button>
                      <Button onClick={stopRecording} disabled={!isRecording} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800 disabled:opacity-50"><Square className="mr-2 h-4 w-4" />{t.stop}</Button>
                      <Button onClick={() => setAttempt("")} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800">{t.clear}</Button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={saveAttempt} className="bg-orange-500 text-white hover:bg-orange-600"><Brain className="mr-2 h-4 w-4" />{t.analyze}</Button>
                    <Button onClick={nextScenario} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800"><RefreshCw className="mr-2 h-4 w-4" />{t.next}</Button>
                  </div>

                  {showFeedback && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                      <div className="grid gap-3 md:grid-cols-4">
                        <Score label={t.total} value={score.total} />
                        <Score label={t.vocab} value={score.vocabularyScore} />
                        <Score label={t.authority} value={score.positionScore} />
                        <Score label={t.clarity} value={score.clarityScore} />
                      </div>
                      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-orange-300">{t.stronger}</div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => speak(activeScenario.stronger, true)} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800"><Volume2 className="mr-2 h-4 w-4" />Slow</Button>
                            <Button size="sm" onClick={() => speak(activeScenario.stronger)} variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800"><Volume2 className="mr-2 h-4 w-4" />{t.listen}</Button>
                          </div>
                        </div>
                        <p className="text-xl leading-relaxed text-neutral-100">{activeScenario.stronger}</p>
                        <p className="mt-3 text-neutral-400"><span className="text-orange-300">{t.translation}:</span> {activeScenario.strongerRu}</p>
                        <PronunciationHelp ui={ui} text={activeScenario.strongerReadRu} onOpen={() => setHelpOpens((v) => v + 1)} />
                      </div>
                      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                        <div className="mb-2 text-sm font-medium text-neutral-300">{t.feedbackTitle}</div>
                        <p className="text-neutral-400">{ui === "ru" ? makeRuFeedback(score, level) : makeEnFeedback(score, level)}</p>
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
                  {routeScenarios.flatMap((s) => [s.beginner, s.stronger]).slice(0, 8).map((phrase, index) => (
                    <div key={phrase + index} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                      <Badge variant="outline" className="mb-3 border-orange-500/40 text-orange-300">{index % 2 === 0 ? t.beginnerAnswer : t.stronger}</Badge>
                      <p className="mb-2 text-lg font-medium text-neutral-100">{phrase}</p>
                      <p className="text-sm text-neutral-400">{index % 2 === 0 ? routeScenarios[Math.floor(index / 2)]?.beginnerRu : routeScenarios[Math.floor(index / 2)]?.strongerRu}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="path">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6">
                <h2 className="mb-5 text-2xl font-semibold">{t.routeStructure}</h2>
                <div className="space-y-4">{routeDays.map((d) => <div key={d.day} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><Badge variant="outline" className="mb-3 border-orange-500/40 text-orange-300">Day {d.day}</Badge><p className="text-neutral-100">{ui === "ru" ? d.ru : d.en}</p></div>)}</div>
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
              <div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">{t.progress}</h2></div>{attempts.length > 0 && <Button variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800" onClick={() => setAttempts([])}>{t.clearProgress}</Button>}</div>
              <div className="mb-6 grid gap-3 md:grid-cols-4"><Score label={t.attempts} value={attempts.length} /><Score label={t.avg} value={avg} /><Score label={t.best} value={best} /><Score label={t.last} value={last} /></div>
              {attempts.length === 0 ? <p className="text-neutral-400">{t.noAttempts}</p> : <div className="space-y-4">{attempts.map((item) => <div key={item.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 flex items-center justify-between gap-3"><h3 className="font-semibold text-neutral-100">{item.scenarioTitle}</h3><Badge className="bg-orange-500 hover:bg-orange-500">{item.total}/100</Badge></div><p className="mb-2 text-sm text-neutral-500">{item.date}</p><p className="text-neutral-300">{item.answer}</p></div>)}</div>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
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
function Metric({ label, value }: { label: string; value: number }) { return <div className="mb-3"><div className="mb-1 flex justify-between text-sm text-neutral-400"><span>{label}</span><span>{value}%</span></div><Progress value={value} /></div>; }
function Score({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="text-sm text-neutral-500">{label}</div><div className="mt-1 text-3xl font-semibold text-neutral-100">{value}</div><Progress value={Math.min(100, value)} className="mt-3" /></div>; }
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-100"> <span className="text-orange-400">{icon}</span>{title}</div>; }
function InfoBlock({ label, text, orange = false }: { label: string; text: string; orange?: boolean }) { return <div className={`mt-5 rounded-2xl border p-5 ${orange ? "border-orange-500/30 bg-orange-500/10" : "border-neutral-800 bg-neutral-950"}`}><div className={`mb-2 text-sm font-medium ${orange ? "text-orange-300" : "text-neutral-400"}`}>{label}</div><p className="text-lg leading-relaxed text-neutral-100">{text}</p></div>; }
function HelpButton({ ui, title, body }: { ui: UI; title: string; body: string }) { const [open, setOpen] = useState(false); return <div className="relative"><Button size="sm" variant="outline" className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800" onClick={() => setOpen((v) => !v)}><HelpCircle className="mr-2 h-4 w-4" />{title}</Button>{open && <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300 shadow-2xl"><div className="mb-2 font-semibold text-neutral-100">{title}</div>{body}</div>}</div>; }
function PronunciationHelp({ ui, text, onOpen }: { ui: UI; text: string; onOpen: () => void }) { const [open, setOpen] = useState(false); return <div className="mt-4"><button className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-orange-300 hover:bg-neutral-800" onClick={() => { const next = !open; setOpen(next); if (next) onOpen(); }}>▸ {ui === "ru" ? "Сомневаюсь, как прочитать" : "Not sure how to pronounce it"}</button>{open && <p className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-neutral-300">{text}</p>}</div>; }
function AdaptiveLine({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 text-orange-300">{title}</div><p>{text}</p></div>; }
function DailyPlanCard({ ui, goal, t, scenario }: { ui: UI; goal: any; t: any; scenario: Scenario }) { return <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><Badge className="mb-4 bg-orange-500 text-white hover:bg-orange-500">{t.today}</Badge><h2 className="mb-2 text-3xl font-semibold">{ui === "ru" ? "Ежедневный план без хаоса" : "Daily plan without chaos"}</h2><p className="mb-5 text-neutral-300">{t.todayPlan}</p><div className="space-y-4"><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 text-sm text-orange-300">{t.scenario}</div><p className="text-neutral-100">{ui === "ru" ? scenario.titleRu : scenario.titleEn}</p></div><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 text-sm text-orange-300">{t.phraseSet}</div><p className="text-neutral-300">1. {scenario.beginner}</p><p className="text-neutral-300">2. {scenario.stronger}</p><p className="text-neutral-300">3. Sorry, can you repeat, please?</p></div><div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><div className="mb-2 text-sm text-orange-300">{ui === "ru" ? "Психологическая опора" : "Psychological support"}</div><p className="text-neutral-100">{ui === "ru" ? goal.promiseRu : goal.promiseEn}</p></div></div></CardContent></Card>; }
