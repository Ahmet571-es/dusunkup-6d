/**
 * Sinematik Arka Plan Sahneleri
 * Her sınıf/oyun teması için atmosferik arka plan
 */
import { motion } from 'framer-motion'

// === ORMAN (Anaokulu — Sayı Ormanı, Örüntü Gök) ===
export function ForestScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F2318 40%, #162D1A 70%, #1A3520 100%)' }} />
      {/* Moon */}
      <div className="absolute top-8 right-12 w-12 h-12 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #FEF9C3, #FDE68A)', boxShadow: '0 0 40px rgba(253,230,138,0.3), 0 0 80px rgba(253,230,138,0.1)' }} />
      {/* Trees silhouette */}
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 400 120" preserveAspectRatio="none" style={{ height: '25%', opacity: 0.15 }}>
        <path d="M0,120 L0,80 L20,40 L40,80 L45,50 L55,30 L65,55 L70,80 L90,60 L100,35 L110,55 L120,80 L140,50 L155,25 L170,50 L180,80 L200,45 L215,20 L230,50 L240,80 L260,55 L275,30 L290,60 L300,80 L320,40 L335,20 L350,45 L360,80 L380,50 L400,80 L400,120 Z" fill="#0A1A0F" />
      </svg>
      {/* Fireflies */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full"
          style={{ left: `${10 + Math.random() * 80}%`, top: `${30 + Math.random() * 50}%`, background: '#86EFAC', boxShadow: '0 0 8px #86EFAC' }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], x: [0, (Math.random() - 0.5) * 20], y: [0, (Math.random() - 0.5) * 15] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 4 }}
        />
      ))}
    </div>
  )
}

// === OKYANUS (Dikkat oyunları, Flanker, Renk Adası) ===
export function OceanScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #061525 0%, #0C2340 30%, #103555 60%, #154565 80%, #1A5575 100%)' }} />
      {/* Waves */}
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ height: '12%', opacity: 0.08 }}>
        <motion.path d="M0,30 Q50,10 100,30 Q150,50 200,30 Q250,10 300,30 Q350,50 400,30 L400,60 L0,60 Z" fill="#67E8F9"
          animate={{ d: ['M0,30 Q50,10 100,30 Q150,50 200,30 Q250,10 300,30 Q350,50 400,30 L400,60 L0,60 Z', 'M0,30 Q50,50 100,30 Q150,10 200,30 Q250,50 300,30 Q350,10 400,30 L400,60 L0,60 Z'] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
      </svg>
      {/* Light rays */}
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div key={i} className="absolute"
          style={{ left: `${20 + i * 25}%`, top: 0, width: 2, height: '60%', background: 'linear-gradient(180deg, rgba(103,232,249,0.08), transparent)', transform: `rotate(${-5 + i * 5}deg)`, transformOrigin: 'top' }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </div>
  )
}

// === UZAY (Matematik, N-back, Kod Kırıcı) ===
export function SpaceScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, #1A103A 0%, #0A0A1F 50%, #060612 100%)' }} />
      {/* Nebula */}
      <div className="absolute w-60 h-60 rounded-full" style={{ top: '10%', right: '-10%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute w-40 h-40 rounded-full" style={{ bottom: '20%', left: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)', filter: 'blur(30px)' }} />
      {/* Stars */}
      {Array.from({ length: 30 }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: Math.random() > 0.8 ? 2 : 1, height: Math.random() > 0.8 ? 2 : 1,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            background: i % 5 === 0 ? '#93C5FD' : i % 7 === 0 ? '#FDE68A' : '#E2E8F0',
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
        />
      ))}
    </div>
  )
}

// === MUTFAK (Kesir Mutfağı, Para Pazarı) ===
export function KitchenScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1A1210 0%, #201815 40%, #251D18 70%, #2A2220 100%)' }} />
      {/* Warm light */}
      <div className="absolute w-48 h-48 rounded-full" style={{ top: '-10%', left: '30%', background: 'radial-gradient(circle, rgba(251,191,36,0.06), transparent 70%)' }} />
      {/* Steam particles */}
      {Array.from({ length: 4 }, (_, i) => (
        <motion.div key={i} className="absolute w-6 h-6 rounded-full"
          style={{ left: `${30 + i * 12}%`, bottom: '20%', background: 'rgba(255,255,255,0.03)' }}
          animate={{ y: [0, -80], opacity: [0.05, 0], scale: [1, 2] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// === BİLİM LAB (Keşif, Strateji, Mühendis) ===
export function LabScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0A0F1A 0%, #101828 40%, #131E30 70%, #162338 100%)' }} />
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="#67E8F9" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`v${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="#67E8F9" strokeWidth="0.5" />
        ))}
      </svg>
      {/* Data particles */}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div key={i} className="absolute text-[8px] font-mono text-cyan-400/10"
          style={{ left: `${Math.random() * 90}%`, top: `${Math.random() * 90}%` }}
          animate={{ opacity: [0, 0.15, 0], y: [0, -30] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 1.5 }}>
          {['01', '10', 'π', '∑', '√'][i]}
        </motion.div>
      ))}
    </div>
  )
}
