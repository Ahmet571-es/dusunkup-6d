/**
 * Kural Değiştir — Task Switching Paradigm
 * Switch cost ölçümü, mixing cost vs local switch cost
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type Rule = 'color' | 'shape' | 'size'
const COLORS = [{ name: 'Kırmızı', val: '#EF4444' }, { name: 'Mavi', val: '#3B82F6' }, { name: 'Yeşil', val: '#22C55E' }]
const SIZES = ['küçük', 'büyük']

function ShapeGlyph({ shape, color, sz }: { shape: number; color: string; sz: number }) {
  const id = color.replace('#','') + shape
  return (
    <svg width={sz} height={sz} viewBox="0 0 50 50">
      <defs>
        <radialGradient id={`sg_${id}`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.65" />
        </radialGradient>
        <filter id={`sgg_${id}`}><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.45" /></filter>
      </defs>
      <g filter={`url(#sgg_${id})`}>
        {shape === 0 && <circle cx="25" cy="25" r="20" fill={`url(#sg_${id})`} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />}
        {shape === 1 && <rect x="5" y="5" width="40" height="40" rx="4" fill={`url(#sg_${id})`} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />}
        {shape === 2 && <path d="M25,4 L46,42 L4,42 Z" fill={`url(#sg_${id})`} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeLinejoin="round" />}
      </g>
      {shape === 0 && <ellipse cx="18" cy="18" rx="6" ry="4" fill="white" opacity="0.15" />}
      {shape === 1 && <rect x="10" y="10" width="12" height="8" rx="2" fill="white" opacity="0.1" />}
      {shape === 2 && <path d="M25,12 L33,28 L17,28 Z" fill="white" opacity="0.08" />}
    </svg>
  )
}

interface Stimulus { color: number; shape: number; size: number }

function genStimulus(): Stimulus {
  return { color: Math.floor(Math.random()*3), shape: Math.floor(Math.random()*3), size: Math.floor(Math.random()*2) }
}

export default function KuralDegistir({ session, state }: { session: SessionManager; state: SessionState }) {
  const [rule, setRule] = useState<Rule>('color')
  const [stimulus, setStimulus] = useState<Stimulus>(genStimulus())
  const [options, setOptions] = useState<string[]>([])
  const [correctIdx, setCorrectIdx] = useState(0)
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const [isSwitch, setIsSwitch] = useState(false)
  const stimRef = useRef(Date.now())
  const prevRule = useRef<Rule>('color')

  useEffect(() => {
    const rules: Rule[] = ['color', 'shape', 'size']
    const switchProb = Math.min(0.5, 0.2 + (state.difficultyAxes.switch_frequency || 0) * 0.05)
    const doSwitch = Math.random() < switchProb && round > 2
    
    let newRule = rule
    if (doSwitch) {
      const others = rules.filter(r => r !== rule)
      newRule = others[Math.floor(Math.random() * others.length)]
    }
    setIsSwitch(newRule !== prevRule.current)
    prevRule.current = newRule
    setRule(newRule)

    const stim = genStimulus()
    setStimulus(stim)

    let opts: string[] = []; let correct = 0
    if (newRule === 'color') {
      opts = COLORS.map(c => c.name); correct = stim.color
    } else if (newRule === 'shape') {
      opts = ['Daire', 'Kare', 'Üçgen']; correct = stim.shape
    } else {
      opts = ['Küçük', 'Büyük']; correct = stim.size
    }
    setOptions(opts); setCorrectIdx(correct)
    setFeedback(null); stimRef.current = Date.now()
  }, [round])

  const handleAnswer = (idx: number) => {
    if (feedback) return
    const correct = idx === correctIdx
    const rt = Date.now() - stimRef.current

    session.recordTrial({
      timestamp: Date.now(), trialType: 'target', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: 'sinif1_kural_degistir', rule, isSwitch, switchCost: isSwitch ? rt : null },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 600 : 500)
  }

  const ruleLabels = { color: '🎨 Rengini söyle!', shape: '🔷 Şeklini söyle!', size: '📏 Boyutunu söyle!' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <motion.div key={rule} className="text-sm font-bold px-4 py-2 rounded-xl"
        style={{ background: isSwitch ? 'rgba(251,191,36,0.15)' : 'rgba(139,92,246,0.1)', color: isSwitch ? '#FDE68A' : '#C4B5FD', border: `1px solid ${isSwitch ? 'rgba(251,191,36,0.2)' : 'rgba(139,92,246,0.15)'}` }}
        initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        {isSwitch && '⚡ '}{ruleLabels[rule]}
      </motion.div>

      {/* Stimulus */}
      <motion.div key={round} className="w-32 h-32 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}>
        <ShapeGlyph shape={stimulus.shape} color={COLORS[stimulus.color].val} sz={stimulus.size === 0 ? 48 : 80} />
      </motion.div>

      {/* Options */}
      <div className="flex gap-3">
        {options.map((opt, i) => (
          <motion.button key={opt}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
            onClick={() => handleAnswer(i)}>
            {opt}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && <motion.div initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>
          {feedback === 'correct' ? <StarSVG size={48} filled glowing /> : <span className="text-4xl">💨</span>}
        </motion.div>}
      </AnimatePresence>
    </div>
  )
}
