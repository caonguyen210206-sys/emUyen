import { ViewState } from '../types';
import { Play, Calendar, BookOpen, CheckCircle, Target, Sparkles, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getVocabItems } from '../lib/storage';
import { VocabItem } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  setCurrentView: (view: ViewState) => void;
}

export default function Dashboard({ setCurrentView }: DashboardProps) {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [showApology, setShowApology] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVocabItems();
      setItems(data);
    };
    fetchData();
  }, []);

  const wordsStored = items.length;
  const activeWords = items.filter(i => i.status === 'Studying').length;
  const completedWords = items.filter(i => i.status === 'Completed').length;
  const avgScore = items.length ? Math.round(items.reduce((acc, curr) => acc + (curr.lastScore || 0), 0) / items.length) : 0;

  const countNew = items.filter(i => i.masteryLevel === 'New' || !i.masteryLevel).length;
  const countMastery = items.filter(i => i.masteryLevel === 'Mastery' || i.status === 'Completed').length;

  const toReview = items.filter(i => i.status === 'Studying').slice(0, 3);

  const statusData = [
    { name: 'Đang học', value: activeWords },
    { name: 'Hoàn thành', value: completedWords }
  ];
  const statusColors = ['#69E092', '#FBC02D'];

  const masteryData = [
    { name: 'Mới', value: countNew },
    { name: 'Thành thạo', value: countMastery }
  ];
  const masteryColors = ['#D1D5DB', '#7DB5FA'];

  const bandMap: Record<string, number> = { 'N/A': 0, 'Band 6': 0, 'Band 6.5': 0, 'Band 7': 0, 'Band 7.5': 0 };
  items.forEach(item => {
    const b = item.band?.toLowerCase().trim();
    if (!b) bandMap['N/A']++;
    else if (b.includes('6.5')) bandMap['Band 6.5']++;
    else if (b.includes('6')) bandMap['Band 6']++;
    else if (b.includes('7.5')) bandMap['Band 7.5']++;
    else if (b.includes('7')) bandMap['Band 7']++;
    else bandMap['N/A']++;
  });
  const bandData = Object.keys(bandMap).map(k => ({ name: k, value: bandMap[k] }));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D5A27] flex items-center gap-2">
            Hello, hôm nay học từ nào? 👋
          </h2>
          <p className="text-gray-500 font-medium mt-1">Tiếp tục lộ trình của bạn.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowApology(true)}
            className="flex items-center gap-3 px-10 py-5 bg-pink-100 text-pink-600 hover:bg-pink-200 text-xl font-extrabold rounded-[1.5rem] border-2 border-pink-300 shadow-md transition-all active:scale-95 hover:shadow-lg hover:-translate-y-1"
          >
            <Heart fill="currentColor" size={28} className="animate-pulse" />
            Khi nào giận anh thì ấn vào đây
          </button>
        </div>
      </header>

      {showApology && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[3rem] card-shadow border border-pink-100 flex flex-col items-center max-w-sm text-center relative animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Heart className="text-pink-500 w-12 h-12" fill="currentColor" />
            </div>
            <h3 className="text-3xl font-extrabold text-pink-500 mb-4 font-sans">Anh xin lỗi em rất nhiều!</h3>
            <p className="text-pink-400 font-medium text-lg mb-8">Năn nỉ đừng giận anh nữa nha nha nha 🥺👉👈</p>
            <button 
              onClick={() => setShowApology(false)}
              className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-sm transition-colors active:scale-95 w-full"
            >
              Hết giận rồi ❤️
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Từ đã lưu', value: wordsStored, icon: BookOpen, color: 'text-[#2D5A27]', bg: 'bg-[#E8F5E9]' },
          { label: 'Đang học', value: activeWords, icon: Target, color: 'text-[#2D5A27]', bg: 'bg-[#D0E8D0]' },
          { label: 'Hoàn thành', value: completedWords, icon: CheckCircle, color: 'text-[#2D5A27]', bg: 'bg-[#A5D6A7]' },
          { label: 'Điểm trung bình', value: `${avgScore}%`, icon: Sparkles, color: 'text-[#795548]', bg: 'bg-[#FFECB3]' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] card-shadow border-thin flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className={`absolute top-4 right-4 ${kpi.color} opacity-20`}>
              <kpi.icon size={32} strokeWidth={2} />
            </div>
            <span className="text-gray-400 text-sm font-semibold uppercase mb-1 z-10">{kpi.label}</span>
            <h3 className={`text-4xl font-bold ${kpi.color} z-10`}>{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-8 rounded-[1rem] card-shadow border-thin">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Phân bổ trạng thái</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mastery Distribution */}
        <div className="bg-white p-8 rounded-[1rem] card-shadow border-thin">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Phân bổ thành thạo</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={masteryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {masteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={masteryColors[index % masteryColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Band Distribution */}
        <div className="col-span-2 bg-white p-8 rounded-[1rem] card-shadow border-thin">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Phân bổ theo Band</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={true} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={true} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#32D390" radius={[4, 4, 0, 0]} barSize={100} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
