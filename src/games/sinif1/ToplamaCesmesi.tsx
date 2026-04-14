/**
 * Toplama Çeşmesi — 1. Sınıf Matematik
 * Bilimsel Temel: Addition Strategy Progression (Siegler), Ten Frame, Number Bonds
 * Strateji takibi: Counting All → Counting On → Making Tens → Retrieval
 * RT analizi ile strateji tespiti
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type AdditionMode = 'ten_frame' | 'number_bonds' | 'speed_drill' | 'word_problem'

interface Problem {
  a: number; b: number; answer: number; mode: AdditionMode
  wordProblem?: string
}

// Ten Frame visualization
function TenFrame({ count, color = '#3B82F6' }: { count: number; color?: string }) {
  const id = color.replace('#','')
  return (
    <div className="grid grid-cols-5 gap-1" style={{ width: 130 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div key={i} className="w-5 h-5 flex items-center justify-center"
          initial={i < count ? { scale: 0 } : {}}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.03 }}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <defs>
              <radialGradient id={`tf_${id}_${i}`} cx="40%" cy="35%">
                <stop offset="0%" stopColor={i < count ? 'white' : 'transparent'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={i < count ? color : 'transparent'} stopOpacity={i < count ? 0.85 : 0.06} />
              </radialGradient>
              {i < count && <filter id={`tfg_${id}_${i}`}><feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} floodOpacity="0.4" /></filter>}
            </defs>
            <rect x="1" y="1" width="18" height="18" rx="4" fill={`url(#tf_${id}_${i})`} stroke={i < count ? color : 'rgba(255,255,255,0.1)'} strokeWidth="1.2" strokeOpacity={i < count ? 0.6 : 0.5} filter={i < count ? `url(#tfg_${id}_${i})` : undefined} />
            {i < count && <ellipse cx="8" cy="7" rx="3.5" ry="2.5" fill="white" opacity="0.12" />}
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

function generateProblem(mode: AdditionMode, difficulty: Record<string, number>): Problem {
  const range = Math.min(18, 5 + (difficulty.addend_range || 0) * 2)
  const maxAddend = Math.min(range, 9)

  const a = 1 + Math.floor(Math.random() * maxAddend)
  const b = 1 + Math.floor(Math.random() * Math.min(maxAddend, range - a))

  const wordProblems = [
    `Bahçede ${a} kırmızı gül ve ${b} sarı gül var. Toplam kaç gül var?`,
    `${a} kuş ağaçta, ${b} kuş daha geldi. Şimdi kaç kuş var?`,
    `Sepette ${a} elma var. Annen ${b} elma daha koydu. Toplam kaç elma?`,
    `${a} çocuk parkta oynuyor, ${b} çocuk daha geldi. Kaç çocuk oldu?`,
  ]

  return {
    a, b, answer: a + b, mode,
    wordProblem: mode === 'word_problem' ? wordProblems[Math.floor(Math.random() * wordProblems.length)] : undefined,
  }
}

export default function ToplamaCesmesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [mode, setMode] = useState<AdditionMode>('ten_frame')
  const [problem, setProblem] = useState<Problem | null>(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const stimRef = useRef(Date.now())

  const modes: AdditionMode[] = ['ten_frame', 'number_bonds', 'speed_drill', 'word_problem']

  useEffect(() => {
    const modeIdx = Math.floor(round / 4) % modes.length
    const m = modes[modeIdx]
    setMode(m)
    setProblem(generateProblem(m, state.difficultyAxes))
    setInput('')
    setFeedback(null)
    setShowHint(false)
    stimRef.current = Date.now()
  }, [round])

  const detectStrategy = (rt: number, a: number, b: number): string => {
    const total = a + b; const smaller = Math.min(a, b)
    if (rt < 1500) return 'retrieval'
    if (rt < 2000 + smaller * 350) return 'counting_on_larger'
    if (rt < 2000 + b * 350) return 'counting_on_first'
    return 'counting_all'
  }

  const handleSubmit = () => {
    if (!problem || feedback) return
    const val = parseInt(input)
    if (isNaN(val)) return
    const rt = Date.now() - stimRef.current
    const correct = val === problem.answer
    const strategy = detectStrategy(rt, problem.a, problem.b)

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: {
        skillId: `sinif1_toplama_${problem.a}_${problem.b}`,
        mode, a: problem.a, b: problem.b, answer: val, correctAnswer: problem.answer,
        strategy, hintUsed: showHint,
      },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 1000 : 800)
  }

  if (!problem) return null

  const modeLabels = { ten_frame: '🔟 On Çerçevesi', number_bonds: '🔗 Sayı Bağları', speed_drill: '⚡ Hız Antrenmanı', word_problem: '📖 Problem' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.15)' }}>
        {modeLabels[mode]}
      </span>

      <div className="w-full max-w-lg rounded-2xl p-5 text-center"
        style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Word problem text */}
        {mode === 'word_problem' && problem.wordProblem && (
          <p className="text-sm text-white/70 mb-4 leading-relaxed">{problem.wordProblem}</p>
        )}

        {/* Ten Frame visualization */}
        {mode === 'ten_frame' && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <TenFrame count={problem.a} color="#3B82F6" />
              <span className="text-xs text-blue-300 mt-1 block">{problem.a}</span>
            </div>
            <span className="text-2xl text-white/30">+</span>
            <div className="text-center">
              <TenFrame count={problem.b} color="#22C55E" />
              <span className="text-xs text-green-300 mt-1 block">{problem.b}</span>
            </div>
          </div>
        )}

        {/* Number bonds visualization */}
        {mode === 'number_bonds' && (
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black"
              style={{ border: '2px dashed rgba(251,191,36,0.4)', color: '#FDE68A', background: 'rgba(251,191,36,0.05)' }}>
              {feedback === 'correct' ? problem.answer : '?'}
            </div>
            <div className="flex gap-8">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-blue-500/20 text-blue-300 border border-blue-500/20">{problem.a}</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-green-500/20 text-green-300 border border-green-500/20">{problem.b}</div>
            </div>
          </div>
        )}

        {/* Math equation */}
        <div className="flex items-center justify-center gap-3 my-3">
          <span className="text-4xl font-black text-white">{problem.a}</span>
          <span className="text-3xl text-white/40">+</span>
          <span className="text-4xl font-black text-white">{problem.b}</span>
          <span className="text-3xl text-white/40">=</span>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black"
            style={{
              border: `2.5px ${input ? 'solid' : 'dashed'} ${feedback === 'correct' ? '#34D399' : feedback === 'wrong' ? '#F97316' : 'rgba(251,191,36,0.4)'}`,
              color: feedback === 'correct' ? '#6EE7B7' : feedback === 'wrong' ? '#FDBA74' : '#FDE68A',
              background: input ? 'rgba(251,191,36,0.06)' : 'transparent',
            }}>
            {input || '?'}
          </div>
        </div>

        {/* Hint button */}
        {!showHint && mode !== 'speed_drill' && (
          <button onClick={() => setShowHint(true)} className="text-[10px] text-white/20 hover:text-white/40 transition mt-1">
            💡 İpucu göster
          </button>
        )}
        {showHint && (
          <motion.p className="text-xs text-yellow-300/50 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            💡 {problem.a > problem.b ? `${problem.a}'dan başla, ${problem.b} tane say: ${Array.from({length:problem.b},(_,i)=>problem.a+i+1).join(', ')}` : `${problem.b}'den başla, ${problem.a} tane say: ${Array.from({length:problem.a},(_,i)=>problem.b+i+1).join(', ')}`}
          </motion.p>
        )}
      </div>

      {/* Keypad */}
      <div className="flex gap-1.5 justify-center flex-wrap" style={{ maxWidth: 340 }}>
        {[1,2,3,4,5,6,7,8,9,0].map(n => (
          <motion.button key={n} disabled={!!feedback}
            className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => !feedback && input.length < 2 && setInput(v => v + n)}
          >{n}</motion.button>
        ))}
        <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}
          whileTap={{ scale: 0.92 }} onClick={() => setInput('')}>Sil</motion.button>
        <motion.button disabled={!!feedback || !input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
          whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-center">{feedback === 'correct' ? <StarSVG size={56} filled glowing /> : <span className="text-5xl">💫</span>}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
