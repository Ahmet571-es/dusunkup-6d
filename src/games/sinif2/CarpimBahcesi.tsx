/**
 * Çarpım Bahçesi — 2. Sınıf Çarpma
 * 4 Model: Tekrarlı Toplama → Dizi/Matris → Sözel Problem → Hız Antrenmanı
 * BKT per fact (2×3, 4×5, vb.), strateji tespiti, CPA takibi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type MultMode = 'repeated_add' | 'array' | 'word_problem' | 'speed'

interface Problem { a: number; b: number; answer: number; mode: MultMode; text?: string }

function ArrayGrid({ rows, cols, cellSize = 20 }: { rows: number; cols: number; cellSize?: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-0.5">
          {Array.from({ length: cols }, (_, c) => (
            <motion.div key={c} className="rounded-sm"
              style={{ width: cellSize, height: cellSize, background: `hsla(${(r * cols + c) * 17},70%,55%,0.35)`, border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: (r * cols + c) * 0.02 }} />
          ))}
        </div>
      ))}
      <span className="text-[10px] text-white/30 mt-1">{rows} satır × {cols} sütun = ?</span>
    </div>
  )
}

const WORD_PROBLEMS = [
  (a: number, b: number) => `${a} tabakta ${b}'şer çilek var. Toplam kaç çilek?`,
  (a: number, b: number) => `Her gün ${b} sayfa okuyan ${a} gün sonra kaç sayfa okumuş olur?`,
  (a: number, b: number) => `${a} sırada ${b}'şer öğrenci oturuyor. Kaç öğrenci var?`,
  (a: number, b: number) => `${a} kutuda ${b}'şer top var. Toplam kaç top?`,
  (a: number, b: number) => `Bahçeye ${a} sıra fidan dikildi. Her sırada ${b} fidan. Kaç fidan?`,
]

function generate(mode: MultMode, diff: Record<string, number>): Problem {
  const maxF = Math.min(9, 2 + (diff.factor_range || 0) * 2)
  const a = 2 + Math.floor(Math.random() * (maxF - 1))
  const b = 2 + Math.floor(Math.random() * (maxF - 1))
  const fn = WORD_PROBLEMS[Math.floor(Math.random() * WORD_PROBLEMS.length)]
  return { a, b, answer: a * b, mode, text: mode === 'word_problem' ? fn(a, b) : undefined }
}

export default function CarpimBahcesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState<Problem | null>(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [streak, setStreak] = useState(0)
  const [timer, setTimer] = useState(0)
  const stimRef = useRef(Date.now())
  const timerRef = useRef<number | null>(null)
  const modes: MultMode[] = ['repeated_add', 'array', 'word_problem', 'speed']

  useEffect(() => {
    const m = modes[Math.floor(round / 4) % modes.length]
    setProblem(generate(m, state.difficultyAxes))
    setInput(''); setFeedback(null); setShowHint(false)
    stimRef.current = Date.now()
    if (m === 'speed') {
      setTimer(15)
      timerRef.current = window.setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0 }; return t - 1 }), 1000)
    } else { setTimer(0); if (timerRef.current) clearInterval(timerRef.current) }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [round])

  const detectStrategy = (rt: number, a: number, b: number): string => {
    if (rt < 1800) return 'retrieval'
    if (rt < 2500 + Math.min(a, b) * 300) return 'derived_fact'
    return 'repeated_addition'
  }

  const handleSubmit = () => {
    if (!problem || feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const rt = Date.now() - stimRef.current
    const correct = val === problem.answer
    const strategy = detectStrategy(rt, problem.a, problem.b)
    if (correct) setStreak(s => s + 1); else setStreak(0)

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif2_carpma_${problem.a}x${problem.b}`, mode: problem.mode, a: problem.a, b: problem.b, strategy, streak, hintUsed: showHint },
    })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  if (!problem) return null
  const modeLabels: Record<MultMode, string> = { repeated_add: '🔄 Tekrarlı Toplama', array: '🔲 Dizi/Matris', word_problem: '📖 Sözel Problem', speed: '⚡ Hız Turu' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(234,179,8,0.1)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.15)' }}>{modeLabels[problem.mode]}</span>
        <div className="flex items-center gap-2">
          {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak} seri!</span>}
          {problem.mode === 'speed' && <span className={`text-xs font-bold px-2 py-0.5 rounded ${timer < 5 ? 'text-red-300 bg-red-500/10' : 'text-white/40'}`}>⏱ {timer}s</span>}
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Tekrarlı toplama: grup görselleştirme */}
        {problem.mode === 'repeated_add' && (
          <div className="mb-4">
            <div className="flex justify-center gap-2 flex-wrap mb-2">
              {Array.from({ length: problem.a }, (_, g) => (
                <motion.div key={g} className="flex gap-0.5 px-2 py-1.5 rounded-lg"
                  style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.12)' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: g * 0.08 }}>
                  {Array.from({ length: problem.b }, (_, i) => <span key={i} className="text-base">🌻</span>)}
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-center text-white/40">{problem.a} grup × {problem.b}'er = {Array.from({ length: problem.a }, () => problem.b).join(' + ')}</p>
          </div>
        )}

        {/* Dizi/Matris görselleştirme */}
        {problem.mode === 'array' && (
          <div className="flex justify-center mb-4">
            <ArrayGrid rows={problem.a} cols={problem.b} cellSize={Math.min(22, 160 / Math.max(problem.a, problem.b))} />
          </div>
        )}

        {/* Sözel problem */}
        {problem.text && <p className="text-sm text-white/70 text-center mb-4 leading-relaxed">{problem.text}</p>}

        {/* Hız turu: sadece denklem */}
        {problem.mode === 'speed' && timer === 0 && !feedback && (
          <p className="text-center text-red-300 text-sm mb-2">⏰ Süre doldu!</p>
        )}

        {/* Denklem */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-black text-white">{problem.a}</span>
          <span className="text-3xl text-white/40">×</span>
          <span className="text-4xl font-black text-white">{problem.b}</span>
          <span className="text-3xl text-white/40">=</span>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black"
            style={{ border: `2.5px ${input ? 'solid' : 'dashed'} ${feedback === 'correct' ? '#34D399' : feedback === 'wrong' ? '#F97316' : 'rgba(251,191,36,0.4)'}`, color: '#FDE68A', background: input ? 'rgba(251,191,36,0.06)' : 'transparent' }}>
            {input || '?'}
          </div>
        </div>

        {/* İpucu */}
        {!showHint && problem.mode !== 'speed' && !feedback && (
          <button onClick={() => setShowHint(true)} className="block mx-auto mt-2 text-[10px] text-white/20 hover:text-white/40 transition">💡 İpucu</button>
        )}
        {showHint && (
          <motion.p className="text-xs text-yellow-300/50 text-center mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            💡 {problem.b} + {problem.b} = {problem.b * 2}, bunu {Math.floor(problem.a / 2)} kez yap{problem.a % 2 === 1 ? `, sonra +${problem.b}` : ''}
          </motion.p>
        )}
      </div>

      {/* Keypad */}
      <div className="flex gap-1.5 justify-center flex-wrap" style={{ maxWidth: 340 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
          <motion.button key={n} disabled={!!feedback} className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => !feedback && input.length < 2 && setInput(v => v + n)}>{n}</motion.button>
        ))}
        <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }} onClick={() => setInput('')}>Sil</motion.button>
        <motion.button disabled={!!feedback || !input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30" style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
