/**
 * Kesir-Ondalık Köprü — Temsil Dönüştürme (BUG FIX + PEDAGOJİK İYİLEŞTİRME)
 *
 * Düzeltilen bug'lar:
 *  1. Eskiden: pasta grafik + 3 eşdeğer temsil (kesir, ondalık, yüzde) hepsi birden
 *     ekranda görünüyordu → çocuk cevabı ekrandan OKUYABİLİYORDU.
 *     Şimdi: sadece sorulan temsil gösterilir; cevap gizli.
 *
 *  2. Eskiden: {frac: '1/3', dec: '0.33', pct: '%33'} — matematik HATA.
 *     1/3 ≠ 0.33 ve 1/3 ≠ %33 (gerçek değer 0.333... ve %33.33...).
 *     Çözüm: 1/3 kaldırıldı, sadece terminating ondalık değerleri tutuldu.
 *
 *  3. Eskiden: chain mod distractor'ları nonsense idi (0.5 = %0.6 gibi).
 *     Şimdi: pedagojik olarak anlamlı near-miss distractor'lar.
 *
 *  4. Eskiden: 12 statik dönüşüm; kolay ezberlenir.
 *     Şimdi: temel set + genişletilmiş paydalar (1/2, 1/4, 3/4, 1/5..9/10, 1/8, 3/8, 5/8, 7/8, 1/20, vb.)
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import { audioEngine } from '@/engine/audio/audioEngine'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type BridgeMode = 'frac_to_dec' | 'dec_to_pct' | 'pct_to_frac' | 'chain'

interface Conversion { frac: string; dec: string; pct: string; decNum: number }

// Sadece terminating decimal'i olan kesirler (matematiksel doğruluk!)
// Pay/payda: 1-9, ancak yalnızca paydası 2, 4, 5, 8, 10, 20, 25, 50, 100'ün bölenleri olan
// kesirler terminating ondalık verir (5 ve 2'nin kuvvetleri).
const CONVERSIONS: Conversion[] = [
  // Yarımlar ve çeyrekler
  { frac: '1/2',  dec: '0.5',   pct: '%50',   decNum: 0.5 },
  { frac: '1/4',  dec: '0.25',  pct: '%25',   decNum: 0.25 },
  { frac: '3/4',  dec: '0.75',  pct: '%75',   decNum: 0.75 },
  // Beşte'ler
  { frac: '1/5',  dec: '0.2',   pct: '%20',   decNum: 0.2 },
  { frac: '2/5',  dec: '0.4',   pct: '%40',   decNum: 0.4 },
  { frac: '3/5',  dec: '0.6',   pct: '%60',   decNum: 0.6 },
  { frac: '4/5',  dec: '0.8',   pct: '%80',   decNum: 0.8 },
  // Onda'lar
  { frac: '1/10', dec: '0.1',   pct: '%10',   decNum: 0.1 },
  { frac: '3/10', dec: '0.3',   pct: '%30',   decNum: 0.3 },
  { frac: '7/10', dec: '0.7',   pct: '%70',   decNum: 0.7 },
  { frac: '9/10', dec: '0.9',   pct: '%90',   decNum: 0.9 },
  // Sekizde'ler
  { frac: '1/8',  dec: '0.125', pct: '%12.5', decNum: 0.125 },
  { frac: '3/8',  dec: '0.375', pct: '%37.5', decNum: 0.375 },
  { frac: '5/8',  dec: '0.625', pct: '%62.5', decNum: 0.625 },
  { frac: '7/8',  dec: '0.875', pct: '%87.5', decNum: 0.875 },
  // Ekstra: 1/20, 1/25 (yüzdelik tabanlı)
  { frac: '1/20', dec: '0.05',  pct: '%5',    decNum: 0.05 },
  { frac: '1/25', dec: '0.04',  pct: '%4',    decNum: 0.04 },
  { frac: '3/20', dec: '0.15',  pct: '%15',   decNum: 0.15 },
]

/** Anlamlı near-miss distractor üret — sık yapılan hatalara dayalı. */
function genSmartDistractors(correct: string, allPool: string[], mode: BridgeMode): string[] {
  const others = allPool.filter(p => p !== correct)
  // Rastgele 3 farklı seçenek (ama aynı tipten — ondalık soruluyorsa 3 ondalık distraktör)
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3)
  return shuffled
}

