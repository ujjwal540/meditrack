"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTimeOfDayGreeting } from "@/utils/greeting";
import { getActiveUser } from "@/lib/auth";

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
};

const SUGGESTED_QUESTIONS = [
  "How should I take medications with food?",
  "What should I do if I miss a scheduled dose?",
  "How does consent-based family sharing work?",
  "Tips for setting up a consistent daily routine",
];

function getWelcomeMessage(userName?: string): string {
  const timeGreeting = getTimeOfDayGreeting(new Date());
  if (userName && userName.trim()) {
    return `${timeGreeting}, ${userName.trim()}! How are you feeling today? I am your MediTrack AI Companion. How can I assist you with your health routine today?`;
  }
  return `Hello! Welcome to MediTrack. How can I help you with your health today? I can answer questions about setting reminders, taking medicine with food, or organizing your care schedule.`;
}

function getAssistantResponse(prompt: string, userName?: string): string {
  const lower = prompt.toLowerCase();
  const namePrefix = userName ? `, ${userName}` : "";

  if (lower.includes("miss") || lower.includes("forgot") || lower.includes("skip")) {
    return `If you miss a dose${namePrefix}, take it as soon as you remember, unless it is already almost time for your next scheduled dose. Never double up on your medicine to make up for a missed dose. When in doubt, check your prescription label or call your pharmacist.`;
  }
  if (lower.includes("food") || lower.includes("empty stomach") || lower.includes("eat") || lower.includes("water")) {
    return "Medicines marked 'with food' are usually meant to be taken during or right after a meal or snack to protect your stomach lining or improve absorption. Always take oral tablets with a full glass of water unless your doctor instructed otherwise.";
  }
  if (lower.includes("family") || lower.includes("caregiver") || lower.includes("sharing") || lower.includes("consent")) {
    return `MediTrack uses strict consent-based sharing${namePrefix}. When you invite a family member or caregiver, they cannot see your dose activity until you explicitly tap 'Allow them to see my doses'. You can revoke access at any time from the Family page.`;
  }
  if (lower.includes("routine") || lower.includes("schedule") || lower.includes("remember") || lower.includes("tips")) {
    return `Welcome back${namePrefix}! Pairing medicine times with daily anchors—such as morning breakfast, brushing teeth, or evening bedtime—creates strong habits. You can also turn on MediTrack browser notifications and voice announcements in Settings!`;
  }
  if (lower.includes("side effect") || lower.includes("pain") || lower.includes("emergency") || lower.includes("doctor")) {
    return `If you are experiencing severe symptoms, unusual side effects, or an emergency${namePrefix}, please contact your doctor or local emergency services immediately. MediTrack AI cannot provide diagnostic opinions or adjust dosages.`;
  }
  return `That's a helpful question${namePrefix}! For specific treatment guidelines, always follow your prescription label. In MediTrack, you can record custom doctor instructions, configure reminder intervals, and invite caregivers to stay in the loop.`;
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "init-1",
      sender: "assistant",
      text: getWelcomeMessage(),
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void getActiveUser().then((u) => {
      if (u?.name?.trim()) {
        const clean = u.name.trim();
        setUserName(clean);
        setMessages([
          {
            id: "init-1",
            sender: "assistant",
            text: getWelcomeMessage(clean),
            timestamp: "Just now",
          },
        ]);
      }
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

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
      const reply = getAssistantResponse(query, userName);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 700);
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open MediTrack AI Assistant"
          className="group relative flex items-center gap-2.5 rounded-full border border-[#A78BFA]/40 bg-[var(--surface-elevated)] px-3.5 sm:px-4 py-2.5 sm:py-3 text-[var(--text)] shadow-[0_8px_30px_rgba(167,139,250,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#A78BFA] active:scale-95"
        >
          <div className="relative grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-gradient-to-tr from-[#A78BFA] to-[#A3EAC1] text-[#07130E]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            MediTrack AI
          </span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A78BFA] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#A78BFA]" />
          </span>
        </button>
      )}

      {/* Modern Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="MediTrack AI Assistant"
          className="flex h-[32rem] max-h-[82vh] sm:max-h-[85vh] w-[calc(100vw-1.5rem)] sm:w-[24rem] md:w-[26rem] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-card)] backdrop-blur-2xl transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-tight text-[var(--text)]">
                  MediTrack AI Assistant
                </h3>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Healthcare &amp; routine companion
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: `init-${Date.now()}`,
                      sender: "assistant",
                      text: getWelcomeMessage(userName),
                      timestamp: "Just now",
                    },
                  ])
                }
                title="Reset conversation"
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)]"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.sender === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.sender === "assistant" && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/25">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed",
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#16A36A] to-[#20C982] text-white font-medium rounded-tr-none shadow-sm"
                      : "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text)] rounded-tl-none",
                  )}
                >
                  <p>{msg.text}</p>
                  <span className="mt-1 block text-[10px] opacity-70 text-right">
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === "user" && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#16A36A]/20 text-[#16A36A] dark:text-[#20C982]">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs pl-9">
                <span className="inline-block h-2 w-2 rounded-full bg-[#A78BFA] animate-bounce" />
                <span className="inline-block h-2 w-2 rounded-full bg-[#A78BFA] animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block h-2 w-2 rounded-full bg-[#A78BFA] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1">Analyzing schedule...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          {messages.length <= 3 && (
            <div className="px-4 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[#A78BFA]/50 hover:text-[#A78BFA]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dedicated Compact Medical Disclaimer Section */}
          <div className="mx-3.5 mb-2 rounded-xl border border-[#16A36A]/20 bg-[#16A36A]/10 px-3 py-2 text-[10px] leading-relaxed text-[var(--text-secondary)] shadow-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#16A36A] dark:text-[#20D6C2]" aria-hidden="true" />
              <span>
                Medical Disclaimer: For informational guidance only. Not medical diagnosis. Never change dosage without consulting your doctor or pharmacist.
              </span>
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-[var(--border)] p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about doses, routines, or timing..."
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[#A78BFA] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="grid h-8 w-8 place-items-center rounded-xl bg-[#A78BFA] text-[#07130E] disabled:opacity-40 transition-all hover:brightness-110 active:scale-95 shadow-sm"
              aria-label="Send query"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
