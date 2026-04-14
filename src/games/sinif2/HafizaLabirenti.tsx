/**
 * Hafıza Labirenti — 2-back + Spatial + Dual Task
 * 3 Mod: Yol Hatırlama → 2-back Renk → Çift Bilgi (konum+renk)
 * Adaptif N-back seviyesi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG, FlowerSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899']

export default function HafizaLabirenti({ session, state }: { session: SessionManager; state: SessionState }) {
  const [nLevel, setNLevel] = useState(2)
  const [sequence, setSequence] = useState<number[]>([])
  const [colorSeq, setColorSeq] = useState<number[]>([])
  const [idx, setIdx] = useState(0)
  const [showItem, setShowItem] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const stimRef = useRef(Date.now())
  const gridSize = 9

  useEffect(() => {
    const len = 10 + Math.floor(Math.random() * 4)
    const posSeq = Array.from({ length: len }, () => Math.floor(Math.random() * gridSize))
    const colSeq = Array.from({ length: len }, () => Math.floor(Math.random() * COLORS.length))
    // Ensure ~30% matches
    for (let i = nLevel; i < posSeq.length; i++) {
      if (Math.random() < 0.3) posSeq[i] = posSeq[i - nLevel]
    }
    setSequence(posSeq); setColorSeq(colSeq); setIdx(0)
    setFeedback(null); setHits(0); setMisses(0)
  }, [round, nLevel])

  useEffect(() => {
    if (idx >= sequence.length) {
      // Round complete — adjust n-back level
      const accuracy = (hits + 0.01) / (hits + misses + 0.01)
      if (accuracy > 0.8 && hits > 3) setNLevel(n => Math.min(4, n + 1))
      else if (accuracy < 0.5 && misses > 2) setNLevel(n => Math.max(1, n - 1))
      return
    }
    setShowItem(true); stimRef.current = Date.now()
    const displayTime = Math.max(1000, 2000 - (state.difficultyAxes.time_pressure || 0) * 150)
    const t = setTimeout(() => {
      setShowItem(false)
      setTimeout(() => setIdx(i => i + 1), 300)
    }, displayTime)
    return () => clearTimeout(t)
  }, [idx, sequence])

  const isMatch = idx >= nLevel && sequence[idx] === sequence[idx - nLevel]

  const respond = (saysMatch: boolean) => {
    if (feedback || !showItem) return
    const correct = saysMatch === isMatch
    if (correct) setHits(h => h + 1); else setMisses(m => m + 1)

    session.recordTrial({
      timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: isMatch, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif2_nback_${nLevel}`, nLevel, position: sequence[idx], isMatch, hits, misses },
    })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setShowItem(false); setTimeout(() => setIdx(i => i + 1), 200) }, 400)
  }

  if (idx >= sequence.length) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <span className="text-6xl">🏰</span>
      <p className="text-xl font-bold text-white">Tur Tamamlandı!</p>
      <div className="flex gap-4 text-sm">
        <span className="text-green-300">✅ {hits} doğru</span>
        <span className="text-red-300">❌ {misses} yanlış</span>
        <span className="text-purple-300">📊 {nLevel}-back</span>
      </div>
      <button className="px-6 py-2.5 rounded-xl bg-green-500/15 text-green-300 font-bold text-sm border border-green-500/20" onClick={() => setRound(r => r + 1)}>Sonraki Tur 🚀</button>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-sm justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.15)' }}>🏰 {nLevel}-back</span>
        <span className="text-xs text-white/30">{idx + 1}/{sequence.length} · ✅{hits} ❌{misses}</span>
      </div>

      <div className="grid grid-cols-3 gap-2" style={{ width: 192 }}>
        {Array.from({ length: gridSize }, (_, i) => {
          const isActive = showItem && sequence[idx] === i
          return (
            <motion.div key={i} className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: isActive ? COLORS[colorSeq[idx]] + '30' : 'rgba(255,255,255,0.04)',
                border: `2px solid ${isActive ? COLORS[colorSeq[idx]] + '60' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: isActive ? `0 0 25px ${COLORS[colorSeq[idx]]}35, inset 0 0 15px ${COLORS[colorSeq[idx]]}15` : '0 2px 6px rgba(0,0,0,0.2)',
              }}
              animate={{ scale: isActive ? 1.08 : 1 }}>
              {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><FlowerSVG color={COLORS[colorSeq[idx]]} size={32} blooming /></motion.div>}
            </motion.div>
          )
        })}
      </div>

      <p className="text-xs text-white/40">{nLevel} adım öncekiyle aynı konumda mı?</p>

      {showItem && idx >= nLevel && (
        <div className="flex gap-4">
          <motion.button className="px-7 py-3 rounded-xl text-sm font-bold" style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }} whileTap={{ scale: 0.92 }} onClick={() => respond(true)}>✅ Aynı!</motion.button>
          <motion.button className="px-7 py-3 rounded-xl text-sm font-bold" style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }} whileTap={{ scale: 0.92 }} onClick={() => respond(false)}>❌ Farklı</motion.button>
        </div>
      )}

      <AnimatePresence>{feedback && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? <StarSVG size={48} filled glowing /> : <span className="text-4xl">💨</span>}</motion.div>}</AnimatePresence>
    </div>
  )
}
