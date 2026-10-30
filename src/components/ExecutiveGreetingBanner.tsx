'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  generatePersonalizedGreeting, 
  buildHumanTypewriterSequence,
  TypewriterAction 
} from '@/lib/greeting-service';
import { Sparkles, Sun } from 'lucide-react';

interface ExecutiveGreetingBannerProps {
  userName?: string | null;
}

export default function ExecutiveGreetingBanner({ userName }: ExecutiveGreetingBannerProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [weatherHint, setWeatherHint] = useState<string>('Harare · Live Weather Syncing...');
  const [isLoadingGreeting, setIsLoadingGreeting] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play human typewriter sequence on text change
  const playTypewriterSequence = (phrase: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsTypingDone(false);
    setDisplayText('');

    const sequence: TypewriterAction[] = buildHumanTypewriterSequence(phrase);
    let stepIndex = 0;

    const runNextStep = () => {
      if (stepIndex >= sequence.length) {
        setIsTypingDone(true);
        return;
      }

      const action = sequence[stepIndex];
      setDisplayText(action.text);
      stepIndex++;

      timerRef.current = setTimeout(runNextStep, action.delayMs);
    };

    timerRef.current = setTimeout(runNextStep, 250);
  };

  useEffect(() => {
    let isMounted = true;
    const nameParam = userName?.trim() || 'Melo';

    // 1. Start with instant heuristic phrase so the screen is never blank
    const instantFallback = generatePersonalizedGreeting(userName);
    playTypewriterSequence(instantFallback);

    // 2. Fetch live real-time weather & AI dynamic phrasing from Gemini
    async function loadDynamicGreeting() {
      try {
        setIsLoadingGreeting(true);
        const res = await fetch(`/api/greeting?name=${encodeURIComponent(nameParam)}`);
        if (!res.ok) throw new Error('Failed to fetch AI greeting');
        const data = await res.json();

        if (isMounted) {
          if (data.weather?.displayString) {
            setWeatherHint(data.weather.displayString);
          }
          if (data.greeting && data.greeting.trim() !== instantFallback.trim()) {
            // Re-type the newly tailored AI generated greeting
            playTypewriterSequence(data.greeting.trim());
          }
        }
      } catch (err) {
        console.warn('Weather / AI Greeting fetch fallback:', err);
        if (isMounted) {
          setWeatherHint('Harare · 23°C Partly Cloudy');
        }
      } finally {
        if (isMounted) setIsLoadingGreeting(false);
      }
    }

    loadDynamicGreeting();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userName]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1e3b]/95 via-[#071932]/95 to-[#0a1e3b]/95 border border-blue-400/30 p-3 sm:p-5 shadow-xl shadow-blue-950/40 backdrop-blur-xl">
      {/* Decorative subtle ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          {/* Metadata pill badge with REAL LIVE WEATHER - Optimized for mobile wrap and readability */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-[10px] font-mono uppercase tracking-wider text-cyan-300">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-500/20 border border-blue-400/35 max-w-full">
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-cyan-100 truncate">{weatherHint}</span>
            </span>
            <span className="text-slate-400 hidden xs:inline">•</span>
            <span className="text-slate-300 hidden xs:inline">Live Radar</span>
          </div>

          {/* Realistic Typewriter Animated text - Mobile responsive font sizing & height */}
          <div className="min-h-[48px] sm:min-h-[44px] flex items-center">
            <h2 className="font-display text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white leading-snug sm:leading-normal">
              <span>{displayText}</span>
              {/* Pulsing blinking typewriter cursor with realistic cyan glow */}
              <span className="inline-block w-[2.5px] sm:w-[3px] h-3.5 sm:h-5 ml-1 bg-cyan-400 rounded-sm shadow-[0_0_8px_#38bdf8] animate-pulse align-middle" />
            </h2>
          </div>
        </div>

        {/* Live intelligence indicator - Visible & responsive on both mobile and desktop */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center pt-1 md:pt-0 border-t border-blue-500/20 md:border-t-0 w-full md:w-auto justify-between md:justify-end">
          <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-blue-950/70 border border-blue-400/25 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-cyan-300 font-mono">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
            <span>{isTypingDone ? 'Radar Active' : 'AI Typing...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
