import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

function genData():{values:number[],question:string,answer:number,options:number[]} {
  const values = Array.from({length:5+Math.floor(Math.random()*3)},()=>Math.floor(Math.random()*20)+1)
  const sorted = [...values].sort((a,b)=>a-b)
  const sum = values.reduce((a,b)=>a+b,0)
  const mean = Math.round(sum/values.length)
  const median = sorted.length%2===0 ? Math.round((sorted[sorted.length/2-1]+sorted[sorted.length/2])/2) : sorted[Math.floor(sorted.length/2)]
  const range = sorted[sorted.length-1]-sorted[0]
  const types = [{q:'Ortalama (aritmetik) kaç?',a:mean},{q:'Medyan (ortanca) kaç?',a:median},{q:'Açıklık (en büyük - en küçük) kaç?',a:range}]
  const t = types[Math.floor(Math.random()*types.length)]
  const opts = [t.a, t.a+1, t.a-1, t.a+2].filter(n=>n>=0).sort(()=>Math.random()-0.5).slice(0,4)
  if (!opts.includes(t.a)) opts[0]=t.a
  return {values, question:t.q, answer:t.a, options:opts.sort(()=>Math.random()-0.5)}
}

export default function VeriBilimLabi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [data, setData] = useState(genData())
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => { setData(genData()); setFeedback(null); stimRef.current=Date.now() },[round])

  const handleAnswer = (val:number) => {
    if(feedback) return; const correct=val===data.answer
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif5_veri_bilim',question:data.question}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?900:700)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(16,185,129,0.1)',color:'#6EE7B7'}}>📈 Veri Analizi</span>
      <div className="flex gap-2 flex-wrap justify-center">{data.values.map((v,i)=><span key={i} className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.2)'}}>{v}</span>)}</div>
      <p className="text-sm font-bold text-green-300">{data.question}</p>
      <div className="flex gap-3">{data.options.map((opt,i)=>(
        <motion.button key={i} className="w-14 h-14 rounded-xl text-xl font-black text-white" style={{background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)'}} whileHover={{scale:1.08}} whileTap={{scale:0.92}} onClick={()=>handleAnswer(opt)}>{opt}</motion.button>
      ))}</div>
      <AnimatePresence>{feedback&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'🌟':'💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
