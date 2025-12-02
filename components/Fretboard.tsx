import React, { useRef, useEffect } from 'react';
import GuitarString from './GuitarString';
import { STRINGS, ChordShape } from '../types';
import { ThemeType } from '../App';

interface FretboardProps {
  currentChord: ChordShape | null;
  mode: 'chord' | 'custom';
  theme: ThemeType;
  strumTimestamps: number[];
  onStrum: (stringIndex: number, fret: number) => void;
  onFretToggle?: (stringIndex: number, fret: number) => void;
}

const FRETS_COUNT = 15;
const MARKERS = [3, 5, 7, 9, 12, 15];

const Fretboard: React.FC<FretboardProps> = ({ 
  currentChord, 
  mode, 
  theme, 
  strumTimestamps, 
  onStrum,
  onFretToggle 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Touch Handling Logic ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastStrummedString: number | null = null;

    const processTouch = (e: TouchEvent) => {
      // Allow scrolling if not hitting strings? 
      // Actually, we blocked scrolling globally for better exp.
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      
      if (element) {
        const stringIndexStr = element.getAttribute('data-string-index');
        if (stringIndexStr !== null) {
          const stringIndex = parseInt(stringIndexStr, 10);
          
          if (stringIndex !== lastStrummedString) {
             // In Custom mode, we use the custom frets (passed via currentChord)
             // In Chord mode, we use the chord frets
             const fretToPlay = currentChord?.frets[stringIndex] ?? 0;

             if (fretToPlay !== -1) {
                onStrum(stringIndex, fretToPlay);
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
    const handleTouchMove = (e: TouchEvent) => processTouch(e);
    const handleTouchEnd = () => { lastStrummedString = null; };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentChord, onStrum]); // Re-bind if chord changes to ensure correct fret pitch

  const styles = {
    classic: {
      container: 'bg-[#1a1a1a] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] border-y-8 border-[#2d2d2d]',
      fretColor: 'border-r-[#555] border-r-2',
      nutColor: 'border-r-[#c0b283] border-r-8',
      marker: 'bg-[#c0b283] shadow-[0_0_5px_rgba(192,178,131,0.5)]',
      text: 'text-white/20 font-mono',
      activeIndicator: 'bg-amber-600 border-amber-300 shadow-lg text-white',
      hoverHighlight: 'hover:bg-amber-500/10 cursor-pointer',
    },
    anime: {
      container: 'bg-white/80 backdrop-blur-md rounded-2xl border-4 border-white/50 shadow-xl',
      fretColor: 'border-r-pink-200 border-r-2',
      nutColor: 'border-r-pink-300 border-r-8',
      marker: 'bg-pink-300/80 shadow-inner',
      text: 'text-pink-300 font-bold',
      activeIndicator: 'bg-gradient-to-r from-pink-400 to-purple-400 border-white shadow-md text-white',
      hoverHighlight: 'hover:bg-pink-300/20 cursor-pointer',
    }
  };

  const s = styles[theme];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex flex-col justify-center select-none overflow-hidden touch-none transition-all duration-300 ${s.container}`}
    >
      
      {/* Wood texture (Classic) */}
      {theme === 'classic' && (
         <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 10h10v10H10V10z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`}}
         />
      )}

      {/* Frets Layer */}
      <div className="absolute inset-0 flex pointer-events-none z-0">
        {Array.from({ length: FRETS_COUNT + 1 }).map((_, i) => (
          <div 
            key={`fret-${i}`}
            className={`h-full relative ${i === 0 ? s.nutColor : s.fretColor}`}
            style={{ width: `${100 / FRETS_COUNT}%` }}
          >
            <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] ${s.text}`}>
              {i > 0 ? i : ''}
            </span>
            {MARKERS.includes(i) && (
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full ${s.marker}`} />
            )}
            {i === 12 && (
               <>
                 <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${s.marker}`} style={{marginTop: '-20px'}}/>
                 <div className={`absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full ${s.marker}`} style={{marginBottom: '-20px'}}/>
               </>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Grid Overlay for Custom Mode (Behind Strings, but handle clicks) */}
      {mode === 'custom' && (
        <div className="absolute inset-0 z-20 flex flex-col py-2 md:py-4">
           {STRINGS.map((_, stringIdx) => (
             <div key={`grid-row-${stringIdx}`} className="flex-1 flex">
                {Array.from({ length: FRETS_COUNT + 1 }).map((_, fretIdx) => (
                  <div 
                    key={`cell-${stringIdx}-${fretIdx}`}
                    className={`h-full flex-1 ${s.hoverHighlight}`}
                    style={{ width: `${100 / FRETS_COUNT}%` }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent strumming when setting fret
                      onFretToggle?.(stringIdx, fretIdx);
                    }}
                    title={`String ${stringIdx + 1}, Fret ${fretIdx}`}
                  />
                ))}
             </div>
           ))}
        </div>
      )}

      {/* Strings Layer */}
      <div className="absolute inset-0 flex flex-col justify-between py-2 md:py-4 z-10 pointer-events-none">
        {STRINGS.map((str, idx) => {
          const activeFret = currentChord ? currentChord.frets[idx] : 0;
          const isMuted = activeFret === -1;
          const displayFret = isMuted ? -1 : activeFret;

          return (
            <div key={str.name} className="flex-1 relative flex items-center pointer-events-auto">
               <GuitarString
                config={str}
                stringIndex={idx}
                activeFret={displayFret}
                onStrum={(sIdx, fret) => onStrum(sIdx, fret)}
                isMuted={isMuted}
                theme={theme}
                lastStrummed={strumTimestamps[idx]}
              />
              
              {/* Active Fret Indicators */}
              {activeFret > 0 && (
                 <div 
                    className={`absolute w-5 h-5 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center z-30 transition-all duration-150 ${s.activeIndicator}`}
                    style={{ 
                        left: `calc(${activeFret} * (100% / ${FRETS_COUNT}) - (50% / ${FRETS_COUNT}))`,
                        transform: 'translate(-50%, 0)'
                    }}
                 >
                    <span className="text-[10px] md:text-xs font-black">{activeFret}</span>
                 </div>
              )}
               {isMuted && (
                 <div className="absolute left-1 bg-red-500/20 text-red-500 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] z-30">
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