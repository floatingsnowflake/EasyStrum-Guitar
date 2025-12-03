import React, { useEffect, useRef } from 'react';
import { SheetNote, STRINGS } from '../types';
import { ThemeType } from '../App';
import { Trash2, Play, Square, FastForward } from 'lucide-react';

interface TimelineProps {
  notes: SheetNote[];
  currentIndex: number;
  isRecording: boolean;
  theme: ThemeType;
  onDeleteNote: (index: number) => void;
  onClear: () => void;
  onToggleRecord: () => void;
}

const Timeline: React.FC<TimelineProps> = ({
  notes,
  currentIndex,
  isRecording,
  theme,
  onDeleteNote,
  onClear,
  onToggleRecord,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current note
  useEffect(() => {
    if (scrollContainerRef.current && notes.length > 0) {
      const activeElement = scrollContainerRef.current.children[currentIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex, notes.length]);

  const styles = {
    classic: {
      bg: 'bg-[#1a1a1a] border-t border-gray-800',
      noteBase: 'bg-[#2a2a2a] border border-gray-700 text-gray-400',
      noteActive: 'bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)] scale-110',
      notePassed: 'opacity-40',
      controlBtn: 'hover:bg-gray-800 text-gray-400',
      recordBtnActive: 'text-red-500 animate-pulse',
    },
    anime: {
      bg: 'bg-white/40 backdrop-blur-xl border-t border-white/50',
      noteBase: 'bg-white/60 border border-pink-100 text-slate-500',
      noteActive: 'bg-gradient-to-br from-pink-400 to-purple-400 text-white border-white shadow-lg scale-110',
      notePassed: 'opacity-50 grayscale',
      controlBtn: 'hover:bg-white/50 text-slate-500',
      recordBtnActive: 'text-red-400 animate-pulse',
    }
  }[theme];

  return (
    <div className={`w-full h-32 flex flex-col ${styles.bg}`}>
      
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-black/5">
        <div className="flex items-center gap-2">
           <button 
             onClick={onToggleRecord}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isRecording ? 'border-red-500/50 bg-red-500/10 ' + styles.recordBtnActive : 'border-transparent ' + styles.controlBtn}`}
           >
             <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`} />
             {isRecording ? 'REC' : 'EDIT'}
           </button>
           
           <div className="h-4 w-px bg-current opacity-20 mx-2"/>

           <button 
             onClick={onClear}
             className={`p-1.5 rounded-lg transition-colors ${styles.controlBtn}`}
             title="Clear All"
           >
             <Trash2 size={14} />
           </button>
        </div>
        
        <div className="text-xs font-mono opacity-50">
           {currentIndex} / {notes.length}
        </div>
      </div>

      {/* Scrollable Notes Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex items-center overflow-x-auto px-[50vw] gap-3 hide-scrollbar py-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {notes.length === 0 && (
           <div className="absolute left-1/2 -translate-x-1/2 text-xs opacity-40 select-none pointer-events-none whitespace-nowrap">
              {isRecording ? "Play strings to record notes..." : "Record notes to start"}
           </div>
        )}

        {notes.map((note, idx) => {
          const isActive = idx === currentIndex;
          const isPassed = idx < currentIndex;
          
          return (
            <div
              key={note.id}
              className={`
                relative shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none
                ${isActive ? styles.noteActive : styles.noteBase}
                ${isPassed ? styles.notePassed : ''}
              `}
              style={{ scrollSnapAlign: 'center' }}
              onClick={() => isRecording && onDeleteNote(idx)} // Simple delete on click in edit mode
            >
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                {STRINGS[note.stringIndex].name}
              </span>
              <span className="text-xl font-black leading-none">
                {note.fret}
              </span>
              
              {/* String line visual */}
              <div className="w-full h-px bg-current opacity-20 absolute top-1/2 -z-10" />

              {/* Index badge */}
              <div className="absolute -bottom-6 text-[9px] opacity-30 font-mono">
                {idx + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;