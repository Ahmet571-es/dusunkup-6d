/**
 * Kesir-Ondalık Köprü — Temsil Dönüştürme
 * 4 Mod: Kesir→Ondalık, Ondalık→Yüzde, Yüzde→Kesir, Karışık Zincir
 * Görsel temsil (pasta grafik), zincir dönüşüm
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type BridgeMode = 'frac_to_dec' | 'dec_to_pct' | 'pct_to_frac' | 'chain'

const CONVERSIONS = [
  { frac: '1/2', dec: '0.5', pct: '%50' }, { frac: '1/4', dec: '0.25', pct: '%25' },
  { frac: '3/4', dec: '0.75', pct: '%75' }, { frac: '1/5', dec: '0.2', pct: '%20' },
  { frac: '2/5', dec: '0.4', pct: '%40' }, { frac: '3/5', dec: '0.6', pct: '%60' },
  { frac: '1/10', dec: '0.1', pct: '%10' }, { frac: '3/10', dec: '0.3', pct: '%30' },
  { frac: '7/10', dec: '0.7', pct: '%70' }, { frac: '1/8', dec: '0.125', pct: '%12.5' },
  { frac: '3/8', dec: '0.375', pct: '%37.5' }, { frac: '1/3', dec: '0.33', pct: '%33' },
]

function PieChart({ percent, size = 80 }: { percent: number; size?: number }) {
  const r = size / 2 - 4; const cx = size / 2; const cy = size / 2
  const angle = (percent / 100) * 360
  const rad = (angle - 90) * Math.PI / 180
  const large = angle > 180 ? 1 : 0
  const x = cx + Math.cos(rad) * r; const y = cy + Math.sin(rad) * r
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{filter: "drop-shadow(0 0 6px rgba(59,130,246,0.2))"}} />
      {percent > 0 && percent < 100 && (
        <path d={`M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${large} 1 ${x},${y} Z`} fill="rgba(59,130,246,0.4)" stroke="rgba(59,130,246,0.6)" strokeWidth="1" />
      )}
      {percent >= 100 && <circle cx={cx} cy={cy} r={r} fill="rgba(59,130,246,0.4)" />}
    </svg>
  )
}

export default function KesirOndalikKopru({ session, state }: { session: SessionManager; state: SessionState }) {
  const [conv, setConv] = useState(CONVERSIONS[0])
  const [mode, setMode] = useState<BridgeMode>('frac_to_dec')
  const [question, setQuestion] = useState(''); const [correctAnswer, setCorrectAnswer] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const c = CONVERSIONS[Math.floor(Math.random() * CONVERSIONS.length)]; setConv(c)
    const modes: BridgeMode[] = ['frac_to_dec', 'dec_to_pct', 'pct_to_frac', 'chain']
    const m = modes[Math.floor(round / 3) % modes.length]; setMode(m)

    let q = '', ans = ''
    const genWrongs = (correct: string, pool: string[]): string[] => {
      const wrongs = pool.filter(p => p !== correct).sort(() => Math.random() - 0.5).slice(0, 3)
      return [correct, ...wrongs].sort(() => Math.random() - 0.5)
    }

    if (m === 'frac_to_dec') { q = `${c.frac} = ?`; ans = c.dec; setOptions(genWrongs(c.dec, CONVERSIONS.map(x => x.dec))) }
    else if (m === 'dec_to_pct') { q = `${c.dec} = ?`; ans = c.pct; setOptions(genWrongs(c.pct, CONVERSIONS.map(x => x.pct))) }
    else if (m === 'pct_to_frac') { q = `${c.pct} = ?`; ans = c.frac; setOptions(genWrongs(c.frac, CONVERSIONS.map(x => x.frac))) }
    else { q = `${c.frac} = ? = ?`; ans = `${c.dec} = ${c.pct}`; setOptions([`${c.dec} = ${c.pct}`, `${c.dec} = %${parseFloat(c.dec) * 10}`, `0.${c.frac.split('/')[0]} = ${c.pct}`, `${c.dec} = %${parseFloat(c.dec) + 0.1}`].sort(() => Math.random() - 0.5)) }

    setQuestion(q); setCorrectAnswer(ans)
    setFeedback(null); setShowHint(false); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (ans: string) => {
    if (feedback) return; const correct = ans === correctAnswer
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif5_kopru_${mode}`, mode, from: question } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  const percent = parseFloat(conv.pct.replace('%', '')) || 0
  const modeLabels: Record<BridgeMode, string> = { frac_to_dec: '🔢 Kesir → Ondalık', dec_to_pct: '📊 Ondalık → Yüzde', pct_to_frac: '🥧 Yüzde → Kesir', chain: '🔗 Zincir Dönüşüm' }
  const hints: Record<BridgeMode, string> = { frac_to_dec: 'Payı paydaya böl: 1÷4 = 0.25', dec_to_pct: 'Ondalığı 100 ile çarp: 0.5 × 100 = %50', pct_to_frac: 'Yüzdeyi 100\'e böl ve sadeleştir', chain: 'Kesir → Ondalık → Yüzde sırasıyla dönüştür' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(234,179,8,0.1)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.15)' }}>🌉 {modeLabels[mode]}</span>

      <div className="w-full max-w-md rounded-2xl p-4 flex flex-col items-center" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <PieChart percent={percent} />
        <div className="flex items-center gap-3 mt-3">
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-300">{conv.frac}</span>
          <span className="text-white/20">=</span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-500/10 text-green-300">{conv.dec}</span>
          <span className="text-white/20">=</span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-300">{conv.pct}</span>
        </div>
      </div>

      <p className="text-lg font-black text-white">{question}</p>

      {!showHint && <button onClick={() => setShowHint(true)} className="text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
      {showHint && <p className="text-xs text-blue-300/50">💡 {hints[mode]}</p>}

      <div className="flex gap-2 flex-wrap justify-center">
        {options.map((opt, i) => (
          <motion.button key={i} className="px-4 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(opt)}>{opt}</motion.button>
        ))}
      </div>

      <AnimatePresence>{feedback && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}><div className="flex justify-center">{feedback === 'correct' ? <StarSVG size={56} filled glowing /> : <span className="text-5xl">💫</span>}</div></motion.div>}</AnimatePresence>
    </div>
  )
}
