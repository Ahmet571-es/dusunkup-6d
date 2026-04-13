/**
 * Stealth Assessment Tracker
 * Records every interaction without the child knowing they're being assessed.
 * Computes 12 attention metrics and math proficiency indicators in real-time.
 */

export interface TrialData {
  timestamp: number;
  trialType: 'target' | 'distractor' | 'math' | 'memory';
  stimulusShownAt: number;
  responseAt: number | null;      // null = no response (omission)
  responseTimeMs: number | null;
  isCorrect: boolean | null;
  isTarget: boolean;
  responded: boolean;
  difficultyAxes: Record<string, number>;
  metadata: Record<string, unknown>;
}

export interface AttentionMetricsResult {
  hitRate: number;
  missRate: number;
  falseAlarmRate: number;
  dPrime: number;
  responseBias: number;
  meanRT: number;
  rtStd: number;
  coefficientOfVariation: number;
  vigilanceDecrementSlope: number;
  postErrorSlowing: number;
  sequentialEffects: number;
  intraIndividualVariability: number;
}

export class StealthTracker {
  private trials: TrialData[] = [];
  private sessionStart: number = Date.now();
  
  addTrial(trial: TrialData): void {
    this.trials.push(trial);
  }
  
  computeAttentionMetrics(): AttentionMetricsResult {
    const targets = this.trials.filter(t => t.isTarget);
    const distractors = this.trials.filter(t => !t.isTarget);
    
    // Hit Rate: proportion of targets correctly responded to
    const hits = targets.filter(t => t.responded && t.isCorrect).length;
    const hitRate = targets.length > 0 ? hits / targets.length : 0;
    
    // Miss Rate: proportion of targets not responded to (omissions)
    const misses = targets.filter(t => !t.responded).length;
    const missRate = targets.length > 0 ? misses / targets.length : 0;
    
    // False Alarm Rate: proportion of distractors incorrectly responded to
    const falseAlarms = distractors.filter(t => t.responded).length;
    const falseAlarmRate = distractors.length > 0 ? falseAlarms / distractors.length : 0;
    
    // d-prime (signal detection theory)
    const zHR = zScore(Math.min(0.99, Math.max(0.01, hitRate)));
    const zFAR = zScore(Math.min(0.99, Math.max(0.01, falseAlarmRate)));
    const dPrime = zHR - zFAR;
    
    // Response Bias (β): negative = liberal, positive = conservative
    const responseBias = -0.5 * (zHR + zFAR);
    
    // RT metrics (only for responded trials)
    const rts = this.trials
      .filter(t => t.responded && t.responseTimeMs !== null)
      .map(t => t.responseTimeMs!);
    
    const meanRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
    const rtStd = rts.length > 1 ? Math.sqrt(rts.reduce((sum, rt) => sum + (rt - meanRT) ** 2, 0) / (rts.length - 1)) : 0;
    const coefficientOfVariation = meanRT > 0 ? rtStd / meanRT : 0;
    
    // Vigilance Decrement: linear regression of accuracy over time blocks
    const vigilanceDecrementSlope = this.computeVigilanceSlope();
    
    // Post-Error Slowing
    const postErrorSlowing = this.computePostErrorSlowing();
    
    // Sequential Effects
    const sequentialEffects = this.computeSequentialEffects();
    
    // Intra-Individual Variability
    const intraIndividualVariability = coefficientOfVariation;
    
    return {
      hitRate, missRate, falseAlarmRate, dPrime, responseBias,
      meanRT, rtStd, coefficientOfVariation,
      vigilanceDecrementSlope, postErrorSlowing,
      sequentialEffects, intraIndividualVariability,
    };
  }
  
  private computeVigilanceSlope(): number {
    // Divide session into 4 blocks, compute accuracy per block
    if (this.trials.length < 8) return 0;
    const blockSize = Math.floor(this.trials.length / 4);
    const blockAccuracies = [];
    for (let i = 0; i < 4; i++) {
      const block = this.trials.slice(i * blockSize, (i + 1) * blockSize);
      const correct = block.filter(t => t.isCorrect).length;
      blockAccuracies.push(correct / block.length);
    }
    // Simple linear regression slope
    const xMean = 1.5;
    const yMean = blockAccuracies.reduce((a, b) => a + b, 0) / 4;
    let num = 0, den = 0;
    blockAccuracies.forEach((y, i) => {
      num += (i - xMean) * (y - yMean);
      den += (i - xMean) ** 2;
    });
    return den > 0 ? num / den : 0; // negative = declining
  }
  
  private computePostErrorSlowing(): number {
    let slowingSum = 0;
    let count = 0;
    for (let i = 1; i < this.trials.length; i++) {
      if (!this.trials[i - 1].isCorrect && this.trials[i].responseTimeMs && this.trials[i - 1].responseTimeMs) {
        slowingSum += this.trials[i].responseTimeMs! - this.trials[i - 1].responseTimeMs!;
        count++;
      }
    }
    return count > 0 ? slowingSum / count : 0;
  }
  
  private computeSequentialEffects(): number {
    // Measure consistency: stdev of running accuracy over 5-trial windows
    if (this.trials.length < 10) return 0;
    const windowSize = 5;
    const windowAccs = [];
    for (let i = 0; i <= this.trials.length - windowSize; i++) {
      const window = this.trials.slice(i, i + windowSize);
      windowAccs.push(window.filter(t => t.isCorrect).length / windowSize);
    }
    const mean = windowAccs.reduce((a, b) => a + b, 0) / windowAccs.length;
    const variance = windowAccs.reduce((sum, v) => sum + (v - mean) ** 2, 0) / windowAccs.length;
    return Math.sqrt(variance); // Higher = more inconsistent
  }
  
  /**
   * Detect math strategy from RT patterns
   */
  detectMathStrategy(a: number, b: number, rt: number): string {
    const total = a + b;
    const smaller = Math.min(a, b);
    
    // Retrieval: RT < 1500ms regardless of operands
    if (rt < 1500) return 'retrieval';
    // Counting on from larger: RT correlates with smaller operand
    if (rt < 2000 + smaller * 400) return 'counting_on_larger';
    // Counting on from first: RT correlates with second operand
    if (rt < 2000 + b * 400) return 'counting_on_first';
    // Counting all: RT correlates with total
    return 'counting_all';
  }
  
  getTrialCount(): number { return this.trials.length; }
  getSessionDurationMs(): number { return Date.now() - this.sessionStart; }
  
  reset(): void {
    this.trials = [];
    this.sessionStart = Date.now();
  }
}

// Inverse normal CDF approximation (Abramowitz & Stegun)
function zScore(p: number): number {
  if (p <= 0) return -3.5;
  if (p >= 1) return 3.5;
  const a1 = -3.969683028665376e1;
  const a2 = 2.209460984245205e2;
  const a3 = -2.759285104469687e2;
  const a4 = 1.383577518672690e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239e0;
  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;
  const t = p < 0.5 ? Math.sqrt(-2 * Math.log(p)) : Math.sqrt(-2 * Math.log(1 - p));
  const z = (((((a1*t+a2)*t+a3)*t+a4)*t+a5)*t+a6) / (((((b1*t+b2)*t+b3)*t+b4)*t+b5)*t+1);
  return p < 0.5 ? -z : z;
}
