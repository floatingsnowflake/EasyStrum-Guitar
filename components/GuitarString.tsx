import React, { useState } from 'react';
import { GuitarStringConfig } from '../types';
import { ThemeType } from '../App';

interface GuitarStringProps {
  config: GuitarStringConfig;
  stringIndex: number;
  activeFret: number;
  onStrum: (stringIndex: number, fret: number) => void;
  isMuted: boolean;
  theme: ThemeType;
}

const GuitarString: React.FC<GuitarStringProps> = ({ 
  config, 
  stringIndex, 
  activeFret, 
  onStrum,
  isMuted,
  theme
}) => {
  const [isVibrating, setIsVibrating] = useState(false);

  // 风格颜色配置
  const colors = {
    anime: [
        '#ffab91', // E - 橙红
        '#ffcc80', // A - 橙黄
        '#fff59d', // D - 黄
        '#a5d6a7', // G - 绿
        '#81d4fa', // B - 蓝
        '#ce93d8'  // e - 紫
    ],
    classic: [
        '#d4a373', // Bronze
        '#d4a373', // Bronze
        '#d4a373', // Bronze
        '#C0C0C0', // Silver (Plain)
        '#C0C0C0', // Silver
        '#C0C0C0', // Silver
    ]
  };

  const currentColors = colors[theme];
  const stringColor = currentColors[stringIndex];

  const handleInteraction = () => {
    if (isMuted) return;
    
    setIsVibrating(true);
    onStrum(stringIndex, activeFret);
    
    setTimeout(() => setIsVibrating(false), 200);
  };

  return (
    <div 
      className="relative w-full flex items-center group cursor-pointer" 
      style={{ height: '40px' }}
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
    >
      {/* 琴弦本体 */}
      <div 
        className={`w-full absolute top-1/2 left-0 transition-transform duration-75 ${isVibrating ? 'string-vibrate' : ''}`}
        style={{
          height: `${Math.max(1, config.thickness)}px`, // 确保最细的弦也可见
          backgroundColor: stringColor,
          boxShadow: isVibrating 
            ? `0 0 8px ${theme === 'anime' ? stringColor : '#ffffff80'}` 
            : '0 1px 2px rgba(0,0,0,0.3)',
          opacity: isMuted ? 0.3 : 1,
          borderRadius: '99px'
        }}
      />
      
      {/* 隐形的大触控区域 */}
      <div className="w-full h-full absolute top-0 left-0 z-10" />
    </div>
  );
};

export default GuitarString;