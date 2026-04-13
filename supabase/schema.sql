-- ============================================================
-- DüşünKüp 6D — Complete Database Schema
-- Bilişsel Gelişim Platformu
-- ============================================================

-- === ENUMS ===
CREATE TYPE grade_level AS ENUM ('anaokulu', 'sinif1', 'sinif2', 'sinif3', 'sinif4', 'sinif5');
CREATE TYPE game_category AS ENUM ('attention', 'math');
CREATE TYPE emotion_type AS ENUM ('calm', 'focused', 'excited', 'frustrated', 'bored', 'anxious');
CREATE TYPE report_type AS ENUM ('weekly', 'monthly', 'semester', 'diagnostic');
CREATE TYPE report_audience AS ENUM ('teacher', 'parent', 'admin');
CREATE TYPE alert_type AS ENUM ('dyscalculia_risk', 'adhd_indicators', 'working_memory_deficit', 'emotional_concern', 'performance_drop');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE misconception_severity AS ENUM ('mild', 'moderate', 'severe');
CREATE TYPE math_strategy AS ENUM ('counting_all', 'counting_on_first', 'counting_on_larger', 'making_tens', 'near_doubles', 'compensation', 'retrieval');
CREATE TYPE number_representation AS ENUM ('logarithmic', 'linear', 'transitional');

-- === SCHOOLS ===
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Ankara',
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- === TEACHERS ===
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_teachers_school ON teachers(school_id);
CREATE INDEX idx_teachers_email ON teachers(email);

-- === CLASSES ===
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Anaokulu-A", "1-B", "3-A"
  grade_level grade_level NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  academic_year TEXT NOT NULL DEFAULT '2025-2026',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, name, academic_year)
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_grade ON classes(grade_level);

-- === STUDENTS ===
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_id INTEGER NOT NULL DEFAULT 1,
  birth_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_students_class ON students(class_id);

-- === GAME SESSIONS ===
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,        -- e.g., "anaokulu_sayi_ormani"
  grade_level grade_level NOT NULL,
  game_category game_category NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  total_events INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  is_completed BOOLEAN DEFAULT false,
  metrics JSONB DEFAULT '{}'::jsonb -- SessionMetrics as JSON
);

CREATE INDEX idx_sessions_student ON game_sessions(student_id);
CREATE INDEX idx_sessions_game ON game_sessions(game_id);
CREATE INDEX idx_sessions_date ON game_sessions(started_at);
CREATE INDEX idx_sessions_grade ON game_sessions(grade_level);

-- === GAME EVENTS (Stealth Assessment — every interaction) ===
CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  response_time_ms INTEGER,     -- NULL if not a response event
  is_correct BOOLEAN,           -- NULL if not applicable
  difficulty_level JSONB DEFAULT '{}'::jsonb,  -- {axis_id: value}
  metadata JSONB DEFAULT '{}'::jsonb           -- flexible data
);

CREATE INDEX idx_events_session ON game_events(session_id);
CREATE INDEX idx_events_student ON game_events(student_id);
CREATE INDEX idx_events_type ON game_events(event_type);
CREATE INDEX idx_events_timestamp ON game_events(timestamp);

-- Partition hint: for production, partition by month
-- CREATE TABLE game_events_2026_01 PARTITION OF game_events FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- === BKT PARAMETERS (per student per skill) ===
CREATE TABLE bkt_params (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,        -- e.g., "addition_3_2", "subitizing_4", "cpt_red_target"
  p_learned FLOAT DEFAULT 0.1,   -- P(L)
  p_transit FLOAT DEFAULT 0.1,   -- P(T) 
  p_guess FLOAT DEFAULT 0.25,    -- P(G)
  p_slip FLOAT DEFAULT 0.1,      -- P(S)
  trial_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, skill_id)
);

CREATE INDEX idx_bkt_student ON bkt_params(student_id);
CREATE INDEX idx_bkt_skill ON bkt_params(skill_id);

-- === COGNITIVE METRICS (computed, stored periodically) ===
CREATE TABLE cognitive_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ DEFAULT now(),
  
  -- 7-Component Attention Profile (0-100 each)
  attention_arousal FLOAT,
  attention_phasic FLOAT,
  attention_sustained FLOAT,
  attention_selective FLOAT,
  attention_focused FLOAT,
  attention_divided FLOAT,
  attention_shifting FLOAT,
  
  -- Detailed Attention Metrics
  hit_rate FLOAT,
  miss_rate FLOAT,
  false_alarm_rate FLOAT,
  d_prime FLOAT,
  response_bias FLOAT,
  mean_rt FLOAT,
  rt_std FLOAT,
  cv FLOAT,
  vigilance_slope FLOAT,
  post_error_slowing FLOAT,
  iiv FLOAT,
  
  -- Math Profile
  number_sense_subitizing FLOAT,
  number_sense_conceptual FLOAT,
  number_sense_weber FLOAT,
  number_line_pae FLOAT,
  number_representation number_representation,
  arithmetic_addition_fluency FLOAT,
  arithmetic_subtraction_fluency FLOAT,
  arithmetic_multiplication_fluency FLOAT,
  arithmetic_division_fluency FLOAT,
  dominant_strategy math_strategy,
  automatized_facts_percent FLOAT,
  conceptual_understanding FLOAT,
  strategic_competence FLOAT,
  
  -- Engagement
  engagement_score FLOAT,
  total_session_minutes FLOAT
);

