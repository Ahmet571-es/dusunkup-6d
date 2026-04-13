import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

interface DataQ { labels: string[]; values: number[]; question: string; answer: number; options: number[] }

function generateData(): DataQ {
  const categories = [['Elma','Armut','Portakal','Muz'], ['Pazartesi','Salı','Çarşamba','Perşembe'], ['Kırmızı','Mavi','Yeşil','Sarı']]
  const labels = categories[Math.floor(Math.random() * categories.length)]
  const values = labels.map(() => 1 + Math.floor(Math.random() * 9))
  const qTypes = [
    { q: `En çok olan hangisi? Kaç tane?`, a: Math.max(...values) },
    { q: `En az olan hangisi? Kaç tane?`, a: Math.min(...values) },
    { q: `Toplam kaç?`, a: values.reduce((s, v) => s + v, 0) },
    { q: `${labels[0]} ile ${labels[1]} farkı kaç?`, a: Math.abs(values[0] - values[1]) },
  ]
  const qt = qTypes[Math.floor(Math.random() * qTypes.length)]
  const opts = [qt.a, qt.a + 1, qt.a - 1, qt.a + 2].filter(n => n >= 0).sort(() => Math.random() - 0.5).slice(0, 4)
  if (!opts.includes(qt.a)) opts[0] = qt.a
  return { labels, values, question: qt.q, answer: qt.a, options: opts.sort(() => Math.random() - 0.5) }
}

export default function VeriGolu({ session, state }: { session: SessionManager; state: SessionState }) {
  const [data, setData] = useState<DataQ>(generateData())
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const maxVal = Math.max(...data.values)
  const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308']

  useEffect(() => { setData(generateData()); setFeedback(null); stimRef.current = Date.now() }, [round])

  const handleAnswer = (val: number) => {
    if (feedback) return
    const correct = val === data.answer
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif3_veri', question: data.question } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9' }}>📊 Grafiği oku ve cevapla!</span>
      <div className="w-full max-w-md rounded-xl p-4" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-end gap-3 h-32 mb-2">
          {data.labels.map((l, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-bold text-white/60 mb-1">{data.values[i]}</span>
              <motion.div className="w-full rounded-t" style={{ background: COLORS[i], height: `${(data.values[i] / maxVal) * 100}%`, minHeight: 4 }} initial={{ height: 0 }} animate={{ height: `${(data.values[i] / maxVal) * 100}%` }} transition={{ delay: i * 0.1 }} />
              <span className="text-[9px] text-white/40 mt-1 text-center">{l}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm font-bold text-green-300">{data.question}</p>
      <div className="flex gap-3">
        {data.options.map((opt, i) => (
          <motion.button key={i} className="w-14 h-14 rounded-xl text-xl font-black text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(opt)}>{opt}</motion.button>
        ))}
      </div>
      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
