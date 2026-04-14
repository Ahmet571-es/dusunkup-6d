/**
 * Hafıza Bahçesi — Çalışma Belleği Oyunu
 * Paradigmalar: Spatial Span (Corsi Block) + N-back + Number-Object Matching
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

const FLOWER_COLORS = ['#EF4444','#3B82F6','#22C55E','#EAB308','#A855F7','#EC4899','#F97316','#06B6D4','#8B5CF6']

interface FlowerCell {
  id: number
  color: string
  isRevealed: boolean
  isMatched: boolean
  value: number | string // number or emoji
}

export default function HafizaBahcesi({ session, state }: { session: SessionManager; state: SessionState }) {
  const [mode, setMode] = useState<'spatial' | 'matching' | 'nback'>('spatial')
  const [grid, setGrid] = useState<FlowerCell[]>([])
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [span, setSpan] = useState(2) // Starting span
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const timersRef = useRef<number[]>([])

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => { timersRef.current.forEach(t => clearTimeout(t)) }
  }, [])

  const safeTimeout = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms) as unknown as number
    timersRef.current.push(t)
    return t
  }

  const difficulty = state.difficultyAxes
  const gridSize = 9 // 3x3 grid

  // Initialize spatial span round
  const startSpatialRound = useCallback(() => {
    setMode('spatial')
    const currentSpan = Math.min(7, span)
    const seq: number[] = []
    while (seq.length < currentSpan) {
      const r = Math.floor(Math.random() * gridSize)
      if (!seq.includes(r)) seq.push(r)
    }
    setSequence(seq)
    setPlayerSequence([])
    
    // Create grid
    const cells: FlowerCell[] = Array.from({ length: gridSize }, (_, i) => ({
      id: i, color: FLOWER_COLORS[i % FLOWER_COLORS.length],
      isRevealed: false, isMatched: false, value: i,
    }))
    setGrid(cells)

    // Show sequence
    setIsShowingSequence(true)
    stimRef.current = Date.now()
    seq.forEach((cellId, idx) => {
      safeTimeout(() => setActiveCell(cellId), (idx + 1) * 800)
      safeTimeout(() => setActiveCell(null), (idx + 1) * 800 + 500)
    })
    safeTimeout(() => {
      setIsShowingSequence(false)
      setActiveCell(null)
    }, (seq.length + 1) * 800)
  }, [span, gridSize])

  // Initialize matching round
  const startMatchingRound = useCallback(() => {
    setMode('matching')
    const pairCount = Math.min(6, 2 + Math.floor(round / 3))
    const values = Array.from({ length: pairCount }, (_, i) => i + 1)
    const pairs = [...values, ...values].sort(() => Math.random() - 0.5)
    
    const cells: FlowerCell[] = pairs.map((v, i) => ({
      id: i, color: FLOWER_COLORS[v % FLOWER_COLORS.length],
      isRevealed: false, isMatched: false, value: v,
    }))
    setGrid(cells)
    setPlayerSequence([])
    stimRef.current = Date.now()
  }, [round])

  useEffect(() => {
    if (round % 3 === 0) startSpatialRound()
    else if (round % 3 === 1) startMatchingRound()
    else startSpatialRound() // nback variant later
  }, [round])

  // Handle spatial span tap
  const handleSpatialTap = (cellId: number) => {
    if (isShowingSequence || feedback) return
    const newSeq = [...playerSequence, cellId]
    setPlayerSequence(newSeq)
    setActiveCell(cellId)
    safeTimeout(() => setActiveCell(null), 200)

    // Check if sequence complete
    if (newSeq.length === sequence.length) {
      const correct = newSeq.every((v, i) => v === sequence[i])
      const rt = Date.now() - stimRef.current
      
      session.recordTrial({
        timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
        responseAt: Date.now(), responseTimeMs: rt, isCorrect: correct,
        isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
        metadata: { skillId: 'anaokulu_hafiza_spatial', span, correct, sequence: sequence.join(','), response: newSeq.join(',') },
      })

      setFeedback(correct ? 'correct' : 'wrong')
      if (correct) setSpan(s => Math.min(7, s + 1))
      else setSpan(s => Math.max(2, s - 1))

      safeTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 1200 : 900)
    }
  }

  // Handle matching tap
  const [firstCard, setFirstCard] = useState<number | null>(null)
  const handleMatchingTap = (cellId: number) => {
    if (feedback || grid[cellId]?.isMatched || grid[cellId]?.isRevealed) return

    const newGrid = [...grid]
    newGrid[cellId] = { ...newGrid[cellId], isRevealed: true }
    setGrid(newGrid)

    if (firstCard === null) {
      setFirstCard(cellId)
    } else {
      const match = grid[firstCard].value === grid[cellId].value
      const rt = Date.now() - stimRef.current

      session.recordTrial({
        timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
        responseAt: Date.now(), responseTimeMs: rt, isCorrect: match,
        isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
        metadata: { skillId: 'anaokulu_hafiza_matching', match, value: grid[cellId].value },
      })

      if (match) {
        newGrid[firstCard] = { ...newGrid[firstCard], isMatched: true }
        newGrid[cellId] = { ...newGrid[cellId], isMatched: true }
        setGrid(newGrid)
        setFirstCard(null)
        stimRef.current = Date.now()
        // Check all matched
        if (newGrid.every(c => c.isMatched)) {
          setFeedback('correct')
          safeTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 1200)
        }
      } else {
        safeTimeout(() => {
          newGrid[firstCard!] = { ...newGrid[firstCard!], isRevealed: false }
          newGrid[cellId] = { ...newGrid[cellId], isRevealed: false }
          setGrid(newGrid)
          setFirstCard(null)
          stimRef.current = Date.now()
        }, 800)
      }
    }
  }

  const modeLabel = mode === 'spatial' ? '🧭 Sırayı Hatırla' : mode === 'matching' ? '🎴 Eşini Bul' : '🔄 Öncekiyle Aynı mı?'

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      <div className="flex items-center gap-3 w-full max-w-sm justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.15)' }}>
          {modeLabel}
        </span>
        {mode === 'spatial' && <span className="text-xs text-white/30">Hafıza: {span} konum</span>}
      </div>

      {/* Garden Grid */}
      <div className="w-full max-w-sm rounded-2xl p-4" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className={`grid gap-2 ${grid.length <= 9 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {grid.map((cell, i) => (
            <motion.div key={cell.id}
              className="aspect-square rounded-xl flex items-center justify-center cursor-pointer relative overflow-hidden"
              style={{
                background: (mode === 'spatial' && activeCell === i) ? `radial-gradient(circle at 40% 40%, ${cell.color}ee, ${cell.color}88)`
                  : (mode === 'matching' && (cell.isRevealed || cell.isMatched)) ? `radial-gradient(circle at 40% 40%, ${cell.color}dd, ${cell.color}77)`
                  : 'rgba(255,255,255,0.06)',
                border: `2px solid ${(activeCell === i || cell.isRevealed) ? cell.color + '60' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: activeCell === i ? `0 0 20px ${cell.color}40` : 'none',
                opacity: cell.isMatched ? 0.5 : 1,
              }}
              whileHover={{ scale: isShowingSequence ? 1 : 1.05 }}
              whileTap={{ scale: 0.92 }}
              animate={{ scale: activeCell === i ? 1.1 : 1 }}
              onClick={() => mode === 'spatial' ? handleSpatialTap(i) : handleMatchingTap(i)}
            >
              {/* Flower icon when revealed */}
              {(mode === 'matching' && (cell.isRevealed || cell.isMatched)) && (
                <motion.span className="text-2xl" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}>
                  {typeof cell.value === 'number' ? ['🌸','🌻','🌷','🌹','🌺','💐'][cell.value - 1] || '🌼' : cell.value}
                </motion.span>
              )}
              {/* Spatial mode: show order number when active */}
              {mode === 'spatial' && activeCell === i && (
                <motion.span className="text-xl font-black text-white" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {sequence.indexOf(i) + 1}
                </motion.span>
              )}
              {/* Player's spatial response indicator */}
              {mode === 'spatial' && !isShowingSequence && playerSequence.includes(i) && (
                <span className="text-sm font-bold text-white/70">{playerSequence.indexOf(i) + 1}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instruction */}
      <p className="text-xs text-white/40 text-center max-w-sm">
        {mode === 'spatial' && isShowingSequence && '🔵 Çiçeklerin parlama sırasını izle...'}
        {mode === 'spatial' && !isShowingSequence && !feedback && '👆 Aynı sırayla çiçeklere dokun!'}
        {mode === 'matching' && !feedback && '🎴 Eşleşen çiçekleri bul!'}
      </p>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            <span className="text-5xl">{feedback === 'correct' ? '🌟' : '💫'}</span>
            <p className={`text-sm font-bold mt-1 ${feedback === 'correct' ? 'text-green-300' : 'text-orange-300'}`}>
              {feedback === 'correct' ? 'Harika!' : 'Tekrar dene!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
