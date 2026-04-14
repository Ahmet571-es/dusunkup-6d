/**
 * Profesyonel SVG Çevre Bileşenleri — Detaylı, animasyonlu
 */
import { motion } from 'framer-motion'

// === AĞAÇ — Çok katmanlı, rüzgarda sallanan ===
export function TreeSVG({ size = 80, variant = 0 }: { size?: number; variant?: number }) {
  const palettes = [
    { crown: ['#2D8A4E', '#1D6B37', '#4CAF50'], trunk: '#5D4037' },
    { crown: ['#388E3C', '#2E7D32', '#66BB6A'], trunk: '#6D4C41' },
    { crown: ['#1B5E20', '#2E7D32', '#43A047'], trunk: '#4E342E' },
  ]
  const p = palettes[variant % palettes.length]
  return (
    <motion.svg width={size} height={size * 1.4} viewBox="0 0 70 98">
      <defs>
        <linearGradient id={`trunk_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.trunk} /><stop offset="100%" stopColor="#3E2723" />
        </linearGradient>
        <filter id={`treeSh_${variant}`}><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" /></filter>
      </defs>
      {/* Gövde */}
      <rect x="30" y="55" width="10" height="38" rx="3" fill={`url(#trunk_${variant})`} />
      <rect x="33" y="55" width="3" height="38" rx="1" fill="white" opacity="0.08" />
      {/* Kök */}
      <path d="M28,90 Q25,95 20,96" fill="none" stroke={p.trunk} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M42,90 Q45,95 50,96" fill="none" stroke={p.trunk} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      {/* Yaprak katmanları */}
      <motion.path d={`M35,5 L58,38 L12,38 Z`} fill={p.crown[0]} filter={`url(#treeSh_${variant})`}
        animate={{ d: [`M35,5 L58,38 L12,38 Z`, `M35,3 L59,37 L11,37 Z`] }}
        transition={{ duration: 3 + variant, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
      <path d="M35,18 L55,46 L15,46 Z" fill={p.crown[1]} />
      <path d="M35,30 L52,55 L18,55 Z" fill={p.crown[2]} opacity="0.9" />
      {/* Yaprak parlaması */}
      <circle cx="28" cy="28" r="3" fill="white" opacity="0.06" />
      <circle cx="42" cy="40" r="2" fill="white" opacity="0.04" />
    </motion.svg>
  )
}

// === MANTAR — Benekli, şirin ===
export function MushroomSVG({ size = 35 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <defs>
        <radialGradient id="mushCap" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#F87171" /><stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
      </defs>
      <rect x="18" y="26" width="8" height="16" rx="3" fill="#FAFAF9" stroke="#E7E5E4" strokeWidth="0.5" />
      <rect x="20" y="26" width="3" height="16" rx="1" fill="white" opacity="0.3" />
      <ellipse cx="22" cy="26" rx="18" ry="14" fill="url(#mushCap)" />
      <ellipse cx="22" cy="24" rx="15" ry="11" fill="#EF4444" opacity="0.3" />
      <circle cx="15" cy="20" r="3.5" fill="white" opacity="0.7" />
      <circle cx="26" cy="17" r="2.5" fill="white" opacity="0.6" />
      <circle cx="20" cy="26" r="2" fill="white" opacity="0.5" />
      <circle cx="30" cy="22" r="1.5" fill="white" opacity="0.4" />
      {/* Parlama */}
      <ellipse cx="14" cy="18" rx="2" ry="3" fill="white" opacity="0.15" transform="rotate(-15 14 18)" />
    </svg>
  )
}

// === YILDIZ — Parlayan, çok katmanlı ===
export function StarSVG({ size = 45, filled = true, glowing = false }: { size?: number; filled?: boolean; glowing?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 50 50"
      animate={glowing ? { filter: ['drop-shadow(0 0 4px #FDE68A)', 'drop-shadow(0 0 14px #FBBF24)', 'drop-shadow(0 0 4px #FDE68A)'] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}>
      <defs>
        <linearGradient id="starG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" /><stop offset="50%" stopColor="#FBBF24" /><stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="starGlow"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FBBF24" floodOpacity="0.5" /></filter>
      </defs>
      <path d="M25,3 L31,19 L48,19 L34,29 L39,46 L25,36 L11,46 L16,29 L2,19 L19,19 Z"
        fill={filled ? 'url(#starG)' : 'none'} stroke={filled ? '#D97706' : '#6B7280'} strokeWidth="1.2" filter={filled ? 'url(#starGlow)' : 'none'} />
      {filled && <>
        <path d="M25,7 L29,19 L25,17 L21,19 Z" fill="white" opacity="0.25" />
        <path d="M25,8 L28,17" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
      </>}
    </motion.svg>
  )
}

// === ÇİÇEK — Hafıza Bahçesi için ===
export function FlowerSVG({ color = '#EC4899', size = 40, blooming = false }: { color?: string; size?: number; blooming?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 40 40"
      animate={blooming ? { scale: [0, 1.1, 1] } : {}} transition={{ duration: 0.5 }}>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse key={i} cx="20" cy="12" rx="6" ry="10" fill={color} opacity={0.7 + i * 0.03}
          transform={`rotate(${angle} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="6" fill="#FBBF24" />
      <circle cx="20" cy="20" r="4" fill="#F59E0B" />
      <circle cx="18" cy="18" r="1.5" fill="white" opacity="0.3" />
    </motion.svg>
  )
}
