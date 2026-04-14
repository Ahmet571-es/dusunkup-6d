/**
 * Gelişmiş N-back — 4-back + Çift Modalite
 * Konum + Şekil ayrı kanallar, adaptif seviye (3→4→5)
 * En zorlayıcı çalışma belleği antrenmanı
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const SHAPES = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⬜', '🔶']
const POSITIONS = 9 // 3x3 grid

export default function GelismisNback({ session, state }: { session: SessionManager; state: SessionState }) {
  const [nLevel, setNLevel] = useState(4)
  const [mode, setMode] = useState<'shape' | 'position' | 'dual'>('shape')
  const [shapeSeq, setShapeSeq] = useState<number[]>([])
  const [posSeq, setPosSeq] = useState<number[]>([])
  const [idx, setIdx] = useState(0)
  const [showItem, setShowItem] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [fas, setFas] = useState(0)
  const [responded, setResponded] = useState(false)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: ('shape' | 'position' | 'dual')[] = ['shape', 'position', 'dual']
    const m = modes[Math.min(Math.floor(round / 2), modes.length - 1)]; setMode(m)
    const len = 14
    const sSeq = Array.from({ length: len }, () => Math.floor(Math.random() * SHAPES.length))
    const pSeq = Array.from({ length: len }, () => Math.floor(Math.random() * POSITIONS))
    for (let i = nLevel; i < len; i++) {
      if (Math.random() < 0.25) sSeq[i] = sSeq[i - nLevel]
      if (Math.random() < 0.25) pSeq[i] = pSeq[i - nLevel]
    }
    setShapeSeq(sSeq); setPosSeq(pSeq); setIdx(0)
    setFeedback(null); setHits(0); setMisses(0); setFas(0)
  }, [round, nLevel])

  useEffect(() => {
    if (idx >= shapeSeq.length) {
      const acc = hits / (hits + misses + 0.01)
      if (acc > 0.8 && hits > 3) setNLevel(n => Math.min(6, n + 1))
      else if (acc < 0.4) setNLevel(n => Math.max(2, n - 1))
      return
    }
    setShowItem(true); setResponded(false); stimRef.current = Date.now()
    const t = setTimeout(() => {
      setShowItem(false)
      const isMatch = mode === 'shape' ? (idx >= nLevel && shapeSeq[idx] === shapeSeq[idx - nLevel])
        : mode === 'position' ? (idx >= nLevel && posSeq[idx] === posSeq[idx - nLevel])
        : (idx >= nLevel && (shapeSeq[idx] === shapeSeq[idx - nLevel] || posSeq[idx] === posSeq[idx - nLevel]))
      if (isMatch && !responded) setMisses(m => m + 1)
      setTimeout(() => setIdx(i => i + 1), 250)
    }, 1500)
    return () => clearTimeout(t)
  }, [idx, shapeSeq])

  const shapeMatch = idx >= nLevel && shapeSeq[idx] === shapeSeq[idx - nLevel]
  const posMatch = idx >= nLevel && posSeq[idx] === posSeq[idx - nLevel]
  const isMatch = mode === 'shape' ? shapeMatch : mode === 'position' ? posMatch : (shapeMatch || posMatch)

  const respond = (saysMatch: boolean) => {
    if (feedback || !showItem || responded) return; setResponded(true)
    const correct = saysMatch === isMatch
    if (correct && isMatch) setHits(h => h + 1)
    else if (!correct && saysMatch) setFas(f => f + 1)
    else if (!correct) setMisses(m => m + 1)

    session.recordTrial({
      timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: isMatch, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif5_nback_${nLevel}_${mode}`, nLevel, mode, shapeMatch, posMatch, isMatch },
    })
    setFeedback(correct ? 'correct' : 'wrong'); setTimeout(() => setFeedback(null), 300)
  }

  if (idx >= shapeSeq.length) {
    const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="text-6xl">🧬</span>
        <p className="text-xl font-bold text-white">Tur Tamamlandı!</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="px-3 py-2 rounded-lg bg-green-500/10"><span className="text-lg font-black text-green-300">{hits}</span><span className="text-[9px] text-white/40 block">Hit</span></div>
          <div className="px-3 py-2 rounded-lg bg-red-500/10"><span className="text-lg font-black text-red-300">{fas}</span><span className="text-[9px] text-white/40 block">F.Alarm</span></div>
          <div className="px-3 py-2 rounded-lg bg-yellow-500/10"><span className="text-lg font-black text-yellow-300">{misses}</span><span className="text-[9px] text-white/40 block">Miss</span></div>
        </div>
        <p className="text-sm text-white/40">Seviye: {nLevel}-back · Mod: {mode === 'dual' ? 'Çift Kanal' : mode === 'shape' ? 'Şekil' : 'Konum'} · %{accuracy}</p>
        <button className="px-6 py-2 rounded-xl bg-green-500/15 text-green-300 font-bold text-sm border border-green-500/20" onClick={() => setRound(r => r + 1)}>Sonraki Tur 🚀</button>
      </div>
    )
  }

  const modeLabel = mode === 'shape' ? `🧬 ${nLevel}-back Şekil` : mode === 'position' ? `📍 ${nLevel}-back Konum` : `🔀 ${nLevel}-back Çift Kanal`

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-sm justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)', color: '#D8B4FE', border: '1px solid rgba(168,85,247,0.15)' }}>{modeLabel}</span>
        <span className="text-xs text-white/30">{idx + 1}/{shapeSeq.length}</span>
      </div>

      {/* 3x3 grid for position + shape display */}
      {mode !== 'shape' ? (
        <div className="grid grid-cols-3 gap-1.5" style={{ width: 156 }}>
          {Array.from({ length: POSITIONS }, (_, i) => {
            const isActive = showItem && posSeq[idx] === i
            return (
              <div key={i} className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: isActive ? 'radial-gradient(circle, rgba(168,85,247,0.2), rgba(168,85,247,0.08))' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${isActive ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'}`, boxShadow: isActive ? '0 0 15px rgba(168,85,247,0.25), inset 0 0 10px rgba(168,85,247,0.1)' : '0 2px 4px rgba(0,0,0,0.15)' }}>
                {isActive && <motion.span className="text-2xl" initial={{ scale: 0 }} animate={{ scale: 1 }}>{mode === 'dual' ? SHAPES[shapeSeq[idx]] : '🔮'}</motion.span>}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl"
          style={{ background: showItem ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)', border: `2px solid ${showItem ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
          {showItem && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>{SHAPES[shapeSeq[idx]]}</motion.span>}
        </div>
      )}

      <p className="text-[10px] text-white/30">
        {mode === 'shape' ? 'Şekil aynı mı?' : mode === 'position' ? 'Konum aynı mı?' : 'Şekil VEYA konum aynı mı?'}
      </p>

      {showItem && idx >= nLevel && (
        <div className="flex gap-4">
          <motion.button className="px-7 py-3 rounded-xl text-sm font-bold" style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} whileTap={{ scale: 0.92 }} onClick={() => respond(true)}>✅ Aynı!</motion.button>
          <motion.button className="px-7 py-3 rounded-xl text-sm font-bold" style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5' }} whileTap={{ scale: 0.92 }} onClick={() => respond(false)}>❌ Farklı</motion.button>
        </div>
      )}

      <AnimatePresence>{feedback && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? <StarSVG size={40} filled glowing /> : <span className="text-3xl">💨</span>}</motion.div>}</AnimatePresence>
    </div>
  )
}
