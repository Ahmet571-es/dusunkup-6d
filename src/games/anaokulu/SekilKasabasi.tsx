import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const SHAPES = [
  { name: 'Daire', svg: <circle cx="25" cy="25" r="20" />, color: '#EF4444' },
  { name: 'Kare', svg: <rect x="5" y="5" width="40" height="40" />, color: '#3B82F6' },
  { name: 'Üçgen', svg: <polygon points="25,5 45,40 5,40" />, color: '#22C55E' },
  { name: 'Dikdörtgen', svg: <rect x="3" y="10" width="44" height="30" />, color: '#F59E0B' },
  { name: 'Yıldız', svg: <polygon points="25,2 31,18 48,18 34,28 39,45 25,35 11,45 16,28 2,18 19,18" />, color: '#A855F7' },
]

export default function SekilKasabasi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [target, setTarget] = useState(SHAPES[0])
  const [allShapes, setAllShapes] = useState<typeof SHAPES[0][]>([])
  const [mode, setMode] = useState<'find' | 'name'>('find')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const t = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    setTarget(t)
    const m = round % 2 === 0 ? 'find' : 'name' as const
    setMode(m)
    if (m === 'find') {
      const others = SHAPES.filter(s => s.name !== t.name).sort(() => Math.random() - 0.5).slice(0, 3)
      setAllShapes([t, ...others].sort(() => Math.random() - 0.5))
    }
    setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleSelect = (shape: typeof SHAPES[0]) => {
    if (feedback) return
    const correct = mode === 'find' ? shape.name === target.name : true
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'anaokulu_sekil', mode, target: target.name, selected: shape.name } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 800 : 600)
  }

  const handleName = (name: string) => {
    if (feedback) return
    const correct = name === target.name
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'anaokulu_sekil', mode, target: target.name } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 800 : 600)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: '#A5B4FC' }}>
        🔷 {mode === 'find' ? `${target.name} bul!` : 'Bu şeklin adı ne?'}
      </span>
      {mode === 'name' && (
        <svg width="80" height="80" viewBox="0 0 50 50"><g fill={target.color + '40'} stroke={target.color} strokeWidth="2">{target.svg}</g></svg>
      )}
      {mode === 'find' ? (
        <div className="flex gap-4 flex-wrap justify-center">
          {allShapes.map((s, i) => (
            <motion.div key={i} className="w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSelect(s)}>
              <svg width="50" height="50" viewBox="0 0 50 50"><g fill={s.color + '40'} stroke={s.color} strokeWidth="2">{s.svg}</g></svg>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap justify-center">
          {SHAPES.sort(() => Math.random() - 0.5).slice(0, 4).map((s, i) => (
            <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={() => handleName(s.name)}>{s.name}</motion.button>
          ))}
        </div>
      )}
      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
