/**
 * Mühendis İstasyonu — Çok Adımlı Mühendislik Problemleri (PROCEDURAL REWRITE)
 *
 * Orijinal: 6 sabit problem — çocuk ikinci turda ezberliyordu.
 * Yeni: 8 template-tabanlı procedural generator — her turda taze problem.
 *
 * Gerçek 3 faz:
 *  1. READ: Problemi oku (5s, anahtar kelimeleri vurgula)
 *  2. SOLVE: Adım adım çöz (ipucu + aşamalı gösterim)
 *  3. REVIEW: Çözümü gör + öz değerlendirme
 *
 * Kategoriler:
 *  • Çit problemi (direk = aralık + 1)
 *  • Üretim + fire
 *  • Hacim + akış hızı
 *  • Katlı sayım
 *  • Enerji birikimi
 *  • Zamanlama
 *  • Oran problemi
 *  • Karışım (karma)
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import { audioEngine } from '@/engine/audio/audioEngine'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

interface Problem {
  text: string
  answer: number
  steps: string[]
  hint: string
  emoji: string
  keywords: string[]
  category: string
}

// === YARDIMCILAR ===
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

// === PROBLEM TEMPLATES ===

function genFenceProblem(): Problem {
  const gap = pick([2, 3, 4, 5])
  const posts = randInt(5, 12)
  const length = gap * (posts - 1)
  return {
    text: `Bir çit ${length} metre uzunluğunda. Her ${gap} metrede bir destek direği gerekiyor. Başlangıç ve bitiş dahil kaç direk lazım?`,
    answer: posts,
    steps: [`${length} ÷ ${gap} = ${posts - 1} aralık`, `${posts - 1} + 1 = ${posts} direk (uçlar dahil)`],
    hint: 'Çit problemi: direk sayısı = aralık sayısı + 1',
    emoji: '🌉',
    keywords: [`${length} m`, `${gap} m aralık`, 'uçlar dahil'],
    category: 'fence',
  }
}

function genProductionProblem(): Problem {
  const rate = pick([30, 40, 45, 50, 60, 75])
  const hours = randInt(5, 10)
  const total = rate * hours
  const defective = randInt(Math.floor(total * 0.03), Math.floor(total * 0.12))
  const good = total - defective
  return {
    text: `Bir fabrikada saatte ${rate} ürün üretiliyor. ${hours} saatlik vardiyada ${defective} ürün bozuk çıktı. Kaç sağlam ürün üretildi?`,
    answer: good,
    steps: [`${rate} × ${hours} = ${total} toplam ürün`, `${total} − ${defective} = ${good} sağlam`],
    hint: 'Önce toplam üretimi bul, sonra bozukları çıkar',
    emoji: '🏭',
    keywords: [`${rate} ürün/saat`, `${hours} saat`, `${defective} bozuk`],
    category: 'production',
  }
}

function genPoolProblem(): Problem {
  // Volume = rate * time, and pool is X/Y full
  const rate = pick([100, 150, 200, 250, 300, 400, 500])
  const hours = randInt(2, 5)
  const emptyVolume = rate * hours
  const denom = pick([2, 3, 4, 5])
  const numer = randInt(1, denom - 1)
  // Volume × (denom - numer)/denom = emptyVolume  →  Volume = emptyVolume × denom/(denom-numer)
  const fullVolume = emptyVolume * denom / (denom - numer)
  if (!Number.isInteger(fullVolume)) return genPoolProblem() // retry
  return {
    text: `Bir havuzun hacmi ${fullVolume} litre. Musluk saatte ${rate} litre dolduruyor. Havuz şu an ${numer}/${denom} dolu. Tamamen dolması kaç saat sürer?`,
    answer: hours,
    steps: [
      `Boş kısım: ${fullVolume} × ${denom - numer}/${denom} = ${emptyVolume} litre`,
      `Süre: ${emptyVolume} ÷ ${rate} = ${hours} saat`,
    ],
    hint: `${numer}/${denom} dolu → ${denom - numer}/${denom} boş kalmış`,
    emoji: '🏊',
    keywords: [`${fullVolume} L`, `${rate} L/saat`, `${numer}/${denom} dolu`],
    category: 'pool',
  }
}

function genBuildingProblem(): Problem {
  const floors = randInt(6, 15)
  const apartments = randInt(2, 6)
  const people = randInt(2, 5)
  const total = floors * apartments * people
  return {
    text: `Bir bina ${floors} katlı. Her katta ${apartments} daire var. Her dairede ortalama ${people} kişi yaşıyor. Binada yaklaşık kaç kişi yaşıyor?`,
    answer: total,
    steps: [`${floors} × ${apartments} = ${floors * apartments} daire`, `${floors * apartments} × ${people} = ${total} kişi`],
    hint: 'Kat × daire × kişi = toplam',
    emoji: '🏢',
    keywords: [`${floors} kat`, `${apartments} daire/kat`, `${people} kişi/daire`],
    category: 'building',
  }
}

function genPlantingProblem(): Problem {
  const perRow = pick([3, 4, 5, 6, 7, 8])
  const gap = pick([2, 3, 4, 5])
  const sideLength = (perRow - 1) * gap
  return {
    text: `Okul bahçesine kare şeklinde ${perRow}×${perRow} fidan dikiliyor. Fidanlar arası ${gap} metre. Bahçenin bir kenarı kaç metre?`,
    answer: sideLength,
    steps: [`${perRow} fidan → ${perRow - 1} aralık`, `${perRow - 1} × ${gap} = ${sideLength} metre`],
    hint: `${perRow} fidan arası ${perRow - 1} boşluk var (çit mantığı)`,
    emoji: '🌳',
    keywords: [`${perRow}×${perRow} fidan`, `${gap} m aralık`],
    category: 'planting',
  }
}

function genEnergyProblem(): Problem {
  const production = pick([4, 5, 6, 8, 10, 12])
  const consumption = randInt(1, Math.min(3, production - 1))
  const days = pick([15, 20, 30, 45, 60])
  const surplus = (production - consumption) * days
  return {
    text: `Bir güneş paneli günde ${production} kWh üretiyor. Ev günde ${consumption} kWh tüketiyor. ${days} günde kaç kWh birikir?`,
    answer: surplus,
    steps: [`Günlük fazla: ${production} − ${consumption} = ${production - consumption} kWh`, `Toplam: ${production - consumption} × ${days} = ${surplus} kWh`],
    hint: 'Önce günlük net fazlayı bul, sonra günle çarp',
    emoji: '☀️',
    keywords: [`${production} kWh üretim`, `${consumption} kWh tüketim`, `${days} gün`],
    category: 'energy',
  }
}

function genTimingProblem(): Problem {
  const distance = pick([120, 150, 180, 240, 300, 360])
  const speed = pick([40, 50, 60, 80, 90])
  if (distance % speed !== 0) return genTimingProblem()
  const hours = distance / speed
  const stops = randInt(1, 3)
  const stopMin = randInt(10, 20)
  const totalMin = hours * 60 + stops * stopMin
  return {
    text: `Bir otobüs ${distance} km yol gidecek. Ortalama hızı ${speed} km/saat. Yolculukta ${stops} mola veriyor, her mola ${stopMin} dakika. Toplam yolculuk kaç dakika?`,
    answer: totalMin,
    steps: [
      `Sürüş süresi: ${distance} ÷ ${speed} = ${hours} saat = ${hours * 60} dakika`,
      `Mola süresi: ${stops} × ${stopMin} = ${stops * stopMin} dakika`,
      `Toplam: ${hours * 60} + ${stops * stopMin} = ${totalMin} dakika`,
    ],
    hint: 'Önce sürüş süresini dakikaya çevir, sonra mola ekle',
    emoji: '🚌',
    keywords: [`${distance} km`, `${speed} km/sa`, `${stops} mola`, `${stopMin} dk`],
    category: 'timing',
  }
}

function genMixtureProblem(): Problem {
  const red = randInt(3, 10)
  const blue = randInt(2, 8)
  const yellow = randInt(1, 6)
  const total = red + blue + yellow
  const per = randInt(2, 5)
  const groups = total * per
  return {
    text: `Bir sanatçı ${red} kırmızı, ${blue} mavi ve ${yellow} sarı boncuk kullanarak kolye yapıyor. Her boncuğun fiyatı ${per} TL. Tüm boncukların maliyeti kaç TL?`,
    answer: groups,
    steps: [
      `Toplam boncuk: ${red} + ${blue} + ${yellow} = ${total}`,
      `Maliyet: ${total} × ${per} = ${groups} TL`,
    ],
    hint: 'Önce tüm boncukları say, sonra fiyatla çarp',
    emoji: '💎',
    keywords: [`${red}+${blue}+${yellow} boncuk`, `${per} TL/boncuk`],
    category: 'mixture',
  }
}

const GENERATORS = [
  genFenceProblem,
  genProductionProblem,
  genPoolProblem,
  genBuildingProblem,
  genPlantingProblem,
  genEnergyProblem,
  genTimingProblem,
  genMixtureProblem,
]

function generate(): Problem {
  return pick(GENERATORS)()
}

// === COMPONENT ===

type Phase = 'read' | 'solve' | 'review'

export default function MuhendisIstasyonu({ session, state }: { session: SessionManager; state: SessionState }) {
  const [problem, setProblem] = useState<Problem>(() => generate())
  const [phase, setPhase] = useState<Phase>('read')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showSteps, setShowSteps] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    setProblem(generate())
    setPhase('read'); setInput(''); setFeedback(null); setShowSteps(false); setShowHint(false)
    stimRef.current = Date.now()
    // Read phase: 5 saniye (okuma + anahtar kelime vurgu)
    const t = setTimeout(() => setPhase('solve'), 5000)
    timersRef.current.push(t)
  }, [round])

  const handleSubmit = () => {
    if (feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const correct = val === problem.answer

    if (correct) {
      setStreak(s => s + 1)
      audioEngine.playCorrect()
    } else {
      setStreak(0)
      audioEngine.playIncorrect()
      setShowSteps(true)
    }

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: {
        skillId: `sinif5_muhendis_${problem.category}`,
        category: problem.category, multiStep: true,
        hintUsed: showHint, streak, answer: val, correctAnswer: problem.answer,
      },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      setPhase('review')
      const t = setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 1800)
      timersRef.current.push(t)
    } else {
      const t = setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 3500)
      timersRef.current.push(t)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}>
          {problem.emoji} Mühendislik Problemi
        </span>
        <div className="flex items-center gap-2">
          {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
          <div className="flex gap-1">
            {(['read', 'solve', 'review'] as Phase[]).map(p => (
              <div key={p} className="w-2 h-2 rounded-full transition-all"
                style={{ background: phase === p ? '#FCA5A5' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm text-white/80 leading-relaxed mb-3">{problem.text}</p>

        {(phase === 'solve' || phase === 'review') && (
          <div className="flex gap-2 flex-wrap mb-3">
            {problem.keywords.map((kw, i) => (
              <motion.span key={i} className="px-2 py-1 rounded-md text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))',
                  color: '#FCA5A5',
                  border: '1px solid rgba(239,68,68,0.22)',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.12)',
                }}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                📌 {kw}
              </motion.span>
            ))}
          </div>
        )}

        {showSteps && (
          <motion.div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            {problem.steps.map((s, i) => (
              <p key={i} className="text-xs text-orange-300 font-bold leading-relaxed">Adım {i + 1}: {s}</p>
            ))}
            <p className="text-sm font-black text-orange-300 mt-1.5">Cevap: {problem.answer}</p>
          </motion.div>
        )}

        {phase === 'review' && feedback === 'correct' && (
          <motion.div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {problem.steps.map((s, i) => (
              <p key={i} className="text-xs text-green-300">✅ {s}</p>
            ))}
          </motion.div>
        )}
      </div>

      {phase === 'solve' && (
        <>
          {!showHint && (
            <button onClick={() => setShowHint(true)} className="text-[10px] text-white/20 hover:text-white/40 transition">💡 İpucu göster</button>
          )}
          {showHint && (
            <motion.p className="text-xs text-blue-300/60 text-center max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              💡 {problem.hint}
            </motion.p>
          )}
          <div className="flex items-center gap-2">
            <input type="number" inputMode="numeric" value={input} onChange={e => setInput(e.target.value.slice(0, 5))} maxLength={5} placeholder="?"
              className="w-24 h-12 rounded-xl text-center text-2xl font-black bg-white/5 border-2 border-white/10 text-yellow-300 focus:outline-none focus:border-yellow-400/40" />
            <motion.button disabled={!input || !!feedback} className="h-12 px-5 rounded-xl text-sm font-bold disabled:opacity-30"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
              whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.04 }} onClick={handleSubmit}>Gönder ✓</motion.button>
          </div>
        </>
      )}

      {phase === 'read' && <p className="text-xs text-yellow-300/50 animate-pulse">📖 Problemi dikkatlice oku...</p>}

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            <StarSVG size={56} filled glowing />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
