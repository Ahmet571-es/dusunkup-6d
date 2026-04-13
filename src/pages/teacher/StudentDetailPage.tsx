import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import TeacherNav from '@/components/shared/TeacherNav'
import { getStudent, getStudentCognitive, getClass, isLoggedIn } from '@/lib/teacherAuth'
import { AVATARS, GRADE_LABELS, type Student } from '@/types'
import type { StudentCognitiveData } from '@/lib/teacherAuth'

function MetricCard({ label, value, color, change, unit }: { label: string; value: string | number; color: string; change: string; unit?: string }) {
  return (
    <motion.div className="bg-white rounded-xl p-4 text-center border border-gray-100"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-teacher-muted)' }}>{label}</div>
      <div className="text-3xl font-black mt-1" style={{ color }}>{value}{unit && <span className="text-sm font-bold">{unit}</span>}</div>
      <div className="text-xs font-bold text-green-600 mt-1">↑ {change}</div>
    </motion.div>
  )
}

function BarChart({ label, data, weeks, colors }: { label: string; data: number[]; weeks: string[]; colors: [string, string] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="text-sm font-bold mb-3" style={{ color: 'var(--color-teacher-primary)' }}>{label}</div>
      <div className="flex items-end gap-1.5" style={{ height: 100 }}>
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <motion.div className="w-full rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(data[i] / max) * 100}%` }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{ background: `linear-gradient(180deg, ${colors[0]}, ${colors[1]})`, minHeight: 3 }}
            />
            <span className="text-[9px] mt-1 font-semibold" style={{ color: 'var(--color-teacher-muted)' }}>{w}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RadarDisplay({ cog }: { cog: StudentCognitiveData }) {
  // Simplified radar display as bars
  const dimensions = [
    { label: 'Sürekli Dikkat', value: cog.attention_score, color: '#3B82F6' },
    { label: 'Seçici Dikkat', value: Math.min(100, cog.attention_score + 5), color: '#6366F1' },
    { label: 'Çalışma Belleği', value: cog.memory_score, color: '#8B5CF6' },
    { label: 'Sayı Hissi', value: Math.min(100, 100 - cog.number_line_pae * 3), color: '#10B981' },
    { label: 'Aritmetik Akıcılık', value: Math.min(100, cog.fluency * 5), color: '#F59E0B' },
    { label: 'Kavramsal Anlayış', value: cog.math_score, color: '#EF4444' },
    { label: 'Otomatik Bilgi', value: cog.automatized_facts, color: '#EC4899' },
  ]
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="text-sm font-bold mb-3" style={{ color: 'var(--color-teacher-primary)' }}>📊 Bilişsel Profil</div>
      <div className="flex flex-col gap-2">
        {dimensions.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] font-semibold w-28 text-right" style={{ color: 'var(--color-teacher-muted)' }}>{d.label}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: d.color }}
                initial={{ width: 0 }} animate={{ width: `${d.value}%` }}
                transition={{ delay: i * 0.08, duration: 0.6 }} />
            </div>
            <span className="text-[11px] font-bold w-8" style={{ color: d.color }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const MISCONCEPTION_LABELS: Record<string, string> = {
  conservation_error: 'Korunum eksikliği — Aralıklı diziyi "daha çok" algılıyor',
  cardinality_error: 'Kardinalite eksikliği — Son sayının toplamı ifade ettiğini anlamıyor',
  double_count_error: 'Çift sayma hatası — Aynı nesneyi birden fazla sayıyor',
  addition_subtraction_disconnect: 'Toplama-çıkarma bağlantısızlığı',
  fraction_whole_number_bias: 'Kesirde tam sayı yanlılığı',
}

export default function StudentDetailPage() {
  const navigate = useNavigate()
  const { studentId } = useParams<{ studentId: string }>()
  const [reportTab, setReportTab] = useState<'teacher' | 'parent'>('teacher')
  const [student, setStudent] = useState<Student | null>(null)
  const [cog, setCog] = useState<StudentCognitiveData | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/teacher'); return; }
    if (studentId) {
      const s = getStudent(studentId)
      setStudent(s)
      setCog(getStudentCognitive(studentId))
    }
  }, [studentId, navigate])

  if (!student || !cog) return <div className="p-8 text-center">Yükleniyor...</div>

  const classInfo = getClass(student.class_id)
  const avatarEmoji = AVATARS.find(a => a.id === student.avatar_id)?.icon || '👤'
  const weeks = ['H1','H2','H3','H4','H5','H6']

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-teacher-bg)', fontFamily: 'var(--font-teacher)' }}>
      <TeacherNav />

      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--color-teacher-muted)' }}>
          <span className="cursor-pointer hover:text-blue-600 transition" onClick={() => navigate('/teacher/dashboard')}>📁 Sınıflarım</span>
          <span className="opacity-40">›</span>
          <span className="cursor-pointer hover:text-blue-600 transition" onClick={() => navigate(`/teacher/class/${student.class_id}`)}>{classInfo?.name}</span>
          <span className="opacity-40">›</span>
          <span className="font-semibold">{student.first_name} {student.last_name}</span>
        </div>

        {/* Student Header */}
        <motion.div className="bg-white rounded-2xl p-5 flex items-center gap-5 mb-5 border border-gray-100"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-4xl flex-shrink-0">{avatarEmoji}</div>
          <div className="flex-1">
            <div className="text-xl font-extrabold" style={{ color: 'var(--color-teacher-primary)' }}>
              {student.first_name} {student.last_name}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-teacher-muted)' }}>
              {classInfo?.name} · {classInfo ? GRADE_LABELS[classInfo.grade_level] : ''} · {cog.total_sessions} oturum
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'var(--color-teacher-accent)' }}>📄 Rapor İndir</button>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold border transition hover:bg-gray-50"
              style={{ color: 'var(--color-teacher-accent)', borderColor: 'var(--color-teacher-accent)' }}>📤 Veliye Gönder</button>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <MetricCard label="Dikkat İndeksi" value={cog.attention_score} color="#2563EB" change={`+${cog.weekly_attention[5] - cog.weekly_attention[0]}`} />
          <MetricCard label="Matematik Skoru" value={cog.math_score} color="#16A34A" change={`+${cog.weekly_math[5] - cog.weekly_math[0]}`} />
          <MetricCard label="Çalışma Belleği" value={cog.memory_score} color="#8B5CF6" change="+18" />
          <MetricCard label="Aritmetik Akıcılık" value={cog.fluency} color="#F59E0B" change={`5→${cog.fluency}`} unit="/dk" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <BarChart label="🧠 Dikkat Gelişim Trendi" data={cog.weekly_attention} weeks={weeks} colors={['#93C5FD','#2563EB']} />
          <BarChart label="🔢 Matematik Gelişim Trendi" data={cog.weekly_math} weeks={weeks} colors={['#6EE7B7','#16A34A']} />
        </div>

        {/* Cognitive Profile + Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <RadarDisplay cog={cog} />
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="text-sm font-bold mb-3" style={{ color: 'var(--color-teacher-primary)' }}>📈 Detaylı Metrikler</div>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { label: 'Weber Oranı (w)', value: cog.weber_fraction.toFixed(2), note: (w: string) => parseFloat(w) < 0.20 ? '✅ İyi' : parseFloat(w) < 0.25 ? '⚠️ Orta' : '🔴 Zayıf' },
                { label: 'Sayı Doğrusu PAE', value: `%${cog.number_line_pae}`, note: (v: string) => parseInt(v) < 10 ? '✅ Hassas' : parseInt(v) < 18 ? '⚠️ Orta' : '🔴 Düşük' },
                { label: 'Baskın Strateji', value: cog.dominant_strategy.replace(/_/g, ' '), note: (_v: string) => '' },
                { label: 'Otomatik Bilgi', value: `%${cog.automatized_facts}`, note: (v: string) => parseInt(v) > 70 ? '✅ İyi' : parseInt(v) > 40 ? '⚠️ Gelişiyor' : '🔴 Başlangıç' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span style={{ color: 'var(--color-teacher-muted)' }}>{m.label}</span>
                  <span className="font-bold" style={{ color: 'var(--color-teacher-primary)' }}>{m.value} {m.note(String(m.value).replace('%',''))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Misconceptions */}
        {cog.misconceptions.length > 0 && (
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mb-5">
            <div className="text-sm font-bold mb-2 text-orange-700">⚠️ Tespit Edilen Kavram Yanılgıları</div>
            {cog.misconceptions.map((m, i) => (
              <div key={i} className="text-xs text-orange-800 py-1">{MISCONCEPTION_LABELS[m] || m}</div>
            ))}
          </div>
        )}

        {/* Report Tabs */}
        <div className="flex gap-2 mb-3">
          {[
            { id: 'teacher' as const, label: '👩‍🏫 Öğretmen Raporu', bg: '#2563EB' },
            { id: 'parent' as const, label: '👨‍👩‍👧 Veli Raporu', bg: '#16A34A' },
          ].map(t => (
            <button key={t.id} onClick={() => setReportTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${reportTab === t.id ? 'text-white border-transparent' : 'bg-white border-gray-200'}`}
              style={reportTab === t.id ? { background: t.bg } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Reports */}
        {reportTab === 'teacher' ? (
          <motion.div className="rounded-xl p-5 border border-blue-200 mb-6"
            style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)' }}
            key="teacher" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded bg-blue-600">🤖 AI Analiz</span>
              <span className="text-[11px]" style={{ color: 'var(--color-teacher-muted)' }}>6 Haftalık Değerlendirme</span>
            </div>
            <div className="text-xs leading-relaxed space-y-2" style={{ color: 'var(--color-teacher-text)' }}>
              <p><strong>{student.first_name}</strong>'in sürekli dikkat skorları istikrarlı artış gösteriyor (haftalık ort. %{((cog.weekly_attention[5]-cog.weekly_attention[0])/6).toFixed(1)} iyileşme). {cog.attention_score >= 70 ? 'CPT performansında omission hataları belirgin düşüş göstermiş, dikkat kapasitesinde güçlenme mevcut.' : 'CPT performansında hâlâ dalgalanma gözleniyor, sürekli dikkat antrenmanı dozajı artırılmalıdır.'}</p>
              <p>Matematik boyutunda aritmetik akıcılık dakikada {cog.fluency} doğru işleme ulaşmıştır. Sayı hissi testlerinde Weber Oranı {cog.weber_fraction.toFixed(2)}, Sayı Doğrusu PAE %{cog.number_line_pae}. {cog.weber_fraction < 0.22 ? 'Sayısal hassasiyet yaş normunda.' : 'Sayısal hassasiyet geliştirilmeli — büyüklük karşılaştırma aktiviteleri artırılmalı.'}</p>
              <p>Baskın strateji: <strong>{cog.dominant_strategy.replace(/_/g, ' ')}</strong>. {cog.dominant_strategy === 'retrieval' ? 'Otomatisite kazanılmış, üst düzey problem çözmeye geçiş uygun.' : cog.dominant_strategy === 'counting_all' ? 'Hâlâ en ilkel strateji kullanılıyor — counting on stratejisine geçiş için hedefli müdahale gerekli.' : 'Geçiş aşamasında — aralıklı tekrar ile retrieval seviyesine çıkarılmalı.'}</p>
              <p>Otomatikleşmiş aritmetik bilgi oranı: %{cog.automatized_facts}. {cog.automatized_facts > 70 ? 'İyi seviyede.' : 'Aralıklı tekrar protokolü aktif tutulmalı.'}</p>
              {cog.misconceptions.length > 0 && <p className="text-orange-700 font-semibold">⚠️ Kavram yanılgısı tespit edildi: {cog.misconceptions.map(m => MISCONCEPTION_LABELS[m] || m).join(', ')}. Hedefli somut deneyimlerle müdahale önerilir.</p>}
              <p>Çapraz analiz: Dikkat gelişimi ile matematik performansı arasında {cog.attention_score > 65 && cog.math_score > 65 ? 'güçlü pozitif korelasyon gözlemlenmektedir.' : 'dikkat desteğinin matematik performansını doğrudan etkileyeceği öngörülmektedir.'}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div className="rounded-xl p-5 border border-green-200 mb-6"
            style={{ background: 'linear-gradient(135deg, #F0FDF4, #FFFBEB)' }}
            key="parent" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded bg-green-600">💌 Veli Özeti</span>
              <span className="text-[11px]" style={{ color: 'var(--color-teacher-muted)' }}>Aylık Gelişim</span>
            </div>
            <div className="text-xs leading-relaxed space-y-2" style={{ color: 'var(--color-teacher-text)' }}>
              <p>Sevgili Veli, <strong>{student.first_name}</strong> bu ay {cog.trend === 'up' ? 'harika bir ilerleme gösterdi! 🎉' : cog.trend === 'stable' ? 'istikrarlı bir dönem geçirdi.' : 'biraz desteğe ihtiyaç duyuyor.'}</p>
              <p>{cog.attention_score >= 70 ? 'Dikkat süresi belirgin şekilde arttı — oyunlarda çok daha uzun süre odaklanabiliyor.' : 'Dikkat süresini geliştirmek için düzenli oyun seansları çok önemli.'} {cog.math_score >= 70 ? 'Matematiksel becerileri güçleniyor, toplama-çıkarmayı giderek daha rahat yapıyor.' : 'Matematik konusunda pratik yapmaya devam etmesi faydalı olacaktır.'}</p>
              <p>Evde yapabileceğiniz etkinlikler: {cog.dominant_strategy === 'counting_all' ? 'Günlük nesnelerle sayma oyunları oynayın — kaşıkları, oyuncakları birlikte sayın.' : cog.dominant_strategy === 'retrieval' ? 'Çocuğunuz çok iyi ilerliyor! Problem çözme oyunları ve bilmeceler ona keyif verecektir.' : 'Alışverişte fiyat toplama, pizza keserken eşit parçalara bölme gibi günlük matematik deneyimleri çok faydalıdır. 🍕'}</p>
              <p>{student.first_name} {cog.trend === 'up' ? 'çok güzel bir yolda ilerliyor. Tebrikler! 🌟' : 'ile birlikte çalışmaya devam ediyoruz. Desteğiniz çok değerli! 💪'}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
