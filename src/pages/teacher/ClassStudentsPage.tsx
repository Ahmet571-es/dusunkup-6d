import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TeacherNav from '@/components/shared/TeacherNav'
import Modal from '@/components/ui/Modal'
import { getClass, getStudents, addStudent, deleteStudent, getStudentCognitive, isLoggedIn } from '@/lib/teacherAuth'
import { AVATARS, GRADE_LABELS, type Student } from '@/types'

export default function ClassStudentsPage() {
  const navigate = useNavigate()
  const { classId } = useParams<{ classId: string }>()
  const [students, setStudents] = useState<Student[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newAvatar, setNewAvatar] = useState(1)

  const classInfo = classId ? getClass(classId) : null

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/teacher'); return; }
    if (classId) setStudents(getStudents(classId))
  }, [classId, navigate])

  if (!classInfo) return <div className="p-8 text-center">Sınıf bulunamadı</div>

  const handleAddStudent = () => {
    if (!newFirst.trim() || !newLast.trim() || !classId) return
    addStudent(classId, newFirst.trim(), newLast.trim(), newAvatar)
    setStudents(getStudents(classId))
    setShowAddModal(false)
    setNewFirst(''); setNewLast(''); setNewAvatar(1)
  }

  const handleDelete = (id: string) => {
    deleteStudent(id)
    if (classId) setStudents(getStudents(classId))
    setShowDeleteConfirm(null)
  }

  const getAvatarEmoji = (id: number) => AVATARS.find(a => a.id === id)?.icon || '👤'

  return (
    <div className="min-h-screen pb-16" style={{ background: 'var(--color-teacher-bg)', fontFamily: 'var(--font-teacher)' }}>
      <TeacherNav />

      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--color-teacher-muted)' }}>
          <span className="cursor-pointer hover:text-blue-600 transition" onClick={() => navigate('/teacher/dashboard')}>📁 Sınıflarım</span>
          <span className="opacity-40">›</span>
          <span className="font-semibold">{classInfo.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-teacher-primary)' }}>
              {classInfo.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-teacher-muted)' }}>
              {GRADE_LABELS[classInfo.grade_level]} · {students.length} öğrenci · {classInfo.academic_year}
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90 flex items-center gap-2"
            style={{ background: 'var(--color-teacher-accent)' }}>
            ➕ Öğrenci Ekle
          </button>
        </div>

        {/* Student List */}
        {students.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <span className="text-5xl block mb-4">📭</span>
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--color-teacher-primary)' }}>Henüz öğrenci yok</p>
            <p className="text-sm" style={{ color: 'var(--color-teacher-muted)' }}>Bu sınıfa öğrenci eklemek için yukarıdaki butonu kullanın.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {students.map((s, i) => {
                const cog = getStudentCognitive(s.id)
                return (
                  <motion.div key={s.id}
                    className="bg-white rounded-xl px-5 py-3.5 flex items-center gap-4 cursor-pointer border border-gray-100 hover:shadow-md hover:border-blue-300 transition group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/teacher/student/${s.id}`)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {getAvatarEmoji(s.avatar_id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: 'var(--color-teacher-primary)' }}>
                        {s.first_name} {s.last_name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-teacher-muted)' }}>
                        {cog.total_sessions} oturum · {cog.dominant_strategy === 'retrieval' ? '⭐ Otomatik' : cog.dominant_strategy === 'counting_all' ? '🔄 Başlangıç' : '📈 Gelişiyor'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600">🧠 {cog.attention_score}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-600">🔢 {cog.math_score}</span>
                      <span className={`text-base font-bold ${cog.trend === 'up' ? 'text-green-500' : cog.trend === 'down' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {cog.trend === 'up' ? '↑' : cog.trend === 'down' ? '↓' : '→'}
                      </span>
                      <button
                        className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-100 hover:text-red-600 ml-1"
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(s.id); }}
                      >✕</button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Öğrenci Ekle">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-teacher-text)' }}>Ad</label>
            <input type="text" value={newFirst} onChange={e => setNewFirst(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
              placeholder="Öğrencinin adı" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-teacher-text)' }}>Soyad</label>
            <input type="text" value={newLast} onChange={e => setNewLast(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
              placeholder="Öğrencinin soyadı" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-teacher-text)' }}>Avatar Seç</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map(a => (
                <div key={a.id}
                  className={`p-2 rounded-xl text-center cursor-pointer transition ${newAvatar === a.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                  onClick={() => setNewAvatar(a.id)}>
                  <span className="text-2xl block">{a.icon}</span>
                  <span className="text-[9px] block mt-0.5 truncate" style={{ color: 'var(--color-teacher-muted)' }}>{a.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleAddStudent}
            className="w-full py-3 rounded-xl text-white font-bold text-sm mt-1 transition hover:opacity-90"
            style={{ background: 'var(--color-teacher-accent)' }}>
            Öğrenci Ekle
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Öğrenciyi Sil">
        <p className="text-sm mb-4" style={{ color: 'var(--color-teacher-text)' }}>
          Bu öğrenciyi ve tüm verilerini silmek istediğinizden emin misiniz?
        </p>
        <div className="flex gap-3">
          <button onClick={() => setShowDeleteConfirm(null)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition">İptal</button>
          <button onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition">Evet, Sil</button>
        </div>
      </Modal>
    </div>
  )
}
