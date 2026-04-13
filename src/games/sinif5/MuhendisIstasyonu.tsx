/**
 * Mühendis İstasyonu — Mühendislik Tasarım Döngüsü
 * 4 Faz: Problem Tanımlama → Tasarım → Test → İyileştirme
 * Çok adımlı, çok değişkenli gerçek dünya problemleri
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const PROBLEMS = [
  { text: 'Bir köprü 120 metre uzunluğunda. Her 15 metrede bir destek direği gerekiyor. Başlangıç ve bitiş dahil kaç direk lazım?', answer: 9, steps: ['120 ÷ 15 = 8 aralık', '8 + 1 = 9 direk (uçlar dahil)'], hint: 'Aralık sayısı ≠ direk sayısı! Çit problemi: direk = aralık + 1', emoji: '🌉', keywords: ['120 m', '15 m aralık', 'uçlar dahil'] },
  { text: 'Fabrikada saatte 45 ürün üretiliyor. 8 saatlik vardiyada 30 ürün bozuk çıktı. Kaç sağlam ürün üretildi?', answer: 330, steps: ['45 × 8 = 360 toplam', '360 - 30 = 330 sağlam'], hint: 'Önce toplam üretimi bul, sonra bozukları çıkar', emoji: '🏭', keywords: ['45 ürün/saat', '8 saat', '30 bozuk'] },
  { text: 'Havuzun hacmi 2000 litre. Musluk saatte 250 litre dolduruyor. Havuz 3/4 dolu. Tamamen dolması kaç saat sürer?', answer: 2, steps: ['2000 × 1/4 = 500 litre boş', '500 ÷ 250 = 2 saat'], hint: '3/4 dolu → 1/4 boş kalmış', emoji: '🏊', keywords: ['2000 L', '250 L/saat', '3/4 dolu'] },
  { text: 'Bir bina 12 katlı. Her katta 4 daire var. Her dairede ortalama 3 kişi yaşıyor. Binada yaklaşık kaç kişi yaşıyor?', answer: 144, steps: ['12 × 4 = 48 daire', '48 × 3 = 144 kişi'], hint: 'Kat × daire × kişi = toplam', emoji: '🏢', keywords: ['12 kat', '4 daire/kat', '3 kişi/daire'] },
  { text: 'Okul bahçesine kare şeklinde 5×5 fidan dikiliyor. Fidanlar arası 2 metre. Bahçenin bir kenarı kaç metre?', answer: 8, steps: ['5 fidan → 4 aralık', '4 × 2 = 8 metre'], hint: '5 fidan arası 4 boşluk vardır (çit problemi)', emoji: '🌳', keywords: ['5×5', '2 m aralık'] },
  { text: 'Güneş paneli günde 6 kWh üretiyor. Ev günde 2 kWh tüketiyor. 30 günde kaç kWh birikir?', answer: 120, steps: ['6 - 2 = 4 kWh/gün fazla', '4 × 30 = 120 kWh'], hint: 'Önce günlük fazlayı bul', emoji: '☀️', keywords: ['6 kWh üretim', '2 kWh tüketim', '30 gün'] },
]

export default function MuhendisIstasyonu({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState(PROBLEMS[0])
  const [phase, setPhase] = useState<'read' | 'plan' | 'solve' | 'review'>('read')
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showSteps, setShowSteps] = useState(false); const [showHint, setShowHint] = useState(false)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())
  const timersRef = useRef<number[]>([])
  useEffect(() => { return () => { timersRef.current.forEach(t => clearTimeout(t)) } }, [])
  const safeTimeout = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms) as unknown as number; timersRef.current.push(t); return t }

  useEffect(() => {
    setProblem(PROBLEMS[round % PROBLEMS.length])
    setPhase('read'); setInput(''); setFeedback(null); setShowSteps(false); setShowHint(false)
    stimRef.current = Date.now()
    safeTimeout(() => setPhase('plan'), 4000)
    safeTimeout(() => setPhase('solve'), 7000)
  }, [round])

  const handleSubmit = () => {
    if (feedback) return; const val = parseInt(input); if (isNaN(val)) return
    const correct = val === problem.answer
    if (!correct) setShowSteps(true)
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif5_muhendis', multiStep: true, hintUsed: showHint } })
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) { setPhase('review'); safeTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 1500) }
    else { safeTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 2500) }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}>
          {problem.emoji} Mühendislik Problemi
        </span>
        <div className="flex gap-1">
          {['read', 'plan', 'solve', 'review'].map((p, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all" style={{ background: phase === p ? '#FCA5A5' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm text-white/80 leading-relaxed mb-3">{problem.text}</p>

        {(phase === 'plan' || phase === 'solve' || phase === 'review') && (
          <div className="flex gap-2 flex-wrap mb-3">
            {problem.keywords.map((kw, i) => (
              <motion.span key={i} className="px-2 py-1 rounded-md text-xs font-bold" style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                📌 {kw}
              </motion.span>
            ))}
          </div>
        )}

        {showSteps && (
          <motion.div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {problem.steps.map((s, i) => <p key={i} className="text-xs text-orange-300 font-bold">Adım {i + 1}: {s}</p>)}
            <p className="text-sm font-black text-orange-300 mt-1">Cevap: {problem.answer}</p>
          </motion.div>
        )}

        {phase === 'review' && feedback === 'correct' && (
          <motion.div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(52,211,153,0.08)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {problem.steps.map((s, i) => <p key={i} className="text-xs text-green-300">✅ {s}</p>)}
          </motion.div>
        )}
      </div>

      {phase === 'solve' && (
        <>
          {!showHint && <button onClick={() => setShowHint(true)} className="text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
          {showHint && <p className="text-xs text-blue-300/50">💡 {problem.hint}</p>}
          <div className="flex items-center gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={4} placeholder="?" className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none" />
            <motion.button disabled={!input || !!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Gönder ✓</motion.button>
          </div>
        </>
      )}

      {phase === 'read' && <p className="text-xs text-yellow-300/40 animate-pulse">📖 Problemi dikkatle oku...</p>}
      {phase === 'plan' && <p className="text-xs text-red-300/40 animate-pulse">📌 Önemli bilgileri tespit et...</p>}

      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
