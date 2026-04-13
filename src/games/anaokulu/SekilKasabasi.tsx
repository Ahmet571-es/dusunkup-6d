/**
 * Şekil Kasabası — Geometrik Algı + Sınıflandırma
 * 4 Mod: Şekil Tanıma → İsimlendirme → Sınıflandırma → Yapı Oluşturma
 * SVG şekiller, renk+boyut çeşitliliği, rotasyonlu tanıma
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type ShapeMode = 'find' | 'name' | 'classify' | 'build'

const SHAPES = [
  { name: 'Daire', path: '', isCircle: true, color: '#EF4444', sides: 0 },
  { name: 'Kare', path: 'M8,8 L42,8 L42,42 L8,42 Z', isCircle: false, color: '#3B82F6', sides: 4 },
  { name: 'Üçgen', path: 'M25,5 L45,42 L5,42 Z', isCircle: false, color: '#22C55E', sides: 3 },
  { name: 'Dikdörtgen', path: 'M4,14 L46,14 L46,36 L4,36 Z', isCircle: false, color: '#F59E0B', sides: 4 },
  { name: 'Yıldız', path: 'M25,2 L30,18 L47,18 L34,28 L39,44 L25,34 L11,44 L16,28 L3,18 L20,18 Z', isCircle: false, color: '#A855F7', sides: 10 },
]

function ShapeSVG({ shape, size = 60, rotation = 0, scale = 1 }: { shape: typeof SHAPES[0]; size?: number; rotation?: number; scale?: number }) {
  const s = size * scale
  return (
    <svg width={s} height={s} viewBox="0 0 50 50">
      <g transform={`rotate(${rotation} 25 25)`}>
        {shape.isCircle
          ? <circle cx="25" cy="25" r="18" fill={shape.color + '30'} stroke={shape.color} strokeWidth="2.5" />
          : <path d={shape.path} fill={shape.color + '25'} stroke={shape.color} strokeWidth="2.5" strokeLinejoin="round" />}
      </g>
    </svg>
  )
}

export default function SekilKasabasi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [target, setTarget] = useState(SHAPES[0])
  const [mode, setMode] = useState<ShapeMode>('find')
  const [allShapes, setAllShapes] = useState<(typeof SHAPES[0] & { rotation: number; id: number })[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: ShapeMode[] = ['find', 'name', 'classify', 'find']
    const m = modes[Math.floor(round / 3) % modes.length]; setMode(m)
    const t = [...SHAPES][Math.floor(Math.random() * SHAPES.length)]; setTarget(t)

    if (m === 'find') {
      const others = [...SHAPES].filter(s => s.name !== t.name).sort(() => Math.random() - 0.5).slice(0, 4)
      const items = [t, ...others].map((s, i) => ({ ...s, rotation: Math.floor(Math.random() * 360), id: i }))
      setAllShapes(items.sort(() => Math.random() - 0.5))
    } else if (m === 'name') {
      const opts = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, 4).map(s => s.name)
      if (!opts.includes(t.name)) opts[0] = t.name
      const sorted = opts.sort(() => Math.random() - 0.5)
      setOptions(sorted); setCorrectIdx(sorted.indexOf(t.name))
    } else if (m === 'classify') {
      // How many sides?
      const opts = ['0 (yuvarlak)', '3', '4', '5+']
      const correct = t.sides === 0 ? '0 (yuvarlak)' : t.sides === 3 ? '3' : t.sides === 4 ? '4' : '5+'
      setOptions(opts); setCorrectIdx(opts.indexOf(correct))
    }
    setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleFindSelect = (shape: typeof SHAPES[0]) => {
    if (feedback) return
    const correct = shape.name === target.name
    if (correct) setStreak(s => s + 1); else setStreak(0)
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `anaokulu_sekil_${mode}`, mode, target: target.name, selected: shape.name, streak } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 800 : 600)
  }

  const handleOptionSelect = (idx: number) => {
    if (feedback) return; const correct = idx === correctIdx
    if (correct) setStreak(s => s + 1); else setStreak(0)
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `anaokulu_sekil_${mode}`, mode, target: target.name, streak } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 800 : 600)
  }

  const modeLabels: Record<ShapeMode, string> = { find: `🔍 ${target.name} bul!`, name: '📝 Bu şeklin adı ne?', classify: '📊 Kaç kenarı var?', build: '🏗️ Şekli oluştur!' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-md justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: `${target.color}15`, color: target.color, border: `1px solid ${target.color}30` }}>🔷 {modeLabels[mode]}</span>
        {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
      </div>

      {/* Target shape display (for name/classify modes) */}
      {(mode === 'name' || mode === 'classify') && (
        <motion.div className="w-32 h-32 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          key={round} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}>
          <ShapeSVG shape={target} size={90} rotation={Math.floor(Math.random() * 45)} />
        </motion.div>
      )}

      {/* Target indicator (for find mode) */}
      {mode === 'find' && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: `${target.color}10`, border: `1px solid ${target.color}20` }}>
          <ShapeSVG shape={target} size={40} />
          <span className="text-sm font-bold" style={{ color: target.color }}>{target.name}</span>
        </div>
      )}

      {/* Find mode: grid of shapes */}
      {mode === 'find' && (
        <div className="flex gap-3 flex-wrap justify-center max-w-md">
          {allShapes.map((s) => (
            <motion.div key={s.id}
              className="w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.08)' }}
              whileHover={{ scale: 1.1, borderColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleFindSelect(s)}>
              <ShapeSVG shape={s} size={55} rotation={s.rotation} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Option buttons (for name/classify modes) */}
      {(mode === 'name' || mode === 'classify') && (
        <div className="flex gap-3 flex-wrap justify-center">
          {options.map((opt, i) => (
            <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
              onClick={() => handleOptionSelect(i)}>{opt}</motion.button>
          ))}
        </div>
      )}

      {feedback === 'wrong' && <p className="text-xs text-orange-300">Bu bir {target.name} ({target.sides === 0 ? 'yuvarlak' : `${target.sides} kenar`})</p>}
      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
