/**
 * Game Shell — Universal wrapper for all 36 games
 * Provides: HUD (score, hearts, timer, level), session management,
 * emotion intervention overlay, break reminders, progress bar
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SessionManager, type SessionState } from '@/engine/assessment/sessionManager'
import { getGameDef } from './gameDefinitions'
import { GRADE_LABELS, GRADE_SESSION_DURATION, type GradeLevel } from '@/types'
import { useAppStore } from '@/stores/appStore'

interface GameShellProps {
  children: (session: SessionManager, state: SessionState) => React.ReactNode
}

export default function GameShell({ children }: GameShellProps) {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const gradeLevel = useAppStore(s => s.child.gradeLevel)
  const avatar = useAppStore(s => s.child.avatar)

  // Parse grade and game from gameId (format: "anaokulu_sayi_ormani")
  const grade = gradeLevel || 'anaokulu'
  const gameKey = gameId?.replace(`${grade}_`, '') || ''
  const gameDef = getGameDef(grade, gameKey)

  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [showIntervention, setShowIntervention] = useState(false)
  const [interventionMsg, setInterventionMsg] = useState('')
  const [showBreak, setShowBreak] = useState(false)
  const sessionRef = useRef<SessionManager | null>(null)

  useEffect(() => {
    if (!gameDef) return

    const initialDifficulty: Record<string, number> = {}
    gameDef.difficultyAxes.forEach(axis => { initialDifficulty[axis] = 1 })

    const session = new SessionManager({
      studentId: 'demo-student',
      gameId: gameId || '',
      gradeLevel: grade,
      maxDurationSeconds: GRADE_SESSION_DURATION[grade] * 60,
      difficultyAxes: initialDifficulty,
    })

    sessionRef.current = session
    session.start(setSessionState)

    return () => { session.dispose() }
  }, [gameDef, gameId, grade])

  // Check for interventions
  useEffect(() => {
    if (!sessionRef.current || !sessionState) return
    const intervention = sessionRef.current.getIntervention()
    if (intervention && !showIntervention) {
      setInterventionMsg(intervention.message)
      setShowIntervention(true)
      setTimeout(() => setShowIntervention(false), 4000)
    }
  }, [sessionState?.currentEmotion])

  // Break reminder
  useEffect(() => {
    if (!sessionState) return
    const breakInterval = grade === 'anaokulu' ? 300 : grade === 'sinif1' ? 420 : 600
    if (sessionState.elapsedSeconds > 0 && sessionState.elapsedSeconds % breakInterval === 0) {
      setShowBreak(true)
    }
  }, [sessionState?.elapsedSeconds, grade])

  if (!gameDef || !sessionRef.current || !sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
        <div className="text-center">
          <span className="text-5xl block mb-4">🔄</span>
          <p className="text-white/60 text-sm">Oyun yükleniyor...</p>
        </div>
      </div>
    )
  }

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`
  const maxTime = GRADE_SESSION_DURATION[grade] * 60
  const progress = Math.min(1, sessionState.elapsedSeconds / maxTime)
  const accuracy = sessionState.trials > 0 ? Math.round((sessionState.correctTrials / sessionState.trials) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
      {/* Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
            width: `${0.5+Math.random()*1.5}px`, height: `${0.5+Math.random()*1.5}px`,
            animation: `twinkle ${2+Math.random()*3}s ease-in-out ${Math.random()*3}s infinite alternate`,
          }} />
        ))}
      </div>

      {/* HUD Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 relative z-10"
        style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/galaxy')}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/8 hover:bg-white/10 transition text-white">
          ← Harita
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/15 text-red-300">
            ❤️❤️❤️
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 border border-purple-500/15 text-purple-300">
            📊 %{accuracy}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500/10 border border-green-500/15 text-green-300">
            ⏱ {formatTime(sessionState.elapsedSeconds)}
          </span>
        </div>

        <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-yellow-500/15 border border-yellow-500/15 text-yellow-200">
          ⭐ {sessionState.score}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/5 relative z-10">
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg, #34D399, #10B981, #FBBF24)' }}
          animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5 }} />
      </div>

      {/* Game Area */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        {children(sessionRef.current, sessionState)}
      </div>

      {/* Emotion Intervention Overlay */}
      <AnimatePresence>
        {showIntervention && (
          <motion.div className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowIntervention(false)} />
            <motion.div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center max-w-sm border border-white/10"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <span className="text-5xl block mb-4">🦉</span>
              <p className="text-white text-lg font-bold">{interventionMsg}</p>
              <button onClick={() => setShowIntervention(false)}
                className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition">
                Tamam 💪
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Reminder */}
      <AnimatePresence>
        {showBreak && (
          <motion.div className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" />
            <motion.div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center max-w-sm border border-white/10"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <span className="text-5xl block mb-4">🌈</span>
              <p className="text-white text-xl font-bold mb-2">Mola Zamanı!</p>
              <p className="text-white/60 text-sm mb-4">Biraz dinlen, gözlerini dinlendir 😊</p>
              <button onClick={() => setShowBreak(false)}
                className="px-6 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-bold hover:bg-green-500/30 transition">
                Devam Et 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
