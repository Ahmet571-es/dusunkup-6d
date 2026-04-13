import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { AVATARS, GRADE_LABELS } from '@/types'

export default function AvatarSelectPage() {
  const navigate = useNavigate()
  const gradeLevel = useAppStore(s => s.child.gradeLevel)
  const setAvatar = useAppStore(s => s.setAvatar)
  
  if (!gradeLevel) { navigate('/grade'); return null; }
  
  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--color-cosmos-deep)', fontFamily: 'var(--font-child)' }}>
      
      <div className="p-4 relative z-10">
        <button onClick={() => navigate('/grade')}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition">
          ← Geri
        </button>
      </div>
      
      <h1 className="text-center text-2xl font-extrabold mt-2 relative z-10">Sen Kimsin?</h1>
      <p className="text-center text-white/50 text-sm mb-4 relative z-10">{GRADE_LABELS[gradeLevel]} · Avatarına dokun</p>
      
      <div className="grid grid-cols-4 gap-3 px-5 max-w-lg mx-auto relative z-10">
        {AVATARS.map((a, i) => (
          <motion.div key={a.id}
            className="rounded-3xl p-4 text-center cursor-pointer bg-white/5 border-2 border-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setAvatar(a); navigate('/galaxy'); }}
          >
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-4xl mb-2 relative"
              style={{ background: a.gradient }}>
              {a.icon}
            </div>
            <div className="text-white font-bold text-xs">{a.name}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
