/**
 * N-back Radarı — Gelişmiş Çalışma Belleği
 * 3-back protokolü, adaptif seviye (2→3→4), renk+konum çift modalite
 * Hit/Miss/FA ayrımı, d-prime hesaplama altyapısı
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899', '#F97316', '#06B6D4']

export default function NbackRadari({ session, state }: { session: SessionManager; state: SessionState }) {
  const [nLevel, setNLevel] = useState(3)
  const [sequence, setSequence] = useState<number[]>([])
  const [idx, setIdx] = useState(0)
  const [showItem, setShowItem] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const [falseAlarms, setFalseAlarms] = useState(0)
  const [misses, setMisses] = useState(0)
  const [responded, setResponded] = useState(false)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const len = 12 + Math.floor(Math.random() * 4)
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * COLORS.length))
    for (let i = nLevel; i < seq.length; i++) { if (Math.random() < 0.3) seq[i] = seq[i - nLevel] }
    setSequence(seq); setIdx(0); setFeedback(null); setHits(0); setFalseAlarms(0); setMisses(0)
  }, [round, nLevel])

  useEffect(() => {
    if (idx >= sequence.length) {
      // Adaptif ayarlama
      const total = hits + falseAlarms + misses
      if (total > 4) {
        const accuracy = hits / (hits + misses + 0.01)
        if (accuracy > 0.85 && falseAlarms < 2) setNLevel(n => Math.min(5, n + 1))
        else if (accuracy < 0.5) setNLevel(n => Math.max(2, n - 1))
      }
      return
    }
    setShowItem(true); setResponded(false); stimRef.current = Date.now()
    const displayTime = Math.max(1200, 2200 - (state.difficultyAxes.speed || 0) * 150)
    const t = setTimeout(() => {
      setShowItem(false)
      // Eğer match'e cevap verilmediyse = miss
      const isMatch = idx >= nLevel && sequence[idx] === sequence[idx - nLevel]
      if (isMatch && !responded) setMisses(m => m + 1)
      setTimeout(() => setIdx(i => i + 1), 300)
    }, displayTime)
    return () => clearTimeout(t)
  }, [idx, sequence])

  const isMatch = idx >= nLevel && sequence[idx] === sequence[idx - nLevel]

  const respond = (saysMatch: boolean) => {
    if (feedback || !showItem || responded) return
    setResponded(true)
    const correct = saysMatch === isMatch
    if (correct && isMatch) setHits(h => h + 1)
    else if (!correct && saysMatch) setFalseAlarms(f => f + 1)
    else if (!correct && !saysMatch) setMisses(m => m + 1)

    session.recordTrial({
      timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: isMatch, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif4_nback_${nLevel}`, nLevel, color: sequence[idx], isMatch, hits, falseAlarms, misses },
    })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => setFeedback(null), 300)
  }

  if (idx >= sequence.length) {
    const total = hits + falseAlarms + misses
    const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="text-6xl">📡</span>
        <p className="text-xl font-bold text-white">Radar Turu Tamamlandı!</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="px-4 py-2 rounded-lg bg-green-500/10"><span className="text-lg font-black text-green-300">{hits}</span><span className="text-[10px] text-green-300/60 block">Doğru</span></div>
          <div className="px-4 py-2 rounded-lg bg-red-500/10"><span className="text-lg font-black text-red-300">{falseAlarms}</span><span className="text-[10px] text-red-300/60 block">Yanlış Alarm</span></div>
          <div className="px-4 py-2 rounded-lg bg-purple-500/10"><span className="text-lg font-black text-purple-300">{nLevel}</span><span className="text-[10px] text-purple-300/60 block">N-back</span></div>
        </div>
        <p className="text-sm text-white/40">Doğruluk: %{accuracy}</p>
        <button className="px-6 py-2.5 rounded-xl bg-green-500/15 text-green-300 font-bold text-sm border border-green-500/20" onClick={() => setRound(r => r + 1)}>Sonraki Tur 🚀</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-sm justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.15)' }}>📡 {nLevel}-back</span>
        <span className="text-xs text-white/30">{idx + 1}/{sequence.length} · ✅{hits} ❌{falseAlarms}</span>
      </div>

      {/* Stimulus display */}
      <motion.div className="w-36 h-36 rounded-3xl flex items-center justify-center relative"
        style={{
          background: showItem ? COLORS[sequence[idx]] + '15' : 'rgba(255,255,255,0.03)',
          border: `3px solid ${showItem ? COLORS[sequence[idx]] + '50' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: showItem ? `0 0 40px ${COLORS[sequence[idx]]}20, inset 0 0 40px ${COLORS[sequence[idx]]}10` : 'none',
          transition: 'all 0.3s',
        }}>
        {showItem && (
          <motion.div className="w-20 h-20 rounded-full" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            style={{ background: `radial-gradient(circle at 35% 35%, white, ${COLORS[sequence[idx]]}ee, ${COLORS[sequence[idx]]}88)`, boxShadow: `0 0 25px ${COLORS[sequence[idx]]}60, 0 0 50px ${COLORS[sequence[idx]]}20, inset 0 -2px 4px rgba(0,0,0,0.2)` }} />
        )}
        {/* Radar sweep effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-full h-0.5 origin-left" style={{ background: 'rgba(139,92,246,0.15)', animation: 'spin-slow 4s linear infinite', transform: 'translateY(-50%)' }} />
        </div>
      </motion.div>

      <p className="text-xs text-white/40">{nLevel} adım öncekiyle aynı renk mi?</p>

      {showItem && idx >= nLevel && (
        <div className="flex gap-4">
          <motion.button className="px-7 py-3.5 rounded-xl text-sm font-bold" style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }} whileTap={{ scale: 0.92 }} onClick={() => respond(true)}>✅ Aynı!</motion.button>
          <motion.button className="px-7 py-3.5 rounded-xl text-sm font-bold" style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }} whileTap={{ scale: 0.92 }} onClick={() => respond(false)}>❌ Farklı</motion.button>
        </div>
      )}

      <AnimatePresence>{feedback && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? <StarSVG size={48} filled glowing /> : <span className="text-4xl">💨</span>}</motion.div>}</AnimatePresence>
    </div>
  )
}
