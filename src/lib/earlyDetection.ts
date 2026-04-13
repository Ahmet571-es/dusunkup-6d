/**
 * Early Detection System
 * Analyzes cognitive metrics patterns to flag potential concerns:
 * - Dyscalculia risk indicators
 * - ADHD attention pattern indicators
 * - Working memory deficit indicators
 * - Emotional/behavioral concerns
 */

import type { StudentCognitiveData } from './teacherAuth'

export interface Alert {
  type: 'dyscalculia_risk' | 'adhd_indicators' | 'working_memory_deficit' | 'emotional_concern' | 'performance_drop'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  recommendation: string
  evidence: Record<string, number | string>
}

export function detectAlerts(name: string, data: StudentCognitiveData): Alert[] {
  const alerts: Alert[] = []

  // Dyscalculia risk
  if (data.weber_fraction > 0.30 && data.number_line_pae > 18) {
    alerts.push({
      type: 'dyscalculia_risk',
      severity: data.weber_fraction > 0.35 ? 'high' : 'medium',
      title: 'Diskalkuli Riski',
      description: `${name}'in sayı hissi metrikleri yaş normunun belirgin altında. Weber Oranı (${data.weber_fraction.toFixed(2)}) ve Sayı Doğrusu hatası (%${data.number_line_pae}) yüksek.`,
      recommendation: 'Somut materyallerle yoğun sayı hissi çalışması önerilir. Uzman değerlendirmesine yönlendirme düşünülmelidir.',
      evidence: { weber_fraction: data.weber_fraction, number_line_pae: data.number_line_pae }
    })
  }

  // ADHD indicators
  if (data.attention_score < 45 && data.memory_score < 50) {
    alerts.push({
      type: 'adhd_indicators',
      severity: data.attention_score < 35 ? 'high' : 'medium',
      title: 'Dikkat Eksikliği Belirtileri',
      description: `${name}'in dikkat skoru (${data.attention_score}) ve çalışma belleği (${data.memory_score}) yaş normunun altında. Tutarsız performans örüntüsü gözlemleniyor.`,
      recommendation: 'Dikkat antrenmanı dozajını artırın. Seans sürelerini kısaltıp sıklığı artırın. Uzman değerlendirmesi önerilir.',
      evidence: { attention_score: data.attention_score, memory_score: data.memory_score }
    })
  }

  // Working memory deficit
  if (data.memory_score < 40) {
    alerts.push({
      type: 'working_memory_deficit',
      severity: data.memory_score < 30 ? 'high' : 'medium',
      title: 'Çalışma Belleği Zayıflığı',
      description: `${name}'in çalışma belleği kapasitesi (${data.memory_score}) düşük. Çok adımlı işlemlerde zorluk yaşayabilir.`,
      recommendation: 'N-back eğitimi dozajını artırın. Görevleri daha küçük adımlara bölün. Görsel ipuçları kullanın.',
      evidence: { memory_score: data.memory_score }
    })
  }

  // Performance drop
  if (data.trend === 'down') {
    const attDrop = data.weekly_attention[0] - data.weekly_attention[5]
    const mathDrop = data.weekly_math[0] - data.weekly_math[5]
    if (attDrop > 5 || mathDrop > 5) {
      alerts.push({
        type: 'performance_drop',
        severity: attDrop > 15 || mathDrop > 15 ? 'high' : 'low',
        title: 'Performans Düşüşü',
        description: `${name}'in performansında ${Math.max(attDrop, mathDrop)} puanlık düşüş gözlemleniyor.`,
        recommendation: 'Öğrenciyle birebir görüşme yapılması, duygusal durum değerlendirmesi ve motivasyon desteği önerilir.',
        evidence: { attention_drop: attDrop, math_drop: mathDrop }
      })
    }
  }

  // Low session count (dosage warning)
  if (data.total_sessions < 6) {
    alerts.push({
      type: 'emotional_concern',
      severity: 'low',
      title: 'Yetersiz Kullanım',
      description: `${name} bu dönem sadece ${data.total_sessions} oturum tamamlamış. Minimum haftalık 3 seans hedefine ulaşılamamış.`,
      recommendation: 'Öğrencinin platforma düzenli erişimi sağlanmalıdır. Ailevi destek talep edilebilir.',
      evidence: { total_sessions: data.total_sessions }
    })
  }

  return alerts
}

/**
 * Dosage tracking — check if student meets weekly targets
 */
export function checkDosage(sessions: number, weekCount: number): {
  met: boolean; percentage: number; recommendation: string
} {
  const targetPerWeek = 3
  const totalTarget = targetPerWeek * weekCount
  const percentage = Math.round((sessions / totalTarget) * 100)

  return {
    met: percentage >= 80,
    percentage: Math.min(100, percentage),
    recommendation: percentage >= 80
      ? 'Dozaj hedefi karşılanıyor. Mevcut programa devam edin.'
      : percentage >= 50
        ? 'Dozaj hedefi kısmen karşılanıyor. Haftalık seans sayısını artırmaya çalışın.'
        : 'Dozaj hedefi karşılanmıyor. Minimum haftada 3 seans gereklidir.',
  }
}
