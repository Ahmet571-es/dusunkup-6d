import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function StudentDetailPage() {
  const navigate = useNavigate()
  const { studentId } = useParams()
  const [reportTab, setReportTab] = useState<'teacher' | 'parent'>('teacher')
  
  // Demo data
  const student = { name: 'Ayşe Yılmaz', avatar: '🦋', attention: 78, math: 82, memory: 72, fluency: 14, sessions: 14 }
  const weeks = ['H1','H2','H3','H4','H5','H6']
  const attData = [45,52,58,65,71,78]
  const mathData = [50,56,63,70,76,82]
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-teacher-bg)', fontFamily: 'var(--font-teacher)' }}>
      <nav className="px-6 py-4 flex items-center justify-between shadow-md"
        style={{ background: 'linear-gradient(135deg, var(--color-teacher-primary), #243B55)' }}>
        <div className="flex items-center gap-3 text-white">
          <span className="text-2xl">🧊</span><span className="font-bold">DüşünKüp 6D</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">Ayşe Öğretmen</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">AÖ</div>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto p-6">
        <button onClick={() => navigate(-1)}
          className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 mb-4 transition"
          style={{ color: 'var(--color-teacher-accent)' }}>
          ← Geri
        </button>
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-5 flex items-center gap-5 mb-4 border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-4xl">{student.avatar}</div>
          <div className="flex-1">
            <div className="text-xl font-extrabold" style={{ color: 'var(--color-teacher-primary)' }}>{student.name}</div>
            <div className="text-sm" style={{ color: 'var(--color-teacher-muted)' }}>Anaokulu-A · {student.sessions} oturum</div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--color-teacher-accent)' }}>📄 Rapor İndir</button>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ color: 'var(--color-teacher-accent)', borderColor: 'var(--color-teacher-accent)' }}>📤 Veliye Gönder</button>
          </div>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Dikkat İndeksi', value: student.attention, color: '#2563EB', change: '+33' },
            { label: 'Matematik Skoru', value: student.math, color: '#16A34A', change: '+32' },
            { label: 'Çalışma Belleği', value: student.memory, color: '#8B5CF6', change: '+18' },
            { label: 'Aritmetik Akıcılık', value: `${student.fluency}/dk`, color: '#F59E0B', change: '5→14' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-xl p-4 text-center border border-gray-100">
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-teacher-muted)' }}>{m.label}</div>
              <div className="text-3xl font-black mt-1" style={{ color: m.color }}>{m.value}</div>
              <div className="text-xs font-bold text-green-600 mt-1">↑ {m.change}</div>
            </div>
          ))}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: '🧠 Dikkat Gelişim Trendi', data: attData, color: ['#93C5FD','#2563EB'] },
            { label: '🔢 Matematik Gelişim Trendi', data: mathData, color: ['#6EE7B7','#16A34A'] },
          ].map((chart, ci) => (
            <div key={ci} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-sm font-bold mb-3" style={{ color: 'var(--color-teacher-primary)' }}>{chart.label}</div>
              <div className="flex items-end gap-2 h-24">
                {weeks.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full rounded-t" 
                      style={{ 
                        height: `${chart.data[i]}%`, 
                        background: `linear-gradient(180deg, ${chart.color[0]}, ${chart.color[1]})`,
                        minHeight: 4,
                      }} />
                    <span className="text-[9px] mt-1 font-semibold" style={{ color: 'var(--color-teacher-muted)' }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Report Tabs */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setReportTab('teacher')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${reportTab === 'teacher' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200'}`}>
            👩‍🏫 Öğretmen Raporu
          </button>
          <button onClick={() => setReportTab('parent')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition ${reportTab === 'parent' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200'}`}>
            👨‍👩‍👧 Veli Raporu
          </button>
        </div>
        
        {reportTab === 'teacher' ? (
          <div className="rounded-xl p-5 border border-blue-200" style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded bg-blue-600">🤖 AI Analiz</span>
              <span className="text-[11px]" style={{ color: 'var(--color-teacher-muted)' }}>6 Haftalık Değerlendirme</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-teacher-text)' }}>
              Ayşe'nin sürekli dikkat skorları istikrarlı artış gösteriyor (haftalık ort. %4.7 iyileşme). CPT performansında omission hataları %38'den %12'ye düşmüş, bu sürekli dikkat kapasitesinde belirgin güçlenmeye işaret etmektedir. Yürütücü kontrol görevlerinde commission hata oranı hâlâ yaş normunun üzerinde — dürtü kontrolü çalışmalarının sıklığı artırılmalıdır.
            </p>
            <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--color-teacher-text)' }}>
              Matematik boyutunda aritmetik akıcılık dakikada 5 doğru işlemden 14'e yükselmiştir. Sayı hissi testlerinde hata payı %18'den %7'ye düşmüştür. CPA takibinde toplama-çıkarma soyut aşamaya geçmiştir, çarpma hâlâ görsel aşamadadır.
            </p>
          </div>
        ) : (
          <div className="rounded-xl p-5 border border-green-200" style={{ background: 'linear-gradient(135deg, #F0FDF4, #FFFBEB)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded bg-green-600">💌 Veli Özeti</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-teacher-text)' }}>
              Sevgili Veli, Ayşe bu ay harika ilerledi! 🎉 Dikkat süresi belirgin şekilde arttı — oyunlarda çok daha uzun süre odaklanabiliyor. Toplama-çıkarmayı artık çok rahat yapıyor. Evde günlük nesnelerle gruplandırma oyunları oynarsanız çok faydalı olacaktır. 🍕
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
