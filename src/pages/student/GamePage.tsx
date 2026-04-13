import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GameShell from '@/games/GameShell'
import { useAppStore } from '@/stores/appStore'
import { getGameDef } from '@/games/gameDefinitions'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

// Anaokulu Games
import { SayiOrmani, RenkAdasi, HafizaBahcesi, OruntuGok } from '@/games/anaokulu'
// Sinif1 Games
import { ToplamaCesmesi, CikarmaMagarasi, DikkatDenizi, SayiYolu, KuralDegistir, HikayeKopugu } from '@/games/sinif1'

const GAME_COMPONENTS: Record<string, Record<string, React.ComponentType<{ session: SessionManager; state: SessionState }>>> = {
  anaokulu: {
    sayi_ormani: SayiOrmani,
    renk_adasi: RenkAdasi,
    hafiza_bahcesi: HafizaBahcesi,
    oruntu_gok: OruntuGok,
  },
  sinif1: {
    toplama_cesmesi: ToplamaCesmesi,
    cikarma_magarasi: CikarmaMagarasi,
    dikkat_denizi: DikkatDenizi,
    sayi_yolu: SayiYolu,
    kural_degistir: KuralDegistir,
    hikaye_kopugu: HikayeKopugu,
  },
}

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const gradeLevel = useAppStore(s => s.child.gradeLevel)

  const grade = gradeLevel || 'anaokulu'
  const gameKey = gameId?.replace(`${grade}_`, '') || ''
  const gameDef = getGameDef(grade, gameKey)
  const GameComponent = GAME_COMPONENTS[grade]?.[gameKey]

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
      {(session: SessionManager, state: SessionState) => {
        if (GameComponent) return <GameComponent session={session} state={state} />

        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <motion.div className="w-full max-w-md rounded-3xl p-8 text-center"
              style={{ background: `linear-gradient(135deg, hsla(${gameDef.hue},50%,20%,0.6), hsla(${gameDef.hue},50%,10%,0.6))`, border: `1px solid hsla(${gameDef.hue},50%,40%,0.2)`, backdropFilter: 'blur(12px)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-7xl block mb-4">{gameDef.emoji}</span>
              <h2 className="text-2xl font-extrabold text-white mb-2">{gameDef.name}</h2>
              <p className="text-white/50 text-sm mb-3">{gameDef.description}</p>
              <p className="text-white/20 text-xs mb-4">Bu oyun yakında eklenecek</p>
              <div className="flex gap-3 justify-center">
                <button className="px-4 py-2 rounded-xl text-sm font-bold bg-green-500/15 border border-green-500/20 text-green-300"
                  onClick={() => session.recordTrial({ timestamp:Date.now(), trialType:'math', stimulusShownAt:Date.now()-2000, responseAt:Date.now(), responseTimeMs:1500, isCorrect:true, isTarget:true, responded:true, difficultyAxes:state.difficultyAxes, metadata:{skillId:`${grade}_${gameDef.id}_demo`} })}>✅ Doğru</button>
                <button className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white/50"
                  onClick={() => session.recordTrial({ timestamp:Date.now(), trialType:'math', stimulusShownAt:Date.now()-2000, responseAt:Date.now(), responseTimeMs:3000, isCorrect:false, isTarget:true, responded:true, difficultyAxes:state.difficultyAxes, metadata:{skillId:`${grade}_${gameDef.id}_demo`} })}>❌ Yanlış</button>
              </div>
            </motion.div>
          </div>
        )
      }}
    </GameShell>
  )
}
