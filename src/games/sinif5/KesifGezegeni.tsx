/**
 * Keşif Gezegeni — Bilimsel Yöntem + Değişken Kontrolü
 * 4 Faz: Gözlem → Hipotez → Deney Tasarımı → Sonuç
 * Bağımsız/bağımlı/kontrol değişken ayrımı
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

type SciPhase = 'observe' | 'hypothesis' | 'design' | 'conclude'

interface Experiment {
  title: string; observation: string; hypothesis: string
  variables: { name: string; type: 'independent' | 'dependent' | 'controlled' }[]
  independentVar: string; dependentVar: string
  question: string; correctIdx: number; options: string[]
  conclusion: string
}

const EXPERIMENTS: Experiment[] = [
  {
    title: '🌱 Bitki Büyümesi', observation: 'Pencere kenarındaki bitkiler daha uzun.',
    hypothesis: 'Işık miktarı arttıkça bitkiler daha hızlı büyür.',
    variables: [{ name: 'Işık miktarı', type: 'independent' }, { name: 'Büyüme hızı', type: 'dependent' }, { name: 'Su miktarı', type: 'controlled' }, { name: 'Toprak tipi', type: 'controlled' }],
    independentVar: 'Işık miktarı', dependentVar: 'Büyüme hızı',
    question: 'Değiştirmemiz gereken (bağımsız) değişken hangisi?', correctIdx: 0, options: ['Işık miktarı', 'Su miktarı', 'Toprak tipi', 'Saksı boyutu'],
    conclusion: 'Işık arttıkça bitkiler daha hızlı büyüdü. Hipotez doğrulandı!'
  },
  {
    title: '🔵 Top Sıçraması', observation: 'Farklı toplar farklı yüksekliklere sıçrıyor.',
    hypothesis: 'Top materyali sıçrama yüksekliğini etkiler.',
    variables: [{ name: 'Top materyali', type: 'independent' }, { name: 'Sıçrama yüksekliği', type: 'dependent' }, { name: 'Bırakma yüksekliği', type: 'controlled' }, { name: 'Zemin tipi', type: 'controlled' }],
    independentVar: 'Top materyali', dependentVar: 'Sıçrama yüksekliği',
    question: 'Sabit tutmamız gereken (kontrol) değişken hangisi?', correctIdx: 2, options: ['Top materyali', 'Sıçrama yüksekliği', 'Bırakma yüksekliği', 'Top rengi'],
    conclusion: 'Lastik top en yükseğe sıçradı. Materyal sıçramayı etkiliyor!'
  },
  {
    title: '🧊 Buz Erimesi', observation: 'Mutfaktaki buz bahçedekinden daha yavaş eriyor.',
    hypothesis: 'Sıcaklık arttıkça buz daha hızlı erir.',
    variables: [{ name: 'Sıcaklık', type: 'independent' }, { name: 'Erime süresi', type: 'dependent' }, { name: 'Buz miktarı', type: 'controlled' }, { name: 'Kap tipi', type: 'controlled' }],
    independentVar: 'Sıcaklık', dependentVar: 'Erime süresi',
    question: 'Ölçtüğümüz (bağımlı) değişken hangisi?', correctIdx: 1, options: ['Sıcaklık', 'Erime süresi', 'Buz miktarı', 'Su hacmi'],
    conclusion: 'Sıcak ortamda buz daha hızlı eridi. Hipotez doğrulandı!'
  },
  {
    title: '📏 Rampa Deneyi', observation: 'Dik rampadan araba daha hızlı iniyor.',
    hypothesis: 'Rampa açısı arttıkça araba daha hızlı gider.',
    variables: [{ name: 'Rampa açısı', type: 'independent' }, { name: 'Arabanın hızı', type: 'dependent' }, { name: 'Araba ağırlığı', type: 'controlled' }, { name: 'Zemin tipi', type: 'controlled' }],
    independentVar: 'Rampa açısı', dependentVar: 'Arabanın hızı',
    question: 'Değiştirmemiz gereken (bağımsız) değişken hangisi?', correctIdx: 0, options: ['Rampa açısı', 'Arabanın hızı', 'Araba ağırlığı', 'Rampa uzunluğu'],
    conclusion: 'Açı arttıkça hız arttı. Yerçekimi etkisi doğrulandı!'
  },
]

export default function KesifGezegeni({ session, state }: { session: SessionManager; state: SessionState }) {
  const [exp, setExp] = useState(EXPERIMENTS[0])
  const [phase, setPhase] = useState<SciPhase>('observe')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())
  const timersRef = useRef<number[]>([])
  useEffect(() => { return () => { timersRef.current.forEach(t => clearTimeout(t)) } }, [])
  const safeTimeout = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms) as unknown as number; timersRef.current.push(t); return t }

  useEffect(() => {
    setExp(EXPERIMENTS[round % EXPERIMENTS.length])
    setPhase('observe'); setFeedback(null); stimRef.current = Date.now()
    // Auto-advance phases
    safeTimeout(() => setPhase('hypothesis'), 3000)
    safeTimeout(() => setPhase('design'), 6000)
  }, [round])

  const handleAnswer = (idx: number) => {
    if (feedback) return; const correct = idx === exp.correctIdx

    session.recordTrial({ timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current, responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct, isTarget: true, responded: true, difficultyAxes: state.difficultyAxes, metadata: { skillId: `sinif5_kesif_${exp.title}`, phase: 'design', correct } })

    if (correct) {
      setFeedback('correct')
      safeTimeout(() => { setPhase('conclude') }, 800)
      safeTimeout(() => { setFeedback(null); setRound(r => r + 1) }, 3000)
    } else {
      setFeedback('wrong')
      safeTimeout(() => setFeedback(null), 700)
    }
  }

  const phaseLabels: Record<SciPhase, string> = { observe: '👁️ Gözlem', hypothesis: '💭 Hipotez', design: '🔬 Deney', conclude: '📝 Sonuç' }
  const phaseColors: Record<SciPhase, string> = { observe: '#3B82F6', hypothesis: '#A855F7', design: '#22C55E', conclude: '#F59E0B' }

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-3">
      {/* Phase indicator */}
      <div className="flex items-center gap-2 w-full max-w-lg justify-between">
        <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: `${phaseColors[phase]}15`, color: phaseColors[phase], border: `1px solid ${phaseColors[phase]}30` }}>
          🔭 {phaseLabels[phase]}
        </span>
        <div className="flex gap-1.5">
          {(['observe', 'hypothesis', 'design', 'conclude'] as SciPhase[]).map((p, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full transition-all"
              style={{ background: phase === p ? phaseColors[p] : p === 'conclude' && phase !== 'conclude' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.7)', border: `1px solid ${phaseColors[phase]}15` }}>
        <h3 className="text-lg font-bold text-white mb-2">{exp.title}</h3>

        <AnimatePresence mode="wait">
          {phase === 'observe' && (
            <motion.div key="obs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-blue-300/70">👁️ Gözlem: {exp.observation}</p>
              <p className="text-xs text-white/30 mt-2 animate-pulse">Gözlemi oku...</p>
            </motion.div>
          )}
          {phase === 'hypothesis' && (
            <motion.div key="hyp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-purple-300/70">💭 Hipotez: "{exp.hypothesis}"</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                {exp.variables.map((v, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded-md font-bold"
                    style={{ background: v.type === 'independent' ? 'rgba(52,211,153,0.1)' : v.type === 'dependent' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', color: v.type === 'independent' ? '#6EE7B7' : v.type === 'dependent' ? '#93C5FD' : '#94A3B8', border: `1px solid ${v.type === 'independent' ? 'rgba(52,211,153,0.2)' : v.type === 'dependent' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                    {v.name} ({v.type === 'independent' ? 'değiştir' : v.type === 'dependent' ? 'ölç' : 'sabit tut'})
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          {phase === 'design' && (
            <motion.div key="des" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-green-300 font-bold mb-3">{exp.question}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {exp.options.map((opt, i) => (
                  <motion.button key={i} className="px-5 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(52,211,153,0.3)' }} whileTap={{ scale: 0.92 }}
                    onClick={() => handleAnswer(i)}>{opt}</motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {phase === 'conclude' && (
            <motion.div key="con" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="text-sm text-yellow-300/80">📝 {exp.conclusion}</p>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap justify-center text-[10px]">
                <span className="px-2 py-1 rounded bg-green-500/10 text-green-300">🟢 Bağımsız: {exp.independentVar}</span>
                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300">🔵 Bağımlı: {exp.dependentVar}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{feedback && <motion.span className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>{feedback === 'correct' ? '🌟' : '💫'}</motion.span>}</AnimatePresence>
    </div>
  )
}
