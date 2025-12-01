import React, { useState, useEffect } from 'react';
import { GuitarStringConfig } from '../types';

interface GuitarStringProps {
  config: GuitarStringConfig;
  stringIndex: number;
  activeFret: number;
  onStrum: (stringIndex: number, fret: number) => void;
  isMuted: boolean;
}

const GuitarString: React.FC<GuitarStringProps> = ({ 
  config, 
  stringIndex, 
  activeFret, 
  onStrum,
  isMuted
}) => {
  const [isVibrating, setIsVibrating] = useState(false);

  const handleInteraction = () => {
    if (isMuted) return;
    
    setIsVibrating(true);
    onStrum(stringIndex, activeFret);
    
    // Reset vibration animation
    setTimeout(() => setIsVibrating(false), 200);
  };

  return (
    <div 
      className="relative w-full flex items-center group cursor-pointer" 
      style={{ height: '40px' }} // Space between strings
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
    >
      {/* The String Line */}
      <div 
        className={`w-full absolute top-1/2 left-0 transition-transform duration-75 ${isVibrating ? 'string-vibrate' : ''}`}
        style={{
          height: `${config.thickness}px`,
          backgroundColor: stringIndex < 2 ? '#b8860b' : '#c0c0c0', // Bronze for low, Silver for high
          boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
          opacity: isMuted ? 0.3 : 1
        }}
      />
      
      {/* Hover Hitbox (Invisible but larger for easier strumming) */}
      <div className="w-full h-full absolute top-0 left-0 z-10" />
    </div>
  );
};

export default GuitarString;