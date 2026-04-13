import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

function generateCode():{sequence:number[],rule:string,next:number,options:number[]} {
  const patterns = [
    {gen:(i:number)=>i*2+2, rule:'×2 artış', len:5},
    {gen:(i:number)=>i*3, rule:'×3 katları', len:5},
    {gen:(i:number)=>i*i, rule:'Kare sayılar', len:5},
    {gen:(i:number)=>(i+1)*5, rule:'+5 artış', len:5},
    {gen:(i:number)=>1+i*3, rule:'+3 artış', len:5},
    {gen:(i:number)=>Math.pow(2,i), rule:'2 üsleri', len:5},
  ]
  const p = patterns[Math.floor(Math.random()*patterns.length)]
  const seq = Array.from({length:p.len},(_,i)=>p.gen(i))
  const next = p.gen(p.len)
  const opts = [next, next+1, next-1, next+2].sort(()=>Math.random()-0.5)
  return {sequence:seq, rule:p.rule, next, options:opts}
}

export default function KodKirici({ session, state }: { session: SessionManager; state: SessionState }) {
  const [code, setCode] = useState(generateCode())
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [showRule, setShowRule] = useState(false)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => { setCode(generateCode()); setFeedback(null); setShowRule(false); stimRef.current=Date.now() },[round])

  const handleAnswer = (val:number) => {
    if(feedback) return; const correct=val===code.next
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif4_kod',rule:code.rule}})
    if(!correct) setShowRule(true)
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?900:1500)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(234,179,8,0.1)',color:'#FDE047'}}>🔐 Şifreyi çöz! Sıradaki sayı ne?</span>
      <div className="flex items-center gap-3">
        {code.sequence.map((n,i)=><motion.div key={i} className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}>{n}</motion.div>)}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{border:'2.5px dashed rgba(251,191,36,0.4)',color:'#FDE68A'}}>?</div>
      </div>
      {showRule&&<p className="text-xs text-blue-300/60">Kural: {code.rule}</p>}
      <div className="flex gap-3">{code.options.map((opt,i)=>(
        <motion.button key={i} className="w-14 h-14 rounded-xl text-xl font-black text-white" style={{background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)'}} whileHover={{scale:1.08}} whileTap={{scale:0.92}} onClick={()=>handleAnswer(opt)}>{opt}</motion.button>
      ))}</div>
      <AnimatePresence>{feedback&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'🌟':'💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
