import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type DivMode = 'partitive' | 'quotitive' | 'inverse'

export default function BolmeFabrikasi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [a, setA] = useState(12); const [b, setB] = useState(3)
  const [mode, setMode] = useState<DivMode>('partitive')
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: DivMode[] = ['partitive','quotitive','inverse']
    const m = modes[round%3]; setMode(m)
    const divisor = 2 + Math.floor(Math.random()*4)
    const quotient = 2 + Math.floor(Math.random()*5)
    setA(divisor*quotient); setB(divisor)
    setInput(''); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const answer = a / b
  const texts = { partitive: `${a} elmayı ${b} çocuğa eşit paylaştır. Her birine kaç düşer?`, quotitive: `${a} elmadan ${b}'şerli gruplar yap. Kaç grup olur?`, inverse: `? × ${b} = ${a}. Eksik sayı kaç?` }

  const handleSubmit = () => {
    if (feedback) return; const val = parseInt(input); if (isNaN(val)) return
    const correct = val === answer
    session.recordTrial({ timestamp:Date.now(), trialType:'math', stimulusShownAt:stimRef.current, responseAt:Date.now(), responseTimeMs:Date.now()-stimRef.current, isCorrect:correct, isTarget:true, responded:true, difficultyAxes:state.difficultyAxes, metadata:{skillId:`sinif2_bolme_${mode}`, mode, a, b} })
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)}, correct?1000:800)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(16,185,129,0.1)',color:'#6EE7B7',border:'1px solid rgba(16,185,129,0.15)'}}>
        {mode==='partitive'?'🍎 Paylaştırma':mode==='quotitive'?'📦 Gruplama':'🔄 Ters İşlem'}
      </span>
      <div className="w-full max-w-lg rounded-2xl p-5" style={{background:'rgba(10,15,30,0.7)',border:'1px solid rgba(255,255,255,0.06)'}}>
        {mode !== 'inverse' && <div className="flex justify-center gap-0.5 mb-3 flex-wrap">{Array.from({length:Math.min(a,20)},(_,i)=><span key={i} className="text-lg">🍎</span>)}</div>}
        <p className="text-sm text-white/70 text-center mb-4">{texts[mode]}</p>
        <div className="flex items-center justify-center gap-3">
          {mode==='inverse'?<><div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black" style={{border:'2.5px dashed rgba(251,191,36,0.4)',color:'#FDE68A'}}>{input||'?'}</div><span className="text-2xl text-white/40">×</span><span className="text-3xl font-black text-white">{b}</span><span className="text-2xl text-white/40">=</span><span className="text-3xl font-black text-white">{a}</span></>
          :<><span className="text-4xl font-black text-white">{a}</span><span className="text-3xl text-white/40">÷</span><span className="text-4xl font-black text-white">{b}</span><span className="text-3xl text-white/40">=</span><div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black" style={{border:`2.5px ${input?'solid':'dashed'} rgba(251,191,36,0.4)`,color:'#FDE68A'}}>{input||'?'}</div></>}
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
