/**
 * AI Report Generator
 * Generates teacher and parent reports based on cognitive metrics
 * Uses Claude API when available, falls back to template-based generation
 */

import type { GradeLevel } from '@/types'
import type { StudentCognitiveData } from './teacherAuth'

interface ReportData {
  studentName: string
  gradeLevel: GradeLevel
  className: string
  cognitive: StudentCognitiveData
  periodWeeks: number
}

const GRADE_LABELS: Record<GradeLevel, string> = {
  anaokulu: 'Anaokulu', sinif1: '1. Sınıf', sinif2: '2. Sınıf',
  sinif3: '3. Sınıf', sinif4: '4. Sınıf', sinif5: '5. Sınıf',
}

const STRATEGY_LABELS: Record<string, string> = {
  counting_all: 'Hepsini Sayma (en temel)',
  counting_on_first: 'İlkinden Devam Etme',
  counting_on_larger: 'Büyükten Devam Etme',
  making_tens: '10\'a Tamamlama',
  near_doubles: 'Yakın İkizlerden Türetme',
  compensation: 'Telafi Stratejisi',
  retrieval: 'Direkt Hatırlama (otomatik)',
}

const MISCONCEPTION_EXPLANATIONS: Record<string, { teacher: string; parent: string }> = {
  conservation_error: {
    teacher: 'Sayı korunumu eksikliği tespit edildi — aralıklı dizileri "daha çok" olarak algılıyor. Piaget korunum görevleri ile somut deneyimler önerilir.',
    parent: 'Çocuğunuz nesnelerin dizilişi değiştiğinde sayının da değiştiğini düşünebiliyor. Evde farklı düzenlerde sayma oyunları oynayabilirsiniz.'
  },
  cardinality_error: {
    teacher: 'Kardinalite prensibi henüz kazanılmamış — "kaç tane?" sorusuna son sayıyı değil tekrar saymayı tercih ediyor. Sayma sonrası "toplam bu kadar" vurgusu gerekli.',
    parent: 'Birlikte saydıktan sonra "toplam kaç?" diye sorun, çocuğunuz son sayının toplamı gösterdiğini öğrenecektir.'
  },
  double_count_error: {
    teacher: 'Çift sayma hatası mevcut — aynı nesneyi birden fazla sayıyor. Bire-bir eşleme prensibini güçlendirmek için sayılan nesneyi fiziksel olarak ayırma pratiği önerilir.',
    parent: 'Sayarken nesneleri bir kutuya atma oyunu oynayın — sayılan nesne ayrılınca tekrar sayma sorunu çözülür.'
  },
  fraction_whole_number_bias: {
    teacher: 'Kesirde tam sayı yanlılığı — pay ve paydayı bağımsız tam sayılar gibi işliyor (ör. 1/3+1/4=2/7). Alan modeli ile görsel kesir toplama müdahalesi gerekli.',
    parent: 'Kesirlerle ilgili pizza veya pasta kesme oyunları çok faydalı olacaktır. Eşit parçalara bölmenin önemini vurgulayın.'
  },
}

/**
 * Generate teacher report
 */
