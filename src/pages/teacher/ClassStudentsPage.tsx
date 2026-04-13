import { useNavigate, useParams } from 'react-router-dom'

const DEMO_STUDENTS = [
  { id: '1', first_name: 'Ayşe', last_name: 'Yılmaz', avatar_id: 5, attention: 78, math: 82, trend: 'up', sessions: 14 },
  { id: '2', first_name: 'Mehmet', last_name: 'Kaya', avatar_id: 1, attention: 65, math: 71, trend: 'up', sessions: 12 },
  { id: '3', first_name: 'Zeynep', last_name: 'Demir', avatar_id: 2, attention: 88, math: 90, trend: 'up', sessions: 16 },
  { id: '4', first_name: 'Ali', last_name: 'Çelik', avatar_id: 4, attention: 45, math: 52, trend: 'stable', sessions: 8 },
  { id: '5', first_name: 'Elif', last_name: 'Şahin', avatar_id: 3, attention: 72, math: 68, trend: 'up', sessions: 11 },
  { id: '6', first_name: 'Burak', last_name: 'Arslan', avatar_id: 6, attention: 58, math: 63, trend: 'down', sessions: 6 },
]

const AVATAR_EMOJIS = ['', '🦁', '🐰', '🦊', '🐻', '🦋', '🐸', '🦉', '🐬', '🐱', '🐼']

export default function ClassStudentsPage() {
  const navigate = useNavigate()
  const { classId } = useParams()
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-teacher-bg)', fontFamily: 'var(--font-teacher)' }}>
      <nav className="px-6 py-4 flex items-center justify-between shadow-md"
        style={{ background: 'linear-gradient(135deg, var(--color-teacher-primary), #243B55)' }}>
        <div className="flex items-center gap-3 text-white">
          <span className="text-2xl">🧊</span>
          <span className="font-bold">DüşünKüp 6D</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">Ayşe Öğretmen</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">AÖ</div>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--color-teacher-muted)' }}>
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/teacher/dashboard')}>📁 Sınıflarım</span>
          <span>›</span>
          <span>Sınıf {classId}</span>
        </div>
        
        <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--color-teacher-primary)' }}>Öğrenci Listesi</h2>
        
        <div className="flex flex-col gap-2">
          {DEMO_STUDENTS.map(s => (
            <div key={s.id}
              className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer border border-gray-100 hover:shadow-md hover:border-blue-400 transition"
              onClick={() => navigate(`/teacher/student/${s.id}`)}>
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl">
                {AVATAR_EMOJIS[s.avatar_id] || '👤'}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: 'var(--color-teacher-primary)' }}>
                  {s.first_name} {s.last_name}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-teacher-muted)' }}>{s.sessions} oturum</div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-600">🧠 {s.attention}</span>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-green-50 text-green-600">🔢 {s.math}</span>
                <span className={`text-lg font-bold ${s.trend === 'up' ? 'text-green-600' : s.trend === 'down' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
