import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export default function FAB() {
  const [isOpen, setIsOpen] = useState(false);

  const sampleQuestions = [
    "Why is my street light issue still pending?",
    "Show nearby resolved reports.",
    "What department handles water leaks?",
  ];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-8 right-6 z-40 p-4 bg-primary-blue hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center justify-center border border-white/20 select-none cursor-pointer"
        title="Civic Copilot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 md:bottom-24 right-6 z-40 w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Copilot Header */}
            <div className="bg-primary-blue p-4 text-white flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-title font-semibold text-sm">Civic Copilot</h4>
                <p className="text-[10px] text-blue-100">AI Bureaucracy Navigator</p>
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-4 flex-1 space-y-4 max-h-[260px] overflow-y-auto no-scrollbar">
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs text-slate-600 leading-relaxed">
                👋 Hello! I am your <strong>Civic Copilot</strong>. I am trained to handle paperwork and guide you through city issues. Ask me anything!
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Questions</p>
                <div className="flex flex-col gap-2">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      className="text-left text-xs p-3 bg-slate-50 hover:bg-primary-light text-slate-700 hover:text-primary-blue rounded-xl border border-slate-100/80 transition-all select-none cursor-pointer"
                      onClick={() => alert(`Civic Copilot Mockup: In a full integration, the AI Copilot would evaluate: "${q}". Backend operations are disabled for Module 1.`)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Input Field */}
            <div className="p-3 border-t border-slate-50 flex items-center gap-2">
              <input
                type="text"
                placeholder="Chat disabled in preview..."
                className="flex-1 bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-100 focus:outline-none"
                disabled
              />
              <button
                className="p-2.5 bg-slate-100 text-slate-400 rounded-xl cursor-not-allowed"
                disabled
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
