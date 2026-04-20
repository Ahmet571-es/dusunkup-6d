/**
 * Game Shell — Sinematik Universal Wrapper
 * HUD, session management, themed backgrounds, confetti, streak
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SessionManager, type SessionState } from '@/engine/assessment/sessionManager'
import { getGameDef } from './gameDefinitions'
import { GRADE_LABELS, GRADE_SESSION_DURATION, type GradeLevel } from '@/types'
import { useAppStore } from '@/stores/appStore'
import { ConfettiBurst, StreakFire, Sparkles } from '@/components/cinema/Particles'
import { ForestScene, OceanScene, SpaceScene, KitchenScene, LabScene } from '@/components/cinema/Backgrounds'
import SessionFeedbackWidget from '@/components/shared/SessionFeedback'

interface GameShellProps {
  children: (session: SessionManager, state: SessionState) => React.ReactNode
}

// Theme mapping: grade + category → background
function getTheme(grade: GradeLevel, category: string, gameId: string): 'forest' | 'ocean' | 'space' | 'kitchen' | 'lab' {
  // Specific games
  if (gameId.includes('kesir') || gameId.includes('para')) return 'kitchen'
  if (gameId.includes('muhendis') || gameId.includes('veri') || gameId.includes('kesif') || gameId.includes('strateji')) return 'lab'
  if (gameId.includes('kod') || gameId.includes('nback') || gameId.includes('geometri') || gameId.includes('ondalik') || gameId.includes('alan')) return 'space'
  // Grade-based defaults
  if (category === 'attention') return 'ocean'
  if (grade === 'sinif4' || grade === 'sinif5') return 'space'
  return 'forest'
}

export default function GameShell({ children }: GameShellProps) {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const gradeLevel = useAppStore(s => s.child.gradeLevel)
  const avatar = useAppStore(s => s.child.avatar)

  const grade = gradeLevel || 'anaokulu'
  const gameKey = gameId?.replace(`${grade}_`, '') || ''
  const gameDef = getGameDef(grade, gameKey)

  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [showIntervention, setShowIntervention] = useState(false)
  const [interventionMsg, setInterventionMsg] = useState('')
  const [showBreak, setShowBreak] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [streak, setStreak] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const sessionRef = useRef<SessionManager | null>(null)
  const prevScore = useRef(0)

  useEffect(() => {
    if (!gameDef) return
    const initialDifficulty: Record<string, number> = {}
    gameDef.difficultyAxes.forEach(axis => { initialDifficulty[axis] = 1 })

    const session = new SessionManager({
      studentId: 'demo-student', gameId: gameId || '', gradeLevel: grade,
      maxDurationSeconds: GRADE_SESSION_DURATION[grade] * 60,
      difficultyAxes: initialDifficulty,
    })
    sessionRef.current = session
    session.start(setSessionState)
    prevScore.current = 0
    setStreak(0)
    return () => { session.dispose() }
  }, [gameDef, gameId, grade])

  // Watch score for confetti + streak
  useEffect(() => {
    if (!sessionState) return
    if (sessionState.score > prevScore.current) {
      // Score increased = correct answer!
      setShowConfetti(true)
      setStreak(s => s + 1)
      setTimeout(() => setShowConfetti(false), 100)
    } else if (sessionState.trials > 0 && sessionState.score === prevScore.current && sessionState.trials !== prevScore.current) {
      // Trial happened but no score increase = wrong answer
      setStreak(0)
    }
    prevScore.current = sessionState.score
  }, [sessionState?.score, sessionState?.trials])

  // Intervention
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
    if (sessionState.elapsedSeconds > 0 && sessionState.elapsedSeconds % breakInterval === 0) setShowBreak(true)
  }, [sessionState?.elapsedSeconds, grade])

  if (!gameDef || !sessionRef.current || !sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
        <SpaceScene />
        <motion.div className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.span className="text-6xl block mb-4"
            animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>🔄</motion.span>
          <p className="text-white/60 text-sm font-bold">Oyun yükleniyor...</p>
        </motion.div>
      </div>
    )
  }

  const theme = getTheme(grade, gameDef.category, gameId || '')
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const maxTime = GRADE_SESSION_DURATION[grade] * 60
  const progress = Math.min(1, sessionState.elapsedSeconds / maxTime)
  const accuracy = sessionState.trials > 0 ? Math.round((sessionState.correctTrials / sessionState.trials) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>

      {/* === THEMED CINEMATIC BACKGROUND === */}
      {theme === 'forest' && <ForestScene />}
      {theme === 'ocean' && <OceanScene />}
      {theme === 'space' && <SpaceScene />}
      {theme === 'kitchen' && <KitchenScene />}
      {theme === 'lab' && <LabScene />}

      {/* === CONFETTI on correct answer === */}
      <ConfettiBurst trigger={showConfetti} />

      {/* === HUD Top Bar === */}
      <motion.div className="flex items-center justify-between px-3 py-2 relative z-10"
        style={{ background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        initial={{ y: -40 }} animate={{ y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        
        <motion.button onClick={() => { if (sessionState.trials >= 3) setShowFeedback(true); else navigate('/galaxy') }}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}>
          ← Harita
        </motion.button>

        <div className="flex items-center gap-1.5">
          {/* Hearts with pulse */}
          <motion.span className="px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}
            animate={( sessionState.trials - sessionState.correctTrials) > 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}>
            {'❤️'.repeat(Math.max(0, 3 - Math.floor(( sessionState.trials - sessionState.correctTrials) / 3)))}
            {'🖤'.repeat(Math.min(3, Math.floor(( sessionState.trials - sessionState.correctTrials) / 3)))}
          </motion.span>

          {/* Accuracy */}
          <span className="px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)', color: '#C4B5FD' }}>
            📊 %{accuracy}
          </span>

          {/* Timer */}
          <span className="px-2 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)', color: '#6EE7B7' }}>
            ⏱ {formatTime(sessionState.elapsedSeconds)}
          </span>

          {/* Streak */}
          <StreakFire streak={streak} />
        </div>

        {/* Score with glow */}
        <motion.span className="px-3 py-1.5 rounded-lg text-sm font-black"
          style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.2)', color: '#FDE68A',
            textShadow: sessionState.score > 0 ? '0 0 8px rgba(251,191,36,0.4)' : 'none' }}
          key={sessionState.score}
          animate={sessionState.score > 0 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}>
          ⭐ {sessionState.score}
        </motion.span>
      </motion.div>

      {/* === Progress Bar (animated gradient) === */}
      <div className="h-1.5 relative z-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <motion.div className="h-full rounded-r-full"
          style={{ background: 'linear-gradient(90deg, #34D399, #10B981, #FBBF24, #F59E0B)', backgroundSize: '200% 100%' }}
          animate={{ width: `${progress * 100}%`, backgroundPosition: ['0% 0%', '100% 0%'] }}
          transition={{ width: { duration: 0.5 }, backgroundPosition: { duration: 3, repeat: Infinity, repeatType: 'reverse' } }} />
      </div>

      {/* === Game Area === */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        {children(sessionRef.current, sessionState)}
      </div>

      {/* === Intervention Overlay (cinematic) === */}
      <AnimatePresence>
        {showIntervention && (
          <motion.div className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowIntervention(false)} />
            <motion.div className="relative rounded-3xl p-8 text-center max-w-sm overflow-hidden"
              style={{ background: 'rgba(15,20,40,0.9)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
              initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}>
              <Sparkles count={8} color="#C4B5FD" />
              <motion.span className="text-6xl block mb-3" animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🦉</motion.span>
              <p className="text-white text-lg font-bold relative z-10">{interventionMsg}</p>
              <button onClick={() => setShowIntervention(false)}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold transition relative z-10"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#C4B5FD' }}>
                Tamam 💪
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Break Reminder (cinematic) === */}
      <AnimatePresence>
        {showBreak && (
          <motion.div className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div className="relative rounded-3xl p-8 text-center max-w-sm overflow-hidden"
              style={{ background: 'rgba(15,20,40,0.9)', border: '1px solid rgba(52,211,153,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
              initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
              <Sparkles count={10} color="#6EE7B7" />
              <motion.span className="text-6xl block mb-3" animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}>🌈</motion.span>
              <p className="text-white text-xl font-bold mb-2 relative z-10">Mola Zamanı!</p>
              <p className="text-white/50 text-sm mb-4 relative z-10">Gözlerini dinlendir, biraz esne 😊</p>
              <motion.button onClick={() => setShowBreak(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition relative z-10"
                style={{ background: 'rgba(52,211,153,0.15)', border: '1.5px solid rgba(52,211,153,0.25)', color: '#6EE7B7' }}
                whileHover={{ boxShadow: '0 0 20px rgba(52,211,153,0.2)' }}
                whileTap={{ scale: 0.95 }}>
                Devam Et 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* === Session End Feedback === */}
      <AnimatePresence>
        {showFeedback && (
          <SessionFeedbackWidget
            gameId={gameId || 'unknown'}
            studentId={avatar?.name}
            durationSec={sessionState.elapsedSeconds}
            accuracy={accuracy / 100}
            score={sessionState.score}
            onDone={() => { setShowFeedback(false); navigate('/galaxy') }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
