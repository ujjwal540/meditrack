"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Clock,
  MessageSquarePlus,
  Pill,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTimeOfDayGreeting } from "@/utils/greeting";
import { getActiveUser } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageContext";

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
};

interface SuggestedTopic {
  id: string;
  icon: typeof Pill;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  promptEn: string;
  promptNe: string;
}

const SUGGESTED_TOPICS: SuggestedTopic[] = [
  {
    id: "routine",
    icon: Clock,
    titleEn: "Medicine Timing",
    titleNe: "औषधिको समयतालिका",
    descEn: "Tips for setting a consistent daily dose habit",
    descNe: "नियमित औषधि खाने सरल बानी र उपायहरू",
    promptEn: "What are your best tips for building a consistent daily medicine routine?",
    promptNe: "नियमित औषधि खाने बानी बसाल्न के कस्ता सरल उपायहरू छन्?",
  },
  {
    id: "missed",
    icon: Pill,
    titleEn: "Missed Dose Rules",
    titleNe: "औषधि खान बिर्सिएमा",
    descEn: "What to do if you skipped or forgot a scheduled dose",
    descNe: "औषधिको खुराक छुट्दा के गर्ने र के नगर्ने",
    promptEn: "What should I do if I miss a scheduled dose of my medication?",
    promptNe: "यदि मैले तालिकाको औषधि खान बिर्सिएँ भने के गर्नुपर्छ?",
  },
  {
    id: "food",
    icon: Utensils,
    titleEn: "Food & Water Guidelines",
    titleNe: "खाना र पानीको नियम",
    descEn: "Taking medicine with meals vs. on an empty stomach",
    descNe: "खानासँग वा खाली पेटमा औषधि खाने सहि तरिका",
    promptEn: "How should I take medications with food or on an empty stomach?",
    promptNe: "खानासँग वा खाली पेटमा औषधि कसरी खानुपर्छ?",
  },
  {
    id: "family",
    icon: Users,
    titleEn: "Family Care & Consent",
    titleNe: "पारिवारिक हेरचाह",
    descEn: "How consent-based family sharing protects your privacy",
    descNe: "गोपनीयता र हेरचाहकर्तासँग साझेदारीको नियम",
    promptEn: "How does consent-based family sharing work in MediTrack?",
    promptNe: "मेडीट्रयाकमा पारिवारिक हेरचाहकर्तासँग औषधि विवरण कसरी सुरक्षित हुन्छ?",
  },
];

