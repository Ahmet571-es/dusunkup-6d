/**
 * Detaylı SVG Hayvan Karakterleri — Çocuk dostu, animasyonlu
 */
import { motion } from 'framer-motion'

// === SİNCAP (Sayı Ormanı maskotu) ===
export function SquirrelSVG({ size = 60, happy = false }: { size?: number; happy?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 80 80" animate={happy ? { y: [0, -5, 0] } : {}} transition={{ duration: 0.5 }}>
      {/* Kuyruk */}
      <motion.path d="M58,55 Q72,30 65,15 Q60,5 50,12 Q45,18 50,30 Q52,40 55,48" fill="#C2722A" stroke="#A0601F" strokeWidth="1.5"
        animate={happy ? { d: 'M58,55 Q75,25 68,10 Q62,0 52,8 Q47,15 52,28 Q54,38 55,48' } : {}} transition={{ duration: 0.4 }} />
      {/* Gövde */}
      <ellipse cx="40" cy="52" rx="18" ry="20" fill="#D4883A" />
      <ellipse cx="40" cy="50" rx="14" ry="15" fill="#E8A84C" />
      {/* Karın */}
      <ellipse cx="40" cy="56" rx="10" ry="12" fill="#F5D6A0" />
      {/* Kafa */}
      <circle cx="40" cy="28" r="16" fill="#D4883A" />
      <circle cx="40" cy="30" r="13" fill="#E8A84C" />
      {/* Kulaklar */}
      <ellipse cx="28" cy="18" rx="5" ry="7" fill="#D4883A" stroke="#C2722A" strokeWidth="1" />
      <ellipse cx="28" cy="18" rx="3" ry="5" fill="#F5D6A0" />
      <ellipse cx="52" cy="18" rx="5" ry="7" fill="#D4883A" stroke="#C2722A" strokeWidth="1" />
      <ellipse cx="52" cy="18" rx="3" ry="5" fill="#F5D6A0" />
      {/* Gözler */}
      <motion.g animate={happy ? {} : {}}>
        <circle cx="34" cy="27" r="4" fill="white" />
        <circle cx="46" cy="27" r="4" fill="white" />
        <motion.circle cx="35" cy="27" r="2.5" fill="#2D1B0E"
          animate={happy ? { cy: [27, 25, 27] } : {}} transition={{ duration: 0.3 }} />
        <motion.circle cx="47" cy="27" r="2.5" fill="#2D1B0E"
          animate={happy ? { cy: [27, 25, 27] } : {}} transition={{ duration: 0.3 }} />
        {/* Işık yansıması */}
        <circle cx="36" cy="25.5" r="1" fill="white" />
        <circle cx="48" cy="25.5" r="1" fill="white" />
      </motion.g>
      {/* Burun */}
      <ellipse cx="40" cy="33" rx="3" ry="2" fill="#2D1B0E" />
      {/* Ağız */}
      <motion.path d={happy ? "M36,36 Q40,42 44,36" : "M37,37 Q40,39 43,37"} fill="none" stroke="#2D1B0E" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bıyıklar */}
      <line x1="25" y1="32" x2="33" y2="33" stroke="#A0601F" strokeWidth="0.8" />
      <line x1="25" y1="35" x2="33" y2="35" stroke="#A0601F" strokeWidth="0.8" />
      <line x1="55" y1="32" x2="47" y2="33" stroke="#A0601F" strokeWidth="0.8" />
      <line x1="55" y1="35" x2="47" y2="35" stroke="#A0601F" strokeWidth="0.8" />
      {/* Fındık (mutluyken) */}
      {happy && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
          <ellipse cx="40" cy="65" rx="5" ry="4" fill="#8B6341" />
          <ellipse cx="40" cy="63" rx="3" ry="2" fill="#A07854" />
        </motion.g>
      )}
    </motion.svg>
  )
}

// === BALIK (Okyanus/Flanker) ===
export function FishSVG({ size = 50, direction = 'right', color = '#3B82F6' }: { size?: number; direction?: 'left' | 'right'; color?: string }) {
  const flip = direction === 'left' ? -1 : 1
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36">
      <g transform={`scale(${flip}, 1) translate(${flip === -1 ? -60 : 0}, 0)`}>
        {/* Gövde */}
        <ellipse cx="28" cy="18" rx="22" ry="14" fill={color} opacity="0.9" />
        <ellipse cx="26" cy="16" rx="18" ry="10" fill={color} opacity="0.5" />
        {/* Kuyruk */}
        <path d="M48,18 L60,6 L58,18 L60,30 Z" fill={color} opacity="0.8" />
        {/* Yüzgeç (üst) */}
        <path d="M22,4 Q28,0 32,6 Q28,8 24,6 Z" fill={color} opacity="0.7" />
        {/* Göz */}
        <circle cx="16" cy="15" r="5" fill="white" />
        <circle cx="14" cy="14.5" r="3" fill="#1E293B" />
        <circle cx="13" cy="13.5" r="1.2" fill="white" />
        {/* Ağız */}
        <path d="M6,19 Q8,22 6,25" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
        {/* Pullar */}
        <circle cx="24" cy="14" r="2" fill="white" opacity="0.15" />
        <circle cx="30" cy="18" r="2.5" fill="white" opacity="0.1" />
        <circle cx="22" cy="22" r="1.5" fill="white" opacity="0.12" />
        <circle cx="34" cy="14" r="1.8" fill="white" opacity="0.1" />
      </g>
    </svg>
  )
}

