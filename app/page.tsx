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
import { Mic, Square, Play, RefreshCw, Target, Brain, MessageSquare, Trophy, BookOpen, ShieldCheck, BarChart3, Volume2 } from "lucide-react";

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
  founderLine: string;
  beginnerAnswer: string;
  targetAnswer: string;
  vocabulary: string[];
  authorityPrinciple: string;
};

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
    founderLine: "Can you just tell me how much it will cost to build the app?",
    beginnerAnswer: "I need to understand the product first.",
    targetAnswer:
      "Before I estimate the build, I need to understand the product logic, user roles, data structure, and risk points. Otherwise, the estimate would look precise but be strategically unreliable.",
    vocabulary: ["estimate", "product logic", "user roles", "data structure", "risk points"],
    authorityPrinciple: "Do not price implementation before architecture is clear."
  },
  {
    id: 2,
    type: "Objection Handling",
    level: "Beginner",
    title: "Client wants to skip architecture",
    founderLine: "We already know what we need. Can we skip the architecture step?",
    beginnerAnswer: "I do not recommend skipping architecture.",
    targetAnswer:
      "I do not recommend skipping architecture. The screens may look simple, but the system behind them can create hidden business debt if we define it too late.",
    vocabulary: ["skip", "system", "hidden business debt", "define", "too late"],
    authorityPrinciple: "Reframe speed into risk management."
  },
  {
    id: 3,
    type: "AI Product Risk",
    level: "Beginner",
    title: "Founder wants to add AI",
    founderLine: "Can we just add AI to the product?",
    beginnerAnswer: "First, we need to understand the data and the product logic.",
    targetAnswer:
      "AI should not be added before the input data, output format, user outcome, and risk boundaries are clear. Otherwise, it becomes an expensive layer on top of an unclear system.",
    vocabulary: ["input data", "output format", "user outcome", "risk boundaries", "unclear system"],
    authorityPrinciple: "AI amplifies product logic. It does not replace it."
  },
  {
    id: 4,
    type: "Pricing",
    level: "Beginner",
    title: "Founder compares you with a cheaper developer",
    founderLine: "Another developer said they can build it cheaper.",
    beginnerAnswer: "My role is different. I help reduce the cost of wrong decisions.",
    targetAnswer:
      "That may be possible for execution. My role is different. I help you reduce the cost of wrong decisions before development turns them into rework.",
    vocabulary: ["execution", "reduce the cost", "wrong decisions", "development", "rework"],
    authorityPrinciple: "Separate implementation price from decision risk."
  },
  {
    id: 5,
    type: "Positioning",
    level: "Beginner",
    title: "Introduce yourself",
    founderLine: "What do you do?",
    beginnerAnswer: "I am a Product and Decision Architect.",
    targetAnswer:
      "I am a Product and Decision Architect. I help founders design product architecture before they spend money on development.",
    vocabulary: ["Product Architect", "Decision Architect", "founders", "product architecture", "development"],
    authorityPrinciple: "Start with your role, not with tools."
  },
  {
    id: 6,
    type: "Boundary",
    level: "Beginner",
    title: "Client asks you to just build screens",
    founderLine: "Can you just build the screens first?",
    beginnerAnswer: "I do not recommend starting with screens.",
    targetAnswer:
      "I do not recommend starting with screens. First, we need to define the data structure, user roles, and product logic behind the screens.",
    vocabulary: ["screens", "data structure", "user roles", "product logic", "behind"],
    authorityPrinciple: "Screens are not the product architecture."
  },
  {
    id: 7,
    type: "MVP Scope",
    level: "Beginner",
    title: "Founder wants too many features",
    founderLine: "Can we include all these features in the first version?",
    beginnerAnswer: "Not all features should be in the first version.",
    targetAnswer:
      "Not all features should be in the first version. The MVP should prove the core product logic before we expand the system.",
    vocabulary: ["features", "first version", "MVP", "core product logic", "expand"],
    authorityPrinciple: "Protect the MVP from becoming a bloated first build."
  },
  {
    id: 8,
    type: "Paid Step",
    level: "Beginner",
    title: "Move the client to a paid architecture session",
    founderLine: "What is the next step?",
    beginnerAnswer: "The next step is a paid architecture session.",
    targetAnswer:
      "The best next step is a paid architecture session. After that, I can define the product boundaries, risks, and implementation scope.",
    vocabulary: ["next step", "paid architecture session", "product boundaries", "risks", "implementation scope"],
    authorityPrinciple: "Do not give free architecture inside unpaid conversation."
  },
  {
    id: 9,
    type: "Conference Practice",
    level: "Intermediate",
    title: "Explain your core thesis",
    founderLine: "Why do no-code products fail before they scale?",
    beginnerAnswer: "Because the problem is often not the tool. It is the decision structure.",
    targetAnswer:
      "No-code makes development faster, but it does not remove the cost of weak decisions. Many products fail not because of the tool, but because the data structure, user roles, and product boundaries were unclear from the beginning.",
    vocabulary: ["no-code", "weak decisions", "data structure", "user roles", "product boundaries"],
    authorityPrinciple: "Turn a technical topic into a strategic market insight."
  }
];

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
  { day: "Day 1", focus: "Introduce yourself", task: "Repeat your positioning phrase 10 times aloud.", phrase: "I am a Product and Decision Architect." },
  { day: "Day 2", focus: "Explain your work", task: "Say what you do in one clear sentence.", phrase: "I help founders design product architecture before they spend money on development." },
  { day: "Day 3", focus: "Protect the boundary", task: "Practice saying no to implementation-first conversations.", phrase: "This is not a build question yet. This is a product architecture question." },
  { day: "Day 4", focus: "Discovery call basics", task: "Ask five simple founder questions aloud.", phrase: "What are you building? Who is it for? What already exists? What is the core workflow? What is the biggest risk?" },
  { day: "Day 5", focus: "Pricing boundary", task: "Practice refusing a premature estimate.", phrase: "Without architecture, any estimate would be unreliable." },
  { day: "Day 6", focus: "Paid next step", task: "Move the conversation into a paid session.", phrase: "The best next step is a paid architecture session." },
  { day: "Day 7", focus: "Weekly review", task: "Record a 60-second explanation of your work.", phrase: "Architecture before development. Decisions before scale." }
];

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
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><h2 className="mb-5 text-2xl font-semibold">First 7 days</h2><div className="space-y-4">{starterPlan.map((item) => (<div key={item.day} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 flex items-center justify-between gap-3"><Badge variant="outline" className="border-orange-500/40 text-orange-300">{item.day}</Badge><span className="text-sm text-neutral-500">{item.focus}</span></div><p className="mb-3 text-neutral-300">{item.task}</p><p className="rounded-xl bg-neutral-900 p-3 text-neutral-100">“{item.phrase}”</p></div>))}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-4 flex items-center justify-between"><div><Badge variant="secondary" className="mb-3 bg-neutral-800 text-neutral-200">{activeScenario.type}</Badge><h2 className="text-2xl font-semibold">{activeScenario.title}</h2></div><Badge className="bg-orange-500">{activeScenario.level}</Badge></div><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-3 flex items-center gap-2 text-sm text-neutral-400"><MessageSquare className="h-4 w-4" /> Founder says</div><p className="text-xl leading-relaxed text-neutral-100">“{activeScenario.founderLine}”</p></div><div className="mt-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><div className="mb-3 flex items-center gap-2 text-sm text-orange-300"><ShieldCheck className="h-4 w-4" /> Authority principle</div><p className="text-neutral-100">{activeScenario.authorityPrinciple}</p></div><div className="mt-5"><div className="mb-2 text-sm font-medium text-neutral-400">Key vocabulary</div><div className="flex flex-wrap gap-2">{activeScenario.vocabulary.map((word) => (<Badge key={word} variant="outline" className="border-neutral-700 text-neutral-200">{word}</Badge>))}</div></div></CardContent></Card>

              <Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><Mic className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">Your speaking attempt</h2></div><p className="mb-4 text-neutral-400">First say the beginner answer aloud. Then write or record your stronger version.</p><div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="mb-2 text-sm font-medium text-orange-300">Beginner answer</div><p className="text-neutral-100">{activeScenario.beginnerAnswer}</p></div><Textarea value={attempt} onChange={(e) => setAttempt(e.target.value)} placeholder="Your transcript will appear here. You can also type manually." className="min-h-40 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600" />
                <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4"><div className="mb-2 text-sm font-medium text-neutral-300">Voice Practice Mode</div><p className="mb-4 text-sm text-neutral-500">{recordingStatus}</p>{!voiceSupported && (<div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-200">Voice recognition may not work inside preview environments. For full use, deploy this as a real HTTPS web app and open it in Google Chrome. Until then, use Manual Mode: say the answer aloud, then type what you said.</div>)}{manualMode && (<div className="mb-4 rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300">Manual Mode: speak aloud first, then type your answer into the transcript box. This still trains the same negotiation pattern.</div>)}<div className="flex flex-wrap gap-3"><Button onClick={startRecording} disabled={isRecording}><Mic className="mr-2 h-4 w-4" /> Record</Button><Button onClick={stopRecording} disabled={!isRecording} variant="outline"><Square className="mr-2 h-4 w-4" /> Stop</Button><Button onClick={() => setAttempt("")} variant="outline">Clear transcript</Button></div></div>
                <div className="mt-4 flex flex-wrap gap-3"><Button onClick={saveAttempt}><Brain className="mr-2 h-4 w-4" /> Analyze answer</Button><Button onClick={nextScenario} variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Next scenario</Button></div>
                {showFeedback && (<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4"><div className="grid gap-3 md:grid-cols-4"><Score label="Total" value={currentScore.total} /><Score label="Vocabulary" value={currentScore.vocabularyScore} /><Score label="Authority" value={currentScore.authorityScore} /><Score label="Clarity" value={currentScore.clarityScore} /></div><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 flex items-center justify-between gap-3"><div className="text-sm font-medium text-orange-300">Stronger authority version</div><Button onClick={speakStrongerVersion} size="sm" variant="outline"><Volume2 className="mr-2 h-4 w-4" /> Listen</Button></div><p className="leading-relaxed text-neutral-100">{activeScenario.targetAnswer}</p><div className="mt-4 rounded-xl bg-neutral-900 p-4 text-sm text-neutral-300">Repeat this version aloud 3 times. Then record again without looking.</div></div><div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-2 text-sm font-medium text-neutral-300">Feedback</div><p className="text-neutral-400">Your answer should protect your strategic position. Avoid sounding like an executor. Lead the conversation toward product logic, risk, scope, and decision quality.</p></div></motion.div>)}
              </CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="scenarios"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{scenarios.map((scenario) => (<Card key={scenario.id} className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-5"><Badge className="mb-3 bg-neutral-800 text-neutral-200">{scenario.type}</Badge><h3 className="mb-3 text-lg font-semibold">{scenario.title}</h3><p className="mb-4 text-sm text-neutral-400">“{scenario.founderLine}”</p><Button onClick={() => { setActiveScenario(scenario); setAttempt(""); setShowFeedback(false); }} className="w-full"><Play className="mr-2 h-4 w-4" /> Practice</Button></CardContent></Card>))}</div></TabsContent>

          <TabsContent value="phrases"><Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-5 flex items-center gap-3"><BookOpen className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">Authority Phrase Bank</h2></div><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search phrases, domains, or meaning..." className="mb-5 border-neutral-700 bg-neutral-950 text-neutral-50 placeholder:text-neutral-600" /><div className="grid gap-4 md:grid-cols-2">{filteredPhrases.map((item) => (<div key={item.phrase} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><Badge variant="outline" className="mb-3 border-orange-500/40 text-orange-300">{item.domain}</Badge><p className="mb-2 text-lg font-medium text-neutral-100">{item.phrase}</p><p className="text-sm text-neutral-400">{item.meaning}</p></div>))}</div></CardContent></Card></TabsContent>

          <TabsContent value="conference"><div className="grid gap-6 lg:grid-cols-[1fr_1fr]"><Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><div className="mb-5 flex items-center gap-3"><Trophy className="h-5 w-5 text-orange-400" /><h2 className="text-2xl font-semibold">Conference Track</h2></div><div className="space-y-4">{[["Month 1–3", "1-minute architecture explanations"], ["Month 4–6", "3-minute founder-facing insights"], ["Month 7–12", "10-minute product architecture talks"], ["Year 2", "20–30 minute conference keynote + Q&A"]].map(([period, goal]) => (<div key={period} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="mb-1 text-sm text-orange-300">{period}</div><div className="text-neutral-100">{goal}</div></div>))}</div></CardContent></Card><Card className="border-neutral-800 bg-neutral-900 text-neutral-50"><CardContent className="p-6"><h3 className="mb-4 text-xl font-semibold">Main talk thesis</h3><div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><p className="text-2xl font-semibold leading-tight">AI Won’t Save a Product Built on Weak Decisions</p><p className="mt-4 text-neutral-300">A conference-level topic connecting no-code speed, AI implementation risk, data structure, and product architecture.</p></div><div className="mt-5 space-y-3 text-neutral-300"><p>1. No-code made building faster.</p><p>2. AI made experimentation easier.</p><p>3. But weak decisions still become expensive systems.</p><p>4. Architecture is how founders protect speed from becoming risk.</p></div></CardContent></Card></div></TabsContent>

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
