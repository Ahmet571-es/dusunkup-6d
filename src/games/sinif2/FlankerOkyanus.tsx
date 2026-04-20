/**
 * Flanker Okyanusu — Eriksen Flanker Görevi (PARADİGMA FIX)
 *
 * Orijinal bug: 🐟 ve 🐠 emojileri aynı yöne bakan farklı balık türleridir.
 * Klasik Flanker için ortadaki uyarıcının YÖNÜ farklı olmalı. Şimdi yön
 * gösteren özel SVG balıklarla (sol/sağ) düzgün paradigma kuruldu.
 *
 * Koşullar:
 *  • congruent   — yan balıklar = orta balık (aynı yön)
 *  • incongruent — yan balıklar ≠ orta balık (zıt yön)
 *  • neutral     — yan uyarıcılar deniz kabuğu (yönsüz)
 *  • close       — incongruent + daralmış boşluk (yüksek conflict)
 *
 * Ölçüm: Flanker Effect = RT(incongruent) − RT(congruent)
 * Küçük ise inhibitör kontrol iyi; büyük ise karışma fazla.
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { audioEngine } from '@/engine/audio/audioEngine'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type FlankerCondition = 'congruent' | 'incongruent' | 'neutral' | 'close'

/** Yön gösteren sevimli balık SVG'si — mirrorlanabilir */
function DirectionFish({ size = 40, direction = 'right', isCenter = false }: { size?: number; direction?: 'left' | 'right'; isCenter?: boolean }) {
  const color = isCenter ? '#67E8F9' : '#67E8F9'
  const opacity = isCenter ? 1 : 0.4
  const scaleX = direction === 'left' ? -1 : 1
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 80 56" style={{ transform: `scaleX(${scaleX})`, filter: isCenter ? `drop-shadow(0 0 8px ${color}80)` : 'none', opacity }}>
      <defs>
        <radialGradient id={`fb-${isCenter ? 'c' : 'f'}-${direction}`} cx="30%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity={isCenter ? 0.6 : 0.3} />
          <stop offset="60%" stopColor={color} stopOpacity={isCenter ? 0.9 : 0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={isCenter ? 1 : 0.7} />
        </radialGradient>
      </defs>
      {/* Vücut — baş sağa bakıyor */}
      <ellipse cx="30" cy="28" rx="24" ry="14" fill={`url(#fb-${isCenter ? 'c' : 'f'}-${direction})`} />
      {/* Kuyruk — üçgen, sol tarafta (sağa giderken kuyruk arkada) */}
      <polygon points="6,28 0,14 0,42" fill={color} opacity={isCenter ? 0.85 : 0.5} />
      {/* Göz */}
      <circle cx="44" cy="23" r="3.5" fill="white" />
      <circle cx="45" cy="23" r="2" fill="#0a1a2e" />
      <circle cx="45.5" cy="22" r="0.8" fill="white" />
      {/* Yüzgeç */}
      <path d="M 30 42 Q 32 48 38 44" fill="none" stroke={color} strokeWidth="2" opacity={isCenter ? 0.7 : 0.4} />
      {/* Ağız */}
      <path d="M 53 28 Q 55 30 53 32" fill="none" stroke="#0a1a2e" strokeWidth="1.2" opacity={isCenter ? 0.7 : 0.4} />
    </svg>
  )
}

/** Yönsüz uyarıcı (neutral) — deniz kabuğu */
function NeutralShell({ size = 40 }: { size?: number }) {
  return (
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 40 40" style={{ opacity: 0.4 }}>
      <defs>
        <radialGradient id="shell-g" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>
      <path d="M 20 6 Q 32 12 30 28 Q 24 34 10 30 Q 8 16 20 6 Z" fill="url(#shell-g)" stroke="#92400E" strokeWidth="0.6" opacity="0.8" />
      {[0, 1, 2, 3].map(i => (
        <path key={i} d={`M 20 ${8 + i * 5} Q ${14 + i} ${16 + i * 4} ${10 + i} ${28 - i * 2}`} fill="none" stroke="#92400E" strokeWidth="0.4" opacity="0.5" />
      ))}
    </svg>
  )
}