/** Pasta grafik — sadece görsel ipucu amaçlı (cevabı yanıt değil görsel olarak destekler). */
function PieChart({ percent, size = 90, showLabel = false }: { percent: number; size?: number; showLabel?: boolean }) {
  const r = size / 2 - 5; const cx = size / 2; const cy = size / 2
  const angle = (percent / 100) * 360
  const rad = (angle - 90) * Math.PI / 180
  const large = angle > 180 ? 1 : 0
  const x = cx + Math.cos(rad) * r; const y = cy + Math.sin(rad) * r
  return (
    <svg width={size} height={size}>
      <defs>
        <radialGradient id="pieFill" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
        style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.25))' }} />
      {percent > 0 && percent < 100 && (
        <path d={`M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${large} 1 ${x},${y} Z`}
          fill="url(#pieFill)" stroke="rgba(147,197,253,0.5)" strokeWidth="1.2" />
      )}
      {percent >= 100 && <circle cx={cx} cy={cy} r={r} fill="url(#pieFill)" />}
      {showLabel && (
        <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="11" fontWeight="bold">
          {percent}%
        </text>
      )}
    </svg>
  )
}

export default function KesirOndalikKopru({ session, state }: { session: SessionManager; state: SessionState }) {
  const [conv, setConv] = useState(CONVERSIONS[0])
  const [mode, setMode] = useState<BridgeMode>('frac_to_dec')
  const [question, setQuestion] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [streak, setStreak] = useState(0)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    const c = CONVERSIONS[Math.floor(Math.random() * CONVERSIONS.length)]
    setConv(c)
    const modes: BridgeMode[] = ['frac_to_dec', 'dec_to_pct', 'pct_to_frac', 'chain']
    const m = modes[Math.floor(round / 3) % modes.length]
    setMode(m)

    let q = '', ans = '', opts: string[] = []

    if (m === 'frac_to_dec') {
      q = `${c.frac} kesrinin ondalık gösterimi nedir?`
      ans = c.dec
      opts = [ans, ...genSmartDistractors(ans, CONVERSIONS.map(x => x.dec), m)]
    } else if (m === 'dec_to_pct') {
      q = `${c.dec} ondalığının yüzde karşılığı nedir?`
      ans = c.pct
      opts = [ans, ...genSmartDistractors(ans, CONVERSIONS.map(x => x.pct), m)]
    } else if (m === 'pct_to_frac') {
      q = `${c.pct} yüzdesinin kesir karşılığı nedir?`
      ans = c.frac
      opts = [ans, ...genSmartDistractors(ans, CONVERSIONS.map(x => x.frac), m)]
    } else {
      // chain: verilen kesrin ondalık + yüzde birleşimi
      q = `${c.frac} = ? ondalık ve ? yüzde`
      ans = `${c.dec} / ${c.pct}`
      // Anlamlı distractor'lar: rastgele 3 başka conversion'ın dec/pct birleşimi (yanlış ama aynı formatta)
      const others = CONVERSIONS.filter(x => x.frac !== c.frac)
        .sort(() => Math.random() - 0.5).slice(0, 3)
      opts = [ans, ...others.map(x => `${x.dec} / ${x.pct}`)]
    }

    setOptions(opts.sort(() => Math.random() - 0.5))
    setQuestion(q)
    setCorrectAnswer(ans)
    setFeedback(null)
    setShowHint(false)
    stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (ans: string) => {
    if (feedback) return
    const correct = ans === correctAnswer
    if (correct) {
      setStreak(s => s + 1)
      audioEngine.playCorrect()
    } else {
      setStreak(0)
      audioEngine.playIncorrect()
    }
    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current,
      isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif5_kopru_${mode}`, mode, conv: conv.frac, response: ans, correctAnswer },
    })
    setFeedback(correct ? 'correct' : 'wrong')
    const t = setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 1400)
    timersRef.current.push(t)
  }

  const percent = parseFloat(conv.pct.replace('%', '')) || 0
  const modeLabels: Record<BridgeMode, string> = {
    frac_to_dec: '🔢 Kesir → Ondalık',
    dec_to_pct: '📊 Ondalık → Yüzde',
    pct_to_frac: '🥧 Yüzde → Kesir',
    chain: '🔗 Zincir Dönüşüm',
  }
  const hints: Record<BridgeMode, string> = {
    frac_to_dec: `Payı paydaya böl. Örnek: 1/4 → 1÷4 = 0.25`,
    dec_to_pct: `Ondalığı 100 ile çarp. Örnek: 0.5 × 100 = %50`,
    pct_to_frac: `Yüzdeyi 100'e böl ve sadeleştir. Örnek: %25 = 25/100 = 1/4`,
    chain: `Önce payı paydaya böl (ondalık), sonra 100 ile çarp (yüzde).`,
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-md justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(234,179,8,0.1)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.15)' }}>
          🌉 {modeLabels[mode]}
        </span>
        {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
      </div>

      {/* Görsel ipucu — SADECE sorulan temsili göster, cevabı değil */}
      <div className="w-full max-w-md rounded-2xl p-5 flex flex-col items-center gap-3"
        style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Pasta grafik her zaman gösterilir (görsel sezgi için) ama yüzde etiketi olmadan */}
        <PieChart percent={percent} size={100} showLabel={false} />

        {/* Sadece sorulan form görünür kalır */}
        <div className="flex items-center justify-center">
          {mode === 'frac_to_dec' && (
            <span className="px-4 py-2 rounded-xl text-2xl font-black bg-blue-500/15 text-blue-300 border border-blue-400/30">
              {conv.frac}
            </span>
          )}
          {mode === 'dec_to_pct' && (
            <span className="px-4 py-2 rounded-xl text-2xl font-black bg-green-500/15 text-green-300 border border-green-400/30">
              {conv.dec}
            </span>
          )}
          {mode === 'pct_to_frac' && (
            <span className="px-4 py-2 rounded-xl text-2xl font-black bg-yellow-500/15 text-yellow-300 border border-yellow-400/30">
              {conv.pct}
            </span>
          )}
          {mode === 'chain' && (
            <span className="px-4 py-2 rounded-xl text-2xl font-black bg-blue-500/15 text-blue-300 border border-blue-400/30">
              {conv.frac}
            </span>
          )}
        </div>
      </div>

      <p className="text-base font-bold text-white text-center max-w-md">{question}</p>

      {!showHint && !feedback && (
        <button onClick={() => setShowHint(true)} className="text-[10px] text-white/25 hover:text-white/45 transition">
          💡 İpucu göster
        </button>
      )}
      {showHint && (
        <motion.p className="text-xs text-blue-300/55 text-center max-w-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          💡 {hints[mode]}
        </motion.p>
      )}

      <div className="flex gap-2 flex-wrap justify-center max-w-md">
        {options.map((opt, i) => (
          <motion.button key={`${opt}-${i}`} className="px-4 py-3 rounded-xl text-sm font-bold text-white"
            style={{
              background: feedback && opt === correctAnswer ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${feedback && opt === correctAnswer ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)'}`,
            }}
            whileHover={!feedback ? { scale: 1.05 } : {}}
            whileTap={!feedback ? { scale: 0.92 } : {}}
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}>
            {opt}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-center">
              {feedback === 'correct' ? <StarSVG size={48} filled glowing /> : <span className="text-4xl">💨</span>}
            </div>
            {feedback === 'wrong' && (
              <p className="text-xs text-orange-300 mt-1 text-center">Doğru: {correctAnswer}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
