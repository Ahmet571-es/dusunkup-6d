/**
 * N-back Radarı — Gelişmiş Çalışma Belleği (BUG FIX + DERİNLİK)
 *
 * Orijinal bug: setTimeout içindeki `responded` closure'ı stale idi — isabetli
 * bir hit hem hit hem miss olarak sayılıyordu. Şimdi useRef ile anlık durum.
 *
 * Paradigma:
 *  • 3-back (başlangıç, adaptif 2↔5)
 *  • Hit / Miss / False Alarm / Correct Rejection ayrımı
 *  • d-prime hesaplama (sensitivity index)
 *  • Zorluk ekseni: display hızı + N seviyesi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import { audioEngine } from '@/engine/audio/audioEngine'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899', '#F97316', '#06B6D4']

interface ScoreState {
  hits: number
  misses: number
  falseAlarms: number
  correctRejections: number
}

export default function NbackRadari({ session, state }: { session: SessionManager; state: SessionState }) {
  const [nLevel, setNLevel] = useState(3)
  const [sequence, setSequence] = useState<number[]>([])
  const [idx, setIdx] = useState(0)
  const [showItem, setShowItem] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [scores, setScores] = useState<ScoreState>({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 })
  const [, forceRender] = useState(0)

  // Closure'dan kaçmak için ref'ler
  const respondedRef = useRef(false)
  const stimRef = useRef(Date.now())
  const idxRef = useRef(0)
  const sequenceRef = useRef<number[]>([])
  const nLevelRef = useRef(3)

  // Tur başlangıcı
  useEffect(() => {
    const len = 14 + Math.floor(Math.random() * 4)
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * COLORS.length))
    // ~%30 target rate (klinik standart)
    for (let i = nLevel; i < seq.length; i++) {
      if (Math.random() < 0.30) seq[i] = seq[i - nLevel]
    }
    setSequence(seq)
    sequenceRef.current = seq
    setIdx(0)
    idxRef.current = 0
    nLevelRef.current = nLevel
    setScores({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 })
    setFeedback(null)
  }, [round, nLevel])

  // Stimulus döngüsü
  useEffect(() => {
    if (idx >= sequence.length) {
      // Tur sonu — adaptif ayarlama
      if (scores.hits + scores.misses + scores.falseAlarms > 5) {
        const hitRate = scores.hits / Math.max(1, scores.hits + scores.misses)
        if (hitRate > 0.85 && scores.falseAlarms <= 1) {
          setNLevel(n => Math.min(5, n + 1))
        } else if (hitRate < 0.45) {
          setNLevel(n => Math.max(2, n - 1))
        }
      }
      return
    }

    respondedRef.current = false
    setShowItem(true)
    stimRef.current = Date.now()
    idxRef.current = idx

    const displayTime = Math.max(1200, 2200 - (state.difficultyAxes.speed || 0) * 150)

    const tShow = setTimeout(() => {
      setShowItem(false)
      // Kullanıcı cevap vermediyse: eğer target idiyse MISS, değilse CORRECT REJECTION
      if (!respondedRef.current) {
        const i = idxRef.current
        const nLv = nLevelRef.current
        const isTarget = i >= nLv && sequenceRef.current[i] === sequenceRef.current[i - nLv]
        setScores(s => ({
          ...s,
          misses: isTarget ? s.misses + 1 : s.misses,
          correctRejections: !isTarget ? s.correctRejections + 1 : s.correctRejections,
        }))
      }
      const tNext = setTimeout(() => setIdx(i => i + 1), 300)
      timersRef.current.push(tNext)
    }, displayTime)
    timersRef.current.push(tShow)

    return () => { timersRef.current.forEach(t => clearTimeout(t)); timersRef.current = [] }
     
  }, [idx, sequence])

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const currentIsTarget = idx >= nLevel && idx < sequence.length && sequence[idx] === sequence[idx - nLevel]

  const respond = (saysMatch: boolean) => {
    if (!showItem || feedback || respondedRef.current) return
    respondedRef.current = true

    const isTarget = currentIsTarget
    const correct = saysMatch === isTarget
    const rt = Date.now() - stimRef.current

    setScores(s => {
      const next = { ...s }
      if (saysMatch && isTarget) next.hits += 1                    // Hit
      else if (saysMatch && !isTarget) next.falseAlarms += 1       // False Alarm
      else if (!saysMatch && isTarget) next.misses += 1            // Miss
      else next.correctRejections += 1                             // Correct Rejection
      return next
    })

    session.recordTrial({
      timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif4_nback_${nLevel}`, nLevel, color: sequence[idx], isTarget, response: saysMatch },
    })

    if (correct) audioEngine.playCorrect(); else audioEngine.playIncorrect()
    setFeedback(correct ? 'correct' : 'wrong')
    forceRender(v => v + 1)
    const t = setTimeout(() => setFeedback(null), 300)
    timersRef.current.push(t)
  }

  // Tur sonu ekranı
  if (idx >= sequence.length && sequence.length > 0) {
    const { hits, misses, falseAlarms, correctRejections } = scores
    const total = hits + misses + falseAlarms + correctRejections
    const hitRate = (hits + misses) > 0 ? hits / (hits + misses) : 0
    const faRate = (falseAlarms + correctRejections) > 0 ? falseAlarms / (falseAlarms + correctRejections) : 0
    // d-prime approx (Z-transform)
    const z = (p: number) => {
      const clipped = Math.max(0.01, Math.min(0.99, p))
      // Beasley-Springer-Moro approximation (basit)
      const t = Math.sqrt(Math.log(1 / Math.pow(clipped < 0.5 ? clipped : 1 - clipped, 2)))
      const num = 2.515517 + 0.802853 * t + 0.010328 * t * t
      const den = 1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t
      const zVal = t - num / den
      return clipped < 0.5 ? -zVal : zVal
    }
    const dPrime = z(hitRate) - z(faRate)

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <motion.span className="text-6xl" initial={{ scale: 0 }} animate={{ scale: 1 }}>📡</motion.span>
        <p className="text-xl font-bold text-white">Radar Turu Tamamlandı!</p>
        <div className="grid grid-cols-2 gap-2 text-center max-w-xs">
          <div className="px-3 py-2 rounded-lg bg-green-500/10"><span className="text-lg font-black text-green-300">{hits}</span><span className="text-[10px] text-green-300/60 block">Hit</span></div>
          <div className="px-3 py-2 rounded-lg bg-blue-500/10"><span className="text-lg font-black text-blue-300">{correctRejections}</span><span className="text-[10px] text-blue-300/60 block">Doğru Red</span></div>
          <div className="px-3 py-2 rounded-lg bg-orange-500/10"><span className="text-lg font-black text-orange-300">{misses}</span><span className="text-[10px] text-orange-300/60 block">Miss</span></div>
          <div className="px-3 py-2 rounded-lg bg-red-500/10"><span className="text-lg font-black text-red-300">{falseAlarms}</span><span className="text-[10px] text-red-300/60 block">Yanlış Alarm</span></div>
        </div>
        <div className="flex gap-3 items-center">
          <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-bold">Seviye: {nLevel}-back</span>
          <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs font-bold">d': {dPrime.toFixed(2)}</span>
        </div>
        <p className="text-xs text-white/40">Toplam: {total} deneme</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 rounded-xl bg-green-500/15 text-green-300 font-bold text-sm border border-green-500/20"
          onClick={() => setRound(r => r + 1)}>Sonraki Tur 🚀</motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-sm justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.15)' }}>📡 {nLevel}-back</span>
        <span className="text-xs text-white/30">{Math.min(idx + 1, sequence.length)}/{sequence.length} · ✅{scores.hits} ❌{scores.falseAlarms}</span>
      </div>

      <motion.div className="w-40 h-40 rounded-3xl flex items-center justify-center relative"
        style={{
          background: showItem ? COLORS[sequence[idx] || 0] + '15' : 'rgba(255,255,255,0.03)',
          border: `3px solid ${showItem ? COLORS[sequence[idx] || 0] + '50' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: showItem ? `0 0 40px ${COLORS[sequence[idx] || 0]}20, inset 0 0 40px ${COLORS[sequence[idx] || 0]}10` : 'none',
          transition: 'all 0.3s',
        }}>
        {showItem && sequence[idx] !== undefined && (
          <motion.div className="w-24 h-24 rounded-full"
            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            style={{
              background: `radial-gradient(circle at 35% 35%, white, ${COLORS[sequence[idx]]}ee, ${COLORS[sequence[idx]]}88)`,
              boxShadow: `0 0 30px ${COLORS[sequence[idx]]}60, 0 0 60px ${COLORS[sequence[idx]]}20, inset 0 -2px 6px rgba(0,0,0,0.2)`,
            }} />
        )}
        {/* Radar sweep */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <motion.div className="absolute top-1/2 left-1/2 w-full h-0.5 origin-left"
            style={{ background: 'rgba(139,92,246,0.18)', transform: 'translateY(-50%)' }}
            animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
        </div>
      </motion.div>

      <p className="text-xs text-white/40">{nLevel} adım öncekiyle aynı renk mi?</p>

      {showItem && idx >= nLevel && (
        <div className="flex gap-4">
          <motion.button className="px-8 py-3.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
            whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={() => respond(true)}>✅ Aynı!</motion.button>
          <motion.button className="px-8 py-3.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}
            whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={() => respond(false)}>❌ Farklı</motion.button>
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            {feedback === 'correct' ? <StarSVG size={48} filled glowing /> : <span className="text-4xl">💨</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
