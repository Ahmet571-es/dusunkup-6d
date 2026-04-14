/**
 * Detaylı SVG Çevre Bileşenleri
 */
import { motion } from 'framer-motion'

// === AĞAÇ (orman oyunları) ===
export function TreeSVG({ size = 80, variant = 0 }: { size?: number; variant?: number }) {
  const greens = [['#2D8A4E', '#1D6B37'], ['#3A9D5B', '#2B8549'], ['#228B3B', '#1A7030']]
  const [light, dark] = greens[variant % greens.length]
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 60 78">
      {/* Gövde */}
      <rect x="26" y="50" width="8" height="28" rx="2" fill="#6B4C3B" />
      <rect x="28" y="50" width="3" height="28" rx="1" fill="#7D5D4A" opacity="0.5" />
      {/* Yapraklar (3 katman) */}
      <motion.path d="M30,8 L50,35 L10,35 Z" fill={light} animate={{ d: ['M30,8 L50,35 L10,35 Z', 'M30,6 L51,34 L9,34 Z', 'M30,8 L50,35 L10,35 Z'] }}
        transition={{ duration: 4 + variant, repeat: Infinity, ease: 'easeInOut' }} />
      <path d="M30,18 L48,42 L12,42 Z" fill={dark} />
      <path d="M30,28 L46,50 L14,50 Z" fill={light} opacity="0.9" />
      {/* Yaprak detayları */}
      <circle cx="22" cy="30" r="2" fill="white" opacity="0.08" />
      <circle cx="38" cy="38" r="1.5" fill="white" opacity="0.06" />
    </svg>
  )
}

// === MANTAR (orman dekor) ===
export function MushroomSVG({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="16" y="22" width="8" height="16" rx="3" fill="#F5E6D3" />
      <ellipse cx="20" cy="22" rx="16" ry="12" fill="#EF4444" />
      <ellipse cx="20" cy="20" rx="14" ry="10" fill="#DC2626" />
      <circle cx="14" cy="17" r="3" fill="white" opacity="0.7" />
      <circle cx="24" cy="14" r="2" fill="white" opacity="0.6" />
      <circle cx="18" cy="22" r="1.5" fill="white" opacity="0.5" />
    </svg>
  )
}

// === YILDIZ (ödül) ===
export function StarSVG({ size = 40, filled = true, glowing = false }: { size?: number; filled?: boolean; glowing?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 50 50"
      animate={glowing ? { filter: ['drop-shadow(0 0 4px #FDE68A)', 'drop-shadow(0 0 12px #FDE68A)', 'drop-shadow(0 0 4px #FDE68A)'] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}>
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path d="M25,3 L31,19 L48,19 L34,29 L39,46 L25,36 L11,46 L16,29 L2,19 L19,19 Z"
        fill={filled ? 'url(#starGrad)' : 'none'} stroke={filled ? '#D97706' : '#6B7280'} strokeWidth="1.5" />
      {filled && <path d="M25,8 L29,19 L25,17 L21,19 Z" fill="white" opacity="0.2" />}
    </motion.svg>
  )
}
