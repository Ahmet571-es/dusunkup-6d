import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TeacherNav from '@/components/shared/TeacherNav'
import Modal from '@/components/ui/Modal'
import { getClasses, addClass, deleteClass, getClassStats, isLoggedIn } from '@/lib/teacherAuth'
import { GRADE_COLORS, GRADE_LABELS, type GradeLevel, type Class } from '@/types'

const GRADE_OPTIONS: { value: GradeLevel; label: string }[] = [
  { value: 'anaokulu', label: 'Anaokulu' },
  { value: 'sinif1', label: '1. Sınıf' },
  { value: 'sinif2', label: '2. Sınıf' },
  { value: 'sinif3', label: '3. Sınıf' },
  { value: 'sinif4', label: '4. Sınıf' },
  { value: 'sinif5', label: '5. Sınıf' },
]

export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<Class[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [newClassName, setNewClassName] = useState('')
  const [newGrade, setNewGrade] = useState<GradeLevel>('anaokulu')
  const [newSection, setNewSection] = useState('A')

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/teacher'); return; }
    setClasses(getClasses())
  }, [navigate])

  const handleAddClass = () => {
    if (!newClassName.trim()) return
    addClass(newClassName.trim(), newGrade, newSection)
    setClasses(getClasses())
    setShowAddModal(false)
    setNewClassName('')
    setNewSection('A')
  }

  const handleDeleteClass = (id: string) => {
    deleteClass(id)
    setClasses(getClasses())
    setShowDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: 'var(--color-teacher-bg)', fontFamily: 'var(--font-teacher)' }}>
      <TeacherNav />

      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-teacher-primary)' }}>📁 Sınıflarım</h2>
          <div className="flex gap-2">
            <button onClick={() => navigate('/teacher/feedback')}
              className="px-4 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90 flex items-center gap-2"
              style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}>
              💬 Çocuk Geri Bildirimleri
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90 flex items-center gap-2"
              style={{ background: 'var(--color-teacher-accent)' }}>
              ➕ Yeni Sınıf
            </button>
          </div>
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="contents">
            {classes.map((c, i) => {
              const stats = getClassStats(c.id)
              return (
                <motion.div key={c.id}
                  className="bg-white rounded-2xl p-5 cursor-pointer border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden group"
                  style={{ position: 'relative', zIndex: 1 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onPointerUp={() => navigate(`/teacher/class/${c.id}`)}
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ background: GRADE_COLORS[c.grade_level] }} />
                  
                  {/* Delete button */}
                  <button
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-100 hover:text-red-600"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(c.id); }}
                  >✕</button>

                  <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-lg inline-block mb-3"
                    style={{ background: GRADE_COLORS[c.grade_level] }}>
                    {GRADE_LABELS[c.grade_level]}
                  </span>

                  <div className="text-xl font-bold mb-1" style={{ color: 'var(--color-teacher-primary)' }}>📂 {c.name}</div>
                  <div className="text-xs mb-3" style={{ color: 'var(--color-teacher-muted)' }}>
                    {stats.studentCount} öğrenci · {c.academic_year}
                  </div>

                  {/* Quick Stats */}
                  {stats.studentCount > 0 && (
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-600">
                        🧠 Ort: {stats.avgAttention}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-green-50 text-green-600">
                        🔢 Ort: {stats.avgMath}
                      </span>
                      {stats.alerts > 0 && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-50 text-red-500">
                          ⚠️ {stats.alerts}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Class Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Sınıf Ekle">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-teacher-text)' }}>Sınıf Adı</label>
            <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
              placeholder="Örn: Anaokulu-B, 2-A" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-teacher-text)' }}>Seviye</label>
            <select value={newGrade} onChange={e => setNewGrade(e.target.value as GradeLevel)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 bg-white">
              {GRADE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-teacher-text)' }}>Şube</label>
            <input type="text" value={newSection} onChange={e => setNewSection(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
              placeholder="A" maxLength={2} />
          </div>
          <button onClick={handleAddClass}
            className="w-full py-3 rounded-xl text-white font-bold text-sm mt-1 transition hover:opacity-90"
            style={{ background: 'var(--color-teacher-accent)' }}>
            Sınıf Oluştur
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Sınıfı Sil">
        <p className="text-sm mb-4" style={{ color: 'var(--color-teacher-text)' }}>
          Bu sınıfı ve içindeki tüm öğrencileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setShowDeleteConfirm(null)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition"
            style={{ color: 'var(--color-teacher-text)' }}>İptal</button>
          <button onClick={() => showDeleteConfirm && handleDeleteClass(showDeleteConfirm)}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition">Evet, Sil</button>
        </div>
      </Modal>
    </div>
  )
}
