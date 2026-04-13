/**
 * Para Pazarı — Gerçek Hayat Transferi
 * 4 Mod: Sayma → Toplam → Üstü Kalma → Bütçe Planlama
 * TL birimleri, bozuk para + kağıt para görselleri
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type ParaMode = 'total' | 'change' | 'budget' | 'compare'
const ITEMS = [
  { name: 'Elma', price: 3, emoji: '🍎' }, { name: 'Ekmek', price: 5, emoji: '🍞' }, { name: 'Süt', price: 7, emoji: '🥛' },
  { name: 'Defter', price: 4, emoji: '📓' }, { name: 'Kalem', price: 2, emoji: '✏️' }, { name: 'Silgi', price: 1, emoji: '🧽' },
  { name: 'Çikolata', price: 6, emoji: '🍫' }, { name: 'Su', price: 3, emoji: '💧' }, { name: 'Meyve Suyu', price: 8, emoji: '🧃' },
  { name: 'Bisküvi', price: 4, emoji: '🍪' }, { name: 'Peynir', price: 9, emoji: '🧀' },
]

export default function ParaPazari({ session, state }: { session: SessionManager; state: SessionState }) {
  const [items, setItems] = useState<typeof ITEMS[0][]>([])
  const [mode, setMode] = useState<ParaMode>('total')
  const [budget, setBudget] = useState(20)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const modes: ParaMode[] = ['total', 'change', 'budget', 'compare']

  useEffect(() => {
    const m = modes[Math.floor(round / 3) % modes.length]; setMode(m)
    const count = m === 'compare' ? 2 : 2 + Math.floor(Math.random() * 2)
    const selected = [...ITEMS].sort(() => Math.random() - 0.5).slice(0, count)
    setItems(selected)
    const total = selected.reduce((s, i) => s + i.price, 0)
    if (m === 'change' || m === 'budget') setBudget(total + 2 + Math.floor(Math.random() * 10))
    setInput(''); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const total = items.reduce((s, i) => s + i.price, 0)
  const answer = mode === 'total' ? total : mode === 'change' ? budget - total : mode === 'budget' ? budget - total : Math.max(...items.map(i => i.price))

  const questionText = {
    total: 'Sepetteki ürünlerin toplam fiyatı kaç TL?',
    change: `${budget} TL verdin. Üstü kaç TL?`,
    budget: `${budget} TL bütçen var. Alışverişten kaç TL artıyor?`,
    compare: 'Hangi ürün daha pahalı? Kaç TL?',
  }[mode]

  const handleSubmit = () => {
    if (feedback) return; const val = parseInt(input); if (isNaN(val)) return; const correct = val === answer
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif2_para', mode, total, budget, items: items.map(i => i.name) } })
    setFeedback(correct ? 'correct' : 'wrong'); setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#FDE68A', border: '1px solid rgba(245,158,11,0.15)' }}>💰 {questionText}</span>
      <div className="w-full max-w-lg rounded-2xl p-4" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(mode === 'change' || mode === 'budget') && (
          <div className="flex items-center justify-center gap-2 mb-3 p-2 rounded-lg" style={{ background: 'rgba(234,179,8,0.08)' }}>
            <span className="text-xl">💵</span>
            <span className="text-lg font-bold text-yellow-300">{budget} TL</span>
          </div>
        )}
        <div className="flex justify-center gap-3 flex-wrap mb-3">
          {items.map((item, i) => (
            <motion.div key={i} className="px-4 py-3 rounded-xl text-center min-w-[70px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <span className="text-2xl block mb-1">{item.emoji}</span>
              <span className="text-[10px] text-white/50 block">{item.name}</span>
              <span className="text-sm font-bold text-yellow-300">{item.price} TL</span>
            </motion.div>
          ))}
        </div>
        {mode === 'total' && items.length > 1 && (
          <p className="text-xs text-center text-white/30">{items.map(i => `${i.price}`).join(' + ')} = ?</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={3} placeholder="?" className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none" />
        <span className="text-sm text-white/40">TL</span>
        <motion.button disabled={!input || !!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>
      {feedback === 'wrong' && <span className="text-xs text-orange-300">Doğru: {answer} TL</span>}
      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
