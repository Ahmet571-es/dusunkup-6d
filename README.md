# DüşünKüp 6D — Bilişsel Gelişim Platformu

> **Bilimsel temelli çocuk dikkat ve matematik geliştirme sistemi**

Anaokulu'ndan 5. sınıfa kadar çocukların dikkat ve matematik becerilerini klinik derinlikte ölçen, geliştiren ve kanıtlayan bir platform.

## 🧠 Bilimsel Çerçeve

- **Dikkat:** Posner'ın Üçlü Dikkat Ağı Modeli, 7 bileşenli dikkat profili, 12 metrikli stealth assessment
- **Matematik:** Dehaene Sayı Hissi, Bruner CPA Modeli, Gelman Sayma Prensipleri, 7 strateji takibi
- **Adaptif Motor:** Bayesian Knowledge Tracing (BKT), Vygotsky ZPD, Ebbinghaus Aralıklı Tekrar
- **Motivasyon:** Deci & Ryan Öz-Belirleme Kuramı, Dweck Büyüme Zihniyeti

## 🎮 6D Motor

| Boyut | Katman | Teknoloji |
|-------|--------|-----------|
| 1D | İçerik | IRT etiketli görev veritabanı |
| 2D | Görsel | React + Tailwind + Profesyonel Asset'ler |
| 3D | Uzamsal | Three.js + React Three Fiber |
| 4D | Zamansal | Framer Motion + GSAP |
| 5D | Duyusal | Howler.js + Tone.js + Web Vibration |
| 6D | Adaptif Zekâ | BKT + Duygu Algılama + ZPD |

## 📊 Sınıf Yapısı

6 sınıf × 6 oyun = **36 oyun**, her birinde çoklu modüller, çoklu zorluk eksenleri, bilimsel paradigmalar.

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **3D:** Three.js + React Three Fiber
- **State:** Zustand
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **AI:** Claude API (Rapor üretimi)
- **Animations:** Framer Motion + Lottie
- **Audio:** Howler.js + Tone.js

## 🚀 Kurulum

```bash
npm install
npm run dev
```

`.env` dosyasına Supabase credentials ekleyin (`.env.example`'a bakın).

## 📁 Proje Yapısı

```
src/
├── components/        # Paylaşılan UI bileşenleri
├── engine/           # 6D Motor
│   ├── adaptive/     # BKT + Aralıklı Tekrar
│   ├── assessment/   # Stealth Assessment
│   ├── audio/        # Ses motoru
│   ├── emotion/      # Duygu algılama
│   └── physics/      # Fizik simülasyonu
├── games/            # Sınıf bazlı oyunlar (6 klasör × 6 oyun)
├── hooks/            # React hooks
├── lib/              # Supabase client, utils
├── pages/            # Sayfalar (teacher + student)
├── stores/           # Zustand state
└── types/            # TypeScript tanımları
```

## 📄 Lisans

Bu proje çocukların faydasına odaklıdır. Ticari amaç güdülmemektedir.

---

*DüşünKüp 6D — Önemli olan para değil, çocukların fayda sağlaması.*
