/**
 * Audio Engine — Web Audio API (procedural, no asset files)
 *
 * Çocuk dostu sesleri dinamik olarak üretir. Dosya asset'i gerektirmez,
 * bundle'a yük bindirmez. Sesler kısa, melodik ve pozitif.
 *
 * Çıktılar:
 *  • playCorrect()     → C5→E5→G5 arpej, sıcak sine
 *  • playIncorrect()   → Düşük oktav iki nota (nazik, cezalandırıcı değil)
 *  • playCelebration() → C5-E5-G5-C6 arpej, şenlik
 *  • playTick()        → kısa 'klik' UI sesi
 *  • playStreak(n)     → seri sayısına göre yükselen ton
 *
 * Not: navigator.vibrate desteklenen cihazlarda haptic de tetiklenir.
 */

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isMuted = false
  private masterVolume = 0.6
  private initialized = false

  /** Browser autoplay policy gereği ilk user interaction'da çağrılır. */
  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx
    try {
      const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
      if (!Ctor) return null
      this.ctx = new Ctor()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.masterVolume
      this.masterGain.connect(this.ctx.destination)
      this.initialized = true
      return this.ctx
    } catch {
      return null
    }
  }

  /** Tek bir notayı çalan düşük-seviye yardımcı. */
  private playTone(opts: {
    frequency: number
    duration: number
    type?: OscillatorType
    startAt?: number
    volume?: number
    attack?: number
    release?: number
  }): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.masterGain || this.isMuted) return

    const { frequency, duration, type = 'sine', startAt = 0, volume = 0.3, attack = 0.01, release = 0.08 } = opts
    const now = ctx.currentTime + startAt

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, now)

    // ADSR zarfı — çocuk dostu, yumuşak
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + attack)
    gain.gain.setValueAtTime(volume, now + duration - release)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration + 0.02)
  }

  /** Doğru cevap: parlak yükselen arpej (C5-E5-G5). */
  playCorrect(): void {
    this.playTone({ frequency: 523.25, duration: 0.12, type: 'sine', startAt: 0,     volume: 0.28 })
    this.playTone({ frequency: 659.25, duration: 0.12, type: 'sine', startAt: 0.06,  volume: 0.26 })
    this.playTone({ frequency: 783.99, duration: 0.20, type: 'sine', startAt: 0.12,  volume: 0.30 })
    this.triggerHaptic('success')
  }

  /** Yanlış cevap: nazik iki düşük nota (G3-D3). Cezalandırıcı değil. */
  playIncorrect(): void {
    this.playTone({ frequency: 196.00, duration: 0.14, type: 'triangle', startAt: 0,    volume: 0.22 })
    this.playTone({ frequency: 146.83, duration: 0.20, type: 'triangle', startAt: 0.10, volume: 0.22 })
    this.triggerHaptic('light')
  }

  /** Büyük kutlama: C5-E5-G5-C6 tam arpej + altın parıltı. */
  playCelebration(): void {
    this.playTone({ frequency: 523.25, duration: 0.12, type: 'sine', startAt: 0.00, volume: 0.28 })
    this.playTone({ frequency: 659.25, duration: 0.12, type: 'sine', startAt: 0.08, volume: 0.28 })
    this.playTone({ frequency: 783.99, duration: 0.12, type: 'sine', startAt: 0.16, volume: 0.30 })
    this.playTone({ frequency: 1046.5, duration: 0.28, type: 'sine', startAt: 0.24, volume: 0.32 })
    this.playTone({ frequency: 2093.0, duration: 0.20, type: 'triangle', startAt: 0.28, volume: 0.12 })
    this.triggerHaptic('celebration')
  }

  /** Streak: seri uzadıkça ton yükselir. n = streak sayısı. */
  playStreak(n: number): void {
    const base = 523.25 // C5
    const freq = Math.min(base * Math.pow(1.05946, Math.min(n, 12)), 1760)
    this.playTone({ frequency: freq, duration: 0.10, type: 'sine', volume: 0.22 })
  }

  /** Hafif UI klik sesi (tuşlara basıldığında). */
  playTick(): void {
    this.playTone({ frequency: 1400, duration: 0.04, type: 'square', volume: 0.06, attack: 0.002, release: 0.02 })
  }

  /** Legacy kompatibilite. */
  play(id: string): void {
    switch (id) {
      case 'correct':     return this.playCorrect()
      case 'incorrect':   return this.playIncorrect()
      case 'celebration': return this.playCelebration()
      case 'tick':        return this.playTick()
      default: return
    }
  }

  /** Haptic titreşim (mobil). */
  triggerHaptic(type: 'light' | 'success' | 'celebration'): void {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return
    try {
      switch (type) {
        case 'light':       navigator.vibrate(25); break
        case 'success':     navigator.vibrate([35, 25, 35]); break
        case 'celebration': navigator.vibrate([50, 30, 50, 30, 100]); break
      }
    } catch { /* bazı tarayıcılar izin vermez */ }
  }

  /** 6D entegrasyonu — duygusal duruma göre master volume ayarla. */
  adaptMusic(emotion: string, _performance: number): void {
    if (!this.masterGain || !this.ctx) return
    let target = 0.6
    if (emotion === 'frustrated' || emotion === 'anxious') target = 0.35
    else if (emotion === 'bored') target = 0.75
    this.masterVolume = target
    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : target, now + 0.5)
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime
      this.masterGain.gain.cancelScheduledValues(now)
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : this.masterVolume, now + 0.1)
    }
  }

  getMuted(): boolean { return this.isMuted }

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v))
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime)
    }
  }

  isInitialized(): boolean { return this.initialized }

  /** Public kickstart — ilk user gesture'da AudioContext'i başlatır. */
  kickstart(): void { this.ensureContext() }

  dispose(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
      this.masterGain = null
      this.initialized = false
    }
  }
}

export const audioEngine = new AudioEngine()

// İlk user interaction'da AudioContext'i initialize et (autoplay policy)
if (typeof window !== 'undefined') {
  const kickstart = () => {
    audioEngine.kickstart()
    window.removeEventListener('pointerdown', kickstart)
    window.removeEventListener('keydown', kickstart)
    window.removeEventListener('touchstart', kickstart)
  }
  window.addEventListener('pointerdown', kickstart, { once: true })
  window.addEventListener('keydown', kickstart, { once: true })
  window.addEventListener('touchstart', kickstart, { once: true })
}
