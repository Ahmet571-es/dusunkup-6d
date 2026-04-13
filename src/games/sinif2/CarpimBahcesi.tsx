import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type MultMode = 'repeated_add' | 'array' | 'word_problem'

interface MultProblem { a: number; b: number; answer: number; mode: MultMode; text?: string }

function generate(mode: MultMode, diff: Record<string, number>): MultProblem {
  const maxF = Math.min(9, 2 + (diff.factor_range || 0))
  const a = 2 + Math.floor(Math.random() * (maxF - 1))
  const b = 2 + Math.floor(Math.random() * (maxF - 1))
  const texts = [
    `${a} tabakta ${b}'şer çilek var. Toplam kaç çilek?`,
    `Her gün ${b} sayfa okuyan ${a} gün sonra kaç sayfa okumuş olur?`,
    `${a} sırada ${b}'şer öğrenci oturuyor. Kaç öğrenci var?`,
  ]
  return { a, b, answer: a * b, mode, text: mode === 'word_problem' ? texts[Math.floor(Math.random()*texts.length)] : undefined }
}

export default function CarpimBahcesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState<MultProblem | null>(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const modes: MultMode[] = ['repeated_add', 'array', 'word_problem']

  useEffect(() => {
    setProblem(generate(modes[round % 3], state.difficultyAxes))
    setInput(''); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleSubmit = () => {
    if (!problem || feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const correct = val === problem.answer
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now()-stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif2_carpma_${problem.a}x${problem.b}`, mode: problem.mode, a: problem.a, b: problem.b } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r+1) }, correct ? 1000 : 800)
  }

  if (!problem) return null
  const modeLabel = { repeated_add: '🔄 Tekrarlı Toplama', array: '🔲 Dizi/Matris', word_problem: '📖 Problem' }[problem.mode]

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(234,179,8,0.1)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.15)' }}>{modeLabel}</span>
      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {problem.mode === 'repeated_add' && (
          <div className="flex justify-center gap-2 mb-3 flex-wrap">
            {Array.from({length: problem.a}, (_, g) => (
              <div key={g} className="flex gap-0.5 px-2 py-1 rounded-lg" style={{background:'rgba(234,179,8,0.08)', border:'1px solid rgba(234,179,8,0.1)'}}>
                {Array.from({length: problem.b}, (_, i) => <span key={i} className="text-sm">🌻</span>)}
              </div>
            ))}
          </div>
        )}
        {problem.mode === 'array' && (
          <div className="flex flex-col items-center gap-1 mb-3">
            {Array.from({length: problem.a}, (_, r) => (
              <div key={r} className="flex gap-1">
                {Array.from({length: problem.b}, (_, c) => (
                  <div key={c} className="w-5 h-5 rounded-sm" style={{background:'rgba(234,179,8,0.3)', border:'1px solid rgba(234,179,8,0.2)'}} />
                ))}
              </div>
            ))}
            <span className="text-[10px] text-white/30 mt-1">{problem.a} satır × {problem.b} sütun</span>
          </div>
        )}
        {problem.text && <p className="text-sm text-white/70 text-center mb-3">{problem.text}</p>}
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-black text-white">{problem.a}</span>
          <span className="text-3xl text-white/40">×</span>
          <span className="text-4xl font-black text-white">{problem.b}</span>
          <span className="text-3xl text-white/40">=</span>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black" style={{border:`2.5px ${input?'solid':'dashed'} rgba(251,191,36,0.4)`, color:'#FDE68A'}}>{input || '?'}</div>
        </div>
      </div>
      <div className="flex gap-1.5 justify-center flex-wrap" style={{maxWidth:340}}>
        {[1,2,3,4,5,6,7,8,9,0].map(n=><motion.button key={n} disabled={!!feedback} className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30" style={{background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.08)'}} whileTap={{scale:0.92}} onClick={()=>!feedback&&input.length<2&&setInput(v=>v+n)}>{n}</motion.button>)}
        <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold" style={{background:'rgba(239,68,68,0.1)',color:'#FCA5A5'}} onClick={()=>setInput('')}>Sil</motion.button>
        <motion.button disabled={!!feedback||!input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30" style={{background:'rgba(52,211,153,0.12)',color:'#6EE7B7'}} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>
      <AnimatePresence>{feedback&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'🌟':'💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
