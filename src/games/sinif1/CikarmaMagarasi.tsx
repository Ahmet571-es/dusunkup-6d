/**
 * Çıkarma Mağarası — 3 Çıkarma Modeli
 * Take-away (ayırma), Difference (fark), Missing Addend (eksik toplanan)
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type SubMode = 'take_away' | 'difference' | 'missing_addend'

interface SubProblem { a: number; b: number; answer: number; mode: SubMode; text: string }

function generate(mode: SubMode, diff: Record<string, number>): SubProblem {
  const range = Math.min(15, 5 + (diff.minuend_range || 0) * 2)
  const a = 3 + Math.floor(Math.random() * (range - 2))
  const b = 1 + Math.floor(Math.random() * (a - 1))
  const texts = {
    take_away: `Mağarada ${a} yarasa vardı. ${b} tanesi uçup gitti. Kaç yarasa kaldı?`,
    difference: `Sol duvarda ${a}, sağ duvarda ${b} kristal var. Fark kaç?`,
    missing_addend: `${b} + ? = ${a}. Eksik sayı kaç?`,
  }
  return { a, b, answer: a - b, mode, text: texts[mode] }
}

export default function CikarmaMagarasi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState<SubProblem | null>(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const modes: SubMode[] = ['take_away', 'difference', 'missing_addend']

  useEffect(() => {
    const m = modes[round % 3]
    setProblem(generate(m, state.difficultyAxes))
    setInput(''); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleSubmit = () => {
    if (!problem || feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const correct = val === problem.answer
    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif1_cikarma_${problem.mode}`, mode: problem.mode, a: problem.a, b: problem.b },
    })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 1000 : 800)
  }

  if (!problem) return null
  const modeLabel = { take_away: '🦇 Ayırma', difference: '💎 Fark Bulma', missing_addend: '❓ Eksik Sayı' }[problem.mode]

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(249,115,22,0.1)', color: '#FDBA74', border: '1px solid rgba(249,115,22,0.15)' }}>{modeLabel}</span>

      <div className="w-full max-w-lg rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, rgba(30,15,10,0.8), rgba(50,25,15,0.6))', border: '1px solid rgba(249,115,22,0.1)' }}>
        
        {/* Visual: gems/bats for context */}
        {problem.mode === 'take_away' && (
          <div className="flex justify-center gap-1 mb-3 flex-wrap">
            {Array.from({ length: problem.a }, (_, i) => (
              <motion.span key={i} className="text-xl" initial={{ opacity: 1 }}
                animate={{ opacity: i >= problem.a - problem.b ? 0.2 : 1, y: i >= problem.a - problem.b ? -10 : 0 }}
                transition={{ delay: i * 0.05 }}>🦇</motion.span>
            ))}
          </div>
        )}
        {problem.mode === 'difference' && (
          <div className="flex justify-center gap-6 mb-3">
            <div className="flex gap-0.5">{Array.from({length: problem.a}, (_, i) => <span key={i} className="text-lg">💎</span>)}</div>
            <span className="text-white/30 text-xl">vs</span>
            <div className="flex gap-0.5">{Array.from({length: problem.b}, (_, i) => <span key={i} className="text-lg">💎</span>)}</div>
          </div>
        )}

        <p className="text-sm text-white/70 text-center mb-4 leading-relaxed">{problem.text}</p>

        <div className="flex items-center justify-center gap-3">
          {problem.mode === 'missing_addend' ? (
            <>
              <span className="text-3xl font-black text-white">{problem.b}</span>
              <span className="text-2xl text-white/40">+</span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black"
                style={{ border: '2.5px dashed rgba(251,191,36,0.4)', color: '#FDE68A' }}>{input || '?'}</div>
              <span className="text-2xl text-white/40">=</span>
              <span className="text-3xl font-black text-white">{problem.a}</span>
            </>
          ) : (
            <>
              <span className="text-4xl font-black text-white">{problem.a}</span>
              <span className="text-3xl text-white/40">−</span>
              <span className="text-4xl font-black text-white">{problem.b}</span>
              <span className="text-3xl text-white/40">=</span>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black"
                style={{ border: `2.5px ${input?'solid':'dashed'} rgba(251,191,36,0.4)`, color: '#FDE68A' }}>{input || '?'}</div>
            </>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="flex gap-1.5 justify-center flex-wrap" style={{ maxWidth: 340 }}>
        {[1,2,3,4,5,6,7,8,9,0].map(n => (
          <motion.button key={n} disabled={!!feedback} className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => !feedback && input.length < 2 && setInput(v => v + n)}>{n}</motion.button>
        ))}
        <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}
          onClick={() => setInput('')}>Sil</motion.button>
        <motion.button disabled={!!feedback||!input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
          onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>

      <AnimatePresence>
        {feedback && <motion.div initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>
          <span className="text-5xl">{feedback==='correct'?'🌟':'💫'}</span>
        </motion.div>}
      </AnimatePresence>
    </div>
  )
}
