import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login, isLoggedIn } from '@/lib/teacherAuth'

export default function TeacherLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('ogretmen@dusunkup.com')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) navigate('/teacher/dashboard')
  }, [navigate])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    setTimeout(() => {
      const teacher = login(email, password)
      if (teacher) {
        navigate('/teacher/dashboard')
      } else {
        setError('E-posta veya şifre hatalı')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-teacher-bg)', fontFamily: 'var(--font-teacher)' }}>
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🧊</span>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-teacher-primary)' }}>DüşünKüp 6D</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-teacher-muted)' }}>Öğretmen Paneli</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center font-semibold">{error}</div>
        )}

        <div className="mb-4 p-3 rounded-xl bg-blue-50 text-blue-600 text-xs text-center">
          Demo mod: Herhangi bir şifre ile giriş yapabilirsiniz
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-teacher-text)' }}>E-posta</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition"
              placeholder="ogretmen@okul.edu.tr" required />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-teacher-text)' }}>Şifre</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-sm mt-2 transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--color-teacher-accent)' }}>
            {loading ? '⏳ Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <button onClick={() => navigate('/mode')}
          className="w-full text-center text-sm mt-4 py-2 opacity-40 hover:opacity-70 transition"
          style={{ color: 'var(--color-teacher-text)' }}>
          ← Ana Sayfaya Dön
        </button>
      </motion.div>
    </div>
  )
}
