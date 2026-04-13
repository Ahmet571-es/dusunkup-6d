/**
 * Flanker Okyanusu — Gelişmiş Eriksen Flanker
 * 4 Mod: Uyumlu → Uyumsuz → Yakın Mesafe → Çoklu Çeldirici
 * Flanker etkisi, uyumsuzluk maliyeti, mesafe etkisi ölçümü
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type FlankerCondition = 'congruent' | 'incongruent' | 'neutral' | 'close'

const FISH = { left: '🐟', right: '🐠', neutral: '🐚' }

export default function FlankerOkyanus({ session, state }: { session: SessionManager; state: SessionState }) {
  const [target, setTarget] = useState<'left' | 'right'>('right')
  const [flankers, setFlankers] = useState<string[]>([])
  const [condition, setCondition] = useState<FlankerCondition>('congruent')
  const [showStim, setShowStim] = useState(false)
  const [showFixation, setShowFixation] = useState(true)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [congruentRTs, setCongruentRTs] = useState<number[]>([])
  const [incongruentRTs, setIncongruentRTs] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())

  const setSize = Math.min(9, 3 + (state.difficultyAxes.set_size || 0) * 2)

  useEffect(() => {
    const t: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right'
    setTarget(t)

    // Determine condition based on round progression
    const conditions: FlankerCondition[] = ['congruent', 'incongruent', 'neutral', 'close']
    const condIdx = Math.floor(Math.random() * Math.min(conditions.length, 2 + Math.floor(round / 5)))
    const cond = conditions[condIdx]
    setCondition(cond)

    // Build flanker array
    const half = Math.floor(setSize / 2)
    let flankerChar: string
    if (cond === 'congruent') flankerChar = FISH[t]
    else if (cond === 'incongruent' || cond === 'close') flankerChar = t === 'left' ? FISH.right : FISH.left
    else flankerChar = FISH.neutral

    const gap = cond === 'close' ? '' : ' '
    const arr = [...Array(half).fill(flankerChar), FISH[t], ...Array(half).fill(flankerChar)]
    setFlankers(arr)

    // Timing: fixation → stimulus
    setShowStim(false); setShowFixation(true); setFeedback(null)
    const fixDuration = 300 + Math.random() * 300 // Variable fixation (arousal)
    setTimeout(() => { setShowFixation(false); setShowStim(true); stimRef.current = Date.now() }, fixDuration)
  }, [round])

  const respond = (dir: 'left' | 'right') => {
    if (!showStim || feedback) return
    const rt = Date.now() - stimRef.current
    const correct = dir === target

    if (correct) {
      setStreak(s => s + 1)
      if (condition === 'congruent') setCongruentRTs(prev => [...prev.slice(-20), rt])
      if (condition === 'incongruent') setIncongruentRTs(prev => [...prev.slice(-20), rt])
    } else { setStreak(0) }

    const avgCong = congruentRTs.length > 2 ? congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length : null
    const avgIncong = incongruentRTs.length > 2 ? incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length : null
    const flankerEffect = avgCong && avgIncong ? Math.round(avgIncong - avgCong) : null

    session.recordTrial({
      timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: 'sinif2_flanker', condition, target, response: dir, flankerEffect, setSize, streak },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 500 : 400)
  }

  const flankerEffect = incongruentRTs.length > 3 && congruentRTs.length > 3
    ? Math.round((incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length) - (congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length))
    : null

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.15)' }}>🐠 Ortadaki balık hangi yöne?</span>
        <div className="flex items-center gap-2">
          {streak >= 5 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
          {flankerEffect !== null && <span className="text-[10px] text-white/20">FE: {flankerEffect}ms</span>}
        </div>
      </div>

      {/* Stimulus area */}
      <div className="w-full max-w-lg h-40 rounded-2xl flex items-center justify-center relative"
        style={{ background: 'linear-gradient(180deg, #0C1A30, #0F2845, #1A3A5C)', border: '1px solid rgba(6,182,212,0.1)' }}>
        {/* Bubbles */}
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="absolute rounded-full bg-cyan-300/5 pointer-events-none"
            style={{ width: 4 + Math.random() * 8, height: 4 + Math.random() * 8, left: `${Math.random() * 100}%`, bottom: `${Math.random() * 100}%`, animation: `float ${3 + Math.random() * 4}s ease-in-out infinite` }} />
        ))}

        {showFixation && <motion.span className="text-3xl text-white/20" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 0.8 }}>+</motion.span>}
        {showStim && (
          <motion.div className="flex items-center gap-0.5" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            {flankers.map((f, i) => {
              const isCenter = i === Math.floor(flankers.length / 2)
              return (
                <motion.span key={i}
                  className={isCenter ? 'text-4xl' : 'text-2xl'}
                  style={{
                    color: isCenter ? '#67E8F9' : 'rgba(103,232,249,0.25)',
                    filter: isCenter ? 'drop-shadow(0 0 8px rgba(103,232,249,0.5))' : 'none',
                    margin: condition === 'close' ? '0 -2px' : '0 2px',
                  }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  {f}
                </motion.span>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Response buttons */}
      <div className="flex gap-6">
        <motion.button className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.2)' }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => respond('left')}>
          <span className="text-3xl">⬅️</span><span className="text-xs text-blue-300 mt-1">Sol</span>
        </motion.button>
        <motion.button className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center"
          style={{ background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.2)' }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => respond('right')}>
          <span className="text-3xl">➡️</span><span className="text-xs text-green-300 mt-1">Sağ</span>
        </motion.button>
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '✨' : '💨'}</motion.span>}</AnimatePresence>
    </div>
  )
}
