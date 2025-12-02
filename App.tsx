import React, { useState, useEffect } from 'react';
import Fretboard from './components/Fretboard';
import { CHORDS, ChordShape } from './types';
import { Music, Sliders, Palette, Zap, Hand, LayoutGrid, Info } from 'lucide-react';

export type ThemeType = 'classic' | 'anime';
type PlayMode = 'chord' | 'solo';

const App: React.FC = () => {
  const [currentChordName, setCurrentChordName] = useState<string>('Em');
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [playMode, setPlayMode] = useState<PlayMode>('chord');
  const [manualFret, setManualFret] = useState<number>(0);
  
  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for number keys to avoid browser issues if needed, 
      // but usually not needed unless focused on inputs.
      
      if (playMode === 'chord') {
        const chordMap: Record<string, string> = {
          '1': 'Em', '2': 'E', '3': 'Am', '4': 'A',
          '5': 'D', '6': 'C', '7': 'G', '8': 'F'
        };
        if (chordMap[e.key]) {
          setCurrentChordName(chordMap[e.key]);
        }
      } else {
        // Solo Mode: Numbers 0-9 set the fret
        if (!isNaN(parseInt(e.key))) {
          const fret = parseInt(e.key);
          setManualFret(fret);
        }
      }

      // Mode switching
      if (e.key === 'm' || e.key === 'M') {
        setPlayMode(prev => prev === 'chord' ? 'solo' : 'chord');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playMode]);

  const currentChord: ChordShape = CHORDS[currentChordName];
  const chordList = ['Em', 'Am', 'C', 'G', 'D', 'A', 'E', 'F'];

  // 主题样式配置
  const ts = {
    classic: {
      appBg: 'bg-[#121212]',
      textPrimary: 'text-gray-100',
      textSecondary: 'text-gray-400',
      accent: 'text-amber-500',
      panelBg: 'bg-[#1e1e1e] border-gray-800',
      button: 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border-gray-700',
      buttonActive: 'bg-amber-700 text-white border-amber-600 shadow-[0_0_15px_rgba(180,83,9,0.4)]',
      fretboardContainer: 'shadow-[0_20px_50px_-12px_rgba(0,0,0,1)]',
    },
    anime: {
      appBg: 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50',
      textPrimary: 'text-slate-700',
      textSecondary: 'text-slate-500',
      accent: 'text-pink-500',
      panelBg: 'bg-white/60 backdrop-blur-xl border-white/50 shadow-lg',
      button: 'bg-white/50 text-slate-600 hover:bg-white border-white',
      buttonActive: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white border-transparent shadow-lg',
      fretboardContainer: 'shadow-[0_20px_40px_-12px_rgba(168,85,247,0.2)]',
    }
  }[theme];

  return (
    <div className={`w-full h-full fixed inset-0 flex flex-col overflow-hidden transition-colors duration-500 ${ts.appBg} ${theme === 'anime' ? "font-['M_PLUS_Rounded_1c']" : 'font-sans'}`}>
      
      {/* 顶部控制栏 */}
      <header className={`px-4 py-3 md:py-4 flex justify-between items-center z-20 shrink-0 ${theme === 'classic' ? 'border-b border-gray-800 bg-[#121212]' : 'bg-white/30 backdrop-blur-sm'}`}>
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg ${theme === 'anime' ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg' : 'bg-amber-600 text-white'}`}>
             <Music size={20} />
           </div>
           <div>
             <h1 className={`text-lg md:text-xl font-bold tracking-tight leading-none ${ts.textPrimary}`}>EasyStrum</h1>
             <p className={`text-[10px] md:text-xs ${ts.textSecondary}`}>Virtual Guitar</p>
           </div>
        </div>

        <div className="flex gap-2 md:gap-4">
           {/* Theme Toggle */}
           <button 
             onClick={() => setTheme(theme === 'classic' ? 'anime' : 'classic')}
             className={`p-2 rounded-full transition-all ${ts.button}`}
             title="Switch Theme"
           >
             <Palette size={20} />
           </button>
        </div>
      </header>

      {/* 中间主要区域：指板 */}
      <main className="flex-1 relative flex flex-col justify-center items-center w-full px-0 md:px-8 py-4 overflow-hidden">
         {/* 信息提示 */}
         <div className={`absolute top-4 transition-opacity duration-300 ${playMode === 'solo' ? 'opacity-100' : 'opacity-0'} pointer-events-none z-10`}>
            <div className={`px-4 py-1 rounded-full text-xs font-bold backdrop-blur-md ${theme === 'classic' ? 'bg-amber-900/30 text-amber-500 border border-amber-800' : 'bg-pink-100/50 text-pink-500 border border-pink-200'}`}>
               Manual Mode: Press 0-9 to set fret
            </div>
         </div>

         <div className={`w-full h-full max-h-[60vh] md:max-h-[400px] w-full max-w-6xl relative ${ts.fretboardContainer} transition-all duration-300`}>
            <Fretboard 
              currentChord={currentChord} 
              mode={playMode} 
              manualFret={manualFret}
              theme={theme} 
            />
         </div>
         
         {/* Mobile Swipe Hint */}
         <div className={`mt-4 text-[10px] md:hidden flex items-center gap-1 opacity-50 ${ts.textSecondary}`}>
            <Hand size={12} /> Swipe across strings to play
         </div>
      </main>

      {/* 底部控制面板 */}
      <div className={`shrink-0 z-30 transition-all duration-300 rounded-t-3xl border-t ${ts.panelBg}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8 md:pb-8 flex flex-col gap-4">
            
            {/* 模式切换 & 状态显示 */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex bg-black/5 p-1 rounded-xl gap-1">
                    <button 
                       onClick={() => setPlayMode('chord')}
                       className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${playMode === 'chord' ? ts.buttonActive : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid size={14} /> Chords
                    </button>
                    <button 
                       onClick={() => setPlayMode('solo')}
                       className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${playMode === 'solo' ? ts.buttonActive : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Zap size={14} /> Solo
                    </button>
                </div>

                {/* Display Current State */}
                <div className={`text-2xl font-black ${ts.textPrimary} tracking-tight`}>
                    {playMode === 'chord' ? (
                        <span>{currentChordName}</span>
                    ) : (
                        <span className="flex items-center gap-2 text-lg">
                           Fret <span className={`px-2 rounded ${theme === 'classic' ? 'bg-amber-900 text-amber-500' : 'bg-pink-100 text-pink-500'}`}>{manualFret}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* 动态控制区 */}
            {playMode === 'chord' ? (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
                  {chordList.map((chord, index) => (
                    <button
                        key={chord}
                        onClick={() => setCurrentChordName(chord)}
                        className={`
                            h-12 md:h-14 rounded-xl text-lg font-bold transition-all relative
                            ${currentChordName === chord ? ts.buttonActive : ts.button}
                            border
                        `}
                    >
                        {chord}
                        <span className="absolute top-1 right-1.5 text-[8px] opacity-50">{index + 1}</span>
                    </button>
                  ))}
              </div>
            ) : (
              // Manual Fret Selection UI
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar md:justify-center">
                  {[0, 1, 2, 3, 4, 5, 7, 9, 12].map((fret) => (
                      <button
                          key={fret}
                          onClick={() => setManualFret(fret)}
                          className={`
                             min-w-[3rem] h-12 rounded-xl font-bold border transition-all
                             ${manualFret === fret ? ts.buttonActive : ts.button}
                          `}
                      >
                          {fret}
                      </button>
                  ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;