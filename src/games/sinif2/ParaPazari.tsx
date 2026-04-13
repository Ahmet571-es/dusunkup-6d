import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const ITEMS = [
  {name:'Elma',price:3,emoji:'🍎'},{name:'Ekmek',price:5,emoji:'🍞'},{name:'Süt',price:7,emoji:'🥛'},
  {name:'Defter',price:4,emoji:'📓'},{name:'Kalem',price:2,emoji:'✏️'},{name:'Silgi',price:1,emoji:'🧽'},
  {name:'Çikolata',price:6,emoji:'🍫'},{name:'Su',price:3,emoji:'💧'},{name:'Meyve Suyu',price:8,emoji:'🧃'},
]

export default function ParaPazari({ session, state }: { session: SessionManager; state: SessionState }) {
  const [items, setItems] = useState<typeof ITEMS[0][]>([])
  const [mode, setMode] = useState<'total'|'change'>('total')
  const [budget, setBudget] = useState(20)
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const count = 2 + Math.floor(Math.random()*2)
    const selected = [...ITEMS].sort(()=>Math.random()-0.5).slice(0,count)
    setItems(selected)
    const total = selected.reduce((s,i)=>s+i.price,0)
    const m = round%2===0?'total':'change' as const; setMode(m)
    if(m==='change') setBudget(total + 2 + Math.floor(Math.random()*8))
    setInput(''); setFeedback(null); stimRef.current = Date.now()
  },[round])

  const total = items.reduce((s,i)=>s+i.price,0)
  const answer = mode==='total'?total:budget-total

  const handleSubmit = () => {
    if(feedback) return; const val=parseInt(input); if(isNaN(val)) return
    const correct = val===answer
    session.recordTrial({timestamp:Date.now(),trialType:'math',stimulusShownAt:stimRef.current,responseAt:Date.now(),responseTimeMs:Date.now()-stimRef.current,isCorrect:correct,isTarget:true,responded:true,difficultyAxes:state.difficultyAxes,metadata:{skillId:'sinif2_para',mode,total,budget,answer:val}})
    setFeedback(correct?'correct':'wrong'); setTimeout(()=>{setFeedback(null);setRound(r=>r+1)},correct?1000:800)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{background:'rgba(245,158,11,0.1)',color:'#FDE68A',border:'1px solid rgba(245,158,11,0.15)'}}>💰 {mode==='total'?'Toplam kaç TL?':'Üstü kaç TL kalır?'}</span>
      <div className="w-full max-w-lg rounded-2xl p-5" style={{background:'rgba(10,15,30,0.7)',border:'1px solid rgba(255,255,255,0.06)'}}>
        {mode==='change'&&<p className="text-center text-sm text-yellow-300 mb-3">Bütçen: {budget} TL</p>}
        <div className="flex justify-center gap-3 mb-4 flex-wrap">
          {items.map((item,i)=>(
            <div key={i} className="px-4 py-3 rounded-xl text-center" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}>
              <span className="text-2xl block mb-1">{item.emoji}</span>
              <span className="text-xs text-white/60 block">{item.name}</span>
              <span className="text-sm font-bold text-yellow-300">{item.price} TL</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3">
          {mode==='change'&&<><span className="text-2xl font-black text-white">{budget}</span><span className="text-xl text-white/40">−</span><span className="text-2xl font-black text-white">{total}</span><span className="text-xl text-white/40">=</span></>}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black" style={{border:`2.5px ${input?'solid':'dashed'} rgba(251,191,36,0.4)`,color:'#FDE68A'}}>{input||'?'}</div>
          {mode==='total'&&<span className="text-lg text-white/40">TL</span>}
        </div>
      </div>
      <div className="flex gap-1.5 justify-center flex-wrap" style={{maxWidth:340}}>
        {[1,2,3,4,5,6,7,8,9,0].map(n=><motion.button key={n} disabled={!!feedback} className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30" style={{background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.08)'}} whileTap={{scale:0.92}} onClick={()=>!feedback&&input.length<2&&setInput(v=>v+n)}>{n}</motion.button>)}
        <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold" style={{background:'rgba(239,68,68,0.1)',color:'#FCA5A5'}} onClick={()=>setInput('')}>Sil</motion.button>
        <motion.button disabled={!!feedback||!input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30" style={{background:'rgba(52,211,153,0.12)',color:'#6EE7B7'}} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>
      <AnimatePresence>{feedback&&<motion.span className="text-5xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>{feedback==='correct'?'🌟':'💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
