/**
 * Sinematik Parçacık Sistemi
 * Konfeti, yıldız patlaması, yaprak düşüşü, baloncuk, ışık parıltısı
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

// === KONFETI PATLAMASI (doğru cevap) ===
interface ConfettiPiece { id: number; x: number; y: number; color: string; rotation: number; scale: number; delay: number }

export function ConfettiBurst({ trigger, count = 24 }: { trigger: boolean; count?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const colors = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899', '#F97316', '#06B6D4']

  useEffect(() => {
    if (!trigger) { setPieces([]); return }
    const p: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 80,
      y: 50 + (Math.random() - 0.5) * 60,
      color: colors[i % colors.length],
      rotation: Math.random() * 720 - 360,
      scale: 0.5 + Math.random() * 1,
      delay: Math.random() * 0.15,
    }))
    setPieces(p)
  }, [trigger])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {pieces.map(p => (
          <motion.div key={p.id} className="absolute"
            style={{ left: '50%', top: '40%', width: 8 * p.scale, height: 8 * p.scale }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
            animate={{
              x: (p.x - 50) * 6, y: (p.y - 50) * 5 + 80,
              opacity: [1, 1, 0], rotate: p.rotation,
              scale: [0, p.scale, p.scale * 0.3],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <div className="w-full h-full rounded-sm" style={{ background: p.color, boxShadow: `0 0 4px ${p.color}60` }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// === YILDIZ PARILTISI (hover/idle) ===
export function Sparkles({ count = 6, color = '#FDE68A', area = { w: 100, h: 100 } }: { count?: number; color?: string; area?: { w: number; h: number } }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3, height: 2 + Math.random() * 3,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            background: color, boxShadow: `0 0 6px ${color}`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 3, repeatDelay: Math.random() * 2 }}
        />
      ))}
    </div>
  )
}

// === SU BALONCUKLARI (okyanus teması) ===
export function Bubbles({ count = 8 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const size = 4 + Math.random() * 12
        return (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              width: size, height: size, left: `${5 + Math.random() * 90}%`, bottom: -20,
              background: 'rgba(147,197,253,0.15)', border: '1px solid rgba(147,197,253,0.2)',
            }}
            animate={{ y: [0, -(200 + Math.random() * 300)], x: [0, (Math.random() - 0.5) * 40], opacity: [0, 0.6, 0] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

// === YAPRAK DÜŞÜŞÜ (orman teması) ===
export function FallingLeaves({ count = 5 }: { count?: number }) {
  const leaves = ['🍃', '🍂', '🌿', '🍀']
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <motion.span key={i} className="absolute text-lg opacity-30"
          style={{ left: `${Math.random() * 100}%`, top: -30 }}
          animate={{ y: [0, 500], x: [0, (Math.random() - 0.5) * 100], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)] }}
          transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 10, ease: 'linear' }}>
          {leaves[i % leaves.length]}
        </motion.span>
      ))}
    </div>
  )
}

// === DOĞRU/YANLIŞ FEEDBACK (sinematik) ===
export function CinematicFeedback({ type, onComplete }: { type: 'correct' | 'wrong' | null; onComplete?: () => void }) {
  if (!type) return null

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {type === 'correct' ? (
        <motion.div className="flex flex-col items-center"
          initial={{ scale: 0, rotate: -20 }} animate={{ scale: [0, 1.3, 1], rotate: [20, -5, 0] }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}>
          <motion.span className="text-7xl" style={{ filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.6))' }}
            animate={{ y: [0, -8, 0] }} transition={{ duration: 0.4, delay: 0.3 }}>⭐</motion.span>
          <motion.p className="text-lg font-black mt-1" style={{ color: '#FDE68A', textShadow: '0 0 12px rgba(251,191,36,0.5)' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Harika!
          </motion.p>
        </motion.div>
      ) : (
        <motion.div className="flex flex-col items-center"
          initial={{ scale: 0 }} animate={{ scale: [0, 1.1, 1] }}
          transition={{ duration: 0.4 }}>
          <motion.span className="text-5xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>💫</motion.span>
          <motion.p className="text-sm font-bold text-orange-300/80 mt-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            Tekrar dene!
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  )
}

// === SERİ YANGI (streak fire) ===
export function StreakFire({ streak }: { streak: number }) {
  if (streak < 3) return null
  return (
    <motion.div className="flex items-center gap-1 px-3 py-1 rounded-full"
      style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}
      initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }}
      key={streak}>
      <motion.span className="text-base" animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}>🔥</motion.span>
      <span className="text-xs font-black text-orange-300">{streak}</span>
    </motion.div>
  )
}
