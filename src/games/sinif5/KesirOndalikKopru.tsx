import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const CONVERSIONS = [
  {from:'1/2', type:'fraction_to_decimal', answer:'0.5', options:['0.5','0.2','0.12','2.0']},
  {from:'1/4', type:'fraction_to_decimal', answer:'0.25', options:['0.25','0.4','0.14','4.0']},
  {from:'3/4', type:'fraction_to_decimal', answer:'0.75', options:['0.75','0.34','3.4','7.5']},
  {from:'0.5', type:'decimal_to_percent', answer:'%50', options:['%50','%5','%500','%0.5']},
  {from:'0.25', type:'decimal_to_percent', answer:'%25', options:['%25','%2.5','%250','%0.25']},
  {from:'%75', type:'percent_to_fraction', answer:'3/4', options:['3/4','7/5','75/1','4/3']},
  {from:'%20', type:'percent_to_fraction', answer:'1/5', options:['1/5','2/10','20/1','2/5']},
  {from:'0.1', type:'decimal_to_fraction', answer:'1/10', options:['1/10','1/1','10/1','1/100']},
]

export default function KesirOndalikKopru({ session, state }: { session: SessionManager; state: SessionState }) {
  const [conv, setConv] = useState(CONVERSIONS[0])
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => { setConv(CONVERSIONS[round%CONVERSIONS.length]); setFeedback(null); stimRef.current=Date.now() },[round])

  const handleAnswer = (ans:string) => {
    if(feedback) return; const correct=ans===conv.answer
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif5_kopru',convType:conv.type}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?900:700)
  }

  const typeLabel = {fraction_to_decimal:'Kesir → Ondalık',decimal_to_percent:'Ondalık → Yüzde',percent_to_fraction:'Yüzde → Kesir',decimal_to_fraction:'Ondalık → Kesir'}

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(234,179,8,0.1)',color:'#FDE047'}}>🌉 {typeLabel[conv.type as keyof typeof typeLabel]}</span>
      <div className="text-5xl font-black text-white">{conv.from}</div>
      <p className="text-sm text-green-300 font-bold">Bu ne olur?</p>
      <div className="flex gap-3 flex-wrap justify-center">{conv.options.sort(()=>Math.random()-0.5).map((opt,i)=>(
        <motion.button key={i} className="px-5 py-3 rounded-xl text-lg font-bold text-white" style={{background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)'}} whileHover={{scale:1.05}} whileTap={{scale:0.92}} onClick={()=>handleAnswer(opt)}>{opt}</motion.button>
      ))}</div>
      <AnimatePresence>{feedback&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'🌟':'💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
