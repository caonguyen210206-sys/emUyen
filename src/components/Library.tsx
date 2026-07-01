import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, FileUp } from 'lucide-react';
import { ViewState, VocabItem } from '../types';
import { getVocabItems, saveVocabItems } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

interface LibraryProps {
  setCurrentView: (v: ViewState) => void;
}

export default function Library({ setCurrentView }: LibraryProps) {
  const [items, setItems] = useState<VocabItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVocabItems();
      setItems(data);
    };
    fetchData();
  }, []);

  const addToList = async (id: string) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, status: 'Studying' as const } : item
    );
    setItems(newItems);
    await saveVocabItems(newItems);
  };

  const exportCSV = () => {
    const header = "word,meaning,type,band,source,status\n";
    const csvContent = items.map(item => 
      `${item.word},${item.meaning},${item.wordType},${item.band || ''},${item.source || ''},${item.status}`
    ).join("\n");
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vocab_library.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Đã xuất CSV!');
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newItems: VocabItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [word, meaning, type, band, source, status] = line.split(',');
        newItems.push({
          id: uuidv4(),
          word: word || '',
          meaning: meaning || '',
          wordType: type || '',
          band: band || '',
          source: source || '',
          status: (status as any) || 'Storage',
          masteryLevel: 'New',
          ipa: '',
          definition: '',
          example: '',
          synonyms: '',
          antonyms: '',
          topic: '',
          createdAt: Date.now(),
          timesChecked: 0,
        });
      }
      const updated = [...items, ...newItems];
      setItems(updated);
      await saveVocabItems(updated);
      alert('Đã nhập CSV thành công!');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#2D5A27]">Vocabulary Library</h2>
          <p className="text-gray-500 font-medium mt-1">Kho lưu trữ từ vựng tổng</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={importCSV} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-thin font-bold rounded-xl shadow-sm hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <FileUp size={18} />
            Import CSV
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-thin font-bold rounded-xl shadow-sm hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={() => setCurrentView('vocab-list')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#A5D6A7] hover:bg-[#81C784] text-[#2D5A27] font-bold rounded-xl border-thin shadow-sm transition-colors"
          >
            <Plus size={18} />
            Add Word
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] card-shadow border-thin overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-thin">
                <th className="p-5 font-bold text-gray-500 w-32">Status</th>
                <th className="p-5 font-bold text-gray-500">Word</th>
                <th className="p-5 font-bold text-gray-500">Meaning</th>
                <th className="p-5 font-bold text-gray-500">Source</th>
                <th className="p-5 font-bold text-gray-500">Band</th>
                <th className="p-5 font-bold text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Storage' ? 'bg-gray-100 text-gray-600' :
                      item.status === 'Studying' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-5 font-bold text-gray-800">{item.word}</td>
                  <td className="p-5 text-gray-600 font-medium">{item.meaning}</td>
                  <td className="p-5 text-gray-500 font-medium">{item.source || '-'}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                      {item.band || '-'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {item.status === 'Storage' ? (
                      <button 
                        onClick={() => addToList(item.id)}
                        className="text-sm font-bold text-[#2D5A27] hover:text-[#1B3617] bg-[#E8F5E9] px-4 py-2 rounded-xl transition-colors border-thin"
                      >
                        Add to List
                      </button>
                    ) : item.status === 'Studying' ? (
                      <button 
                        onClick={() => setCurrentView('vocab-list')}
                        className="text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 px-4 py-2 rounded-xl transition-colors border-thin"
                      >
                        View
                      </button>
                    ) : (
                      <button 
                        onClick={() => setCurrentView('practice')}
                        className="text-sm font-bold text-[#795548] hover:text-[#5D4037] bg-[#FFECB3] px-4 py-2 rounded-xl transition-colors border-thin"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">
                    Library is empty. Add some words to get started!
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
