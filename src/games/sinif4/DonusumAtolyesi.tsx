import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const CONVERSIONS = [
  {from:'1 m',to:'cm',answer:100,hint:'1 metre = 100 santimetre'},
  {from:'2 km',to:'m',answer:2000,hint:'1 km = 1000 m'},
  {from:'1 kg',to:'g',answer:1000,hint:'1 kilogram = 1000 gram'},
  {from:'3 saat',to:'dakika',answer:180,hint:'1 saat = 60 dakika'},
  {from:'500 cm',to:'m',answer:5,hint:'100 cm = 1 m'},
  {from:'2000 g',to:'kg',answer:2,hint:'1000 g = 1 kg'},
  {from:'120 dakika',to:'saat',answer:2,hint:'60 dakika = 1 saat'},
  {from:'5 m',to:'cm',answer:500,hint:'1 m = 100 cm'},
]

export default function DonusumAtolyesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [conv, setConv] = useState(CONVERSIONS[0])
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [showHint, setShowHint] = useState(false)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => { setConv(CONVERSIONS[round%CONVERSIONS.length]); setInput(''); setFeedback(null); setShowHint(false); stimRef.current=Date.now() },[round])

  const handleSubmit = () => {
    if(feedback) return; const val=parseInt(input); if(isNaN(val)) return; const correct=val===conv.answer
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif4_donusum',from:conv.from,to:conv.to,hintUsed:showHint}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?900:700)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(249,115,22,0.1)',color:'#FDBA74'}}>🔧 Birim Dönüştür!</span>
      <div className="text-center"><span className="text-4xl font-black text-white">{conv.from}</span><span className="text-2xl text-white/40 mx-3">=</span><span className="text-3xl text-yellow-300">? {conv.to}</span></div>
      {showHint&&<p className="text-xs text-blue-300/60">💡 {conv.hint}</p>}
      {!showHint&&<button onClick={()=>setShowHint(true)} className="text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e=>setInput(e.target.value)} maxLength={5} className="w-24 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none"/>
        <span className="text-sm text-white/40">{conv.to}</span>
        <motion.button disabled={!input||!!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{background:'rgba(52,211,153,0.12)',color:'#6EE7B7'}} whileTap={{scale:0.92}} onClick={handleSubmit}>✓</motion.button>
      </div>
      {feedback==='wrong'&&<span className="text-xs text-orange-300">Doğru: {conv.answer} {conv.to}</span>}
      <AnimatePresence>{feedback==='correct'&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
