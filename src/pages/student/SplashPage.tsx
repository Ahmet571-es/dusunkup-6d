import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SplashPage() {
  const navigate = useNavigate()
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
      style={{ background: 'var(--color-cosmos-deep)', fontFamily: 'var(--font-child)' }}
      onClick={() => navigate('/mode')}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 80 }, (_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
              width: `${0.8+Math.random()*2}px`, height: `${0.8+Math.random()*2}px`,
              animation: `twinkle ${2+Math.random()*3}s ease-in-out ${Math.random()*3}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div className="absolute w-96 h-96 -top-20 -left-20 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent)' }} />
      <div className="absolute w-80 h-80 top-1/2 -right-20 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.4), transparent)' }} />

      {/* 3D Cube */}
      <motion.div 
        className="mb-12"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 1, delay: 0.3 }}
        style={{ perspective: '800px' }}
      >
        <div className="w-36 h-36 relative" style={{ 
          transformStyle: 'preserve-3d', 
          animation: 'spin-slow 10s linear infinite',
        }}>
          {[
            { emoji: '🔢', bg: 'linear-gradient(135deg,#F472B6,#EC4899)', ry: 0 },
            { emoji: '🧠', bg: 'linear-gradient(135deg,#60A5FA,#3B82F6)', ry: 90 },
            { emoji: '✨', bg: 'linear-gradient(135deg,#34D399,#10B981)', ry: 180 },
            { emoji: '🎯', bg: 'linear-gradient(135deg,#FBBF24,#F59E0B)', ry: -90 },
            { emoji: '🎵', bg: 'linear-gradient(135deg,#A78BFA,#8B5CF6)', rx: 90 },
            { emoji: '🔷', bg: 'linear-gradient(135deg,#F97316,#EA580C)', rx: -90 },
          ].map((face, i) => (
            <div key={i} className="absolute w-36 h-36 rounded-2xl flex items-center justify-center text-5xl border-2 border-white/15"
              style={{
                background: face.bg,
                backfaceVisibility: 'visible',
                transform: `rotate${face.rx !== undefined ? 'X' : 'Y'}(${face.rx ?? face.ry}deg) translateZ(72px)`,
                boxShadow: 'inset 0 0 40px rgba(255,255,255,0.05)',
              }}
            >{face.emoji}</div>
          ))}
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-5xl font-extrabold tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          background: 'linear-gradient(135deg, #F472B6, #60A5FA, #34D399, #FBBF24)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'var(--animate-gradient, none)',
        }}
      >
        DüşünKüp 6D
      </motion.h1>
      
      <motion.p 
        className="text-lg mt-2 opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2 }}
      >
        Bilişsel Gelişim Platformu
      </motion.p>

      <motion.p
        className="text-sm mt-12 opacity-40"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        ✨ Başlamak için dokun
      </motion.p>
    </div>
  )
}
