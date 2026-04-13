/**
 * Alan-Çevre Kalesi — Ölçme ve Hesaplama
 * 4 Mod: Çevre → Alan → Birim Dönüşüm → Karmaşık Şekiller
 * SVG grid görseli, adım adım hesaplama
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type AreaMode = 'perimeter' | 'area' | 'composite' | 'convert'
interface ShapeProblem { w: number; h: number; w2?: number; h2?: number; mode: AreaMode; answer: number; formula: string }

function generate(mode: AreaMode): ShapeProblem {
  const w = 2 + Math.floor(Math.random() * 8); const h = 2 + Math.floor(Math.random() * 8)
  if (mode === 'perimeter') return { w, h, mode, answer: 2 * (w + h), formula: `2 × (${w} + ${h})` }
  if (mode === 'area') return { w, h, mode, answer: w * h, formula: `${w} × ${h}` }
  if (mode === 'composite') {
    const w2 = 1 + Math.floor(Math.random() * 3); const h2 = 1 + Math.floor(Math.random() * 3)
    return { w, h, w2, h2, mode, answer: w * h + w2 * h2, formula: `(${w}×${h}) + (${w2}×${h2})` }
  }
  // convert: cm² to m² etc
  const area = w * h * 100
  return { w, h, mode, answer: w * h, formula: `${area} cm² = ? dm²` }
}

export default function AlanCevreKalesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState<ShapeProblem>(generate('perimeter'))
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0); const [showFormula, setShowFormula] = useState(false)
  const stimRef = useRef(Date.now())
  const modes: AreaMode[] = ['perimeter', 'area', 'composite', 'perimeter']

  useEffect(() => {
    const m = modes[round % modes.length]
    setProblem(generate(m)); setInput(''); setFeedback(null); setShowFormula(false); stimRef.current = Date.now()
  }, [round])

  const handleSubmit = () => {
    if (feedback) return; const val = parseInt(input); if (isNaN(val)) return; const correct = val === problem.answer
    if (!correct) setShowFormula(true)
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif4_alan_cevre_${problem.mode}`, mode: problem.mode, w: problem.w, h: problem.h } })
    setFeedback(correct ? 'correct' : 'wrong'); setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 1500)
  }

  const cellSize = Math.min(18, 140 / Math.max(problem.w, problem.h))
  const modeLabels: Record<AreaMode, string> = { perimeter: '📏 Çevreyi Hesapla', area: '📐 Alanı Hesapla', composite: '🧩 Birleşik Şekil', convert: '🔄 Birim Dönüştür' }
  const units: Record<AreaMode, string> = { perimeter: 'br', area: 'br²', composite: 'br²', convert: 'dm²' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.15)' }}>🏰 {modeLabels[problem.mode]}</span>
      <div className="w-full max-w-md rounded-2xl p-4 flex flex-col items-center" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Grid visual */}
        <div className="relative mb-3">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${problem.w}, ${cellSize}px)`, gap: 0 }}>
            {Array.from({ length: problem.w * problem.h }, (_, i) => <div key={i} style={{ width: cellSize, height: cellSize, border: '0.5px solid rgba(52,211,153,0.25)', background: problem.mode === 'area' || problem.mode === 'composite' ? 'rgba(52,211,153,0.06)' : 'transparent' }} />)}
          </div>
          {problem.mode === 'perimeter' && <div className="absolute inset-0" style={{ border: '2.5px solid #34D399', borderRadius: 2 }} />}
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-green-300">{problem.w} br</span>
          <span className="absolute top-1/2 -right-8 -translate-y-1/2 text-xs font-bold text-green-300 whitespace-nowrap">{problem.h} br</span>
        </div>
        {/* Composite second rectangle */}
        {problem.mode === 'composite' && problem.w2 && problem.h2 && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/40 text-xs">+</span>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${problem.w2}, ${cellSize}px)`, gap: 0 }}>
              {Array.from({ length: problem.w2 * problem.h2 }, (_, i) => <div key={i} style={{ width: cellSize, height: cellSize, border: '0.5px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.06)' }} />)}
            </div>
            <span className="text-xs text-blue-300">({problem.w2}×{problem.h2})</span>
          </div>
        )}
        {showFormula && <p className="text-xs text-orange-300 mt-2">Formül: {problem.formula} = {problem.answer}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={4} placeholder="?" className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none" />
        <span className="text-sm text-white/40">{units[problem.mode]}</span>
        <motion.button disabled={!input || !!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30" style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} whileTap={{ scale: 0.92 }} onClick={handleSubmit}>✓</motion.button>
      </div>
      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
