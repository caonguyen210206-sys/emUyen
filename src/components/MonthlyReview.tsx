import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { getVocabItems, saveVocabItems } from '../lib/storage';
import { VocabItem } from '../types';

type MonthlyAnswer = {
  id: string;
  vocabItemId: string;
  answer1: string;
  answer2: string;
  notes: string;
  isCorrect1?: boolean;
  isCorrect2?: boolean;
};

export default function MonthlyReview() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [answers, setAnswers] = useState<MonthlyAnswer[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle');
  
  useEffect(() => {
    const fetchData = async () => {
      const activeItems = (await getVocabItems()).filter(i => i.status !== 'Storage').slice(0, 10);
      setItems(activeItems);
      setAnswers(activeItems.map(item => ({
        id: item.id,
        vocabItemId: item.id,
        answer1: '',
        answer2: '',
        notes: ''
      })));
    };
    fetchData();
  }, []);

  const updateAnswer = (id: string, field: keyof MonthlyAnswer, value: string) => {
    setAnswers(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const submitReview = () => {
    setAnswers(prev => prev.map(a => {
      const item = items.find(i => i.id === a.vocabItemId);
      if (!item) return a;
      return {
        ...a,
        isCorrect1: a.answer1.trim().toLowerCase() === item.word.toLowerCase(),
        isCorrect2: a.answer2.trim().toLowerCase() === item.wordType.toLowerCase()
      };
    }));
    setStatus('submitted');
  };

  const saveReview = async () => {
    // Basic logic to update stats if needed
    const stored = await getVocabItems();
    const updated = stored.map(item => {
      const ans = answers.find(a => a.vocabItemId === item.id);
      if (ans && status === 'submitted') {
        const score = (ans.isCorrect1 ? 50 : 0) + (ans.isCorrect2 ? 50 : 0);
        return {
          ...item,
          lastScore: score,
          status: score === 100 ? 'Completed' : 'Studying' as any
        };
      }
      return item;
    });
    await saveVocabItems(updated);
    alert('Review saved successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-[#2D5A27]">Monthly Vocab Review</h2>
          <p className="text-gray-500 font-medium mt-1">Ôn tập định kỳ</p>
          <div className="flex gap-4 mt-6">
            <select className="bg-white border-thin px-4 py-2 rounded-xl font-bold text-gray-600 focus:outline-none focus:border-[#A5D6A7]">
              <option>Month: Current</option>
            </select>
            <select className="bg-white border-thin px-4 py-2 rounded-xl font-bold text-gray-600 focus:outline-none focus:border-[#A5D6A7]">
              <option>Language: Foreign</option>
            </select>
            <select className="bg-white border-thin px-4 py-2 rounded-xl font-bold text-gray-600 focus:outline-none focus:border-[#A5D6A7]">
              <option>Topic: All</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={saveReview} disabled={status !== 'submitted'} className="flex items-center gap-2 px-5 py-2.5 bg-[#FFECB3] hover:bg-[#FFE082] text-[#795548] font-bold rounded-xl border-thin shadow-sm transition-colors disabled:opacity-50">
            <Save size={18} />
            Save Review
          </button>
          <button onClick={submitReview} disabled={status === 'submitted'} className="flex items-center gap-2 px-5 py-2.5 bg-[#A5D6A7] hover:bg-[#81C784] text-[#2D5A27] font-bold rounded-xl border-thin shadow-sm transition-colors disabled:opacity-50">
            <CheckCircle size={18} />
            Submit Review
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-[2.5rem] card-shadow border-thin overflow-hidden flex flex-col mt-4">
        <div className="p-4 border-b border-thin bg-gray-50/50 flex justify-between items-center">
          <div className="flex gap-4">
            <span className="font-bold text-gray-600 px-3 py-1 bg-gray-200/50 rounded-lg text-sm">Crit 1: Từ vựng</span>
            <span className="font-bold text-gray-600 px-3 py-1 bg-gray-200/50 rounded-lg text-sm">Crit 2: Loại từ</span>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm">
                <th className="p-4 w-12 text-center text-gray-400">#</th>
                <th className="p-4 font-bold text-gray-500 w-1/4">Question (Meaning)</th>
                <th className="p-4 font-bold text-gray-500">Answer 1 (Word)</th>
                <th className="p-4 font-bold text-gray-500">Answer 2 (Type)</th>
                <th className="p-4 font-bold text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, idx) => {
                const ans = answers.find(a => a.vocabItemId === item.id);
                if (!ans) return null;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="p-4 font-bold text-gray-800">{item.meaning}</td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={ans.answer1}
                        onChange={(e) => updateAnswer(item.id, 'answer1', e.target.value)}
                        disabled={status === 'submitted'}
                        className={`w-full px-3 py-2 bg-gray-50 border rounded-xl font-medium focus:outline-none ${status === 'submitted' ? (ans.isCorrect1 ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700') : 'border-gray-200 focus:border-[#4ADE80]'}`} 
                      />
                      {status === 'submitted' && !ans.isCorrect1 && <div className="text-sm font-bold text-green-600 mt-1">{item.word}</div>}
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={ans.answer2}
                        onChange={(e) => updateAnswer(item.id, 'answer2', e.target.value)}
                        disabled={status === 'submitted'}
                        className={`w-full px-3 py-2 bg-gray-50 border rounded-xl font-medium focus:outline-none ${status === 'submitted' ? (ans.isCorrect2 ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700') : 'border-gray-200 focus:border-[#4ADE80]'}`} 
                      />
                      {status === 'submitted' && !ans.isCorrect2 && <div className="text-sm font-bold text-green-600 mt-1">{item.wordType}</div>}
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={ans.notes}
                        onChange={(e) => updateAnswer(item.id, 'notes', e.target.value)}
                        placeholder="Ghi chú..." 
                        className="w-full px-3 py-2 bg-transparent border-b border-transparent focus:border-gray-200 font-medium focus:outline-none text-gray-500 placeholder-gray-300" 
                      />
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                    No words to review this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
