/**
 * Ultra-Gerçekçi Sinematik Arka Planlar — Level 5
 * 3 paralaks katman, volumetrik ışık, sis, gerçekçi parçacıklar
 */
import { motion } from 'framer-motion'

// ═══════════════════ ORMAN ═══════════════════
export function ForestScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 75% 15%, rgba(40,60,100,0.3) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(20,50,30,0.4) 0%, transparent 40%), linear-gradient(180deg, #040810 0%, #081418 15%, #0A1E18 30%, #0E2818 50%, #123420 65%, #184028 80%, #1E4830 92%, #225030 100%)' }} />
      {/* Ay + halo */}
      <div className="absolute top-[6%] right-[10%]">
        <div className="w-20 h-20 rounded-full absolute -inset-4" style={{ background: 'radial-gradient(circle, rgba(253,230,138,0.08) 0%, transparent 70%)', filter: 'blur(15px)' }} />
        <div className="w-12 h-12 rounded-full relative" style={{ background: 'radial-gradient(circle at 35% 30%, #FFFDE7, #FFF176, #FFD54F)', boxShadow: '0 0 30px rgba(255,241,118,0.25), 0 0 60px rgba(255,241,118,0.1)' }}>
          <div className="absolute w-2 h-2 rounded-full top-3 left-4" style={{ background: 'rgba(200,180,100,0.15)' }} />
          <div className="absolute w-1.5 h-1.5 rounded-full top-5 left-2" style={{ background: 'rgba(200,180,100,0.1)' }} />
        </div>
      </div>
      {/* Yıldızlar */}
      {Array.from({ length: 35 }, (_, i) => (
        <motion.div key={`s${i}`} className="absolute rounded-full" style={{
          width: i%7===0 ? 2.5 : i%3===0 ? 1.5 : 1, height: i%7===0 ? 2.5 : i%3===0 ? 1.5 : 1,
          left: `${(i*17+7)%95}%`, top: `${(i*13+3)%30}%`,
          background: i%11===0 ? '#FDE68A' : i%7===0 ? '#BAE6FD' : '#E2E8F0',
        }} animate={{ opacity: [0.1,0.7,0.1] }} transition={{ duration: 2+(i%5), repeat: Infinity, delay: (i%8)*0.6 }} />
      ))}
      {/* 3 paralaks ağaç siluet */}
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 400 150" preserveAspectRatio="none" style={{ height: '35%' }}>
        <path d="M0,150 L0,90 L15,55 L30,85 L40,60 L55,35 L65,58 L75,85 L90,50 L110,30 L125,55 L140,80 L155,45 L170,25 L185,50 L200,78 L215,42 L230,22 L245,48 L260,75 L275,40 L290,28 L305,55 L320,82 L335,48 L350,30 L365,55 L380,78 L395,50 L400,85 L400,150 Z" fill="#0A1A0F" opacity="0.2" />
        <path d="M0,150 L0,95 L20,60 L35,90 L50,65 L60,42 L75,65 L85,88 L100,55 L115,38 L130,62 L145,85 L160,52 L175,32 L190,58 L205,82 L220,50 L240,35 L255,55 L270,80 L285,48 L300,30 L315,58 L330,85 L345,52 L365,38 L380,60 L400,90 L400,150 Z" fill="#0E2212" opacity="0.35" />
        <path d="M0,150 L0,105 L25,75 L40,100 L55,78 L70,55 L85,80 L95,98 L110,70 L125,52 L140,78 L155,95 L170,65 L185,48 L200,72 L215,92 L230,62 L250,50 L265,70 L280,90 L295,60 L310,45 L325,68 L340,88 L360,62 L380,50 L395,75 L400,95 L400,150 Z" fill="#122818" opacity="0.5" />
      </svg>
      {/* Sis */}
      <motion.div className="absolute w-full h-[30%] bottom-[10%]" style={{ background: 'linear-gradient(0deg, rgba(20,50,30,0.12), transparent)', filter: 'blur(20px)' }}
        animate={{ opacity: [0.3,0.5,0.3] }} transition={{ duration: 8, repeat: Infinity }} />
      {/* Zemin */}
      <div className="absolute bottom-0 left-0 right-0 h-[12%]" style={{ background: 'linear-gradient(180deg, #163020, #0E2418, #0A1C12)' }} />
      {/* Ateşböcekleri */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div key={`ff${i}`} className="absolute rounded-full" style={{
          width: 3+(i%3), height: 3+(i%3), left: `${8+(i*11)%84}%`, top: `${35+(i*7)%40}%`,
          background: 'radial-gradient(circle, #ECFCCB, #86EFAC)', boxShadow: '0 0 6px #86EFAC, 0 0 12px rgba(134,239,172,0.3)',
        }} animate={{ opacity: [0,0.8,0.3,0.9,0], x: [0,(i%2===0?15:-15),(i%2===0?-10:10),0], y: [0,-10,-5,-18,-8] }}
          transition={{ duration: 4+(i%3)*1.5, repeat: Infinity, delay: i*0.7, ease: 'easeInOut' }} />
      ))}
      {/* Volumetrik ışık */}
      <div className="absolute top-0 right-[15%] w-[2px] h-[45%]" style={{ background: 'linear-gradient(180deg, rgba(253,230,138,0.06), transparent)', transform: 'rotate(-8deg)', transformOrigin: 'top' }} />
      <div className="absolute top-0 right-[22%] w-[1px] h-[35%]" style={{ background: 'linear-gradient(180deg, rgba(253,230,138,0.04), transparent)', transform: 'rotate(-12deg)', transformOrigin: 'top' }} />
    </div>
  )
}

