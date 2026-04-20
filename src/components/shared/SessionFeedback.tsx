/**
 * Session Feedback — Oyun sonunda çocuk geri bildirim toplama
 *
 * Tasarım:
 *  • Okuma gerektirmeyen görsel yüz skalası (5 yaş+ anlar)
 *  • 2 soruda biter (kid-friendly)
 *  • localStorage'a hep kaydeder, Supabase varsa oraya da gönderir
 *  • Skip edilebilir (zorla doldurtma, çocuk sıkılmasın)
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export interface SessionFeedback {
  gameId: string
  studentId?: string
  enjoyment: 1 | 2 | 3 | 4 | 5  // yüz skalası: 1=çok üzgün, 5=çok mutlu
  difficulty: 'easy' | 'right' | 'hard'
  wouldPlayAgain: boolean
  createdAt: string
  // Context
  durationSec?: number
  accuracy?: number
  score?: number
}

const FACES = [
  { value: 1 as const, emoji: '😢', label: 'Hiç sevmedim', color: '#DC2626' },
  { value: 2 as const, emoji: '😕', label: 'Pek değil',    color: '#F59E0B' },
  { value: 3 as const, emoji: '😐', label: 'Fena değil',   color: '#A1A1AA' },
  { value: 4 as const, emoji: '🙂', label: 'Güzeldi',      color: '#3B82F6' },
  { value: 5 as const, emoji: '😄', label: 'Çok sevdim',   color: '#10B981' },
]

async function saveFeedback(fb: SessionFeedback): Promise<void> {
  // Her zaman localStorage'a kaydet (güvence)
  try {
    const key = 'dusunkup_feedback'
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as SessionFeedback[]
    existing.push(fb)
    // Son 100 kaydı tut
    if (existing.length > 100) existing.splice(0, existing.length - 100)
    localStorage.setItem(key, JSON.stringify(existing))
  } catch { /* storage full / disabled */ }

  // Supabase varsa oraya da gönder (fire-and-forget)
  try {
    if (supabase && import.meta.env.VITE_SUPABASE_URL) {
      await supabase.from('session_feedback').insert({
        game_id: fb.gameId,
        student_id: fb.studentId,
        enjoyment: fb.enjoyment,
        difficulty: fb.difficulty,
        would_play_again: fb.wouldPlayAgain,
        duration_sec: fb.durationSec,
        accuracy: fb.accuracy,
        score: fb.score,
        created_at: fb.createdAt,
      })
    }
  } catch { /* Supabase down / tablo yoksa localStorage'da kalır */ }
}

export interface SessionFeedbackProps {
  gameId: string
  studentId?: string
  durationSec?: number
  accuracy?: number
  score?: number
  onDone: () => void
}

export default function SessionFeedbackWidget({ gameId, studentId, durationSec, accuracy, score, onDone }: SessionFeedbackProps) {
  const [step, setStep] = useState<'enjoyment' | 'difficulty' | 'done'>('enjoyment')
  const [enjoyment, setEnjoyment] = useState<1 | 2 | 3 | 4 | 5 | null>(null)

  const handleEnjoyment = (value: 1 | 2 | 3 | 4 | 5) => {
    setEnjoyment(value)
    setTimeout(() => setStep('difficulty'), 650)
  }

  const handleDifficulty = async (difficulty: 'easy' | 'right' | 'hard') => {
    if (!enjoyment) return
    // wouldPlayAgain: enjoyment >= 4 ise büyük ihtimalle evet; yoksa false varsay
    const wouldPlayAgain = enjoyment >= 4

    const fb: SessionFeedback = {
      gameId, studentId, enjoyment, difficulty, wouldPlayAgain,
      createdAt: new Date().toISOString(),
      durationSec, accuracy, score,
    }
    saveFeedback(fb)
    setStep('done')
    setTimeout(onDone, 1400)
  }

  return (
    <motion.div className="absolute inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div className="relative rounded-3xl p-7 text-center max-w-sm w-[90%] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(20,25,50,0.95), rgba(10,15,30,0.95))',
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.1)',
        }}
        initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}>

        <AnimatePresence mode="wait">
          {step === 'enjoyment' && (
            <motion.div key="e" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-xl font-black text-white mb-1">Bu oyun nasıldı?</p>
              <p className="text-xs text-white/50 mb-5">Bir yüz seç 👇</p>
              <div className="flex justify-center gap-2.5">
                {FACES.map(f => (
                  <motion.button key={f.value}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-2xl cursor-pointer"
                    style={{
                      background: enjoyment === f.value ? `${f.color}25` : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${enjoyment === f.value ? f.color + '70' : 'rgba(255,255,255,0.06)'}`,
                    }}
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleEnjoyment(f.value)}>
                    <span className="text-4xl">{f.emoji}</span>
                    <span className="text-[9px] font-bold" style={{ color: f.color }}>{f.label}</span>
                  </motion.button>
                ))}
              </div>
              <button onClick={onDone} className="mt-5 text-[11px] text-white/25 hover:text-white/40 transition">
                Şimdi geçmek istiyorum
              </button>
            </motion.div>
          )}

          {step === 'difficulty' && (
            <motion.div key="d" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-xl font-black text-white mb-1">Bu oyun senin için...</p>
              <p className="text-xs text-white/50 mb-5">Birini seç 👇</p>
              <div className="flex flex-col gap-2.5">
                {([
                  { v: 'easy' as const,  label: 'Çok kolaydı',       emoji: '🪶', color: '#10B981' },
                  { v: 'right' as const, label: 'Tam yerindeydi',    emoji: '🎯', color: '#3B82F6' },
                  { v: 'hard' as const,  label: 'Biraz zor geldi',   emoji: '🧗', color: '#F97316' },
                ]).map(o => (
                  <motion.button key={o.v}
                    className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl"
                    style={{
                      background: `${o.color}15`,
                      border: `1.5px solid ${o.color}40`,
                      color: o.color,
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleDifficulty(o.v)}>
                    <span className="text-2xl">{o.emoji}</span>
                    <span className="text-sm font-bold">{o.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="t" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <motion.div className="text-6xl mb-2"
                animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}>
                💖
              </motion.div>
              <p className="text-lg font-black text-white">Teşekkürler!</p>
              <p className="text-xs text-white/60 mt-1">Düşüncen bizim için çok değerli</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
