/**
 * Dikkat Denizi — Eriksen Flanker + Visual Search
 * Hedef: Seçici dikkat, odaklanmış dikkat, flanker etkisi ölçümü
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'
import { FishSVG } from '@/components/cinema/characters'

type FlankerType = 'congruent' | 'incongruent' | 'neutral'

interface FlankerTrial {
  target: '←' | '→'
  flankers: string[]
  type: FlankerType
}

const FISH_LEFT = '🐟' // represents ←
const FISH_RIGHT = '🐠' // represents →

function generateTrial(diff: Record<string, number>): FlankerTrial {
  const target: '←' | '→' = Math.random() > 0.5 ? '←' : '→'
  const types: FlankerType[] = ['congruent', 'incongruent', 'neutral']
  const type = types[Math.floor(Math.random() * (2 + (diff.flanker_compatibility || 0 > 2 ? 1 : 0)))]
  
  let flanker: string
  if (type === 'congruent') flanker = target
  else if (type === 'incongruent') flanker = target === '←' ? '→' : '←'
  else flanker = '—'

  const setSize = Math.min(7, 3 + (diff.set_size || 0))
  const half = Math.floor(setSize / 2)
  const flankers = [...Array(half).fill(flanker), target, ...Array(half).fill(flanker)]

  return { target, flankers, type }
}

export default function DikkatDenizi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [trial, setTrial] = useState<FlankerTrial | null>(null)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [showStimulus, setShowStimulus] = useState(false)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const [congruentRTs, setCongruentRTs] = useState<number[]>([])
  const [incongruentRTs, setIncongruentRTs] = useState<number[]>([])

  useEffect(() => {
    const t = generateTrial(state.difficultyAxes)
    setTrial(t)
    setFeedback(null)
    // Fixation cross → stimulus
    setShowStimulus(false)
    setTimeout(() => { setShowStimulus(true); stimRef.current = Date.now() }, 500)
  }, [round])

  const handleResponse = (direction: '←' | '→') => {
    if (!trial || feedback || !showStimulus) return
    const rt = Date.now() - stimRef.current
    const correct = direction === trial.target

    if (correct) {
      if (trial.type === 'congruent') setCongruentRTs(prev => [...prev, rt])
      if (trial.type === 'incongruent') setIncongruentRTs(prev => [...prev, rt])
    }

    session.recordTrial({
      timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: {
        skillId: 'sinif1_dikkat_flanker', flankerType: trial.type,
        target: trial.target, response: direction,
        flankerEffect: incongruentRTs.length > 0 && congruentRTs.length > 0
          ? (incongruentRTs.reduce((a,b)=>a+b,0)/incongruentRTs.length) - (congruentRTs.reduce((a,b)=>a+b,0)/congruentRTs.length)
          : null,
      },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 600 : 500)
  }

  const flankerEffect = incongruentRTs.length > 2 && congruentRTs.length > 2
    ? Math.round((incongruentRTs.reduce((a,b)=>a+b,0)/incongruentRTs.length) - (congruentRTs.reduce((a,b)=>a+b,0)/congruentRTs.length))
    : null

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.15)' }}>
          🐟 Ortadaki balık hangi yöne bakıyor?
        </span>
        {flankerEffect !== null && (
          <span className="text-[10px] text-white/20">Flanker etkisi: {flankerEffect}ms</span>
        )}
      </div>

      {/* Stimulus area */}
      <div className="w-full max-w-lg h-40 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #0C1A30, #0F2845, #1A3A5C)', border: '1px solid rgba(6,182,212,0.1)' }}>
        {!showStimulus ? (
          <motion.span className="text-3xl text-white/20" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 1 }}>+</motion.span>
        ) : trial && (
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            {trial.flankers.map((f, i) => {
              const isCenter = i === Math.floor(trial.flankers.length / 2)
              return (
                <span key={i} className={`${isCenter ? 'text-4xl' : 'text-3xl'} ${isCenter ? '' : 'opacity-60'}`}
                  style={{ color: isCenter ? '#67E8F9' : '#67E8F940', filter: isCenter ? 'drop-shadow(0 0 8px rgba(103,232,249,0.4))' : 'none' }}>
                  {f === '←' ? '🐟' : f === '→' ? '🐠' : '〰️'}
                </span>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Response buttons */}
      <div className="flex gap-6">
        <motion.button
          className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-3xl"
          style={{ background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.2)' }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
          onClick={() => handleResponse('←')}>
          <span>⬅️</span>
          <span className="text-xs text-blue-300 mt-1">Sol</span>
        </motion.button>
        <motion.button
          className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-3xl"
          style={{ background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.2)' }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
          onClick={() => handleResponse('→')}>
          <span>➡️</span>
          <span className="text-xs text-green-300 mt-1">Sağ</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {feedback && <motion.span className="text-4xl" initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>
          {feedback === 'correct' ? '✨' : '💨'}
        </motion.span>}
      </AnimatePresence>
    </div>
  )
}
