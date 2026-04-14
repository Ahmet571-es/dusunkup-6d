/**
 * Ondalık Okyanus — Kesir-Ondalık Köprüsü + Basamak Değeri
 * 5 Mod: Kesir→Ondalık → Basamak Değeri → Karşılaştırma → Toplama → Sayı Doğrusu
 * Görsel: Ondalık sayı doğrusu, basamak tablosu
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FishSVG, StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type DecMode = 'convert' | 'place_value' | 'compare' | 'add' | 'number_line'

const FRAC_MAP = [
  { frac: '1/2', dec: 0.5 }, { frac: '1/4', dec: 0.25 }, { frac: '3/4', dec: 0.75 },
  { frac: '1/5', dec: 0.2 }, { frac: '2/5', dec: 0.4 }, { frac: '3/5', dec: 0.6 },
  { frac: '4/5', dec: 0.8 }, { frac: '1/10', dec: 0.1 }, { frac: '3/10', dec: 0.3 },
  { frac: '7/10', dec: 0.7 }, { frac: '9/10', dec: 0.9 }, { frac: '1/8', dec: 0.125 },
]

function NumberLineSVG({ target, width = 300 }: { target: number; width?: number }) {
  const x = (target) * (width - 20) + 10
  return (
    <svg width={width} height={50}>
      <line x1="10" y1="25" x2={width - 10} y2="25" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      {Array.from({ length: 11 }, (_, i) => {
        const px = 10 + (i / 10) * (width - 20)
        return <g key={i}>
          <line x1={px} y1="18" x2={px} y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth={i % 5 === 0 ? 2 : 1} />
          {(i === 0 || i === 5 || i === 10) && <text x={px} y="44" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold">{(i / 10).toFixed(1)}</text>}
        </g>
      })}
      <circle cx={x} cy="25" r="6" fill="#EAB308" stroke="#FDE68A" strokeWidth="2">
        <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function PlaceValueTable({ num }: { num: number }) {
  const str = num.toFixed(3)
  const parts = str.split('.')
  const whole = parts[0] || '0'
  const decimal = parts[1] || '000'
  return (
    <div className="flex justify-center gap-0.5">
      {whole.split('').map((d, i) => (
        <div key={`w${i}`} className="w-10 h-12 rounded-lg flex flex-col items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <span className="text-[8px] text-blue-300/50">birler</span>
          <span className="text-lg font-black text-blue-300">{d}</span>
        </div>
      ))}
      <div className="w-4 h-12 flex items-center justify-center"><span className="text-xl font-black text-white/30">.</span></div>
      {decimal.split('').map((d, i) => {
        const labels = ['onda bir', 'yüzde bir', 'binde bir']
        const colors = ['#22C55E', '#A855F7', '#F97316']
        return (
          <div key={`d${i}`} className="w-10 h-12 rounded-lg flex flex-col items-center justify-center" style={{ background: `${colors[i]}10`, border: `1px solid ${colors[i]}25` }}>
            <span className="text-[7px]" style={{ color: `${colors[i]}80` }}>{labels[i]}</span>
            <span className="text-lg font-black" style={{ color: colors[i] }}>{d}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function OndalikOkyanus({ session, state }: { session: SessionManager; state: SessionState }) {
  const [mode, setMode] = useState<DecMode>('convert')
  const [question, setQuestion] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [targetNum, setTargetNum] = useState(0.5)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: DecMode[] = ['convert', 'place_value', 'compare', 'add', 'number_line']
    const m = modes[Math.floor(round / 2) % modes.length]; setMode(m)

    if (m === 'convert') {
      const entry = FRAC_MAP[Math.floor(Math.random() * FRAC_MAP.length)]
      const toDecimal = Math.random() > 0.5
      if (toDecimal) {
        setQuestion(`${entry.frac} = ?`)
        const correct = String(entry.dec)
        const wrongs = FRAC_MAP.filter(e => e.dec !== entry.dec).sort(() => Math.random() - 0.5).slice(0, 3).map(e => String(e.dec))
        const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5)
        setOptions(opts); setCorrectAnswer(correct)
      } else {
        setQuestion(`${entry.dec} = ?`)
        const correct = entry.frac
        const wrongs = FRAC_MAP.filter(e => e.frac !== entry.frac).sort(() => Math.random() - 0.5).slice(0, 3).map(e => e.frac)
        const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5)
        setOptions(opts); setCorrectAnswer(correct)
      }
      setTargetNum(entry.dec)
    } else if (m === 'place_value') {
      const num = Math.floor(Math.random() * 900 + 100) / 100
      setTargetNum(num)
      const positions = [
        { name: 'birler', idx: 0 }, { name: 'onda birler', idx: 2 }, { name: 'yüzde birler', idx: 3 },
      ]
      const pos = positions[Math.floor(Math.random() * positions.length)]
      const str = num.toFixed(2).replace('.', '')
      const correct = str[pos.idx] || '0'
      setQuestion(`${num.toFixed(2)} sayısında ${pos.name} basamağındaki rakam?`)
      const opts = [...new Set([correct, ...['0','1','2','3','4','5','6','7','8','9'].filter(d => d !== correct).sort(() => Math.random() - 0.5).slice(0, 3)])].sort(() => Math.random() - 0.5).slice(0, 4)
      if (!opts.includes(correct)) opts[0] = correct
      setOptions(opts); setCorrectAnswer(correct)
    } else if (m === 'compare') {
      const a = Math.floor(Math.random() * 90 + 10) / 100
      let b = Math.floor(Math.random() * 90 + 10) / 100
      while (b === a) b = Math.floor(Math.random() * 90 + 10) / 100
      setQuestion(`Hangisi büyük: ${a.toFixed(2)} mi, ${b.toFixed(2)} mi?`)
      const correct = a > b ? a.toFixed(2) : b.toFixed(2)
      setOptions([a.toFixed(2), b.toFixed(2)]); setCorrectAnswer(correct)
      setTargetNum(Math.max(a, b))
    } else if (m === 'add') {
      const a = Math.floor(Math.random() * 5 + 1) / 10
      const b = Math.floor(Math.random() * 5 + 1) / 10
      const sum = parseFloat((a + b).toFixed(1))
      setQuestion(`${a.toFixed(1)} + ${b.toFixed(1)} = ?`)
      const correct = sum.toFixed(1)
      const wrongs = [(sum + 0.1).toFixed(1), (sum - 0.1).toFixed(1), (sum + 0.2).toFixed(1)].filter(w => parseFloat(w) >= 0 && w !== correct)
      const opts = [correct, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5)
      setOptions(opts); setCorrectAnswer(correct); setTargetNum(sum)
    } else { // number_line
      const entry = FRAC_MAP.filter(e => e.dec <= 1 && e.dec >= 0.1)[Math.floor(Math.random() * 8)]
      setTargetNum(entry.dec)
      setQuestion(`${entry.dec} sayı doğrusunda nerede?`)
      const correct = entry.dec.toFixed(1)
      const wrongs = [(entry.dec + 0.1).toFixed(1), (entry.dec - 0.1).toFixed(1), (entry.dec + 0.2).toFixed(1)].filter(w => parseFloat(w) >= 0 && parseFloat(w) <= 1)
      const opts = [correct, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5)
      setOptions(opts); setCorrectAnswer(correct)
    }
    setFeedback(null); setShowHint(false); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (ans: string) => {
    if (feedback) return; const correct = ans === correctAnswer
    if (correct) setStreak(s => s + 1); else setStreak(0)
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif4_ondalik_${mode}`, mode, streak, hintUsed: showHint } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  const modeLabels: Record<DecMode, string> = { convert: '🔄 Dönüştür', place_value: '📍 Basamak Değeri', compare: '⚖️ Karşılaştır', add: '➕ Toplama', number_line: '📏 Sayı Doğrusu' }
  const hints: Record<DecMode, string> = { convert: 'Payı paydaya böl: 1÷4 = 0.25', place_value: 'Noktanın solu: birler. Sağı: onda bir, yüzde bir...', compare: 'Önce onda birler basamağını karşılaştır', add: 'Noktaları alt alta getir, sonra topla', number_line: '0 ile 1 arası 10 eşit parçaya bölünmüş' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.15)' }}>🌊 {modeLabels[mode]}</span>
        {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
      </div>

      <div className="w-full max-w-lg rounded-2xl p-4" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(6,182,212,0.08)' }}>
        {/* Visual: place value table */}
        {mode === 'place_value' && <div className="mb-3"><PlaceValueTable num={targetNum} /></div>}

        {/* Visual: number line */}
        {(mode === 'number_line' || mode === 'compare') && <div className="flex justify-center mb-3"><NumberLineSVG target={targetNum} /></div>}

        {/* Question */}
        <p className="text-xl font-black text-white text-center mb-2">{question}</p>

        {/* Hint */}
        {!showHint && !feedback && <button onClick={() => setShowHint(true)} className="block mx-auto text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
        {showHint && <p className="text-xs text-blue-300/50 text-center mt-1">💡 {hints[mode]}</p>}
      </div>

      {/* Options */}
      <div className="flex gap-2 flex-wrap justify-center">
        {options.map((opt, i) => (
          <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(opt)}>{opt}</motion.button>
        ))}
      </div>

      {feedback === 'wrong' && <p className="text-xs text-orange-300">Doğru: {correctAnswer}</p>}
      <AnimatePresence>{feedback === 'correct' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}><StarSVG size={56} filled glowing /></motion.div>}</AnimatePresence>
    </div>
  )
}
