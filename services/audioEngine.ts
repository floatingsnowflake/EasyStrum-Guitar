// Simple Karplus-Strong String Synthesis
// This creates realistic plucked string sounds using a delay line and lowpass filter.

let audioContext: AudioContext | null = null;
const masterGainValue = 0.4;

export const initAudio = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Frequency of E2 is ~82.41 Hz
const BASE_FREQ = 82.41;

const getFrequency = (stringIndex: number, fret: number, semiToneOffset: number) => {
  // f = f0 * 2^(n/12)
  // n is total semitones from E2
  const totalSemitones = semiToneOffset + fret;
  return BASE_FREQ * Math.pow(2, totalSemitones / 12);
};

export const playNote = (stringIndex: number, fret: number, semiToneOffset: number) => {
  const ctx = initAudio();
  const frequency = getFrequency(stringIndex, fret, semiToneOffset);
  
  // Create a buffer for the Karplus-Strong algorithm
  const sampleRate = ctx.sampleRate;
  // Length of the buffer dictates the duration of the note
  const duration = 3.0; 
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Karplus-Strong Algorithm
  // 1. Noise Burst (Excitation)
  // The length of the noise burst determines the period (1/frequency)
  const period = Math.floor(sampleRate / frequency);
  
  // Fill the beginning of the buffer with white noise
  for (let i = 0; i < period; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  // 2. Feedback Loop with Decay (Lowpass filtering)
  // y[n] = 0.5 * (y[n-p] + y[n-p-1]) * decay
  const decay = 0.993; // Controls sustain. Higher = longer sustain.
  // Slightly dampen higher frequencies faster for lower strings for more realism
  const stringDamping = 0.990 + (stringIndex * 0.002); 

  let previousValue = 0;
  for (let i = period; i < bufferSize; i++) {
    const val = 0.5 * (data[i - period] + previousValue) * stringDamping;
    data[i] = val;
    previousValue = data[i - period]; // Use simple averaging
  }

  // Create source and play
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Gain node for envelope (attack/release to avoid clicks)
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(masterGainValue, ctx.currentTime + 0.01); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration - 0.1); // Fade out

  // Stereo panner to spread strings across the field
  const panner = ctx.createStereoPanner();
  // Pan from left (low strings) to right (high strings)
  panner.pan.value = -0.5 + (stringIndex * 0.2); 

  source.connect(panner);
  panner.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start();
};
