# Çocuk Testi Rehberi — Kısa ve Pratik

> Amaç: 1-2 öğrenciyle 30 dakikada, hangi oyunların işe yaradığını, hangilerinin sıkıcı/zor olduğunu **veriye dayalı** anlamak. Hisse dayalı kararları bırakıp artık tahmin yerine gözleme geçmek.

## 🎯 Önce: Tek Cümle

**Oyunu etkilememek için çocuğun arkasında sessiz otur, not tut, sonra feedback'e bak.** Önden bilgi verme, yardım etme, "ipucu ister misin?" deme. Doğal oynasın.

---

## ⚙️ Hazırlık (5 dk)

### 1. Uygulama
- URL: `dusunkup-6d.vercel.app`
- Tablet tercih edilir, dokunmatik daha doğal (fare de olur)
- Ses açık olsun (Web Audio API artık tonlar çalıyor)

### 2. Supabase (opsiyonel, istersen)
Feedback localStorage'da zaten çalışıyor. **Bulut sync için:**
- Supabase dashboard → SQL Editor → `supabase/migrations/001_session_feedback.sql` içeriğini yapıştır → Run
- Böylece başka cihazdan bakınca bulut verisini de görürsün

### 3. Öğretmen paneli
- `/teacher` → giriş → üst sağda **💬 Çocuk Geri Bildirimleri** butonu

---

## 🧒 Oturum Akışı (ideal 20-25 dk)

### Her çocuk için:
1. Yaşa uygun sınıfı seç (ör. 7 yaş → 1. Sınıf)
2. Avatar seç
3. **Çocuğa sadece**: "Oyunları oyna, istediğini seç, istediğin kadar oyna. Sana yardım etmeyeceğim, kendin dene."
4. Arkada sessizce izle. Aşağıdaki not şablonuyla **gözlem** kaydet.
5. Her oyunun sonunda "Harita" butonu feedback'i tetikler — çocuk doldursun.

### Gözlem şablonu (kağıt veya telefon):
```
Oyun: ____________________
Süre: __ dk
Yüz ifadesi: ☐ sıkılmış ☐ meraklı ☐ sinirli ☐ kahkaha
İlk tepki (ilk 15 sn): ____________________
Ne zaman kafası karıştı? ____________________
Ne söyledi? (Sözel yorum): ____________________
Kendiliğinden bıraktı mı? ☐ Evet ☐ Hayır
```

---

## 📊 Sonra: Feedback Paneli

Çocuk(lar) gittikten sonra `/teacher/feedback`'e git. Göreceğin:

### 🏆 En Sevilen
- Ortalama 4.0+ olanlar — bunlar işe yarıyor, dokunma
- En az 2 bildirimli olmalı

### ⚠️ İlgi Çekmeyen
- Ortalama 2.5 ve altı — bunları **sor**: "Neden sevmedin?"
- Bu oyunlar yeniden tasarım ister

### 📊 Zorluk Dağılımı
- Çubuk yeşil (kolay) ağır basan → oyun fazla kolay, zorlaştır
- Çubuk turuncu (zor) ağır basan → oyun fazla zor, BKT başlangıç zorluğunu düşür
- Mavi (yerinde) ağır basan → oyun ideal

---

## 🚫 Bu Oturumda Yapma

- ❌ Çocuğa ipucu verme, "ne yapması gerektiğini söyleme"
- ❌ Kendi hevesinle "şunu dene!" deme — doğal tercih sinyali yok edersin
- ❌ Yanlış cevapta müdahale etme — sistem zaten uyumlama yapıyor
- ❌ Bir oyunu çok uzun zorla tutma — sıkıldıysa geçsin

---

## ✅ Hedef Çıktı

Testten sonra elinde şu veri olacak:
1. **En az 5 geri bildirim** (ideal 10+) — feedback panelinde görünür
2. **2-3 sayfa gözlem notu** — çocuğun yüz ifadesi ve sözel tepkileri
3. **Net bir "ilk 3 bozuk oyun" listesi** — bir sonraki kod oturumunda bunlara odaklan

Bu veri olmadan daha fazla rewrite yapmak **körlemedir**. Bu veri ile yapılan rewrite **hedeflenmiştir**, ve geri dönüş 10x daha yüksektir.

---

## 🔁 Sonrasında Ne Yaparız

Paneldeki veriye göre 3 senaryo:

### Senaryo A: Bir-iki oyun bariz kötü
- Bu 2 oyuna özel rewrite — diğerlerine dokunma
- Yeniden test et, yeni veriye bak

### Senaryo B: Genel olarak sıkıcı buldu
- Animasyon/ses/tempo problemi olabilir
- GameShell üzerinde global tempo iyileştirme yap
- Kutlama animasyonlarını büyüt

### Senaryo C: Her şey iyi, bazı oyunlar eksik
- Hafıza Bahçesi n-back modu eksik (şu anda sadece spatial + matching var) gibi eksikleri tamamla
- Yeni oyunlar ekle

---

*Kısacası: **Önce veriyi topla, sonra yatırım yap**. İki çocuk 30 dakikada sana, benim 5 günlük kod yazmamdan daha değerli sinyal verebilir.*
