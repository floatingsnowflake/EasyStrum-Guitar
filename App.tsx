import React, { useState, useEffect, useRef } from 'react';
import Fretboard from './components/Fretboard';
import { CHORDS, ChordShape, STRINGS } from './types';
import { playNote } from './services/audioEngine';
import { Music, Palette, Zap, LayoutGrid, Keyboard } from 'lucide-react';

export type ThemeType = 'classic' | 'anime';
type PlayMode = 'chord' | 'custom';

const App: React.FC = () => {
  const [currentChordName, setCurrentChordName] = useState<string>('Em');
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [playMode, setPlayMode] = useState<PlayMode>('chord');
  
  // Custom mode state: Array of 6 frets (0 = open, -1 = muted)
  const [customFrets, setCustomFrets] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  
  // Visual vibration state synced between keyboard and touch
  const [strumTimestamps, setStrumTimestamps] = useState<number[]>(new Array(6).fill(0));

  // Determine active frets based on mode
  const currentChordShape: ChordShape | null = playMode === 'chord' 
    ? CHORDS[currentChordName] 
    : { name: 'Custom', frets: customFrets };

  // Core Audio Trigger
  const triggerString = (stringIndex: number, fret: number) => {
    if (fret === -1) return; // Muted
    
    // Play Audio
    playNote(stringIndex, fret, STRINGS[stringIndex].semiToneOffset);

    // Update Visuals
    setStrumTimestamps(prev => {
      const next = [...prev];
      next[stringIndex] = Date.now();
      return next;
    });
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const key = e.key.toLowerCase();

      // 1. Strumming Keys (Available in all modes)
      // Space: Strum all active strings
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        const activeFrets = currentChordShape?.frets || [0,0,0,0,0,0];
        activeFrets.forEach((fret, index) => {
          if (fret !== -1) {
            // Stagger slightly for realism
            setTimeout(() => triggerString(index, fret), index * 30);
          }
        });
        return;
      }

      // Individual String Plucking (A S D F G H -> String 6 5 4 3 2 1)
      const stringKeys = ['a', 's', 'd', 'f', 'g', 'h'];
      const stringIndex = stringKeys.indexOf(key);
      if (stringIndex !== -1) {
        const fret = currentChordShape?.frets[stringIndex] ?? 0;
        triggerString(stringIndex, fret);
        return;
      }

      // 2. Mode Specific Controls
      if (playMode === 'chord') {
        const chordMap: Record<string, string> = {
          '1': 'Em', '2': 'E', '3': 'Am', '4': 'A',
          '5': 'D', '6': 'C', '7': 'G', '8': 'F'
        };
        if (chordMap[key]) {
          setCurrentChordName(chordMap[key]);
        }
      } else {
        // Custom Mode: Numbers 0-9 set Global Fret (Capo style)
        // User can then tweak individual strings via mouse
        if (!isNaN(parseInt(key))) {
          const fret = parseInt(key);
          setCustomFrets(new Array(6).fill(fret));
        }
      }

      // Mode Switching
      if (key === 'm') {
        setPlayMode(prev => prev === 'chord' ? 'custom' : 'chord');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playMode, currentChordShape]);

  // Handle clicking a fret in Custom Mode
  const handleFretToggle = (stringIndex: number, fret: number) => {
    if (playMode !== 'custom') return;
    
    setCustomFrets(prev => {
      const next = [...prev];
      // If clicking the same fret, toggle to Open (0). If already Open, maybe Mute? 
      // Let's keep it simple: Click to set fret. 
      // Special case: clicking nut (0) sets to 0.
      next[stringIndex] = fret;
      return next;
    });
  };

  const chordList = ['Em', 'Am', 'C', 'G', 'D', 'A', 'E', 'F'];

  const ts = {
    classic: {
      appBg: 'bg-[#121212]',
      textPrimary: 'text-gray-100',
      textSecondary: 'text-gray-400',
      panelBg: 'bg-[#1e1e1e] border-gray-800',
      button: 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border-gray-700',
      buttonActive: 'bg-amber-700 text-white border-amber-600 shadow-[0_0_15px_rgba(180,83,9,0.4)]',
      fretboardContainer: 'shadow-[0_20px_50px_-12px_rgba(0,0,0,1)]',
    },
    anime: {
      appBg: 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50',
      textPrimary: 'text-slate-700',
      textSecondary: 'text-slate-500',
      panelBg: 'bg-white/60 backdrop-blur-xl border-white/50 shadow-lg',
      button: 'bg-white/50 text-slate-600 hover:bg-white border-white',
      buttonActive: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white border-transparent shadow-lg',
      fretboardContainer: 'shadow-[0_20px_40px_-12px_rgba(168,85,247,0.2)]',
    }
  }[theme];

  return (
    <div className={`w-full h-full fixed inset-0 flex flex-col overflow-hidden transition-colors duration-500 ${ts.appBg} ${theme === 'anime' ? "font-['M_PLUS_Rounded_1c']" : 'font-sans'}`}>
      
      {/* Header */}
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
           <button 
             onClick={() => setTheme(theme === 'classic' ? 'anime' : 'classic')}
             className={`p-2 rounded-full transition-all ${ts.button}`}
             title="Switch Theme"
           >
             <Palette size={20} />
           </button>
        </div>
      </header>

      {/* Main Fretboard Area */}
      <main className="flex-1 relative flex flex-col justify-center items-center w-full px-0 md:px-8 py-4 overflow-hidden">
         {/* Instruction Overlay */}
         <div className={`absolute top-2 z-10 pointer-events-none transition-opacity duration-500 ${playMode === 'custom' ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`flex flex-col items-center gap-2 px-6 py-2 rounded-2xl backdrop-blur-md ${theme === 'classic' ? 'bg-black/40 border border-amber-900/50 text-amber-500' : 'bg-white/40 border border-pink-200 text-pink-500'}`}>
               <span className="text-xs font-bold flex items-center gap-2">
                 <Zap size={12}/> Custom Mode
               </span>
               <div className="text-[10px] opacity-80 text-center leading-tight">
                 Click frets to set shape.<br/>
                 Press <b>Space</b> to strum.<br/>
                 Keys <b>A-S-D-F-G-H</b> pluck strings.
               </div>
            </div>
         </div>

         <div className={`w-full h-full max-h-[60vh] md:max-h-[400px] w-full max-w-6xl relative ${ts.fretboardContainer} transition-all duration-300`}>
            <Fretboard 
              currentChord={currentChordShape} 
              mode={playMode} 
              theme={theme}
              strumTimestamps={strumTimestamps}
              onStrum={triggerString}
              onFretToggle={handleFretToggle}
            />
         </div>
      </main>

      {/* Controls Panel */}
      <div className={`shrink-0 z-30 transition-all duration-300 rounded-t-3xl border-t ${ts.panelBg}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8 md:pb-8 flex flex-col gap-4">
            
            {/* Mode Switcher */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex bg-black/5 p-1 rounded-xl gap-1">
                    <button 
                       onClick={() => setPlayMode('chord')}
                       className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${playMode === 'chord' ? ts.buttonActive : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid size={14} /> Chords
                    </button>
                    <button 
                       onClick={() => setPlayMode('custom')}
                       className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${playMode === 'custom' ? ts.buttonActive : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Zap size={14} /> Custom
                    </button>
                </div>

                <div className={`text-2xl font-black ${ts.textPrimary} tracking-tight`}>
                    {playMode === 'chord' ? (
                        <span>{currentChordName}</span>
                    ) : (
                        <span className="flex items-center gap-2 text-lg">
                           <Keyboard size={20} className="opacity-50"/> 
                           <span className="hidden md:inline text-xs font-normal opacity-50 mr-2">Use A-H Keys</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Chord Buttons */}
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
               <div className={`w-full h-12 md:h-14 flex items-center justify-center text-sm ${ts.textSecondary} opacity-60`}>
                  Tap the fretboard to create a custom chord shape.
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;