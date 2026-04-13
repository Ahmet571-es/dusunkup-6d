/**
 * Renk Adası — Anaokulu Dikkat Oyunu
 * Bilimsel Temel: CPT (Continuous Performance Task)
 * Hedef: Sürekli dikkat, dürtü kontrolü, bilişsel esneklik
 * Mekanik: Balonlar iniyor, sadece hedef renge dokun
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

interface Balloon {
  id: number
  color: string
  colorName: string
  isTarget: boolean
  x: number
  y: number
  speed: number
  active: boolean
}

const COLORS = [
  { name: 'Kırmızı', value: '#EF4444', light: '#FCA5A5' },
  { name: 'Mavi', value: '#3B82F6', light: '#93C5FD' },
  { name: 'Yeşil', value: '#22C55E', light: '#86EFAC' },
  { name: 'Sarı', value: '#EAB308', light: '#FDE047' },
  { name: 'Mor', value: '#A855F7', light: '#D8B4FE' },
  { name: 'Turuncu', value: '#F97316', light: '#FDBA74' },
]

function BalloonSVG({ color, light, size = 48 }: { color: string; light: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 50 65">
      <defs>
        <radialGradient id={`bg${color.replace('#','')}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <ellipse cx="25" cy="25" rx="22" ry="25" fill={`url(#bg${color.replace('#','')})`} />
      <ellipse cx="18" cy="18" rx="6" ry="8" fill="rgba(255,255,255,0.25)" transform="rotate(-20 18 18)" />
      <path d="M25 50 L22 58 L28 58 Z" fill={color} />
      <line x1="25" y1="58" x2="25" y2="65" stroke={color} strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

export default function RenkAdasi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [targetColor, setTargetColor] = useState(COLORS[0])
  const [totalSpawned, setTotalSpawned] = useState(0)
  const [ruleChangeCount, setRuleChangeCount] = useState(0)
  const nextId = useRef(0)
  const spawnInterval = useRef<number | null>(null)
  const moveInterval = useRef<number | null>(null)

  const difficulty = state.difficultyAxes
  const targetRatio = Math.max(0.25, 0.6 - (difficulty.target_ratio || 0) * 0.05)
  const speed = 0.3 + (difficulty.speed || 0) * 0.1
  const similarColors = (difficulty.distractor_similarity || 0) > 3
  const ruleSwitch = (difficulty.rule_switching || 0) > 2

  // Spawn balloons
  useEffect(() => {
    spawnInterval.current = window.setInterval(() => {
      const isTarget = Math.random() < targetRatio
      let color = targetColor
      if (!isTarget) {
        const available = similarColors
          ? COLORS.filter(c => c.name !== targetColor.name)
          : COLORS.filter(c => c.name !== targetColor.name && c.value !== targetColor.value)
        color = available[Math.floor(Math.random() * available.length)]
      }

      const balloon: Balloon = {
        id: nextId.current++,
        color: color.value,
        colorName: color.name,
        isTarget,
        x: 5 + Math.random() * 85,
        y: -10,
        speed: speed + Math.random() * 0.2,
        active: true,
      }
      setBalloons(prev => [...prev.slice(-15), balloon]) // Keep max 16
      setTotalSpawned(t => t + 1)
    }, Math.max(800, 1800 - (difficulty.speed || 0) * 150))

    return () => { if (spawnInterval.current) clearInterval(spawnInterval.current) }
  }, [targetRatio, speed, similarColors, targetColor])

  // Move balloons down
  useEffect(() => {
    moveInterval.current = window.setInterval(() => {
      setBalloons(prev => {
        const updated = prev.map(b => ({ ...b, y: b.y + b.speed }))
        // Check for missed targets (went off screen)
        updated.forEach(b => {
          if (b.y > 105 && b.active && b.isTarget) {
            session.recordTrial({
              timestamp: Date.now(), trialType: 'target', stimulusShownAt: Date.now() - 3000,
              responseAt: null, responseTimeMs: null, isCorrect: false,
              isTarget: true, responded: false,
              difficultyAxes: state.difficultyAxes,
              metadata: { skillId: 'anaokulu_renk_adasi_cpt', type: 'omission', color: b.colorName },
            })
            b.active = false
          }
        })
        return updated.filter(b => b.y < 110)
      })
    }, 50)

    return () => { if (moveInterval.current) clearInterval(moveInterval.current) }
  }, [])

  // Rule change (bilişsel esneklik)
  useEffect(() => {
    if (!ruleSwitch) return
    const timer = setInterval(() => {
      const newColor = COLORS[Math.floor(Math.random() * COLORS.length)]
      setTargetColor(newColor)
      setRuleChangeCount(c => c + 1)
    }, 20000) // Every 20 seconds
    return () => clearInterval(timer)
  }, [ruleSwitch])

  const handleTap = (balloon: Balloon) => {
    if (!balloon.active) return

    const stimShown = Date.now() - ((105 - balloon.y) / balloon.speed * 50) // approximate
    const rt = Date.now() - stimShown

    if (balloon.isTarget) {
      // HIT — correct target touch
      session.recordTrial({
        timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimShown,
        responseAt: Date.now(), responseTimeMs: Math.max(200, rt),
        isCorrect: true, isTarget: true, responded: true,
        difficultyAxes: state.difficultyAxes,
        metadata: { skillId: 'anaokulu_renk_adasi_cpt', type: 'hit', color: balloon.colorName },
      })
    } else {
      // FALSE ALARM — touched non-target
      session.recordTrial({
        timestamp: Date.now(), trialType: 'distractor', stimulusShownAt: stimShown,
        responseAt: Date.now(), responseTimeMs: Math.max(200, rt),
        isCorrect: false, isTarget: false, responded: true,
        difficultyAxes: state.difficultyAxes,
        metadata: { skillId: 'anaokulu_renk_adasi_cpt', type: 'false_alarm', color: balloon.colorName },
      })
    }

    setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, active: false } : b))
  }

  return (
    <div className="flex flex-col items-center justify-start h-full p-3 gap-2">
      {/* Target instruction */}
      <motion.div className="w-full max-w-lg rounded-xl p-3 text-center"
        style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}
        key={targetColor.name}
        initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full" style={{ background: targetColor.value, boxShadow: `0 0 12px ${targetColor.value}40` }} />
          <span className="text-sm font-bold text-white">Sadece <span style={{ color: targetColor.light }}>{targetColor.name}</span> balonlara dokun!</span>
        </div>
        {ruleSwitch && ruleChangeCount > 0 && (
          <p className="text-[10px] text-yellow-300/60 mt-1">⚡ Renk değişti! Dikkat!</p>
        )}
      </motion.div>

      {/* Game field */}
      <div className="w-full max-w-lg flex-1 rounded-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0C1A2E 0%, #162D50 30%, #1A3A5C 60%, #1E4570 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.3)',
          minHeight: 350,
        }}>
        
        {/* Clouds */}
        {[15, 45, 75].map((x, i) => (
          <div key={i} className="absolute rounded-full opacity-5 pointer-events-none"
            style={{ left: `${x}%`, top: `${5+i*8}%`, width: 80+i*20, height: 30+i*5, background: 'white' }} />
        ))}

        {/* Balloons */}
        <AnimatePresence>
          {balloons.filter(b => b.active).map(b => (
            <motion.div key={b.id}
              className="absolute cursor-pointer"
              style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translateX(-50%)' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              onClick={() => handleTap(b)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
            >
              <BalloonSVG color={b.color} light={COLORS.find(c => c.value === b.color)?.light || b.color} size={44} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Popped balloons effect */}
        {balloons.filter(b => !b.active && b.y < 100).map(b => (
          <motion.div key={`pop${b.id}`}
            className="absolute pointer-events-none"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.4 }}>
            <span className="text-2xl">{b.isTarget ? '✨' : '💨'}</span>
          </motion.div>
        ))}

        {/* Ground/Island */}
        <div className="absolute bottom-0 left-0 right-0 h-[12%]"
          style={{ background: 'linear-gradient(180deg, #22C55E, #16A34A)', borderRadius: '60% 60% 0 0' }} />
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-[10px] font-bold text-white/30">
        <span>Toplam: {totalSpawned}</span>
        <span>•</span>
        <span>Doğruluk: %{state.trials > 0 ? Math.round((state.correctTrials/state.trials)*100) : 0}</span>
      </div>
    </div>
  )
}
