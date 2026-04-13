import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function GelismisNback({ session, state }: { session: SessionManager; state: SessionState }) {
  const [nLevel] = useState(4)
  const SHAPES = ['🔴','🔵','🟡','🟢','🟣','🟠','⬜','🔶']
  const [sequence, setSequence] = useState<number[]>([])
  const [idx, setIdx] = useState(0); const [showItem, setShowItem] = useState(false)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const len=14; const seq=Array.from({length:len},()=>Math.floor(Math.random()*SHAPES.length))
    for(let i=nLevel;i<seq.length;i++){if(Math.random()<0.3)seq[i]=seq[i-nLevel]}
    setSequence(seq); setIdx(0); setFeedback(null)
  },[round])

  useEffect(() => {
    if(idx>=sequence.length) return
    setShowItem(true); stimRef.current=Date.now()
    const t=setTimeout(()=>{setShowItem(false);setTimeout(()=>setIdx(i=>i+1),250)},1500)
    return()=>clearTimeout(t)
  },[idx,sequence])

  const isMatch = idx>=nLevel && sequence[idx]===sequence[idx-nLevel]
  const respond = (saysMatch:boolean) => {
    if(feedback||!showItem) return; const correct=saysMatch===isMatch
    session.recordTrial({timestamp:Date.now(),trialType:'memory',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:isMatch,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif5_nback4',nLevel,isMatch}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setShowItem(false);setTimeout(()=>setIdx(i=>i+1),200)},400)
  }

  if(idx>=sequence.length) return <div className="flex flex-col items-center justify-center h-full gap-4"><span className="text-5xl">🏆</span><p className="text-white font-bold">Tur tamamlandı!</p><button className="px-6 py-2 rounded-xl bg-green-500/15 text-green-300 font-bold text-sm" onClick={()=>setRound(r=>r+1)}>Tekrar</button></div>

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(168,85,247,0.1)',color:'#D8B4FE'}}>🧬 {nLevel}-back: {nLevel} adım öncekiyle aynı mı?</span>
      <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl" style={{background:showItem?'rgba(168,85,247,0.1)':'rgba(255,255,255,0.03)',border:`2px solid ${showItem?'rgba(168,85,247,0.3)':'rgba(255,255,255,0.06)'}`,transition:'all 0.3s'}}>
        {showItem&&<motion.span initial={{scale:0}} animate={{scale:1}}>{SHAPES[sequence[idx]]}</motion.span>}
      </div>
      <p className="text-xs text-white/30">{idx+1}/{sequence.length}</p>
      {showItem&&idx>=nLevel&&<div className="flex gap-4">
        <motion.button className="px-6 py-3 rounded-xl text-sm font-bold" style={{background:'rgba(52,211,153,0.12)',color:'#6EE7B7'}} whileTap={{scale:0.92}} onClick={()=>respond(true)}>✅ Aynı!</motion.button>
        <motion.button className="px-6 py-3 rounded-xl text-sm font-bold" style={{background:'rgba(239,68,68,0.08)',color:'#FCA5A5'}} whileTap={{scale:0.92}} onClick={()=>respond(false)}>❌ Farklı</motion.button>
      </div>}
      <AnimatePresence>{feedback&&<motion.span className="text-4xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'✨':'💨'}</motion.span>}</AnimatePresence>
    </div>
  )
}
