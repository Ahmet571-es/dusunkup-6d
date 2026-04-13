/**
 * Geometri Kenti — Şekil Özellikleri + Uzamsal Muhakeme
 * 4 Mod: 2D Tanıma → Özellik Sayma → Mental Rotation → 3D Tanıma
 * SVG şekiller, rotasyonlu gösterim, kenar/köşe sayma
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type GeoMode = 'name' | 'sides' | 'rotation' | 'angles'

const SHAPES = [
  { name: 'Üçgen', sides: 3, angles: 3, svg: 'M25,5 L45,42 L5,42 Z', color: '#EF4444' },
  { name: 'Kare', sides: 4, angles: 4, svg: 'M8,8 L42,8 L42,42 L8,42 Z', color: '#3B82F6' },
  { name: 'Dikdörtgen', sides: 4, angles: 4, svg: 'M4,12 L46,12 L46,38 L4,38 Z', color: '#22C55E' },
  { name: 'Beşgen', sides: 5, angles: 5, svg: 'M25,3 L47,18 L39,43 L11,43 L3,18 Z', color: '#A855F7' },
  { name: 'Altıgen', sides: 6, angles: 6, svg: 'M25,3 L44,14 L44,36 L25,47 L6,36 L6,14 Z', color: '#F59E0B' },
  { name: 'Eşkenar Dörtgen', sides: 4, angles: 4, svg: 'M25,5 L45,25 L25,45 L5,25 Z', color: '#EC4899' },
  { name: 'Paralelkenar', sides: 4, angles: 4, svg: 'M15,8 L46,8 L35,42 L4,42 Z', color: '#06B6D4' },
  { name: 'Yamuk', sides: 4, angles: 4, svg: 'M15,10 L38,10 L45,40 L5,40 Z', color: '#F97316' },
]

function ShapeSVG({ shape, rotation = 0, size = 100 }: { shape: typeof SHAPES[0]; rotation?: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <g transform={`rotate(${rotation} 25 25)`}>
        <path d={shape.svg} fill={shape.color + '25'} stroke={shape.color} strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

export default function GeometriKenti({ session, state }: { session: SessionManager; state: SessionState }) {
  const [shape, setShape] = useState(SHAPES[0])
  const [mode, setMode] = useState<GeoMode>('name')
  const [rotation, setRotation] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    setShape(s)
    const rot = [0, 15, 30, 45, 60, 90, 120, 180][Math.floor(Math.random() * 8)]
    setRotation(rot)
    const modes: GeoMode[] = ['name', 'sides', 'rotation', 'angles']
    const m = modes[Math.floor(round / 3) % modes.length]; setMode(m)

    if (m === 'name') {
      const opts = SHAPES.sort(() => Math.random() - 0.5).slice(0, 4).map(sh => sh.name)
      if (!opts.includes(s.name)) opts[0] = s.name
      const sorted = opts.sort(() => Math.random() - 0.5)
      setOptions(sorted); setCorrectIdx(sorted.indexOf(s.name))
    } else if (m === 'sides') {
      const opts = ['3', '4', '5', '6']
      setOptions(opts); setCorrectIdx(opts.indexOf(String(s.sides)))
    } else if (m === 'angles') {
      const opts = ['3', '4', '5', '6']
      setOptions(opts); setCorrectIdx(opts.indexOf(String(s.angles)))
    } else {
      // Rotation: which shape is the same but rotated?
      const opts = SHAPES.sort(() => Math.random() - 0.5).slice(0, 4).map(sh => sh.name)
      if (!opts.includes(s.name)) opts[0] = s.name
      const sorted = opts.sort(() => Math.random() - 0.5)
      setOptions(sorted); setCorrectIdx(sorted.indexOf(s.name))
    }
    setFeedback(null); setShowHint(false); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (idx: number) => {
    if (feedback) return; const correct = idx === correctIdx
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif3_geometri_${mode}`, mode, shape: shape.name, rotation } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 800 : 700)
  }

  const modeQ: Record<GeoMode, string> = { name: 'Bu şeklin adı ne?', sides: 'Kaç kenarı var?', angles: 'Kaç köşesi var?', rotation: 'Döndürülmüş şekil hangisi?' }
  const hints: Record<GeoMode, string> = { name: 'Kenar sayısını say, sonra adını bul', sides: 'Her düz çizgi bir kenardır', angles: 'İki kenarın birleştiği yer bir köşedir', rotation: 'Şekli kafanda çevir — kenar sayısı değişmez' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: `${shape.color}15`, color: shape.color, border: `1px solid ${shape.color}30` }}>🏙️ {modeQ[mode]}</span>

      <div className="w-full max-w-md rounded-2xl p-5 flex flex-col items-center" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div key={round} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}>
          <ShapeSVG shape={shape} rotation={rotation} size={120} />
        </motion.div>
        <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
          <span>Renk: <span style={{ color: shape.color }}>●</span></span>
          {rotation > 0 && <span>Döndürme: {rotation}°</span>}
        </div>
        {!showHint && <button onClick={() => setShowHint(true)} className="mt-2 text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
        {showHint && <p className="text-xs text-blue-300/50 mt-2">💡 {hints[mode]}</p>}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {options.map((opt, i) => (
          <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(i)}>{opt}</motion.button>
        ))}
      </div>

      {feedback === 'wrong' && <p className="text-xs text-orange-300">Doğru: {shape.name} ({shape.sides} kenar, {shape.angles} köşe)</p>}
      <AnimatePresence>{feedback === 'correct' && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>🌟</motion.span>}</AnimatePresence>
    </div>
  )
}
