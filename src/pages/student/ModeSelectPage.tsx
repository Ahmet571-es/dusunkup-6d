import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ModeSelectPage() {
  const navigate = useNavigate()
  
  const modes = [
    { id: 'child', icon: '🚀', label: 'Öğrenci Girişi', desc: 'Galaksiyi keşfet, öğren, eğlen!', path: '/grade',
      bg: 'linear-gradient(135deg, rgba(244,114,182,0.12), rgba(99,102,241,0.12))' },
    { id: 'teacher', icon: '📊', label: 'Öğretmen Paneli', desc: 'Sınıf yönetimi ve analizler', path: '/teacher',
      bg: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(52,211,153,0.12))' },
  ]
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-5 relative overflow-hidden"
      style={{ background: 'var(--color-cosmos-deep)', fontFamily: 'var(--font-child)' }}>
      
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }, (_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
              width: `${0.8+Math.random()*1.5}px`, height: `${0.8+Math.random()*1.5}px`,
              animation: `twinkle ${2+Math.random()*3}s ease-in-out ${Math.random()*3}s infinite alternate`,
            }}
          />
        ))}
      </div>
      
      <motion.h1
        className="text-3xl font-extrabold relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #F472B6, #60A5FA, #34D399, #FBBF24)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >DüşünKüp 6D</motion.h1>

      <div className="flex gap-6 flex-wrap justify-center relative z-10">
        {modes.map((m, i) => (
          <motion.div key={m.id}
            className="w-64 p-10 rounded-3xl text-center cursor-pointer relative overflow-hidden"
            style={{ background: m.bg, border: '2px solid rgba(255,255,255,0.08)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(m.path)}
          >
            <span className="text-6xl block mb-4 drop-shadow-lg">{m.icon}</span>
            <div className="text-xl font-extrabold text-white">{m.label}</div>
            <div className="text-sm text-white/50 mt-1">{m.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
