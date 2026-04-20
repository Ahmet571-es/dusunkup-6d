/**
 * Para Pazarı — Gerçek Hayat Matematik Transferi
 * 5 Mod: Fiyat Sayma → Toplam Hesap → Üstü Kalma → Bütçe Planlama → Karşılaştırmalı Alışveriş
 * TL madeni para ve kağıt para görselleri, alışveriş listesi, bütçe takibi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type ParaMode = 'count_coins' | 'total' | 'change' | 'compare' | 'select_coins'

const PRODUCTS = [
  { name: 'Elma', price: 3, emoji: '🍎', category: 'meyve' },
  { name: 'Armut', price: 4, emoji: '🍐', category: 'meyve' },
  { name: 'Ekmek', price: 5, emoji: '🍞', category: 'temel' },
  { name: 'Süt', price: 7, emoji: '🥛', category: 'temel' },
  { name: 'Peynir', price: 9, emoji: '🧀', category: 'temel' },
  { name: 'Defter', price: 4, emoji: '📓', category: 'kırtasiye' },
  { name: 'Kalem', price: 2, emoji: '✏️', category: 'kırtasiye' },
  { name: 'Silgi', price: 1, emoji: '🧽', category: 'kırtasiye' },
  { name: 'Çikolata', price: 6, emoji: '🍫', category: 'atıştırma' },
  { name: 'Bisküvi', price: 4, emoji: '🍪', category: 'atıştırma' },
  { name: 'Su', price: 2, emoji: '💧', category: 'içecek' },
  { name: 'Meyve Suyu', price: 8, emoji: '🧃', category: 'içecek' },
]

const COINS = [
  { value: 1, label: '1 TL', color: '#C0C0C0', size: 24 },
  { value: 5, label: '5 TL', color: '#FFD700', size: 26 },
  { value: 10, label: '10 TL', color: '#22C55E', size: 30 },
  { value: 20, label: '20 TL', color: '#3B82F6', size: 32 },
  { value: 50, label: '50 TL', color: '#A855F7', size: 34 },
]

function CoinSVG({ coin, size = 28 }: { coin: typeof COINS[0]; size?: number }) {
  const id = coin.color.replace('#','')
  return (
    <svg width={size} height={size} viewBox="0 0 30 30">
      <defs>
        <radialGradient id={`cg_${id}`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="40%" stopColor={coin.color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={coin.color} stopOpacity="0.5" />
        </radialGradient>
        <filter id={`cgw_${id}`}><feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={coin.color} floodOpacity="0.45" /></filter>
      </defs>
      <circle cx="15" cy="15" r="13" fill={`url(#cg_${id})`} stroke={coin.color} strokeWidth="1.5" strokeOpacity="0.6" filter={`url(#cgw_${id})`} />
      <circle cx="15" cy="15" r="9.5" fill="none" stroke="white" strokeWidth="0.4" opacity="0.15" />
      <ellipse cx="11" cy="10" rx="4" ry="3" fill="white" opacity="0.15" transform="rotate(-15 11 10)" />
      <text x="15" y="18" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" opacity="0.9">{coin.value}</text>
    </svg>
  )
}

function PriceTag({ item }: { item: typeof PRODUCTS[0] }) {
  return (
    <motion.div className="px-3 py-3 rounded-xl text-center min-w-[72px]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="text-2xl block mb-1">{item.emoji}</span>
      <span className="text-[10px] text-white/40 block">{item.name}</span>
      <div className="mt-1 px-2 py-0.5 rounded-md inline-block" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
        <span className="text-xs font-black text-yellow-300">{item.price} TL</span>
      </div>
    </motion.div>
  )
}

export default function ParaPazari({ session, state }: { session: SessionManager; state: SessionState }) {
  const [items, setItems] = useState<typeof PRODUCTS[0][]>([])
  const [mode, setMode] = useState<ParaMode>('total')
  const [budget, setBudget] = useState(20)
  const [coins, setCoins] = useState<typeof COINS[0][]>([])
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const stimRef = useRef(Date.now())
  const modes: ParaMode[] = ['count_coins', 'total', 'change', 'compare', 'select_coins']

  useEffect(() => {
    const m = modes[Math.floor(round / 3) % modes.length]; setMode(m)

    if (m === 'count_coins') {
      // Tüm madeni paralar artık havuzda (1, 5, 10, 20, 50 TL)
      const coinSet: typeof COINS[0][] = []
      const numCoins = 3 + Math.floor(Math.random() * 4)
      // Zorluk: başta düşük değerler ağırlık, ileri turlarda 20/50 TL de dahil
      const poolSize = Math.min(5, 3 + Math.floor(round / 4))
      for (let i = 0; i < numCoins; i++) {
        coinSet.push(COINS[Math.floor(Math.random() * poolSize)])
      }
      setCoins(coinSet)
      setItems([])
    } else if (m === 'select_coins') {
      // Hangi paralarla ödersin? Tek ürün, birden fazla madeni para kombinasyonu
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
      setItems([product])
      setCoins([])
    } else if (m === 'compare') {
      // Fiyatı farklı 2 ürün seç (aynı fiyatlı olmasın)
      const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5)
      let pair = shuffled.slice(0, 2)
      let guard = 0
      while (pair[0].price === pair[1].price && guard < 20) {
        pair = [...PRODUCTS].sort(() => Math.random() - 0.5).slice(0, 2)
        guard++
      }
      setItems(pair)
      setCoins([])
    } else {
      const count = 2 + Math.floor(Math.random() * 2)
      const selected = [...PRODUCTS].sort(() => Math.random() - 0.5).slice(0, count)
      setItems(selected)
      setCoins([])
      const total = selected.reduce((s, i) => s + i.price, 0)
      if (m === 'change') {
        // Budget mutlaka total'den büyük olmalı
        setBudget(total + 3 + Math.floor(Math.random() * 15))
      }
    }
    setInput(''); setFeedback(null); setShowHint(false); stimRef.current = Date.now()
  }, [round])

  const total = items.reduce((s, i) => s + i.price, 0)
  const coinTotal = coins.reduce((s, c) => s + c.value, 0)

  const getAnswer = (): number => {
    switch (mode) {
      case 'count_coins': return coinTotal
      case 'total': return total
      case 'change': return budget - total
      case 'select_coins': return items[0]?.price || 0
      case 'compare': return items.length >= 2 ? Math.abs(items[0].price - items[1].price) : 0
      default: return 0
    }
  }

  const getQuestion = (): string => {
    switch (mode) {
      case 'count_coins': return 'Bu paraların toplamı kaç TL?'
      case 'total': return 'Sepetteki ürünlerin toplam fiyatı kaç TL?'
      case 'change': return `${budget} TL verdin. Üstü kaç TL kalır?`
      case 'select_coins': return `${items[0]?.name} için tam ne kadar ödemelisin?`
      case 'compare': return items.length >= 2 ? `${items[0].name} ile ${items[1].name} arasındaki fiyat farkı kaç TL?` : ''
      default: return ''
    }
  }

  const getHint = (): string => {
    switch (mode) {
      case 'count_coins': return `Paraları büyükten küçüğe topla: ${[...coins].sort((a, b) => b.value - a.value).map(c => c.value).join(' + ')}`
      case 'total': return `Fiyatları topla: ${items.map(i => i.price).join(' + ')} = ?`
      case 'change': return `Önce toplam: ${total} TL. Üstü: ${budget} - ${total} = ?`
      case 'select_coins': return `Fiyat etiketine bak: ${items[0]?.price} TL`
      case 'compare': return items.length >= 2 ? `Büyükten küçüğü çıkar: ${Math.max(items[0].price, items[1].price)} - ${Math.min(items[0].price, items[1].price)} = ?` : ''
      default: return ''
    }
  }

  const handleSubmit = () => {
    if (feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const answer = getAnswer()
    const correct = val === answer
    if (correct) setStreak(s => s + 1); else setStreak(0)

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif2_para_${mode}`, mode, total, budget, answer: val, correctAnswer: answer, items: items.map(i => i.name), hintUsed: showHint, streak },
    })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  const answer = getAnswer()
  const modeLabels: Record<ParaMode, string> = { count_coins: '🪙 Para Say', total: '🛒 Toplam Hesapla', change: '💵 Üstü Hesapla', select_coins: '💳 Tam Öde', compare: '⚖️ Fiyat Karşılaştır' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#FDE68A', border: '1px solid rgba(245,158,11,0.15)' }}>💰 {modeLabels[mode]}</span>
        {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
      </div>

      <div className="w-full max-w-lg rounded-2xl p-4" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(245,158,11,0.08)' }}>
        {/* Budget display */}
        {mode === 'change' && (
          <div className="flex items-center justify-center gap-2 mb-3 p-2 rounded-lg" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.12)' }}>
            <span className="text-lg">💵</span>
            <span className="text-lg font-black text-yellow-300">{budget} TL</span>
            <span className="text-xs text-white/30">bütçe</span>
          </div>
        )}

        {/* Coins display */}
        {mode === 'count_coins' && (
          <div className="flex gap-2 justify-center flex-wrap mb-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            {coins.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <CoinSVG coin={c} size={c.size} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Products display */}
        {items.length > 0 && (
          <div className="flex justify-center gap-3 flex-wrap mb-3">
            {items.map((item, i) => <PriceTag key={i} item={item} />)}
          </div>
        )}

        {/* Calculation helper */}
        {mode === 'total' && items.length > 1 && (
          <p className="text-xs text-center text-white/20 mb-2">{items.map(i => i.price).join(' + ')} = ?</p>
        )}
        {mode === 'change' && (
          <p className="text-xs text-center text-white/20 mb-2">{budget} - {total} = ?</p>
        )}

        {/* Question */}
        <p className="text-sm font-bold text-green-300 text-center">{getQuestion()}</p>

        {/* Hint */}
        {!showHint && !feedback && (
          <button onClick={() => setShowHint(true)} className="block mx-auto mt-2 text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>
        )}
        {showHint && <p className="text-xs text-blue-300/50 text-center mt-2">💡 {getHint()}</p>}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={3} placeholder="?"
          className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none focus:border-yellow-400/40" />
        <span className="text-sm text-white/40">TL</span>
        <motion.button disabled={!input || !!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
          whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>

      {feedback === 'wrong' && <span className="text-xs text-orange-300">Doğru cevap: {answer} TL</span>}
      <AnimatePresence>{feedback === 'correct' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}><StarSVG size={56} filled glowing /></motion.div>}</AnimatePresence>
    </div>
  )
}
