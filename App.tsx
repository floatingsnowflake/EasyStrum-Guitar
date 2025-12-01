import React, { useState, useEffect } from 'react';
import Fretboard from './components/Fretboard';
import { CHORDS, ChordShape } from './types';
import { Music, Volume2, Info, Github, Mic, Sliders } from 'lucide-react';

const App: React.FC = () => {
  const [currentChordName, setCurrentChordName] = useState<string>('Em');
  const [mode, setMode] = useState<'chord' | 'solo'>('chord');
  const [isStarted, setIsStarted] = useState(false);

  // Keyboard shortcuts for chords
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow number keys 1-8 to map to common chords
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
    { name: 'Basics', chords: ['Em', 'Am', 'C', 'G', 'D', 'A', 'E', 'F'] },
  ];

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm"></div>
        <div className="z-10 text-center max-w-md space-y-8 bg-black/60 p-10 rounded-2xl backdrop-blur-md shadow-2xl border border-white/10">
          <Music size={64} className="mx-auto text-yellow-500 mb-4" />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            EasyStrum
          </h1>
          <p className="text-gray-300 text-lg">
            An interactive guitar simulator with automatic chord alignment.
            Move your mouse over the strings to strum.
          </p>
          <button 
            onClick={() => setIsStarted(true)}
            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <Volume2 size={24} />
            Start Jamming
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-neutral-800 border-b border-neutral-700 p-4 shadow-lg z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-yellow-500 p-2 rounded-lg text-black">
                <Music size={24} />
             </div>
             <h1 className="text-2xl font-bold tracking-tight">EasyStrum <span className="text-yellow-500 text-sm font-normal ml-1">Beta</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Info size={14}/> Mouse over strings to play</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-6 gap-8 overflow-y-auto">
        
        {/* Chord Display */}
        <div className="w-full max-w-4xl text-center space-y-2">
            <h2 className="text-xl text-gray-400 uppercase tracking-widest text-xs font-semibold">Current Chord</h2>
            <div className="text-7xl font-black text-white drop-shadow-lg tracking-tighter">
                {currentChordName}
                <span className="text-2xl text-gray-500 ml-2 font-medium">major/minor</span>
            </div>
        </div>

        {/* The Fretboard */}
        <div className="w-full flex justify-center perspective-1000">
           <Fretboard currentChord={currentChord} mode={mode} />
        </div>

        {/* Controls Area */}
        <div className="w-full max-w-5xl bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700 backdrop-blur-sm shadow-xl">
           <div className="flex flex-col md:flex-row gap-8">
              
              {/* Chord Selector */}
              <div className="flex-1">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-yellow-400">
                        <Sliders size={18} />
                        Select Chord
                    </h3>
                    <span className="text-xs text-gray-500">Press 1-8 on keyboard</span>
                 </div>
                 
                 <div className="flex flex-wrap gap-3">
                    {chordGroups[0].chords.map((chord) => (
                        <button
                            key={chord}
                            onClick={() => setCurrentChordName(chord)}
                            className={`
                                relative px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200
                                ${currentChordName === chord 
                                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-110 z-10' 
                                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600 hover:text-white'}
                            `}
                        >
                            {chord}
                            {/* Key Hint */}
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] rounded-full flex items-center justify-center border border-neutral-600">
                                {Object.keys({ '1': 'Em', '2': 'E', '3': 'Am', '4': 'A', '5': 'D', '6': 'C', '7': 'G', '8': 'F' }).find(key => 
                                    // @ts-ignore
                                    ({ '1': 'Em', '2': 'E', '3': 'Am', '4': 'A', '5': 'D', '6': 'C', '7': 'G', '8': 'F' })[key] === chord
                                )}
                            </span>
                        </button>
                    ))}
                 </div>
              </div>

              {/* Instructions / Status */}
              <div className="w-full md:w-80 bg-neutral-900/80 rounded-xl p-5 border border-neutral-700">
                  <h4 className="text-gray-400 text-sm font-semibold uppercase mb-3">How to Play</h4>
                  <ul className="space-y-3 text-sm text-gray-300">
                      <li className="flex gap-3">
                          <span className="w-6 h-6 rounded bg-neutral-700 flex items-center justify-center text-xs font-bold text-yellow-500">1</span>
                          <span>Select a chord from the left panel.</span>
                      </li>
                      <li className="flex gap-3">
                          <span className="w-6 h-6 rounded bg-neutral-700 flex items-center justify-center text-xs font-bold text-yellow-500">2</span>
                          <span>Move mouse over strings to strum.</span>
                      </li>
                      <li className="flex gap-3">
                          <span className="w-6 h-6 rounded bg-neutral-700 flex items-center justify-center text-xs font-bold text-yellow-500">3</span>
                          <span>The fretboard automatically aligns fingers to the selected chord.</span>
                      </li>
                  </ul>
              </div>

           </div>
        </div>

      </main>
      
      <footer className="p-4 text-center text-gray-600 text-sm">
        Generated with React, Tailwind & Web Audio API
      </footer>
    </div>
  );
};

export default App;