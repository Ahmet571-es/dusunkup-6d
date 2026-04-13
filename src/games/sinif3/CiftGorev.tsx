/**
 * Çift Görev İstasyonu — Bölünmüş Dikkat Paradigması
 * Görev A: Renk hedefi yakalama (sürekli dikkat)
 * Görev B: Aritmetik problem çözme (çalışma belleği)
 * Eş zamanlı performans, dual-task maliyet ölçümü
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const COLORS = [
  { name: 'Kırmızı', value: '#EF4444' }, { name: 'Mavi', value: '#3B82F6' },
  { name: 'Yeşil', value: '#22C55E' }, { name: 'Sarı', value: '#EAB308' },
]

interface FallingDot { id: number; x: number; y: number; color: typeof COLORS[0]; isTarget: boolean; speed: number; active: boolean }

export default function CiftGorev({ session, state }: { session: SessionManager; state: SessionState }) {
  const [targetColor, setTargetColor] = useState(COLORS[0])
  const [dots, setDots] = useState<FallingDot[]>([])
  const [mathA, setMathA] = useState(3); const [mathB, setMathB] = useState(2); const [mathOp, setMathOp] = useState<'+' | '-'>('+')
  const [mathInput, setMathInput] = useState('')
  const [colorHits, setColorHits] = useState(0); const [colorMisses, setColorMisses] = useState(0)
  const [mathCorrect, setMathCorrect] = useState(0); const [mathWrong, setMathWrong] = useState(0)
  const [mathFeedback, setMathFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [totalTime, setTotalTime] = useState(60)
  const [gameActive, setGameActive] = useState(true)
  const nextDotId = useRef(0)
  const spawnRef = useRef<number | null>(null)
  const moveRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const stimRef = useRef(Date.now())

  const mathAnswer = mathOp === '+' ? mathA + mathB : mathA - mathB

  // Generate new math problem
  const newMathProblem = useCallback(() => {
    const op = Math.random() > 0.5 ? '+' : '-' as const
    const a = op === '+' ? 2 + Math.floor(Math.random() * 15) : 5 + Math.floor(Math.random() * 15)
    const b = op === '+' ? 1 + Math.floor(Math.random() * 10) : 1 + Math.floor(Math.random() * Math.min(10, a - 1))
    setMathA(a); setMathB(b); setMathOp(op); setMathInput(''); setMathFeedback(null)
  }, [])

  // Initialize
  useEffect(() => {
    const tc = COLORS[Math.floor(Math.random() * COLORS.length)]
    setTargetColor(tc)
    newMathProblem()
    stimRef.current = Date.now()

    // Spawn dots
    spawnRef.current = window.setInterval(() => {
      const isTarget = Math.random() < 0.4
      const color = isTarget ? tc : COLORS.filter(c => c.name !== tc.name)[Math.floor(Math.random() * 3)]
      const dot: FallingDot = {
        id: nextDotId.current++, x: 5 + Math.random() * 85, y: -5,
        color, isTarget, speed: 0.4 + Math.random() * 0.3, active: true,
      }
      setDots(prev => [...prev.slice(-12), dot])
    }, 1200)

    // Move dots
    moveRef.current = window.setInterval(() => {
      setDots(prev => {
        const updated = prev.map(d => ({ ...d, y: d.y + d.speed }))
        updated.forEach(d => {
          if (d.y > 100 && d.active && d.isTarget) {
            setColorMisses(m => m + 1)
            d.active = false
          }
        })
        return updated.filter(d => d.y < 110)
      })
    }, 50)

    // Game timer
    timerRef.current = window.setInterval(() => {
      setTotalTime(t => {
        if (t <= 1) { setGameActive(false); return 0 }
        return t - 1
      })
    }, 1000)

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current)
      if (moveRef.current) clearInterval(moveRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleDotTap = (dot: FallingDot) => {
    if (!dot.active || !gameActive) return
    if (dot.isTarget) {
      setColorHits(h => h + 1)
      session.recordTrial({ timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: 500, isCorrect: true, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif3_cift_gorev_color', type: 'hit' } })
    } else {
      session.recordTrial({ timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: 500, isCorrect: false, isTarget: false, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif3_cift_gorev_color', type: 'false_alarm' } })
    }
    setDots(prev => prev.map(d => d.id === dot.id ? { ...d, active: false } : d))
  }

  const handleMathSubmit = () => {
    if (!gameActive || mathFeedback) return
    const val = parseInt(mathInput); if (isNaN(val)) return
    const correct = val === mathAnswer
    if (correct) setMathCorrect(c => c + 1); else setMathWrong(w => w + 1)

    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif3_cift_gorev_math', type: 'math', dualTask: true, colorHits, mathCorrect } })

    setMathFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { newMathProblem() }, correct ? 600 : 400)
  }

  // Game over screen
  if (!gameActive) {
    const totalDots = colorHits + colorMisses
    const colorAcc = totalDots > 0 ? Math.round((colorHits / totalDots) * 100) : 0
    const totalMath = mathCorrect + mathWrong
    const mathAcc = totalMath > 0 ? Math.round((mathCorrect / totalMath) * 100) : 0
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <span className="text-6xl">🏆</span>
        <p className="text-xl font-bold text-white">Süre Doldu!</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <span className="text-2xl font-black text-blue-300">{colorHits}</span>
            <span className="text-xs text-blue-300/60 block">Renk Yakalama</span>
            <span className="text-[10px] text-white/30">%{colorAcc} doğruluk</span>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <span className="text-2xl font-black text-green-300">{mathCorrect}</span>
            <span className="text-xs text-green-300/60 block">Matematik</span>
            <span className="text-[10px] text-white/30">%{mathAcc} doğruluk</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-start h-full p-3 gap-2">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ background: targetColor.value }} />
          <span className="text-xs font-bold text-white/60">Yakala!</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${totalTime < 10 ? 'text-red-300 bg-red-500/10' : 'text-white/40'}`}>⏱ {totalTime}s</span>
        <div className="flex gap-2 text-[10px]">
          <span className="text-blue-300">🎯{colorHits}</span>
          <span className="text-green-300">🧮{mathCorrect}</span>
        </div>
      </div>

      <div className="flex gap-2 w-full max-w-lg flex-1">
        {/* LEFT: Color catching */}
        <div className="flex-1 rounded-xl relative overflow-hidden" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 250 }}>
          <AnimatePresence>
            {dots.filter(d => d.active).map(d => (
              <motion.div key={d.id} className="absolute cursor-pointer"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}
                onClick={() => handleDotTap(d)}>
                <div className="w-8 h-8 rounded-full" style={{ background: d.color.value, boxShadow: `0 0 10px ${d.color.value}40` }} />
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: 'rgba(255,255,255,0.03)' }} />
        </div>

        {/* RIGHT: Math */}
        <div className="w-40 rounded-xl p-3 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-center">
            <span className="text-3xl font-black text-white">{mathA}</span>
            <span className="text-2xl text-white/40 mx-1">{mathOp}</span>
            <span className="text-3xl font-black text-white">{mathB}</span>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
            style={{ border: `2px ${mathInput ? 'solid' : 'dashed'} ${mathFeedback === 'correct' ? '#34D399' : mathFeedback === 'wrong' ? '#F97316' : 'rgba(251,191,36,0.4)'}`, color: '#FDE68A' }}>
            {mathInput || '?'}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} className="w-9 h-9 rounded-lg text-sm font-bold text-white/80"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                onClick={() => !mathFeedback && mathInput.length < 2 && setMathInput(v => v + n)}>{n}</button>
            ))}
            <button className="w-9 h-9 rounded-lg text-[10px] text-red-300" style={{ background: 'rgba(239,68,68,0.1)' }}
              onClick={() => setMathInput('')}>C</button>
            <button className="w-9 h-9 rounded-lg text-sm font-bold text-white/80" style={{ background: 'rgba(255,255,255,0.06)' }}
              onClick={() => !mathFeedback && mathInput.length < 2 && setMathInput(v => v + '0')}>0</button>
            <button className="w-9 h-9 rounded-lg text-[10px] text-green-300" style={{ background: 'rgba(52,211,153,0.1)' }}
              onClick={handleMathSubmit}>✓</button>
          </div>
        </div>
      </div>
    </div>
  )
}
