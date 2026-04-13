import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { GRADE_LABELS } from '@/types'

const PLANETS = [
  { id: 'sayi_ormani', name: 'Sayı Ormanı', emoji: '🌳', x: 15, y: 25, hue: 150, type: 'Matematik' },
  { id: 'renk_adasi', name: 'Renk Adası', emoji: '🎨', x: 70, y: 15, hue: 330, type: 'Dikkat' },
  { id: 'sekil_kasabasi', name: 'Şekil Kasabası', emoji: '🔷', x: 12, y: 58, hue: 240, type: 'Matematik' },
  { id: 'hafiza_bahcesi', name: 'Hafıza Bahçesi', emoji: '🧠', x: 75, y: 52, hue: 45, type: 'Dikkat' },
  { id: 'ritim_nehri', name: 'Ritim Nehri', emoji: '🎵', x: 42, y: 72, hue: 190, type: 'Dikkat' },
  { id: 'oruntu_gok', name: 'Örüntü Gök', emoji: '✨', x: 48, y: 30, hue: 280, type: 'Matematik' },
]

export default function GalaxyMapPage() {
  const navigate = useNavigate()
  const { gradeLevel, avatar } = useAppStore(s => s.child)
  
  if (!gradeLevel || !avatar) { navigate('/grade'); return null; }
  
  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--color-cosmos-deep)', fontFamily: 'var(--font-child)' }}>
      
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
              width: `${0.6+Math.random()*1.5}px`, height: `${0.6+Math.random()*1.5}px`,
              animation: `twinkle ${2+Math.random()*4}s ease-in-out ${Math.random()*4}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <button onClick={() => navigate('/avatar')}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
          ← Geri
        </button>
        <h2 className="text-lg font-extrabold">{GRADE_LABELS[gradeLevel]} Galaksisi</h2>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-white/15"
          style={{ background: avatar.gradient }}>{avatar.icon}</div>
      </div>

      {/* Planets */}
      <div className="relative w-full" style={{ height: 'calc(100vh - 80px)' }}>
        {PLANETS.map((p, i) => (
          <motion.div key={p.id}
            className="absolute flex flex-col items-center cursor-pointer z-10"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
            whileHover={{ scale: 1.2 }}
            onClick={() => navigate(`/game/${gradeLevel}_${p.id}`)}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl relative"
              style={{
                background: `radial-gradient(circle at 35% 30%, hsl(${p.hue},70%,60%), hsl(${p.hue},70%,40%))`,
                boxShadow: `0 0 20px hsla(${p.hue},70%,60%,0.4), inset 0 -8px 16px rgba(0,0,0,0.3)`,
                animation: `float ${3+i*0.5}s ease-in-out infinite`,
              }}
            >
              <div className="absolute top-[15%] left-[20%] w-[30%] h-[20%] rounded-full bg-white/20 blur-sm" />
              {p.emoji}
            </div>
            <div className="text-xs font-bold mt-2 text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{p.name}</div>
            <span className="text-[9px] px-2 py-0.5 rounded-lg mt-1 font-bold"
              style={{ 
                background: p.type === 'Dikkat' ? 'rgba(99,102,241,0.3)' : 'rgba(52,211,153,0.3)',
                color: p.type === 'Dikkat' ? '#A5B4FC' : '#6EE7B7',
              }}
            >{p.type === 'Dikkat' ? '🧠 Dikkat' : '🔢 Matematik'}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
