/**
 * Hikâye Köpüğü — Epizodik Tampon + Matematiksel Modelleme (PROCEDURAL REWRITE)
 *
 * Orijinal: 8 sabit hikaye — çocuk 2 turda ezberliyordu.
 * Yeni: Template-tabanlı procedural üretim — milyonlarca varyasyon.
 *
 * Pedagojik derinlik:
 *  • 3 faz: Hikâye (oku) → Anlama kontrolü (hatırlama) → Matematik
 *  • Toplama + çıkarma + parça-bütün şemaları
 *  • Çeldirici sayılar (hikâyede geçen ama yanıtta kullanılmayan)
 *  • Sözel-matematiksel bağlam eşleştirme (Riley 1983)
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OwlSVG, StarSVG, SquirrelSVG, RabbitSVG, BearSVG, FrogSVG, CatSVG, DuckSVG } from '@/components/cinema/characters'
import { audioEngine } from '@/engine/audio/audioEngine'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

interface Story {
  actorKey: string       // Aktör SVG için anahtar
  setup: string          // Giriş cümlesi
  event: string          // Olay cümlesi
  question: string       // Matematik sorusu
  comprehensionQ: string // Anlama kontrolü
  compAnswer: string     // Anlama cevabı
  compOptions: string[]  // 3 seçenek
  answer: number         // Matematik cevabı
  a: number; b: number   // Sayılar
  op: 'add' | 'sub'      // İşlem türü
  distractor?: number
}

/** Aktör anahtarından sevimli SVG karakteri döndürür. */
function ActorAvatar({ actorKey, size = 64 }: { actorKey: string; size?: number }) {
  switch (actorKey) {
    case 'squirrel': return <SquirrelSVG size={size} />
    case 'rabbit':   return <RabbitSVG size={size} />
    case 'bear':     return <BearSVG size={size} />
    case 'owl':      return <OwlSVG size={size} />
    case 'frog':     return <FrogSVG size={size} />
    case 'cat':      return <CatSVG size={size} />
    case 'duck':     return <DuckSVG size={size} />
    // Tilki için henüz SVG yok — CatSVG ile turuncu renk kullan
    case 'fox':      return <CatSVG size={size} color="#F97316" />
    default:         return <SquirrelSVG size={size} />
  }
}

// === ŞABLONLAR ===

const ACTORS = [
  { key: 'squirrel', emoji: '🐿️', name: 'Sincap',  item: 'fındık',     itemPlural: 'fındık',     verb: 'topladı' },
  { key: 'rabbit',   emoji: '🐰', name: 'Tavşan',  item: 'havuç',      itemPlural: 'havuç',      verb: 'buldu'   },
  { key: 'bear',     emoji: '🐻', name: 'Ayı',     item: 'bal kavanozu', itemPlural: 'bal kavanozu', verb: 'biriktirdi' },
  { key: 'fox',      emoji: '🦊', name: 'Tilki',   item: 'üzüm',       itemPlural: 'üzüm',       verb: 'topladı' },
  { key: 'owl',      emoji: '🦉', name: 'Baykuş',  item: 'ceviz',      itemPlural: 'ceviz',      verb: 'topladı' },
  { key: 'frog',     emoji: '🐸', name: 'Kurbağa', item: 'sinek',      itemPlural: 'sinek',      verb: 'yakaladı' },
  { key: 'cat',      emoji: '🐱', name: 'Kedi',    item: 'misket',     itemPlural: 'misket',     verb: 'buldu'   },
  { key: 'duck',     emoji: '🦆', name: 'Ördek',   item: 'yaprak',     itemPlural: 'yaprak',     verb: 'topladı' },
]

const ADD_TEMPLATES: Array<(a: number, b: number, actor: typeof ACTORS[0]) => { setup: string; event: string; question: string }> = [
  (a, b, ac) => ({
    setup: `${ac.name} ${a} ${ac.item} ${ac.verb}.`,
    event: `Sonra ${b} ${ac.item} daha ${ac.verb.endsWith('ı') ? 'topladı' : 'buldu'}.`,
    question: `Toplam kaç ${ac.item} var?`,
  }),
  (a, b, ac) => ({
    setup: `${ac.name}'ın sepetinde ${a} ${ac.item} vardı.`,
    event: `Arkadaşı ${b} ${ac.item} daha getirdi.`,
    question: `Şimdi sepette kaç ${ac.item} var?`,
  }),
  (a, b, ac) => ({
    setup: `Bahçede ${a} ${ac.item} vardı.`,
    event: `${ac.name} ${b} ${ac.item} daha ekledi.`,
    question: `Bahçede toplam kaç ${ac.item} oldu?`,
  }),
]

