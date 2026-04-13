import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TeacherLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Supabase auth — Faz 2'de tam implementasyon
    navigate('/teacher/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-teacher-bg)', fontFamily: 'var(--font-teacher)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <span className="text-4xl">🧊</span>
          <h1 className="text-2xl font-bold mt-3" style={{ color: 'var(--color-teacher-primary)' }}>
            DüşünKüp 6D
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-teacher-muted)' }}>
            Öğretmen Paneli
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: 'var(--color-teacher-text)' }}>
              E-posta
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition"
              placeholder="ogretmen@okul.edu.tr" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: 'var(--color-teacher-text)' }}>
              Şifre
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition"
              placeholder="••••••••" />
          </div>
          <button type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-sm mt-2 transition hover:opacity-90"
            style={{ background: 'var(--color-teacher-accent)' }}>
            Giriş Yap
          </button>
        </form>
        
        <button onClick={() => navigate('/mode')}
          className="w-full text-center text-sm mt-4 py-2 opacity-50 hover:opacity-80 transition">
          ← Ana Sayfaya Dön
        </button>
      </div>
    </div>
  )
}
