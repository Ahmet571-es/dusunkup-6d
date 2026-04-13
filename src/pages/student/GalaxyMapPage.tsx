import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { GRADE_LABELS } from '@/types'
import { getGamesForGrade } from '@/games/gameDefinitions'

export default function GalaxyMapPage() {
  const navigate = useNavigate()
  const { gradeLevel, avatar } = useAppStore(s => s.child)

  if (!gradeLevel || !avatar) { navigate('/grade'); return null; }

  const games = getGamesForGrade(gradeLevel)

  // Planet positions (spread across screen)
  const positions = [
    { x: 15, y: 22 }, { x: 72, y: 14 }, { x: 10, y: 56 },
    { x: 76, y: 50 }, { x: 42, y: 72 }, { x: 50, y: 30 },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--color-cosmos-deep)', fontFamily: 'var(--font-child)' }}>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 120 }, (_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
            width: `${0.5+Math.random()*1.8}px`, height: `${0.5+Math.random()*1.8}px`,
            animation: `twinkle ${2+Math.random()*4}s ease-in-out ${Math.random()*4}s infinite alternate`,
          }} />
        ))}
      </div>

      {/* Nebula effects */}
      <div className="absolute w-80 h-80 -top-10 -left-10 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent)' }} />
      <div className="absolute w-72 h-72 bottom-10 -right-10 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.4), transparent)' }} />

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <button onClick={() => navigate('/avatar')}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition text-white">
          ← Geri
        </button>
        <h2 className="text-lg font-extrabold text-white">{GRADE_LABELS[gradeLevel]} Galaksisi</h2>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-white/15"
          style={{ background: avatar.gradient }}>{avatar.icon}</div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-2 relative z-10">
        <span className="text-[10px] px-3 py-1 rounded-lg font-bold" style={{ background: 'rgba(52,211,153,0.15)', color: '#6EE7B7' }}>🔢 Matematik</span>
        <span className="text-[10px] px-3 py-1 rounded-lg font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' }}>🧠 Dikkat</span>
      </div>

      {/* Orbit lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full opacity-5">
          <ellipse cx="50%" cy="45%" rx="35%" ry="25%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
          <ellipse cx="45%" cy="50%" rx="25%" ry="18%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
        </svg>
      </div>

      {/* Planets */}
      <div className="relative w-full z-10" style={{ height: 'calc(100vh - 120px)' }}>
        {games.map((game, i) => {
          const pos = positions[i] || { x: 50, y: 50 }
          const isMath = game.category === 'math'
          return (
            <motion.div key={game.id}
              className="absolute flex flex-col items-center cursor-pointer"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/game/${gradeLevel}_${game.id}`)}
            >
              {/* Planet orb */}
              <div className="relative" style={{ animation: `float ${3 + i * 0.5}s ease-in-out infinite` }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl relative"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, hsl(${game.hue},65%,60%), hsl(${game.hue},65%,38%))`,
                    boxShadow: `0 0 24px hsla(${game.hue},65%,55%,0.35), inset 0 -10px 20px rgba(0,0,0,0.25), inset 0 5px 12px rgba(255,255,255,0.12)`,
                  }}>
                  {/* Shine */}
                  <div className="absolute top-[14%] left-[18%] w-[28%] h-[18%] rounded-full bg-white/25 blur-[2px]" />
                  <span className="relative z-10 drop-shadow-lg">{game.emoji}</span>
                </div>
              </div>

              {/* Label */}
              <div className="text-[11px] font-bold mt-2 text-white text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                {game.name}
              </div>

              {/* Type badge */}
              <span className="text-[9px] px-2 py-0.5 rounded-lg mt-1 font-bold"
                style={{
                  background: isMath ? 'rgba(52,211,153,0.2)' : 'rgba(99,102,241,0.2)',
                  color: isMath ? '#6EE7B7' : '#A5B4FC',
                  border: `1px solid ${isMath ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.15)'}`,
                }}>
                {isMath ? '🔢 Matematik' : '🧠 Dikkat'}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
