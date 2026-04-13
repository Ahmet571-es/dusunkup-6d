import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function OndalikOkyanus({ session, state }: { session: SessionManager; state: SessionState }) {
  const [mode, setMode] = useState<'fraction_to_decimal'|'compare'|'operation'>('fraction_to_decimal')
  const [num, setNum] = useState(1); const [den, setDen] = useState(4)
  const [decA, setDecA] = useState(0.25); const [decB, setDecB] = useState(0.3)
  const [options, setOptions] = useState<string[]>([]); const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const m = (['fraction_to_decimal','compare','operation'] as const)[round % 3]; setMode(m)
    if (m === 'fraction_to_decimal') {
      const pairs = [[1,2,'0.5'],[1,4,'0.25'],[3,4,'0.75'],[1,5,'0.2'],[2,5,'0.4'],[1,10,'0.1'],[3,10,'0.3'],[7,10,'0.7']]
      const p = pairs[Math.floor(Math.random()*pairs.length)]
      setNum(p[0] as number); setDen(p[1] as number)
      const correct = p[2] as string
      const opts = [correct, '0.'+Math.floor(Math.random()*9), (Math.random()*0.9+0.1).toFixed(1), (Math.random()*0.9+0.1).toFixed(2)].sort(()=>Math.random()-0.5)
      if (!opts.includes(correct)) opts[0] = correct
      const sorted = [...new Set(opts)].slice(0,4).sort(()=>Math.random()-0.5)
      setOptions(sorted); setCorrectIdx(sorted.indexOf(correct))
    } else if (m === 'compare') {
      const a = Math.floor(Math.random()*90+10)/100; const b = Math.floor(Math.random()*90+10)/100
      setDecA(a); setDecB(b)
      setOptions([`${a} büyük`, `${b} büyük`, a===b?'Eşit':'']); setCorrectIdx(a>b?0:a<b?1:2)
    } else {
      const a = Math.floor(Math.random()*5+1)/10; const b = Math.floor(Math.random()*5+1)/10
      setDecA(a); setDecB(b)
      const ans = (a+b).toFixed(1)
      const opts = [ans, (a+b+0.1).toFixed(1), (a+b-0.1).toFixed(1), (a*10+b*10).toString()].sort(()=>Math.random()-0.5)
      if (!opts.includes(ans)) opts[0] = ans
      setOptions([...new Set(opts)].slice(0,4)); setCorrectIdx([...new Set(opts)].slice(0,4).indexOf(ans))
    }
    setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (idx: number) => {
    if (feedback) return; const correct = idx === correctIdx
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif4_ondalik',mode}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?900:700)
  }

  const modeQ = {fraction_to_decimal:`${num}/${den} ondalık olarak kaç?`, compare:`Hangisi büyük?`, operation:`${decA} + ${decB} = ?`}
  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(6,182,212,0.1)',color:'#67E8F9'}}>🌊 {modeQ[mode]}</span>
      {mode==='fraction_to_decimal'&&<div className="text-5xl font-black text-white">{num}<span className="text-3xl text-white/40">/</span>{den}</div>}
      {mode==='compare'&&<div className="flex items-center gap-4"><span className="text-4xl font-black text-blue-300">{decA}</span><span className="text-2xl text-white/30">vs</span><span className="text-4xl font-black text-green-300">{decB}</span></div>}
      {mode==='operation'&&<div className="flex items-center gap-3"><span className="text-4xl font-black text-white">{decA}</span><span className="text-2xl text-white/40">+</span><span className="text-4xl font-black text-white">{decB}</span><span className="text-2xl text-white/40">=</span><span className="text-3xl text-yellow-300">?</span></div>}
      <div className="flex gap-3 flex-wrap justify-center">{options.filter(Boolean).map((opt,i)=>(
        <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)'}} whileHover={{scale:1.05}} whileTap={{scale:0.92}} onClick={()=>handleAnswer(i)}>{opt}</motion.button>
      ))}</div>
      <AnimatePresence>{feedback&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'🌟':'💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
