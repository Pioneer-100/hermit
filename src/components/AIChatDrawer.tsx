'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDrawer } from '@/components/DrawerContext';
import { useAuth } from '@/components/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
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

  const streamIncomingMessage = async (fullText: string) => {
    // Add an empty assistant message entry to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    // Split by newlines, preserving empty lines
    const lines = fullText.split('\n');
    let accumulated = '';
    
    for (let i = 0; i < lines.length; i++) {
      accumulated += (i > 0 ? '\n' : '') + lines[i];
      const snapshot = accumulated;
      setMessages(prev => {
        const next = [...prev];
        if (next.length > 0 && next[next.length - 1].role === 'assistant') {
          next[next.length - 1] = { role: 'assistant', content: snapshot };
        }
        return next;
      });
      // Delay each line for a smooth, readable progressive reveal
      await new Promise(resolve => setTimeout(resolve, 80));
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;
    const userMsg = { role: 'user' as const, content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      let token = '';
      const sb = getSupabaseClient();
      if (sb) {
        const { data } = await sb.auth.getSession();
        token = data.session?.access_token || '';
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const resp = await fetch('/api/ai-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: userMsg.content })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Chat API error');
      }
      const data = await resp.json();
      setLoading(false);
      await streamIncomingMessage(data.answer || 'No response generated.');
    } catch (err: any) {
      setLoading(false);
      const errMsg = { role: 'assistant' as const, content: err?.message || 'Sorry, I could not process your request at this moment.' };
      setMessages(prev => [...prev, errMsg]);
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
          <span key={i} className="inline-block ml-1 text-xs font-bold text-cyan-300 bg-blue-900/40 px-1 py-0.5 rounded border border-blue-500/30">
            [{match[1]}]
          </span>
        );
      }
      return (
        <div key={i} className="prose prose-sm prose-emerald max-w-none inline text-slate-200">
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
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 max-w-full sm:max-w-md bg-[#03130d]/98 backdrop-blur-2xl shadow-[-16px_0_40px_rgba(0,0,0,0.85)] z-50 flex flex-col border-l border-blue-500/30 overflow-hidden">
        {/* Chat Background Layer */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-20 contrast-110"
          style={{ backgroundImage: "url('/chat_assistant_bg.jpg')" }}
        />
        <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#040d1a]/85 via-[#021810]/75 to-[#040d1a]/90" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-3.5 sm:p-4 border-b border-blue-500/30 bg-[#040d1a]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-blue-400/40 bg-blue-950/80 shrink-0 shadow-md">
              <img src="/chat_assistant_bg.jpg" alt="Assistant" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <span>Hermit Intelligence</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              </h2>
              <p className="text-[10px] text-cyan-300/70">Energy & Policy AI Assistant</p>
            </div>
          </div>
          <button 
            onClick={closeChat} 
            className="p-1.5 rounded-xl text-cyan-300 hover:text-white hover:bg-blue-800/40 transition-colors" 
            aria-label="Close chat drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-400/40 shadow-xl shadow-blue-950/80 bg-[#03130d]">
                <img src="/chat_assistant_bg.jpg" alt="AI Eco Assistant" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Hermit AI Advisor</h3>
                <p className="text-xs text-cyan-200/80 max-w-[260px] leading-relaxed">
                  Ask questions regarding Zimbabwean grid stability, IPP projects, tariff policies, and renewable infrastructure.
                </p>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="w-full pt-3 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400/70 text-left">
                  Suggested inquiries:
                </div>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#040d09]/90 hover:bg-[#0a2b1e] border border-blue-500/25 text-xs text-slate-200/90 leading-snug transition-all active:scale-98"
                  >
                    <span className="text-blue-400 font-bold mr-1">&rarr;</span>
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
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-blue-950/40' 
                      : 'bg-[#040f09]/98 text-slate-200 border border-blue-500/25 backdrop-blur-md rounded-tl-none shadow-black/40'
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
        <div className="relative z-10 p-3 sm:p-4 border-t border-blue-500/30 bg-[#03130d]/98 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about tariffs, solar tenders, ZERA policies..."
            className="w-full rounded-xl bg-[#040d09]/95 border border-blue-500/35 text-slate-200 placeholder-emerald-400/50 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none transition-all"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-2.5 text-xs font-bold shadow-md shadow-blue-950/50 disabled:opacity-50 transition-all active:scale-[0.99]"
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
