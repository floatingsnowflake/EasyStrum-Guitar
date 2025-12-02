import React, { useState, useEffect } from 'react';
import { GuitarStringConfig } from '../types';
import { ThemeType } from '../App';

interface GuitarStringProps {
  config: GuitarStringConfig;
  stringIndex: number;
  activeFret: number;
  onStrum: (stringIndex: number, fret: number) => void;
  isMuted: boolean;
  theme: ThemeType;
  lastStrummed?: number; // Timestamp to trigger animation externally
}

const GuitarString: React.FC<GuitarStringProps> = ({ 
  config, 
  stringIndex, 
  activeFret, 
  onStrum,
  isMuted,
  theme,
  lastStrummed
}) => {
  const [isVibrating, setIsVibrating] = useState(false);

  // Trigger vibration when lastStrummed prop updates
  useEffect(() => {
    if (lastStrummed) {
      setIsVibrating(true);
      const timer = setTimeout(() => setIsVibrating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [lastStrummed]);

  // 风格颜色配置
  const colors = {
    anime: [
        '#ffab91', // E
        '#ffcc80', // A
        '#fff59d', // D
        '#a5d6a7', // G
        '#81d4fa', // B
        '#ce93d8'  // e
    ],
    classic: [
        '#cd7f32', // Bronze (Low E)
        '#cd7f32', // Bronze (A)
        '#cd7f32', // Bronze (D)
        '#e0e0e0', // Steel (G)
        '#e0e0e0', // Steel (B)
        '#e0e0e0', // Steel (e)
    ]
  };

  const currentColors = colors[theme];
  const stringColor = currentColors[stringIndex];

  const handleMouseEnter = () => {
    // Mouse hover strumming
    if (!isMuted) {
      onStrum(stringIndex, activeFret);
    }
  };

  return (
    <div 
      className="relative w-full flex items-center group touch-none" 
      style={{ height: '14.5%' }} // Distribute vertically evenly
      onMouseEnter={handleMouseEnter}
      data-string-index={stringIndex} // Crucial for global touch handler
    >
      {/* String visual */}
      <div 
        className={`w-full absolute top-1/2 left-0 transition-transform duration-75 pointer-events-none ${isVibrating ? 'string-vibrate' : ''}`}
        style={{
          height: `${Math.max(1.5, config.thickness)}px`, 
          backgroundColor: stringColor,
          boxShadow: isVibrating 
            ? `0 0 10px ${theme === 'anime' ? stringColor : '#ffffffaa'}` 
            : theme === 'classic' ? '0 1px 3px rgba(0,0,0,0.8)' : '0 1px 2px rgba(0,0,0,0.2)',
          opacity: isMuted ? 0.3 : 1,
          borderRadius: '99px'
        }}
      />
      
      {/* Invisible larger hit area for easier mouse/touch interaction */}
      <div className="w-full h-full absolute top-0 left-0 z-10 opacity-0" data-string-index={stringIndex} />
    </div>
  );
};

export default GuitarString;