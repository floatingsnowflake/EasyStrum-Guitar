export interface GuitarStringConfig {
  name: string;
  baseOctave: number;
  semiToneOffset: number; // 0 for E, 5 for A, etc.
  thickness: number;
}

export interface ChordShape {
  name: string;
  frets: number[]; // Array of 6 integers. -1 means muted/not played.
  fingers?: number[]; // Suggested fingerings (optional)
}

export interface SheetNote {
  id: string;
  stringIndex: number;
  fret: number;
  timestamp: number;
}

// Standard Tuning: E A D G B E
// E2 (82.41Hz)
export const STRINGS: GuitarStringConfig[] = [
  { name: 'E', baseOctave: 2, semiToneOffset: 0, thickness: 4 },
  { name: 'A', baseOctave: 2, semiToneOffset: 5, thickness: 3.2 },
  { name: 'D', baseOctave: 3, semiToneOffset: 10, thickness: 2.4 },
  { name: 'G', baseOctave: 3, semiToneOffset: 15, thickness: 1.8 },
  { name: 'B', baseOctave: 3, semiToneOffset: 19, thickness: 1.2 },
  { name: 'e', baseOctave: 4, semiToneOffset: 24, thickness: 0.8 },
];

export const CHORDS: Record<string, ChordShape> = {
  'Em': { name: 'Em', frets: [0, 2, 2, 0, 0, 0] },
  'E':  { name: 'E', frets: [0, 2, 2, 1, 0, 0] },
  'Am': { name: 'Am', frets: [-1, 0, 2, 2, 1, 0] },
  'A':  { name: 'A', frets: [-1, 0, 2, 2, 2, 0] },
  'Dm': { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1] },
  'D':  { name: 'D', frets: [-1, -1, 0, 2, 3, 2] },
  'C':  { name: 'C', frets: [-1, 3, 2, 0, 1, 0] },
  'G':  { name: 'G', frets: [3, 2, 0, 0, 0, 3] },
  'F':  { name: 'F', frets: [1, 3, 3, 2, 1, 1] }, // Barre simplified
};