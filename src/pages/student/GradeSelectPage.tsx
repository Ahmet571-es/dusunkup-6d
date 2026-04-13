import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { GRADE_COLORS, type GradeLevel } from '@/types'

const GRADES = [
  { id: 'anaokulu' as GradeLevel, label: 'Anaokulu', icon: '🌈', age: '5-6 yaş' },
  { id: 'sinif1' as GradeLevel, label: '1. Sınıf', icon: '🌟', age: '6-7 yaş' },
  { id: 'sinif2' as GradeLevel, label: '2. Sınıf', icon: '🚀', age: '7-8 yaş' },
  { id: 'sinif3' as GradeLevel, label: '3. Sınıf', icon: '🔬', age: '8-9 yaş' },
  { id: 'sinif4' as GradeLevel, label: '4. Sınıf', icon: '⚡', age: '9-10 yaş' },
  { id: 'sinif5' as GradeLevel, label: '5. Sınıf', icon: '🏆', age: '10-11 yaş' },
]

export default function GradeSelectPage() {
  const navigate = useNavigate()
  const setGradeLevel = useAppStore(s => s.setGradeLevel)
  
  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--color-cosmos-deep)', fontFamily: 'var(--font-child)' }}>
      
      <div className="p-4 relative z-10">
        <button onClick={() => navigate('/mode')}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
          ← Geri
        </button>
      </div>
      
      <h1 className="text-center text-2xl font-extrabold mt-2 relative z-10">Sınıfını Seç</h1>
      <p className="text-center text-white/50 text-sm mb-4 relative z-10">Hangi sınıftasın?</p>
      
      <div className="grid grid-cols-3 gap-4 px-5 max-w-lg mx-auto relative z-10">
        {GRADES.map((g, i) => (
          <motion.div key={g.id}
            className="rounded-3xl p-6 text-center cursor-pointer"
            style={{ 
              background: `linear-gradient(135deg, ${GRADE_COLORS[g.id]}dd, ${GRADE_COLORS[g.id]}88)`,
              boxShadow: `0 8px 32px ${GRADE_COLORS[g.id]}40`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6, scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => { setGradeLevel(g.id); navigate('/avatar'); }}
          >
            <span className="text-4xl block mb-2 drop-shadow-md">{g.icon}</span>
            <div className="text-white font-extrabold text-sm">{g.label}</div>
            <div className="text-white/60 text-xs mt-1">{g.age}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
