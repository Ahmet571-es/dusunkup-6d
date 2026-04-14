/**
 * Dönüşüm Atölyesi — Birim Dönüştürme
 * 4 Mod: Uzunluk → Kütle → Zaman → Karışık
 * Görsel referanslar, çarpan zinciri, ipucu sistemi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type UnitMode = 'length' | 'mass' | 'time' | 'mixed'

interface Conversion { from: string; to: string; answer: number; hint: string; chain: string; mode: UnitMode; visual: string }

const CONVERSIONS: Conversion[] = [
  // Length
  { from: '1 m', to: 'cm', answer: 100, hint: '1 metre = 100 santimetre', chain: '1 m × 100 = 100 cm', mode: 'length', visual: '📏' },
  { from: '3 m', to: 'cm', answer: 300, hint: '1 m = 100 cm, sonra 3 ile çarp', chain: '3 × 100 = 300', mode: 'length', visual: '📏' },
  { from: '2 km', to: 'm', answer: 2000, hint: '1 km = 1000 m', chain: '2 × 1000 = 2000', mode: 'length', visual: '🛣️' },
  { from: '500 cm', to: 'm', answer: 5, hint: '100 cm = 1 m, böl', chain: '500 ÷ 100 = 5', mode: 'length', visual: '📏' },
  { from: '5000 m', to: 'km', answer: 5, hint: '1000 m = 1 km', chain: '5000 ÷ 1000 = 5', mode: 'length', visual: '🛣️' },
  // Mass
  { from: '1 kg', to: 'g', answer: 1000, hint: '1 kilogram = 1000 gram', chain: '1 × 1000 = 1000', mode: 'mass', visual: '⚖️' },
  { from: '3 kg', to: 'g', answer: 3000, hint: '1 kg = 1000 g', chain: '3 × 1000 = 3000', mode: 'mass', visual: '⚖️' },
  { from: '2000 g', to: 'kg', answer: 2, hint: '1000 g = 1 kg', chain: '2000 ÷ 1000 = 2', mode: 'mass', visual: '⚖️' },
  { from: '500 g', to: 'kg', answer: 0.5, hint: '500 g = yarım kg', chain: '500 ÷ 1000 = 0.5', mode: 'mass', visual: '⚖️' },
  { from: '1 ton', to: 'kg', answer: 1000, hint: '1 ton = 1000 kg', chain: '1 × 1000 = 1000', mode: 'mass', visual: '🚛' },
  // Time
  { from: '1 saat', to: 'dakika', answer: 60, hint: '1 saat = 60 dakika', chain: '1 × 60 = 60', mode: 'time', visual: '⏰' },
  { from: '3 saat', to: 'dakika', answer: 180, hint: '1 saat = 60 dk', chain: '3 × 60 = 180', mode: 'time', visual: '⏰' },
  { from: '120 dakika', to: 'saat', answer: 2, hint: '60 dk = 1 saat', chain: '120 ÷ 60 = 2', mode: 'time', visual: '⏰' },
  { from: '1 gün', to: 'saat', answer: 24, hint: '1 gün = 24 saat', chain: '1 × 24 = 24', mode: 'time', visual: '📅' },
  { from: '1 hafta', to: 'gün', answer: 7, hint: '1 hafta = 7 gün', chain: '1 × 7 = 7', mode: 'time', visual: '📅' },
]

export default function DonusumAtolyesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [conv, setConv] = useState(CONVERSIONS[0])
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showChain, setShowChain] = useState(false)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: UnitMode[] = ['length', 'mass', 'time', 'mixed']
    const m = modes[Math.floor(round / 3) % modes.length]
    const available = m === 'mixed' ? CONVERSIONS : CONVERSIONS.filter(c => c.mode === m)
    setConv(available[Math.floor(Math.random() * available.length)])
    setInput(''); setFeedback(null); setShowHint(false); setShowChain(false); stimRef.current = Date.now()
  }, [round])

  const handleSubmit = () => {
    if (feedback) return
    const val = parseFloat(input); if (isNaN(val)) return
    const correct = val === conv.answer
    if (correct) setStreak(s => s + 1); else { setStreak(0); setShowChain(true) }

    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif4_donusum_${conv.mode}`, mode: conv.mode, from: conv.from, to: conv.to, hintUsed: showHint, streak } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 1800)
  }

  const modeLabels: Record<UnitMode, string> = { length: '📏 Uzunluk', mass: '⚖️ Kütle', time: '⏰ Zaman', mixed: '🔀 Karışık' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-md justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(249,115,22,0.1)', color: '#FDBA74', border: '1px solid rgba(249,115,22,0.15)' }}>🔧 {modeLabels[conv.mode]}</span>
        {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
      </div>

      <div className="w-full max-w-md rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Visual */}
        <div className="text-center mb-4">
          <span className="text-4xl">{conv.visual}</span>
        </div>

        {/* Conversion */}
        <div className="flex items-center justify-center gap-3">
          <div className="px-4 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.03))', border: '1px solid rgba(249,115,22,0.2)', boxShadow: '0 4px 16px rgba(249,115,22,0.1), inset 0 1px 1px rgba(255,255,255,0.03)' }}>
            <span className="text-2xl font-black text-orange-300">{conv.from}</span>
          </div>
          <motion.span className="text-2xl text-white/30" animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
          <div className="flex items-center gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={5} placeholder="?"
              className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none focus:border-yellow-400/40" />
            <span className="text-lg font-bold text-white/40">{conv.to}</span>
          </div>
        </div>

        {/* Reference table */}
        <div className="mt-4 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-[10px] text-white/20 text-center mb-1">Dönüşüm tablosu:</p>
          <div className="flex gap-2 justify-center flex-wrap text-[10px] text-white/30">
            {conv.mode === 'length' && <><span>1 km = 1000 m</span><span>·</span><span>1 m = 100 cm</span></>}
            {conv.mode === 'mass' && <><span>1 ton = 1000 kg</span><span>·</span><span>1 kg = 1000 g</span></>}
            {conv.mode === 'time' && <><span>1 gün = 24 saat</span><span>·</span><span>1 saat = 60 dk</span></>}
            {conv.mode === 'mixed' && <span>Birimi tanı, çarpanı uygula</span>}
          </div>
        </div>

        {/* Hint */}
        {!showHint && !feedback && <button onClick={() => setShowHint(true)} className="block mx-auto mt-3 text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
        {showHint && <p className="text-xs text-blue-300/50 text-center mt-2">💡 {conv.hint}</p>}

        {/* Chain (shown on wrong) */}
        {showChain && (
          <motion.p className="text-xs text-orange-300 text-center mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            📝 Çözüm: {conv.chain} → Cevap: {conv.answer} {conv.to}
          </motion.p>
        )}
      </div>

      <motion.button disabled={!input || !!feedback} className="px-8 py-3 rounded-xl text-sm font-bold disabled:opacity-30"
        style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
        whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Dönüştür ✓</motion.button>

      <AnimatePresence>{feedback === 'correct' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}><StarSVG size={56} filled glowing /></motion.div>}</AnimatePresence>
    </div>
  )
}