export default function FlankerOkyanus({ session, state }: { session: SessionManager; state: SessionState }) {
  const [target, setTarget] = useState<'left' | 'right'>('right')
  const [flankerDir, setFlankerDir] = useState<'left' | 'right' | 'neutral'>('right')
  const [condition, setCondition] = useState<FlankerCondition>('congruent')
  const [showStim, setShowStim] = useState(false)
  const [showFixation, setShowFixation] = useState(true)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [congruentRTs, setCongruentRTs] = useState<number[]>([])
  const [incongruentRTs, setIncongruentRTs] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const setSize = Math.min(9, 3 + (state.difficultyAxes.set_size || 0) * 2)

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    const t: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right'
    setTarget(t)

    // Condition dağılımı: turlar ilerledikçe zorlaşır
    const conditions: FlankerCondition[] = ['congruent', 'incongruent', 'neutral', 'close']
    const maxCondIdx = Math.min(conditions.length, 2 + Math.floor(round / 4))
    const cond = conditions[Math.floor(Math.random() * maxCondIdx)]
    setCondition(cond)

    // Flanker yönünü belirle
    if (cond === 'congruent')        setFlankerDir(t)
    else if (cond === 'incongruent' || cond === 'close') setFlankerDir(t === 'left' ? 'right' : 'left')
    else                             setFlankerDir('neutral')

    // Fixation → stimulus
    setShowStim(false); setShowFixation(true); setFeedback(null)
    const fixDuration = 400 + Math.random() * 400
    const tFix = setTimeout(() => {
      setShowFixation(false); setShowStim(true); stimRef.current = Date.now()
    }, fixDuration)
    timersRef.current.push(tFix)
    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  }, [round])

  const respond = (dir: 'left' | 'right') => {
    if (!showStim || feedback) return
    const rt = Date.now() - stimRef.current
    const correct = dir === target

    if (correct) {
      setStreak(s => s + 1)
      audioEngine.playCorrect()
      if (condition === 'congruent')   setCongruentRTs(prev => [...prev.slice(-20), rt])
      if (condition === 'incongruent') setIncongruentRTs(prev => [...prev.slice(-20), rt])
    } else {
      setStreak(0)
      audioEngine.playIncorrect()
    }

    const avgCong = congruentRTs.length > 2 ? congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length : null
    const avgIncong = incongruentRTs.length > 2 ? incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length : null
    const flankerEffect = avgCong && avgIncong ? Math.round(avgIncong - avgCong) : null

    session.recordTrial({
      timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: 'sinif2_flanker', condition, target, response: dir, flankerEffect, setSize, streak },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    const t = setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 500 : 450)
    timersRef.current.push(t)
  }

  const flankerEffect = incongruentRTs.length > 3 && congruentRTs.length > 3
    ? Math.round((incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length) - (congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length))
    : null

  const half = Math.floor(setSize / 2)
  const gap = condition === 'close' ? '-4px' : '6px'

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.15)' }}>🐠 Ortadaki balık hangi yöne bakıyor?</span>
        <div className="flex items-center gap-2">
          {streak >= 5 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
          {flankerEffect !== null && <span className="text-[10px] text-white/30">FE: {flankerEffect}ms</span>}
        </div>
      </div>

      {/* Stimulus alanı */}
      <div className="w-full max-w-lg h-48 rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0C1A30, #0F2845, #1A3A5C)', border: '1px solid rgba(6,182,212,0.1)' }}>
        {/* Baloncuklar */}
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-cyan-300/10 pointer-events-none"
            style={{ width: 4 + Math.random() * 10, height: 4 + Math.random() * 10, left: `${Math.random() * 100}%` }}
            initial={{ bottom: -10 }}
            animate={{ bottom: ['−10px', '110%'] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4, ease: 'linear' }}
          />
        ))}

        {showFixation && (
          <motion.span className="text-3xl text-white/20" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 0.8 }}>+</motion.span>
        )}
        {showStim && (
          <motion.div className="flex items-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ gap }}>
            {Array.from({ length: half }, (_, i) => (
              <motion.div key={`L${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                {flankerDir === 'neutral' ? <NeutralShell size={50} /> : <DirectionFish size={52} direction={flankerDir} />}
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <DirectionFish size={72} direction={target} isCenter />
            </motion.div>
            {Array.from({ length: half }, (_, i) => (
              <motion.div key={`R${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 + 0.05 }}>
                {flankerDir === 'neutral' ? <NeutralShell size={50} /> : <DirectionFish size={52} direction={flankerDir} />}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Cevap butonları */}
      <div className="flex gap-6">
        <motion.button className="w-28 h-24 rounded-2xl flex flex-col items-center justify-center"
          style={{ background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.25)' }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => respond('left')}>
          <DirectionFish size={36} direction="left" isCenter />
          <span className="text-xs text-blue-300 mt-1 font-bold">Sola</span>
        </motion.button>
        <motion.button className="w-28 h-24 rounded-2xl flex flex-col items-center justify-center"
          style={{ background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.25)' }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => respond('right')}>
          <DirectionFish size={36} direction="right" isCenter />
          <span className="text-xs text-green-300 mt-1 font-bold">Sağa</span>
        </motion.button>
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '✨' : '💨'}</motion.span>}</AnimatePresence>
    </div>
  )
}
