import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const STRATEGIES = [
  {problem:'48+37=?', strategies:[{name:'10a tamamla',steps:'48+2=50, 50+35=85',answer:85},{name:'Basamakları topla',steps:'40+30=70, 8+7=15, 70+15=85',answer:85},{name:'Yuvarlayıp düzelt',steps:'50+37=87, 87-2=85',answer:85}]},
  {problem:'93-28=?', strategies:[{name:'Geriye say',steps:'93-20=73, 73-8=65',answer:65},{name:'Yuvarlayıp düzelt',steps:'93-30=63, 63+2=65',answer:65},{name:'Parçala',steps:'93-28=93-23-5=70-5=65',answer:65}]},
  {problem:'6×7=?', strategies:[{name:'5×7+1×7',steps:'35+7=42',answer:42},{name:'3×7×2',steps:'21×2=42',answer:42},{name:'Direkt hatırla',steps:'6×7=42',answer:42}]},
]

export default function ZamanMakinesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [prob, setProb] = useState(STRATEGIES[0])
  const [phase, setPhase] = useState<'solve'|'evaluate'>('solve')
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<number|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => { setProb(STRATEGIES[round%STRATEGIES.length]); setPhase('solve'); setInput(''); setFeedback(null); setSelectedStrategy(null); stimRef.current=Date.now() },[round])

  const handleSolve = () => {
    if(feedback) return; const val=parseInt(input); if(isNaN(val)) return; const correct=val===prob.strategies[0].answer
    if(correct) { setPhase('evaluate') } else { setFeedback('wrong'); setTimeout(()=>setFeedback(null),700) }
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif5_zaman',phase:'solve'}})
  }

  const handleStrategySelect = (idx:number) => {
    setSelectedStrategy(idx)
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:true,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif5_zaman',phase:'evaluate',strategyChosen:prob.strategies[idx].name}})
    setFeedback('correct'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},1200)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(99,102,241,0.1)',color:'#A5B4FC'}}>⏰ {phase==='solve'?'Önce çöz!':'Hangi stratejiyi kullandın?'}</span>
      <div className="text-4xl font-black text-white">{prob.problem}</div>
      
      {phase==='solve'&&<div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} maxLength={4} className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none"/>
        <motion.button disabled={!input} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{background:'rgba(52,211,153,0.12)',color:'#6EE7B7'}} whileTap={{scale:0.92}} onClick={handleSolve}>✓</motion.button>
      </div>}

      {phase==='evaluate'&&<>
        <p className="text-sm text-green-300">Doğru! Şimdi: nasıl çözdün?</p>
        <div className="flex flex-col gap-2 w-full max-w-md">
          {prob.strategies.map((s,i)=>(
            <motion.button key={i} className="p-3 rounded-xl text-left" style={{background:selectedStrategy===i?'rgba(52,211,153,0.15)':'rgba(255,255,255,0.04)',border:`1.5px solid ${selectedStrategy===i?'rgba(52,211,153,0.3)':'rgba(255,255,255,0.08)'}`}} whileHover={{scale:1.02}} onClick={()=>handleStrategySelect(i)}>
              <span className="text-sm font-bold text-white">{s.name}</span>
              <span className="text-xs text-white/40 block mt-0.5">{s.steps}</span>
            </motion.button>
          ))}
        </div>
      </>}

      {feedback==='wrong'&&<span className="text-sm text-orange-300">Tekrar dene!</span>}
      <AnimatePresence>{feedback==='correct'&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
