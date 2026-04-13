import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

function PizzaSVG({ slices, filled, size=140 }: { slices: number; filled: number; size?: number }) {
  const r = size/2-4; const cx=size/2; const cy=size/2
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      {Array.from({length:slices},(_,i)=>{
        const a1=(i/slices)*Math.PI*2-Math.PI/2; const a2=((i+1)/slices)*Math.PI*2-Math.PI/2
        const x1=cx+Math.cos(a1)*r; const y1=cy+Math.sin(a1)*r
        const x2=cx+Math.cos(a2)*r; const y2=cy+Math.sin(a2)*r
        const large=1/slices>0.5?1:0
        return <g key={i}>
          <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
            fill={i<filled?'rgba(234,88,12,0.6)':'rgba(255,255,255,0.02)'}
            stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        </g>
      })}
    </svg>
  )
}

export default function KesirMutfagi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [num, setNum] = useState(1); const [den, setDen] = useState(4)
  const [mode, setMode] = useState<'identify'|'compare'|'equivalent'>('identify')
  const [options, setOptions] = useState<string[]>([]); const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const denoms = [2,3,4,6,8]; const d = denoms[Math.min(round%5, denoms.length-1)]
    const n = 1+Math.floor(Math.random()*(d-1))
    setNum(n); setDen(d); const m = (['identify','compare','equivalent'] as const)[round%3]; setMode(m)
    if(m==='identify'){
      const opts = [`${n}/${d}`, `${d}/${n}`, `${n+1}/${d}`, `${Math.max(1,n-1)}/${d}`].sort(()=>Math.random()-0.5)
      setOptions(opts); setCorrectIdx(opts.indexOf(`${n}/${d}`))
    } else if(m==='compare'){
      const n2=n===1?n+1:n-1
      setOptions([`${n}/${d} büyük`,`${n2}/${d} büyük`]); setCorrectIdx(n>n2?0:1)
    } else {
      const mult = 2+Math.floor(Math.random()*2)
      const opts = [`${n*mult}/${d*mult}`,`${n+mult}/${d+mult}`,`${n*mult}/${d}`].sort(()=>Math.random()-0.5)
      setOptions(opts); setCorrectIdx(opts.indexOf(`${n*mult}/${d*mult}`))
    }
    setFeedback(null); stimRef.current = Date.now()
  },[round])

  const handleAnswer = (idx:number) => {
    if(feedback) return; const correct=idx===correctIdx
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif3_kesir',mode,num,den}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?1000:800)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(234,88,12,0.1)',color:'#FDBA74',border:'1px solid rgba(234,88,12,0.15)'}}>
        🍕 {mode==='identify'?'Bu kesri söyle!':mode==='compare'?'Hangisi büyük?':'Eşdeğer kesri bul!'}
      </span>
      <PizzaSVG slices={den} filled={num} />
      <p className="text-2xl font-black text-white">{num}/{den}</p>
      <div className="flex gap-3 flex-wrap justify-center">
        {options.map((opt,i)=>(
          <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.1)'}} whileHover={{scale:1.05}} whileTap={{scale:0.92}} onClick={()=>handleAnswer(i)}>{opt}</motion.button>
        ))}
      </div>
      <AnimatePresence>{feedback&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'🌟':'💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
