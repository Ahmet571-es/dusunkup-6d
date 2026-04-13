import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function HafizaLabirenti({ session, state }: { session: SessionManager; state: SessionState }) {
  const [sequence, setSequence] = useState<number[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showItem, setShowItem] = useState(false)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const [nbackLevel] = useState(2)
  const stimRef = useRef(Date.now())
  const gridSize = 9; const colors = ['#EF4444','#3B82F6','#22C55E','#EAB308','#A855F7','#EC4899']

  useEffect(() => {
    const len = 8 + Math.floor(Math.random()*4)
    const seq = Array.from({length:len},()=>Math.floor(Math.random()*gridSize))
    // Ensure some n-back matches
    for(let i=nbackLevel;i<seq.length;i++){if(Math.random()<0.3)seq[i]=seq[i-nbackLevel]}
    setSequence(seq); setCurrentIdx(0); setFeedback(null)
  },[round])

  useEffect(() => {
    if(currentIdx>=sequence.length) return
    setShowItem(true); stimRef.current=Date.now()
    const timer = setTimeout(()=>{setShowItem(false)
      setTimeout(()=>setCurrentIdx(i=>i+1),300)
    },1500)
    return ()=>clearTimeout(timer)
  },[currentIdx,sequence])

  const isMatch = currentIdx>=nbackLevel && sequence[currentIdx]===sequence[currentIdx-nbackLevel]

  const respond = (saysMatch:boolean) => {
    if(feedback||!showItem) return
    const correct = saysMatch===isMatch
    session.recordTrial({timestamp:Date.now(),trialType:'memory',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:isMatch,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif2_nback',nbackLevel,position:sequence[currentIdx],isMatch}})
    setFeedback(correct?'correct':'wrong')
    setTimeout(()=>{setFeedback(null);setShowItem(false);setTimeout(()=>setCurrentIdx(i=>i+1),200)},500)
  }

  if(currentIdx>=sequence.length) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <span className="text-5xl">🏆</span>
      <p className="text-white font-bold">Tur tamamlandı!</p>
      <button className="px-6 py-2 rounded-xl bg-green-500/15 text-green-300 font-bold text-sm" onClick={()=>setRound(r=>r+1)}>Tekrar Oyna</button>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(139,92,246,0.1)',color:'#C4B5FD',border:'1px solid rgba(139,92,246,0.15)'}}>🏰 {nbackLevel}-back: {nbackLevel} adım öncekiyle aynı mı?</span>
      <div className="grid grid-cols-3 gap-2" style={{width:180}}>
        {Array.from({length:gridSize},(_,i)=>(
          <motion.div key={i} className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{background:showItem&&sequence[currentIdx]===i?colors[i%colors.length]:'rgba(255,255,255,0.05)',border:`2px solid ${showItem&&sequence[currentIdx]===i?colors[i%colors.length]+'60':'rgba(255,255,255,0.08)'}`,boxShadow:showItem&&sequence[currentIdx]===i?`0 0 16px ${colors[i%colors.length]}30`:'none'}}
            animate={{scale:showItem&&sequence[currentIdx]===i?1.1:1}}>
            {showItem&&sequence[currentIdx]===i&&<span className="text-xl">🔮</span>}
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-white/30">{currentIdx+1} / {sequence.length}</p>
      {showItem&&currentIdx>=nbackLevel&&(
        <div className="flex gap-4">
          <motion.button className="px-6 py-3 rounded-xl text-sm font-bold" style={{background:'rgba(52,211,153,0.12)',border:'1.5px solid rgba(52,211,153,0.2)',color:'#6EE7B7'}} whileTap={{scale:0.92}} onClick={()=>respond(true)}>✅ Aynı!</motion.button>
          <motion.button className="px-6 py-3 rounded-xl text-sm font-bold" style={{background:'rgba(239,68,68,0.08)',border:'1.5px solid rgba(239,68,68,0.15)',color:'#FCA5A5'}} whileTap={{scale:0.92}} onClick={()=>respond(false)}>❌ Farklı</motion.button>
        </div>
      )}
      <AnimatePresence>{feedback&&<motion.span className="text-4xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'✨':'💨'}</motion.span>}</AnimatePresence>
    </div>
  )
}
