import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GameShell from '@/games/GameShell'
import { useAppStore } from '@/stores/appStore'
import { getGameDef } from '@/games/gameDefinitions'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const gradeLevel = useAppStore(s => s.child.gradeLevel)

  const grade = gradeLevel || 'anaokulu'
  const gameKey = gameId?.replace(`${grade}_`, '') || ''
  const gameDef = getGameDef(grade, gameKey)

  if (!gameDef) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
        <div className="text-center">
          <span className="text-6xl block mb-4">🔍</span>
          <p className="text-white text-lg font-bold mb-2">Oyun bulunamadı</p>
          <button onClick={() => navigate('/galaxy')} className="text-blue-400 text-sm hover:underline">← Galaksiye dön</button>
        </div>
      </div>
    )
  }

  return (
    <GameShell>
      {(session: SessionManager, state: SessionState) => (
        <div className="flex flex-col items-center justify-center h-full p-6">
          {/* Game placeholder — will be replaced with actual game components in Faz 4-9 */}
          <motion.div
            className="w-full max-w-lg rounded-3xl p-8 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, hsla(${gameDef.hue},50%,20%,0.6), hsla(${gameDef.hue},50%,10%,0.6))`,
              border: `1px solid hsla(${gameDef.hue},50%,40%,0.2)`,
              backdropFilter: 'blur(12px)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-7xl block mb-4">{gameDef.emoji}</span>
            <h2 className="text-2xl font-extrabold text-white mb-2">{gameDef.name}</h2>
            <p className="text-white/50 text-sm mb-4">{gameDef.description}</p>

            <div className="bg-black/20 rounded-2xl p-4 mb-4">
              <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Bilimsel Paradigma</div>
              <div className="text-sm font-bold text-white/80">{gameDef.paradigm}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-black/20 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase">Modüller</div>
                <div className="text-xs text-white/70 mt-1">{gameDef.modules.length} modül</div>
              </div>
              <div className="bg-black/20 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase">Zorluk Ekseni</div>
                <div className="text-xs text-white/70 mt-1">{gameDef.difficultyAxes.length} eksen</div>
              </div>
            </div>

            {/* Module list */}
            <div className="text-left mb-4">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Modüller</div>
              {gameDef.modules.map((m, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: `hsla(${gameDef.hue},50%,50%,0.3)`, color: `hsl(${gameDef.hue},70%,70%)` }}>
                    {i + 1}
                  </div>
                  <span className="text-xs text-white/70">{m}</span>
                </div>
              ))}
            </div>

            {/* Session info */}
            <div className="flex items-center justify-center gap-4 text-xs text-white/40">
              <span>⏱ {gameDef.sessionMinutes} dakika</span>
              <span>📊 {state.trials} deneme</span>
              <span>✅ %{state.trials > 0 ? Math.round((state.correctTrials/state.trials)*100) : 0}</span>
            </div>

            {/* Demo interaction */}
            <div className="mt-6">
              <p className="text-white/30 text-[10px] mb-3">Faz 4-9'da gerçek oyun mekanikleri burada olacak</p>
              <div className="flex gap-3 justify-center">
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                  style={{ background: `hsla(${gameDef.hue},50%,50%,0.3)`, color: 'white', border: `1px solid hsla(${gameDef.hue},50%,50%,0.2)` }}
                  onClick={() => {
                    session.recordTrial({
                      timestamp: Date.now(), trialType: 'math', stimulusShownAt: Date.now() - 2000,
                      responseAt: Date.now(), responseTimeMs: 1500 + Math.random() * 1500,
                      isCorrect: true, isTarget: true, responded: true,
                      difficultyAxes: state.difficultyAxes, metadata: { skillId: `${gameDef.id}_demo` },
                    })
                  }}
                >✅ Doğru Simüle</button>
                <button
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90 bg-white/5 border border-white/10 text-white/60"
                  onClick={() => {
                    session.recordTrial({
                      timestamp: Date.now(), trialType: 'math', stimulusShownAt: Date.now() - 2000,
                      responseAt: Date.now(), responseTimeMs: 3000 + Math.random() * 2000,
                      isCorrect: false, isTarget: true, responded: true,
                      difficultyAxes: state.difficultyAxes, metadata: { skillId: `${gameDef.id}_demo` },
                    })
                  }}
                >❌ Yanlış Simüle</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </GameShell>
  )
}
