"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const t = useTranslations("Chat");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, locale }),
      });

      if (!res.ok) throw new Error("chat request failed");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      toast.error(t("errorToast"));
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => setOpen(!open)}
        aria-label={open ? t("closeLabel") : t("openLabel")}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-accent-electric text-white shadow-glow-blue flex items-center justify-center hover:brightness-110 transition-all"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X size={24} /> : <MessageCircle size={24} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] max-w-sm h-[70vh] max-h-[520px] bg-text-primary border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <header className="flex items-center gap-2 p-4 border-b border-white/10 shrink-0 bg-white/5">
              <div className="w-8 h-8 rounded-full bg-accent-electric/20 flex items-center justify-center">
                <Sparkles size={16} className="text-accent-electric" />
              </div>
              <h2 className="text-sm font-semibold text-white">{t("title")}</h2>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-300 max-w-[85%]">
                {t("welcome")}
              </div>

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-3 text-sm rounded-2xl whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-accent-electric text-white rounded-tr-sm ml-auto"
                      : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm"
                  }`}
                >
                  {m.content}
                </div>
              ))}

              {loading && (
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                className="flex-1 h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:border-accent-electric focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label={t("send")}
                className="w-10 h-10 rounded-xl bg-accent-electric text-white flex items-center justify-center disabled:opacity-40 hover:brightness-110 transition-all shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
