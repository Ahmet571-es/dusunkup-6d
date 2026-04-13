import { useNavigate } from 'react-router-dom'
import { logout, getTeacher } from '@/lib/teacherAuth'

export default function TeacherNav() {
  const navigate = useNavigate()
  const teacher = getTeacher()
  const initials = teacher?.full_name?.split(' ').map(n => n[0]).join('') || 'ÖĞ'

  const handleLogout = () => {
    logout()
    navigate('/mode')
  }

  return (
    <nav className="px-6 py-3.5 flex items-center justify-between shadow-md"
      style={{ background: 'linear-gradient(135deg, var(--color-teacher-primary), #243B55)' }}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/teacher/dashboard')}>
        <span className="text-2xl">🧊</span>
        <span className="text-white font-bold text-lg hidden sm:block">DüşünKüp 6D</span>
        <span className="text-white/40 text-sm hidden md:block">Öğretmen Paneli</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white/70 text-sm hidden sm:block">{teacher?.full_name}</span>
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-blue-500 transition"
          onClick={handleLogout} title="Çıkış Yap">
          {initials}
        </div>
      </div>
    </nav>
  )
}
