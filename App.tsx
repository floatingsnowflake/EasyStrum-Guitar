import React, { useState, useEffect, useRef } from 'react';
import Fretboard from './components/Fretboard';
import Timeline from './components/Timeline';
import KeySettingsModal, { KeyMap, ActionType } from './components/KeySettingsModal';
import { CHORDS, ChordShape, STRINGS, SheetNote } from './types';
import { playNote } from './services/audioEngine';
import { Music, Palette, Zap, LayoutGrid, Keyboard, Delete, Settings2, FileMusic, BookOpen } from 'lucide-react';

export type ThemeType = 'classic' | 'anime';
type PlayMode = 'chord' | 'custom' | 'sheet';

// Default Keys based on user request
const DEFAULT_KEY_MAP: KeyMap = {
  // Frets 0-15: 1234 qwer asdf zxcv
  '1': { type: 'fret', value: 0 },
  '2': { type: 'fret', value: 1 },
  '3': { type: 'fret', value: 2 },
  '4': { type: 'fret', value: 3 },
  'q': { type: 'fret', value: 4 },
  'w': { type: 'fret', value: 5 },
  'e': { type: 'fret', value: 6 },
  'r': { type: 'fret', value: 7 },
  'a': { type: 'fret', value: 8 },
  's': { type: 'fret', value: 9 },
  'd': { type: 'fret', value: 10 },
  'f': { type: 'fret', value: 11 },
  'z': { type: 'fret', value: 12 },
  'x': { type: 'fret', value: 13 },
  'c': { type: 'fret', value: 14 },
  'v': { type: 'fret', value: 15 },

  // Strings: u i o j k l (Assuming u=String 6/Index 0, l=String 1/Index 5)
  'u': { type: 'string', value: 0 }, // E
  'i': { type: 'string', value: 1 }, // A
  'o': { type: 'string', value: 2 }, // D
  'j': { type: 'string', value: 3 }, // G
  'k': { type: 'string', value: 4 }, // B
  'l': { type: 'string', value: 5 }, // e
};

