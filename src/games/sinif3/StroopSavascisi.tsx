import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const COLOR_MAP: Record<string,string> = {Kırmızı:'#EF4444',Mavi:'#3B82F6',Yeşil:'#22C55E',Sarı:'#EAB308'}
const NAMES = Object.keys(COLOR_MAP)

export default function StroopSavascisi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [word, setWord] = useState('Kırmızı'); const [inkColor, setInkColor] = useState('#EF4444')
  const [isCongruent, setIsCongruent] = useState(true)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const w = NAMES[Math.floor(Math.random()*NAMES.length)]
    const congruent = Math.random()>0.4
    const ink = congruent ? COLOR_MAP[w] : COLOR_MAP[NAMES.filter(n=>n!==w)[Math.floor(Math.random()*(NAMES.length-1))]]
    setWord(w); setInkColor(ink); setIsCongruent(congruent)
    setFeedback(null); stimRef.current = Date.now()
  },[round])

  const correctAnswer = Object.entries(COLOR_MAP).find(([,v])=>v===inkColor)?.[0] || ''

  const handleAnswer = (name:string) => {
    if(feedback) return; const correct = name===correctAnswer
    session.recordTrial({timestamp:Date.now(),trialType:'target',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif3_stroop',isCongruent,word,inkColor:correctAnswer,response:name,stroopEffect:!isCongruent}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?600:500)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-5">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(239,68,68,0.1)',color:'#FCA5A5',border:'1px solid rgba(239,68,68,0.15)'}}>⚔️ Yazıyı değil, MÜREKKEBİN RENGİNİ söyle!</span>
      <motion.div key={round} className="text-6xl font-black" style={{color:inkColor,textShadow:`0 0 20px ${inkColor}40`}} initial={{scale:0,rotate:-10}} animate={{scale:1,rotate:0}}>
        {word}
      </motion.div>
      <div className="flex gap-3 flex-wrap justify-center">
        {NAMES.map(name=>(
          <motion.button key={name} className="px-6 py-3 rounded-xl text-sm font-bold" style={{background:`${COLOR_MAP[name]}20`,border:`2px solid ${COLOR_MAP[name]}40`,color:COLOR_MAP[name]}} whileHover={{scale:1.08}} whileTap={{scale:0.92}} onClick={()=>handleAnswer(name)}>{name}</motion.button>
        ))}
      </div>
      <AnimatePresence>{feedback&&<motion.span className="text-4xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'✨':'💨'}</motion.span>}</AnimatePresence>
    </div>
  )
}
