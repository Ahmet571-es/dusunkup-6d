import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type GeoMode = 'identify' | 'properties' | 'spatial'
const SHAPES = [
  { name: 'Üçgen', sides: 3, svg: 'M25,5 L45,40 L5,40 Z', color: '#EF4444' },
  { name: 'Kare', sides: 4, svg: 'M8,8 L42,8 L42,42 L8,42 Z', color: '#3B82F6' },
  { name: 'Dikdörtgen', sides: 4, svg: 'M5,12 L45,12 L45,38 L5,38 Z', color: '#22C55E' },
  { name: 'Beşgen', sides: 5, svg: 'M25,5 L45,20 L38,42 L12,42 L5,20 Z', color: '#A855F7' },
  { name: 'Altıgen', sides: 6, svg: 'M25,5 L43,15 L43,35 L25,45 L7,35 L7,15 Z', color: '#F59E0B' },
  { name: 'Daire', sides: 0, svg: '', color: '#EC4899' },
]

export default function GeometriKenti({ session, state }: { session: SessionManager; state: SessionState }) {
  const [shape, setShape] = useState(SHAPES[0])
  const [mode, setMode] = useState<GeoMode>('identify')
  const [options, setOptions] = useState<string[]>([])
  const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [rotation, setRotation] = useState(0)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    setShape(s)
    setRotation(Math.floor(Math.random() * 360))
    const m = (['identify', 'properties', 'spatial'] as const)[round % 3]
    setMode(m)

    if (m === 'identify') {
      const opts = SHAPES.sort(() => Math.random() - 0.5).slice(0, 4).map(sh => sh.name)
      if (!opts.includes(s.name)) opts[0] = s.name
      setOptions(opts.sort(() => Math.random() - 0.5))
      setCorrectIdx(opts.sort(() => Math.random() - 0.5).indexOf(s.name))
      // Re-sort and find correct
      const sorted = [...opts].sort(() => Math.random() - 0.5)
      setOptions(sorted)
      setCorrectIdx(sorted.indexOf(s.name))
    } else if (m === 'properties') {
      const opts = ['3', '4', '5', '6', '0 (yuvarlak)']
      setOptions(opts)
      setCorrectIdx(opts.indexOf(s.sides === 0 ? '0 (yuvarlak)' : String(s.sides)))
    } else {
      setOptions(['Üstte', 'Altta', 'Solda', 'Sağda'])
      setCorrectIdx(Math.floor(Math.random() * 4))
    }
    setFeedback(null)
    stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (idx: number) => {
    if (feedback) return
    const correct = idx === correctIdx
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif3_geometri', mode, shape: shape.name, rotation } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 800 : 700)
  }

  const modeQ = { identify: 'Bu şeklin adı ne?', properties: `Bu şeklin kaç kenarı var?`, spatial: 'Kırmızı nokta şeklin neresinde?' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.15)' }}>🏙️ {modeQ[mode]}</span>
      <div className="w-40 h-40 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <motion.div style={{ transform: `rotate(${rotation}deg)` }} key={round} initial={{ scale: 0 }} animate={{ scale: 1 }}>
          {shape.sides === 0 ? (
            <svg width="80" height="80"><circle cx="40" cy="40" r="30" fill={shape.color + '40'} stroke={shape.color} strokeWidth="2" /></svg>
          ) : (
            <svg width="50" height="50" viewBox="0 0 50 50"><path d={shape.svg} fill={shape.color + '30'} stroke={shape.color} strokeWidth="2" /></svg>
          )}
        </motion.div>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {options.map((opt, i) => (
          <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(i)}>{opt}</motion.button>
        ))}
      </div>
      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
