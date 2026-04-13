import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const EXPERIMENTS = [
  {hypothesis:'Büyük toplar küçük toplardan daha hızlı yuvarlanır',variables:['Top boyutu','Eğim','Yüzey'],correct:'Top boyutu',dependent:'Hız'},
  {hypothesis:'Bitkiler ışıkta daha hızlı büyür',variables:['Işık miktarı','Su miktarı','Toprak tipi'],correct:'Işık miktarı',dependent:'Büyüme hızı'},
  {hypothesis:'Sıcak su soğuk sudan daha hızlı buharlaşır',variables:['Su sıcaklığı','Kap boyutu','Hava akımı'],correct:'Su sıcaklığı',dependent:'Buharlaşma hızı'},
]

export default function KesifGezegeni({ session, state }: { session: SessionManager; state: SessionState }) {
  const [exp, setExp] = useState(EXPERIMENTS[0])
  const [phase, setPhase] = useState<'hypothesis'|'variable'|'result'>('hypothesis')
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => { setExp(EXPERIMENTS[round%EXPERIMENTS.length]); setPhase('hypothesis'); setFeedback(null); stimRef.current=Date.now(); setTimeout(()=>setPhase('variable'),3000) },[round])

  const handleAnswer = (variable:string) => {
    if(feedback) return; const correct=variable===exp.correct
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif5_kesif',hypothesis:exp.hypothesis}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?1000:800)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(16,185,129,0.1)',color:'#6EE7B7'}}>🔭 Bilimsel Deney</span>
      <div className="w-full max-w-lg rounded-xl p-4" style={{background:'rgba(10,15,30,0.7)',border:'1px solid rgba(255,255,255,0.06)'}}>
        <p className="text-xs text-white/40 mb-1">Hipotez:</p>
        <p className="text-sm text-white/80 font-bold">{exp.hypothesis}</p>
      </div>
      {phase==='hypothesis'&&<p className="text-xs text-yellow-300/50 animate-pulse">Hipotezi oku...</p>}
      {phase==='variable'&&<>
        <p className="text-sm text-green-300 font-bold">Bu deneyde değiştirmemiz gereken değişken hangisi?</p>
        <div className="flex gap-3 flex-wrap justify-center">{exp.variables.map((v,i)=>(
          <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)'}} whileHover={{scale:1.05}} whileTap={{scale:0.92}} onClick={()=>handleAnswer(v)}>{v}</motion.button>
        ))}</div>
      </>}
      <AnimatePresence>{feedback&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'🌟':'💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
