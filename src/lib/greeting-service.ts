// Time and weather based greeting generator for authenticated users

export interface WeatherCondition {
  temperature?: number;
  condition?: 'hot' | 'warm' | 'cool' | 'cold' | 'rain' | 'clear' | 'windy';
  description?: string;
}

/**
 * Derives a conversational, lively greeting tailored to:
 * - The user's name
 * - Time of day (morning, midday/afternoon, evening, night)
 * - Real or simulated local weather (e.g. Zimbabwe / Southern Africa temperatures & seasonal climate)
 */
export function generatePersonalizedGreeting(fullName?: string | null, weather?: WeatherCondition): string {
  // Extract friendly first name
  const rawName = fullName?.trim() || '';
  const firstName = rawName.split(/\s+/)[0] || 'there';
  
  // Local hour (0 - 23)
  const hour = new Date().getHours();
  const month = new Date().getMonth(); // 0-indexed (Oct is 9, Nov is 10 - peak hot summer in Zim)
  
  // If no weather provided, infer realistic seasonal weather (Southern Africa / Harare summer heats up Oct-Feb)
  const isSummer = month >= 9 || month <= 2;
  const isAfternoon = hour >= 11 && hour <= 16;
  const isMorning = hour >= 5 && hour < 11;
  const isEvening = hour > 16 && hour < 21;
  const isNight = hour >= 21 || hour < 5;

  // Potential phrases containing natural pauses, dynamic remarks, and catchy tone
  const templates: string[] = [];

  if (weather?.temperature && weather.temperature >= 28 || (isSummer && isAfternoon)) {
    templates.push(
      `It's quite hot ${firstName}, isn't it? Hope you're coping with the heat, let's dive into energy updates.`,
      `Phew, scorching day today ${firstName}! Grab some water, let's explore what's unfolding across the grid.`,
      `Sun's blazing out there ${firstName}! Perfect day for solar generation, let's see what's happening.`
    );
  } else if (weather?.condition === 'rain') {
    templates.push(
      `Gloomy clouds outside ${firstName}, but our pipeline is bright! Let's check today's intelligence.`,
      `A rainy one today ${firstName}! Settle in with a warm brew, let's review today's power updates.`
    );
  } else if (isMorning) {
    templates.push(
      `Rise and shine ${firstName}! The energy sector is already buzzing, let's dive into the morning updates.`,
      `Good morning ${firstName}! Fresh tea poured? Let's check out what happened across the grid overnight.`,
      `Early start today ${firstName}! Hope your day gets off to a great start, let's inspect the latest market signals.`
    );
  } else if (isEvening) {
    templates.push(
      `Winding down the day ${firstName}? Let's quickly review the latest energy moves before you sign off.`,
      `Good evening ${firstName}! The twilight peak is underway, let's check today's closing intelligence.`,
      `Hope your day was productive ${firstName}! Let's dive into this evening's energy briefing.`
    );
  } else if (isNight) {
    templates.push(
      `Working late tonight ${firstName}? The night shift surveillance is active, let's check the latest alerts.`,
      `Burning the midnight oil ${firstName}? Stay sharp, here are the critical sector briefings.`
    );
  } else {
    // Default pleasant midday
    templates.push(
      `Hey there ${firstName}, hope your day is going great! Let's dive straight into today's energy updates.`,
      `Welcome back ${firstName}! Glad to have you with us, let's inspect today's power sector signals.`
    );
  }

  // Pick a pseudo-random template or based on the minute
  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx];
}

/**
 * Script for realistic human typing:
 * Generates an array of text snapshots or actions:
 * - typing speed with slight variance
 * - longer pause on punctuation (commas, periods, question marks, exclamation)
 * - deliberate human typo, brief pause in surprise, backspaces, and correction
 */
export interface TypewriterAction {
  type: 'type' | 'delete' | 'pause';
  text: string;
  delayMs: number;
}

export function buildHumanTypewriterSequence(targetText: string): TypewriterAction[] {
  const sequence: TypewriterAction[] = [];
  
  // Decide where to inject a realistic little typo (somewhere between 20% and 60% of the sentence)
  const words = targetText.split(' ');
  let typoTargetWordIndex = -1;
  if (words.length > 4) {
    typoTargetWordIndex = Math.min(words.length - 2, Math.max(1, Math.floor(words.length * 0.35)));
  }

  let currentText = '';
  let wordCount = 0;

  for (let i = 0; i < targetText.length; i++) {
    const char = targetText[i];
    
    // Check if we hit the word boundary to maybe make a typo
    if (char === ' ') {
      wordCount++;
    }

    // Typo simulation: if we are at the chosen word and mid-word
    const shouldTypoHere = typoTargetWordIndex > 0 && wordCount === typoTargetWordIndex && /[a-zA-Z]/.test(char) && Math.random() < 0.25;

    if (shouldTypoHere) {
      typoTargetWordIndex = -999; // Only one typo per run
      // Adjacent key or typo letter
      const wrongChar = char === 'e' ? 'w' : char === 'o' ? 'p' : char === 'a' ? 's' : 'x';
      
      // Type wrong letter
      currentText += wrongChar;
      sequence.push({
        type: 'type',
        text: currentText,
        delayMs: 65 + Math.floor(Math.random() * 40)
      });

      // Brief human pause noticing the mistake
      sequence.push({
        type: 'pause',
        text: currentText,
        delayMs: 220 + Math.floor(Math.random() * 80)
      });

      // Backspace delete
      currentText = currentText.slice(0, -1);
      sequence.push({
        type: 'delete',
        text: currentText,
        delayMs: 140 + Math.floor(Math.random() * 40)
      });

      // Brief pause before typing correct letter
      sequence.push({
        type: 'pause',
        text: currentText,
        delayMs: 90
      });
    }

    // Regular character typing
    currentText += char;
    
    // Human rhythm variance:
    let delay = 45 + Math.floor(Math.random() * 40);

    if (char === ',') {
      // Pause after comma as requested!
      delay = 380 + Math.floor(Math.random() * 100);
    } else if (char === '.' || char === '!' || char === '?') {
      // Pause after sentences
      delay = 480 + Math.floor(Math.random() * 120);
    } else if (char === ' ') {
      // Small pause between words
      delay = 70 + Math.floor(Math.random() * 50);
    }

    sequence.push({
      type: 'type',
      text: currentText,
      delayMs: delay
    });
  }

  return sequence;
}
