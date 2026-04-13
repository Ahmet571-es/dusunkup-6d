/**
 * Veri Bilim Labı — İstatistiksel Düşünme
 * 4 Mod: Ortalama → Medyan → Açıklık → Yanıltıcı Grafik Tespiti
 * Gerçek veri seti üzerinde hesaplama, grafik okuma
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type StatMode = 'mean' | 'median' | 'range' | 'misleading'
const BAR_COLORS = ['#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EF4444', '#EC4899', '#F97316', '#06B6D4']

function BarChart({ values, labels, height = 120 }: { values: number[]; labels: string[]; height?: number }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-2 justify-center" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1 max-w-[40px]">
          <span className="text-[9px] font-bold text-white/50 mb-1">{v}</span>
          <motion.div className="w-full rounded-t" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
            initial={{ height: 0 }} animate={{ height: `${(v / max) * (height - 30)}px` }}
            transition={{ delay: i * 0.08, duration: 0.5 }} />
          <span className="text-[8px] text-white/30 mt-1 text-center truncate w-full">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function genData(mode: StatMode): { values: number[]; labels: string[]; question: string; answer: number; options: number[]; explanation: string } {
  const names = ['Ali', 'Ayşe', 'Batu', 'Defne', 'Efe', 'Nisa', 'Can', 'Ela']
  const count = 5 + Math.floor(Math.random() * 3)
  const labels = names.slice(0, count)
  const values = labels.map(() => Math.floor(Math.random() * 15) + 3)
  const sorted = [...values].sort((a, b) => a - b)
  const sum = values.reduce((a, b) => a + b, 0)
  const mean = Math.round(sum / values.length)
  const median = sorted.length % 2 === 0 ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) : sorted[Math.floor(sorted.length / 2)]
  const range = sorted[sorted.length - 1] - sorted[0]

  const configs: Record<StatMode, { q: string; a: number; exp: string }> = {
    mean: { q: `Bu verilerin ortalaması (aritmetik ortalama) kaç?`, a: mean, exp: `Toplam: ${sum}, Kişi: ${count}, Ortalama: ${sum}÷${count} ≈ ${mean}` },
    median: { q: `Verilerin medyanı (ortanca değer) kaç?`, a: median, exp: `Sıralı: ${sorted.join(', ')} → Ortadaki: ${median}` },
    range: { q: `Verilerin açıklığı (en büyük - en küçük) kaç?`, a: range, exp: `En büyük: ${sorted[sorted.length - 1]}, En küçük: ${sorted[0]}, Açıklık: ${range}` },
    misleading: { q: `Ortalama kaçtır? (Aykırı değere dikkat!)`, a: mean, exp: `Aykırı değer ortalamayı ${mean > median ? 'yükseltiyor' : 'düşürüyor'}. Medyan (${median}) daha temsili olabilir.` },
  }
  if (mode === 'misleading') { values[Math.floor(Math.random() * count)] = 50 + Math.floor(Math.random() * 20) }
  const recalcMean = mode === 'misleading' ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : mean
  const c = mode === 'misleading' ? { ...configs[mode], a: recalcMean } : configs[mode]

  const opts = [c.a, c.a + 1, c.a - 1, c.a + 2].filter(n => n >= 0)
  if (!opts.includes(c.a)) opts[0] = c.a
  return { values, labels, question: c.q, answer: c.a, options: [...new Set(opts)].sort(() => Math.random() - 0.5).slice(0, 4), explanation: c.exp }
}

export default function VeriBilimLabi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [data, setData] = useState(genData('mean'))
  const [mode, setMode] = useState<StatMode>('mean')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: StatMode[] = ['mean', 'median', 'range', 'misleading']
    const m = modes[Math.floor(round / 2) % modes.length]; setMode(m)
    setData(genData(m)); setFeedback(null); setShowExplanation(false); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (val: number) => {
    if (feedback) return; const correct = val === data.answer
    if (!correct) setShowExplanation(true)
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif5_veri_${mode}`, mode, dataSize: data.values.length } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 2000)
  }

  const modeLabels: Record<StatMode, string> = { mean: '📊 Ortalama', median: '📈 Medyan', range: '📏 Açıklık', misleading: '⚠️ Aykırı Değer' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.15)' }}>{modeLabels[mode]}</span>

      <div className="w-full max-w-md rounded-2xl p-4" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <BarChart values={data.values} labels={data.labels} />
        <div className="flex gap-1 mt-2 justify-center flex-wrap">
          {data.values.map((v, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{v}</span>
          ))}
        </div>
      </div>

      <p className="text-sm font-bold text-green-300 text-center">{data.question}</p>

      {showExplanation && <p className="text-xs text-orange-300 text-center max-w-md">💡 {data.explanation}</p>}

      <div className="flex gap-3">
        {data.options.map((opt, i) => (
          <motion.button key={i} className="w-14 h-14 rounded-xl text-xl font-black text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(opt)}>{opt}</motion.button>
        ))}
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
