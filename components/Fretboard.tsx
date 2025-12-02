import React, { useRef, useEffect, useState } from 'react';
import GuitarString from './GuitarString';
import { STRINGS, ChordShape } from '../types';
import { playNote } from '../services/audioEngine';
import { ThemeType } from '../App';

interface FretboardProps {
  currentChord: ChordShape | null;
  mode: 'chord' | 'solo';
  manualFret: number; // For Solo mode
  theme: ThemeType;
}

const FRETS_COUNT = 15;
const MARKERS = [3, 5, 7, 9, 12, 15];

const Fretboard: React.FC<FretboardProps> = ({ currentChord, mode, manualFret, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [strumTimestamps, setStrumTimestamps] = useState<number[]>(new Array(6).fill(0));

  const handleStrum = (stringIndex: number, fret: number) => {
    const stringConfig = STRINGS[stringIndex];
    playNote(stringIndex, fret, stringConfig.semiToneOffset);
    
    // Trigger visual feedback
    const newTimestamps = [...strumTimestamps];
    newTimestamps[stringIndex] = Date.now();
    setStrumTimestamps(newTimestamps);
  };

  // --- Touch Handling Logic ---
  // We attach listeners to the container to handle "swiping" across multiple strings
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastStrummedString: number | null = null;

    const processTouch = (e: TouchEvent) => {
      // Prevent browser scrolling behavior
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      // Find the element under the finger
      const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      
      if (element) {
        // Check if we hit a string's hit area
        const stringIndexStr = element.getAttribute('data-string-index');
        if (stringIndexStr !== null) {
          const stringIndex = parseInt(stringIndexStr, 10);
          
          // Only strum if we moved to a new string or this is a new touch
          if (stringIndex !== lastStrummedString) {
             const fretToPlay = mode === 'solo' 
                ? manualFret 
                : (currentChord?.frets[stringIndex] === -1 ? -1 : currentChord?.frets[stringIndex] ?? 0);

             if (fretToPlay !== -1) {
                handleStrum(stringIndex, fretToPlay);
             }
             lastStrummedString = stringIndex;
          }
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastStrummedString = null;
      processTouch(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      processTouch(e);
    };

    const handleTouchEnd = () => {
      lastStrummedString = null;
    };

    // Use non-passive listeners to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentChord, mode, manualFret, strumTimestamps]);


  // 风格配置
  const styles = {
    classic: {
      container: 'bg-[#1a1a1a] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] border-y-8 border-[#2d2d2d]',
      fretColor: 'border-r-[#555] border-r-2',
      nutColor: 'border-r-[#c0b283] border-r-8',
      marker: 'bg-[#c0b283] shadow-[0_0_5px_rgba(192,178,131,0.5)]',
      text: 'text-white/20 font-mono',
      activeIndicator: 'bg-amber-600 border-amber-300 shadow-lg text-white',
    },
    anime: {
      container: 'bg-white/80 backdrop-blur-md rounded-2xl border-4 border-white/50 shadow-xl',
      fretColor: 'border-r-pink-200 border-r-2',
      nutColor: 'border-r-pink-300 border-r-8',
      marker: 'bg-pink-300/80 shadow-inner',
      text: 'text-pink-300 font-bold',
      activeIndicator: 'bg-gradient-to-r from-pink-400 to-purple-400 border-white shadow-md text-white',
    }
  };

  const s = styles[theme];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex flex-col justify-center select-none overflow-hidden touch-none transition-all duration-300 ${s.container}`}
    >
      
      {/* 装饰: 木纹 (Classic) */}
      {theme === 'classic' && (
         <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 10h10v10H10V10z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`}}
         />
      )}

      {/* 品丝 (Vertical Lines) */}
      <div className="absolute inset-0 flex pointer-events-none">
        {Array.from({ length: FRETS_COUNT + 1 }).map((_, i) => (
          <div 
            key={`fret-${i}`}
            className={`h-full relative ${i === 0 ? s.nutColor : s.fretColor}`}
            style={{ width: `${100 / FRETS_COUNT}%` }}
          >
            {/* 品位数字 */}
            <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] ${s.text}`}>
              {i > 0 ? i : ''}
            </span>

            {/* 品位标记 (Markers) */}
            {MARKERS.includes(i) && (
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full ${s.marker}`} />
            )}
            {/* 12品双点 */}
            {i === 12 && (
               <>
                 <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${s.marker}`} style={{marginTop: '-20px'}}/>
                 <div className={`absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full ${s.marker}`} style={{marginBottom: '-20px'}}/>
               </>
            )}
          </div>
        ))}
      </div>

      {/* 琴弦层 */}
      <div className="absolute inset-0 flex flex-col justify-between py-2 md:py-4 z-10">
        {STRINGS.map((str, idx) => {
          // Determine fret based on mode
          let activeFret = 0;
          let isMuted = false;

          if (mode === 'solo') {
            activeFret = manualFret;
            isMuted = false;
          } else {
            const chordFret = currentChord ? currentChord.frets[idx] : 0;
            isMuted = chordFret === -1;
            activeFret = isMuted ? -1 : chordFret;
          }

          return (
            <div key={str.name} className="flex-1 relative flex items-center">
               <GuitarString
                config={str}
                stringIndex={idx}
                activeFret={activeFret}
                onStrum={handleStrum}
                isMuted={isMuted}
                theme={theme}
                lastStrummed={strumTimestamps[idx]}
              />
              
              {/* 指示器 logic */}
              {activeFret > 0 && (
                 <div 
                    className={`absolute w-5 h-5 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center z-20 pointer-events-none transition-all duration-150 ${s.activeIndicator}`}
                    style={{ 
                        left: `calc(${activeFret} * (100% / ${FRETS_COUNT}) - (50% / ${FRETS_COUNT}))`,
                        transform: 'translate(-50%, 0)'
                    }}
                 >
                    <span className="text-[10px] md:text-xs font-black">{activeFret}</span>
                 </div>
              )}
               {/* Mute indicator */}
               {isMuted && (
                 <div className="absolute left-1 bg-red-500/20 text-red-500 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] z-20 pointer-events-none">
                    ✕
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Fretboard;