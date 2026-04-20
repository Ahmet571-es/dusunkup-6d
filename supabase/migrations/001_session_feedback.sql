-- ============================================================================
-- Migration: session_feedback tablosu
-- ============================================================================
-- Amaç: Çocukların oyun sonunda bıraktığı geri bildirimleri kaydetmek.
-- Uygulama: Supabase yoksa localStorage'da çalışır; bu tablo oluşturulursa
--          bulut sync ve öğretmen paneli analitiği devreye girer.
--
-- Çalıştırma: Supabase Dashboard → SQL Editor → bu dosyayı yapıştır → Run.
-- Veya CLI ile:  supabase db push
-- ============================================================================

-- Tablo
CREATE TABLE IF NOT EXISTS public.session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  student_id TEXT,
  enjoyment SMALLINT NOT NULL CHECK (enjoyment BETWEEN 1 AND 5),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'right', 'hard')),
  would_play_again BOOLEAN NOT NULL,
  duration_sec INTEGER,
  accuracy NUMERIC(4,3),
  score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.session_feedback IS 'Cocuk oyun sonu geri bildirimleri';
COMMENT ON COLUMN public.session_feedback.enjoyment IS '1=cok uzuldu, 5=cok sevdi (5 yuzlu skala)';
COMMENT ON COLUMN public.session_feedback.difficulty IS 'easy=kolay, right=yerinde, hard=zor';

-- İndeksler (okuma performansı için)
CREATE INDEX IF NOT EXISTS idx_feedback_game    ON public.session_feedback(game_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.session_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON public.session_feedback(student_id);

-- Row Level Security
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;

-- Politika 1: Anonim kullanıcı (çocuk, giriş yapmamış) bildirim bırakabilir
DROP POLICY IF EXISTS "Anonymous insert allowed" ON public.session_feedback;
CREATE POLICY "Anonymous insert allowed"
  ON public.session_feedback
  FOR INSERT
  WITH CHECK (true);

-- Politika 2: Sadece authenticated kullanıcı (öğretmen) veya service_role okuyabilir
DROP POLICY IF EXISTS "Authenticated read only" ON public.session_feedback;
CREATE POLICY "Authenticated read only"
  ON public.session_feedback
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  );

-- Sadece service_role silebilir/güncelleyebilir (veri bütünlüğü)
DROP POLICY IF EXISTS "Service role only update" ON public.session_feedback;
CREATE POLICY "Service role only update"
  ON public.session_feedback
  FOR UPDATE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role only delete" ON public.session_feedback;
CREATE POLICY "Service role only delete"
  ON public.session_feedback
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================================
-- Test: Tablonun oluştuğunu doğrula
-- ============================================================================
-- SELECT * FROM public.session_feedback LIMIT 1;
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'session_feedback';
