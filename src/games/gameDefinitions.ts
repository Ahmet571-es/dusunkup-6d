/**
 * Game Definitions — All 36 games (6 grades × 6 games)
 * Each game has: scientific basis, target skills, modules, difficulty axes
 */

import type { GradeLevel, GameCategory } from '@/types'

export interface GameDef {
  id: string
  name: string
  emoji: string
  category: GameCategory
  paradigm: string
  description: string
  modules: string[]
  difficultyAxes: string[]
  sessionMinutes: number
  hue: number // for planet color
}

export const GAME_DEFINITIONS: Record<GradeLevel, GameDef[]> = {
  anaokulu: [
    {
      id: 'sayi_ormani', name: 'Sayı Ormanı', emoji: '🌳', category: 'math',
      paradigm: 'Subitizing + Counting Principles + Part-Whole',
      description: 'Sayma prensipleri, sayı hissi, parça-bütün ilişkisi',
      modules: ['Subitizing', 'Sayma ve Eşleme', 'Toplama Sahne', 'Karşılaştırma'],
      difficultyAxes: ['number_range', 'distractor_count', 'display_time', 'spatial_layout', 'operation', 'memory_load', 'strategy_expectation'],
      sessionMinutes: 10, hue: 150,
    },
    {
      id: 'renk_adasi', name: 'Renk Adası', emoji: '🎨', category: 'attention',
      paradigm: 'CPT (Continuous Performance Task)',
      description: 'Sürekli dikkat, dürtü kontrolü, bilişsel esneklik',
      modules: ['Hedef Takibi', 'Hız Artışı', 'Çeldirici Benzerlik', 'Kural Değişimi'],
      difficultyAxes: ['target_ratio', 'speed', 'distractor_similarity', 'rule_switching'],
      sessionMinutes: 10, hue: 330,
    },
    {
      id: 'sekil_kasabasi', name: 'Şekil Kasabası', emoji: '🔷', category: 'math',
      paradigm: 'Geometric Recognition + Classification',
      description: 'Geometrik algı, sınıflandırma, uzamsal ilişkiler',
      modules: ['Şekil Tanıma', 'Sınıflandırma', 'Uzamsal İlişkiler', 'Yapı Oluşturma'],
      difficultyAxes: ['shape_count', 'rotation', 'multi_attribute', 'spatial_complexity'],
      sessionMinutes: 10, hue: 240,
    },
    {
      id: 'hafiza_bahcesi', name: 'Hafıza Bahçesi', emoji: '🧠', category: 'attention',
      paradigm: 'Spatial Span + N-back + Number-Object Matching',
      description: 'Çalışma belleği, görsel-uzamsal bellek, sayı-miktar ilişkisi',
      modules: ['Konum Belleği', 'N-back', 'Sayı-Nesne Eşleştirme'],
      difficultyAxes: ['span_length', 'delay_seconds', 'nback_level', 'matching_complexity'],
      sessionMinutes: 10, hue: 45,
    },
    {
      id: 'ritim_nehri', name: 'Ritim Nehri', emoji: '🎵', category: 'attention',
      paradigm: 'Sequential Memory + Phonological Loop',
      description: 'Fonolojik döngü, sıralı bellek, zamansal işleme',
      modules: ['Ritim Tekrarı', 'Artan Dizi', 'Ters Sıra', 'Çift Kanal'],
      difficultyAxes: ['sequence_length', 'speed', 'reverse', 'dual_modality'],
      sessionMinutes: 10, hue: 190,
    },
    {
      id: 'oruntu_gok', name: 'Örüntü Gök', emoji: '✨', category: 'math',
      paradigm: 'Pattern Recognition + Seriation + Rule Discovery',
      description: 'Örüntü tanıma, mantıksal düşünme, kural çıkarma',
      modules: ['Tekrarlayan Örüntü', 'Üçlü Tekrar', 'Büyüyen Örüntü', 'Çift Özellik', 'Kural Keşfi'],
      difficultyAxes: ['pattern_length', 'attributes', 'growth_type', 'anomaly_detection'],
      sessionMinutes: 10, hue: 280,
    },
  ],
  sinif1: [
    { id: 'toplama_cesmesi', name: 'Toplama Çeşmesi', emoji: '💧', category: 'math', paradigm: 'Addition Strategies + CPA', description: 'Toplama stratejileri, ten frame, sayı bağları', modules: ['Counting All→On', 'Ten Frame', 'Sayı Bağları', 'Hız Antrenmanı'], difficultyAxes: ['addend_range', 'strategy_target', 'ten_frame', 'speed'], sessionMinutes: 12, hue: 200 },
    { id: 'cikarma_magarasi', name: 'Çıkarma Mağarası', emoji: '⛰️', category: 'math', paradigm: 'Subtraction Models (Take-away, Difference, Missing Addend)', description: 'Çıkarma üç modeli, parça-bütün', modules: ['Ayırma', 'Fark', 'Eksik Toplanan', 'Ters İşlem'], difficultyAxes: ['minuend_range', 'model_type', 'word_problem', 'speed'], sessionMinutes: 12, hue: 30 },
    { id: 'dikkat_denizi', name: 'Dikkat Denizi', emoji: '🌊', category: 'attention', paradigm: 'Flanker + Visual Search', description: 'Seçici dikkat, odaklanmış dikkat, görsel arama', modules: ['Basit Flanker', 'Karmaşık Flanker', 'Görsel Arama', 'Konjunktif Arama'], difficultyAxes: ['flanker_compatibility', 'set_size', 'target_similarity', 'speed'], sessionMinutes: 12, hue: 180 },
    { id: 'sayi_yolu', name: 'Sayı Yolu', emoji: '🛤️', category: 'math', paradigm: 'Number Line Estimation + Magnitude Comparison', description: 'Sayı doğrusu, büyüklük karşılaştırma, Weber Oranı', modules: ['0-10 Doğrusu', '0-20 Doğrusu', 'Karşılaştırma', 'Yaklaşık Aritmetik'], difficultyAxes: ['number_range', 'precision_target', 'weber_ratio', 'speed'], sessionMinutes: 12, hue: 120 },
    { id: 'kural_degistir', name: 'Kural Değiştir', emoji: '🔄', category: 'attention', paradigm: 'Task Switching + Cognitive Flexibility', description: 'Bilişsel esneklik, kural değişimi, switch cost', modules: ['Tekli Kural', 'Çift Kural', 'Hızlı Geçiş', 'Üçlü Kural'], difficultyAxes: ['rule_count', 'switch_frequency', 'rule_complexity', 'speed'], sessionMinutes: 12, hue: 300 },
    { id: 'hikaye_kopugu', name: 'Hikâye Köpüğü', emoji: '📖', category: 'attention', paradigm: 'Episodic Buffer + Narrative Integration', description: 'Epizodik tampon, anlama+hesaplama birleşimi', modules: ['Dinle-Hesapla', 'Hikâye Problemi', 'Sıralı Bilgi', 'Çoklu Adım'], difficultyAxes: ['story_length', 'math_complexity', 'retention_delay', 'steps'], sessionMinutes: 12, hue: 60 },
  ],
  sinif2: [
    { id: 'carpim_bahcesi', name: 'Çarpım Bahçesi', emoji: '🌻', category: 'math', paradigm: 'Multiplication 4 Models', description: 'Çarpma dört modeli, tekrarlı toplama→matris', modules: ['Tekrarlı Toplama', 'Dizi/Matris', 'Ölçekleme', 'Kartezyen'], difficultyAxes: ['factor_range', 'model_type', 'automaticity', 'word_problem'], sessionMinutes: 15, hue: 50 },
    { id: 'bolme_fabrikasi', name: 'Bölme Fabrikası', emoji: '🏭', category: 'math', paradigm: 'Division (Partitive + Quotitive)', description: 'Paylaşma ve gruplama modelleri', modules: ['Paylaşma', 'Gruplama', 'Kalan Bulma', 'Çarpma-Bölme İlişkisi'], difficultyAxes: ['dividend_range', 'model_type', 'remainder', 'inverse'], sessionMinutes: 15, hue: 160 },
    { id: 'flanker_okyanus', name: 'Flanker Okyanusu', emoji: '🐠', category: 'attention', paradigm: 'Eriksen Flanker + Inhibition', description: 'Odaklanmış dikkat, dürtü bastırma', modules: ['Uyumlu', 'Uyumsuz', 'Yakın Mesafe', 'Çoklu Çeldirici'], difficultyAxes: ['compatibility', 'distance', 'set_size', 'speed'], sessionMinutes: 15, hue: 210 },
    { id: 'hafiza_labirenti', name: 'Hafıza Labirenti', emoji: '🏰', category: 'attention', paradigm: 'Spatial Span + 2-back', description: 'Uzamsal çalışma belleği, güncelleme', modules: ['Yol Hatırlama', '2-back Başlangıç', 'Çift Bilgi', 'Labirent+Hesap'], difficultyAxes: ['path_length', 'nback_level', 'dual_task', 'time_pressure'], sessionMinutes: 15, hue: 270 },
    { id: 'para_pazari', name: 'Para Pazarı', emoji: '💰', category: 'math', paradigm: 'Real-world Transfer + Number Sense', description: 'Gerçek hayat transferi, para hesaplama', modules: ['Sayma', 'Üstü Kalma', 'Bütçe', 'Karşılaştırmalı Alışveriş'], difficultyAxes: ['amount_range', 'coin_types', 'operation_count', 'word_problem'], sessionMinutes: 15, hue: 40 },
    { id: 'saat_kulesi', name: 'Saat Kulesi', emoji: '🕐', category: 'math', paradigm: 'Time Concepts + Duration Estimation', description: 'Zaman kavramı, analog saat, süre tahmini', modules: ['Tam Saat', 'Yarım-Çeyrek', 'Dakika', 'Süre Hesaplama'], difficultyAxes: ['precision', 'analog_digital', 'duration', 'word_problem'], sessionMinutes: 15, hue: 340 },
  ],
  sinif3: [
    { id: 'kesir_mutfagi', name: 'Kesir Mutfağı', emoji: '🍕', category: 'math', paradigm: 'Fraction 4 Models', description: 'Kesir dört modeli, eşdeğerlik, karşılaştırma', modules: ['Alan Modeli', 'Uzunluk Modeli', 'Küme Modeli', 'Eşdeğerlik'], difficultyAxes: ['denominator', 'model_type', 'equivalence', 'comparison'], sessionMinutes: 15, hue: 15 },
    { id: 'geometri_kenti', name: 'Geometri Kenti', emoji: '🏙️', category: 'math', paradigm: '3D Geometry + Spatial Reasoning', description: 'Şekil özellikleri, açılım, uzamsal muhakeme', modules: ['2D Özellikler', '3D Tanıma', 'Açılım', 'Dönüşüm'], difficultyAxes: ['dimension', 'property_count', 'transformation', 'mental_rotation'], sessionMinutes: 15, hue: 250 },
    { id: 'stroop_savascisi', name: 'Stroop Savaşçısı', emoji: '⚔️', category: 'attention', paradigm: 'Stroop + Executive Control', description: 'Yürütücü kontrol, çatışma çözümü', modules: ['Renk-Kelime', 'Sayı-Miktar', 'Boyut-Değer', 'Karışık'], difficultyAxes: ['congruency', 'dimension_count', 'speed', 'switching'], sessionMinutes: 15, hue: 0 },
    { id: 'cift_gorev', name: 'Çift Görev', emoji: '🎯', category: 'attention', paradigm: 'Dual-Task + Divided Attention', description: 'Bölünmüş dikkat, kaynak yönetimi', modules: ['Sıralı Çift', 'Eş Zamanlı Basit', 'Eş Zamanlı Karmaşık', 'Üçlü Görev'], difficultyAxes: ['task_complexity', 'simultaneity', 'speed', 'resource_demand'], sessionMinutes: 15, hue: 75 },
    { id: 'veri_golu', name: 'Veri Gölü', emoji: '📊', category: 'math', paradigm: 'Data Literacy + Graph Reading', description: 'Grafik okuma, tablo yorumlama, veri toplama', modules: ['Sıklık Tablosu', 'Çubuk Grafik', 'Resim Grafik', 'Yorumlama'], difficultyAxes: ['data_size', 'graph_type', 'inference_level', 'misleading'], sessionMinutes: 15, hue: 170 },
    { id: 'tahmin_adasi', name: 'Tahmin Adası', emoji: '🔮', category: 'math', paradigm: 'Estimation + Hypothesis Testing', description: 'Tahmin, doğrulama, hipotez-test döngüsü', modules: ['Miktar Tahmini', 'Hesap Tahmini', 'Ölçü Tahmini', 'Hipotez Test'], difficultyAxes: ['range', 'precision', 'feedback_delay', 'complexity'], sessionMinutes: 15, hue: 290 },
  ],
  sinif4: [
    { id: 'ondalik_okyanus', name: 'Ondalık Okyanus', emoji: '🌊', category: 'math', paradigm: 'Decimal-Fraction Bridge + Place Value', description: 'Ondalık sayılar, kesir köprüsü, basamak değeri', modules: ['Kesir→Ondalık', 'Basamak Değeri', 'Karşılaştırma', 'İşlemler'], difficultyAxes: ['decimal_places', 'fraction_bridge', 'operation', 'word_problem'], sessionMinutes: 18, hue: 195 },
    { id: 'alan_cevre_kalesi', name: 'Alan-Çevre Kalesi', emoji: '🏰', category: 'math', paradigm: 'Area-Perimeter + Measurement', description: 'Alan, çevre, birim dönüştürme', modules: ['Çevre Hesap', 'Alan Hesap', 'Birim Dönüşüm', 'Karmaşık Şekiller'], difficultyAxes: ['shape_complexity', 'unit_conversion', 'multi_step', 'word_problem'], sessionMinutes: 18, hue: 140 },
    { id: 'nback_radari', name: 'N-back Radarı', emoji: '📡', category: 'attention', paradigm: '3-back + 4-back Protocol', description: 'İleri düzey çalışma belleği', modules: ['2-back Pekiştir', '3-back', '4-back', 'Çift Modalite'], difficultyAxes: ['nback_level', 'stimulus_type', 'dual_modality', 'speed'], sessionMinutes: 18, hue: 260 },
    { id: 'strateji_labi', name: 'Strateji Labı', emoji: '🧪', category: 'math', paradigm: 'Polya Problem Solving', description: 'Çok adımlı problem çözme, strateji seçimi', modules: ['Anla', 'Planla', 'Uygula', 'Geriye Bak'], difficultyAxes: ['step_count', 'strategy_options', 'transfer', 'metacognition'], sessionMinutes: 18, hue: 330 },
    { id: 'donusum_atolyesi', name: 'Dönüşüm Atölyesi', emoji: '🔧', category: 'math', paradigm: 'Unit Conversion + Measurement', description: 'Birim dönüştürme, ölçü sistemleri', modules: ['Uzunluk', 'Kütle', 'Zaman', 'Karışık'], difficultyAxes: ['unit_type', 'conversion_steps', 'precision', 'word_problem'], sessionMinutes: 18, hue: 80 },
    { id: 'kod_kirici', name: 'Kod Kırıcı', emoji: '🔐', category: 'attention', paradigm: 'Pattern Discovery + Mathematical Thinking', description: 'Şifre çözme, örüntü keşfi, mantıksal düşünme', modules: ['Sayı Şifresi', 'İşlem Şifresi', 'Dizi Keşfi', 'Mantık Bulmacası'], difficultyAxes: ['pattern_complexity', 'operation_count', 'abstraction', 'time_pressure'], sessionMinutes: 18, hue: 20 },
  ],
  sinif5: [
    { id: 'muhendis_istasyonu', name: 'Mühendis İstasyonu', emoji: '🚀', category: 'math', paradigm: 'Engineering Design Cycle', description: 'Çok adımlı problem çözme, mühendislik döngüsü', modules: ['Problem Tanımlama', 'Tasarım', 'Test', 'İyileştirme'], difficultyAxes: ['complexity', 'variables', 'constraints', 'optimization'], sessionMinutes: 20, hue: 350 },
    { id: 'veri_bilim_labi', name: 'Veri Bilim Labı', emoji: '📈', category: 'math', paradigm: 'Statistical Thinking + Data Analysis', description: 'Veri analizi, grafik yorumlama, eleştirel okuryazarlık', modules: ['Veri Toplama', 'Ortalama-Medyan', 'Grafik Analizi', 'Yanıltıcı Grafik'], difficultyAxes: ['data_size', 'stat_concept', 'graph_complexity', 'critical_thinking'], sessionMinutes: 20, hue: 165 },
    { id: 'gelismis_nback', name: 'Gelişmiş N-back', emoji: '🧬', category: 'attention', paradigm: '4-back + Dual Modality', description: 'Maksimum çalışma belleği, çift modalite', modules: ['4-back Görsel', '4-back İşitsel', 'Çift Modalite', 'Adaptif Artış'], difficultyAxes: ['nback_level', 'modality', 'interference', 'speed'], sessionMinutes: 20, hue: 280 },
    { id: 'kesif_gezegeni', name: 'Keşif Gezegeni', emoji: '🔭', category: 'math', paradigm: 'Scientific Method + Open-ended Discovery', description: 'Bilimsel yöntem, açık uçlu keşif, değişken kontrolü', modules: ['Gözlem', 'Hipotez', 'Deney', 'Sonuç'], difficultyAxes: ['variable_count', 'hypothesis_complexity', 'data_interpretation', 'transfer'], sessionMinutes: 20, hue: 100 },
    { id: 'kesir_ondalik_kopru', name: 'Kesir-Ondalık Köprü', emoji: '🌉', category: 'math', paradigm: 'Fraction ↔ Decimal ↔ Percent Conversion', description: 'Temsil dönüştürme, oran-orantı temeli', modules: ['Kesir→Ondalık', 'Ondalık→Yüzde', 'Yüzde→Kesir', 'Karışık Dönüşüm'], difficultyAxes: ['representation_count', 'conversion_direction', 'complexity', 'word_problem'], sessionMinutes: 20, hue: 55 },
    { id: 'zaman_makinesi', name: 'Zaman Makinesi', emoji: '⏰', category: 'attention', paradigm: 'Metacognitive Strategies + Self-Regulation', description: 'Metabilişsel stratejiler, öz-düzenleme, geri sarma', modules: ['Strateji Farkındalığı', 'Hata Analizi', 'Geri Sarma', 'Öz-Değerlendirme'], difficultyAxes: ['metacognitive_level', 'self_monitoring', 'strategy_selection', 'reflection_depth'], sessionMinutes: 20, hue: 220 },
  ],
}

/**
 * Get games for a specific grade
 */
export function getGamesForGrade(grade: GradeLevel): GameDef[] {
  return GAME_DEFINITIONS[grade] || []
}

/**
 * Get a specific game definition
 */
export function getGameDef(grade: GradeLevel, gameId: string): GameDef | undefined {
  return GAME_DEFINITIONS[grade]?.find(g => g.id === gameId)
}
