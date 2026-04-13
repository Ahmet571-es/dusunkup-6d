import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const STONE_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899']

export default function RitimNehri({ session, state }: { session: SessionManager; state: SessionState }) {
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSeq, setPlayerSeq] = useState<number[]>([])
  const [isShowing, setIsShowing] = useState(false)
  const [activeStone, setActiveStone] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [spanLength, setSpanLength] = useState(2)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const stoneCount = 5

  const startRound = useCallback(() => {
    const seq = Array.from({ length: spanLength }, () => Math.floor(Math.random() * stoneCount))
    setSequence(seq); setPlayerSeq([]); setFeedback(null)
    setIsShowing(true); stimRef.current = Date.now()
    // Show sequence
    seq.forEach((s, i) => {
      setTimeout(() => setActiveStone(s), (i + 1) * 700)
      setTimeout(() => setActiveStone(null), (i + 1) * 700 + 400)
    })
    setTimeout(() => { setIsShowing(false); setActiveStone(null) }, (seq.length + 1) * 700)
  }, [spanLength])

  useEffect(() => { startRound() }, [round, startRound])

  const handleStoneTap = (idx: number) => {
    if (isShowing || feedback) return
    setActiveStone(idx)
    setTimeout(() => setActiveStone(null), 150)
    const newSeq = [...playerSeq, idx]
    setPlayerSeq(newSeq)

    if (newSeq.length === sequence.length) {
      const correct = newSeq.every((v, i) => v === sequence[i])
      session.recordTrial({ timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'anaokulu_ritim', span: spanLength, correct } })
      setFeedback(correct ? 'correct' : 'wrong')
      if (correct) setSpanLength(s => Math.min(7, s + 1))
      else setSpanLength(s => Math.max(2, s - 1))
      setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 1000 : 800)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9' }}>
        🎵 {isShowing ? 'İzle...' : 'Aynı sırayla dokun!'} (Hafıza: {spanLength})
      </span>

      <div className="flex gap-3">
        {Array.from({ length: stoneCount }, (_, i) => (
          <motion.div key={i}
            className="w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer text-lg font-bold"
            style={{
              background: activeStone === i ? STONE_COLORS[i] : 'rgba(255,255,255,0.05)',
              border: `2px solid ${activeStone === i ? STONE_COLORS[i] + '80' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: activeStone === i ? `0 0 20px ${STONE_COLORS[i]}40` : 'none',
              color: activeStone === i ? 'white' : 'rgba(255,255,255,0.3)',
            }}
            animate={{ scale: activeStone === i ? 1.15 : 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleStoneTap(i)}>
            {i + 1}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1">
        {sequence.map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full" style={{
            background: i < playerSeq.length ? (playerSeq[i] === sequence[i] ? '#34D399' : '#EF4444') : 'rgba(255,255,255,0.1)'
          }} />
        ))}
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
