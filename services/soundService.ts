
// Create a single AudioContext instance to be reused.
// It will be initialized on the first user interaction.
let audioCtx: AudioContext | null = null;

// Function to initialize the AudioContext, required by modern browsers
// to be called after a user gesture.
const initAudioContext = () => {
  if (!audioCtx) {
    try {
      // Use the modern AudioContext constructor, with a fallback for older webkit browsers.
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
    }
  }
};

export const playClickSound = () => {
  initAudioContext();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Sound properties for a short "click"
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Start at a reasonable volume

  // Fade out quickly
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.1);
};

export const playSuccessSound = () => {
  initAudioContext();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Sound properties for a "success" chime
  oscillator.type = 'triangle';
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

  // A little rising arpeggio
  oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  oscillator.frequency.linearRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
  oscillator.frequency.linearRampToValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
  
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.3);
};

export const playErrorSound = () => {
  initAudioContext();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Sound properties for a low "error" buzz
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.2);
};
