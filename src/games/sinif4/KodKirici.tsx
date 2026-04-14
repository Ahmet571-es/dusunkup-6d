/**
 * Kod Kırıcı — Örüntü Keşfi + Matematiksel Düşünme
 * 4 Mod: Sayı Dizisi → İşlem Şifresi → Matris Örüntü → Mantık Bulmacası
 * Kademeli ipucu, kural gösterimi, transfer testi
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type CodeMode = 'sequence' | 'operation' | 'matrix' | 'logic'

interface CodePuzzle { sequence: number[]; answer: number; rule: string; hint: string; options: number[]; mode: CodeMode }

function generateSequence(): CodePuzzle {
  const patterns = [
    { gen: (i: number) => (i + 1) * 2, rule: '×2 çarpanları (2,4,6,8...)', hint: 'Her sayı 2\'nin katı' },
    { gen: (i: number) => (i + 1) * 3, rule: '×3 çarpanları (3,6,9,12...)', hint: 'Her sayı 3\'ün katı' },
    { gen: (i: number) => (i + 1) * 5, rule: '×5 çarpanları (5,10,15...)', hint: '5\'er 5\'er artıyor' },
    { gen: (i: number) => i * i + 1, rule: 'Kare sayılar + 1', hint: '1,2,5,10,17... → 0²+1, 1²+1, 2²+1...' },
    { gen: (i: number) => 1 + i * 4, rule: '+4 artış (1,5,9,13...)', hint: 'Her adımda 4 ekleniyor' },
    { gen: (i: number) => Math.pow(2, i), rule: '2 üsleri (1,2,4,8,16...)', hint: 'Her sayı öncekinin 2 katı' },
    { gen: (i: number) => i * (i + 1) / 2, rule: 'Üçgen sayılar (0,1,3,6,10...)', hint: '0, 0+1, 0+1+2, 0+1+2+3...' },
    { gen: (_: number, prev: number[]) => prev.length < 2 ? prev.length + 1 : prev[prev.length - 1] + prev[prev.length - 2], rule: 'Fibonacci benzeri', hint: 'Her sayı önceki ikisinin toplamı' },
  ]
  const p = patterns[Math.floor(Math.random() * patterns.length)]
  const len = 5
  const seq: number[] = []
  for (let i = 0; i < len; i++) seq.push(p.gen(i, seq))
  const next = p.gen(len, seq)
  const opts = [next, next + 1, next - 1, next + 2].filter(n => n >= 0).sort(() => Math.random() - 0.5)
  if (!opts.includes(next)) opts[0] = next
  return { sequence: seq, answer: next, rule: p.rule, hint: p.hint, options: [...new Set(opts)].slice(0, 4).sort(() => Math.random() - 0.5), mode: 'sequence' }
}

function generateOperation(): CodePuzzle {
  const ops = [
    { seq: [2, 6, 4, 12, 8], answer: 24, rule: '×3, -2, ×3, -4... (çarpıp çıkar)', hint: 'Tek sıra: ×3, çift sıra: -2, -4...' },
    { seq: [1, 4, 9, 16, 25], answer: 36, rule: 'Kare sayılar: 1²,2²,3²,4²,5²,6²', hint: 'Her sayı bir tam sayının karesi' },
    { seq: [3, 5, 8, 12, 17], answer: 23, rule: '+2,+3,+4,+5,+6 (artan fark)', hint: 'Farklar: 2,3,4,5,6... her seferinde 1 artıyor' },
    { seq: [100, 90, 81, 73, 66], answer: 60, rule: '-10,-9,-8,-7,-6 (azalan fark)', hint: 'Çıkarılan miktar her seferinde 1 azalıyor' },
  ]
  const o = ops[Math.floor(Math.random() * ops.length)]
  const opts = [o.answer, o.answer + 1, o.answer - 1, o.answer + 3].sort(() => Math.random() - 0.5)
  if (!opts.includes(o.answer)) opts[0] = o.answer
  return { sequence: o.seq, answer: o.answer, rule: o.rule, hint: o.hint, options: opts, mode: 'operation' }
}

export default function KodKirici({ session, state }: { session: SessionManager; state: SessionState }) {
  const [puzzle, setPuzzle] = useState<CodePuzzle>(generateSequence())
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showRule, setShowRule] = useState(false)
  const [round, setRound] = useState(0)
  const [streak, setStreak] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const generators = [generateSequence, generateOperation, generateSequence, generateOperation]
    setPuzzle(generators[round % generators.length]())
    setFeedback(null); setShowHint(false); setShowRule(false); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (val: number) => {
    if (feedback) return; const correct = val === puzzle.answer
    if (correct) setStreak(s => s + 1); else { setStreak(0); setShowRule(true) }

    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif4_kod_${puzzle.mode}`, mode: puzzle.mode, rule: puzzle.rule, hintUsed: showHint, streak } })
    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 900 : 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(234,179,8,0.1)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.15)' }}>🔐 Şifreyi çöz! Sıradaki sayı ne?</span>
        {streak >= 3 && <span className="text-xs text-orange-300">🔥 {streak}</span>}
      </div>

      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(234,179,8,0.08)' }}>
        {/* Sequence display */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
          {puzzle.sequence.map((n, i) => (
            <motion.div key={i} className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black text-white"
              style={{ background: 'linear-gradient(145deg, rgba(234,179,8,0.08), rgba(234,179,8,0.02))', border: '1.5px solid rgba(234,179,8,0.18)', boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.05)' }}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              {n}
            </motion.div>
          ))}
          <motion.div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ border: '2.5px dashed rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.03)', color: '#FDE68A' }}
            animate={{ borderColor: ['rgba(251,191,36,0.3)', 'rgba(251,191,36,0.6)', 'rgba(251,191,36,0.3)'] }}
            transition={{ repeat: Infinity, duration: 2 }}>
            ?
          </motion.div>
        </div>

        {/* Differences hint */}
        <div className="flex justify-center gap-5 mb-3">
          {puzzle.sequence.slice(1).map((n, i) => (
            <span key={i} className="text-[10px] text-white/15">+{n - puzzle.sequence[i]}</span>
          ))}
        </div>

        {/* Hints */}
        {!showHint && !feedback && <button onClick={() => setShowHint(true)} className="block mx-auto text-[10px] text-white/20 hover:text-white/40">💡 İpucu</button>}
        {showHint && <p className="text-xs text-blue-300/50 text-center">💡 {puzzle.hint}</p>}
        {showRule && <p className="text-xs text-orange-300 text-center mt-1">📝 Kural: {puzzle.rule}</p>}
      </div>

      {/* Options */}
      <div className="flex gap-3">
        {puzzle.options.map((opt, i) => (
          <motion.button key={i} className="w-16 h-16 rounded-xl text-xl font-black text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
            whileHover={{ scale: 1.08, borderColor: 'rgba(234,179,8,0.3)' }} whileTap={{ scale: 0.92 }}
            onClick={() => handleAnswer(opt)}>{opt}</motion.button>
        ))}
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
