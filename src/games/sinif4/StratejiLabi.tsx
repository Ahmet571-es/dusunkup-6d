/**
 * Strateji Labı — Polya Problem Çözme Modeli
 * 4 Faz: Anla → Planla → Uygula → Geriye Bak
 * Çok adımlı problemler, adım gösterimi, strateji seçimi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const PROBLEMS = [
  { text: 'Ali 3 paket defter aldı. Her pakette 5 defter var. 2 defteri arkadaşına verdi. Kaç defteri kaldı?', steps: ['3 × 5 = 15 defter', '15 - 2 = 13 defter'], answer: 13, hint: 'Önce toplam defteri bul, sonra verdiğini çıkar', keywords: ['3 paket', '5\'er defter', '2 verdi'] },
  { text: 'Bahçede 4 sıra ağaç var. Her sırada 6 ağaç. 3 ağaç kurudu. Kaç sağlam ağaç var?', steps: ['4 × 6 = 24 ağaç', '24 - 3 = 21 ağaç'], answer: 21, hint: 'Önce toplam ağacı bul', keywords: ['4 sıra', '6\'şar', '3 kurudu'] },
  { text: 'Ayşe 20 TL ile alışverişe gitti. 7 TL ekmek, 5 TL süt aldı. Kaç TL kaldı?', steps: ['7 + 5 = 12 TL harcadı', '20 - 12 = 8 TL kaldı'], answer: 8, hint: 'Önce toplam harcamayı bul', keywords: ['20 TL', '7 TL', '5 TL'] },
  { text: 'Sınıfta 28 öğrenci var. 4 gruba eşit bölündüler. Her gruba 2 öğrenci daha eklendi. Her grupta kaç öğrenci oldu?', steps: ['28 ÷ 4 = 7 kişi/grup', '7 + 2 = 9 kişi/grup'], answer: 9, hint: 'Önce eşit böl, sonra ekle', keywords: ['28 öğrenci', '4 grup', '2 eklendi'] },
  { text: '5 kutuya 8\'er kalem konuldu. 10 kalem bozuktu. Kaç sağlam kalem var?', steps: ['5 × 8 = 40 kalem', '40 - 10 = 30 kalem'], answer: 30, hint: 'Toplam kalemi bul, bozukları çıkar', keywords: ['5 kutu', '8\'er', '10 bozuk'] },
  { text: 'Kitaplıkta 3 rafta 12\'şer kitap var. 1 rafta 8 kitap var. Toplam kaç kitap?', steps: ['3 × 12 = 36 kitap', '36 + 8 = 44 kitap'], answer: 44, hint: 'Eşit rafları çarp, farklı rafı ekle', keywords: ['3 raf', '12\'şer', '1 raf 8'] },
  { text: 'Marketten 4 paket bisküvi aldın. Her pakette 6 bisküvi var. 5 bisküviyi yoldaşıkı yedin. Kaç bisküvi kaldı?', steps: ['4 × 6 = 24 bisküvi', '24 - 5 = 19 bisküvi'], answer: 19, hint: 'Çarp, sonra çıkar', keywords: ['4 paket', '6\'şar', '5 yedin'] },
]

export default function StratejiLabi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState(PROBLEMS[0])
  const [phase, setPhase] = useState<'read' | 'keywords' | 'solve' | 'review'>('read')
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
    // Auto advance: read → keywords → solve
    safeTimeout(() => setPhase('keywords'), 3500)
    safeTimeout(() => setPhase('solve'), 6000)
  }, [round])

  const handleSubmit = () => {
    if (feedback) return; const val = parseInt(input); if (isNaN(val)) return
    const correct = val === problem.answer
    if (!correct) setShowSteps(true)

    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif4_strateji', multiStep: true, hintUsed: showHint, steps: problem.steps.length } })

    if (correct) { setPhase('review'); setFeedback('correct') }
    else { setFeedback('wrong') }
    safeTimeout(() => { setFeedback(null); if (correct) safeTimeout(() => setRound(r => r + 1), 1000); else setRound(r => r + 1) }, correct ? 500 : 2000)
  }

  const phaseLabels = { read: '📖 Problemi Oku', keywords: '🔑 Anahtar Bilgileri Bul', solve: '🧮 Çöz!', review: '✅ Kontrol Et' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(236,72,153,0.1)', color: '#F9A8D4', border: '1px solid rgba(236,72,153,0.15)' }}>🧪 {phaseLabels[phase]}</span>
        <div className="flex gap-1">
          {(['read', 'keywords', 'solve', 'review'] as const).map((p, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: phase === p ? '#F9A8D4' : p === 'review' && feedback !== 'correct' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm text-white/80 leading-relaxed mb-3">{problem.text}</p>

        {/* Keywords phase: highlight important numbers */}
        {(phase === 'keywords' || phase === 'solve' || phase === 'review') && (
          <div className="flex gap-2 flex-wrap mb-3">
            {problem.keywords.map((kw, i) => (
              <motion.span key={i} className="px-2 py-1 rounded-md text-xs font-bold" style={{ background: 'rgba(236,72,153,0.1)', color: '#F9A8D4', border: '1px solid rgba(236,72,153,0.2)' }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}>
                {kw}
              </motion.span>
            ))}
          </div>
        )}

        {/* Steps revealed on wrong answer */}
        {showSteps && (
          <motion.div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] text-orange-300/60 mb-1">Çözüm adımları:</p>
            {problem.steps.map((s, i) => (
              <p key={i} className="text-xs text-orange-300 font-bold">Adım {i + 1}: {s}</p>
            ))}
            <p className="text-sm font-black text-orange-300 mt-1">Cevap: {problem.answer}</p>
          </motion.div>
        )}

        {/* Review: show correct steps */}
        {phase === 'review' && feedback === 'correct' && (
          <motion.div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {problem.steps.map((s, i) => (
              <p key={i} className="text-xs text-green-300">✅ {s}</p>
            ))}
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

      {phase === 'read' && <p className="text-xs text-yellow-300/40 animate-pulse">Dikkatle oku...</p>}
      {phase === 'keywords' && <p className="text-xs text-pink-300/40 animate-pulse">Önemli sayıları bul...</p>}

      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
