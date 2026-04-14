/**
 * Bölme Fabrikası — 3 Bölme Modeli + Ters İşlem
 * Paylaştırma (partitive), Gruplama (quotitive), Kalan, Çarpma-Bölme ilişkisi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type DivMode = 'partitive' | 'quotitive' | 'remainder' | 'inverse'

interface DivProblem { a: number; b: number; answer: number; remainder: number; mode: DivMode; text: string; visual: 'share' | 'group' | 'equation' }

function generate(mode: DivMode, diff: Record<string, number>): DivProblem {
  const range = Math.min(50, 10 + (diff.dividend_range || 0) * 5)
  let a: number, b: number, remainder = 0

  if (mode === 'remainder') {
    b = 2 + Math.floor(Math.random() * 5)
    const quotient = 2 + Math.floor(Math.random() * 5)
    remainder = 1 + Math.floor(Math.random() * (b - 1))
    a = b * quotient + remainder
  } else {
    b = 2 + Math.floor(Math.random() * 5)
    const quotient = 2 + Math.floor(Math.random() * Math.min(8, Math.floor(range / b)))
    a = b * quotient
  }

  const texts: Record<DivMode, string[]> = {
    partitive: [`${a} elmayı ${b} çocuğa eşit paylaştır. Her birine kaç düşer?`, `${a} kalem ${b} masaya eşit dağıtılacak. Her masada kaç kalem?`, `${a} tane bisküvi ${b} tabağa eşit konulacak.`],
    quotitive: [`${a} toptan ${b}'şerli gruplar yap. Kaç grup olur?`, `${a} öğrenci ${b}'erli sıralara oturacak. Kaç sıra gerekir?`],
    remainder: [`${a} elmayı ${b} kişiye eşit paylaştır. Her birine kaç düşer, kaç kalır?`],
    inverse: [`? × ${b} = ${a}. Eksik sayı kaç?`, `${b} × ? = ${a}. Boş kutu kaç?`],
  }
  const textList = texts[mode]
  const answer = mode === 'remainder' ? Math.floor(a / b) : a / b

  return { a, b, answer, remainder, mode, text: textList[Math.floor(Math.random() * textList.length)], visual: mode === 'partitive' ? 'share' : mode === 'quotitive' ? 'group' : 'equation' }
}

export default function BolmeFabrikasi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState<DivProblem | null>(null)
  const [input, setInput] = useState(''); const [remainderInput, setRemainderInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())
  const modes: DivMode[] = ['partitive', 'quotitive', 'inverse', 'remainder']

  useEffect(() => {
    const m = modes[Math.floor(round / 3) % modes.length]
    setProblem(generate(m, state.difficultyAxes))
    setInput(''); setRemainderInput(''); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleSubmit = () => {
    if (!problem || feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    let correct = val === problem.answer
    if (problem.mode === 'remainder') {
      const rem = parseInt(remainderInput)
      correct = correct && rem === problem.remainder
    }

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif2_bolme_${problem.mode}`, mode: problem.mode, a: problem.a, b: problem.b, answer: val },
    })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  if (!problem) return null
  const modeLabels: Record<DivMode, string> = { partitive: '🍎 Paylaştırma', quotitive: '📦 Gruplama', remainder: '🔢 Kalanı Bul', inverse: '🔄 Ters İşlem' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.15)' }}>{modeLabels[problem.mode]}</span>

      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Paylaştırma görseli */}
        {problem.visual === 'share' && (
          <div className="mb-3">
            <div className="flex justify-center gap-1 mb-2 flex-wrap">
              {Array.from({ length: Math.min(problem.a, 24) }, (_, i) => (
                <motion.span key={i} className="text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>🍎</motion.span>
              ))}
              {problem.a > 24 && <span className="text-xs text-white/30">+{problem.a - 24}</span>}
            </div>
            <div className="flex justify-center gap-3">
              {Array.from({ length: Math.min(problem.b, 8) }, (_, i) => (
                <div key={i} className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px dashed rgba(16,185,129,0.3)' }}>👤</div>
              ))}
            </div>
          </div>
        )}

        {/* Gruplama görseli */}
        {problem.visual === 'group' && (
          <div className="flex justify-center gap-2 mb-3 flex-wrap">
            {Array.from({ length: Math.min(Math.ceil(problem.a / problem.b), 10) }, (_, g) => (
              <motion.div key={g} className="flex gap-0.5 px-2 py-1 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: g * 0.1 }}>
                {Array.from({ length: problem.b }, (_, i) => <span key={i} className="text-sm">🍎</span>)}
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-sm text-white/70 text-center mb-4 leading-relaxed">{problem.text}</p>

        {/* Denklem */}
        <div className="flex items-center justify-center gap-3">
          {problem.mode === 'inverse' ? (
            <>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black" style={{ border: '2.5px dashed rgba(251,191,36,0.4)', color: '#FDE68A' }}>{input || '?'}</div>
              <span className="text-2xl text-white/40">×</span>
              <span className="text-3xl font-black text-white">{problem.b}</span>
              <span className="text-2xl text-white/40">=</span>
              <span className="text-3xl font-black text-white">{problem.a}</span>
            </>
          ) : (
            <>
              <span className="text-4xl font-black text-white">{problem.a}</span>
              <span className="text-3xl text-white/40">÷</span>
              <span className="text-4xl font-black text-white">{problem.b}</span>
              <span className="text-3xl text-white/40">=</span>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black" style={{ border: `2.5px ${input ? 'solid' : 'dashed'} rgba(251,191,36,0.4)`, color: '#FDE68A' }}>{input || '?'}</div>
              {problem.mode === 'remainder' && (
                <>
                  <span className="text-sm text-white/30">kalan</span>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-black" style={{ border: '2px dashed rgba(249,115,22,0.4)', color: '#FDBA74' }}>{remainderInput || '?'}</div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="flex gap-1.5 justify-center flex-wrap" style={{ maxWidth: 340 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
          <motion.button key={n} disabled={!!feedback} className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              if (feedback) return
              if (problem?.mode === 'remainder' && input.length > 0) { if (remainderInput.length < 1) setRemainderInput(v => v + n) }
              else { if (input.length < 2) setInput(v => v + n) }
            }}>{n}</motion.button>
        ))}
        <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }} onClick={() => { setInput(''); setRemainderInput('') }}>Sil</motion.button>
        <motion.button disabled={!!feedback || !input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30" style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>

      {feedback === 'wrong' && <span className="text-xs text-orange-300">Doğru: {problem.answer}{problem.mode === 'remainder' ? ` kalan ${problem.remainder}` : ''}</span>}
      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
