/**
 * Zaman Makinesi — Metabilişsel Stratejiler + Öz-Düzenleme
 * 3 Faz: Çöz → Strateji Değerlendir → Geri Sarma (hata analizi)
 * Strateji farkındalığı, öz-değerlendirme, yansıtıcı düşünme
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const PROBLEMS = [
  { problem: '48 + 37 = ?', answer: 85, strategies: [
    { name: '10\'a tamamla', steps: '48+2=50, 50+35=85', efficiency: 'hızlı' },
    { name: 'Basamakları topla', steps: '40+30=70, 8+7=15, 70+15=85', efficiency: 'güvenli' },
    { name: 'Yuvarlayıp düzelt', steps: '50+37=87, 87-2=85', efficiency: 'yaratıcı' },
  ]},
  { problem: '93 - 28 = ?', answer: 65, strategies: [
    { name: 'Geriye adımla', steps: '93-20=73, 73-8=65', efficiency: 'hızlı' },
    { name: 'Yuvarlayıp düzelt', steps: '93-30=63, 63+2=65', efficiency: 'yaratıcı' },
    { name: 'Ekleme stratejisi', steps: '28+?=93 → 28+2=30, 30+63=93, cevap=65', efficiency: 'ileri düzey' },
  ]},
  { problem: '6 × 7 = ?', answer: 42, strategies: [
    { name: '5×7 + 1×7', steps: '35+7=42', efficiency: 'türetme' },
    { name: '6×6 + 6', steps: '36+6=42', efficiency: 'yakın bilgi' },
    { name: 'Direkt hatırla', steps: '6×7=42 (ezber)', efficiency: 'en hızlı' },
  ]},
  { problem: '125 - 48 = ?', answer: 77, strategies: [
    { name: 'Basamaklarla', steps: '125-40=85, 85-8=77', efficiency: 'güvenli' },
    { name: 'Yuvarlayıp düzelt', steps: '125-50=75, 75+2=77', efficiency: 'hızlı' },
    { name: 'Ekleme', steps: '48+?=125 → 48+2=50, 50+75=125, cevap=77', efficiency: 'ileri düzey' },
  ]},
  { problem: '8 × 9 = ?', answer: 72, strategies: [
    { name: '8×10 - 8', steps: '80-8=72', efficiency: 'hızlı' },
    { name: '9×9 - 9', steps: '81-9=72', efficiency: 'yakın bilgi' },
    { name: 'Çift katlama', steps: '8×9 = 8×(8+1) = 64+8=72', efficiency: 'yaratıcı' },
  ]},
]

export default function ZamanMakinesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [prob, setProb] = useState(PROBLEMS[0])
  const [phase, setPhase] = useState<'solve' | 'evaluate' | 'rewind'>('solve')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [showAllStrategies, setShowAllStrategies] = useState(false)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    setProb(PROBLEMS[round % PROBLEMS.length])
    setPhase('solve'); setInput(''); setFeedback(null)
    setSelectedStrategy(null); setAttempts(0); setShowAllStrategies(false)
    stimRef.current = Date.now()
  }, [round])

  const handleSolve = () => {
    if (feedback) return; const val = parseInt(input); if (isNaN(val)) return
    const correct = val === prob.answer
    setAttempts(a => a + 1)
    const rt = Date.now() - stimRef.current

    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif5_zaman_solve', problem: prob.problem, attempt: attempts + 1, rt } })

    if (correct) {
      setFeedback('correct')
      setTimeout(() => { setFeedback(null); setPhase('evaluate') }, 800)
    } else {
      setFeedback('wrong')
      if (attempts >= 1) {
        // After 2 wrong attempts, show rewind
        setTimeout(() => { setFeedback(null); setPhase('rewind') }, 700)
      } else {
        setTimeout(() => { setFeedback(null); setInput('') }, 700)
      }
    }
  }

  const handleStrategySelect = (idx: number) => {
    setSelectedStrategy(idx)
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: true, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif5_zaman_evaluate', strategyChosen: prob.strategies[idx].name, efficiency: prob.strategies[idx].efficiency } })
    setTimeout(() => { setShowAllStrategies(true) }, 500)
    setTimeout(() => { setRound(r => r + 1) }, 3000)
  }

  const phaseLabels = { solve: '🧮 Çöz!', evaluate: '🤔 Nasıl çözdün?', rewind: '⏪ Geri Sarma — Stratejileri İncele' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.15)' }}>⏰ {phaseLabels[phase]}</span>
        <div className="flex gap-1.5">
          {['solve', 'evaluate', 'rewind'].map((p, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: phase === p ? '#A5B4FC' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(99,102,241,0.1)' }}>
        {/* Problem always visible */}
        <motion.p className="text-4xl font-black text-white text-center mb-4" key={prob.problem}
          initial={{ scale: 0.8 }} animate={{ scale: 1 }}>{prob.problem}</motion.p>

        {/* SOLVE phase */}
        {phase === 'solve' && (
          <div className="flex items-center justify-center gap-3">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={4} placeholder="?"
              className="w-20 h-14 rounded-xl text-center text-3xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none focus:border-yellow-400/40" />
            <motion.button disabled={!input || !!feedback} className="h-14 px-6 rounded-xl text-sm font-bold disabled:opacity-30"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
              whileTap={{ scale: 0.92 }} onClick={handleSolve}>Gönder ✓</motion.button>
          </div>
        )}

        {/* EVALUATE phase */}
        {phase === 'evaluate' && (
          <div className="space-y-2">
            <p className="text-sm text-green-300 text-center font-bold mb-3">✅ Doğru! Şimdi: hangi stratejiyi kullandın?</p>
            {prob.strategies.map((s, i) => (
              <motion.button key={i} className="w-full p-3 rounded-xl text-left"
                style={{ background: selectedStrategy === i ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${selectedStrategy === i ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}` }}
                whileHover={{ scale: 1.01 }} onClick={() => !selectedStrategy && handleStrategySelect(i)}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <span className="text-sm font-bold text-white">{s.name}</span>
                <span className="text-xs text-white/40 block mt-0.5">{s.steps}</span>
                {showAllStrategies && <span className="text-[10px] text-indigo-300/60 block mt-1">Verimlilik: {s.efficiency}</span>}
              </motion.button>
            ))}
          </div>
        )}

        {/* REWIND phase */}
        {phase === 'rewind' && (
          <div className="space-y-3">
            <p className="text-sm text-orange-300 text-center font-bold">⏪ Geri Sarma: Bu problemi şöyle çözebilirdin:</p>
            {prob.strategies.map((s, i) => (
              <motion.div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                <span className="text-sm font-bold text-orange-300">{s.name}</span>
                <span className="text-xs text-white/50 block mt-0.5">{s.steps}</span>
              </motion.div>
            ))}
            <p className="text-center text-lg font-black text-yellow-300 mt-2">Cevap: {prob.answer}</p>
            <button className="w-full py-2 rounded-xl text-sm font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
              onClick={() => setRound(r => r + 1)}>Sonraki Soru →</button>
          </div>
        )}
      </div>

      {feedback === 'wrong' && phase === 'solve' && <p className="text-xs text-orange-300">Tekrar dene! ({attempts + 1}. deneme)</p>}
      <AnimatePresence>{feedback === 'correct' && phase === 'solve' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
