// ============================================================
// DüşünKüp 6D — Core Type Definitions
// ============================================================

// === Grade Levels ===
export type GradeLevel = 'anaokulu' | 'sinif1' | 'sinif2' | 'sinif3' | 'sinif4' | 'sinif5';

export const GRADE_LABELS: Record<GradeLevel, string> = {
  anaokulu: 'Anaokulu',
  sinif1: '1. Sınıf',
  sinif2: '2. Sınıf',
  sinif3: '3. Sınıf',
  sinif4: '4. Sınıf',
  sinif5: '5. Sınıf',
};

export const GRADE_AGES: Record<GradeLevel, string> = {
  anaokulu: '5-6 yaş',
  sinif1: '6-7 yaş',
  sinif2: '7-8 yaş',
  sinif3: '8-9 yaş',
  sinif4: '9-10 yaş',
  sinif5: '10-11 yaş',
};

export const GRADE_COLORS: Record<GradeLevel, string> = {
  anaokulu: '#F43F5E',
  sinif1: '#F59E0B',
  sinif2: '#10B981',
  sinif3: '#3B82F6',
  sinif4: '#8B5CF6',
  sinif5: '#F97316',
};

// Max session duration per grade (minutes)
export const GRADE_SESSION_DURATION: Record<GradeLevel, number> = {
  anaokulu: 10,
  sinif1: 15,
  sinif2: 20,
  sinif3: 20,
  sinif4: 25,
  sinif5: 25,
};

// === Database Models ===
export interface School {
  id: string;
  name: string;
  city: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  email: string;
  full_name: string;
  password_hash: string;
  avatar_url?: string;
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string; // e.g., "Anaokulu-A", "1-B"
  grade_level: GradeLevel;
  section: string; // e.g., "A", "B"
  academic_year: string; // e.g., "2025-2026"
  created_at: string;
}

export interface Student {
  id: string;
  class_id: string;
  first_name: string;
  last_name: string;
  avatar_id: number;
  birth_date?: string;
  created_at: string;
}

// === Avatar System ===
export interface Avatar {
  id: number;
  icon: string;
  name: string;
  gradient: string;
  ring_color: string;
}

export const AVATARS: Avatar[] = [
  { id: 1, icon: '🦁', name: 'Aslan Ali', gradient: 'linear-gradient(135deg,#F59E0B,#D97706)', ring_color: '#F59E0B' },
  { id: 2, icon: '🐰', name: 'Tavşan Ela', gradient: 'linear-gradient(135deg,#EC4899,#DB2777)', ring_color: '#EC4899' },
  { id: 3, icon: '🦊', name: 'Tilki Can', gradient: 'linear-gradient(135deg,#F97316,#EA580C)', ring_color: '#F97316' },
  { id: 4, icon: '🐻', name: 'Ayı Batu', gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', ring_color: '#8B5CF6' },
  { id: 5, icon: '🦋', name: 'Kelebek Nisa', gradient: 'linear-gradient(135deg,#06B6D4,#0891B2)', ring_color: '#06B6D4' },
  { id: 6, icon: '🐸', name: 'Kurbağa Efe', gradient: 'linear-gradient(135deg,#22C55E,#16A34A)', ring_color: '#22C55E' },
  { id: 7, icon: '🦉', name: 'Baykuş Defne', gradient: 'linear-gradient(135deg,#6366F1,#4F46E5)', ring_color: '#6366F1' },
  { id: 8, icon: '🐬', name: 'Yunus Deniz', gradient: 'linear-gradient(135deg,#3B82F6,#2563EB)', ring_color: '#3B82F6' },
  { id: 9, icon: '🐱', name: 'Kedi Mira', gradient: 'linear-gradient(135deg,#EC4899,#BE185D)', ring_color: '#EC4899' },
  { id: 10, icon: '🐼', name: 'Panda Mert', gradient: 'linear-gradient(135deg,#6B7280,#374151)', ring_color: '#6B7280' },
];

// === Game System ===
export type GameCategory = 'attention' | 'math';

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  grade_level: GradeLevel;
  category: GameCategory;
  scientific_basis: string; // e.g., "CPT - Continuous Performance Task"
  target_skills: string[];
  difficulty_axes: DifficultyAxis[];
  modules: GameModule[];
  session_duration_minutes: number;
}

export interface GameModule {
  id: string;
  name: string;
  description: string;
  paradigm: string; // e.g., "Subitizing", "N-back", "Flanker"
  duration_minutes: number;
}

export interface DifficultyAxis {
  id: string;
  name: string;
  min_value: number;
  max_value: number;
  current_value: number;
  description: string;
}

// === 6D Engine Types ===

// BKT (Bayesian Knowledge Tracing) parameters per skill per student
export interface BKTParams {
  student_id: string;
  skill_id: string;
  p_learned: number;    // P(L) - probability of mastery
  p_transit: number;    // P(T) - probability of learning per trial
  p_guess: number;      // P(G) - probability of guessing correctly
  p_slip: number;       // P(S) - probability of slipping
  updated_at: string;
}

// Stealth Assessment — per game event
export interface GameEvent {
  id: string;
  session_id: string;
  student_id: string;
  event_type: GameEventType;
  timestamp: string;
  response_time_ms: number | null;
  is_correct: boolean | null;
  difficulty_level: Record<string, number>; // axis_id → value
  metadata: Record<string, unknown>;
}

