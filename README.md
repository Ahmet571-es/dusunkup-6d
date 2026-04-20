# DüşünKüp — Bilişsel Gelişim Platformu

> **Çocuklar için dikkat ve matematik geliştirme oyunları**

Anaokulu'ndan 5. sınıfa kadar öğrencilere yönelik, bilimsel temelli bilişsel oyunlar sunan bir web platformu.

## 🧠 Bilimsel Temel

Platform aşağıdaki paradigmaları ve modelleri temel alır:

- **Dikkat:** Posner Üçlü Dikkat Ağı, Eriksen Flanker, CPT (Continuous Performance Task), N-back, Stroop, Task Switching
- **Matematik:** Subitizing, Gelman Sayma Prensipleri, Ten Frame görselleştirmesi, Number Bonds (Part-Whole), Siegler Strateji Analizi
- **Adaptif Motor:** Bayesian Knowledge Tracing (BKT) — mevcut ve çalışır durumda
- **Ölçüm:** Stealth assessment — RT bazlı strateji tespiti, hit/miss/false alarm ayrımı, d-prime

## 🎮 Platform Mimarisi

| Katman | Durum | Teknoloji |
|--------|-------|-----------|
| **İçerik** | ✅ Aktif | 36 oyun (6 sınıf × 6 oyun), prosedürel problem üretimi |
| **Görsel 2D** | ✅ Aktif | React + Tailwind + SVG karakter kütüphanesi |
| **Animasyon** | ✅ Aktif | Framer Motion (spring fizik, enter/exit) |
| **Ses** | ✅ Aktif | Web Audio API ile prosedürel tonlar (asset gerekmez) |
| **Adaptif Zekâ** | ✅ Aktif | BKT + ZPD tabanlı zorluk ayarlama |
| **Duygu Algılama** | 🧪 Deneysel | Dokunma örüntüsünden çıkarım (kamera/mikrofon yok) |
| **3D Uzamsal** | ❌ Yok | Planlandı ama şu an uygulanmıyor |

> **Not:** Önceki sürümde Three.js, Lottie ve Tone.js kuruluydu ama kullanılmıyordu. Bu paketler bundle'dan çıkarıldı. 3D katmanı gelecek sürüme ertelendi.

## 🎯 Tasarım Felsefesi

- **Matematik doğruluğu koddadır, LLM değil.** Tüm problem üretimi ve doğrulama deterministik kodda yapılır; LLM yalnızca rapor/geri bildirim için kullanılır.
- **Prosedürel üretim.** Sabit soru listesi yerine her oyun her turda yeni problem üretir (template + random değişkenler). Çocuk ezberleyemez.
- **Stealth assessment.** Öğrenci oyun oynarken arka planda RT, strateji, hata örüntüsü ve mastery izlenir; ayrı "test" ekranı yoktur.
- **Adaptif zorluk.** BKT ile her alt beceri için ayrı mastery takibi, ZPD'ye göre zorluk artışı/azalışı.

## 📊 Sınıf ve Oyun Yapısı

6 sınıf × 6 oyun = **36 oyun**. Her oyun:
- Bir bilimsel paradigmaya dayanır
- Birden fazla alt modüle sahiptir
- Birden fazla zorluk ekseninde adaptif zorluk ayarı yapar
- Bilişsel metrikleri stealth assessment ile ölçer

## 🛠️ Tech Stack

| Kategori | Teknoloji |
|----------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Stil | Tailwind CSS v4 |
| Animasyon | Framer Motion |
| Ses | Web Audio API (procedural) |
| State | Zustand |
| Routing | React Router v7 |
| Backend | Supabase (PostgreSQL + Auth) |
| AI | Claude API (yalnızca rapor üretimi için) |

## 🚀 Kurulum

```bash
npm install
npm run dev
```

`.env` dosyasına Supabase credentials ekleyin (`.env.example`'a bakın).

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── cinema/          # SVG karakter kütüphanesi + backgrounds + particles
│   ├── shared/          # Paylaşılan UI
│   └── ui/              # Modal, form bileşenleri
├── engine/
│   ├── adaptive/        # BKT (Bayesian Knowledge Tracing)
│   ├── assessment/      # Stealth assessment tracker + session manager
│   ├── audio/           # Web Audio API motoru
│   └── emotion/         # Dokunma örüntüsü tabanlı duygu algılama
├── games/               # 36 oyun (6 sınıf × 6 oyun)
├── lib/                 # Supabase client, utilities
├── pages/               # Teacher + student sayfaları
├── stores/              # Zustand store
└── types/               # TypeScript tipleri
```

## 🔬 Bilinen Sınırlamalar ve Yol Haritası

Şeffaflık amacıyla mevcut eksikleri listeliyoruz:

- **3D katman:** Planlanmış ama implementation yok. Şu an 2D.
- **Duygu algılama:** Dokunma örüntüsü bazlı ilk sürüm; kamera tabanlı ileri sürüm çalışılıyor.
- **Görsel tutarlılık:** SVG karakter kütüphanesi mevcut ama şu an ~5 oyunda aktif kullanımda; kalan oyunlara geçiş devam ediyor.
- **Ses kütüphanesi:** Prosedürel (Web Audio); stüdyo kalitesinde kayıt asset'leri gelecek sürümde.
- **Gerçek çocuk testi:** Pedagojik etki iddiaları çocuklarla yapılmış karşılaştırmalı testlerle henüz ölçülmedi.

## 📄 Lisans

Bu proje çocukların faydasına odaklıdır. Ticari amaç güdülmemektedir.

---

*DüşünKüp — Önemli olan para değil, çocukların fayda sağlaması.*
