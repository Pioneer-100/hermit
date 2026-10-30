import { NextResponse } from 'next/server';

interface WeatherReport {
  temperature: number;
  condition: string;
  description: string;
  isDay: boolean;
  city: string;
  humidity: number;
}

// Convert Open-Meteo WMO weather codes to human friendly descriptions
function mapWmoCodeToCondition(code: number): { condition: string; description: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear', description: 'Sunny & Clear Skies' };
    case 1:
    case 2:
      return { condition: 'Partly Cloudy', description: 'Breezy & Partly Cloudy' };
    case 3:
      return { condition: 'Overcast', description: 'Overcast Skies' };
    case 45:
    case 48:
      return { condition: 'Misty', description: 'Misty & Foggy' };
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain', description: 'Light to Moderate Rain' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Showers', description: 'Scattered Showers' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', description: 'Thunderstorm Activity' };
    default:
      return { condition: 'Fine', description: 'Mild & Fair Weather' };
  }
}

async function fetchLiveHarareWeather(): Promise<WeatherReport> {
  // Harare latitude & longitude: -17.8252, 31.0335
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=-17.8252&longitude=31.0335&current=temperature_2m,relative_humidity_2m,weather_code,is_day&timezone=Africa%2FHarare';
  
  const res = await fetch(url, {
    next: { revalidate: 600 }, // Cache weather for 10 minutes
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo failed with status ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;
  const { condition, description } = mapWmoCodeToCondition(current.weather_code ?? 0);

  return {
    temperature: Math.round(current.temperature_2m ?? 24),
    condition,
    description,
    isDay: current.is_day === 1,
    city: 'Harare',
    humidity: current.relative_humidity_2m ?? 50
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get('name') || 'Melo';

  // 1. Fetch live meteorological weather
  let weather: WeatherReport;
  try {
    weather = await fetchLiveHarareWeather();
  } catch (err) {
    // Intelligent fallback if Open-Meteo is temporarily unreachable
    const hour = new Date().getHours();
    const temp = hour >= 10 && hour <= 15 ? 28 : 22;
    weather = {
      temperature: temp,
      condition: temp > 26 ? 'Warm & Sunny' : 'Clear',
      description: temp > 26 ? 'Hot and sunny' : 'Pleasant and mild',
      isDay: hour >= 6 && hour < 18,
      city: 'Harare',
      humidity: 45
    };
  }

  // 2. Call Gemini AI to craft a fresh, short, witty, and lively energy greeting
  const apiKey = process.env.GEMINI_API_KEY;
  const firstName = userName.trim().split(/\s+/)[0] || 'there';
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  let greeting = `It's quite hot ${firstName}, isn't it? Hope you're coping with the heat, let's dive into energy updates.`;

  if (apiKey && !apiKey.includes('fake') && apiKey.length > 10) {
    const prompt = `You are the lively, charismatic intelligence assistant for Hermit Investments (Zimbabwe clean energy surveillance portal).
Write a very short, catchy, lively ONE-SENTENCE greeting for ${firstName}.
Current context:
- Location: Harare, Zimbabwe
- Weather: ${weather.temperature}°C, ${weather.description}
- Time of day: ${timeOfDay}
- User's name: ${firstName}

Requirements:
- Exactly 1 lively, natural sentence.
- Casually mention the real weather or temperature and user's name (e.g. "It's quite hot Melo, isn't it? Hope you're coping with the heat, let's dive into energy updates." or "Breezy 22°C morning Melo, fresh coffee ready? Let's check out what's moving across the grid!").
- Keep it punchy, warm, real, and related to starting the energy briefing.
- Do NOT use quotes, markdown bold, or introductory filler. Output ONLY the raw sentence.`;

    // Try Gemini 3.5 Flash models
    for (const model of ['gemini-3.5-flash-lite', 'gemini-3.5-flash']) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 90
            }
          }),
          signal: AbortSignal.timeout(6000)
        });

        if (res.ok) {
          const aiData = await res.json();
          const candidate = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (candidate && candidate.length > 10 && candidate.length < 180) {
            greeting = candidate.replace(/^["']|["']$/g, '');
            break;
          }
        }
      } catch (e) {
        console.warn(`Greeting generation failed with model ${model}:`, e);
      }
    }
  }

  return NextResponse.json({
    success: true,
    greeting,
    weather: {
      temperature: weather.temperature,
      condition: weather.condition,
      description: weather.description,
      displayString: `${weather.city} · ${weather.temperature}°C ${weather.description}`
    }
  });
}