export type GameEventType =
  | 'stimulus_shown'
  | 'response_given'
  | 'response_correct'
  | 'response_incorrect'
  | 'response_timeout'
  | 'hint_requested'
  | 'hint_used'
  | 'target_hit'      // CPT: correct touch on target
  | 'target_miss'     // CPT: missed target (omission)
  | 'false_alarm'     // CPT: touched non-target (commission)
  | 'correct_rejection'// CPT: correctly ignored non-target
  | 'strategy_detected'// Math: which strategy was used
  | 'misconception_detected'
  | 'emotion_detected'
  | 'session_start'
  | 'session_end'
  | 'module_start'
  | 'module_end'
  | 'break_started'
  | 'break_ended';

// Game Session
export interface GameSession {
  id: string;
  student_id: string;
  game_id: string;
  grade_level: GradeLevel;
  started_at: string;
  ended_at: string | null;
  total_events: number;
  score: number;
  metrics: SessionMetrics;
}

// === Cognitive Metrics ===

// 7-Component Attention Profile
export interface AttentionProfile {
  arousal: number;               // 0-100: Tonic alertness
  phasic_alertness: number;      // 0-100: Cued readiness
  sustained_attention: number;   // 0-100: Vigilance maintenance
  selective_attention: number;   // 0-100: Distractor filtering
  focused_attention: number;     // 0-100: Flanker resistance
  divided_attention: number;     // 0-100: Dual-task management
  attention_shifting: number;    // 0-100: Task-switching efficiency
}

// 12 Attention Metrics (per session)
export interface AttentionMetrics {
  hit_rate: number;
  miss_rate: number;
  false_alarm_rate: number;
  d_prime: number;                // Signal detection sensitivity
  response_bias: number;          // β - liberal vs conservative
  mean_rt: number;                // Mean response time (ms)
  rt_standard_deviation: number;
  coefficient_of_variation: number;
  vigilance_decrement_slope: number;
  post_error_slowing: number;     // RT increase after error
  sequential_effects: number;     // Performance consistency
  intra_individual_variability: number;
}

// Math Competency Map
export interface MathProfile {
  number_sense: NumberSenseMetrics;
  arithmetic_fluency: ArithmeticFluencyMetrics;
  conceptual_understanding: number; // 0-100
  strategic_competence: number;     // 0-100
  adaptive_reasoning: number;       // 0-100
}

export interface NumberSenseMetrics {
  subitizing_accuracy: number;      // % correct for 1-3
  conceptual_subitizing: number;    // % correct for 4-6
  weber_fraction: number;           // w value (lower = better)
  number_line_pae: number;          // Percent Absolute Error
  representation_type: 'logarithmic' | 'linear' | 'transitional';
  approximate_arithmetic: number;    // ANS accuracy %
}

export interface ArithmeticFluencyMetrics {
  addition_fluency: number;         // correct per minute
  subtraction_fluency: number;
  multiplication_fluency: number;
  division_fluency: number;
  dominant_strategy: MathStrategy;
  strategy_portfolio: Record<MathStrategy, number>; // strategy → usage %
  automatized_facts_percent: number; // % of facts with P(L) > 0.85
}

export type MathStrategy =
  | 'counting_all'
  | 'counting_on_first'
  | 'counting_on_larger'
  | 'making_tens'
  | 'near_doubles'
  | 'compensation'
  | 'retrieval';

// Combined Session Metrics
export interface SessionMetrics {
  attention: Partial<AttentionMetrics>;
  math: Partial<MathProfile>;
  emotion_states: EmotionState[];
  engagement_score: number; // 0-100
  duration_minutes: number;
  total_trials: number;
  correct_trials: number;
}

// === Emotion Detection ===
export type EmotionType = 'calm' | 'focused' | 'excited' | 'frustrated' | 'bored' | 'anxious';

export interface EmotionState {
  type: EmotionType;
  confidence: number;  // 0-1
  timestamp: string;
  evidence: string;    // what triggered detection
}

// === Misconception Detection ===
export interface Misconception {
  id: string;
  student_id: string;
  grade_level: GradeLevel;
  category: string;         // e.g., "number_conservation", "fraction_whole_number_bias"
  description: string;
  evidence: string;
  severity: 'mild' | 'moderate' | 'severe';
  recommended_intervention: string;
  detected_at: string;
  resolved_at: string | null;
}

// === Spaced Repetition ===
export interface SpacedRepetitionItem {
  student_id: string;
  skill_id: string;
  ease_factor: number;      // 2.5 default, adjusts with performance
  interval_days: number;    // current interval
  next_review: string;      // next review date
  repetitions: number;
  last_quality: number;     // 0-5 quality of last response
}

// === Reports ===
export type ReportType = 'weekly' | 'monthly' | 'semester' | 'diagnostic';
export type ReportAudience = 'teacher' | 'parent' | 'admin';

export interface Report {
  id: string;
  student_id: string;
  class_id: string;
  report_type: ReportType;
  audience: ReportAudience;
  period_start: string;
  period_end: string;
  attention_profile: AttentionProfile;
  math_profile: MathProfile;
  misconceptions: Misconception[];
  ai_analysis: string;       // Claude AI generated analysis
  recommendations: string[];
  generated_at: string;
}

// === Dosage Tracking ===
export interface DosageRecord {
  student_id: string;
  week_start: string;
  sustained_attention_minutes: number;
  selective_attention_minutes: number;
  working_memory_minutes: number;
  cognitive_flexibility_minutes: number;
  inhibition_minutes: number;
  math_practice_minutes: number;
  total_sessions: number;
  target_met: boolean;
}

// === Early Detection Alerts ===
export type AlertType = 'dyscalculia_risk' | 'adhd_indicators' | 'working_memory_deficit' | 'emotional_concern' | 'performance_drop';

export interface Alert {
  id: string;
  student_id: string;
  teacher_id: string;
  alert_type: AlertType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, number>;
  recommended_action: string;
  created_at: string;
  acknowledged_at: string | null;
}
