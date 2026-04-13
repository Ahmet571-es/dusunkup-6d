import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function AlanCevreKalesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [w, setW] = useState(4); const [h, setH] = useState(3)
  const [mode, setMode] = useState<'perimeter'|'area'>('perimeter')
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    setW(2+Math.floor(Math.random()*7)); setH(2+Math.floor(Math.random()*7))
    setMode(round%2===0?'perimeter':'area'); setInput(''); setFeedback(null); stimRef.current=Date.now()
  },[round])

  const answer = mode==='perimeter' ? 2*(w+h) : w*h
  const handleSubmit = () => {
    if(feedback) return; const val=parseInt(input); if(isNaN(val)) return; const correct=val===answer
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif4_alan_cevre',mode,w,h}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?900:700)
  }

  const scale = 20; const maxDim = Math.max(w,h)
  const cellSize = Math.min(scale, 160/maxDim)
  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(16,185,129,0.1)',color:'#6EE7B7'}}>🏰 {mode==='perimeter'?`Çevreyi hesapla!`:`Alanı hesapla!`}</span>
      <div className="relative" style={{width:w*cellSize+2,height:h*cellSize+2}}>
        <div className="grid" style={{gridTemplateColumns:`repeat(${w},${cellSize}px)`,gap:0}}>
          {Array.from({length:w*h},(_,i)=><div key={i} style={{width:cellSize,height:cellSize,border:'1px solid rgba(52,211,153,0.3)',background:'rgba(52,211,153,0.05)'}}/>)}
        </div>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-green-300">{w} br</span>
        <span className="absolute top-1/2 -right-8 -translate-y-1/2 text-xs font-bold text-green-300">{h} br</span>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <span className="text-sm text-white/60">{mode==='perimeter'?`Çevre = 2×(${w}+${h})`:`Alan = ${w}×${h}`} = </span>
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} maxLength={3} className="w-16 h-10 rounded-lg text-center text-xl font-black bg-white/5 border border-white/10 text-yellow-300 focus:outline-none"/>
        <motion.button disabled={!input||!!feedback} className="h-10 px-4 rounded-lg text-sm font-bold disabled:opacity-30" style={{background:'rgba(52,211,153,0.12)',color:'#6EE7B7'}} whileTap={{scale:0.92}} onClick={handleSubmit}>✓</motion.button>
      </div>
      {feedback==='wrong'&&<span className="text-xs text-orange-300">Doğru: {answer}</span>}
      <AnimatePresence>{feedback==='correct'&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