function getAssistantResponse(prompt: string, userName?: string, isNepali?: boolean): string {
  const lower = prompt.toLowerCase();
  const namePrefix = userName ? (isNepali ? `, ${userName} ज्यू` : `, ${userName}`) : "";

  if (isNepali) {
    if (lower.includes("बिर्सि") || lower.includes("छुट्यो") || lower.includes("miss") || lower.includes("forgot") || lower.includes("skip")) {
      return `यदि औषधि खान बिर्सिनुभयो भने${namePrefix}, सम्झिने बित्तिकै खानुहोस्। तर अर्को खुराक खाने बेला भइसकेको छ भने बिर्सिएको खुराक छाड्नुहोस्। कहिल्यै पनि दोब्बर औषधि नखानुहोस्। शङ्का लागेमा डाक्टर वा फार्मेसीसँग सोध्नुहोस्।`;
    }
    if (lower.includes("खाना") || lower.includes("पानी") || lower.includes("पेट") || lower.includes("food") || lower.includes("eat") || lower.includes("stomach")) {
      return `खानासँग खानुपर्ने औषधिहरू पेटको सुरक्षा गर्न र राम्ररी पच्नका लागि खाना खाइसकेपछि वा खाँदै गर्दा खानुपर्छ। डाक्टरले अन्यथा नभनेसम्म सधैं एक गिलास सफा पानीसँग ट्याब्लेट खानुहोस्।`;
    }
    if (lower.includes("परिवार") || lower.includes("हेरचाह") || lower.includes("साझेदारी") || lower.includes("गोपनीयता") || lower.includes("family") || lower.includes("caregiver")) {
      return `मेडीट्रयाकमा पूर्ण सहमतिमा आधारित गोपनीयता हुन्छ${namePrefix}। तपाईंले पारिवारिक सदस्यलाई आमन्त्रण गरेपछि तपाईंले अनुमति नदिएसम्म उहाँहरूले औषधिको स्थिति देख्न पाउनुहुन्न। तपाईंले जुनसुकै बेला पहुँच बन्द गर्न सक्नुहुन्छ।`;
    }
    if (lower.includes("बानी") || lower.includes("तालिका") || lower.includes("समय") || lower.includes("routine") || lower.includes("tips") || lower.includes("habit")) {
      return `नियमित औषधि खानको लागि दैनिक कामसँग समय मिलाउनुहोस्—जस्तै बिहानको चिया, दाँत माझ्ने वा राति सुत्ने समय। साथै मेडीट्रयाकको नेपाली बोली (आवाज) र घण्टी सेटिङ्सबाट चालु गर्न सक्नुहुन्छ!`;
    }
    if (lower.includes("समस्या") || lower.includes("दुख्यो") || lower.includes("असर") || lower.includes("side effect") || lower.includes("emergency") || lower.includes("doctor")) {
      return `यदि तपाईंलाई गम्भीर लक्षण वा असजिलो महसुस भएको छ भने${namePrefix}, तुरुन्तै नजिकको अस्पताल वा आफ्नो चिकित्सकसँग सम्पर्क गर्नुहोस्। मेडीट्रयाक एआईले आपत्कालीन उपचार वा औषधिको मात्रा तोक्न सक्दैन।`;
    }
    return `राम्रो प्रश्न गर्नुभयो${namePrefix}! औषधिको सहि सेवनका लागि सधैं डाक्टर वा औषधिको बट्टामा लेखिएको निर्देशन पालना गर्नुहोस्। मेडीट्रयाकमा तपाईंले औषधि तालिका, अनुस्मारक र परिवारलाई सजिलै जोड्न सक्नुहुन्छ।`;
  }

  // English fallback
  if (lower.includes("miss") || lower.includes("forgot") || lower.includes("skip")) {
    return `If you miss a dose${namePrefix}, take it as soon as you remember, unless it is already almost time for your next scheduled dose. Never take two doses at once to make up for a missed one. When in doubt, consult your doctor or pharmacist.`;
  }
  if (lower.includes("food") || lower.includes("empty stomach") || lower.includes("eat") || lower.includes("water") || lower.includes("meal")) {
    return "Medicines marked 'with food' are usually meant to be taken during or right after a meal or snack to protect your stomach lining or improve absorption. Always take oral tablets with a full glass of water unless your doctor instructed otherwise.";
  }
  if (lower.includes("family") || lower.includes("caregiver") || lower.includes("sharing") || lower.includes("consent") || lower.includes("privacy")) {
    return `MediTrack uses strict consent-based sharing${namePrefix}. When you invite a family member or caregiver, they cannot see your dose activity until you explicitly tap 'Allow them to see my doses'. You can revoke access at any time from the Family page.`;
  }
  if (lower.includes("routine") || lower.includes("schedule") || lower.includes("remember") || lower.includes("tips") || lower.includes("habit")) {
    return `Welcome back${namePrefix}! Pairing medicine times with daily anchors—such as morning breakfast, brushing teeth, or evening bedtime—creates strong habits. You can also turn on MediTrack browser notifications and voice announcements in Settings!`;
  }
  if (lower.includes("side effect") || lower.includes("pain") || lower.includes("emergency") || lower.includes("doctor")) {
    return `If you are experiencing severe symptoms, unusual side effects, or an emergency${namePrefix}, please contact your doctor or local emergency services immediately. MediTrack AI cannot provide diagnostic opinions or adjust dosages.`;
  }
  return `That's a helpful question${namePrefix}! For specific treatment guidelines, always follow your prescription label. In MediTrack, you can record custom doctor instructions, configure reminder intervals, and invite caregivers to stay in the loop.`;
}

