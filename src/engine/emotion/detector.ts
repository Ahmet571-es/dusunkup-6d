/**
 * Emotion Detection from Touch Patterns
 * Analyzes interaction patterns to estimate child's emotional state.
 * No camera or microphone needed — purely behavioral.
 */

import type { EmotionType } from '@/types';

interface TouchEvent {
  timestamp: number;
  x: number;
  y: number;
  force?: number;     // Touch pressure if available
  duration: number;   // How long touch was held
}

interface EmotionEstimate {
  type: EmotionType;
  confidence: number; // 0-1
  evidence: string;
}

export class EmotionDetector {
  private touches: TouchEvent[] = [];
  private windowMs: number = 15000; // Analyze last 15 seconds
  
  recordTouch(event: TouchEvent): void {
    this.touches.push(event);
    // Keep only recent touches
    const cutoff = Date.now() - this.windowMs * 2;
    this.touches = this.touches.filter(t => t.timestamp > cutoff);
  }
  
  detect(): EmotionEstimate {
    const recent = this.touches.filter(t => t.timestamp > Date.now() - this.windowMs);
    if (recent.length < 3) return { type: 'calm', confidence: 0.3, evidence: 'insufficient_data' };
    
    // Compute touch metrics
    const intervals = [];
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i].timestamp - recent[i-1].timestamp);
    }
    const avgInterval = intervals.reduce((a,b) => a+b, 0) / intervals.length;
    const intervalVariance = intervals.reduce((s,v) => s + (v - avgInterval)**2, 0) / intervals.length;
    const avgDuration = recent.reduce((s,t) => s + t.duration, 0) / recent.length;
    const touchRate = recent.length / (this.windowMs / 1000); // touches per second
    
    // Frustration: fast, hard, erratic touches
    if (touchRate > 3 && intervalVariance > 50000 && avgDuration < 100) {
      return { type: 'frustrated', confidence: 0.7, evidence: 'rapid_erratic_touches' };
    }
    
    // Boredom: slow, infrequent, wandering touches
    if (touchRate < 0.3 && avgInterval > 5000) {
      return { type: 'bored', confidence: 0.65, evidence: 'slow_infrequent_touches' };
    }
    
    // Anxiety: fast but hesitant (short duration, moderate rate)
    if (avgDuration < 80 && touchRate > 1.5 && touchRate < 3) {
      return { type: 'anxious', confidence: 0.5, evidence: 'hesitant_rapid_touches' };
    }
    
    // Excited: fast, consistent, energetic
    if (touchRate > 2 && intervalVariance < 20000 && avgDuration > 100) {
      return { type: 'excited', confidence: 0.6, evidence: 'fast_consistent_touches' };
    }
    
    // Focused: moderate rate, consistent intervals, deliberate
    if (touchRate > 0.5 && touchRate < 2 && intervalVariance < 30000) {
      return { type: 'focused', confidence: 0.6, evidence: 'steady_deliberate_touches' };
    }
    
    return { type: 'calm', confidence: 0.4, evidence: 'baseline_pattern' };
  }
  
  /**
   * Get intervention recommendation based on emotion
   */
  getIntervention(emotion: EmotionType): { action: string; message: string } | null {
    switch (emotion) {
      case 'frustrated':
        return {
          action: 'breathing_exercise',
          message: 'Hadi birlikte derin bir nefes alalım... 🌬️'
        };
      case 'bored':
        return {
          action: 'switch_activity',
          message: 'Başka bir dünyayı keşfetmek ister misin? 🌟'
        };
      case 'anxious':
        return {
          action: 'reduce_difficulty',
          message: 'Harika gidiyorsun! Birlikte yapalım 💪'
        };
      default:
        return null;
    }
  }
  
  reset(): void {
    this.touches = [];
  }
}
