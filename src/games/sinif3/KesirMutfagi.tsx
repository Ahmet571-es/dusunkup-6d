/**
 * Kesir Mutfağı — 4 Model Kesir Öğretimi
 * Alan Modeli (pizza/pasta SVG), Uzunluk Modeli (şerit), Küme Modeli (nesne grubu), Eşdeğerlik
 * Tanıma → Karşılaştırma → Eşdeğer → Toplama
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type FracMode = 'identify' | 'compare' | 'equivalent' | 'add'

function PizzaSVG({ slices, filled, size = 130 }: { slices: number; filled: number; size?: number }) {
  const r = size / 2 - 6; const cx = size / 2; const cy = size / 2
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r + 2} fill="rgba(234,88,12,0.08)" stroke="rgba(234,88,12,0.2)" strokeWidth="1" />
      {Array.from({ length: slices }, (_, i) => {
        const a1 = (i / slices) * Math.PI * 2 - Math.PI / 2
        const a2 = ((i + 1) / slices) * Math.PI * 2 - Math.PI / 2
        const x1 = cx + Math.cos(a1) * r; const y1 = cy + Math.sin(a1) * r
        const x2 = cx + Math.cos(a2) * r; const y2 = cy + Math.sin(a2) * r
        const large = (1 / slices) > 0.5 ? 1 : 0
        const isFilled = i < filled
        return (
          <g key={i}>
            <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
              fill={isFilled ? 'rgba(234,88,12,0.5)' : 'rgba(255,255,255,0.03)'}
              stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            {isFilled && (
              <>
                <circle cx={cx + Math.cos((a1 + a2) / 2) * r * 0.5} cy={cy + Math.sin((a1 + a2) / 2) * r * 0.5} r="3" fill="rgba(239,68,68,0.6)" />
                <circle cx={cx + Math.cos((a1 + a2) / 2) * r * 0.3} cy={cy + Math.sin((a1 + a2) / 2) * r * 0.3 + 5} r="2" fill="rgba(22,163,74,0.5)" />
              </>
            )}
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r="3" fill="rgba(255,255,255,0.1)" />
    </svg>
  )
}

function StripModel({ total, filled, width = 240 }: { total: number; filled: number; width?: number }) {
  const cellW = width / total
  return (
    <div className="flex" style={{ width }}>
      {Array.from({ length: total }, (_, i) => (
        <motion.div key={i} style={{ width: cellW, height: 28 }}
          className={`border border-white/10 ${i < filled ? '' : ''}`}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.05 }}>
          <div className="w-full h-full" style={{ background: i < filled ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.04)' }} />
        </motion.div>
      ))}
    </div>
  )
}

function SetModel({ total, filled }: { total: number; filled: number }) {
  const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🥝']
  return (
    <div className="flex gap-1.5 flex-wrap justify-center">
      {Array.from({ length: total }, (_, i) => (
        <motion.span key={i} className={`text-2xl ${i < filled ? '' : 'grayscale opacity-30'}`}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04 }}>
          {emojis[i % emojis.length]}
        </motion.span>
      ))}
    </div>
  )
}

export default function KesirMutfagi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [num, setNum] = useState(1); const [den, setDen] = useState(4)
  const [num2, setNum2] = useState(1); const [den2, setDen2] = useState(4)
  const [mode, setMode] = useState<FracMode>('identify')
  const [visual, setVisual] = useState<'pizza' | 'strip' | 'set'>('pizza')
  const [options, setOptions] = useState<string[]>([]); const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0); const [showHint, setShowHint] = useState(false)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: FracMode[] = ['identify', 'compare', 'equivalent', 'add']
    const m = modes[Math.floor(round / 4) % modes.length]; setMode(m)
    const visuals: ('pizza' | 'strip' | 'set')[] = ['pizza', 'strip', 'set']
    setVisual(visuals[round % 3])
    const denoms = [2, 3, 4, 5, 6, 8]
    const d = denoms[Math.min(Math.floor(round / 3), denoms.length - 1)]
    const n = 1 + Math.floor(Math.random() * (d - 1))
    setNum(n); setDen(d)

    if (m === 'identify') {
      const correct = `${n}/${d}`
      const wrongs = [`${d}/${n}`, `${n + 1}/${d}`, `${Math.max(1, n - 1)}/${d}`, `${n}/${d + 1}`].filter(w => w !== correct)
      const opts = [correct, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5)
      setOptions(opts); setCorrectIdx(opts.indexOf(correct))
    } else if (m === 'compare') {
      const n2 = n === 1 ? n + 1 : n - 1; setNum2(n2); setDen2(d)
      setOptions([`${n}/${d}`, `${n2}/${d}`]); setCorrectIdx(n > n2 ? 0 : 1)
    } else if (m === 'equivalent') {
      const mult = 2 + Math.floor(Math.random() * 2)
      const correct = `${n * mult}/${d * mult}`
      const wrongs = [`${n + mult}/${d + mult}`, `${n * mult}/${d}`, `${n}/${d * mult}`]
      const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5)
      setOptions(opts); setCorrectIdx(opts.indexOf(correct))
    } else {
      // Simple addition with same denominator
      const n2 = 1 + Math.floor(Math.random() * Math.max(1, d - n - 1)); setNum2(n2); setDen2(d)
      const correct = `${n + n2}/${d}`
      const wrongs = [`${n + n2}/${d * 2}`, `${n + n2 + 1}/${d}`, `${n + n2}/${d + 1}`]
      const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5)
      setOptions(opts); setCorrectIdx(opts.indexOf(correct))
    }
    setFeedback(null); setShowHint(false); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (idx: number) => {
    if (feedback) return; const correct = idx === correctIdx
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif3_kesir_${mode}`, mode, visual, num, den, fraction: `${num}/${den}` } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  const modeLabels: Record<FracMode, string> = { identify: '🔍 Bu kesri tanı!', compare: '⚖️ Hangisi büyük?', equivalent: '🔗 Eşdeğerini bul!', add: '➕ Kesirleri topla!' }
  const hints: Record<FracMode, string> = { identify: 'Pay: boyalı parça sayısı, Payda: toplam parça sayısı', compare: 'Aynı paydada pay büyük olan büyüktür', equivalent: 'Pay ve paydayı aynı sayıyla çarp', add: 'Aynı paydada payları topla, paydayı koru' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(234,88,12,0.1)', color: '#FDBA74', border: '1px solid rgba(234,88,12,0.15)' }}>{modeLabels[mode]}</span>

      <div className="w-full max-w-lg rounded-2xl p-4" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex justify-center gap-6 items-center mb-3">
          {/* First fraction visual */}
          <div className="text-center">
            {visual === 'pizza' && <PizzaSVG slices={den} filled={num} />}
            {visual === 'strip' && <StripModel total={den} filled={num} />}
            {visual === 'set' && <SetModel total={den} filled={num} />}
            <p className="text-lg font-black text-white mt-1">{num}/{den}</p>
          </div>

          {/* Second fraction for compare/add */}
          {(mode === 'compare' || mode === 'add') && (
            <>
              <span className="text-2xl text-white/30">{mode === 'add' ? '+' : 'vs'}</span>
              <div className="text-center">
                {visual === 'pizza' && <PizzaSVG slices={den2} filled={num2} />}
                {visual === 'strip' && <StripModel total={den2} filled={num2} />}
                {visual === 'set' && <SetModel total={den2} filled={num2} />}
                <p className="text-lg font-black text-white mt-1">{num2}/{den2}</p>
              </div>
            </>
          )}
        </div>

        {!showHint && <button onClick={() => setShowHint(true)} className="block mx-auto text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
        {showHint && <p className="text-xs text-blue-300/50 text-center">💡 {hints[mode]}</p>}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {options.map((opt, i) => (
          <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(i)}>{opt}</motion.button>
        ))}
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
