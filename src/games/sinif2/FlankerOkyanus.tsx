import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function FlankerOkyanus({ session, state }: { session: SessionManager; state: SessionState }) {
  const [target, setTarget] = useState<'←'|'→'>('→')
  const [flankers, setFlankers] = useState<string[]>([])
  const [showStim, setShowStim] = useState(false)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const setSize = Math.min(7, 3 + (state.difficultyAxes.set_size||0))

  useEffect(() => {
    const t: '←'|'→' = Math.random()>0.5?'←':'→'
    setTarget(t)
    const types = ['congruent','incongruent','neutral']
    const type = types[Math.floor(Math.random()*3)]
    const f = type==='congruent'?t:type==='incongruent'?(t==='←'?'→':'←'):'—'
    const half = Math.floor(setSize/2)
    setFlankers([...Array(half).fill(f), t, ...Array(half).fill(f)])
    setShowStim(false); setFeedback(null)
    setTimeout(()=>{setShowStim(true);stimRef.current=Date.now()},400)
  },[round])

  const respond = (dir:'←'|'→') => {
    if(!showStim||feedback) return
    const correct = dir===target
    session.recordTrial({timestamp:Date.now(),trialType:'target',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif2_flanker',target,response:dir}})
    setFeedback(correct?'correct':'wrong')
    setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?500:400)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-5">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(6,182,212,0.1)',color:'#67E8F9',border:'1px solid rgba(6,182,212,0.15)'}}>🐠 Ortadaki balık hangi yöne?</span>
      <div className="w-full max-w-lg h-36 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(180deg,#0C1A30,#1A3A5C)',border:'1px solid rgba(6,182,212,0.1)'}}>
        {!showStim?<span className="text-3xl text-white/20">+</span>:
        <motion.div className="flex items-center gap-1" initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}>
          {flankers.map((f,i)=>{const isC=i===Math.floor(flankers.length/2);return <span key={i} className={isC?'text-4xl':'text-2xl opacity-50'} style={{color:isC?'#67E8F9':'#67E8F940'}}>{f==='←'?'🐟':f==='→'?'🐠':'〰️'}</span>})}
        </motion.div>}
      </div>
      <div className="flex gap-6">
        <motion.button className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center" style={{background:'rgba(59,130,246,0.1)',border:'2px solid rgba(59,130,246,0.2)'}} whileTap={{scale:0.9}} onClick={()=>respond('←')}><span className="text-3xl">⬅️</span><span className="text-xs text-blue-300 mt-1">Sol</span></motion.button>
        <motion.button className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center" style={{background:'rgba(52,211,153,0.1)',border:'2px solid rgba(52,211,153,0.2)'}} whileTap={{scale:0.9}} onClick={()=>respond('→')}><span className="text-3xl">➡️</span><span className="text-xs text-green-300 mt-1">Sağ</span></motion.button>
      </div>
      <AnimatePresence>{feedback&&<motion.span className="text-4xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'✨':'💨'}</motion.span>}</AnimatePresence>
    </div>
  )
}
