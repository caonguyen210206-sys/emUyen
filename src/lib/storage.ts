import { VocabItem, UserSettings, QuizSession } from "../types";

export const getVocabItems = async (): Promise<VocabItem[]> => {
  const data = localStorage.getItem('vocab_items');
  return data ? JSON.parse(data) : [];
};

export const saveVocabItems = async (items: VocabItem[]) => {
  localStorage.setItem('vocab_items', JSON.stringify(items));
};

export const getSettings = async (): Promise<UserSettings> => {
  const data = localStorage.getItem('user_settings');
  return data ? JSON.parse(data) : { apiKey: '', defaultQuestions: 10, defaultCriteria: ['Meaning', 'Word Type', 'Synonyms'] };
};

export const saveSettings = async (settings: UserSettings) => {
  localStorage.setItem('user_settings', JSON.stringify(settings));
};

export const getQuizSessions = async (): Promise<QuizSession[]> => {
  const data = localStorage.getItem('quiz_sessions');
  return data ? JSON.parse(data) : [];
};

export const saveQuizSession = async (session: QuizSession) => {
  const sessions = await getQuizSessions();
  sessions.push(session);
  localStorage.setItem('quiz_sessions', JSON.stringify(sessions));
};
