/**
 * Bayesian Knowledge Tracing (BKT) Algorithm
 * Core of the 6D Adaptive Intelligence Layer
 * 
 * Based on: Corbett & Anderson (1995)
 * "Knowledge Tracing: Modeling the Acquisition of Procedural Knowledge"
 * 
 * For each student × skill pair, maintains:
 * - P(L) = probability student has learned the skill
 * - P(T) = probability of learning on each trial
 * - P(G) = probability of guessing correctly without knowledge
 * - P(S) = probability of slipping (error despite knowledge)
 */

export interface BKTState {
  pLearned: number;  // P(L_n) — current mastery probability
  pTransit: number;  // P(T) — learning rate
  pGuess: number;    // P(G)
  pSlip: number;     // P(S)
  trials: number;
}

const DEFAULT_BKT: BKTState = {
  pLearned: 0.1,
  pTransit: 0.1,
  pGuess: 0.25,
  pSlip: 0.1,
  trials: 0,
};

/**
 * Update BKT after a student response
 * @param state Current BKT state
 * @param correct Whether the student answered correctly
 * @returns Updated BKT state
 */
export function updateBKT(state: BKTState, correct: boolean): BKTState {
  const { pLearned, pTransit, pGuess, pSlip } = state;
  
  // Step 1: Posterior update — P(L_n | observation)
  let pLearned_posterior: number;
  
  if (correct) {
    // P(L|correct) = P(correct|L) * P(L) / P(correct)
    // P(correct|L) = 1 - P(S)
    // P(correct|¬L) = P(G)
    const pCorrectGivenL = 1 - pSlip;
    const pCorrectGivenNotL = pGuess;
    const pCorrect = pCorrectGivenL * pLearned + pCorrectGivenNotL * (1 - pLearned);
    pLearned_posterior = (pCorrectGivenL * pLearned) / pCorrect;
  } else {
    // P(L|incorrect) = P(incorrect|L) * P(L) / P(incorrect)
    // P(incorrect|L) = P(S)
    // P(incorrect|¬L) = 1 - P(G)
    const pIncorrectGivenL = pSlip;
    const pIncorrectGivenNotL = 1 - pGuess;
    const pIncorrect = pIncorrectGivenL * pLearned + pIncorrectGivenNotL * (1 - pLearned);
    pLearned_posterior = (pIncorrectGivenL * pLearned) / pIncorrect;
  }
  
  // Step 2: Transition update — P(L_{n+1}) accounting for learning
  const pLearned_next = pLearned_posterior + (1 - pLearned_posterior) * pTransit;
  
  return {
    ...state,
    pLearned: Math.min(0.99, Math.max(0.01, pLearned_next)),
    trials: state.trials + 1,
  };
}

/**
 * Determine if a skill is mastered
 * @param state BKT state
 * @param threshold Mastery threshold (default 0.85)
 */
export function isMastered(state: BKTState, threshold = 0.85): boolean {
  return state.pLearned >= threshold;
}

/**
 * Determine optimal difficulty based on ZPD (Zone of Proximal Development)
 * Target: keep P(correct) between 0.6 and 0.8 (Vygotsky's ZPD)
 * 
 * @param pLearned Current mastery probability
 * @returns Recommended difficulty multiplier (0.5 = easy, 1.0 = match, 1.5 = hard)
 */
export function getZPDDifficulty(pLearned: number): number {
  if (pLearned < 0.3) return 0.5;       // Far below ZPD — make easier
  if (pLearned < 0.5) return 0.7;       // Below ZPD
  if (pLearned < 0.7) return 0.85;      // Lower ZPD
  if (pLearned < 0.85) return 1.0;      // In ZPD — optimal
  if (pLearned < 0.95) return 1.15;     // Upper ZPD — challenge
  return 1.3;                            // Above ZPD — advance
}

/**
 * Calculate predicted success probability
 */
export function predictSuccess(state: BKTState): number {
  return state.pLearned * (1 - state.pSlip) + (1 - state.pLearned) * state.pGuess;
}

/**
 * Create initial BKT state with optional customization
 */
export function createBKT(overrides?: Partial<BKTState>): BKTState {
  return { ...DEFAULT_BKT, ...overrides };
}
