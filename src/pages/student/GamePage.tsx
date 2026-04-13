import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GameShell from '@/games/GameShell'
import GameErrorBoundary from '@/components/shared/GameErrorBoundary'
import { useAppStore } from '@/stores/appStore'
import { getGameDef } from '@/games/gameDefinitions'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'

// All game imports
import { SayiOrmani, RenkAdasi, SekilKasabasi, HafizaBahcesi, RitimNehri, OruntuGok } from '@/games/anaokulu'
import { ToplamaCesmesi, CikarmaMagarasi, DikkatDenizi, SayiYolu, KuralDegistir, HikayeKopugu } from '@/games/sinif1'
import { CarpimBahcesi, BolmeFabrikasi, FlankerOkyanus, HafizaLabirenti, ParaPazari, SaatKulesi } from '@/games/sinif2'
import { KesirMutfagi, GeometriKenti, StroopSavascisi, CiftGorev, VeriGolu, TahminAdasi } from '@/games/sinif3'
import { OndalikOkyanus, AlanCevreKalesi, NbackRadari, StratejiLabi, DonusumAtolyesi, KodKirici } from '@/games/sinif4'
import { MuhendisIstasyonu, VeriBilimLabi, GelismisNback, KesifGezegeni, KesirOndalikKopru, ZamanMakinesi } from '@/games/sinif5'

type GameComp = React.ComponentType<{ session: SessionManager; state: SessionState }>
const GAMES: Record<string, Record<string, GameComp>> = {
  anaokulu: { sayi_ormani: SayiOrmani, renk_adasi: RenkAdasi, sekil_kasabasi: SekilKasabasi, hafiza_bahcesi: HafizaBahcesi, ritim_nehri: RitimNehri, oruntu_gok: OruntuGok },
  sinif1: { toplama_cesmesi: ToplamaCesmesi, cikarma_magarasi: CikarmaMagarasi, dikkat_denizi: DikkatDenizi, sayi_yolu: SayiYolu, kural_degistir: KuralDegistir, hikaye_kopugu: HikayeKopugu },
  sinif2: { carpim_bahcesi: CarpimBahcesi, bolme_fabrikasi: BolmeFabrikasi, flanker_okyanus: FlankerOkyanus, hafiza_labirenti: HafizaLabirenti, para_pazari: ParaPazari, saat_kulesi: SaatKulesi },
  sinif3: { kesir_mutfagi: KesirMutfagi, geometri_kenti: GeometriKenti, stroop_savascisi: StroopSavascisi, cift_gorev: CiftGorev, veri_golu: VeriGolu, tahmin_adasi: TahminAdasi },
  sinif4: { ondalik_okyanus: OndalikOkyanus, alan_cevre_kalesi: AlanCevreKalesi, nback_radari: NbackRadari, strateji_labi: StratejiLabi, donusum_atolyesi: DonusumAtolyesi, kod_kirici: KodKirici },
  sinif5: { muhendis_istasyonu: MuhendisIstasyonu, veri_bilim_labi: VeriBilimLabi, gelismis_nback: GelismisNback, kesif_gezegeni: KesifGezegeni, kesir_ondalik_kopru: KesirOndalikKopru, zaman_makinesi: ZamanMakinesi },
}

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const gradeLevel = useAppStore(s => s.child.gradeLevel)
  const grade = gradeLevel || 'anaokulu'
  const gameKey = gameId?.replace(`${grade}_`, '') || ''
  const gameDef = getGameDef(grade, gameKey)
  const GameComponent = GAMES[grade]?.[gameKey]

  if (!gameDef) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
      <div className="text-center"><span className="text-6xl block mb-4">🔍</span><p className="text-white text-lg font-bold mb-2">Oyun bulunamadı</p>
      <button onClick={() => navigate('/galaxy')} className="text-blue-400 text-sm hover:underline">← Galaksiye dön</button></div>
    </div>
  )

  return (
    <GameErrorBoundary>
    <GameShell>{(session, state) => GameComponent
      ? <GameComponent session={session} state={state} />
      : <div className="flex items-center justify-center h-full"><motion.div className="max-w-md rounded-3xl p-8 text-center" style={{background:`hsla(${gameDef.hue},50%,15%,0.6)`,border:`1px solid hsla(${gameDef.hue},50%,40%,0.2)`}} initial={{opacity:0}} animate={{opacity:1}}>
          <span className="text-7xl block mb-4">{gameDef.emoji}</span><h2 className="text-2xl font-extrabold text-white mb-2">{gameDef.name}</h2><p className="text-white/40 text-sm">Yakında</p>
        </motion.div></div>
    }</GameShell>
    </GameErrorBoundary>
  )
}
