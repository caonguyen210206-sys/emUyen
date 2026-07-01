/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ViewState } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import VocabList from './components/VocabList';
import Practice from './components/Practice';
import MonthlyReview from './components/MonthlyReview';
import Settings from './components/Settings';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-gray-800 font-sans overflow-hidden relative">
      {/* Greeting Toast */}
      {showGreeting && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10 fade-in duration-500">
          <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-pink-200 flex items-center gap-3">
            <Sparkles className="text-pink-400" size={24} />
            <span className="text-pink-500 font-extrabold text-lg">Chúc em học bài tốt nhée! 🥰</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
          {currentView === 'library' && <Library setCurrentView={setCurrentView} />}
          {currentView === 'vocab-list' && <VocabList />}
          {currentView === 'practice' && <Practice />}
          {currentView === 'monthly-review' && <MonthlyReview />}
          {currentView === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
