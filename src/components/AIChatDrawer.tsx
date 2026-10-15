'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDrawer } from '@/components/DrawerContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Send, X } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'What is the current Kariba Dam water level & generation capacity?',
  'Summarize ZERA 2026 tariff review implications for IPPs',
  'What DFI renewable energy funding facilities are open in Zimbabwe?'
];

export default function AIChatDrawer() {
  const { isChatOpen, closeChat } = useDrawer();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;
    const userMsg = { role: 'user' as const, content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const resp = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content })
      });
      if (!resp.ok) throw new Error('Chat API error');
      const data = await resp.json();
      const assistantMsg = { role: 'assistant' as const, content: data.answer };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errMsg = { role: 'assistant' as const, content: 'Sorry, I could not process your request at this moment.' };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        return (
          <span key={i} className="inline-block ml-1 text-xs font-bold text-emerald-300 bg-emerald-900/40 px-1 py-0.5 rounded border border-emerald-500/30">
            [{match[1]}]
          </span>
        );
      }
      return (
        <div key={i} className="prose prose-sm prose-emerald max-w-none inline text-emerald-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {part}
          </ReactMarkdown>
        </div>
      );
    });
  };

  if (!isChatOpen) return null;

  return (
    <>
      {/* Click-outside backdrop overlay */}
      <div 
        onClick={closeChat}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Floating Chat Drawer - Full width on mobile, sleek slide-out panel on desktop */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 max-w-full sm:max-w-md bg-[#020e08]/95 backdrop-blur-2xl shadow-[-16px_0_40px_rgba(0,0,0,0.85)] z-50 flex flex-col border-l border-emerald-500/30 overflow-hidden">
        {/* Chat Background Layer */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-20 contrast-110"
          style={{ backgroundImage: "url('/chat_assistant_bg.jpg')" }}
        />
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#020e08]/85 via-[#021810]/75 to-[#020e08]/90" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-3.5 sm:p-4 border-b border-emerald-500/30 bg-[#020e08]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-emerald-400/40 bg-emerald-950/80 shrink-0 shadow-md">
              <img src="/chat_assistant_bg.jpg" alt="Assistant" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-emerald-100 flex items-center gap-1.5">
                <span>Hermit Intelligence</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-[10px] text-emerald-300/70">Energy & Policy AI Assistant</p>
            </div>
          </div>
          <button 
            onClick={closeChat} 
            className="p-1.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800/40 transition-colors" 
            aria-label="Close chat drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-xl shadow-emerald-950/80 bg-[#031d12]">
                <img src="/chat_assistant_bg.jpg" alt="AI Eco Assistant" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Hermit AI Advisor</h3>
                <p className="text-xs text-emerald-200/80 max-w-[260px] leading-relaxed">
                  Ask questions regarding Zimbabwean grid stability, IPP projects, tariff policies, and renewable infrastructure.
                </p>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="w-full pt-3 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 text-left">
                  Suggested inquiries:
                </div>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#041d13]/80 hover:bg-[#073020] border border-emerald-500/25 text-xs text-emerald-100/90 leading-snug transition-all active:scale-98"
                  >
                    <span className="text-emerald-400 font-bold mr-1">&rarr;</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-emerald-950/40' 
                      : 'bg-[#031e13]/95 text-emerald-100 border border-emerald-500/30 backdrop-blur-md rounded-tl-none shadow-black/40'
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer with Safe-Area Inset */}
        <div className="relative z-10 p-3 sm:p-4 border-t border-emerald-500/30 bg-[#020e08]/95 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about tariffs, solar tenders, ZERA policies..."
            className="w-full rounded-xl bg-[#042014]/90 border border-emerald-500/40 text-emerald-100 placeholder-emerald-400/50 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none transition-all"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white py-2.5 text-xs font-bold shadow-md shadow-emerald-950/50 disabled:opacity-50 transition-all active:scale-[0.99]"
          >
            {loading ? (
              <span>Analyzing sector context…</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Inquiry</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
