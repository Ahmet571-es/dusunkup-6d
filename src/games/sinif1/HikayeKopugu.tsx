/**
 * Hikâye Köpüğü — Epizodik Tampon + Anlama-Hesaplama Entegrasyonu
 * Hikâye dinle, sonra matematik sorusu çöz
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OwlSVG, StarSVG } from '@/components/cinema/characters'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

interface Story { text: string; question: string; answer: number; numbers: number[] }

const STORIES: Story[] = [
  { text: '🐿️ Sincap 4 fındık topladı. Sonra 3 fındık daha buldu.', question: 'Toplam kaç fındık var?', answer: 7, numbers: [4,3] },
  { text: '🐰 Tavşan bahçede 6 havuç gördü. 2 tanesini yedi.', question: 'Kaç havuç kaldı?', answer: 4, numbers: [6,2] },
  { text: '🦋 3 kelebek çiçeğe kondu. Sonra 5 kelebek daha geldi.', question: 'Şimdi kaç kelebek var?', answer: 8, numbers: [3,5] },
  { text: '🐸 Kurbağa 8 sinek yakaladı. 3 tanesi kaçtı.', question: 'Kaç sinek kaldı?', answer: 5, numbers: [8,3] },
  { text: '🦉 Ağaçta 2 baykuş vardı. 4 baykuş daha geldi.', question: 'Toplam kaç baykuş oldu?', answer: 6, numbers: [2,4] },
  { text: '🐬 Havuzda 7 balık yüzüyordu. 3 tanesi derine daldı.', question: 'Yüzeyde kaç balık kaldı?', answer: 4, numbers: [7,3] },
  { text: '🦊 Tilki 5 üzüm topladı. Arkadaşı 4 üzüm daha getirdi.', question: 'Toplam kaç üzüm oldu?', answer: 9, numbers: [5,4] },
  { text: '🐻 Ayının sepetinde 9 bal kavanozu vardı. 6 tanesini bitirdi.', question: 'Kaç kavanoz kaldı?', answer: 3, numbers: [9,6] },
]

export default function HikayeKopugu({ session, state }: { session: SessionManager; state: SessionState }) {
  const [story, setStory] = useState<Story | null>(null)
  const [phase, setPhase] = useState<'story' | 'question'>('story')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null)
  const [round, setRound] = useState(0)
  const stimRef = useRef(Date.now())

  useEffect(() => {
    const s = STORIES[round % STORIES.length]
    setStory(s); setPhase('story'); setInput(''); setFeedback(null)
    stimRef.current = Date.now()
    // Auto-transition to question after reading time
    const readTime = 3000 + (state.difficultyAxes.retention_delay || 0) * 500
    setTimeout(() => setPhase('question'), readTime)
  }, [round])

  const handleSubmit = () => {
    if (!story || feedback) return
    const val = parseInt(input); if (isNaN(val)) return
    const correct = val === story.answer

    session.recordTrial({
      timestamp: Date.now(), trialType: 'math', stimulusShownAt: stimRef.current,
      responseAt: Date.now(), responseTimeMs: Date.now() - stimRef.current, isCorrect: correct,
      isTarget: true, responded: true, difficultyAxes: state.difficultyAxes,
      metadata: { skillId: 'sinif1_hikaye_kopugu', storyNumbers: story.numbers, answer: val, correct },
    })

    setFeedback(correct ? 'correct' : 'wrong')
    setTimeout(() => { setFeedback(null); setRound(r => r + 1) }, correct ? 1000 : 800)
  }

  if (!story) return null

  return (
    <div className="flex flex-col items-center justify-center h-full p-3 gap-4">
      <span className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', color: '#FDE68A', border: '1px solid rgba(251,191,36,0.15)' }}>
        📖 {phase === 'story' ? 'Hikâyeyi oku...' : 'Şimdi cevapla!'}
      </span>

      <motion.div className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
        
        <AnimatePresence mode="wait">
          {phase === 'story' ? (
            <motion.div key="story" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-start gap-3 justify-center mb-3">
                <div className="flex-shrink-0"><OwlSVG size={52} /></div>
                <p className="text-lg text-white/80 leading-relaxed text-left">{story.text}</p>
              </div>
              <div className="flex items-center justify-center gap-1">
                {[0,1,2].map(i => (
                  <motion.span key={i} className="w-2 h-2 rounded-full bg-yellow-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="question" className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-lg font-bold text-green-300 mb-4">{story.question}</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black"
                  style={{ border: `2.5px ${input?'solid':'dashed'} rgba(251,191,36,0.4)`, color: '#FDE68A' }}>
                  {input || '?'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {phase === 'question' && (
        <>
          <div className="flex gap-1.5 justify-center flex-wrap" style={{ maxWidth: 340 }}>
            {[1,2,3,4,5,6,7,8,9,0].map(n => (
              <motion.button key={n} disabled={!!feedback} className="w-12 h-12 rounded-xl text-xl font-black text-white/90 disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.92 }}
                onClick={() => !feedback && input.length < 2 && setInput(v => v + n)}>{n}</motion.button>
            ))}
            <motion.button disabled={!!feedback} className="w-12 h-12 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }} onClick={() => setInput('')}>Sil</motion.button>
            <motion.button disabled={!!feedback||!input} className="w-16 h-12 rounded-xl text-xs font-bold disabled:opacity-30"
              style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7' }} onClick={handleSubmit}>Gönder ✓</motion.button>
          </div>
          <AnimatePresence>
            {feedback && <motion.div initial={{scale:0}} animate={{scale:1}} exit={{opacity:0}}>
              <div className="flex justify-center">{feedback==='correct'?<StarSVG size={56} filled glowing />:<span className="text-5xl">💫</span>}</div>
            </motion.div>}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
