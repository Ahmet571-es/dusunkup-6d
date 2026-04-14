/**
 * Stroop Savaşçısı — Yürütücü Kontrol
 * 4 Mod: Renk-Kelime, Sayı-Miktar, Boyut-Değer, Karışık
 * Congruent/Incongruent oranı adaptif, Stroop etkisi ölçümü
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type StroopMode = 'color_word' | 'number_quantity' | 'size_value' | 'mixed'
const COLORS: Record<string, string> = { Kırmızı: '#EF4444', Mavi: '#3B82F6', Yeşil: '#22C55E', Sarı: '#EAB308' }
const NAMES = Object.keys(COLORS)

interface StroopTrial { word: string; inkColor: string; correctAnswer: string; isCongruent: boolean; mode: StroopMode }

function generateTrial(mode: StroopMode): StroopTrial {
  if (mode === 'number_quantity') {
    const nums = [1, 2, 3, 4, 5]
    const displayed = nums[Math.floor(Math.random() * nums.length)]
    const congruent = Math.random() > 0.4
    const quantity = congruent ? displayed : nums.filter(n => n !== displayed)[Math.floor(Math.random() * 4)]
    const word = String(displayed).repeat(quantity)
    return { word: `${displayed}`, inkColor: '', correctAnswer: String(quantity), isCongruent: congruent, mode }
  }
  const word = NAMES[Math.floor(Math.random() * NAMES.length)]
  const congruent = Math.random() > 0.4
  const ink = congruent ? COLORS[word] : COLORS[NAMES.filter(n => n !== word)[Math.floor(Math.random() * (NAMES.length - 1))]]
  const correctAnswer = Object.entries(COLORS).find(([, v]) => v === ink)?.[0] || ''
  return { word, inkColor: ink, correctAnswer, isCongruent: congruent, mode }
}

export default function StroopSavascisi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [trial, setTrial] = useState<StroopTrial>(generateTrial('color_word'))
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [congRTs, setCongRTs] = useState<number[]>([])
  const [incongRTs, setIncongRTs] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())
  const modes: StroopMode[] = ['color_word', 'color_word', 'number_quantity', 'mixed']

  useEffect(() => {
    const m = modes[Math.floor(round / 5) % modes.length]
    setTrial(generateTrial(m)); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (name: string) => {
    if (feedback) return; const rt = Date.now() - stimRef.current
    const correct = name === trial.correctAnswer
    if (correct) {
      setStreak(s => s + 1)
      if (trial.isCongruent) setCongRTs(p => [...p.slice(-20), rt])
      else setIncongRTs(p => [...p.slice(-20), rt])
    } else setStreak(0)

    const stroopEffect = congRTs.length > 3 && incongRTs.length > 3
      ? Math.round(incongRTs.reduce((a, b) => a + b, 0) / incongRTs.length - congRTs.reduce((a, b) => a + b, 0) / congRTs.length) : null

    session.recordTrial({
      timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: 'sinif3_stroop', mode: trial.mode, isCongruent: trial.isCongruent, stroopEffect, streak },
    })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 500 : 400)
  }

  const stroopEffect = congRTs.length > 3 && incongRTs.length > 3
    ? Math.round(incongRTs.reduce((a, b) => a + b, 0) / incongRTs.length - congRTs.reduce((a, b) => a + b, 0) / congRTs.length) : null

  const isNumMode = trial.mode === 'number_quantity'

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}>
          ⚔️ {isNumMode ? 'Kaç tane yazılmış? (Miktar söyle!)' : 'Mürekkebin RENGİNİ söyle!'}
        </span>
        <div className="flex items-center gap-2">
          {streak >= 5 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
          {stroopEffect !== null && <span className="text-[10px] text-white/20">SE: {stroopEffect}ms</span>}
        </div>
      </div>

      {/* Stimulus */}
      {isNumMode ? (
        <div className="flex gap-2">
          {Array.from({ length: parseInt(trial.correctAnswer) || 1 }, (_, i) => (
            <motion.span key={i} className="text-5xl font-black" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
              style={{ color: '#F1F5F9', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
              {trial.word}
            </motion.span>
          ))}
        </div>
      ) : (
        <motion.div key={round} className="text-7xl font-black" style={{ color: trial.inkColor, textShadow: `0 0 30px ${trial.inkColor}50, 0 0 60px ${trial.inkColor}20, 0 4px 12px rgba(0,0,0,0.4)` }}
          initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}>
          {trial.word}
        </motion.div>
      )}

      {/* Response options */}
      <div className="flex gap-3 flex-wrap justify-center">
        {isNumMode ? (
          [1, 2, 3, 4, 5].map(n => (
            <motion.button key={n} className="w-14 h-14 rounded-xl text-xl font-black text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(String(n))}>{n}</motion.button>
          ))
        ) : (
          NAMES.map(name => (
            <motion.button key={name} className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: `${COLORS[name]}20`, border: `2px solid ${COLORS[name]}40`, color: COLORS[name] }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(name)}>{name}</motion.button>
          ))
        )}
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '✨' : '💨'}</motion.span>}</AnimatePresence>
    </div>
  )
}
