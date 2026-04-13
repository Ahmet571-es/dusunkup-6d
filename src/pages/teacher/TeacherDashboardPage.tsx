import { useNavigate } from 'react-router-dom'
import { GRADE_COLORS, type GradeLevel } from '@/types'

// Demo data — will be replaced with Supabase queries in Faz 2
const DEMO_CLASSES = [
  { id: '1', name: 'Anaokulu-A', grade_level: 'anaokulu' as GradeLevel, studentCount: 18 },
  { id: '2', name: '1-A', grade_level: 'sinif1' as GradeLevel, studentCount: 24 },
  { id: '3', name: '1-B', grade_level: 'sinif1' as GradeLevel, studentCount: 22 },
  { id: '4', name: '3-A', grade_level: 'sinif3' as GradeLevel, studentCount: 26 },
]

const GRADE_NAMES: Record<GradeLevel, string> = {
  anaokulu: 'Anaokulu', sinif1: '1. Sınıf', sinif2: '2. Sınıf',
  sinif3: '3. Sınıf', sinif4: '4. Sınıf', sinif5: '5. Sınıf',
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-teacher-bg)', fontFamily: 'var(--font-teacher)' }}>
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between shadow-md"
        style={{ background: 'linear-gradient(135deg, var(--color-teacher-primary), #243B55)' }}>
        <div className="flex items-center gap-3 text-white">
          <span className="text-2xl">🧊</span>
          <span className="font-bold text-lg">DüşünKüp 6D — Öğretmen Paneli</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">Ayşe Öğretmen</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">AÖ</div>
        </div>
      </nav>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--color-teacher-primary)' }}>📁 Sınıflarım</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_CLASSES.map(c => (
            <div key={c.id}
              className="bg-white rounded-2xl p-6 cursor-pointer border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all relative overflow-hidden"
              onClick={() => navigate(`/teacher/class/${c.id}`)}>
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: GRADE_COLORS[c.grade_level] }} />
              <span className="absolute top-3 right-3 text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                style={{ background: GRADE_COLORS[c.grade_level] }}>
                {GRADE_NAMES[c.grade_level]}
              </span>
              <span className="text-4xl block mb-3">📂</span>
              <div className="font-bold text-lg" style={{ color: 'var(--color-teacher-primary)' }}>{c.name}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-teacher-muted)' }}>{c.studentCount} öğrenci</div>
            </div>
          ))}
          
          {/* Add class */}
          <div className="rounded-2xl p-6 flex flex-col items-center justify-center opacity-40 hover:opacity-60 cursor-pointer transition"
            style={{ border: '2px dashed #CBD5E1' }}>
            <span className="text-4xl mb-2">➕</span>
            <span className="text-sm font-semibold text-gray-400">Yeni Sınıf Ekle</span>
          </div>
        </div>
      </div>
    </div>
  )
}
