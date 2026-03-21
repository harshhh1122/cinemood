import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, User, Bot, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getChatResponse } from '../services/geminiService';
import Spline from '@splinetool/react-spline';

export const Chatbot: React.FC<{ mousePosition: { x: number, y: number } }> = ({ mousePosition }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Hi! I'm your CineMood assistant. How can I help you find a movie today? \n\n**Tip:** If you only remember a dialogue or a song, try our **Magic Search** (the sparkles icon)!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const response = await getChatResponse(userMessage, []);
    setMessages(prev => [...prev, { role: 'bot', text: response || "Something went wrong." }]);
    setIsLoading(false);
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-32 h-32 flex items-center justify-center z-50 group overflow-visible"
        >
          <div className="absolute w-[600px] h-[600px] pointer-events-none flex items-center justify-center scale-[0.5] translate-y-16">
            <Suspense fallback={<Bot className="w-12 h-12 text-indigo-600/20 animate-pulse" />}>
              <Spline scene="https://prod.spline.design/3cWBdGeyOEuEFy6q/scene.splinecode" />
            </Suspense>
          </div>
          
          {/* Tooltip */}
          <div className="absolute -top-12 right-0 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Chat with CineMood
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.8, rotateX: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed inset-x-4 bottom-20 sm:inset-auto sm:bottom-32 sm:right-8 w-auto sm:w-[360px] h-[60vh] sm:h-[600px] max-h-[calc(100vh-140px)] bg-white/10 dark:bg-white/5 backdrop-blur-3xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/10 flex flex-col overflow-hidden z-50 rounded-[2.5rem]"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 bg-white/20 dark:bg-white/5 backdrop-blur-md text-zinc-900 dark:text-white flex items-center justify-between border-b border-white/20 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white flex items-center justify-center rounded-xl shadow-lg shadow-indigo-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tighter italic font-serif">CineMood AI</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[9px] uppercase tracking-widest font-bold">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    // This is a bit tricky since we need to trigger state in App.tsx
                    // We'll use a custom event or just rely on the search bar button
                    window.dispatchEvent(new CustomEvent('open-magic-search'));
                  }}
                  className="p-2 hover:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-600/20 transition-all"
                  title="Magic Search"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-full border border-white/40 dark:border-white/10 transition-all"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scroll-smooth">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 rounded-xl border ${
                    msg.role === 'user' ? 'bg-indigo-600/20 text-indigo-600 border-indigo-600/30' : 'bg-white/20 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 border-white/30 dark:border-white/10'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <div className={`max-w-[85%] p-3 sm:p-4 text-xs sm:text-base leading-relaxed rounded-2xl border ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600/80 text-white border-indigo-400/50 shadow-lg shadow-indigo-500/20' 
                      : 'bg-white/30 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 border-white/40 dark:border-white/10 shadow-lg'
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 dark:bg-white/10 text-zinc-600 flex items-center justify-center rounded-xl border border-white/30 dark:border-white/10">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="bg-white/30 dark:bg-white/10 p-3 sm:p-4 border border-white/40 dark:border-white/10 rounded-2xl">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-zinc-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 sm:p-6 border-t border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/10 backdrop-blur-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about a movie..."
                  className="w-full py-3 sm:py-4 pl-5 sm:pl-8 pr-14 sm:pr-20 bg-white/20 dark:bg-white/5 border border-white/40 dark:border-white/10 text-xs sm:text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all dark:text-white rounded-full placeholder:text-zinc-500"
                />
                <motion.button
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-2 sm:right-3 p-2 sm:p-3 bg-indigo-600/80 text-white hover:bg-indigo-600 transition-all disabled:opacity-50 border border-indigo-400/50 rounded-full shadow-lg"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
