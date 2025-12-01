import React from 'react';
import GuitarString from './GuitarString';
import { STRINGS, ChordShape } from '../types';
import { playNote } from '../services/audioEngine';
import { ThemeType } from '../App';

interface FretboardProps {
  currentChord: ChordShape | null;
  mode: 'chord' | 'solo';
  theme: ThemeType;
}

const FRETS_COUNT = 15;
const MARKERS = [3, 5, 7, 9, 12, 15];

const Fretboard: React.FC<FretboardProps> = ({ currentChord, mode, theme }) => {
  
  const handleStrum = (stringIndex: number, fret: number) => {
    const stringConfig = STRINGS[stringIndex];
    playNote(stringIndex, fret, stringConfig.semiToneOffset);
  };

  // 风格配置
  const styles = {
    classic: {
      container: 'bg-[#2a2a2a] border-8 border-[#1a1a1a] rounded-xl shadow-2xl',
      fretColor: 'border-r-[#555] border-r-2',
      nutColor: 'border-r-[#111] border-r-4',
      marker: 'bg-white/20',
      text: 'text-white/30',
      activeIndicator: 'bg-indigo-500 border-white shadow-lg text-white',
    },
    anime: {
      container: 'bg-[#fff8e1] rounded-3xl border-8 border-[#f8f0d8] ring-4 ring-white/50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]',
      fretColor: 'border-r-[#e0e0e0] border-r-2',
      nutColor: 'border-r-[#5d4037] border-r-6',
      marker: 'bg-pink-200/80 shadow-inner',
      text: 'text-gray-400',
      activeIndicator: 'bg-gradient-to-br from-pink-400 to-purple-400 border-white shadow-md text-white animate-bounce-sm',
    }
  };

  const s = styles[theme];

  return (
    <div className={`relative w-full max-w-5xl mx-auto h-80 overflow-hidden select-none transition-all duration-300 ${s.container}`}>
      
      {/* 装饰纹理 (Anime Only) */}
      {theme === 'anime' && (
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#ffcc80 1px, transparent 1px)`, backgroundSize: '20px 20px' }} 
        />
      )}
      
      {/* 经典木纹 (Classic Only) */}
      {theme === 'classic' && (
         <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`}}
         />
      )}

      {/* 品丝 (Vertical Lines) */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: FRETS_COUNT + 1 }).map((_, i) => (
          <div 
            key={`fret-${i}`}
            className={`h-full relative ${i === 0 ? s.nutColor : s.fretColor}`}
            style={{ width: `${100 / FRETS_COUNT}%` }}
          >
            {/* 品位数字 */}
            <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold ${s.text}`}>
              {i > 0 ? i : ''}
            </span>

            {/* 品位标记 (Markers) */}
            {MARKERS.includes(i) && (
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${s.marker}`} />
            )}
            {/* 12品双点 */}
            {i === 12 && (
               <>
                 <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${s.marker}`} style={{marginTop: '-20px'}}/>
                 <div className={`absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full ${s.marker}`} style={{marginBottom: '-20px'}}/>
               </>
            )}
          </div>
        ))}
      </div>

      {/* 琴弦层 */}
      <div className="absolute inset-0 flex flex-col justify-center px-0 py-4 z-10">
        {STRINGS.map((str, idx) => {
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
                theme={theme}
              />
              {/* 手指按压指示器 */}
              {activeFret > 0 && (
                 <div 
                    className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center z-20 pointer-events-none transition-all duration-300 ${s.activeIndicator}`}
                    style={{ 
                        left: `calc(${activeFret} * (100% / ${FRETS_COUNT}) - (50% / ${FRETS_COUNT}))`
                    }}
                 >
                    <span className="text-xs font-black">{activeFret}</span>
                 </div>
              )}
               {/* 静音指示器 */}
               {isMuted && (
                 <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-red-100 text-red-500 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-sm z-20 select-none opacity-80">
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