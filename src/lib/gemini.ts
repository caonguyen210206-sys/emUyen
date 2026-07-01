import { GoogleGenAI } from '@google/genai';

type GeminiDefinition = {
  correctedWord?: string;
  ipa?: string;
  wordType?: string;
  meaning?: string;
  definition?: string;
  example?: string;
  synonyms?: string;
  antonyms?: string;
  band?: string;
  topic?: string;
};

const API_KEY_STORAGE_KEY = 'geminiApiKey';

const buildPrompt = (word: string) => `You are an expert English teacher. Define "${word}" for a Vietnamese learner. Return only JSON with these fields: correctedWord, ipa, wordType, meaning, definition, example, synonyms, antonyms, band, topic.`;

const parseJsonText = (text: string): GeminiDefinition => {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned) as GeminiDefinition;
};

export const getSavedGeminiApiKey = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(API_KEY_STORAGE_KEY) || '';
};

export const saveGeminiApiKey = (apiKey: string) => {
  if (typeof window === 'undefined') return;
  const key = apiKey.trim();
  if (key) {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } else {
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
};

const defineWithBrowserKey = async (word: string, apiKey: string): Promise<GeminiDefinition> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildPrompt(word),
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No response from Gemini');
  }

  return parseJsonText(text);
};

const defineWithServer = async (word: string, apiKey: string): Promise<GeminiDefinition> => {
  const response = await fetch('/api/define', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, apiKey }),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('No Gemini API key found. Please enter the key in Settings and click Save Settings.');
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || 'API request failed');
  }

  return payload as GeminiDefinition;
};

export const defineWord = async (word: string, apiKey = ''): Promise<GeminiDefinition> => {
  const key = apiKey.trim() || getSavedGeminiApiKey().trim();

  if (key) {
    saveGeminiApiKey(key);
    return defineWithBrowserKey(word, key);
  }

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    throw new Error('No Gemini API key found. Please enter the key in Settings and click Save Settings.');
  }

  return defineWithServer(word, key);
};
