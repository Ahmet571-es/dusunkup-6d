/**
 * Toplama Çeşmesi — 1. Sınıf Toplama (PEDAGOGİK REWRITE)
 *
 * Orijinal sorunlar:
 *   • "number_bonds" modu aslında number bonds değildi — sadece süsleme
 *   • "speed_drill" modunda hız mekanizması yoktu
 *   • Ten frame iyiydi, korundu
 *
 * Yeniden tasarlanan modlar:
 *  1. ten_frame      — On Çerçevesi görsel toplama (Gravemeijer, 1994)
 *  2. number_bonds   — GERÇEK: Bütün verilir, eksik parçayı bul (a + ? = total)
 *  3. speed_drill    — GERÇEK: 10 saniye, bonus puan, ardışık doğrularda hız artar
 *  4. word_problem   — Kısa sözel problem (template-based)
 *
 * Siegler (1987) strateji tespiti: RT'ye göre retrieval/counting-on/counting-all.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import { audioEngine } from '@/engine/audio/audioEngine'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type AdditionMode = 'ten_frame' | 'number_bonds' | 'speed_drill' | 'word_problem'

interface Problem {
  a: number
  b: number
  total: number
  mode: AdditionMode
  wordProblem?: string
  // number_bonds: total ve a verilir, b bulunacak (missing addend)
  missingPart?: 'a' | 'b'
}

/** On çerçevesi: 10 kutucuklu grid, doldurulanlar renkli. */
function TenFrame({ count, color = '#3B82F6' }: { count: number; color?: string }) {
  const id = color.replace('#', '')
  return (
    <div className="grid grid-cols-5 gap-1" style={{ width: 130 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div key={i} className="w-5 h-5 flex items-center justify-center"
          initial={i < count ? { scale: 0 } : {}}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.03 }}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <defs>
              <radialGradient id={`tf_${id}_${i}`} cx="40%" cy="35%">
                <stop offset="0%" stopColor={i < count ? 'white' : 'transparent'} stopOpacity="0.35" />
                <stop offset="100%" stopColor={i < count ? color : 'transparent'} stopOpacity={i < count ? 0.9 : 0.08} />
              </radialGradient>
              {i < count && <filter id={`tfg_${id}_${i}`}><feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} floodOpacity="0.45" /></filter>}
            </defs>
            <rect x="1" y="1" width="18" height="18" rx="4" fill={`url(#tf_${id}_${i})`}
              stroke={i < count ? color : 'rgba(255,255,255,0.1)'} strokeWidth="1.2" strokeOpacity={i < count ? 0.7 : 0.5}
              filter={i < count ? `url(#tfg_${id}_${i})` : undefined} />
            {i < count && <ellipse cx="8" cy="7" rx="3.5" ry="2.5" fill="white" opacity="0.14" />}
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

function generateProblem(mode: AdditionMode, difficulty: Record<string, number>): Problem {
  const range = Math.min(18, 5 + (difficulty.addend_range || 0) * 2)
  const maxAddend = Math.min(range, 9)

  const a = 1 + Math.floor(Math.random() * maxAddend)
  const maxB = Math.max(1, Math.min(maxAddend, range - a))
  const b = 1 + Math.floor(Math.random() * maxB)
  const total = a + b

  const wordProblems = [
    `Bahçede ${a} kırmızı ve ${b} sarı gül var. Toplam kaç gül var?`,
    `${a} kuş ağaçta, ${b} kuş daha geldi. Şimdi kaç kuş var?`,
    `Sepette ${a} elma var. Annen ${b} elma daha koydu. Toplam kaç elma?`,
    `${a} çocuk parkta oynuyor, ${b} çocuk daha geldi. Kaç çocuk oldu?`,
    `Defterde ${a} kalem vardı. Sonra ${b} kalem daha aldın. Kaç kalem var?`,
  ]

  const problem: Problem = { a, b, total, mode }
  if (mode === 'word_problem') problem.wordProblem = wordProblems[Math.floor(Math.random() * wordProblems.length)]
  if (mode === 'number_bonds') problem.missingPart = Math.random() < 0.5 ? 'a' : 'b'
  return problem
}

const SPEED_DRILL_SECONDS = 10
const SPEED_BONUS_FAST = 15 // RT < 2s → +15 puan
const SPEED_BONUS_NORMAL = 10 // RT < 5s → +10

export default function ToplamaCesmesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [mode, setMode] = useState<AdditionMode>('ten_frame')
  const [problem, setProblem] = useState<Problem | null>(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [streak, setStreak] = useState(0)
  const [speedTimer, setSpeedTimer] = useState<number>(SPEED_DRILL_SECONDS)
  const [speedScore, setSpeedScore] = useState(0)
  const [speedActive, setSpeedActive] = useState(false)
  const stimRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const modes: AdditionMode[] = ['ten_frame', 'number_bonds', 'speed_drill', 'word_problem']

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timeoutsRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const modeIdx = Math.floor(round / 4) % modes.length
    const m = modes[modeIdx]
    setMode(m)
    setProblem(generateProblem(m, state.difficultyAxes))
    setInput('')
    setFeedback(null)
    setShowHint(false)
    stimRef.current = Date.now()

    // Speed drill: yeni raunda girince timer başlat (tek seferlik her yeni speed bloğu için)
    if (m === 'speed_drill' && !speedActive) {
      setSpeedActive(true)
      setSpeedTimer(SPEED_DRILL_SECONDS)
      setSpeedScore(0)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setSpeedTimer(t => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            // Süre bitti: speed drill bitirildi, sonraki mode'a geçmek için fast-forward round
            setSpeedActive(false)
            return 0
          }
          return t - 1
        })
      }, 1000) as ReturnType<typeof setInterval>
    }
    // Speed drill dışına çıkıldıysa timer'ı durdur
    if (m !== 'speed_drill') {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      setSpeedActive(false)
    }
  }, [round])

  const detectStrategy = (rt: number, a: number, b: number): string => {
    const smaller = Math.min(a, b)
    if (rt < 1500) return 'retrieval'
    if (rt < 2000 + smaller * 350) return 'counting_on_larger'
    if (rt < 2000 + b * 350) return 'counting_on_first'
    return 'counting_all'
  }

  const handleSubmit = () => {
    if (!problem || feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const rt = Date.now() - stimRef.current

    // Doğru cevap hesapla — number_bonds modunda eksik parça aranıyor
    let correctAnswer: number
    if (problem.mode === 'number_bonds') {
      correctAnswer = problem.missingPart === 'a' ? problem.a : problem.b
    } else {
      correctAnswer = problem.total
    }
    const correct = val === correctAnswer
    const strategy = detectStrategy(rt, problem.a, problem.b)

    // Speed drill puanı
    let bonus = 0
    if (correct && problem.mode === 'speed_drill' && speedActive) {
      bonus = rt < 2000 ? SPEED_BONUS_FAST : rt < 5000 ? SPEED_BONUS_NORMAL : 5
      setSpeedScore(s => s + bonus)
    }

    if (correct) {
      setStreak(s => s + 1)
      audioEngine.playCorrect()
    } else {
      setStreak(0)
      audioEngine.playIncorrect()
    }

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: {
        skillId: `sinif1_toplama_${problem.a}_${problem.b}`,
        mode, a: problem.a, b: problem.b, answer: val, correctAnswer,
        strategy, hintUsed: showHint, streak, speedBonus: bonus,
      },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    const delay = problem.mode === 'speed_drill' ? 400 : correct ? 900 : 700
    const t = setTimeout(() => {
      setFeedback(null)
      // Speed drill'de süre bittiyse sonraki mode'a geç
      if (problem.mode === 'speed_drill' && speedTimer === 0) {
        setRound(r => r + (4 - ((r) % 4)))  // speed bloğundan çık
      } else {
        setRound(r => r + 1)
      }
    }, delay)
    timeoutsRef.current.push(t)
  }

  if (!problem) return null

  const modeLabels: Record<AdditionMode, string> = {
    ten_frame: '🔟 On Çerçevesi',
    number_bonds: '🔗 Sayı Bağları',
    speed_drill: '⚡ Hız Turu',
    word_problem: '📖 Hikâye',
  }

  // Number bonds: hangi parça gizli?
  const showAMissing = problem.mode === 'number_bonds' && problem.missingPart === 'a'
  const showBMissing = problem.mode === 'number_bonds' && problem.missingPart === 'b'

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.15)' }}>
          {modeLabels[mode]}
        </span>
        <div className="flex items-center gap-2">
          {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
          {mode === 'speed_drill' && speedActive && (
            <>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${speedTimer < 4 ? 'text-red-300 bg-red-500/15 animate-pulse' : 'text-yellow-300 bg-yellow-500/10'}`}>
                ⏱ {speedTimer}s
              </span>
              <span className="text-xs font-black text-green-300">+{speedScore}</span>
            </>
          )}
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl p-5 text-center"
        style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Word problem text */}
        {mode === 'word_problem' && problem.wordProblem && (
          <p className="text-sm text-white/75 mb-4 leading-relaxed">{problem.wordProblem}</p>
        )}

        {/* Ten Frame visualization */}
        {mode === 'ten_frame' && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <TenFrame count={problem.a} color="#3B82F6" />
              <span className="text-xs text-blue-300 mt-1 block">{problem.a}</span>
            </div>
            <span className="text-2xl text-white/30">+</span>
            <div className="text-center">
              <TenFrame count={problem.b} color="#22C55E" />
              <span className="text-xs text-green-300 mt-1 block">{problem.b}</span>
            </div>
          </div>
        )}

        {/* GERÇEK Number Bonds: bütün verilir, parça aranır */}
        {mode === 'number_bonds' && (
          <div className="flex flex-col items-center gap-3 mb-4">
            {/* Bütün (üst) */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black relative"
              style={{
                background: 'radial-gradient(circle at 35% 30%, rgba(251,191,36,0.25), rgba(251,191,36,0.08))',
                border: '2.5px solid rgba(251,191,36,0.5)',
                color: '#FDE68A',
                boxShadow: '0 0 20px rgba(251,191,36,0.15)',
              }}>
              {problem.total}
            </div>
            {/* Bağlayıcı çizgiler */}
            <svg width="140" height="24" className="-my-1">
              <line x1="70" y1="0" x2="20" y2="24" stroke="rgba(251,191,36,0.3)" strokeWidth="2" />
              <line x1="70" y1="0" x2="120" y2="24" stroke="rgba(251,191,36,0.3)" strokeWidth="2" />
            </svg>
            {/* Parçalar (alt) */}
            <div className="flex gap-10">
              <motion.div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black"
                style={{
                  background: showAMissing ? 'rgba(251,191,36,0.05)' : 'rgba(59,130,246,0.18)',
                  border: `2px ${showAMissing ? 'dashed' : 'solid'} ${showAMissing ? 'rgba(251,191,36,0.5)' : 'rgba(59,130,246,0.35)'}`,
                  color: showAMissing ? '#FDE68A' : '#93C5FD',
                }}
                animate={showAMissing ? { scale: [1, 1.08, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}>
                {showAMissing ? (input || '?') : problem.a}
              </motion.div>
              <motion.div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black"
                style={{
                  background: showBMissing ? 'rgba(251,191,36,0.05)' : 'rgba(34,197,94,0.18)',
                  border: `2px ${showBMissing ? 'dashed' : 'solid'} ${showBMissing ? 'rgba(251,191,36,0.5)' : 'rgba(34,197,94,0.35)'}`,
                  color: showBMissing ? '#FDE68A' : '#6EE7B7',
                }}
                animate={showBMissing ? { scale: [1, 1.08, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}>
                {showBMissing ? (input || '?') : problem.b}
              </motion.div>
            </div>
            <p className="text-xs text-white/40 mt-2">
              {showAMissing ? `? + ${problem.b} = ${problem.total}` : `${problem.a} + ? = ${problem.total}`}
            </p>
          </div>
        )}

        {/* Denklem — ten_frame, speed_drill, word_problem için */}
        {mode !== 'number_bonds' && (
          <div className="flex items-center justify-center gap-3 my-3">
            <span className="text-4xl font-black text-white">{problem.a}</span>
            <span className="text-3xl text-white/40">+</span>
            <span className="text-4xl font-black text-white">{problem.b}</span>
            <span className="text-3xl text-white/40">=</span>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black"
              style={{
                border: `2.5px ${input ? 'solid' : 'dashed'} ${feedback === 'correct' ? '#34D399' : feedback === 'wrong' ? '#F97316' : 'rgba(251,191,36,0.4)'}`,
                color: feedback === 'correct' ? '#6EE7B7' : feedback === 'wrong' ? '#FDBA74' : '#FDE68A',
                background: input ? 'rgba(251,191,36,0.06)' : 'transparent',
              }}>
              {input || '?'}
            </div>
          </div>
        )}

        {/* İpucu */}
        {!showHint && mode !== 'speed_drill' && !feedback && (
          <button onClick={() => setShowHint(true)} className="text-[10px] text-white/20 hover:text-white/40 transition mt-1">
            💡 İpucu göster
          </button>
        )}
        {showHint && (
          <motion.p className="text-xs text-yellow-300/55 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {mode === 'number_bonds'
              ? `💡 Bütün ${problem.total}, görünen parça ${showAMissing ? problem.b : problem.a}. Eksik parça: ${problem.total} − ${showAMissing ? problem.b : problem.a}`
              : `💡 Büyükten başla: ${Math.max(problem.a, problem.b)}'den ${Math.min(problem.a, problem.b)} tane say`}
          </motion.p>
        )}
      </div>

      {/* Keypad */}
      <div className="flex gap-1.5 justify-center flex-wrap" style={{ maxWidth: 340 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
          <motion.button key={n} disabled={!!feedback}
            className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => !feedback && input.length < 2 && setInput(v => v + n)}>{n}</motion.button>
        ))}
        <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}
          whileTap={{ scale: 0.92 }} onClick={() => setInput('')}>Sil</motion.button>
        <motion.button disabled={!!feedback || !input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
          whileTap={{ scale: 0.92 }} onClick={handleSubmit}>Gönder ✓</motion.button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-center">{feedback === 'correct' ? <StarSVG size={56} filled glowing /> : <span className="text-5xl">💫</span>}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
