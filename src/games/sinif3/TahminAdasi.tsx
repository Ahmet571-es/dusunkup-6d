/**
 * Tahmin Adası — Tahmin + Doğrulama + Hipotez-Test Döngüsü
 * 4 Mod: Miktar Tahmini → Hesap Tahmini → Ölçü Tahmini → Hipotez Test
 * PAE ölçümü, kalibrasyon analizi, güven aralığı
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type EstMode = 'dots' | 'calculation' | 'measurement' | 'hypothesis'

interface DotField { dots: { x: number; y: number }[]; actual: number }
interface CalcProblem { expression: string; actual: number }

function generateDots(range: number): DotField {
  const count = 5 + Math.floor(Math.random() * Math.min(30, range))
  const dots = Array.from({ length: count }, () => ({ x: 4 + Math.random() * 92, y: 4 + Math.random() * 92 }))
  return { dots, actual: count }
}

function generateCalc(): CalcProblem {
  const problems = [
    { expression: '49 + 52', actual: 101 }, { expression: '98 + 47', actual: 145 },
    { expression: '73 - 29', actual: 44 }, { expression: '156 + 88', actual: 244 },
    { expression: '201 - 97', actual: 104 }, { expression: '67 + 33 + 15', actual: 115 },
    { expression: '125 - 48', actual: 77 }, { expression: '89 + 76', actual: 165 },
  ]
  return problems[Math.floor(Math.random() * problems.length)]
}

export default function TahminAdasi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [mode, setMode] = useState<EstMode>('dots')
  const [dotField, setDotField] = useState<DotField>({ dots: [], actual: 0 })
  const [calcProblem, setCalcProblem] = useState<CalcProblem>({ expression: '', actual: 0 })
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'close' | 'wrong' | null>(null)
  const [showActual, setShowActual] = useState(false)
  const [round, setRound] = useState(0)
  const [paeHistory, setPaeHistory] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: EstMode[] = ['dots', 'dots', 'calculation', 'dots']
    const m = modes[round % modes.length]; setMode(m)
    if (m === 'dots') setDotField(generateDots(10 + (state.difficultyAxes.range || 0) * 5))
    else if (m === 'calculation') setCalcProblem(generateCalc())
    setInput(''); setFeedback(null); setShowActual(false); stimRef.current = Date.now()
  }, [round])

  const getActual = () => mode === 'dots' ? dotField.actual : calcProblem.actual

  const handleSubmit = () => {
    if (feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const actual = getActual()
    const error = Math.abs(val - actual)
    const pae = actual > 0 ? (error / actual) * 100 : 0
    const correct = pae < 10; const close = pae < 25

    setPaeHistory(prev => [...prev, pae])
    if (correct || close) setStreak(s => s + 1); else setStreak(0)

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct || close,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif3_tahmin_${mode}`, mode, actual, estimate: val, pae: Math.round(pae * 10) / 10, avgPae: paeHistory.length > 0 ? Math.round(paeHistory.reduce((a, b) => a + b, 0) / paeHistory.length) : Math.round(pae) },
    })

    setFeedback(correct ? 'correct' : close ? 'close' : 'wrong')
    setShowActual(true)
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 1500)
  }

  const avgPae = paeHistory.length > 0 ? Math.round(paeHistory.reduce((a, b) => a + b, 0) / paeHistory.length) : null
  const actual = getActual()

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-md justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)', color: '#D8B4FE', border: '1px solid rgba(168,85,247,0.15)' }}>
          🔮 {mode === 'dots' ? 'Kaç nokta var?' : 'Sonuç yaklaşık kaç?'}
        </span>
        <div className="flex items-center gap-2">
          {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
          {avgPae !== null && <span className="text-[10px] text-white/20">Ort. hata: %{avgPae}</span>}
        </div>
      </div>

      {/* Stimulus area */}
      {mode === 'dots' ? (
        <div className="w-72 h-52 rounded-2xl relative overflow-hidden"
          style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(168,85,247,0.1)' }}>
          {dotField.dots.map((d, i) => (
            <motion.div key={i} className="absolute w-2.5 h-2.5 rounded-full"
              style={{ left: `${d.x}%`, top: `${d.y}%`, background: 'radial-gradient(circle, #FDE68A, #EAB308)', boxShadow: '0 0 8px rgba(234,179,8,0.6), 0 0 2px rgba(234,179,8,0.8)' }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.01 }} />
          ))}
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse, transparent 50%, rgba(0,0,0,0.3) 100%)' }} />
        </div>
      ) : (
        <div className="w-72 h-40 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(168,85,247,0.1)' }}>
          <motion.p className="text-3xl font-black text-white" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            {calcProblem.expression} ≈ ?
          </motion.p>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/40">Tahminin:</span>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={4} placeholder="?"
          className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none focus:border-yellow-400/40" />
        <motion.button disabled={!input || !!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
          whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Tahmin Et ✓</motion.button>
      </div>

      {/* Feedback */}
      {showActual && (
        <motion.div className="text-center" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 justify-center">
            <div className="text-center">
              <span className="text-xs text-white/30 block">Tahminin</span>
              <span className="text-2xl font-black text-yellow-300">{input}</span>
            </div>
            <span className="text-white/20">→</span>
            <div className="text-center">
              <span className="text-xs text-white/30 block">Gerçek</span>
              <span className="text-2xl font-black text-green-300">{actual}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-white/30 block">Hata</span>
              <span className={`text-lg font-bold ${feedback === 'correct' ? 'text-green-300' : feedback === 'close' ? 'text-yellow-300' : 'text-orange-300'}`}>
                %{actual > 0 ? Math.round(Math.abs(parseInt(input) - actual) / actual * 100) : 0}
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-2 justify-center text-sm font-bold mt-2 ${feedback === 'correct' ? 'text-green-300' : feedback === 'close' ? 'text-yellow-300' : 'text-orange-300'}`}>
            {feedback === 'correct' ? <><StarSVG size={28} filled glowing /><span>Mükemmel tahmin!</span></> : feedback === 'close' ? '👍 Yaklaştın!' : '💫 Biraz uzak kaldı'}
          </div>
        </motion.div>
      )}
    </div>
  )
}