export function AIAssistantWidget() {
  const { isNepali } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const timeGreeting = getTimeOfDayGreeting(new Date());

  useEffect(() => {
    void getActiveUser().then((u) => {
      if (u?.name?.trim()) {
        const clean = u.name.trim();
        setUserName(clean);
      }
    });
  }, []);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Coordinate dismissal of floating panels
  useEffect(() => {
    function handleCloseFloating(e: Event) {
      const customEvent = e as CustomEvent<{ origin?: string }>;
      if (customEvent.detail?.origin !== "ai") {
        setIsOpen(false);
      }
    }
    window.addEventListener("meditrack:close-floating", handleCloseFloating);
    return () => window.removeEventListener("meditrack:close-floating", handleCloseFloating);
  }, []);

  function handleSend(textToSend?: string) {
    const query = (textToSend ?? input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAssistantResponse(query, userName, isNepali);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  }

  function handleResetChat() {
    setMessages([]);
    setInput("");
    setIsTyping(false);
  }

  return (
    <div
      className={cn(
        "fixed bottom-20 md:bottom-6 right-3 sm:right-6 transition-all duration-300",
        isOpen ? "z-50" : "z-40",
      )}
    >
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("meditrack:close-floating", {
                detail: { origin: "ai" },
              }),
            );
            setIsOpen(true);
          }}
          aria-label={isNepali ? "मेडीट्रयाक एआई साथी खोल्नुहोस्" : "Open MediTrack AI Assistant"}
          className="group relative flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-[var(--surface-elevated)] px-3.5 sm:px-4 py-2.5 sm:py-3 text-[var(--text)] shadow-[0_8px_30px_rgba(22,163,106,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#20D6C2] active:scale-95"
        >
          <div className="relative grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-gradient-to-tr from-[#16A36A] via-[#10B981] to-[#20D6C2] text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            {isNepali ? "स्वास्थ्य साथी (AI)" : "MediTrack AI"}
          </span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20D6C2] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#20D6C2]" />
          </span>
        </button>
      )}

      {/* Modern AI Assistant Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isNepali ? "मेडीट्रयाक स्वास्थ्य साथी" : "MediTrack AI Assistant"}
          className="flex h-[35rem] max-h-[calc(100dvh-6.5rem)] sm:max-h-[38rem] w-[calc(100vw-1.5rem)] sm:w-[25.5rem] md:w-[27rem] flex-col rounded-3xl border border-emerald-500/30 dark:border-emerald-500/30 bg-[var(--surface)] text-[var(--text)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_0_1px_rgba(32,214,194,0.2)] overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Section 1: Header */}
          <header className="shrink-0 flex items-center justify-between border-b border-[var(--border)] px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--surface-elevated)]/70 backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (messages.length > 0) {
                    handleResetChat();
                  } else {
                    setIsOpen(false);
                  }
                }}
                aria-label={
                  messages.length > 0
                    ? (isNepali ? "विषय सूचीमा फर्कनुहोस्" : "Back to topics")
                    : (isNepali ? "असिस्टेन्ट बन्द गर्नुहोस्" : "Close assistant")
                }
                title={
                  messages.length > 0
                    ? (isNepali ? "विषय सूचीमा फर्कनुहोस्" : "Back to topics")
                    : (isNepali ? "असिस्टेन्ट बन्द गर्नुहोस्" : "Close assistant")
                }
                className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[#16A36A] dark:text-[#20C982] hover:border-[#16A36A] hover:bg-[#16A36A]/15 hover:shadow-[0_2px_10px_rgba(22,163,106,0.2)] transition-all active:scale-95 shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.2]" aria-hidden="true" />
              </button>
              <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#16A36A] via-[#10B981] to-[#20D6C2] text-white shadow-sm">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20D6C2] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#20D6C2] border border-white dark:border-[#0A1A12]" />
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-xs sm:text-sm font-bold tracking-tight text-[var(--text)] truncate">
                  {isNepali ? "मेडीट्रयाक स्वास्थ्य साथी" : "MediTrack AI Assistant"}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#16A36A] dark:text-[#20C982] font-semibold">
                    {isNepali ? "सक्रिय स्वास्थ्य सल्लाहकार" : "Active Health AI"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                title={isNepali ? "नयाँ कुराकानी सुरु गर्नुहोस्" : "Start a new conversation"}
                aria-label={isNepali ? "नयाँ कुराकानी सुरु गर्नुहोस्" : "Start a new conversation"}
                className="flex items-center gap-1 h-8 px-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors text-[11px] font-medium"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {isNepali ? "नयाँ च्याट" : "New Chat"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={isNepali ? "संवाद बन्द गर्नुहोस्" : "Close assistant"}
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Section 2: Main Body Area (State-Driven: Welcome vs. Conversation) */}
          <main className="flex-1 min-h-0 overflow-y-auto">
            {messages.length === 0 ? (
              /* Initial Welcome Screen (Before Conversation) */
              <div className="p-4 sm:p-5 flex flex-col items-center text-center space-y-4">
                {/* Glowing Avatar & Personalized Greeting */}
                <div className="relative mt-1">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#16A36A] via-[#20C982] to-[#20D6C2] opacity-35 blur-sm" />
                  <div className="relative grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-[#16A36A] to-[#20D6C2] text-white shadow-md">
                    <Bot className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-1 max-w-sm">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                    {timeGreeting}
                    {userName ? (isNepali ? `, ${userName} ज्यू` : `, ${userName}!`) : "!"}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text)] leading-snug">
                    {isNepali
                      ? "नमस्ते! मेडीट्रयाकमा स्वागत छ। आज म तपाईंको स्वास्थ्यमा के सहयोग गर्न सक्छु?"
                      : "Hello! Welcome to MediTrack. How can I help you with your health today?"}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                    {isNepali
                      ? "म औषधि समयतालिका, खुराक छुट्दाका नियम, खानासँग खाने निर्देशन र पारिवारिक हेरचाहबारे उत्तर दिन सक्छु।"
                      : "I can answer questions about medicine schedules, food interactions, dose tracking, and family care."}
                  </p>
                </div>

                {/* Suggested Question Cards */}
                <div className="w-full text-left pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-0.5">
                    {isNepali ? "सुझाव गरिएका विषयहरू:" : "Suggested topics to get started:"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_TOPICS.map((topic) => {
                      const Icon = topic.icon;
                      const title = isNepali ? topic.titleNe : topic.titleEn;
                      const desc = isNepali ? topic.descNe : topic.descEn;
                      const prompt = isNepali ? topic.promptNe : topic.promptEn;

                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => handleSend(prompt)}
                          className="group relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 text-left transition-all duration-200 hover:border-[#20D6C2]/60 hover:bg-[#16A36A]/5 hover:shadow-sm active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#16A36A]/10 text-[#16A36A] dark:text-[#20C982] group-hover:bg-[#16A36A] group-hover:text-white transition-colors">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[#16A36A] dark:group-hover:text-[#20C982] transition-colors leading-tight">
                              {title}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] leading-tight line-clamp-2">
                            {desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Medical Disclaimer Card */}
                <div className="w-full rounded-xl border border-[#16A36A]/25 bg-[#16A36A]/10 p-2.5 text-left text-[10px] leading-relaxed text-[var(--text-secondary)] shadow-sm">
                  <div className="flex items-start gap-2">
                    <ShieldCheck
                      className="h-4 w-4 shrink-0 text-[#16A36A] dark:text-[#20C982] mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <span className="font-bold text-[var(--text)] block mb-0.5">
                        {isNepali ? "चिकित्सा सूचना (Medical Disclaimer)" : "Medical Disclaimer"}
                      </span>
                      <span>
                        {isNepali
                          ? "यो जानकारी परामर्श र अनुस्मारकका लागि मात्र हो, चिकित्सा निदान होइन। डाक्टर वा फार्मासिस्टको परामर्श बिना औषधिको मात्रा कहिल्यै फेरबदल नगर्नुहोस्।"
                          : "For informational guidance only. Not medical diagnosis. Never change medications or dosages without consulting your doctor or pharmacist."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Conversation Mode (After First Message) */
              <div className="p-3.5 sm:p-4 space-y-3.5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2.5 items-end",
                      msg.sender === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {msg.sender === "assistant" && (
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-[#16A36A] dark:text-[#20C982] border border-emerald-500/25 mb-1">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[84%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm",
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-[#16A36A] to-[#20C982] text-white font-medium rounded-br-xs"
                          : "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] rounded-bl-xs",
                      )}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span
                        className={cn(
                          "mt-1.5 block text-[9px] tracking-tight text-right",
                          msg.sender === "user" ? "text-white/80" : "text-[var(--text-muted)]",
                        )}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.sender === "user" && (
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#16A36A]/20 text-[#16A36A] dark:text-[#20C982] mb-1">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs pl-9 py-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#16A36A] animate-bounce" />
                    <span className="inline-block h-2 w-2 rounded-full bg-[#20C982] animate-bounce [animation-delay:0.2s]" />
                    <span className="inline-block h-2 w-2 rounded-full bg-[#20D6C2] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-[var(--text-muted)] ml-1 font-medium">
                      {isNepali ? "स्वास्थ्य सल्लाहकारले उत्तर तयार गर्दैछ..." : "MediTrack AI is thinking..."}
                    </span>
                  </div>
                )}

                {/* Compact Medical Disclaimer Banner in chat mode */}
                <div className="pt-2">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)] text-center py-1 border-t border-[var(--border-subtle)]">
                    <ShieldCheck className="h-3 w-3 text-[#16A36A] dark:text-[#20C982] shrink-0" />
                    <span>
                      {isNepali
                        ? "परामर्शका लागि मात्र • आवश्यक परे चिकित्सकसँग सल्लाह लिनुहोस्"
                        : "Informational only • Consult your doctor for medical decisions"}
                    </span>
                  </div>
                </div>

                <div ref={messagesEndRef} />
              </div>
            )}
          </main>

          {/* Section 3: Bottom Input Area */}
          <footer className="shrink-0 border-t border-[var(--border)] p-3 bg-[var(--surface-elevated)]/90 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isNepali
                    ? "औषधि, खानपिन वा समयतालिकाबारे सोध्नुहोस्..."
                    : "Ask about doses, routines, or timing..."
                }
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#20D6C2] focus:ring-1 focus:ring-[#20D6C2] focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-[#16A36A] to-[#20D6C2] text-white disabled:opacity-40 transition-all hover:brightness-110 active:scale-95 shadow-sm shrink-0"
                aria-label={isNepali ? "प्रश्न पठाउनुहोस्" : "Send query"}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
}


