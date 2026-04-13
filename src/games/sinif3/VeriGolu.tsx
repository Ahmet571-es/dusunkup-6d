/**
 * Veri Gölü — Grafik Okuma + Tablo Yorumlama
 * 4 Mod: Sıklık Tablosu → Çubuk Grafik → Resim Grafik → Karşılaştırmalı Yorumlama
 * SVG çubuk grafik, gerçek veri seti, çoklu soru tipi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const BAR_COLORS = ['#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EF4444', '#EC4899']
const LABEL_SETS = [
  ['Elma', 'Armut', 'Portakal', 'Muz', 'Çilek'],
  ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'],
  ['Kedi', 'Köpek', 'Kuş', 'Balık', 'Tavşan'],
  ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Mor'],
]

type DataMode = 'max_min' | 'total' | 'difference' | 'more_than'

interface DataQuestion { labels: string[]; values: number[]; question: string; answer: number; options: number[]; mode: DataMode }

function generateQuestion(mode: DataMode): DataQuestion {
  const labels = LABEL_SETS[Math.floor(Math.random() * LABEL_SETS.length)]
  const values = labels.map(() => 1 + Math.floor(Math.random() * 10))
  const sorted = [...values].sort((a, b) => b - a)
  const maxIdx = values.indexOf(sorted[0])
  const minIdx = values.indexOf(sorted[sorted.length - 1])

  if (mode === 'max_min') {
    const askMax = Math.random() > 0.5
    return {
      labels, values, mode,
      question: askMax ? `En çok olan "${labels[maxIdx]}" kaç tane?` : `En az olan "${labels[minIdx]}" kaç tane?`,
      answer: askMax ? sorted[0] : sorted[sorted.length - 1],
      options: genOptions(askMax ? sorted[0] : sorted[sorted.length - 1]),
    }
  } else if (mode === 'total') {
    const total = values.reduce((a, b) => a + b, 0)
    return { labels, values, mode, question: 'Hepsinin toplamı kaç?', answer: total, options: genOptions(total) }
  } else if (mode === 'difference') {
    const i1 = Math.floor(Math.random() * labels.length)
    let i2 = Math.floor(Math.random() * labels.length)
    while (i2 === i1) i2 = Math.floor(Math.random() * labels.length)
    const diff = Math.abs(values[i1] - values[i2])
    return { labels, values, mode, question: `"${labels[i1]}" ile "${labels[i2]}" arasındaki fark kaç?`, answer: diff, options: genOptions(diff) }
  } else {
    const threshold = 3 + Math.floor(Math.random() * 5)
    const count = values.filter(v => v > threshold).length
    return { labels, values, mode, question: `${threshold}'den fazla olan kaç kategori var?`, answer: count, options: genOptions(count) }
  }
}

function genOptions(correct: number): number[] {
  const opts = [correct, correct + 1, Math.max(0, correct - 1), correct + 2].filter(n => n >= 0)
  if (!opts.includes(correct)) opts[0] = correct
  return [...new Set(opts)].sort(() => Math.random() - 0.5).slice(0, 4)
}

function BarChart({ values, labels, colors = BAR_COLORS, height = 130 }: { values: number[]; labels: string[]; colors?: string[]; height?: number }) {
  const max = Math.max(...values, 1)
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 justify-center" style={{ height }}>
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center max-w-[44px]">
            <motion.span className="text-[10px] font-bold text-white/50 mb-1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 + 0.3 }}>
              {v}
            </motion.span>
            <motion.div className="w-full rounded-t-md"
              style={{ background: `linear-gradient(180deg, ${colors[i % colors.length]}dd, ${colors[i % colors.length]}88)`, boxShadow: `inset 0 2px 4px rgba(255,255,255,0.15)` }}
              initial={{ height: 0 }} animate={{ height: `${(v / max) * (height - 35)}px` }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }} />
            <span className="text-[9px] text-white/30 mt-1.5 text-center truncate w-full">{labels[i]}</span>
          </div>
        ))}
      </div>
      {/* Y-axis guide lines */}
      <div className="relative -mt-[calc(100%-10px)] pointer-events-none" style={{ height: height - 30 }}>
        {[0.25, 0.5, 0.75].map((pct, i) => (
          <div key={i} className="absolute w-full border-t border-white/5" style={{ bottom: `${pct * 100}%` }}>
            <span className="absolute -left-6 -top-2 text-[8px] text-white/15">{Math.round(max * pct)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function VeriGolu({ session, state }: { session: SessionManager; state: SessionState }) {
  const [data, setData] = useState<DataQuestion>(generateQuestion('max_min'))
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())
  const modes: DataMode[] = ['max_min', 'total', 'difference', 'more_than']

  useEffect(() => {
    const m = modes[Math.floor(round / 2) % modes.length]
    setData(generateQuestion(m)); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (val: number) => {
    if (feedback) return; const correct = val === data.answer
    if (correct) setStreak(s => s + 1); else setStreak(0)

    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif3_veri_${data.mode}`, mode: data.mode, question: data.question, streak } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  const modeLabels: Record<DataMode, string> = { max_min: '📊 En çok/az', total: '➕ Toplam', difference: '↔️ Fark', more_than: '📈 Koşullu sayma' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-md justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.15)' }}>📊 {modeLabels[data.mode]}</span>
        {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
      </div>

      <div className="w-full max-w-md rounded-2xl p-4" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(6,182,212,0.08)' }}>
        <BarChart values={data.values} labels={data.labels} />
      </div>

      <p className="text-sm font-bold text-green-300 text-center max-w-md">{data.question}</p>

      <div className="flex gap-3">
        {data.options.map((opt, i) => (
          <motion.button key={i} className="w-14 h-14 rounded-xl text-xl font-black text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(opt)}>{opt}</motion.button>
        ))}
      </div>

      {feedback === 'wrong' && <p className="text-xs text-orange-300">Doğru cevap: {data.answer}</p>}
      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
