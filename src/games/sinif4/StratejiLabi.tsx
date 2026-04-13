import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const PROBLEMS = [
  {text:'Ali 3 paket defter aldı. Her pakette 5 defter var. 2 defteri arkadaşına verdi. Kaç defteri kaldı?',steps:['3×5=15','15-2=13'],answer:13},
  {text:'Bahçede 4 sıra ağaç var. Her sırada 6 ağaç. 3 ağaç kurudu. Kaç sağlam ağaç var?',steps:['4×6=24','24-3=21'],answer:21},
  {text:'Ayşe 20 TL ile alışverişe gitti. 7 TL ekmek, 5 TL süt aldı. Kaç TL kaldı?',steps:['7+5=12','20-12=8'],answer:8},
  {text:'Sınıfta 28 öğrenci var. 4 gruba eşit bölündüler. Her gruba 2 öğrenci daha eklendi. Her grupta kaç öğrenci oldu?',steps:['28÷4=7','7+2=9'],answer:9},
  {text:'5 kutuya 8\'er kalem konuldu. 10 kalem bozuktu. Kaç sağlam kalem var?',steps:['5×8=40','40-10=30'],answer:30},
]

export default function StratejiLabi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState(PROBLEMS[0])
  const [phase, setPhase] = useState<'read'|'solve'>('read')
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [showSteps, setShowSteps] = useState(false)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    setProblem(PROBLEMS[round%PROBLEMS.length]); setPhase('read'); setInput(''); setFeedback(null); setShowSteps(false)
    stimRef.current=Date.now()
    setTimeout(()=>setPhase('solve'), 4000)
  },[round])

  const handleSubmit = () => {
    if(feedback) return; const val=parseInt(input); if(isNaN(val)) return; const correct=val===problem.answer
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif4_strateji',multiStep:true}})
    if(!correct) setShowSteps(true)
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?1000:2000)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(236,72,153,0.1)',color:'#F9A8D4'}}>🧪 Çok adımlı problem!</span>
      <div className="w-full max-w-lg rounded-xl p-4" style={{background:'rgba(10,15,30,0.7)',border:'1px solid rgba(255,255,255,0.06)'}}>
        <p className="text-sm text-white/80 leading-relaxed">{problem.text}</p>
      </div>
      {phase==='solve'&&<>
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} maxLength={3} placeholder="?" className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none"/>
          <motion.button disabled={!input||!!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{background:'rgba(52,211,153,0.12)',color:'#6EE7B7'}} whileTap={{scale:0.92}} onClick={handleSubmit}>Gönder ✓</motion.button>
        </div>
        {showSteps&&<div className="text-xs text-orange-300 text-center">{problem.steps.map((s,i)=><div key={i}>Adım {i+1}: {s}</div>)} Cevap: {problem.answer}</div>}
      </>}
      {phase==='read'&&<p className="text-xs text-yellow-300/50 animate-pulse">Problemi oku...</p>}
      <AnimatePresence>{feedback==='correct'&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
