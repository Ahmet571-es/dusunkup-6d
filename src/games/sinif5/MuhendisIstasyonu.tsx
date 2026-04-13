import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const PROBLEMS = [
  {text:'Bir köprü 120 metre uzunluğunda. Her 15 metrede bir destek direği gerekiyor. Başlangıç ve bitiş dahil kaç direk lazım?', answer:9, steps:['120÷15=8 aralık','8+1=9 direk (uçlar dahil)']},
  {text:'Fabrikada saatte 45 ürün üretiliyor. 8 saatlik vardiyada 30 ürün bozuk çıktı. Kaç sağlam ürün üretildi?', answer:330, steps:['45×8=360 toplam','360-30=330 sağlam']},
  {text:'Havuzun hacmi 2000 litre. Bir musluk saatte 250 litre dolduruyor. Havuz 3/4 dolu ise tamamen dolması kaç saat sürer?', answer:2, steps:['2000×1/4=500 litre boş','500÷250=2 saat']},
  {text:'Bir bina 12 katlı. Her katta 4 daire var. Her dairede 3 oda var. Toplam kaç oda var?', answer:144, steps:['12×4=48 daire','48×3=144 oda']},
  {text:'Okul bahçesine 5 sıra fidan dikilecek. Her sırada 8 fidan olacak. Fidanlar arası 2 metre. Her sıranın uzunluğu kaç metre?', answer:14, steps:['8 fidan → 7 aralık','7×2=14 metre']},
]

export default function MuhendisIstasyonu({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState(PROBLEMS[0])
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [showSteps, setShowSteps] = useState(false); const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => { setProblem(PROBLEMS[round%PROBLEMS.length]); setInput(''); setFeedback(null); setShowSteps(false); stimRef.current=Date.now() },[round])

  const handleSubmit = () => {
    if(feedback) return; const val=parseInt(input); if(isNaN(val)) return; const correct=val===problem.answer
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif5_muhendis',multiStep:true}})
    if(!correct) setShowSteps(true)
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?1000:2500)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(239,68,68,0.1)',color:'#FCA5A5'}}>🚀 Mühendislik Problemi</span>
      <div className="w-full max-w-lg rounded-xl p-4" style={{background:'rgba(10,15,30,0.7)',border:'1px solid rgba(255,255,255,0.06)'}}>
        <p className="text-sm text-white/80 leading-relaxed">{problem.text}</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} maxLength={4} placeholder="?" className="w-24 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none"/>
        <motion.button disabled={!input||!!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{background:'rgba(52,211,153,0.12)',color:'#6EE7B7'}} whileTap={{scale:0.92}} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>
      {showSteps&&<div className="text-xs text-orange-300 text-center">{problem.steps.map((s,i)=><div key={i}>Adım {i+1}: {s}</div>)} Cevap: {problem.answer}</div>}
      <AnimatePresence>{feedback==='correct'&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
