import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function CiftGorev({ session, state }: { session: SessionManager; state: SessionState }) {
  const [targetColor, setTargetColor] = useState('#EF4444')
  const [mathA, setMathA] = useState(3)
  const [mathB, setMathB] = useState(2)
  const [objects, setObjects] = useState<{ id: number; x: number; color: string; isTarget: boolean }[]>([])
  const [mathInput, setMathInput] = useState('')
  const [colorScore, setColorScore] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308']

  useEffect(() => {
    const tc = COLORS[Math.floor(Math.random() * COLORS.length)]
    setTargetColor(tc)
    const a = 2 + Math.floor(Math.random() * 8)
    const b = 1 + Math.floor(Math.random() * 8)
    setMathA(a); setMathB(b)
    const objs = Array.from({ length: 8 }, (_, i) => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)]
      return { id: i, x: 10 + Math.random() * 80, color: c, isTarget: c === tc }
    })
    setObjects(objs)
    setMathInput(''); setColorScore(0); setFeedback(null)
    stimRef.current = Date.now()
  }, [round])

  const handleColorTap = (obj: typeof objects[0]) => {
    if (obj.isTarget) { setColorScore(s => s + 1); setObjects(prev => prev.filter(o => o.id !== obj.id)) }
    else { session.recordTrial({ timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: false, isTarget: false, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif3_cift_gorev', type: 'color_false_alarm' } }) }
  }

  const handleMathSubmit = () => {
    if (feedback) return
    const val = parseInt(mathInput); if (isNaN(val)) return
    const correct = val === mathA + mathB
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif3_cift_gorev', type: 'math', colorScore, dualTask: true } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 800)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#FDE68A' }}>🎯 İki görev aynı anda! Renkleri yakala + hesapla</span>
      <div className="flex gap-3 w-full max-w-lg">
        {/* Color task */}
        <div className="flex-1 rounded-xl p-3 relative" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 180 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ background: targetColor }} />
            <span className="text-[10px] text-white/50">Bu rengi yakala! ({colorScore})</span>
          </div>
          {objects.map(obj => (
            <motion.div key={obj.id} className="absolute w-8 h-8 rounded-full cursor-pointer" style={{ left: `${obj.x}%`, top: `${20 + Math.random() * 60}%`, background: obj.color, boxShadow: `0 0 8px ${obj.color}40` }} whileTap={{ scale: 0 }} onClick={() => handleColorTap(obj)} />
          ))}
        </div>
        {/* Math task */}
        <div className="w-40 rounded-xl p-3 flex flex-col items-center justify-center gap-2" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-2xl font-black text-white">{mathA} + {mathB}</span>
          <input type="text" value={mathInput} onChange={e => setMathInput(e.target.value)} maxLength={2} className="w-16 h-10 rounded-lg text-center text-xl font-black bg-white/5 border border-white/10 text-yellow-300 focus:outline-none" />
          <motion.button className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} whileTap={{ scale: 0.92 }} onClick={handleMathSubmit}>✓</motion.button>
        </div>
      </div>
      <AnimatePresence>{feedback && <motion.span className="text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
