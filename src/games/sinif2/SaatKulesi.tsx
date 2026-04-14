/**
 * Saat Kulesi — Zaman Kavramı
 * 4 Mod: Tam Saat → Yarım/Çeyrek → Dakika → Süre Hesaplama
 * SVG analog saat yüzü, gerçek zamanlı akrep-yelkovan
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type ClockMode = 'read_full' | 'read_half' | 'read_minute' | 'duration'

function AnalogClock({ hours, minutes, size = 160 }: { hours: number; minutes: number; size?: number }) {
  const r = size / 2 - 6; const cx = size / 2; const cy = size / 2
  const hAngle = ((hours % 12) + minutes / 60) * 30 - 90
  const mAngle = minutes * 6 - 90
  const hRad = hAngle * Math.PI / 180; const mRad = mAngle * Math.PI / 180
  const hLen = r * 0.45; const mLen = r * 0.65

  return (
    <svg width={size} height={size}>
      <defs>
        <filter id="clockShadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#60A5FA" floodOpacity="0.15" /><feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.2" /></filter>
      </defs>
      <circle cx={cx} cy={cy} r={r + 2} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" filter="url(#clockShadow)" />
      <circle cx={cx} cy={cy} r={r} fill="rgba(6,10,26,0.8)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      {/* Hour numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i + 1) * 30 * Math.PI / 180
        return <text key={i} x={cx + Math.sin(a) * (r - 18)} y={cy - Math.cos(a) * (r - 18) + 5} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="13" fontWeight="bold" fontFamily="var(--font-child)">{i + 1}</text>
      })}
      {/* Minute ticks */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = i * 6 * Math.PI / 180; const len = i % 5 === 0 ? 8 : 3
        return <line key={i} x1={cx + Math.sin(a) * (r - 6)} y1={cy - Math.cos(a) * (r - 6)} x2={cx + Math.sin(a) * (r - 6 - len)} y2={cy - Math.cos(a) * (r - 6 - len)} stroke={`rgba(255,255,255,${i % 5 === 0 ? 0.25 : 0.1})`} strokeWidth={i % 5 === 0 ? 1.5 : 0.5} />
      })}
      {/* Hour hand */}
      <line x1={cx} y1={cy} x2={cx + Math.cos(hRad) * hLen} y2={cy + Math.sin(hRad) * hLen} stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
      {/* Minute hand */}
      <line x1={cx} y1={cy} x2={cx + Math.cos(mRad) * mLen} y2={cy + Math.sin(mRad) * mLen} stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="5" fill="#F1F5F9" />
      <circle cx={cx} cy={cy} r="2.5" fill="#1E293B" />
    </svg>
  )
}

export default function SaatKulesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [hours, setHours] = useState(3); const [minutes, setMinutes] = useState(0)
  const [mode, setMode] = useState<ClockMode>('read_full')
  const [options, setOptions] = useState<string[]>([]); const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0); const stimRef = useRef(Date.now())

  useEffect(() => {
    const modes: ClockMode[] = ['read_full', 'read_half', 'read_minute', 'duration']
    const m = modes[Math.floor(round / 3) % modes.length]; setMode(m)
    const h = 1 + Math.floor(Math.random() * 12)
    let min = 0
    if (m === 'read_full') min = 0
    else if (m === 'read_half') min = [0, 15, 30, 45][Math.floor(Math.random() * 4)]
    else min = Math.floor(Math.random() * 12) * 5
    setHours(h); setMinutes(min)

    if (m === 'duration') {
      const dur = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)]
      const correct = `${dur} dakika`
      const opts = [`${dur} dakika`, `${dur + 15} dakika`, `${dur - 15} dakika`, `${dur + 30} dakika`].filter(o => !o.startsWith('-')).slice(0, 4)
      const shuffled = [...opts].sort(() => Math.random() - 0.5); if (!shuffled.includes(correct)) shuffled[0] = correct; setOptions(shuffled); setCorrectIdx(shuffled.indexOf(correct))
      const sorted = opts.sort(() => Math.random() - 0.5)
      setOptions(sorted); setCorrectIdx(sorted.indexOf(correct))
    } else {
      const correct = `${h}:${min.toString().padStart(2, '0')}`
      const wrongs = [`${h}:${((min + 15) % 60).toString().padStart(2, '0')}`, `${(h % 12) + 1}:${min.toString().padStart(2, '0')}`, `${h}:${((min + 30) % 60).toString().padStart(2, '0')}`]
      const opts = [correct, ...wrongs.slice(0, 3)].sort(() => Math.random() - 0.5)
      setOptions(opts); setCorrectIdx(opts.indexOf(correct))
    }
    setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (idx: number) => {
    if (feedback) return; const correct = idx === correctIdx
    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: 'sinif2_saat', mode, hours, minutes } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 700)
  }

  const modeLabels: Record<ClockMode, string> = { read_full: '🕐 Tam Saat', read_half: '🕐 Yarım/Çeyrek', read_minute: '🕐 Dakika', duration: '⏱️ Süre Hesapla' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(236,72,153,0.1)', color: '#F9A8D4', border: '1px solid rgba(236,72,153,0.15)' }}>{modeLabels[mode]}</span>
      <AnalogClock hours={hours} minutes={minutes} />
      <p className="text-sm font-bold text-green-300">{mode === 'duration' ? 'Bu süre kaç dakika?' : 'Saat kaç?'}</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {options.map((opt, i) => (
          <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(i)}>{opt}</motion.button>
        ))}
      </div>
      <div className="flex gap-3 text-[10px] text-white/20">
        <span>🔵 Kısa kol = Saat</span><span>🟢 Uzun kol = Dakika</span>
      </div>
      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
