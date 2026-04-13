/**
 * Spaced Repetition Algorithm (SM-2 variant)
 * Based on Ebbinghaus forgetting curve + Leitner system
 * Ensures long-term retention of math facts and skills
 */

export interface SRItem {
  skillId: string;
  easeFactor: number;    // 2.5 default, adjusts 1.3-3.0
  interval: number;      // days until next review
  repetitions: number;
  nextReview: Date;
  lastQuality: number;   // 0-5 quality rating
}

/**
 * Update spaced repetition schedule after a practice
 * @param item Current SR item
 * @param quality 0-5 quality of response (5=perfect, 0=complete failure)
 */
export function updateSR(item: SRItem, quality: number): SRItem {
  const q = Math.max(0, Math.min(5, quality));
  
  let newReps = item.repetitions;
  let newInterval = item.interval;
  let newEase = item.easeFactor;
  
  if (q >= 3) {
    // Successful recall
    if (item.repetitions === 0) {
      newInterval = 1; // 1 day
    } else if (item.repetitions === 1) {
      newInterval = 3; // 3 days
    } else {
      newInterval = Math.round(item.interval * item.easeFactor);
    }
    newReps = item.repetitions + 1;
  } else {
    // Failed recall — reset
    newReps = 0;
    newInterval = 1;
  }
  
  // Update ease factor (Anki formula)
  newEase = item.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEase = Math.max(1.3, newEase);
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  
  return {
    skillId: item.skillId,
    easeFactor: newEase,
    interval: newInterval,
    repetitions: newReps,
    nextReview,
    lastQuality: q,
  };
}

/**
 * Create initial SR item
 */
export function createSRItem(skillId: string): SRItem {
  return {
    skillId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: new Date(),
    lastQuality: 0,
  };
}

/**
 * Get items due for review
 */
export function getDueItems(items: SRItem[]): SRItem[] {
  const now = new Date();
  return items.filter(item => item.nextReview <= now);
}

/**
 * Convert response time to quality rating (0-5)
 * Based on expected RT for the skill difficulty
 */
export function rtToQuality(rt: number, expectedRt: number, isCorrect: boolean): number {
  if (!isCorrect) return rt < expectedRt * 0.5 ? 1 : 0; // Wrong: 0 or 1
  
  const ratio = rt / expectedRt;
  if (ratio < 0.5) return 5;   // Very fast & correct
  if (ratio < 0.8) return 4;   // Fast & correct
  if (ratio < 1.2) return 3;   // Normal speed & correct
  if (ratio < 1.8) return 2;   // Slow but correct
  return 1;                     // Very slow but correct
}
