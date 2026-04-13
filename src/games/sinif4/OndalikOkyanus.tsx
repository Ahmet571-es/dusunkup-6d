/**
 * Ondalık Okyanus — Kesir↔Ondalık Köprüsü
 * 4 Mod: Kesir→Ondalık dönüşüm, Basamak değeri, Karşılaştırma, İşlemler
 * Görsel: Sayı doğrusu üzerinde ondalık yerleştirme
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type DecMode = 'convert' | 'place_value' | 'compare' | 'operation'
const CONVERSIONS = [
  { frac: '1/2', dec: '0.5' }, { frac: '1/4', dec: '0.25' }, { frac: '3/4', dec: '0.75' },
  { frac: '1/5', dec: '0.2' }, { frac: '2/5', dec: '0.4' }, { frac: '3/5', dec: '0.6' },
  { frac: '1/10', dec: '0.1' }, { frac: '3/10', dec: '0.3' }, { frac: '7/10', dec: '0.7' }, { frac: '9/10', dec: '0.9' },
]

export default function OndalikOkyanus({ session, state }: { session: SessionManager; state: SessionState }) {
  const [mode, setMode] = useState<DecMode>('convert')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: DecMode[] = ['convert', 'place_value', 'compare', 'operation']
    const m = modes[Math.floor(round / 3) % modes.length]; setMode(m)

    if (m === 'convert') {
      const c = CONVERSIONS[Math.floor(Math.random() * CONVERSIONS.length)]
      const dir = Math.random() > 0.5
      setQuestion(dir ? `${c.frac} = ?` : `${c.dec} kesir olarak?`)
      const correct = dir ? c.dec : c.frac
      const wrongs = CONVERSIONS.filter(x => (dir ? x.dec : x.frac) !== correct).sort(() => Math.random() - 0.5).slice(0, 3).map(x => dir ? x.dec : x.frac)
      const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5)
      if (!opts.includes(correct)) opts[0] = correct
      setOptions(opts); setCorrectIdx(opts.indexOf(correct))
    } else if (m === 'place_value') {
      const num = (Math.floor(Math.random() * 900) + 100) / 100
      const digit = Math.floor(Math.random() * 3)
      const positions = ['birler', 'onda birler', 'yüzde birler']
      setQuestion(`${num.toFixed(2)} sayısında ${positions[digit]} basamağı?`)
      const numStr = num.toFixed(2).replace('.', '')
      const correct = numStr[digit]
      const wrongs = ['0','1','2','3','4','5','6','7','8','9'].filter(d => d !== correct).sort(() => Math.random() - 0.5).slice(0, 3)
      const opts = [correct, ...wrongs].sort(() => Math.random() - 0.5)
      if (!opts.includes(correct)) opts[0] = correct
      setOptions(opts); setCorrectIdx(opts.indexOf(correct))
    } else if (m === 'compare') {
      const a = (Math.floor(Math.random() * 90) + 10) / 100
      const b = (Math.floor(Math.random() * 90) + 10) / 100
      if (a === b) { setQuestion(`${a.toFixed(2)} ile ${(a + 0.1).toFixed(2)}`); setOptions([`${a.toFixed(2)} büyük`, `${(a + 0.1).toFixed(2)} büyük`, 'Eşit']); setCorrectIdx(1) }
      else { setQuestion(`${a.toFixed(2)} ile ${b.toFixed(2)}`); setOptions([`${a.toFixed(2)} büyük`, `${b.toFixed(2)} büyük`, 'Eşit']); setCorrectIdx(a > b ? 0 : 1) }
    } else {
      const a = Math.floor(Math.random() * 5 + 1) / 10
      const b = Math.floor(Math.random() * 5 + 1) / 10
      const op = Math.random() > 0.5 ? '+' : '-'
      const ans = op === '+' ? (a + b).toFixed(1) : (Math.abs(a - b)).toFixed(1)
      setQuestion(`${Math.max(a, b).toFixed(1)} ${op} ${Math.min(a, b).toFixed(1)} = ?`)
      const wrongs = [parseFloat(ans) + 0.1, parseFloat(ans) - 0.1, parseFloat(ans) + 0.2].filter(n => n >= 0).map(n => n.toFixed(1))
      const opts = [ans, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5)
      setOptions([...new Set(opts)].slice(0, 4)); setCorrectIdx([...new Set(opts)].slice(0, 4).indexOf(ans))
    }
    setFeedback(null); setShowHint(false); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (idx: number) => {
    if (feedback) return; const correct = idx === correctIdx
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif4_ondalik_${mode}`, mode } })
    setFeedback(correct ? 'correct' : 'wrong'); setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  const modeLabels: Record<DecMode, string> = { convert: '🔄 Dönüştür', place_value: '📍 Basamak Değeri', compare: '⚖️ Karşılaştır', operation: '➕ İşlem' }
  const hints: Record<DecMode, string> = { convert: '1/4 = 25/100 = 0.25 (payı 100\'e çevir)', place_value: 'Noktanın solu birler, sağı onda birler', compare: 'Aynı basamaktan başlayarak karşılaştır', operation: 'Noktaları alt alta getir, sonra topla' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.15)' }}>🌊 {modeLabels[mode]}</span>
      <div className="w-full max-w-lg rounded-2xl p-5 text-center" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-2xl font-black text-white mb-4">{question}</p>
        {!showHint && <button onClick={() => setShowHint(true)} className="text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
        {showHint && <p className="text-xs text-blue-300/50 mt-1">💡 {hints[mode]}</p>}
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
