import { lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GameShell from '@/games/GameShell'
import GameErrorBoundary from '@/components/shared/GameErrorBoundary'
import { useAppStore } from '@/stores/appStore'
import { getGameDef } from '@/games/gameDefinitions'
import type { SessionManager, SessionState } from '@/engine/assessment/sessionManager'
import type { GradeLevel } from '@/types'

/**
 * Oyun dosyaları sınıfa göre lazy-load ediliyor.
 * Anaokulu çocuğu sadece anaokulu chunk'ını indiriyor (~150KB), 36 oyun değil.
 * Bu, özellikle mobil ve tablet için büyük hız kazanımı.
 */

// ============ ANAOKULU (6 oyun) ============
const SayiOrmani       = lazy(() => import('@/games/anaokulu/SayiOrmani'))
const RenkAdasi        = lazy(() => import('@/games/anaokulu/RenkAdasi'))
const SekilKasabasi    = lazy(() => import('@/games/anaokulu/SekilKasabasi'))
const HafizaBahcesi    = lazy(() => import('@/games/anaokulu/HafizaBahcesi'))
const RitimNehri       = lazy(() => import('@/games/anaokulu/RitimNehri'))
const OruntuGok        = lazy(() => import('@/games/anaokulu/OruntuGok'))

// ============ 1. SINIF ============
const ToplamaCesmesi   = lazy(() => import('@/games/sinif1/ToplamaCesmesi'))
const CikarmaMagarasi  = lazy(() => import('@/games/sinif1/CikarmaMagarasi'))
const DikkatDenizi     = lazy(() => import('@/games/sinif1/DikkatDenizi'))
const SayiYolu         = lazy(() => import('@/games/sinif1/SayiYolu'))
const KuralDegistir    = lazy(() => import('@/games/sinif1/KuralDegistir'))
const HikayeKopugu     = lazy(() => import('@/games/sinif1/HikayeKopugu'))

// ============ 2. SINIF ============
const CarpimBahcesi    = lazy(() => import('@/games/sinif2/CarpimBahcesi'))
const BolmeFabrikasi   = lazy(() => import('@/games/sinif2/BolmeFabrikasi'))
const FlankerOkyanus   = lazy(() => import('@/games/sinif2/FlankerOkyanus'))
const HafizaLabirenti  = lazy(() => import('@/games/sinif2/HafizaLabirenti'))
const ParaPazari       = lazy(() => import('@/games/sinif2/ParaPazari'))
const SaatKulesi       = lazy(() => import('@/games/sinif2/SaatKulesi'))

// ============ 3. SINIF ============
const KesirMutfagi     = lazy(() => import('@/games/sinif3/KesirMutfagi'))
const GeometriKenti    = lazy(() => import('@/games/sinif3/GeometriKenti'))
const StroopSavascisi  = lazy(() => import('@/games/sinif3/StroopSavascisi'))
const CiftGorev        = lazy(() => import('@/games/sinif3/CiftGorev'))
const VeriGolu         = lazy(() => import('@/games/sinif3/VeriGolu'))
const TahminAdasi      = lazy(() => import('@/games/sinif3/TahminAdasi'))

// ============ 4. SINIF ============
const OndalikOkyanus   = lazy(() => import('@/games/sinif4/OndalikOkyanus'))
const AlanCevreKalesi  = lazy(() => import('@/games/sinif4/AlanCevreKalesi'))
const NbackRadari      = lazy(() => import('@/games/sinif4/NbackRadari'))
const StratejiLabi     = lazy(() => import('@/games/sinif4/StratejiLabi'))
const DonusumAtolyesi  = lazy(() => import('@/games/sinif4/DonusumAtolyesi'))
const KodKirici        = lazy(() => import('@/games/sinif4/KodKirici'))

// ============ 5. SINIF ============
const MuhendisIstasyonu = lazy(() => import('@/games/sinif5/MuhendisIstasyonu'))
const VeriBilimLabi     = lazy(() => import('@/games/sinif5/VeriBilimLabi'))
const GelismisNback     = lazy(() => import('@/games/sinif5/GelismisNback'))
const KesifGezegeni     = lazy(() => import('@/games/sinif5/KesifGezegeni'))
const KesirOndalikKopru = lazy(() => import('@/games/sinif5/KesirOndalikKopru'))
const ZamanMakinesi     = lazy(() => import('@/games/sinif5/ZamanMakinesi'))

type GameComp = React.ComponentType<{ session: SessionManager; state: SessionState }>

const GAMES: Record<string, Record<string, GameComp>> = {
  anaokulu: { sayi_ormani: SayiOrmani, renk_adasi: RenkAdasi, sekil_kasabasi: SekilKasabasi, hafiza_bahcesi: HafizaBahcesi, ritim_nehri: RitimNehri, oruntu_gok: OruntuGok },
  sinif1: { toplama_cesmesi: ToplamaCesmesi, cikarma_magarasi: CikarmaMagarasi, dikkat_denizi: DikkatDenizi, sayi_yolu: SayiYolu, kural_degistir: KuralDegistir, hikaye_kopugu: HikayeKopugu },
  sinif2: { carpim_bahcesi: CarpimBahcesi, bolme_fabrikasi: BolmeFabrikasi, flanker_okyanus: FlankerOkyanus, hafiza_labirenti: HafizaLabirenti, para_pazari: ParaPazari, saat_kulesi: SaatKulesi },
  sinif3: { kesir_mutfagi: KesirMutfagi, geometri_kenti: GeometriKenti, stroop_savascisi: StroopSavascisi, cift_gorev: CiftGorev, veri_golu: VeriGolu, tahmin_adasi: TahminAdasi },
  sinif4: { ondalik_okyanus: OndalikOkyanus, alan_cevre_kalesi: AlanCevreKalesi, nback_radari: NbackRadari, strateji_labi: StratejiLabi, donusum_atolyesi: DonusumAtolyesi, kod_kirici: KodKirici },
  sinif5: { muhendis_istasyonu: MuhendisIstasyonu, veri_bilim_labi: VeriBilimLabi, gelismis_nback: GelismisNback, kesif_gezegeni: KesifGezegeni, kesir_ondalik_kopru: KesirOndalikKopru, zaman_makinesi: ZamanMakinesi },
}

/** Oyun yüklenirken gösterilen çocuk dostu yükleme ekranı. */
function GameLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="text-6xl mb-3"
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
          🎮
        </motion.div>
        <p className="text-white/60 text-sm font-bold">Oyun hazırlanıyor...</p>
      </motion.div>
    </div>
  )
}

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const gradeLevel = useAppStore(s => s.child.gradeLevel)

  // Doğrudan URL ile açılan oyunlar için (splash/grade akışını atlayan):
  // gameId formatı "{grade}_{gameKey}" — öne ek olarak kendisi sınıfı belirtiyor.
  // appStore'da gradeLevel yoksa gameId'den çıkar, böylece bütün sınıf oyunları direct URL ile çalışır.
  const VALID_GRADES: GradeLevel[] = ['anaokulu', 'sinif1', 'sinif2', 'sinif3', 'sinif4', 'sinif5']
  const extractedGrade = VALID_GRADES.find(g => gameId?.startsWith(g + '_'))
  const grade: GradeLevel = gradeLevel || extractedGrade || 'anaokulu'
  const gameKey = gameId?.replace(`${grade}_`, '') || ''
  const gameDef = getGameDef(grade, gameKey)
  const GameComponent = GAMES[grade]?.[gameKey]

  if (!gameDef) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
      <div className="text-center">
        <span className="text-6xl block mb-4">🔍</span>
        <p className="text-white text-lg font-bold mb-2">Oyun bulunamadı</p>
        <button onClick={() => navigate('/galaxy')} className="text-blue-400 text-sm hover:underline">← Galaksiye dön</button>
      </div>
    </div>
  )

  return (
    <GameErrorBoundary>
      <GameShell>{(session, state) => GameComponent ? (
        <Suspense fallback={<GameLoader />}>
          <GameComponent session={session} state={state} />
        </Suspense>
      ) : (
        <div className="flex items-center justify-center h-full">
          <motion.div className="max-w-md rounded-3xl p-8 text-center"
            style={{ background: `hsla(${gameDef.hue},50%,15%,0.6)`, border: `1px solid hsla(${gameDef.hue},50%,40%,0.2)` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-7xl block mb-4">{gameDef.emoji}</span>
            <h2 className="text-2xl font-extrabold text-white mb-2">{gameDef.name}</h2>
            <p className="text-white/40 text-sm">Yakında</p>
          </motion.div>
        </div>
      )}</GameShell>
    </GameErrorBoundary>
  )
}
