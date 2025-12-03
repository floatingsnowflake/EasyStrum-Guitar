import React, { useState, useEffect } from 'react';
import { X, Keyboard as KeyboardIcon, RotateCcw } from 'lucide-react';
import { ThemeType } from '../App';

export type ActionType = { type: 'fret', value: number } | { type: 'string', value: number };
export type KeyMap = Record<string, ActionType>;

interface KeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyMapping: KeyMap;
  onUpdateMapping: (newMap: KeyMap) => void;
  onReset: () => void;
  theme: ThemeType;
}

const KeySettingsModal: React.FC<KeySettingsModalProps> = ({
  isOpen,
  onClose,
  keyMapping,
  onUpdateMapping,
  onReset,
  theme
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Invert the map for display: Action -> Key(s)
  // We need to group by action type and value to show list
  const getAssignedKey = (type: 'fret' | 'string', value: number): string | null => {
    const entry = Object.entries(keyMapping).find(([_, action]) => (action as ActionType).type === type && (action as ActionType).value === value);
    return entry ? entry[0] : null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingKey) return;
      
      e.preventDefault();
      const newKey = e.key.toLowerCase();
      
      // Parse the editing key identifier "type-value"
      const [type, valStr] = editingKey.split('-');
      const value = parseInt(valStr);

      // Remove old binding for this action if it exists (to avoid duplicates for same action)
      // Also remove any existing binding for the *new key* (one key, one action)
      const newMap = { ...keyMapping };
      
      // 1. Remove key that was previously assigned to this action
      const oldKey = Object.keys(newMap).find(k => newMap[k].type === type && newMap[k].value === value);
      if (oldKey) delete newMap[oldKey];

      // 2. Assign new key
      newMap[newKey] = { type: type as 'fret' | 'string', value };

      onUpdateMapping(newMap);
      setEditingKey(null);
    };

    if (editingKey) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingKey, keyMapping, onUpdateMapping]);

  if (!isOpen) return null;

  const styles = {
    classic: {
      bg: 'bg-[#1e1e1e]',
      text: 'text-gray-200',
      border: 'border-gray-700',
      header: 'border-b border-gray-700 bg-[#252525]',
      key: 'bg-[#2a2a2a] border border-gray-600 text-amber-500',
      keyActive: 'bg-amber-700 text-white border-amber-500',
      subtext: 'text-gray-500'
    },
    anime: {
      bg: 'bg-white/90 backdrop-blur-xl',
      text: 'text-slate-600',
      border: 'border-pink-200',
      header: 'border-b border-pink-100 bg-pink-50/50',
      key: 'bg-white border border-pink-200 text-pink-500 shadow-sm',
      keyActive: 'bg-pink-400 text-white border-pink-400',
      subtext: 'text-pink-300'
    }
  }[theme];

  const renderKeyButton = (type: 'fret' | 'string', value: number, label: string) => {
    const assignedKey = getAssignedKey(type, value);
    const isEditing = editingKey === `${type}-${value}`;

    return (
      <div className="flex items-center justify-between p-2 rounded hover:bg-black/5 transition-colors">
        <span className={`text-sm font-medium ${styles.text}`}>{label}</span>
        <button
          onClick={() => setEditingKey(`${type}-${value}`)}
          className={`
            min-w-[3rem] px-3 py-1 rounded-lg font-mono text-sm font-bold transition-all uppercase
            ${isEditing ? styles.keyActive : styles.key}
          `}
        >
          {isEditing ? '...' : (assignedKey || '-')}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${styles.bg} ${styles.border} border`}>
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between shrink-0 ${styles.header}`}>
          <div className="flex items-center gap-2">
            <KeyboardIcon size={20} className={styles.text} />
            <h2 className={`text-lg font-bold ${styles.text}`}>Keyboard Controls</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/10 ${styles.text}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-8">
          
          {/* String Triggers */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styles.subtext}`}>String Triggers</h3>
            <div className="space-y-1">
               {['E (Low)', 'A', 'D', 'G', 'B', 'e (High)'].map((name, idx) => (
                 <div key={idx}>
                   {renderKeyButton('string', idx, `String ${6-idx}: ${name}`)}
                 </div>
               ))}
            </div>
            <div className={`mt-4 text-xs ${styles.subtext} opacity-80 leading-relaxed`}>
               Press these keys to pluck specific strings. In Custom Mode, they will play the next fret in your queue.
            </div>
          </div>

          {/* Fret Selectors */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.subtext}`}>Fret Inputs</h3>
               <button 
                  onClick={onReset}
                  className="text-[10px] flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
               >
                 <RotateCcw size={10}/> Reset Defaults
               </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
               {Array.from({ length: 16 }).map((_, i) => (
                 <div key={i}>
                   {renderKeyButton('fret', i, `Fret ${i}`)}
                 </div>
               ))}
            </div>
          </div>

        </div>

        <div className={`p-4 text-center text-xs border-t ${styles.border} ${styles.subtext} bg-black/5`}>
           Click a key button to rebind. Press <b>Backspace</b> to undo queue. <b>Space</b> to strum all.
        </div>
      </div>
    </div>
  );
};

export default KeySettingsModal;