// === BAYKUŞ (Müdahale maskotu) ===
export function OwlSVG({ size = 70, blinking = false }: { size?: number; blinking?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 80 80">
      {/* Gövde */}
      <ellipse cx="40" cy="52" rx="22" ry="24" fill="#6B4C3B" />
      <ellipse cx="40" cy="54" rx="18" ry="20" fill="#8B6B56" />
      {/* Karın deseni */}
      <ellipse cx="40" cy="58" rx="12" ry="14" fill="#C9A882" />
      <path d="M34,50 L40,46 L46,50 L40,55 Z" fill="#B8956C" opacity="0.5" />
      <path d="M34,55 L40,51 L46,55 L40,60 Z" fill="#B8956C" opacity="0.4" />
      <path d="M34,60 L40,56 L46,60 L40,65 Z" fill="#B8956C" opacity="0.3" />
      {/* Kanatlar */}
      <path d="M18,42 Q10,50 15,65 Q20,60 22,50 Z" fill="#5A3D2E" />
      <path d="M62,42 Q70,50 65,65 Q60,60 58,50 Z" fill="#5A3D2E" />
      {/* Kafa */}
      <circle cx="40" cy="28" r="20" fill="#8B6B56" />
      {/* Kulak tüyleri */}
      <path d="M22,15 L25,5 L30,14" fill="#6B4C3B" />
      <path d="M58,15 L55,5 L50,14" fill="#6B4C3B" />
      {/* Göz diskleri */}
      <circle cx="32" cy="26" r="10" fill="#F5E6D3" />
      <circle cx="48" cy="26" r="10" fill="#F5E6D3" />
      {/* Gözler */}
      <motion.g>
        <circle cx="32" cy="26" r="6" fill="#FFA500" />
        <motion.circle cx="32" cy="26" r={blinking ? 0.5 : 4} fill="#1A1A2E"
          animate={blinking ? { r: [4, 0.5, 4] } : {}} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }} />
        <circle cx="30" cy="24" r="1.5" fill="white" />
      </motion.g>
      <motion.g>
        <circle cx="48" cy="26" r="6" fill="#FFA500" />
        <motion.circle cx="48" cy="26" r={blinking ? 0.5 : 4} fill="#1A1A2E"
          animate={blinking ? { r: [4, 0.5, 4] } : {}} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }} />
        <circle cx="46" cy="24" r="1.5" fill="white" />
      </motion.g>
      {/* Gaga */}
      <path d="M37,32 L40,38 L43,32 Z" fill="#E8A33C" stroke="#D4903A" strokeWidth="0.5" />
      {/* Ayaklar */}
      <g fill="#E8A33C">
        <path d="M32,72 L28,78 L32,76 L36,78 L32,72" />
        <path d="M48,72 L44,78 L48,76 L52,78 L48,72" />
      </g>
    </motion.svg>
  )
}

// === BALON (Renk Adası — detaylı) ===
export function BalloonSVG({ color, size = 52 }: { color: string; size?: number }) {
  const lighten = color + '80'
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 50 70">
      <defs>
        <radialGradient id={`bg_${color.replace('#','')}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="40%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </radialGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={color} floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Balon gövde */}
      <ellipse cx="25" cy="26" rx="22" ry="26" fill={`url(#bg_${color.replace('#','')})`} filter="url(#shadow)" />
      {/* Parlama */}
      <ellipse cx="17" cy="17" rx="7" ry="10" fill="white" opacity="0.2" transform="rotate(-15 17 17)" />
      <ellipse cx="15" cy="14" rx="3" ry="5" fill="white" opacity="0.15" transform="rotate(-15 15 14)" />
      {/* Alt uç */}
      <path d="M22,50 L25,55 L28,50" fill={color} />
      {/* İp */}
      <path d="M25,55 Q23,60 26,65 Q24,68 25,70" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  )
}
