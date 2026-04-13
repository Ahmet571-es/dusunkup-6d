import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function TahminAdasi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [dots, setDots] = useState<{ x: number; y: number }[]>([])
  const [actual, setActual] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct'|'close'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const count = 5 + Math.floor(Math.random() * 20)
    const d = Array.from({ length: count }, () => ({ x: 5 + Math.random() * 90, y: 5 + Math.random() * 90 }))
    setDots(d); setActual(count); setInput(''); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleSubmit = () => {
    if (feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const error = Math.abs(val - actual)
    const pae = (error / actual) * 100
    const correct = pae < 10
    const close = pae < 25
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct || close, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif3_tahmin', actual, estimate: val, pae: Math.round(pae) } })
    setFeedback(correct ? 'correct' : close ? 'close' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 1200)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)', color: '#D8B4FE' }}>🔮 Kaç nokta var? Tahmin et!</span>
      <div className="w-64 h-48 rounded-xl relative" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {dots.map((d, i) => <div key={i} className="absolute w-2 h-2 rounded-full bg-yellow-400" style={{ left: `${d.x}%`, top: `${d.y}%`, boxShadow: '0 0 4px rgba(251,191,36,0.5)' }} />)}
      </div>
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={2} placeholder="?" className="w-16 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none" />
        <motion.button disabled={!input || !!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Tahmin Et ✓</motion.button>
      </div>
      {feedback && <p className={`text-sm font-bold ${feedback === 'correct' ? 'text-green-300' : feedback === 'close' ? 'text-yellow-300' : 'text-orange-300'}`}>
        {feedback === 'correct' ? '🌟 Mükemmel!' : feedback === 'close' ? `👍 Yakın! Cevap: ${actual}` : `💫 Cevap: ${actual}`}
      </p>}
    </div>
  )
}
