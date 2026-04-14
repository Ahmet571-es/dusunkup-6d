/**
 * Alan-Çevre Kalesi — Ölçme Geometri
 * 5 Mod: Çevre Hesapla → Alan Hesapla → Birleşik Şekil → Birim Dönüşüm → Ters Problem
 * SVG grid görseli, formül gösterimi, adım adım çözüm
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type AreaMode = 'perimeter' | 'area' | 'composite' | 'reverse_p' | 'reverse_a'

interface ShapeProblem {
  w: number; h: number; w2?: number; h2?: number
  mode: AreaMode; answer: number; formula: string; hint: string; unit: string
}

function generate(mode: AreaMode): ShapeProblem {
  const w = 2 + Math.floor(Math.random() * 7); const h = 2 + Math.floor(Math.random() * 7)

  switch (mode) {
    case 'perimeter':
      return { w, h, mode, answer: 2 * (w + h), formula: `Çevre = 2 × (${w} + ${h})`, hint: 'Çevre = 2 × (uzunluk + genişlik)', unit: 'br' }
    case 'area':
      return { w, h, mode, answer: w * h, formula: `Alan = ${w} × ${h}`, hint: 'Alan = uzunluk × genişlik', unit: 'br²' }
    case 'composite': {
      const w2 = 1 + Math.floor(Math.random() * 3); const h2 = 1 + Math.floor(Math.random() * 3)
      return { w, h, w2, h2, mode, answer: w * h + w2 * h2, formula: `Alan = (${w}×${h}) + (${w2}×${h2}) = ${w * h} + ${w2 * h2}`, hint: 'İki dikdörtgenin alanını ayrı hesapla, sonra topla', unit: 'br²' }
    }
    case 'reverse_p': {
      const perimeter = 2 * (w + h)
      return { w: perimeter, h: w, mode, answer: h, formula: `Çevre = 2×(${w}+?) = ${perimeter} → ? = ${h}`, hint: `${perimeter} ÷ 2 = ${perimeter / 2}, sonra ${perimeter / 2} - ${w} = ?`, unit: 'br' }
    }
    case 'reverse_a': {
      const area = w * h
      return { w: area, h: w, mode, answer: h, formula: `Alan = ${w} × ? = ${area} → ? = ${h}`, hint: `${area} ÷ ${w} = ?`, unit: 'br' }
    }
  }
}

function GridSVG({ w, h, mode, w2, h2 }: { w: number; h: number; mode: AreaMode; w2?: number; h2?: number }) {
  const cellSize = Math.min(20, 160 / Math.max(w, h))
  const isPerimeter = mode === 'perimeter'
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${w}, ${cellSize}px)`, gap: 0 }}>
          {Array.from({ length: w * h }, (_, i) => (
            <motion.div key={i} style={{ width: cellSize, height: cellSize }}
              className={`border ${isPerimeter ? 'border-cyan-500/20' : 'border-green-500/20'}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.005 }}>
              <div className="w-full h-full" style={{ background: isPerimeter ? 'transparent' : 'rgba(52,211,153,0.06)' }} />
            </motion.div>
          ))}
        </div>
        {isPerimeter && <div className="absolute inset-0" style={{ border: '3px solid #06B6D4', borderRadius: 2, boxShadow: '0 0 12px rgba(6,182,212,0.3), inset 0 0 8px rgba(6,182,212,0.1)' }} />}
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-green-300">{w} br</span>
        <span className="absolute top-1/2 -right-9 -translate-y-1/2 text-xs font-bold text-green-300">{h} br</span>
      </div>
      {/* Composite second rectangle */}
      {mode === 'composite' && w2 && h2 && (
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-sm">+</span>
          <div className="relative">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${w2}, ${cellSize}px)`, gap: 0 }}>
              {Array.from({ length: w2 * h2 }, (_, i) => (
                <div key={i} style={{ width: cellSize, height: cellSize }} className="border border-blue-500/20">
                  <div className="w-full h-full" style={{ background: 'rgba(59,130,246,0.06)' }} />
                </div>
              ))}
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-300">{w2}×{h2}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AlanCevreKalesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState<ShapeProblem>(generate('perimeter'))
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showFormula, setShowFormula] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const stimRef = useRef(Date.now())
  const modes: AreaMode[] = ['perimeter', 'area', 'composite', 'reverse_p', 'reverse_a']

  useEffect(() => {
    const m = modes[Math.floor(round / 2) % modes.length]
    setProblem(generate(m)); setInput(''); setFeedback(null)
    setShowFormula(false); setShowHint(false); stimRef.current = Date.now()
  }, [round])

  const handleSubmit = () => {
    if (feedback) return; const val = parseInt(input); if (isNaN(val)) return
    const correct = val === problem.answer
    if (correct) setStreak(s => s + 1); else { setStreak(0); setShowFormula(true) }

    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif4_alan_cevre_${problem.mode}`, mode: problem.mode, w: problem.w, h: problem.h, streak, hintUsed: showHint } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 1800)
  }

  const modeLabels: Record<AreaMode, string> = { perimeter: '📏 Çevreyi Hesapla', area: '📐 Alanı Hesapla', composite: '🧩 Birleşik Şekil', reverse_p: '🔄 Çevreden Kenar Bul', reverse_a: '🔄 Alandan Kenar Bul' }
  const modeQuestions: Record<AreaMode, string> = {
    perimeter: `${problem.w}×${problem.h} dikdörtgenin çevresi kaç birim?`,
    area: `${problem.w}×${problem.h} dikdörtgenin alanı kaç birim²?`,
    composite: `İki dikdörtgenin toplam alanı kaç birim²?`,
    reverse_p: `Çevresi ${problem.w} br, bir kenarı ${problem.h} br. Diğer kenar?`,
    reverse_a: `Alanı ${problem.w} br², bir kenarı ${problem.h} br. Diğer kenar?`,
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.15)' }}>🏰 {modeLabels[problem.mode]}</span>
        {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
      </div>

      <div className="w-full max-w-lg rounded-2xl p-4" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(16,185,129,0.08)' }}>
        {/* Grid visual (not for reverse modes) */}
        {(problem.mode === 'perimeter' || problem.mode === 'area' || problem.mode === 'composite') && (
          <div className="flex justify-center mb-4">
            <GridSVG w={problem.w} h={problem.h} mode={problem.mode} w2={problem.w2} h2={problem.h2} />
          </div>
        )}

        {/* Question */}
        <p className="text-sm font-bold text-green-300 text-center">{modeQuestions[problem.mode]}</p>

        {/* Hint */}
        {!showHint && !feedback && <button onClick={() => setShowHint(true)} className="block mx-auto mt-2 text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
        {showHint && <p className="text-xs text-blue-300/50 text-center mt-1">💡 {problem.hint}</p>}

        {/* Formula (shown on wrong) */}
        {showFormula && (
          <motion.p className="text-xs text-orange-300 text-center mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            📝 {problem.formula} = {problem.answer} {problem.unit}
          </motion.p>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} maxLength={4} placeholder="?"
          className="w-20 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none focus:border-yellow-400/40" />
        <span className="text-sm text-white/40">{problem.unit}</span>
        <motion.button disabled={!input || !!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
          whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>

      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