CREATE INDEX idx_metrics_student ON cognitive_metrics(student_id);
CREATE INDEX idx_metrics_date ON cognitive_metrics(measured_at);

-- === MISCONCEPTION LOG ===
CREATE TABLE misconceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  grade_level grade_level NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  severity misconception_severity DEFAULT 'mild',
  recommended_intervention TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_misconceptions_student ON misconceptions(student_id);
CREATE INDEX idx_misconceptions_active ON misconceptions(is_active);

-- === SPACED REPETITION ===
CREATE TABLE spaced_repetition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review DATE DEFAULT CURRENT_DATE,
  repetitions INTEGER DEFAULT 0,
  last_quality INTEGER DEFAULT 0,  -- 0-5
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, skill_id)
);

CREATE INDEX idx_sr_student ON spaced_repetition(student_id);
CREATE INDEX idx_sr_next ON spaced_repetition(next_review);

-- === DOSAGE TRACKING ===
CREATE TABLE dosage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  sustained_attention_min FLOAT DEFAULT 0,
  selective_attention_min FLOAT DEFAULT 0,
  working_memory_min FLOAT DEFAULT 0,
  cognitive_flexibility_min FLOAT DEFAULT 0,
  inhibition_min FLOAT DEFAULT 0,
  math_practice_min FLOAT DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  target_met BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, week_start)
);

CREATE INDEX idx_dosage_student ON dosage_records(student_id);
CREATE INDEX idx_dosage_week ON dosage_records(week_start);

-- === REPORTS ===
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  report_type report_type NOT NULL,
  audience report_audience NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  attention_profile JSONB DEFAULT '{}'::jsonb,
  math_profile JSONB DEFAULT '{}'::jsonb,
  misconceptions JSONB DEFAULT '[]'::jsonb,
  ai_analysis TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  is_sent BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reports_student ON reports(student_id);
CREATE INDEX idx_reports_class ON reports(class_id);
CREATE INDEX idx_reports_type ON reports(report_type);

-- === ALERTS (Early Detection) ===
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  severity alert_severity DEFAULT 'medium',
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '{}'::jsonb,
  recommended_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_alerts_student ON alerts(student_id);
CREATE INDEX idx_alerts_teacher ON alerts(teacher_id);
CREATE INDEX idx_alerts_active ON alerts(is_active);

-- === TEACHER CUSTOM TASKS ===
CREATE TABLE custom_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  game_id TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  due_date DATE,
  is_active BOOLEAN DEFAULT true
);

-- === STUDENT BADGES ===
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_data JSONB DEFAULT '{}'::jsonb,
  message TEXT, -- personal message from teacher
  awarded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_badges_student ON badges(student_id);

-- ============================================================
-- VIEWS (for dashboard queries)
-- ============================================================

-- Student overview with latest metrics
CREATE VIEW student_overview AS
SELECT 
  s.id, s.first_name, s.last_name, s.avatar_id, s.class_id,
  c.name as class_name, c.grade_level,
  cm.attention_sustained, cm.attention_selective,
  cm.arithmetic_addition_fluency, cm.conceptual_understanding,
  cm.engagement_score, cm.measured_at as last_measured,
  (SELECT COUNT(*) FROM game_sessions gs WHERE gs.student_id = s.id AND gs.is_completed = true) as total_sessions,
  (SELECT SUM(duration_seconds)/60.0 FROM game_sessions gs WHERE gs.student_id = s.id) as total_minutes
FROM students s
JOIN classes c ON s.class_id = c.id
LEFT JOIN LATERAL (
  SELECT * FROM cognitive_metrics WHERE student_id = s.id ORDER BY measured_at DESC LIMIT 1
) cm ON true
WHERE s.is_active = true;

-- Class summary
CREATE VIEW class_summary AS
SELECT
  c.id as class_id, c.name as class_name, c.grade_level, c.teacher_id,
  COUNT(s.id) as student_count,
  AVG(cm.attention_sustained) as avg_attention,
  AVG(cm.arithmetic_addition_fluency) as avg_math_fluency,
  AVG(cm.engagement_score) as avg_engagement
FROM classes c
LEFT JOIN students s ON s.class_id = c.id AND s.is_active = true
LEFT JOIN LATERAL (
  SELECT * FROM cognitive_metrics WHERE student_id = s.id ORDER BY measured_at DESC LIMIT 1
) cm ON true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.grade_level, c.teacher_id;

-- Active alerts for teacher
CREATE VIEW teacher_alerts AS
SELECT 
  a.*, s.first_name, s.last_name, s.avatar_id, c.name as class_name
FROM alerts a
JOIN students s ON a.student_id = s.id
JOIN classes c ON s.class_id = c.id
WHERE a.is_active = true
ORDER BY a.created_at DESC;

-- ============================================================
-- RLS (Row Level Security) Policies
-- ============================================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bkt_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE misconceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be configured based on auth setup
-- For now, service_role key bypasses RLS

