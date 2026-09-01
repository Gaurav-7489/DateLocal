"use client";

class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  private tone(frequency: number, duration = 0.06, volume = 0.08, type: OscillatorType = "sine") {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") void this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playClick() {
    this.tone(620, 0.045, 0.045);
  }

  playPop() {
    this.tone(440, 0.06, 0.08);
    window.setTimeout(() => this.tone(880, 0.05, 0.04), 25);
  }

  playLike() {
    this.tone(659.25, 0.07, 0.07, "triangle");
  }

  playPass() {
    this.tone(300, 0.06, 0.045, "sine");
  }

  playSuccess() {
    this.tone(659.25, 0.08, 0.06, "triangle");
    window.setTimeout(() => this.tone(783.99, 0.12, 0.06, "triangle"), 65);
  }

  playMatchChime() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      window.setTimeout(() => this.tone(frequency, 0.2, 0.09, "triangle"), index * 70);
    });
  }

  haptic(pattern: number | number[] = 8) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

export const soundFx = new SoundEngine();