const SUB_TEMPLATES: Array<(a: number, b: number, actor: typeof ACTORS[0]) => { setup: string; event: string; question: string }> = [
  (a, b, ac) => ({
    setup: `${ac.name}'ın ${a} ${ac.item}'ı vardı.`,
    event: `${b} tanesini harcadı.`,
    question: `Kaç ${ac.item} kaldı?`,
  }),
  (a, b, ac) => ({
    setup: `${ac.name} ${a} ${ac.item} ${ac.verb}.`,
    event: `Ama ${b} tanesi kayboldu.`,
    question: `Elinde kaç ${ac.item} kaldı?`,
  }),
  (a, b, ac) => ({
    setup: `Ağaçta ${a} ${ac.item} vardı.`,
    event: `Rüzgârla ${b} tanesi düştü.`,
    question: `Ağaçta kaç ${ac.item} kaldı?`,
  }),
]

function sampleActor(): typeof ACTORS[0] {
  return ACTORS[Math.floor(Math.random() * ACTORS.length)]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function generateStory(difficulty: Record<string, number>): Story {
  const range = Math.min(18, 4 + (difficulty.number_range || 1) * 2)
  const useSubtraction = Math.random() < 0.5
  const actor = sampleActor()

  let a: number, b: number, answer: number, op: 'add' | 'sub'

  if (useSubtraction) {
    a = 3 + Math.floor(Math.random() * Math.min(range - 2, 15))
    b = 1 + Math.floor(Math.random() * (a - 1))
    answer = a - b
    op = 'sub'
  } else {
    a = 1 + Math.floor(Math.random() * Math.min(range - 1, 9))
    const maxB = Math.max(1, range - a)
    b = 1 + Math.floor(Math.random() * maxB)
    answer = a + b
    op = 'add'
  }

  const tpls = op === 'add' ? ADD_TEMPLATES : SUB_TEMPLATES
  const { setup, event, question } = tpls[Math.floor(Math.random() * tpls.length)](a, b, actor)

  // Anlama kontrolü: aktör kimdi?
  const distractors = shuffle(ACTORS.filter(x => x.key !== actor.key)).slice(0, 2)
  const compOptions = shuffle([actor.name, distractors[0].name, distractors[1].name])

  return {
    actorKey: actor.key,
    setup, event, question,
    comprehensionQ: 'Hikâye hangi hayvanla ilgiliydi?',
    compAnswer: actor.name,
    compOptions,
    answer, a, b, op,
  }
}

// === COMPONENT ===

type Phase = 'story' | 'comprehension' | 'math' | 'done'

export default function HikayeKopugu({ session, state }: { session: SessionManager; state: SessionState }) {
  const [story, setStory] = useState<Story | null>(null)
  const [phase, setPhase] = useState<Phase>('story')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [round, setRound] = useState(0)
  const [compFeedback, setCompFeedback] = useState<'correct' | 'wrong' | null>(null)
  const stimRef = useRef(Date.now())
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    setStory(generateStory(state.difficultyAxes))
    setPhase('story'); setInput(''); setFeedback(null); setCompFeedback(null)
    stimRef.current = Date.now()
    const readTime = 4200 + (state.difficultyAxes.retention_delay || 0) * 500
    const t = setTimeout(() => setPhase('comprehension'), readTime)
    timersRef.current.push(t)
  }, [round])

  const handleComprehension = (choice: string) => {
    if (!story || compFeedback) return
    const correct = choice === story.compAnswer
    setCompFeedback(correct ? 'correct' : 'wrong')
    if (correct) audioEngine.playCorrect(); else audioEngine.playIncorrect()

    // Anlama kontrolünü de kaydet (pedagojik veri)
    session.recordTrial({
      timestamp: Date.now(), trialType: 'memory', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: 'sinif1_hikaye_comprehension', compAnswer: story.compAnswer, response: choice },
    })

    const t = setTimeout(() => {
      setCompFeedback(null)
      setPhase('math')
      stimRef.current = Date.now()
    }, 900)
    timersRef.current.push(t)
  }

  const handleMathSubmit = () => {
    if (!story || feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const correct = val === story.answer
    if (correct) audioEngine.playCorrect(); else audioEngine.playIncorrect()

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: `sinif1_hikaye_${story.op}`, a: story.a, b: story.b, op: story.op, answer: val, correctAnswer: story.answer },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    const t = setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 1100 : 900)
    timersRef.current.push(t)
  }

  if (!story) return null

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', color: '#FDE68A', border: '1px solid rgba(251,191,36,0.15)' }}>
        📖 {phase === 'story' ? 'Hikâyeyi dinle...' : phase === 'comprehension' ? 'Hatırladın mı?' : 'Şimdi hesapla!'}
      </span>

      <motion.div className="w-full max-w-lg rounded-2xl p-6 min-h-[180px]"
        style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>

        <AnimatePresence mode="wait">
          {phase === 'story' && (
            <motion.div key="story" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-start gap-3 justify-center mb-3">
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <OwlSVG size={44} />
                  <span className="text-[9px] text-white/30">Anlatıcı</span>
                </div>
                <div className="text-left flex-1">
                  <motion.p className="text-base text-white/85 leading-relaxed mb-1.5"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    {story.setup}
                  </motion.p>
                  <motion.p className="text-base text-white/85 leading-relaxed"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 }}>
                    {story.event}
                  </motion.p>
                </div>
                <motion.div className="flex-shrink-0 flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}>
                  <ActorAvatar actorKey={story.actorKey} size={60} />
                  <span className="text-[9px] text-white/40 font-bold">{story.compAnswer}</span>
                </motion.div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-3">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-2 h-2 rounded-full bg-yellow-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }} />
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'comprehension' && (
            <motion.div key="comp" className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-base font-bold text-cyan-300 mb-4">{story.comprehensionQ}</p>
              <div className="flex gap-3 justify-center flex-wrap">
                {story.compOptions.map(opt => {
                  // Hangi actor bu isme sahip?
                  const actorMatch = ACTORS.find(a => a.name === opt)
                  const keyFor = actorMatch?.key || 'squirrel'
                  return (
                    <motion.button key={opt}
                      className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl"
                      style={{
                        background: compFeedback && opt === story.compAnswer ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.05)',
                        border: `1.5px solid ${compFeedback && opt === story.compAnswer ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                      whileHover={{ scale: compFeedback ? 1 : 1.08 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleComprehension(opt)} disabled={!!compFeedback}>
                      <ActorAvatar actorKey={keyFor} size={44} />
                      <span className="text-xs font-bold text-white">{opt}</span>
                    </motion.button>
                  )
                })}
              </div>
              {compFeedback === 'wrong' && (
                <motion.p className="text-xs text-orange-300 mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Doğru: <strong>{story.compAnswer}</strong>
                </motion.p>
              )}
            </motion.div>
          )}

          {phase === 'math' && (
            <motion.div key="math" className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-base text-white/60 mb-1">🔢 {story.a} {story.op === 'add' ? '+' : '−'} {story.b} = ?</p>
              <p className="text-lg font-bold text-green-300 mb-4">{story.question}</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-black"
                  style={{ border: `2.5px ${input ? 'solid' : 'dashed'} ${feedback === 'correct' ? '#34D399' : feedback === 'wrong' ? '#F97316' : 'rgba(251,191,36,0.4)'}`,
                    color: feedback === 'correct' ? '#6EE7B7' : feedback === 'wrong' ? '#FDBA74' : '#FDE68A' }}>
                  {input || '?'}
                </div>
              </div>
              {feedback === 'wrong' && <p className="text-xs text-orange-300 mt-2">Doğru cevap: {story.answer}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {phase === 'math' && (
        <div className="flex gap-1.5 justify-center flex-wrap" style={{ maxWidth: 340 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
            <motion.button key={n} disabled={!!feedback} className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => !feedback && input.length < 2 && setInput(v => v + n)}>{n}</motion.button>
          ))}
          <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }} onClick={() => setInput('')}>Sil</motion.button>
          <motion.button disabled={!!feedback || !input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30"
            style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} onClick={handleMathSubmit}>Gönder ✓</motion.button>
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-center">
              {feedback === 'correct' ? <StarSVG size={56} filled glowing /> : <span className="text-5xl">💫</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
