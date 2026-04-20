/**
 * Stroop Savaşçısı — Yürütücü Kontrol (TAM IMPLEMENTASYON)
 *
 * Orijinal: 4 mod iddia ediliyordu ama sadece color_word ve number_quantity
 * çalışıyordu; size_value ve mixed modları spec'te vardı ama kod yoktu.
 *
 * Şimdi 4 mod da gerçek:
 *  1. color_word      — Klasik Stroop: yazı vs mürekkep rengi
 *  2. number_quantity — Sayı Stroop: basamak vs miktar
 *  3. size_value      — Büyüklük Stroop: görsel büyüklük vs sayı değeri
 *  4. mixed           — Karma: her turda random mod seçilir
 *
 * Stroop Effect = RT(incongruent) − RT(congruent). Küçükse inhibisyon iyi.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import { audioEngine } from '@/engine/audio/audioEngine'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type StroopMode = 'color_word' | 'number_quantity' | 'size_value' | 'mixed'
type SubMode = 'color_word' | 'number_quantity' | 'size_value'

const COLORS: Record<string, string> = { Kırmızı: '#EF4444', Mavi: '#3B82F6', Yeşil: '#22C55E', Sarı: '#EAB308' }
const COLOR_NAMES = Object.keys(COLORS)

interface Trial {
  subMode: SubMode
  displayText: string       // Gösterilen: renk adı | rakam | rakam
  displayValue: string | number  // Diğer özellik: ink / adet / fontSize
  inkColor?: string         // color_word
  quantity?: number         // number_quantity: kaç kopya
  fontSize?: number         // size_value: px cinsinden
  correctAnswer: string     // Hedef cevap (kuraldan bağımsız olarak doğru yanıt)
  question: string          // Kullanıcıya sorulan soru
  options: string[]         // Cevap seçenekleri
  isCongruent: boolean
  instructionColor: string  // Ses/renk ipucu
}

function genColorWordTrial(): Trial {
  const word = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]
  const congruent = Math.random() > 0.4
  const inkName = congruent ? word : COLOR_NAMES.filter(n => n !== word)[Math.floor(Math.random() * (COLOR_NAMES.length - 1))]
  const ink = COLORS[inkName]
  return {
    subMode: 'color_word',
    displayText: word,
    displayValue: ink,
    inkColor: ink,
    correctAnswer: inkName, // Mürekkep rengini söyle, yazıyı değil
    question: 'Mürekkebin RENGİ ne?',
    options: COLOR_NAMES,
    isCongruent: congruent,
    instructionColor: '#FCA5A5',
  }
}

function genNumberQuantityTrial(): Trial {
  // "4" rakamı 3 kez gösterilir → cevap: 3 (miktar), 4 değil (basamak)
  const digits = [1, 2, 3, 4, 5]
  const shown = digits[Math.floor(Math.random() * digits.length)]
  const congruent = Math.random() > 0.4
  const quantity = congruent ? shown : digits.filter(n => n !== shown)[Math.floor(Math.random() * (digits.length - 1))]
  return {
    subMode: 'number_quantity',
    displayText: String(shown),
    displayValue: quantity,
    quantity,
    correctAnswer: String(quantity),
    question: 'Kaç tane rakam var?',
    options: ['1', '2', '3', '4', '5'],
    isCongruent: congruent,
    instructionColor: '#67E8F9',
  }
}

function genSizeValueTrial(): Trial {
  // Büyük ekranda küçük bir sayı, veya tersi. "Fiziksel büyüklük" sorulur.
  // İki sayı yan yana gösterilir, hangisi büyük YAZILMIŞ?
  const valA = 1 + Math.floor(Math.random() * 8)
  let valB = 1 + Math.floor(Math.random() * 8)
  while (valB === valA) valB = 1 + Math.floor(Math.random() * 8)

  // Congruent: sayısal olarak büyük olan görsel olarak da büyük gösterilir
  // Incongruent: küçük sayı büyük fontla gösterilir
  const congruent = Math.random() > 0.4
  const bigNumeric = Math.max(valA, valB)
  const smallNumeric = Math.min(valA, valB)

  // Hangi taraf fiziksel olarak büyük?
  let leftVal: number, rightVal: number, leftSize: number, rightSize: number
  if (congruent) {
    // Fiziksel büyük = sayısal büyük
    leftVal = bigNumeric; rightVal = smallNumeric
    leftSize = 90; rightSize = 40
  } else {
    // Fiziksel büyük = sayısal küçük (çatışma!)
    leftVal = smallNumeric; rightVal = bigNumeric
    leftSize = 90; rightSize = 40
  }

  // Random sol/sağ flip
  if (Math.random() > 0.5) {
    [leftVal, rightVal] = [rightVal, leftVal]
    ;[leftSize, rightSize] = [rightSize, leftSize]
  }

  const physicallyBig = leftSize > rightSize ? leftVal : rightVal

  return {
    subMode: 'size_value',
    displayText: `${leftVal}|${rightVal}`,
    displayValue: `${leftSize}|${rightSize}`,
    correctAnswer: String(physicallyBig),
    question: 'Hangi sayı GÖRÜNTÜDE daha büyük?',
    options: [String(leftVal), String(rightVal)],
    isCongruent: congruent,
    instructionColor: '#C4B5FD',
  }
}

function generateTrial(mode: StroopMode): Trial {
  if (mode === 'color_word') return genColorWordTrial()
  if (mode === 'number_quantity') return genNumberQuantityTrial()
  if (mode === 'size_value') return genSizeValueTrial()
  // mixed
  const subs: SubMode[] = ['color_word', 'number_quantity', 'size_value']
  const sub = subs[Math.floor(Math.random() * subs.length)]
  if (sub === 'color_word') return genColorWordTrial()
  if (sub === 'number_quantity') return genNumberQuantityTrial()
  return genSizeValueTrial()
}

export default function StroopSavascisi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [trial, setTrial] = useState<Trial>(() => generateTrial('color_word'))
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [congRTs, setCongRTs] = useState<number[]>([])
  const [incongRTs, setIncongRTs] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  // Mod rotasyonu: her 4 turda bir mod değiştir, son blok 'mixed'
  const modes: StroopMode[] = ['color_word', 'number_quantity', 'size_value', 'mixed']

  useEffect(() => {
    const m = modes[Math.floor(round / 4) % modes.length]
    setTrial(generateTrial(m))
    setFeedback(null)
    stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (choice: string) => {
    if (feedback) return
    const rt = Date.now() - stimRef.current
    const correct = choice === trial.correctAnswer

    if (correct) {
      setStreak(s => s + 1)
      audioEngine.playCorrect()
      if (trial.isCongruent) setCongRTs(p => [...p.slice(-20), rt])
      else setIncongRTs(p => [...p.slice(-20), rt])
    } else {
      setStreak(0)
      audioEngine.playIncorrect()
    }

    const stroopEffect = congRTs.length > 3 && incongRTs.length > 3
      ? Math.round(incongRTs.reduce((a, b) => a + b, 0) / incongRTs.length - congRTs.reduce((a, b) => a + b, 0) / congRTs.length) : null

    session.recordTrial({
      timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: {
        skillId: `sinif3_stroop_${trial.subMode}`,
        subMode: trial.subMode, isCongruent: trial.isCongruent,
        stroopEffect, streak, response: choice, correctAnswer: trial.correctAnswer,
      },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    const t = setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 500 : 450)
    timersRef.current.push(t)
  }

  const stroopEffect = congRTs.length > 3 && incongRTs.length > 3
    ? Math.round(incongRTs.reduce((a, b) => a + b, 0) / incongRTs.length - congRTs.reduce((a, b) => a + b, 0) / congRTs.length) : null

  const subModeLabels: Record<SubMode, string> = {
    color_word: '🎨 Renk-Kelime',
    number_quantity: '🔢 Sayı-Miktar',
    size_value: '📏 Boyut-Değer',
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg"
          style={{ background: `${trial.instructionColor}15`, color: trial.instructionColor, border: `1px solid ${trial.instructionColor}30` }}>
          ⚔️ {trial.question}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30">{subModeLabels[trial.subMode]}</span>
          {streak >= 5 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
          {stroopEffect !== null && <span className="text-[10px] text-white/20">SE: {stroopEffect}ms</span>}
        </div>
      </div>

      {/* Stimulus alanı */}
      <div className="min-h-[140px] flex items-center justify-center">
        {trial.subMode === 'color_word' && (
          <motion.div key={round} className="text-7xl font-black"
            style={{ color: trial.inkColor, textShadow: `0 0 30px ${trial.inkColor}55, 0 0 60px ${trial.inkColor}20, 0 4px 12px rgba(0,0,0,0.4)` }}
            initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}>
            {trial.displayText}
          </motion.div>
        )}

        {trial.subMode === 'number_quantity' && (
          <div className="flex gap-2">
            {Array.from({ length: trial.quantity || 1 }, (_, i) => (
              <motion.span key={i} className="text-5xl font-black"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                style={{ color: '#F1F5F9', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
                {trial.displayText}
              </motion.span>
            ))}
          </div>
        )}

        {trial.subMode === 'size_value' && (() => {
          const [leftVal, rightVal] = trial.displayText.split('|').map(s => s)
          const [leftSize, rightSize] = (trial.displayValue as string).split('|').map(s => parseInt(s))
          return (
            <div className="flex items-center gap-10">
              <motion.span className="font-black" style={{ fontSize: leftSize, color: '#FDE68A', textShadow: '0 0 20px rgba(251,191,36,0.3)' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {leftVal}
              </motion.span>
              <motion.span className="font-black" style={{ fontSize: rightSize, color: '#FDE68A', textShadow: '0 0 20px rgba(251,191,36,0.3)' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                {rightVal}
              </motion.span>
            </div>
          )
        })()}
      </div>

      {/* Cevap seçenekleri */}
      <div className="flex gap-3 flex-wrap justify-center">
        {trial.subMode === 'color_word' && trial.options.map(name => (
          <motion.button key={name} className="px-6 py-3 rounded-xl text-sm font-bold"
            style={{ background: `${COLORS[name]}20`, border: `2px solid ${COLORS[name]}45`, color: COLORS[name] }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(name)}>{name}</motion.button>
        ))}
        {trial.subMode === 'number_quantity' && trial.options.map(n => (
          <motion.button key={n} className="w-14 h-14 rounded-xl text-xl font-black text-white"
            style={{ background: 'rgba(103,232,249,0.08)', border: '1.5px solid rgba(103,232,249,0.2)' }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(n)}>{n}</motion.button>
        ))}
        {trial.subMode === 'size_value' && trial.options.map((v, i) => (
          <motion.button key={i} className="w-16 h-16 rounded-xl text-2xl font-black text-white"
            style={{ background: 'rgba(196,181,253,0.08)', border: '1.5px solid rgba(196,181,253,0.25)' }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(v)}>{v}</motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            {feedback === 'correct' ? <StarSVG size={48} filled glowing /> : <span className="text-4xl">💨</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