const App: React.FC = () => {
  const [currentChordName, setCurrentChordName] = useState<string>('Em');
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [playMode, setPlayMode] = useState<PlayMode>('chord');
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [keyMapping, setKeyMapping] = useState<KeyMap>(() => {
    try {
      const saved = localStorage.getItem('guitar_key_map');
      return saved ? JSON.parse(saved) : DEFAULT_KEY_MAP;
    } catch {
      return DEFAULT_KEY_MAP;
    }
  });

  useEffect(() => {
    localStorage.setItem('guitar_key_map', JSON.stringify(keyMapping));
  }, [keyMapping]);
  
  // Custom mode state: Array of 6 frets (0 = open, -1 = muted)
  const [customFrets, setCustomFrets] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  
  // Fret Queue for melodic play
  const [fretQueue, setFretQueue] = useState<number[]>([]);
  
  // --- Sheet Mode State ---
  const [sheetNotes, setSheetNotes] = useState<SheetNote[]>([]);
  const [sheetIndex, setSheetIndex] = useState<number>(0);
  const [isSheetRecording, setIsSheetRecording] = useState<boolean>(false);
  const [wrongStringError, setWrongStringError] = useState<number | null>(null); // holds string index of error

  // Visual vibration state synced between keyboard and touch
  const [strumTimestamps, setStrumTimestamps] = useState<number[]>(new Array(6).fill(0));

  // Determine active frets based on mode
  let currentChordShape: ChordShape | null = null;
  
  if (playMode === 'chord') {
    currentChordShape = CHORDS[currentChordName];
  } else if (playMode === 'custom') {
    currentChordShape = { name: 'Custom', frets: customFrets };
  } else if (playMode === 'sheet') {
    // In sheet mode, we ideally visualize the *next* note to be played
    // or maybe the current frets if recording.
    if (isSheetRecording) {
      currentChordShape = { name: 'Recording', frets: customFrets };
    } else {
      // In Playback, visualize the fret of the NEXT note on the correct string
      const nextNote = sheetNotes[sheetIndex];
      const frets = [-1, -1, -1, -1, -1, -1];
      if (nextNote) {
        frets[nextNote.stringIndex] = nextNote.fret;
      }
      currentChordShape = { name: 'Sheet', frets };
    }
  }

  // Core Audio Trigger
  const triggerString = (stringIndex: number, fret: number, isAuto: boolean = false) => {
    if (fret === -1) return; // Muted
    
    // Play Audio
    playNote(stringIndex, fret, STRINGS[stringIndex].semiToneOffset);

    // Update Visuals
    setStrumTimestamps(prev => {
      const next = [...prev];
      next[stringIndex] = Date.now();
      return next;
    });

    // Recording Logic (Only manual triggers)
    if (playMode === 'sheet' && isSheetRecording && !isAuto) {
      setSheetNotes(prev => [
        ...prev, 
        { 
          id: Math.random().toString(36).substr(2, 9),
          stringIndex, 
          fret, 
          timestamp: Date.now() 
        }
      ]);
      setSheetIndex(prev => prev + 1);
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (document.activeElement?.tagName === 'INPUT') return;
      if (isSettingsOpen) return;

      const key = e.key.toLowerCase();

      // Global Controls
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (playMode === 'custom') setFretQueue(prev => prev.slice(0, -1));
        if (playMode === 'sheet' && isSheetRecording) {
             setSheetNotes(prev => prev.slice(0, -1));
             setSheetIndex(prev => Math.max(0, prev - 1));
        }
        return;
      }
      if (e.key === 'Escape') {
        setFretQueue([]);
        return;
      }

      // Space Strum logic
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        // Space behavior depends on mode
        if (playMode === 'sheet' && !isSheetRecording) return; // No auto-strum in sheet practice mode

        const activeFrets = currentChordShape?.frets || [0,0,0,0,0,0];
        activeFrets.forEach((fret, index) => {
          if (fret !== -1) {
            setTimeout(() => triggerString(index, fret, true), index * 30);
          }
        });
        return;
      }
      
      // Mode Toggles (optional shortcuts)
      // m = toggle custom/chord, n = sheet? let's stick to UI for now to avoid complexity

      // Action Mapping Logic
      const action = keyMapping[key];
      if (!action) return;

      if (action.type === 'fret') {
        // Fret inputs affect the Custom Frets state, used by Custom and Sheet(Record)
        if (playMode === 'custom') {
           if (fretQueue.length < 12) setFretQueue(prev => [...prev, action.value]);
        } else if (playMode === 'sheet' && isSheetRecording) {
            // In Sheet Record mode, we can use the Queue style OR direct set?
            // Let's mimic Custom Mode: Fret keys set the queue
            if (fretQueue.length < 12) setFretQueue(prev => [...prev, action.value]);
        }
        // In Sheet Playback mode, Fret keys do NOTHING (simplify user cognitive load)
      } else if (action.type === 'string') {
        const stringIndex = action.value;
        if (stringIndex < 0 || stringIndex > 5) return;

        // --- SHEET PLAYBACK LOGIC ---
        if (playMode === 'sheet' && !isSheetRecording) {
            const expectedNote = sheetNotes[sheetIndex];
            
            if (!expectedNote) {
               // End of song or empty
               return; 
            }

            if (stringIndex === expectedNote.stringIndex) {
               // CORRECT!
               triggerString(stringIndex, expectedNote.fret);
               setSheetIndex(prev => prev + 1);
               setWrongStringError(null);
            } else {
               // WRONG STRING!
               setWrongStringError(stringIndex);
               setTimeout(() => setWrongStringError(null), 300);
               // Optional: Play a "clunk" sound?
            }
            return;
        }

        // --- NORMAL / RECORD LOGIC ---
        let fretToPlay = 0;

        if (playMode === 'chord') {
           fretToPlay = currentChordShape?.frets[stringIndex] ?? 0;
           triggerString(stringIndex, fretToPlay);
        } else {
           // Custom or Sheet Record
           if (fretQueue.length > 0) {
             fretToPlay = fretQueue[0];
             setFretQueue(prev => prev.slice(1));
           } else {
             fretToPlay = customFrets[stringIndex];
           }
           triggerString(stringIndex, fretToPlay);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playMode, currentChordShape, fretQueue, customFrets, keyMapping, isSettingsOpen, sheetNotes, sheetIndex, isSheetRecording]);

  // Handle clicking a fret
  const handleFretToggle = (stringIndex: number, fret: number) => {
    if (playMode === 'chord') return;
    if (playMode === 'sheet' && !isSheetRecording) return; // Locked during playback
    
    setCustomFrets(prev => {
      const next = [...prev];
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
      queueBg: 'bg-gray-900 border-gray-700 text-amber-500',
    },
    anime: {
      appBg: 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50',
      textPrimary: 'text-slate-700',
      textSecondary: 'text-slate-500',
      panelBg: 'bg-white/60 backdrop-blur-xl border-white/50 shadow-lg',
      button: 'bg-white/50 text-slate-600 hover:bg-white border-white',
      buttonActive: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white border-transparent shadow-lg',
      fretboardContainer: 'shadow-[0_20px_40px_-12px_rgba(168,85,247,0.2)]',
      queueBg: 'bg-white/80 border-pink-200 text-pink-500 shadow-inner',
    }
  }[theme];

  return (
    <div className={`w-full h-full fixed inset-0 flex flex-col overflow-hidden transition-colors duration-500 ${ts.appBg} ${theme === 'anime' ? "font-['M_PLUS_Rounded_1c']" : 'font-sans'}`}>
      
      <KeySettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        keyMapping={keyMapping}
        onUpdateMapping={setKeyMapping}
        onReset={() => setKeyMapping(DEFAULT_KEY_MAP)}
        theme={theme}
      />

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
             onClick={() => setIsSettingsOpen(true)}
             className={`p-2 rounded-full transition-all ${ts.button}`}
             title="Keyboard Settings"
           >
             <Settings2 size={20} />
           </button>
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
         <div className={`absolute top-2 z-10 pointer-events-none transition-opacity duration-500 ${playMode !== 'chord' ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`flex flex-col items-center gap-2 px-6 py-2 rounded-2xl backdrop-blur-md ${theme === 'classic' ? 'bg-black/40 border border-amber-900/50 text-amber-500' : 'bg-white/40 border border-pink-200 text-pink-500'}`}>
               {playMode === 'sheet' ? (
                 <>
                   <span className="text-xs font-bold flex items-center gap-2">
                     <BookOpen size={12}/> Sheet Mode
                   </span>
                   <div className="text-[10px] opacity-80 text-center leading-tight">
                     {isSheetRecording ? 'Playing records notes.' : 'Press STRING keys to play.'}
                   </div>
                 </>
               ) : (
                 <>
                   <span className="text-xs font-bold flex items-center gap-2">
                     <Zap size={12}/> Custom Mode
                   </span>
                   <div className="text-[10px] opacity-80 text-center leading-tight">
                     Queue frets (1-9) &rarr; Pluck strings (u-l)
                   </div>
                 </>
               )}
            </div>
         </div>

         <div className={`w-full h-full max-h-[60vh] md:max-h-[400px] w-full max-w-6xl relative ${ts.fretboardContainer} transition-all duration-300`}>
            <Fretboard 
              currentChord={currentChordShape} 
              mode={playMode === 'chord' ? 'chord' : 'custom'} 
              theme={theme}
              strumTimestamps={strumTimestamps}
              onStrum={(s, f) => triggerString(s, f)}
              onFretToggle={handleFretToggle}
            />
            {/* Error Flash Overlay */}
            {wrongStringError !== null && (
               <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                  <div className="text-red-500 font-black text-6xl animate-bounce drop-shadow-lg">
                     WRONG STRING
                  </div>
               </div>
            )}
         </div>
      </main>

      {/* Sheet Timeline (Only in Sheet Mode) */}
      {playMode === 'sheet' && (
        <div className="shrink-0 w-full z-40">
           <Timeline 
             notes={sheetNotes}
             currentIndex={sheetIndex}
             isRecording={isSheetRecording}
             theme={theme}
             onDeleteNote={(idx) => {
               const newNotes = [...sheetNotes];
               newNotes.splice(idx, 1);
               setSheetNotes(newNotes);
               if (sheetIndex >= newNotes.length) setSheetIndex(Math.max(0, newNotes.length - 1));
             }}
             onClear={() => {
               setSheetNotes([]);
               setSheetIndex(0);
               setFretQueue([]);
             }}
             onToggleRecord={() => {
               setIsSheetRecording(!isSheetRecording);
               // Reset index to end if starting record? or stay? 
               // Let's stay, but usually you record at end.
               if (!isSheetRecording) {
                 setSheetIndex(sheetNotes.length);
               } else {
                 // Stopped recording, reset to start to play?
                 setSheetIndex(0);
               }
             }}
           />
        </div>
      )}

      {/* Controls Panel (Hidden or simplified in Sheet Mode to make room for Timeline?) or Return Button */}
      {playMode !== 'sheet' ? (
      <div className={`shrink-0 z-30 transition-all duration-300 rounded-t-3xl border-t ${ts.panelBg}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8 md:pb-8 flex flex-col gap-4">
            
            {/* Mode Switcher */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex bg-black/5 p-1 rounded-xl gap-1">
                    <button 
                       onClick={() => setPlayMode('chord')}
                       className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${playMode === 'chord' ? ts.buttonActive : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid size={14} /> <span className="hidden md:inline">Chords</span>
                    </button>
                    <button 
                       onClick={() => setPlayMode('custom')}
                       className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${playMode === 'custom' ? ts.buttonActive : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Zap size={14} /> <span className="hidden md:inline">Custom</span>
                    </button>
                    <button 
                       onClick={() => {
                         setPlayMode('sheet');
                         setSheetIndex(0);
                         setIsSheetRecording(false);
                       }}
                       className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${playMode === 'sheet' ? ts.buttonActive : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FileMusic size={14} /> <span className="hidden md:inline">Sheet</span>
                    </button>
                </div>

                <div className={`text-2xl font-black ${ts.textPrimary} tracking-tight`}>
                    {playMode === 'chord' ? (
                        <span>{currentChordName}</span>
                    ) : (
                        <div className="flex items-center gap-2">
                           {fretQueue.length > 0 ? (
                             <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-base ${ts.queueBg}`}>
                                <span className="text-[10px] uppercase tracking-wider opacity-70">Queue:</span>
                                {fretQueue.map((f, i) => (
                                  <span key={i} className={`font-mono font-bold ${i === 0 ? 'text-lg scale-110' : 'opacity-60'}`}>{f}</span>
                                ))}
                                <span className="ml-2 text-[10px] opacity-50"><Delete size={12}/></span>
                             </div>
                           ) : (
                             <span className="flex items-center gap-2 text-lg opacity-40">
                               <Keyboard size={20}/> 
                               <span className="hidden md:inline text-xs font-normal">Queue frets...</span>
                             </span>
                           )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chord Buttons / Visual Aid */}
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
                    </button>
                  ))}
              </div>
            ) : (
               <div className={`w-full h-12 md:h-14 flex items-center justify-between px-4 rounded-xl border-2 border-dashed ${theme === 'classic' ? 'border-gray-800 text-gray-500' : 'border-white/50 text-slate-400'}`}>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70">Operation Guide</span>
                    <span className="text-sm">Queue fret (e.g., <b>1</b>) &rarr; Pluck string (e.g., <b>u</b>)</span>
                  </div>
                  <button 
                    onClick={() => setCustomFrets([0,0,0,0,0,0])}
                    className="text-xs hover:underline"
                  >
                    Reset Board
                  </button>
               </div>
            )}
        </div>
      </div>
      ) : (
         /* Return to controls if in sheet mode (Simple toggle back) */
         <div className={`absolute bottom-36 right-4 md:right-8 flex gap-2`}>
             <button 
                onClick={() => setPlayMode('custom')}
                className={`p-3 rounded-full shadow-lg border backdrop-blur-md ${theme === 'classic' ? 'bg-black/50 border-gray-700 text-gray-400' : 'bg-white/50 border-white text-slate-500'}`}
                title="Exit Sheet Mode"
             >
                <LayoutGrid size={20} />
             </button>
         </div>
      )}
    </div>
  );
};

export default App;