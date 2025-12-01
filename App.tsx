import React, { useState, useEffect } from 'react';
import Fretboard from './components/Fretboard';
import { CHORDS, ChordShape } from './types';
import { Music, Info, Sparkles, Sliders, Palette, ChevronDown } from 'lucide-react';

export type ThemeType = 'classic' | 'anime';

const App: React.FC = () => {
  const [currentChordName, setCurrentChordName] = useState<string>('Em');
  const [isStarted, setIsStarted] = useState(false);
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const chordMap: Record<string, string> = {
        '1': 'Em', '2': 'E', '3': 'Am', '4': 'A',
        '5': 'D', '6': 'C', '7': 'G', '8': 'F'
      };
      if (chordMap[e.key]) {
        setCurrentChordName(chordMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentChord: ChordShape = CHORDS[currentChordName];

  const chordGroups = [
    { name: '基础和弦', chords: ['Em', 'Am', 'C', 'G', 'D', 'A', 'E', 'F'] },
  ];

  // 主题样式配置
  const themeStyles = {
    classic: {
      font: 'font-sans',
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      accent: 'text-indigo-600',
      buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200',
      buttonSecondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
      card: 'bg-white border border-slate-200 shadow-xl',
      header: 'bg-white/80 border-b border-slate-200',
      chordDisplay: 'bg-slate-900 text-white',
      chordSelectorActive: 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2',
      chordSelectorInactive: 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300',
      bgPattern: (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />
      ),
    },
    anime: {
      font: "font-['M_PLUS_Rounded_1c']",
      bg: 'bg-[#fff0f5]',
      text: 'text-[#4a4e69]',
      accent: 'text-pink-500',
      buttonPrimary: 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-200 border-2 border-white',
      buttonSecondary: 'bg-white/60 text-pink-500 border-2 border-white hover:bg-white',
      card: 'bg-white/80 border-2 border-white backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)]',
      header: 'bg-white/70 border-b border-white/50 backdrop-blur-md',
      chordDisplay: 'bg-white/90 border-4 border-white shadow-xl text-slate-700',
      chordSelectorActive: 'bg-gradient-to-b from-pink-400 to-purple-400 text-white border-transparent shadow-lg shadow-pink-300/50',
      chordSelectorInactive: 'bg-white text-slate-500 border-slate-100 hover:border-pink-200 hover:text-pink-400',
      bgPattern: (
        <>
           <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                  backgroundImage: `radial-gradient(#ffcdd2 15%, transparent 16%), radial-gradient(#b3e5fc 15%, transparent 16%)`,
                  backgroundSize: '60px 60px',
                  backgroundPosition: '0 0, 30px 30px'
              }} 
           />
           <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob pointer-events-none"></div>
           <div className="absolute top-10 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
        </>
      ),
    }
  };

  const ts = themeStyles[theme];

  // 欢迎界面
  if (!isStarted) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 ${ts.bg} ${ts.font}`}>
        {ts.bgPattern}

        <div className={`z-10 text-center max-w-md w-full space-y-8 p-10 rounded-3xl backdrop-blur-sm transition-all duration-300 ${ts.card}`}>
          <div className="flex justify-center mb-2">
            <Music className={`${theme === 'anime' ? 'text-pink-400 animate-bounce' : 'text-indigo-600'} transition-colors`} size={48} />
          </div>
          <h1 className="text-4xl font-black pb-2 flex flex-col items-center gap-2">
             <span className={ts.text}>吉他模拟器</span>
             <span className="text-xl font-normal opacity-50 font-mono">Guitar Sim</span>
          </h1>
          
          <div className="flex gap-4 justify-center">
             <button 
                onClick={() => setTheme('classic')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${theme === 'classic' ? 'bg-slate-800 text-white ring-2 ring-slate-800 ring-offset-2' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
             >
                经典风格
             </button>
             <button 
                onClick={() => setTheme('anime')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${theme === 'anime' ? 'bg-pink-400 text-white ring-2 ring-pink-400 ring-offset-2' : 'bg-pink-50 text-pink-400 hover:bg-pink-100'}`}
             >
                二次元风格
             </button>
          </div>

          <button 
            onClick={() => setIsStarted(true)}
            className={`w-full py-4 rounded-2xl font-bold text-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 ${ts.buttonPrimary}`}
          >
            <Sparkles size={24} />
            开始演奏
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${ts.bg} ${ts.font}`}>
      {ts.bgPattern}
      
      {/* 顶部导航栏 */}
      <header className={`p-4 sticky top-0 z-30 transition-colors ${ts.header}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl text-white shadow-md transition-colors ${theme === 'anime' ? 'bg-gradient-to-br from-pink-400 to-purple-400' : 'bg-indigo-600'}`}>
                <Music size={24} />
             </div>
             <h1 className={`text-xl md:text-2xl font-black tracking-tight ${ts.text}`}>
               吉他模拟器 
               {theme === 'anime' && <span className="text-pink-400 text-xs bg-pink-100 px-2 py-1 rounded-full ml-2 align-middle">Moe</span>}
             </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 风格切换 Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-600"
                >
                    <Palette size={16} />
                    <span className="hidden md:inline">{theme === 'classic' ? '经典风格' : '二次元风格'}</span>
                    <ChevronDown size={14} />
                </button>
                
                {isThemeMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1 z-50">
                        <button 
                            onClick={() => { setTheme('classic'); setIsThemeMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                        >
                            经典风格
                            {theme === 'classic' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                        </button>
                        <button 
                            onClick={() => { setTheme('anime'); setIsThemeMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50 text-pink-500 font-medium flex items-center justify-between"
                        >
                            二次元风格
                            {theme === 'anime' && <div className="w-2 h-2 rounded-full bg-pink-400" />}
                        </button>
                    </div>
                )}
            </div>
            
            {/* 提示胶囊 */}
            <div className="hidden md:flex items-center gap-4 text-xs md:text-sm font-bold text-slate-500 bg-white/50 px-4 py-2 rounded-full">
                <span className="flex items-center gap-2"><Info size={16} className="text-blue-400"/> 用鼠标划过琴弦来演奏</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 gap-8 overflow-y-auto w-full max-w-7xl mx-auto z-10">
        
        {/* 和弦展示 */}
        <div className="w-full flex flex-col items-center animate-fade-in-down">
            <div className={`relative px-12 py-6 rounded-3xl text-center transition-all duration-300 ${ts.chordDisplay}`}>
                <h2 className={`text-sm font-bold uppercase tracking-widest mb-1 opacity-60`}>当前和弦</h2>
                <div className="text-6xl font-black flex items-baseline gap-2 justify-center">
                    {currentChordName}
                    <span className="text-xl font-bold opacity-50">和弦</span>
                </div>
            </div>
        </div>

        {/* 指板区域 */}
        <div className="w-full flex justify-center perspective-1000 my-2">
           <Fretboard currentChord={currentChord} mode="chord" theme={theme} />
        </div>

        {/* 控制面板 */}
        <div className={`w-full rounded-3xl p-6 md:p-8 transition-all duration-300 ${ts.card}`}>
           <div className="flex flex-col md:flex-row gap-8">
              
              {/* 和弦选择器 */}
              <div className="flex-1">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className={`flex items-center gap-2 text-xl font-black ${ts.text}`}>
                        <Sliders className={theme === 'anime' ? 'text-purple-400' : 'text-indigo-600'} size={24} />
                        和弦选择
                    </h3>
                    <span className="text-xs bg-slate-200 text-slate-500 px-2 py-1 rounded-md font-bold">键盘快捷键 1-8</span>
                 </div>
                 
                 <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {chordGroups[0].chords.map((chord) => (
                        <button
                            key={chord}
                            onClick={() => setCurrentChordName(chord)}
                            className={`
                                group relative h-16 rounded-2xl font-black text-xl transition-all duration-300
                                ${currentChordName === chord ? ts.chordSelectorActive : ts.chordSelectorInactive}
                            `}
                        >
                            {chord}
                            {/* 快捷键提示 */}
                            <span className={`
                                absolute -top-2 -right-2 w-5 h-5 text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm transition-colors
                                ${currentChordName === chord 
                                    ? (theme === 'anime' ? 'bg-white text-pink-500' : 'bg-white text-indigo-600') 
                                    : 'bg-slate-200 text-slate-500'}
                            `}>
                                {Object.keys({ '1': 'Em', '2': 'E', '3': 'Am', '4': 'A', '5': 'D', '6': 'C', '7': 'G', '8': 'F' }).find(key => 
                                    // @ts-ignore
                                    ({ '1': 'Em', '2': 'E', '3': 'Am', '4': 'A', '5': 'D', '6': 'C', '7': 'G', '8': 'F' })[key] === chord
                                )}
                            </span>
                        </button>
                    ))}
                 </div>
              </div>

              {/* 玩法说明 */}
              <div className={`w-full md:w-80 rounded-2xl p-6 ${theme === 'anime' ? 'bg-gradient-to-b from-blue-50 to-white border-2 border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                  <h4 className={`text-sm font-black mb-4 flex items-center gap-2 ${theme === 'anime' ? 'text-blue-400' : 'text-slate-700'}`}>
                      <Sparkles size={16} />
                      玩法说明
                  </h4>
                  <ul className="space-y-4 text-sm text-slate-600 font-medium">
                      <li className="flex items-start gap-3">
                          <span className={`min-w-[24px] h-6 rounded-lg flex items-center justify-center text-xs font-bold ${theme === 'anime' ? 'bg-blue-100 text-blue-500' : 'bg-slate-200 text-slate-700'}`}>1</span>
                          <span>在左侧点击选择一个和弦 (或按键盘 1-8)。</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <span className={`min-w-[24px] h-6 rounded-lg flex items-center justify-center text-xs font-bold ${theme === 'anime' ? 'bg-blue-100 text-blue-500' : 'bg-slate-200 text-slate-700'}`}>2</span>
                          <span>移动鼠标快速划过琴弦来拨动它们。</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <span className={`min-w-[24px] h-6 rounded-lg flex items-center justify-center text-xs font-bold ${theme === 'anime' ? 'bg-blue-100 text-blue-500' : 'bg-slate-200 text-slate-700'}`}>3</span>
                          <span>系统会自动帮你按好品格，尽情演奏吧！</span>
                      </li>
                  </ul>
              </div>

           </div>
        </div>

      </main>
      
      <footer className="p-6 text-center text-slate-400 text-xs font-bold tracking-wider">
        MADE WITH ❤️ BY EASYSTRUM
      </footer>
    </div>
  );
};

export default App;