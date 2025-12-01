import React from 'react';
import GuitarString from './GuitarString';
import { STRINGS, ChordShape } from '../types';
import { playNote } from '../services/audioEngine';

interface FretboardProps {
  currentChord: ChordShape | null;
  mode: 'chord' | 'solo';
}

const FRETS_COUNT = 15;
const MARKERS = [3, 5, 7, 9, 12, 15];

const Fretboard: React.FC<FretboardProps> = ({ currentChord, mode }) => {
  
  const handleStrum = (stringIndex: number, fret: number) => {
    const stringConfig = STRINGS[stringIndex];
    playNote(stringIndex, fret, stringConfig.semiToneOffset);
  };

  // Helper to determine which fret is pressed for a given string
  const getActiveFret = (stringIndex: number) => {
    if (mode === 'chord' && currentChord) {
      return currentChord.frets[stringIndex];
    }
    return 0; // Open string by default in solo mode (logic can be expanded for manual fretting)
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto h-80 bg-[#3e2723] rounded-xl shadow-2xl overflow-hidden border-4 border-[#251614] select-none">
      {/* Wood Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')` }} 
      />

      {/* Frets (Vertical Lines) */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: FRETS_COUNT + 1 }).map((_, i) => (
          <div 
            key={`fret-${i}`}
            className="h-full border-r-4 border-gray-400 relative"
            style={{ 
              width: `${100 / FRETS_COUNT}%`, 
              borderColor: i === 0 ? '#111' : '#9ca3af', // Nut is thicker/darker
              boxShadow: i > 0 ? '2px 0 5px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {/* Fret Number Label */}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono">
              {i > 0 ? i : ''}
            </span>

            {/* Fret Markers (Dots) */}
            {MARKERS.includes(i) && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-300 opacity-60 shadow-inner" />
            )}
            {i === 12 && (
               <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-300 opacity-60 shadow-inner" style={{marginTop: '-20px'}}/>
            )}
             {i === 12 && (
               <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-gray-300 opacity-60 shadow-inner" style={{marginBottom: '-20px'}}/>
            )}
          </div>
        ))}
      </div>

      {/* Strings Layer */}
      <div className="absolute inset-0 flex flex-col justify-center px-0 py-4 z-10">
        {STRINGS.map((str, idx) => {
          // If in chord mode, the "pressed" fret is determined by the chord.
          // In solo mode, we default to 0 (open) for this simplified version, 
          // or we could add state to track clicked frets.
          // However, the prompt emphasizes "automatic alignment", so Chord mode is primary.
          
          const chordFret = currentChord ? currentChord.frets[idx] : 0;
          const isMuted = chordFret === -1;
          const activeFret = isMuted ? -1 : chordFret;

          return (
            <div key={str.name} className="relative">
               <GuitarString
                config={str}
                stringIndex={idx}
                activeFret={activeFret}
                onStrum={handleStrum}
                isMuted={isMuted}
              />
              {/* Visual Finger Position Indicator */}
              {activeFret > 0 && (
                 <div 
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-20 pointer-events-none transition-all duration-300"
                    style={{ 
                        // Calculate position: (FretIndex - 0.5) * (100 / FretCount)%
                        // This centers it in the fret space
                        left: `calc(${activeFret} * (100% / ${FRETS_COUNT}) - (50% / ${FRETS_COUNT}))`
                    }}
                 >
                    <span className="text-[10px] font-bold text-white">{activeFret}</span>
                 </div>
              )}
               {/* Muted Indicator */}
               {isMuted && (
                 <div className="absolute left-2 top-1/2 -translate-y-1/2 text-red-500 font-bold text-lg opacity-80 z-20 select-none">
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