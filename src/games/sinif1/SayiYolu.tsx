/**
 * Sayı Yolu — Number Line Estimation
 * PAE ölçümü, logaritmik→lineer geçiş takibi
 */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function SayiYolu({ session, state }: { session: SessionManager; state: SessionState }) {
  const [target, setTarget] = useState(5)
  const [maxNum, setMaxNum] = useState(10)
  const [position, setPosition] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct'|'close'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const [paeHistory, setPaeHistory] = useState<number[]>([])
  const lineRef = useRef<HTMLDivElement>(null)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const range = Math.min(100, 10 + (state.difficultyAxes.number_range || 0) * 10)
    setMaxNum(range)
    setTarget(1 + Math.floor(Math.random() * (range - 1)))
    setPosition(null); setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleLineClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (feedback || !lineRef.current) return
    const rect = lineRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setPosition(x)
  }

  const handleSubmit = () => {
    if (position === null || feedback) return
    const estimate = Math.round(position * maxNum)
    const pae = Math.abs(estimate - target) / maxNum * 100
    const correct = pae < 5
    const close = pae < 15

    setPaeHistory(prev => [...prev, pae])

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct || close,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: {
        skillId: 'sinif1_sayi_yolu', target, estimate, maxNum, pae: Math.round(pae * 10) / 10,
        avgPae: paeHistory.length > 0 ? Math.round(paeHistory.reduce((a,b)=>a+b,0)/paeHistory.length * 10)/10 : pae,
      },
    })

    setFeedback(correct ? 'correct' : close ? 'close' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 1200)
  }

  const correctPosition = target / maxNum
  const avgPae = paeHistory.length > 0 ? Math.round(paeHistory.reduce((a,b)=>a+b,0)/paeHistory.length * 10)/10 : null

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 gap-5">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.15)' }}>
        🛤️ Sayıyı doğruya yerleştir!
        {avgPae !== null && <span className="ml-2 opacity-50">Ort. hata: %{avgPae}</span>}
      </span>

      {/* Target number */}
      <motion.div className="text-6xl font-black text-white" key={target}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        {target}
      </motion.div>

      {/* Number line */}
      <div className="w-full max-w-lg px-4">
        <div ref={lineRef} className="relative h-16 cursor-pointer" onClick={handleLineClick} onTouchStart={handleLineClick}>
          {/* Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 rounded-full -translate-y-1/2"
            style={{ background: 'rgba(255,255,255,0.15)' }} />
          
          {/* Tick marks */}
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${(i / 10) * 100}%` }}>
              <div className="w-px h-4 -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.2)' }} />
              {(i === 0 || i === 5 || i === 10) && (
                <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] text-white/30 font-bold">
                  {Math.round(maxNum * i / 10)}
                </span>
              )}
            </div>
          ))}

          {/* Player marker */}
          {position !== null && (
            <motion.div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${position * 100}%` }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div className="relative flex flex-col items-center">
                <StarSVG size={28} filled glowing />
                <span className="text-[10px] font-black text-yellow-300 -mt-0.5">{Math.round(position * maxNum)}</span>
              </div>
            </motion.div>
          )}

          {/* Correct position (shown after answer) */}
          {feedback && (
            <motion.div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${correctPosition * 100}%` }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                style={{ boxShadow: '0 0 12px rgba(52,211,153,0.5)' }}>
                <span className="text-[10px] font-black text-white">✓</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.button
        className="px-8 py-3 rounded-xl text-sm font-bold disabled:opacity-30"
        style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
        disabled={position === null || !!feedback}
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}>
        Yerleştir ✓
      </motion.button>

      {feedback && (
        <motion.div className={`flex items-center gap-2 text-sm font-bold ${feedback === 'correct' ? 'text-green-300' : feedback === 'close' ? 'text-yellow-300' : 'text-orange-300'}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {feedback === 'correct' ? <><StarSVG size={28} filled glowing /><span>Mükemmel!</span></> : feedback === 'close' ? '👍 Yaklaştın!' : `💫 Doğru yer: ${target}`}
        </motion.div>
      )}
    </div>
  )
}