// ═══════════════════ OKYANUS ═══════════════════
export function OceanScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(20,60,90,0.3) 0%, transparent 60%), linear-gradient(180deg, #040A18 0%, #081830 20%, #0C2845 40%, #103858 60%, #144868 80%, #185878 100%)' }} />
      {/* Caustic ışık deseni */}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div key={`caus${i}`} className="absolute rounded-full" style={{
          width: 40+i*20, height: 40+i*20, left: `${10+i*18}%`, top: `${20+i*10}%`,
          background: 'radial-gradient(circle, rgba(103,232,249,0.04), transparent 70%)', filter: 'blur(8px)',
        }} animate={{ opacity: [0.2,0.5,0.2], scale: [1,1.1,1] }}
          transition={{ duration: 4+i, repeat: Infinity, delay: i*0.8 }} />
      ))}
      {/* Işık huzmeleri */}
      {Array.from({ length: 4 }, (_, i) => (
        <motion.div key={`ray${i}`} className="absolute" style={{
          left: `${15+i*20}%`, top: 0, width: 2, height: '55%',
          background: 'linear-gradient(180deg, rgba(103,232,249,0.06), transparent)', transform: `rotate(${-8+i*5}deg)`, transformOrigin: 'top',
        }} animate={{ opacity: [0.2,0.5,0.2] }} transition={{ duration: 3+i, repeat: Infinity, delay: i*0.5 }} />
      ))}
      {/* Dalgalar — çift katman */}
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ height: '12%' }}>
        <motion.path d="M0,30 Q50,10 100,30 Q150,50 200,30 Q250,10 300,30 Q350,50 400,30 L400,60 L0,60 Z" fill="#67E8F9" opacity="0.06"
          animate={{ d: ['M0,30 Q50,10 100,30 Q150,50 200,30 Q250,10 300,30 Q350,50 400,30 L400,60 L0,60 Z','M0,30 Q50,50 100,30 Q150,10 200,30 Q250,50 300,30 Q350,10 400,30 L400,60 L0,60 Z'] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
      </svg>
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 400 40" preserveAspectRatio="none" style={{ height: '8%', opacity: 0.04 }}>
        <motion.path d="M0,20 Q60,5 120,20 Q180,35 240,20 Q300,5 360,20 L400,20 L400,40 L0,40 Z" fill="#A5F3FC"
          animate={{ d: ['M0,20 Q60,5 120,20 Q180,35 240,20 Q300,5 360,20 L400,20 L400,40 L0,40 Z','M0,20 Q60,35 120,20 Q180,5 240,20 Q300,35 360,20 L400,20 L400,40 L0,40 Z'] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
      </svg>
      {/* Kabarcıklar */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div key={`bub${i}`} className="absolute rounded-full" style={{
          width: 4+i*2, height: 4+i*2, left: `${15+i*13}%`, bottom: '10%',
          border: '1px solid rgba(103,232,249,0.15)', background: 'rgba(103,232,249,0.03)',
        }} animate={{ y: [0,-120-i*20], opacity: [0.4,0], scale: [1,0.5] }}
          transition={{ duration: 5+i, repeat: Infinity, delay: i*1.2, ease: 'easeOut' }} />
      ))}
    </div>
  )
}

