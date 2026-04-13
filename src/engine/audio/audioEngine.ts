/**
 * 5D Audio Engine
 * Adaptive music, spatial sound effects, and haptic feedback
 * Music tempo/mood adjusts based on child's emotional state and performance
 */

import { Howl } from 'howler'

export type SoundCategory = 'ui' | 'correct' | 'incorrect' | 'ambient' | 'character' | 'celebration'

interface SoundConfig {
  src: string
  volume?: number
  loop?: boolean
  category: SoundCategory
}

class AudioEngine {
  private sounds: Map<string, Howl> = new Map()
  private masterVolume = 0.7
  private musicVolume = 0.4
  private sfxVolume = 0.8
  private isMuted = false
  private currentAmbient: Howl | null = null

  /**
   * Preload a sound
   */
  register(id: string, config: SoundConfig): void {
    const volume = config.category === 'ambient' ? this.musicVolume : this.sfxVolume
    const howl = new Howl({
      src: [config.src],
      volume: (config.volume || 1) * volume * this.masterVolume,
      loop: config.loop || false,
      preload: true,
    })
    this.sounds.set(id, howl)
  }

  /**
   * Play a sound by ID
   */
  play(id: string): number | undefined {
    if (this.isMuted) return
    const sound = this.sounds.get(id)
    if (sound) return sound.play()
  }

  /**
   * Stop a sound
   */
  stop(id: string): void {
    this.sounds.get(id)?.stop()
  }

  /**
   * Play correct answer feedback
   */
  playCorrect(): void {
    this.play('correct')
    this.triggerHaptic('success')
  }

  /**
   * Play incorrect answer feedback (gentle, not punishing)
   */
  playIncorrect(): void {
    this.play('incorrect')
    this.triggerHaptic('light')
  }

  /**
   * Play celebration (level complete, achievement)
   */
  playCelebration(): void {
    this.play('celebration')
    this.triggerHaptic('celebration')
  }

  /**
   * Trigger haptic feedback (mobile devices)
   */
  triggerHaptic(type: 'light' | 'success' | 'celebration'): void {
    if (!navigator.vibrate) return
    switch (type) {
      case 'light': navigator.vibrate(30); break
      case 'success': navigator.vibrate([40, 30, 40]); break
      case 'celebration': navigator.vibrate([50, 30, 50, 30, 100]); break
    }
  }

  /**
   * Adapt music based on emotion/performance (6D integration)
   */
  adaptMusic(emotion: string, performance: number): void {
    // In full implementation: adjust tempo, filters, volume
    // For now: adjust volume based on state
    if (emotion === 'frustrated' || emotion === 'anxious') {
      this.musicVolume = 0.2 // Calm down
    } else if (emotion === 'bored') {
      this.musicVolume = 0.5 // Energize
    } else {
      this.musicVolume = 0.4 // Normal
    }
  }

  setMuted(muted: boolean): void { this.isMuted = muted }
  getMuted(): boolean { return this.isMuted }
  setMasterVolume(v: number): void { this.masterVolume = Math.max(0, Math.min(1, v)) }

  dispose(): void {
    this.sounds.forEach(s => s.unload())
    this.sounds.clear()
  }
}

// Singleton
export const audioEngine = new AudioEngine()
