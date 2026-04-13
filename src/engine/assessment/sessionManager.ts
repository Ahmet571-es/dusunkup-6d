/**
 * Game Session Manager
 * Manages lifecycle of game sessions, collects events, computes metrics
 * Integrates BKT, Stealth Assessment, Emotion Detection, and Spaced Repetition
 */

import { StealthTracker, type TrialData } from './tracker'
import { EmotionDetector } from '../emotion/detector'
import { updateBKT, createBKT, getZPDDifficulty, type BKTState } from '../adaptive/bkt'
import { audioEngine } from '../audio/audioEngine'
import type { GradeLevel, GameEventType, EmotionType } from '@/types'

export interface SessionConfig {
  studentId: string
  gameId: string
  gradeLevel: GradeLevel
  maxDurationSeconds: number
  difficultyAxes: Record<string, number> // axis_id → initial value
}

export interface SessionState {
  isActive: boolean
  startedAt: number
  elapsedSeconds: number
  score: number
  trials: number
  correctTrials: number
  currentEmotion: EmotionType
  emotionConfidence: number
  difficultyAxes: Record<string, number>
  events: Array<{ type: GameEventType; timestamp: number; data: Record<string, unknown> }>
}

export class SessionManager {
  private config: SessionConfig
  private state: SessionState
  private tracker: StealthTracker
  private emotionDetector: EmotionDetector
  private bktStates: Map<string, BKTState> = new Map()
  private timerInterval: number | null = null
  private onStateChange: ((state: SessionState) => void) | null = null

  constructor(config: SessionConfig) {
    this.config = config
    this.tracker = new StealthTracker()
    this.emotionDetector = new EmotionDetector()
    this.state = {
      isActive: false,
      startedAt: 0,
      elapsedSeconds: 0,
      score: 0,
      trials: 0,
      correctTrials: 0,
      currentEmotion: 'calm',
      emotionConfidence: 0,
      difficultyAxes: { ...config.difficultyAxes },
      events: [],
    }
  }

  /**
   * Start the game session
   */
  start(onChange?: (state: SessionState) => void): void {
    this.onStateChange = onChange || null
    this.state.isActive = true
    this.state.startedAt = Date.now()
    this.addEvent('session_start', {})

    // Timer
    this.timerInterval = window.setInterval(() => {
      this.state.elapsedSeconds = Math.floor((Date.now() - this.state.startedAt) / 1000)

      // Check max duration
      if (this.state.elapsedSeconds >= this.config.maxDurationSeconds) {
        this.end()
      }

      // Detect emotion every 5 seconds
      if (this.state.elapsedSeconds % 5 === 0) {
        const emotion = this.emotionDetector.detect()
        this.state.currentEmotion = emotion.type
        this.state.emotionConfidence = emotion.confidence

        if (emotion.confidence > 0.6) {
          audioEngine.adaptMusic(emotion.type, this.getAccuracy())
          this.addEvent('emotion_detected', { emotion: emotion.type, confidence: emotion.confidence })
        }
      }

      this.notifyChange()
    }, 1000)

    this.notifyChange()
  }

  /**
   * Record a trial (student response to a stimulus)
   */
  recordTrial(trial: TrialData): void {
    this.tracker.addTrial(trial)
    this.state.trials++
    if (trial.isCorrect) this.state.correctTrials++

    // Update BKT for the relevant skill
    const skillId = trial.metadata.skillId as string || 'default'
    if (!this.bktStates.has(skillId)) {
      this.bktStates.set(skillId, createBKT())
    }
    const bkt = updateBKT(this.bktStates.get(skillId)!, trial.isCorrect || false)
    this.bktStates.set(skillId, bkt)

    // Adjust difficulty based on ZPD
    const zpd = getZPDDifficulty(bkt.pLearned)
    Object.keys(this.state.difficultyAxes).forEach(axis => {
      this.state.difficultyAxes[axis] = Math.max(1, Math.min(10,
        Math.round(this.state.difficultyAxes[axis] * zpd)
      ))
    })

    // Score
    if (trial.isCorrect) {
      const basePoints = 10
      const difficultyBonus = Math.round(Object.values(this.state.difficultyAxes).reduce((a,b) => a+b, 0) / Object.keys(this.state.difficultyAxes).length)
      this.state.score += basePoints + difficultyBonus
      audioEngine.playCorrect()
    } else {
      audioEngine.playIncorrect()
    }

    this.addEvent(trial.isCorrect ? 'response_correct' : 'response_incorrect', {
      responseTimeMs: trial.responseTimeMs,
      skillId,
      difficulty: { ...this.state.difficultyAxes },
      bktPLearned: bkt.pLearned,
    })

    this.notifyChange()
  }

  /**
   * Record a touch event (for emotion detection)
   */
  recordTouch(x: number, y: number, duration: number, force?: number): void {
    this.emotionDetector.recordTouch({ timestamp: Date.now(), x, y, duration, force })
  }

  /**
   * End the session
   */
  end(): SessionState {
    this.state.isActive = false
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
    this.addEvent('session_end', {
      totalTrials: this.state.trials,
      correctTrials: this.state.correctTrials,
      score: this.state.score,
      accuracy: this.getAccuracy(),
      metrics: this.tracker.computeAttentionMetrics(),
    })
    this.notifyChange()
    return this.state
  }

  /**
   * Get current difficulty for an axis
   */
  getDifficulty(axisId: string): number {
    return this.state.difficultyAxes[axisId] || 1
  }

  /**
   * Get BKT mastery for a skill
   */
  getMastery(skillId: string): number {
    return this.bktStates.get(skillId)?.pLearned || 0.1
  }

  /**
   * Get current accuracy
   */
  getAccuracy(): number {
    return this.state.trials > 0 ? this.state.correctTrials / this.state.trials : 0
  }

  /**
   * Get emotion-based intervention if needed
   */
  getIntervention(): { action: string; message: string } | null {
    if (this.state.emotionConfidence < 0.6) return null
    return this.emotionDetector.getIntervention(this.state.currentEmotion)
  }

  /**
   * Get computed attention metrics
   */
  getAttentionMetrics() {
    return this.tracker.computeAttentionMetrics()
  }

  getState(): SessionState { return this.state }

  private addEvent(type: GameEventType, data: Record<string, unknown>): void {
    this.state.events.push({ type, timestamp: Date.now(), data })
  }

  private notifyChange(): void {
    this.onStateChange?.(this.state)
  }

  dispose(): void {
    if (this.timerInterval) clearInterval(this.timerInterval)
    this.tracker.reset()
    this.emotionDetector.reset()
  }
}