export function generateTeacherReport(data: ReportData): string {
  const { studentName, cognitive: c } = data
  const attChange = c.weekly_attention[5] - c.weekly_attention[0]
  const mathChange = c.weekly_math[5] - c.weekly_math[0]
  const weeklyAttImprove = (attChange / 6).toFixed(1)

  let report = `**${studentName}** — ${data.periodWeeks} Haftalık Bilişsel Gelişim Değerlendirmesi\n\n`

  // Attention section
  report += `## Dikkat Profili\n`
  report += `Sürekli dikkat skoru: ${c.attention_score}/100 (${attChange > 0 ? `+${attChange}` : attChange} değişim, haftalık ort. %${weeklyAttImprove} iyileşme). `

  if (c.attention_score >= 75) {
    report += `Dikkat kapasitesi yaş normunda veya üzerinde. CPT performansında tutarlılık gözlemlenmektedir.`
  } else if (c.attention_score >= 55) {
    report += `Dikkat kapasitesi gelişmekte. Sürekli dikkat antrenmanı dozajının korunması önerilir.`
  } else {
    report += `Dikkat kapasitesi yaş normunun altında. Sürekli dikkat ve dürtü kontrolü aktivitelerinin yoğunlaştırılması önerilir. Uzman değerlendirmesi düşünülebilir.`
  }

  // Math section
  report += `\n\n## Matematik Profili\n`
  report += `Matematik skoru: ${c.math_score}/100 (${mathChange > 0 ? `+${mathChange}` : mathChange} değişim). `
  report += `Aritmetik akıcılık: dakikada ${c.fluency} doğru işlem. `
  report += `Baskın strateji: ${STRATEGY_LABELS[c.dominant_strategy] || c.dominant_strategy}. `
  report += `Otomatikleşmiş aritmetik bilgi oranı: %${c.automatized_facts}.\n`

  // Number sense
  report += `\nSayı hissi metrikleri: Weber Oranı w=${c.weber_fraction.toFixed(2)} `
  if (c.weber_fraction < 0.20) report += `(iyi)`
  else if (c.weber_fraction < 0.25) report += `(orta)`
  else report += `(geliştirilmeli)`
  report += `, Sayı Doğrusu PAE=%${c.number_line_pae} `
  if (c.number_line_pae < 10) report += `(hassas)`
  else if (c.number_line_pae < 18) report += `(orta)`
  else report += `(düşük hassasiyet)`
  report += `.\n`

  // Strategy progression
  if (c.dominant_strategy === 'counting_all') {
    report += `\nStrateji geçişi önerisi: Counting on stratejisine geçiş için büyük sayıdan devam ettirme pratiği yapılmalı.`
  } else if (c.dominant_strategy !== 'retrieval') {
    report += `\nOtomatisite hedefi: Aralıklı tekrar protokolü ile temel toplama/çıkarma gerçeklerinin otomatikleştirilmesi sürdürülmeli.`
  }

  // Misconceptions
  if (c.misconceptions.length > 0) {
    report += `\n\n## ⚠️ Kavram Yanılgıları\n`
    c.misconceptions.forEach(m => {
      const exp = MISCONCEPTION_EXPLANATIONS[m]
      report += `- ${exp?.teacher || m}\n`
    })
  }

  // Cross-analysis
  report += `\n\n## Çapraz Analiz\n`
  if (c.attention_score > 65 && c.math_score > 65) {
    report += `Dikkat gelişimi ile matematik performansı arasında güçlü pozitif ilişki gözlemlenmektedir. Dikkat antrenmanları matematik başarısını doğrudan desteklemektedir.`
  } else if (c.attention_score < 55) {
    report += `Dikkat kapasitesindeki sınırlılık matematik performansını olumsuz etkilemektedir. Öncelikle dikkat antrenmanına ağırlık verilmesi, ardından matematik becerilerinin geliştirilmesi önerilir.`
  }

  // Memory
  report += `\n\nÇalışma belleği skoru: ${c.memory_score}/100. `
  if (c.memory_score < 50) {
    report += `Çalışma belleği kapasitesi düşük — çok adımlı işlemlerde zorluk yaşanabilir. N-back eğitimi dozajı artırılmalıdır.`
  }

  return report
}

/**
 * Generate parent report (simple Turkish, encouraging)
 */
export function generateParentReport(data: ReportData): string {
  const { studentName, cognitive: c } = data
  const improving = c.trend === 'up'
  const attChange = c.weekly_attention[5] - c.weekly_attention[0]

  let report = `Sevgili Veli,\n\n`
  report += `${studentName} ${improving ? 'bu dönem harika bir ilerleme gösterdi! 🎉' : 'bu dönem istikrarlı bir çalışma süreci geçirdi.'}\n\n`

  // Attention
  if (c.attention_score >= 70) {
    report += `Dikkat süresi belirgin şekilde arttı — oyunlarda çok daha uzun süre odaklanabiliyor. `
  } else if (c.attention_score >= 50) {
    report += `Dikkat süresi gelişiyor — düzenli oyun seansları bu gelişimi destekliyor. `
  } else {
    report += `Dikkat süresini geliştirmek için düzenli oyun seanslarına devam etmek çok önemli. `
  }

  // Math
  if (c.math_score >= 70) {
    report += `Matematiksel becerileri güçleniyor, işlemleri giderek daha hızlı ve doğru yapıyor.\n\n`
  } else if (c.math_score >= 50) {
    report += `Matematik konusunda ilerleme kaydediyor, pratik yapmaya devam etmesi faydalı olacaktır.\n\n`
  } else {
    report += `Matematik konusunda biraz daha desteğe ihtiyacı var — evde birlikte pratik yapmak çok faydalı olacaktır.\n\n`
  }

  // Home activities
  report += `**Evde yapabileceğiniz etkinlikler:**\n`
  if (c.dominant_strategy === 'counting_all' || c.dominant_strategy === 'counting_on_first') {
    report += `- Günlük nesnelerle sayma oyunları oynayın (kaşıklar, oyuncaklar)\n`
    report += `- Alışverişte basit toplama soruları sorun\n`
  }
  if (c.math_score < 70) {
    report += `- Pizza veya pasta keserken eşit parçalara bölme oyunu oynayın 🍕\n`
    report += `- "3 tabağa 4'er elma koy, toplam kaç?" gibi günlük matematik deneyimleri oluşturun\n`
  }
  report += `- Birlikte kitap okuyun ve hikâyelerdeki sayıları sorun\n`

  // Misconceptions (gentle)
  if (c.misconceptions.length > 0) {
    report += `\n**Dikkat edilecek noktalar:**\n`
    c.misconceptions.forEach(m => {
      const exp = MISCONCEPTION_EXPLANATIONS[m]
      if (exp) report += `- ${exp.parent}\n`
    })
  }

  report += `\n${studentName} ${improving ? 'çok güzel bir yolda ilerliyor. Tebrikler! 🌟' : 'ile birlikte çalışmaya devam ediyoruz. Desteğiniz çok değerli! 💪'}`

  return report
}
