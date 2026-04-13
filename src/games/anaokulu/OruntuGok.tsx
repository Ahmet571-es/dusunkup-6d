/**
 * Örüntü Gök — Örüntü Tanıma + Mantıksal Düşünme
 * Katmanlar: Tekrarlayan→Üçlü→Büyüyen→Çift Özellik→Kural Keşfi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const SHAPES = ['🔴','🔵','🟡','🟢','🟣','🟠']
const SIZES = ['text-2xl','text-3xl','text-4xl']

interface PatternItem { shape: string; size: number; id: number }

function generatePattern(level: number): { sequence: PatternItem[]; answer: PatternItem; options: PatternItem[] } {
  if (level <= 2) {
    // AB-AB pattern
    const a = SHAPES[Math.floor(Math.random()*3)]
    const b = SHAPES[3+Math.floor(Math.random()*3)]
    const seq: PatternItem[] = [
      {shape:a,size:1,id:0},{shape:b,size:1,id:1},
      {shape:a,size:1,id:2},{shape:b,size:1,id:3},
      {shape:a,size:1,id:4},
    ]
    const answer: PatternItem = {shape:b,size:1,id:5}
    const opts = SHAPES.slice(0,4).map((s,i) => ({shape:s,size:1,id:10+i}))
    if (!opts.find(o => o.shape === answer.shape)) opts[0] = answer
    return { sequence: seq, answer, options: opts.sort(() => Math.random()-0.5) }
  } else if (level <= 4) {
    // ABC-ABC
    const [a,b,c] = [...SHAPES].sort(() => Math.random()-0.5).slice(0,3)
    const seq: PatternItem[] = [
      {shape:a,size:1,id:0},{shape:b,size:1,id:1},{shape:c,size:1,id:2},
      {shape:a,size:1,id:3},{shape:b,size:1,id:4},
    ]
    const answer: PatternItem = {shape:c,size:1,id:5}
    const opts = SHAPES.slice(0,4).map((s,i) => ({shape:s,size:1,id:10+i}))
    if (!opts.find(o => o.shape === answer.shape)) opts[0] = answer
    return { sequence: seq, answer, options: opts.sort(() => Math.random()-0.5) }
  } else {
    // Growing: small→medium→large
    const shape = SHAPES[Math.floor(Math.random()*SHAPES.length)]
    const seq: PatternItem[] = [
      {shape,size:0,id:0},{shape,size:1,id:1},{shape,size:2,id:2},
      {shape,size:0,id:3},{shape,size:1,id:4},
    ]
    const answer: PatternItem = {shape,size:2,id:5}
    const opts = [0,1,2,2].map((s,i) => ({shape,size:s,id:10+i}))
    return { sequence: seq, answer, options: opts.sort(() => Math.random()-0.5) }
  }
}

export default function OruntuGok({ session, state }: { session: SessionManager; state: SessionState }) {
  const [level, setLevel] = useState(1)
  const [pattern, setPattern] = useState<ReturnType<typeof generatePattern> | null>(null)
  const [selected, setSelected] = useState<PatternItem | null>(null)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const p = generatePattern(level)
    setPattern(p)
    setSelected(null)
    setFeedback(null)
    stimRef.current = Date.now()
  }, [round, level])

  const handleSelect = (item: PatternItem) => {
    if (feedback || !pattern) return
    setSelected(item)
    const correct = item.shape === pattern.answer.shape && item.size === pattern.answer.size
    const rt = Date.now() - stimRef.current

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: 'anaokulu_oruntu_gok', level, correct, patternType: level <= 2 ? 'AB' : level <= 4 ? 'ABC' : 'growing' },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    if (correct && round % 3 === 2) setLevel(l => Math.min(6, l + 1))

    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 1200 : 900)
  }

  if (!pattern) return null

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)', color: '#D8B4FE', border: '1px solid rgba(168,85,247,0.15)' }}>
        ✨ Sıradaki ne?
      </span>

      {/* Pattern display */}
      <div className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, rgba(15,10,40,0.8), rgba(30,20,60,0.6))', border: '1px solid rgba(168,85,247,0.1)' }}>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {pattern.sequence.map((item, i) => (
            <motion.div key={item.id}
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${SIZES[item.size]}`}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}>
              {item.shape}
            </motion.div>
          ))}
          {/* Blank slot */}
          <motion.div className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ border: '2.5px dashed rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.04)' }}
            animate={{ borderColor: ['rgba(251,191,36,0.3)', 'rgba(251,191,36,0.6)', 'rgba(251,191,36,0.3)'] }}
            transition={{ repeat: Infinity, duration: 2 }}>
            {selected ? (
              <span className={SIZES[selected.size]}>{selected.shape}</span>
            ) : (
              <span className="text-2xl text-yellow-300/40">?</span>
            )}
          </motion.div>
        </div>
      </div>

      {/* Options */}
      <div className="flex gap-3">
        {pattern.options.map((opt, i) => (
          <motion.div key={opt.id}
            className={`w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer ${SIZES[opt.size]}`}
            style={{
              background: selected?.id === opt.id ? (feedback === 'correct' ? 'rgba(52,211,153,0.2)' : feedback === 'wrong' ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.05)',
              border: `2px solid ${selected?.id === opt.id ? (feedback === 'correct' ? '#34D399' : feedback === 'wrong' ? '#F97316' : 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.08)'}`,
            }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => handleSelect(opt)}>
            {opt.shape}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            <span className="text-5xl">{feedback === 'correct' ? '🌟' : '💫'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
