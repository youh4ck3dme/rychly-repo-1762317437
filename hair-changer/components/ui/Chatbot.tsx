import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";
import type { ChatMessage } from "../../types";
import { useTranslation } from "../../lib/i18n.tsx";

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble = React.memo(({ message }: ChatMessageBubbleProps) => {
  const isModel = message.role === "model";
  return (
    <div className={`flex items-start gap-3 ${isModel ? "" : "justify-end"}`}>
      {isModel && (
        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0">
          <Bot size={20} />
        </div>
      )}
      <div
        className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md ${isModel ? "bg-gray-700 rounded-bl-none" : "bg-white text-black rounded-br-none"}`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
});

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
export const Chatbot = React.memo(
  ({ isOpen, onClose, messages, onSendMessage, isLoading }: ChatbotProps) => {
    const [input, setInput] = React.useState("");
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 1024);

    React.useEffect(() => {
      const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = () => {
      if (input.trim() && !isLoading) {
        onSendMessage(input.trim());
        setInput("");
      }
    };

    const mobileVariants = {
      closed: { opacity: 0, y: 50, scale: 0.9 },
      open: { opacity: 1, y: 0, scale: 1 },
    };

    const desktopVariants = {
      closed: { x: "100%" },
      open: { x: 0 },
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={isDesktop ? desktopVariants : mobileVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 w-full h-full bg-black border border-gray-700 rounded-lg shadow-2xl flex flex-col lg:left-auto lg:right-0 lg:top-0 lg:w-[400px] lg:h-screen lg:max-h-full lg:rounded-none lg:border-l lg:border-t-0 lg:border-b-0 lg:border-r-0"
            aria-modal="true"
            role="dialog"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Bot size={24} />
                <h2 className="font-bold text-lg">{t("chatbot.title")}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-800"
                aria-label={t("chatbot.close")}
              >
                <X size={20} />
              </button>
            </header>

            {/* Messages */}
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <ChatMessageBubble key={index} message={msg} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0">
                    <Bot size={20} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-gray-700 rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 flex-shrink-0">
              <div className="flex items-center bg-gray-800 rounded-full p-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("chatbot.placeholder")}
                  className="w-full bg-transparent px-4 py-2 text-sm focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-opacity"
                  aria-label={t("chatbot.send")}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
