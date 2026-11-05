/**
 * MediTrack Smart Audio & Alarm Engine
 * Provides gentle, clear acoustic medical chimes with autoplay unlock,
 * volume control, and repeating alarm support for elderly accessibility.
 */

type AudioContextConstructor = new () => AudioContext;

function getAudioContextClass(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  );
}

let sharedAudioContext: AudioContext | null = null;
let activeLoopTimeout: ReturnType<typeof setTimeout> | null = null;
let isAlarmLoopActive = false;

/**
 * Initializes or retrieves the shared AudioContext and unlocks it
 * in response to browser autoplay constraints.
 */
export async function getUnlockedAudioContext(): Promise<AudioContext | null> {
  const AudioCtx = getAudioContextClass();
  if (!AudioCtx) return null;

  try {
    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioCtx();
    }
    if (sharedAudioContext.state === "suspended") {
      await sharedAudioContext.resume();
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

// Auto-register touch/click unlock listeners once on client
if (typeof window !== "undefined") {
  const unlockListener = () => {
    void getUnlockedAudioContext();
    window.removeEventListener("pointerdown", unlockListener);
    window.removeEventListener("keydown", unlockListener);
    window.removeEventListener("touchstart", unlockListener);
  };
  window.addEventListener("pointerdown", unlockListener, { passive: true });
  window.addEventListener("keydown", unlockListener, { passive: true });
  window.addEventListener("touchstart", unlockListener, { passive: true });
}

/**
 * Plays a gentle, pleasant 3-note harmonic medical chime (C5 - E5 - G5 major chord).
 * Clear and audible for elderly ears, without harsh buzzing or startling tones.
 */
export async function playChime(volume: number = 0.35): Promise<boolean> {
  const ctx = await getUnlockedAudioContext();
  if (!ctx) return false;

  try {
    const clampedVolume = Math.max(0.05, Math.min(1.0, volume));
    const now = ctx.currentTime;

    // Harmonic medical triad: C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz)
    const notes = [
      { freq: 523.25, start: 0, duration: 0.35 },
      { freq: 659.25, start: 0.14, duration: 0.38 },
      { freq: 783.99, start: 0.28, duration: 0.55 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(clampedVolume, now);
    masterGain.connect(ctx.destination);

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      // Soft acoustic envelope (gentle attack, smooth warm decay)
      noteGain.gain.setValueAtTime(0.0001, now + note.start);
      noteGain.gain.exponentialRampToValueAtTime(1, now + note.start + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration + 0.05);
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Starts a gentle repeating reminder loop that chimes periodically
 * until stopped or confirmed by the patient.
 */
export function startGentleAlarmLoop(
  intervalSeconds: number = 30,
  volume: number = 0.35,
  maxRepeats: number = 6,
): () => void {
  stopAlarmLoop();
  isAlarmLoopActive = true;
  let count = 0;

  const tick = () => {
    if (!isAlarmLoopActive) return;
    void playChime(volume);
    count++;
    if (count < maxRepeats && isAlarmLoopActive) {
      activeLoopTimeout = setTimeout(tick, intervalSeconds * 1000);
    } else {
      isAlarmLoopActive = false;
    }
  };

  tick();
  return stopAlarmLoop;
}

/**
 * Stops any actively running reminder chime loop immediately.
 */
export function stopAlarmLoop(): void {
  isAlarmLoopActive = false;
  if (activeLoopTimeout) {
    clearTimeout(activeLoopTimeout);
    activeLoopTimeout = null;
  }
}