import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

function ClockFace({ hours, minutes, size=160 }: { hours: number; minutes: number; size?: number }) {
  const r = size/2; const cx = r; const cy = r
  const hourAngle = ((hours%12)+minutes/60)*30 - 90
  const minuteAngle = minutes*6 - 90
  const hLen = r*0.45; const mLen = r*0.65
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r-4} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
      {Array.from({length:12},(_,i)=>{const a=(i+1)*30*Math.PI/180;return(
        <text key={i} x={cx+Math.sin(a)*(r-18)} y={cy-Math.cos(a)*(r-18)+4} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="bold">{i+1}</text>
      )})}
      {Array.from({length:60},(_,i)=>{const a=i*6*Math.PI/180;const len=i%5===0?8:4;return(
        <line key={i} x1={cx+Math.sin(a)*(r-8)} y1={cy-Math.cos(a)*(r-8)} x2={cx+Math.sin(a)*(r-8-len)} y2={cy-Math.cos(a)*(r-8-len)} stroke="rgba(255,255,255,0.2)" strokeWidth={i%5===0?1.5:0.5}/>
      )})}
      <line x1={cx} y1={cy} x2={cx+Math.cos(hourAngle*Math.PI/180)*hLen} y2={cy+Math.sin(hourAngle*Math.PI/180)*hLen} stroke="#60A5FA" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1={cx} y1={cy} x2={cx+Math.cos(minuteAngle*Math.PI/180)*mLen} y2={cy+Math.sin(minuteAngle*Math.PI/180)*mLen} stroke="#34D399" strokeWidth="2" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="4" fill="#F1F5F9"/>
    </svg>
  )
}

export default function SaatKulesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [hours, setHours] = useState(3); const [minutes, setMinutes] = useState(0)
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())
  const [mode, setMode] = useState<'read'|'set'>('read')

  useEffect(() => {
    const h = 1+Math.floor(Math.random()*12)
    const precisions = [0,30,15,45,5,10,20,25,35,40,50,55]
    const level = Math.min(precisions.length-1, state.difficultyAxes.precision||0)
    const m = precisions[Math.floor(Math.random()*(level+1))]
    setHours(h); setMinutes(m); setMode(round%2===0?'read':'read')
    setInput(''); setFeedback(null); stimRef.current = Date.now()
  },[round])

  const answer = `${hours}:${minutes.toString().padStart(2,'0')}`

  const handleSubmit = () => {
    if(feedback||!input) return
    const correct = input === answer || input === `${hours}:${minutes===0?'00':minutes}`
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif2_saat',hours,minutes,answer:input}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?1000:800)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(236,72,153,0.1)',color:'#F9A8D4',border:'1px solid rgba(236,72,153,0.15)'}}>🕐 Saat kaç?</span>
      <ClockFace hours={hours} minutes={minutes} />
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="S:DD"
          className="w-24 h-12 rounded-xl text-center text-xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 placeholder:text-white/20 focus:outline-none focus:border-yellow-400/40"
          maxLength={5} disabled={!!feedback} />
        <motion.button disabled={!!feedback||!input} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{background:'rgba(52,211,153,0.12)',border:'1.5px solid rgba(52,211,153,0.2)',color:'#6EE7B7'}} whileTap={{scale:0.92}} onClick={handleSubmit}>✓</motion.button>
      </div>
      <p className="text-[10px] text-white/20">Örnek: 3:00 veya 9:30</p>
      {feedback==='wrong'&&<p className="text-xs text-orange-300">Doğru cevap: {answer}</p>}
      <AnimatePresence>{feedback==='correct'&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
