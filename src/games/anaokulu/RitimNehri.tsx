/**
 * Ritim Nehri — Sıralı Bellek + Fonolojik Döngü
 * 4 Mod: Ritim Tekrarı → Artan Dizi → Ters Sıra → Çift Kanal
 * Adaptif span (2→7), renkli taşlar, ses efekti simülasyonu
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type RhythmMode = 'forward' | 'growing' | 'reverse' | 'dual'

const STONE_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899', '#F97316']
const STONE_EMOJIS = ['🔴', '🔵', '🟢', '🟡', '🟣', '💗', '🟠']

function StoneButton({ index, active, color, emoji, size = 60, onClick, disabled }: {
  index: number; active: boolean; color: string; emoji: string; size?: number; onClick: () => void; disabled: boolean
}) {
  return (
    <motion.div
      className="rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        width: size, height: size,
        background: active ? `radial-gradient(circle at 40% 35%, ${color}ee, ${color}aa)` : 'rgba(255,255,255,0.05)',
        border: `2.5px solid ${active ? color + '80' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: active ? `0 0 24px ${color}40, inset 0 0 12px rgba(255,255,255,0.1)` : 'none',
        transition: 'all 0.15s',
        opacity: disabled ? 0.4 : 1,
      }}
      whileHover={!disabled ? { scale: 1.08, borderColor: color + '50' } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      animate={{ scale: active ? 1.12 : 1 }}
      onClick={() => !disabled && onClick()}>
      <span className="text-lg">{active ? emoji : ''}</span>
      {!active && <span className="text-xs font-bold text-white/25">{index + 1}</span>}
    </motion.div>
  )
}

export default function RitimNehri({ session, state }: { session: SessionManager; state: SessionState }) {
  const [mode, setMode] = useState<RhythmMode>('forward')
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSeq, setPlayerSeq] = useState<number[]>([])
  const [isShowing, setIsShowing] = useState(false)
  const [activeStone, setActiveStone] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [spanLength, setSpanLength] = useState(2)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const [longestSpan, setLongestSpan] = useState(2)
  const stimRef = useRef(Date.now())
  const showTimer = useRef<number[]>([])
  const stoneCount = 6

  // Mode progression
  const modes: RhythmMode[] = ['forward', 'forward', 'growing', 'reverse', 'dual']

  const startRound = useCallback(() => {
    // Clear previous timers
    showTimer.current.forEach(t => clearTimeout(t))
    showTimer.current = []

    const m = modes[Math.min(Math.floor(round / 4), modes.length - 1)]
    setMode(m)

    let seq: number[]
    if (m === 'growing') {
      // Growing: add one more each time
      const base = Array.from({ length: Math.max(2, spanLength - 1) }, () => Math.floor(Math.random() * stoneCount))
      seq = [...base, Math.floor(Math.random() * stoneCount)]
    } else {
      seq = Array.from({ length: spanLength }, () => Math.floor(Math.random() * stoneCount))
    }

    setSequence(seq)
    setPlayerSeq([])
    setFeedback(null)
    setIsShowing(true)
    stimRef.current = Date.now()

    // Animate sequence display
    const speed = Math.max(400, 700 - (state.difficultyAxes.speed || 0) * 40)
    seq.forEach((s, i) => {
      const t1 = setTimeout(() => setActiveStone(s), (i + 1) * speed) as unknown as number
      const t2 = setTimeout(() => setActiveStone(null), (i + 1) * speed + speed * 0.6) as unknown as number
      showTimer.current.push(t1, t2)
    })
    const endTimer = setTimeout(() => {
      setIsShowing(false)
      setActiveStone(null)
    }, (seq.length + 1) * speed) as unknown as number
    showTimer.current.push(endTimer)
  }, [spanLength, round, stoneCount])

  useEffect(() => { startRound() }, [round])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => { showTimer.current.forEach(t => clearTimeout(t)) }
  }, [])

  const getExpectedSequence = (): number[] => {
    if (mode === 'reverse') return [...sequence].reverse()
    return sequence
  }

  const handleStoneTap = (idx: number) => {
    if (isShowing || feedback) return

    // Flash the stone
    setActiveStone(idx)
    setTimeout(() => setActiveStone(null), 120)

    const newSeq = [...playerSeq, idx]
    setPlayerSeq(newSeq)

    const expected = getExpectedSequence()

    // Check each step as it's entered
    const currentStep = newSeq.length - 1
    if (newSeq[currentStep] !== expected[currentStep]) {
      // Wrong at this step
      const rt = Date.now() - stimRef.current
      session.recordTrial({
        timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
        responseAt: Date.now(), responseTimeMs: rt, isCorrect: false,
        isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
        metadata: { skillId: `anaokulu_ritim_${mode}`, span: spanLength, mode, correct: false, step: currentStep, expected: expected[currentStep], got: idx },
      })
      setFeedback('wrong')
      setStreak(0)
      setSpanLength(s => Math.max(2, s - 1))
      setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 800)
      return
    }

    // All steps complete?
    if (newSeq.length === expected.length) {
      const rt = Date.now() - stimRef.current
      session.recordTrial({
        timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
        responseAt: Date.now(), responseTimeMs: rt, isCorrect: true,
        isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
        metadata: { skillId: `anaokulu_ritim_${mode}`, span: spanLength, mode, correct: true, streak: streak + 1 },
      })
      setFeedback('correct')
      setStreak(s => s + 1)
      const newSpan = Math.min(7, spanLength + 1)
      setSpanLength(newSpan)
      if (newSpan > longestSpan) setLongestSpan(newSpan)
      setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 1000)
    }
  }

  const expected = getExpectedSequence()
  const modeLabels: Record<RhythmMode, string> = {
    forward: '🎵 Aynı sırayla tekrarla', growing: '📈 Her turda bir tane daha!',
    reverse: '🔄 Ters sırayla tekrarla!', dual: '🎭 Renk+Sıra birlikte!',
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-sm justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.15)' }}>
          {isShowing ? '👀 İzle...' : modeLabels[mode]}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20">Hafıza: {spanLength}</span>
          {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
          <span className="text-[10px] text-white/15">Rekor: {longestSpan}</span>
        </div>
      </div>

      {/* Water/river background */}
      <div className="w-full max-w-sm rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(6,30,50,0.8), rgba(10,40,70,0.6))', border: '1px solid rgba(6,182,212,0.1)' }}>
        {/* Water ripples */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="absolute rounded-full border border-cyan-400/5"
              style={{ width: 60 + i * 40, height: 60 + i * 40, left: `${20 + i * 10}%`, top: `${30 + i * 5}%`, animation: `float ${4 + i}s ease-in-out infinite` }} />
          ))}
        </div>

        {/* Stones */}
        <div className="flex gap-2 justify-center relative z-10">
          {Array.from({ length: stoneCount }, (_, i) => (
            <StoneButton key={i} index={i} active={activeStone === i}
              color={STONE_COLORS[i]} emoji={STONE_EMOJIS[i]} size={52}
              onClick={() => handleStoneTap(i)} disabled={isShowing || !!feedback} />
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center mt-4 relative z-10">
          {expected.map((_, i) => (
            <motion.div key={i} className="w-3 h-3 rounded-full"
              style={{
                background: i < playerSeq.length
                  ? (playerSeq[i] === expected[i] ? '#34D399' : '#EF4444')
                  : i === playerSeq.length ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.1)',
                boxShadow: i === playerSeq.length ? '0 0 6px rgba(251,191,36,0.3)' : 'none',
              }}
              animate={i === playerSeq.length && !isShowing ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center">
        {isShowing && <p className="text-xs text-cyan-300/50 animate-pulse">🎵 Taşların parlama sırasını izle...</p>}
        {!isShowing && !feedback && (
          <p className="text-xs text-white/40">
            {mode === 'reverse' ? '🔄 Şimdi TERS sırayla dokun!' : '👆 Aynı sırayla taşlara dokun!'}
            {' '}{playerSeq.length}/{expected.length}
          </p>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            <span className="text-5xl">{feedback === 'correct' ? '🌟' : '💫'}</span>
            <p className={`text-sm font-bold mt-1 ${feedback === 'correct' ? 'text-green-300' : 'text-orange-300'}`}>
              {feedback === 'correct' ? (streak >= 3 ? `${streak} seri! 🔥` : 'Harika!') : `Tekrar dene! Hafıza: ${spanLength}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