// ═══════════════════ UZAY ═══════════════════
export function SpaceScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, #1A103A 0%, #0A0A1F 50%, #060612 100%)' }} />
      {/* Nebula */}
      <div className="absolute w-72 h-72 rounded-full" style={{ top: '5%', right: '-15%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute w-48 h-48 rounded-full" style={{ bottom: '15%', left: '-8%', background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)', filter: 'blur(30px)' }} />
      <motion.div className="absolute w-36 h-36 rounded-full" style={{ top: '40%', left: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.04), transparent 70%)', filter: 'blur(25px)' }}
        animate={{ opacity: [0.5,0.8,0.5], scale: [1,1.05,1] }} transition={{ duration: 6, repeat: Infinity }} />
      {/* Yıldızlar */}
      {Array.from({ length: 50 }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{
          width: i%9===0 ? 2.5 : i%4===0 ? 1.5 : 1, height: i%9===0 ? 2.5 : i%4===0 ? 1.5 : 1,
          left: `${(i*19+3)%98}%`, top: `${(i*23+7)%95}%`,
          background: i%5===0 ? '#93C5FD' : i%7===0 ? '#FDE68A' : i%11===0 ? '#C4B5FD' : '#E2E8F0',
          boxShadow: i%9===0 ? `0 0 4px ${i%5===0?'rgba(147,197,253,0.4)':'rgba(253,230,138,0.3)'}` : 'none',
        }} animate={{ opacity: [0.15,0.8,0.15] }}
          transition={{ duration: 2+i%4, repeat: Infinity, delay: (i%10)*0.4 }} />
      ))}
      {/* Galaksi tozu */}
      <div className="absolute top-[20%] left-[10%] right-[10%] h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.05), rgba(147,197,253,0.04), transparent)', filter: 'blur(3px)' }} />
    </div>
  )
}

// ═══════════════════ MUTFAK ═══════════════════
export function KitchenScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 40% 20%, rgba(60,40,20,0.3) 0%, transparent 50%), linear-gradient(180deg, #1A1210 0%, #201815 40%, #251D18 70%, #2A2220 100%)' }} />
      {/* Sıcak ışık */}
      <div className="absolute w-56 h-56 rounded-full" style={{ top: '-12%', left: '28%', background: 'radial-gradient(circle, rgba(251,191,36,0.08), rgba(251,146,36,0.03), transparent 70%)' }} />
      {/* Tezgah yansıması */}
      <div className="absolute bottom-0 left-0 right-0 h-[20%]" style={{ background: 'linear-gradient(0deg, rgba(60,40,20,0.15), transparent)' }} />
      {/* Buhar */}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ left: `${28+i*10}%`, bottom: '18%', width: 8+i*3, height: 8+i*3, background: 'rgba(255,255,255,0.02)' }}
          animate={{ y: [0,-90], opacity: [0.04,0], scale: [1,2.5] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: i*1, ease: 'easeOut' }} />
      ))}
    </div>
  )
}

// ═══════════════════ BİLİM LAB ═══════════════════
export function LabScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 30%, rgba(20,40,60,0.3) 0%, transparent 50%), linear-gradient(180deg, #0A0F1A 0%, #101828 40%, #131E30 70%, #162338 100%)' }} />
      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
        {Array.from({ length: 20 }, (_, i) => <line key={`h${i}`} x1="0" y1={`${i*5}%`} x2="100%" y2={`${i*5}%`} stroke="#67E8F9" strokeWidth="0.5" />)}
        {Array.from({ length: 20 }, (_, i) => <line key={`v${i}`} x1={`${i*5}%`} y1="0" x2={`${i*5}%`} y2="100%" stroke="#67E8F9" strokeWidth="0.5" />)}
      </svg>
      {/* Hologram ışık */}
      <motion.div className="absolute w-32 h-32 rounded-full" style={{ top: '10%', right: '10%', background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)', filter: 'blur(15px)' }}
        animate={{ opacity: [0.3,0.6,0.3], scale: [1,1.05,1] }} transition={{ duration: 4, repeat: Infinity }} />
      {/* Veri parçacıkları */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div key={i} className="absolute text-[8px] font-mono text-cyan-400/10"
          style={{ left: `${(i*17+5)%90}%`, top: `${(i*23+10)%85}%` }}
          animate={{ opacity: [0,0.15,0], y: [0,-30] }}
          transition={{ duration: 3, repeat: Infinity, delay: i*1.2 }}>
          {['01','10','π','∑','√','λ'][i]}
        </motion.div>
      ))}
    </div>
  )
}
