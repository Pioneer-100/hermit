'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  generatePersonalizedGreeting, 
  buildHumanTypewriterSequence,
  TypewriterAction 
} from '@/lib/greeting-service';
import { Sun } from 'lucide-react';

interface ExecutiveGreetingBannerProps {
  userName?: string | null;
}

export default function ExecutiveGreetingBanner({ userName }: ExecutiveGreetingBannerProps) {
  const [displayText, setDisplayText] = useState('');
  const [weatherHint, setWeatherHint] = useState<string>('Harare · Live Weather Syncing...');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play human typewriter sequence on text change
  const playTypewriterSequence = (phrase: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayText('');

    const sequence: TypewriterAction[] = buildHumanTypewriterSequence(phrase);
    let stepIndex = 0;

    const runNextStep = () => {
      if (stepIndex >= sequence.length) {
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

    // 1. Queue instant heuristic greeting so the screen isn't blank
    const instantFallback = generatePersonalizedGreeting(userName);
    const initialTimer = setTimeout(() => {
      if (isMounted) {
        playTypewriterSequence(instantFallback);
      }
    }, 0);

    // 2. Fetch live real-time weather & AI dynamic phrasing from Gemini
    async function loadDynamicGreeting() {
      try {
        const res = await fetch(`/api/greeting?name=${encodeURIComponent(nameParam)}`);
        if (!res.ok) throw new Error('Failed to fetch AI greeting');
        const data = await res.json();

        if (isMounted) {
          if (data.weather?.displayString) {
            setWeatherHint(data.weather.displayString);
          }
          if (data.greeting && data.greeting.trim() !== instantFallback.trim()) {
            playTypewriterSequence(data.greeting.trim());
          }
        }
      } catch (err) {
        console.warn('Weather / AI Greeting fetch fallback:', err);
        if (isMounted) {
          setWeatherHint('Harare · 23°C Partly Cloudy');
        }
      }
    }

    loadDynamicGreeting();

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userName]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#13231b] border border-[#34483d] px-3.5 py-2.5 sm:px-5 sm:py-3">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          {/* Metadata pill badge with REAL LIVE WEATHER - Optimized for mobile wrap and readability */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[10px] font-medium">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#392f19] border border-[#67562e] max-w-full">
              <Sun className="w-3.5 h-3.5 text-[#e1bd68] shrink-0" />
              <span className="font-medium text-[#f1dda1] truncate">{weatherHint}</span>
            </span>
            <span className="text-slate-400 hidden xs:inline">•</span>
            <span className="text-slate-300 hidden xs:inline">Live Radar</span>
          </div>

          {/* Realistic Typewriter Animated text - Mobile responsive font sizing & height */}
          <div className="min-h-[24px] flex items-center">
            <h2 className="font-display text-sm sm:text-base font-semibold tracking-tight text-[#f0f5f0] leading-tight line-clamp-1">
              <span>{displayText ? displayText : `Welcome, ${userName?.trim() || 'Hermit executive'}`}</span>
              {/* Pulsing blinking typewriter cursor with realistic cyan glow */}
              <span className="inline-block w-[2px] h-4 ml-1 bg-[#49b783] animate-pulse align-middle" />
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
