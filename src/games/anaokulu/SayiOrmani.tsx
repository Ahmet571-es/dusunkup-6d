/**
 * Sayı Ormanı — Anaokulu Matematik Oyunu
 * Bilimsel Temel: Subitizing, Counting Principles (Gelman), Part-Whole, Number Sense (Dehaene)
 * 4 Modül: Subitizing → Sayma & Eşleme → Toplama Sahne → Karşılaştırma
 * 7 Zorluk Ekseni: sayı aralığı, çeldirici, gösterim süresi, düzen, işlem, bellek, strateji
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SquirrelSVG as CinemaSquirrel, ButterflySVG, RabbitSVG, FrogSVG, DuckSVG, CatSVG, BearSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

// === TYPES ===
type Module = 'subitizing' | 'counting' | 'addition' | 'comparison'

interface GameItem {
  id: number
  x: number
  y: number
  type: 'target' | 'distractor'
  animal: 'squirrel' | 'rabbit' | 'hedgehog' | 'butterfly' | 'bird' | 'frog' | 'duck' | 'cat' | 'bear'
  counted: boolean
  variant: number
}

interface Question {
  module: Module
  items: GameItem[]
  targetCount: number
  groupA?: number
  groupB?: number
  displayTimeMs?: number // for subitizing
  answer: number
}

// === ANIMAL SVGs ===
// SquirrelSVG imported from cinema/characters (CinemaSquirrel)

// RabbitSVG imported from cinema/characters

function HedgehogSVG({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <ellipse cx="40" cy="74" rx="12" ry="2" fill="rgba(0,0,0,0.12)"/>
      {[-35,-25,-15,-5,5,15,25,35].map((a,i) =>
        <line key={i} x1={40+Math.sin(a*Math.PI/180)*14} y1={34-Math.cos(a*Math.PI/180)*16}
          x2={40+Math.sin(a*Math.PI/180)*24} y2={34-Math.cos(a*Math.PI/180)*26}
          stroke={i%2===0?"#5C4033":"#7B5B48"} strokeWidth="2.5" strokeLinecap="round"/>
      )}
      <ellipse cx="40" cy="48" rx="16" ry="16" fill="#7B5B48"/>
      <ellipse cx="40" cy="50" rx="12" ry="11" fill="#D4B896"/>
      <circle cx="40" cy="34" r="12" fill="#D4B896"/>
      <circle cx="35" cy="33" r="3" fill="white"/>
      <circle cx="45" cy="33" r="3" fill="white"/>
      <circle cx="35.5" cy="33" r="1.8" fill="#1A1207"/>
      <circle cx="45.5" cy="33" r="1.8" fill="#1A1207"/>
      <ellipse cx="40" cy="38" rx="2" ry="1.5" fill="#3D2B1A"/>
    </svg>
  )
}

// ButterflySVG imported from cinema/characters

// === QUESTION GENERATOR ===
function generateQuestion(module: Module, difficulty: Record<string, number>): Question {
  const numRange = Math.min(9, 1 + (difficulty.number_range || 1))
  const distractorCount = Math.min(5, difficulty.distractor_count || 0)
  
  const animals: GameItem['animal'][] = ['squirrel', 'rabbit', 'hedgehog', 'butterfly', 'bird', 'frog', 'duck', 'cat', 'bear']
  const positions: {x: number; y: number}[] = []
  
  // Generate non-overlapping positions
  const genPos = () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const x = 8 + Math.random() * 78
      const y = 12 + Math.random() * 55
      if (positions.every(p => Math.abs(p.x - x) > 12 || Math.abs(p.y - y) > 12)) {
        positions.push({ x, y })
        return { x, y }
      }
    }
    const x = 8 + Math.random() * 78
    const y = 12 + Math.random() * 55
    positions.push({ x, y })
    return { x, y }
  }

  switch (module) {
    case 'subitizing': {
      const count = Math.min(numRange, 1 + Math.floor(Math.random() * Math.min(5, numRange)))
      const items: GameItem[] = []
      for (let i = 0; i < count; i++) {
        const pos = genPos()
        items.push({ id: i, ...pos, type: 'target', animal: 'squirrel', counted: false, variant: i % 3 })
      }
      for (let i = 0; i < distractorCount; i++) {
        const pos = genPos()
        items.push({ id: 100+i, ...pos, type: 'distractor', animal: animals[1 + (i % 4)] as GameItem['animal'], counted: false, variant: 0 })
      }
      const displayTime = Math.max(500, 2000 - (difficulty.display_time || 0) * 200)
      return { module: 'subitizing', items, targetCount: count, displayTimeMs: displayTime, answer: count }
    }
    case 'counting': {
      const count = Math.min(numRange, 2 + Math.floor(Math.random() * Math.min(7, numRange)))
      const items: GameItem[] = []
      for (let i = 0; i < count; i++) {
        const pos = genPos()
        items.push({ id: i, ...pos, type: 'target', animal: 'squirrel', counted: false, variant: i % 3 })
      }
      for (let i = 0; i < distractorCount; i++) {
        const pos = genPos()
        items.push({ id: 100+i, ...pos, type: 'distractor', animal: animals[1 + (i % 4)] as GameItem['animal'], counted: false, variant: 0 })
      }
      return { module: 'counting', items, targetCount: count, answer: count }
    }
    case 'addition': {
      const maxA = Math.min(5, Math.ceil(numRange / 2))
      const a = 1 + Math.floor(Math.random() * maxA)
      const b = 1 + Math.floor(Math.random() * maxA)
      const items: GameItem[] = []
      // Group A — left side
      for (let i = 0; i < a; i++) {
        const pos = { x: 8 + Math.random() * 35, y: 15 + Math.random() * 50 }
        positions.push(pos)
        items.push({ id: i, ...pos, type: 'target', animal: 'squirrel', counted: false, variant: 0 })
      }
      // Group B — right side
      for (let i = 0; i < b; i++) {
        const pos = { x: 55 + Math.random() * 35, y: 15 + Math.random() * 50 }
        positions.push(pos)
        items.push({ id: 10+i, ...pos, type: 'target', animal: 'squirrel', counted: false, variant: 1 })
      }
      // Distractors
      for (let i = 0; i < Math.min(3, distractorCount); i++) {
        const pos = genPos()
        items.push({ id: 100+i, ...pos, type: 'distractor', animal: animals[1 + (i % 4)] as GameItem['animal'], counted: false, variant: 0 })
      }
      return { module: 'addition', items, targetCount: a+b, groupA: a, groupB: b, answer: a+b }
    }
    case 'comparison': {
      const maxN = Math.min(7, Math.max(3, numRange))
      let a = 1 + Math.floor(Math.random() * maxN)
      let b = 1 + Math.floor(Math.random() * maxN)
      // a === b ise: artırabiliyorsak artır, değilse azalt (a=b=1 durumu dahil)
      if (a === b) {
        if (b < maxN) b = b + 1
        else if (a > 1) a = a - 1
        else b = 2 // son çare: maxN=1 gibi absürd bir ayar için
      }
      const items: GameItem[] = []
      for (let i = 0; i < a; i++) {
        const pos = { x: 5 + Math.random() * 38, y: 15 + Math.random() * 55 }
        positions.push(pos)
        items.push({ id: i, ...pos, type: 'target', animal: 'squirrel', counted: false, variant: 0 })
      }
      for (let i = 0; i < b; i++) {
        const pos = { x: 55 + Math.random() * 38, y: 15 + Math.random() * 55 }
        positions.push(pos)
        items.push({ id: 50+i, ...pos, type: 'target', animal: 'squirrel', counted: false, variant: 2 })
      }
      return { module: 'comparison', items, targetCount: Math.max(a, b), groupA: a, groupB: b, answer: Math.max(a, b) }
    }
  }
}

// === RENDER ANIMAL ===
function AnimalSprite({ animal, variant, size }: { animal: string; variant: number; size: number }) {
  switch (animal) {
    case 'squirrel':  return <CinemaSquirrel size={size} />
    case 'rabbit':    return <RabbitSVG size={size} />
    case 'hedgehog':  return <HedgehogSVG size={size} />
    case 'butterfly': return <ButterflySVG size={size} />
    case 'frog':      return <FrogSVG size={size} />
    case 'duck':      return <DuckSVG size={size} />
    case 'cat':       return <CatSVG size={size} color={variant % 2 === 0 ? '#F4A460' : '#94A3B8'} />
    case 'bear':      return <BearSVG size={size} />
    default:          return <span style={{ fontSize: size * 0.6 }}>🐦</span>
  }
}

// === NUMBER KEYPAD ===
function NumberKeypad({ value, onChange, onSubmit, onClear, disabled }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; onClear: () => void; disabled: boolean
}) {
  const handleKey = (k: string) => {
    if (disabled) return
    if (value.length < 2) onChange(value + k)
  }
  return (
    <div className="flex gap-1.5 justify-center flex-wrap" style={{ maxWidth: 340 }}>
      {[1,2,3,4,5,6,7,8,9,0].map(n => (
        <motion.button key={n} disabled={disabled}
          className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
          whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.92 }}
          onClick={() => handleKey(String(n))}
        >{n}</motion.button>
      ))}
      <motion.button disabled={disabled}
        className="w-12 h-12 rounded-xl text-xs font-bold disabled:opacity-30"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.15)', color: '#FCA5A5' }}
        whileTap={{ scale: 0.92 }} onClick={onClear}>Sil</motion.button>
      <motion.button disabled={disabled || !value}
        className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30"
        style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.2)', color: '#6EE7B7' }}
        whileTap={{ scale: 0.92 }} onClick={onSubmit}>Gönder ✓</motion.button>
    </div>
  )
}

// === MAIN GAME COMPONENT ===
export default function SayiOrmani({ session, state }: { session: SessionManager; state: SessionState }) {
  const [currentModule, setCurrentModule] = useState<Module>('subitizing')
  const [question, setQuestion] = useState<Question | null>(null)
  const [inputVal, setInputVal] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showItems, setShowItems] = useState(true)
  const [countedItems, setCountedItems] = useState<Set<number>>(new Set())
  const [questionNum, setQuestionNum] = useState(0)
  const [moduleProgress, setModuleProgress] = useState(0)
  const questionsPerModule = 5
  const stimulusShown = useRef(Date.now())

  // Module rotation: every 5 questions, switch module
  const modules: Module[] = ['subitizing', 'counting', 'addition', 'comparison']

  const nextQuestion = useCallback(() => {
    const modIdx = Math.floor(questionNum / questionsPerModule) % modules.length
    const mod = modules[modIdx]
    setCurrentModule(mod)
    const q = generateQuestion(mod, state.difficultyAxes)
    setQuestion(q)
    setInputVal('')
    setFeedback(null)
    setCountedItems(new Set())
    setShowItems(true)
    stimulusShown.current = Date.now()

    // Subitizing: hide items after display time
    if (mod === 'subitizing' && q.displayTimeMs) {
      setTimeout(() => setShowItems(false), q.displayTimeMs)
    }
  }, [questionNum, state.difficultyAxes])

  useEffect(() => { nextQuestion() }, [questionNum])

  const handleSubmit = () => {
    if (!question || feedback) return
    const val = parseInt(inputVal)
    if (isNaN(val)) return

    const rt = Date.now() - stimulusShown.current
    const correct = val === question.answer

    // Record trial in session
    session.recordTrial({
      timestamp: Date.now(),
      trialType: 'math',
      stimulusShownAt: stimulusShown.current,
      responseAt: Date.now(),
      responseTimeMs: rt,
      isCorrect: correct,
      isTarget: true,
      responded: true,
      difficultyAxes: state.difficultyAxes,
      metadata: {
        skillId: `anaokulu_sayi_ormani_${currentModule}`,
        module: currentModule,
        targetCount: question.targetCount,
        answer: val,
        correctAnswer: question.answer,
        groupA: question.groupA,
        groupB: question.groupB,
        strategy: session.getState().trials > 0 ? 'detected_from_rt' : 'unknown',
      },
    })

    setFeedback(correct ? 'correct' : 'wrong')

    setTimeout(() => {
      setFeedback(null)
      setQuestionNum(q => q + 1)
      setModuleProgress(p => p + 1)
    }, correct ? 1200 : 900)
  }

  const handleCountItem = (item: GameItem) => {
    if (item.type === 'distractor' || currentModule === 'subitizing') return
    if (countedItems.has(item.id)) {
      // Double count detection — important pedagogical signal
      session.recordTouch(item.x, item.y, 100)
      return
    }
    setCountedItems(prev => new Set([...prev, item.id]))
    session.recordTouch(item.x, item.y, 150)
  }

  if (!question) return null

  const moduleLabel = {
    subitizing: '👁️ Hızlı Bak ve Say',
    counting: '👆 Dokun ve Say',
    addition: '➕ İki Grubu Topla',
    comparison: '⚖️ Hangisi Daha Çok?',
  }[currentModule]

  const questionText = {
    subitizing: 'Kaç sincap gördün?',
    counting: `Sincaplara dokunarak say! ${countedItems.size > 0 ? `(${countedItems.size} saydın)` : ''}`,
    addition: `Soldaki + Sağdaki = Toplam kaç sincap?`,
    comparison: 'Hangi tarafta daha çok sincap var? Kaç tane?',
  }[currentModule]

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      {/* Module indicator */}
      <div className="flex items-center gap-3 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg"
          style={{ background: 'rgba(52,211,153,0.1)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.15)' }}>
          {moduleLabel}
        </span>
        <span className="text-xs text-white/30">Soru {(questionNum % questionsPerModule) + 1}/{questionsPerModule}</span>
      </div>

      {/* Scene */}
      <div className="w-full max-w-lg rounded-2xl relative overflow-hidden"
        style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(180deg, #0A1628 0%, #0F2840 20%, #103822 45%, #145530 60%, #186838 75%, #1C7A42 88%, #22A050 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.4)',
        }}>
        
        {/* Moon */}
        <div className="absolute top-[7%] right-[8%] w-10 h-10 rounded-full"
          style={{ background: 'radial-gradient(circle at 38% 35%, #FFFDE7, #FFF176, #FFD54F)', boxShadow: '0 0 20px rgba(255,241,118,0.3)' }} />
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-[15%]" style={{ background: 'linear-gradient(180deg, #145828, #0E4420)' }} />
        
        {/* Divider line for addition/comparison */}
        {(currentModule === 'addition' || currentModule === 'comparison') && (
          <div className="absolute top-[10%] bottom-[15%] left-1/2 w-px" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white/20 bg-black/30 px-2 py-0.5 rounded">
              {currentModule === 'addition' ? '+' : 'vs'}
            </div>
          </div>
        )}

        {/* Fireflies */}
        {Array.from({length: 6}, (_, i) => (
          <div key={`ff${i}`} className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              left: `${10+Math.random()*80}%`, top: `${15+Math.random()*50}%`,
              background: 'rgba(253,224,71,0.8)',
              boxShadow: '0 0 4px rgba(253,224,71,0.6)',
              animation: `twinkle ${3+Math.random()*3}s ease-in-out ${Math.random()*3}s infinite alternate`,
            }} />
        ))}

        {/* Animals */}
        <AnimatePresence>
          {showItems && question.items.map((item) => (
            <motion.div key={item.id}
              className={`absolute ${item.type === 'target' ? 'cursor-pointer' : 'cursor-default'}`}
              style={{
                left: `${item.x}%`, top: `${item.y}%`,
                animation: `float ${3 + item.id * 0.3}s ease-in-out infinite`,
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                zIndex: item.type === 'target' ? 5 : 3,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: item.id * 0.05 }}
              onClick={() => handleCountItem(item)}
              whileHover={item.type === 'target' ? { scale: 1.15 } : {}}
            >
              <AnimalSprite animal={item.animal} variant={item.variant} size={item.type === 'target' ? 42 : 34} />
              
              {/* Counted badge */}
              {countedItems.has(item.id) && (
                <motion.div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #34D399, #10B981)', boxShadow: '0 2px 6px rgba(16,185,129,0.5)' }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {[...countedItems].indexOf(item.id) + 1}
                </motion.div>
              )}
              
              {/* Distractor X on hover */}
              {item.type === 'distractor' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/50 flex items-center justify-center text-[8px] text-white opacity-0 hover:opacity-100 transition pointer-events-none">✕</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Subitizing: "items hidden" overlay */}
        {currentModule === 'subitizing' && !showItems && (
          <motion.div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(6,10,26,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center">
              <span className="text-4xl block mb-2">🤔</span>
              <p className="text-white/60 text-sm font-bold">Kaç sincap gördün?</p>
            </div>
          </motion.div>
        )}

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div className="absolute inset-0 flex items-center justify-center z-20"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="text-center">
                <div className="flex justify-center">{feedback === 'correct' ? <CinemaSquirrel size={70} happy /> : <span className="text-7xl block">💫</span>}</div>
                <p className={`text-lg font-bold mt-2 ${feedback === 'correct' ? 'text-green-300' : 'text-orange-300'}`}>
                  {feedback === 'correct' ? 'Harika!' : `Tekrar dene! Cevap: ${question.answer}`}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse, transparent 50%, rgba(0,0,0,0.3) 100%)' }} />
      </div>

      {/* Question Panel */}
      <div className="w-full max-w-lg rounded-xl p-4 text-center"
        style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm font-bold text-green-300 mb-1">🐿️ {questionText}</p>
        
        {currentModule === 'addition' && question.groupA != null && (
          <div className="flex items-center justify-center gap-2 my-2">
            <span className="text-3xl font-black text-white">{question.groupA}</span>
            <span className="text-2xl text-white/40">+</span>
            <span className="text-3xl font-black text-white">{question.groupB}</span>
            <span className="text-2xl text-white/40">=</span>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black"
              style={{
                border: `2px ${inputVal ? 'solid' : 'dashed'} rgba(251,191,36,${inputVal ? '0.6' : '0.3'})`,
                background: inputVal ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.03)',
                color: '#FDE68A',
              }}>
              {inputVal || '?'}
            </div>
          </div>
        )}

        {currentModule !== 'addition' && (
          <div className="flex items-center justify-center gap-2 my-2">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-black"
              style={{
                border: `2.5px ${inputVal ? 'solid' : 'dashed'} rgba(251,191,36,${inputVal ? '0.6' : '0.3'})`,
                background: inputVal ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.03)',
                color: '#FDE68A',
                animation: !inputVal ? 'pulse 2.5s ease infinite' : 'none',
              }}>
              {inputVal || '?'}
            </div>
          </div>
        )}
      </div>

      {/* Number Keypad */}
      <NumberKeypad
        value={inputVal}
        onChange={setInputVal}
        onSubmit={handleSubmit}
        onClear={() => setInputVal('')}
        disabled={!!feedback}
      />
    </div>
  )
}
