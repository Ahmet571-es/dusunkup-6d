/**
 * Profesyonel SVG Hayvan Karakterleri — Çok katmanlı, animasyonlu
 */
import { motion } from 'framer-motion'

// === SİNCAP ===
export function SquirrelSVG({ size = 70, happy = false, onClick }: { size?: number; happy?: boolean; onClick?: () => void }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
      animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id="sqBody" cx="45%" cy="40%">
          <stop offset="0%" stopColor="#F0A850" />
          <stop offset="50%" stopColor="#D4883A" />
          <stop offset="100%" stopColor="#B06820" />
        </radialGradient>
        <radialGradient id="sqBelly" cx="50%" cy="35%">
          <stop offset="0%" stopColor="#FDE8C8" />
          <stop offset="100%" stopColor="#E8C090" />
        </radialGradient>
        <filter id="sqSh"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2D1B0E" floodOpacity="0.35" /></filter>
      </defs>
      {/* Kuyruk */}
      <motion.path d="M65,62 Q82,32 76,14 Q72,4 62,10 Q56,16 60,32 Q62,44 64,56" fill="url(#sqBody)" stroke="#A06020" strokeWidth="0.8" filter="url(#sqSh)"
        animate={{ d: ['M65,62 Q82,32 76,14 Q72,4 62,10 Q56,16 60,32 Q62,44 64,56', 'M65,62 Q84,30 77,12 Q73,2 63,8 Q57,14 61,30 Q63,42 64,56'] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }} />
      <path d="M66,60 Q78,36 74,18" fill="none" stroke="#C89848" strokeWidth="2" opacity="0.3" />
      {/* Gövde */}
      <ellipse cx="46" cy="58" rx="20" ry="22" fill="url(#sqBody)" filter="url(#sqSh)" />
      <ellipse cx="46" cy="56" rx="16" ry="17" fill="#E89840" opacity="0.5" />
      {/* Karın */}
      <ellipse cx="46" cy="62" rx="12" ry="14" fill="url(#sqBelly)" />
      <ellipse cx="44" cy="58" rx="5" ry="6" fill="white" opacity="0.08" />
      {/* Kollar */}
      <ellipse cx="28" cy="55" rx="5" ry="10" fill="url(#sqBody)" transform="rotate(-15 28 55)" />
      <ellipse cx="64" cy="55" rx="5" ry="10" fill="url(#sqBody)" transform="rotate(15 64 55)" />
      {/* Kafa */}
      <circle cx="46" cy="32" r="18" fill="url(#sqBody)" filter="url(#sqSh)" />
      <circle cx="46" cy="34" r="14" fill="#E89840" opacity="0.4" />
      {/* Kulaklar */}
      <ellipse cx="32" cy="18" rx="6" ry="9" fill="url(#sqBody)" stroke="#A06020" strokeWidth="0.5" />
      <ellipse cx="32" cy="18" rx="3.5" ry="6" fill="#F5D6A0" />
      <ellipse cx="60" cy="18" rx="6" ry="9" fill="url(#sqBody)" stroke="#A06020" strokeWidth="0.5" />
      <ellipse cx="60" cy="18" rx="3.5" ry="6" fill="#F5D6A0" />
      {/* Gözler — parlak, canlı */}
      <circle cx="38" cy="30" r="5.5" fill="white" />
      <circle cx="54" cy="30" r="5.5" fill="white" />
      <circle cx="39" cy="29.5" r="3.5" fill="url(#sqBody)" />
      <circle cx="55" cy="29.5" r="3.5" fill="url(#sqBody)" />
      <motion.circle cx="39.5" cy="29" r="2.5" fill="#1A0E05"
        animate={happy ? { r: [2.5, 0.5, 2.5] } : {}} transition={{ duration: 0.3 }} />
      <motion.circle cx="55.5" cy="29" r="2.5" fill="#1A0E05"
        animate={happy ? { r: [2.5, 0.5, 2.5] } : {}} transition={{ duration: 0.3 }} />
      {/* Göz parlaması */}
      <circle cx="40.5" cy="27.5" r="1.5" fill="white" opacity="0.9" />
      <circle cx="56.5" cy="27.5" r="1.5" fill="white" opacity="0.9" />
      <circle cx="38" cy="30.5" r="0.7" fill="white" opacity="0.5" />
      <circle cx="54" cy="30.5" r="0.7" fill="white" opacity="0.5" />
      {/* Burun */}
      <ellipse cx="46" cy="37" rx="3.5" ry="2.5" fill="#2D1B0E" />
      <ellipse cx="45" cy="36.5" rx="1" ry="0.7" fill="white" opacity="0.25" />
      {/* Ağız */}
      <path d={happy ? "M40,40 Q46,47 52,40" : "M42,40 Q46,43 50,40"} fill="none" stroke="#2D1B0E" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bıyıklar */}
      <line x1="27" y1="35" x2="37" y2="37" stroke="#C89848" strokeWidth="0.7" opacity="0.5" />
      <line x1="27" y1="38" x2="37" y2="39" stroke="#C89848" strokeWidth="0.7" opacity="0.5" />
      <line x1="65" y1="35" x2="55" y2="37" stroke="#C89848" strokeWidth="0.7" opacity="0.5" />
      <line x1="65" y1="38" x2="55" y2="39" stroke="#C89848" strokeWidth="0.7" opacity="0.5" />
      {/* Ayaklar */}
      <ellipse cx="36" cy="78" rx="8" ry="4" fill="#B06820" />
      <ellipse cx="56" cy="78" rx="8" ry="4" fill="#B06820" />
      <ellipse cx="36" cy="77" rx="6" ry="3" fill="#C89848" opacity="0.4" />
      <ellipse cx="56" cy="77" rx="6" ry="3" fill="#C89848" opacity="0.4" />
      {/* Fındık (mutluyken) */}
      {happy && (
        <motion.g initial={{ scale: 0, y: 5 }} animate={{ scale: 1, y: 0 }}>
          <ellipse cx="46" cy="72" rx="6" ry="5" fill="#8B6341" stroke="#6B4C2A" strokeWidth="0.5" />
          <ellipse cx="46" cy="70" rx="4" ry="3" fill="#A07854" opacity="0.6" />
          <ellipse cx="44" cy="69" rx="1.5" ry="1" fill="white" opacity="0.15" />
        </motion.g>
      )}
    </motion.svg>
  )
}

// === BALIK — Detaylı, yüzen ===
export function FishSVG({ size = 50, direction = 'right', color = '#3B82F6' }: { size?: number; direction?: 'left' | 'right'; color?: string }) {
  const flip = direction === 'left' ? -1 : 1
  // Derive lighter/darker shades
  return (
    <motion.svg width={size} height={size * 0.65} viewBox="0 0 70 42"
      animate={{ y: [0, -1, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`fishBod_${color.replace('#','')}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </radialGradient>
        <filter id="fishSh"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" /></filter>
      </defs>
      <g transform={`scale(${flip},1) translate(${flip === -1 ? -70 : 0},0)`}>
        {/* Gövde */}
        <ellipse cx="30" cy="21" rx="24" ry="15" fill={`url(#fishBod_${color.replace('#','')})`} filter="url(#fishSh)" />
        {/* Karın parlaması */}
        <ellipse cx="28" cy="17" rx="16" ry="8" fill="white" opacity="0.12" />
        {/* Kuyruk */}
        <path d="M52,21 L66,8 L63,21 L66,34 Z" fill={color} opacity="0.85" />
        <path d="M53,21 L62,12 L60,21 L62,30 Z" fill="white" opacity="0.08" />
        {/* Üst yüzgeç */}
        <path d="M24,6 Q30,1 36,8 Q30,10 26,8 Z" fill={color} opacity="0.75" />
        {/* Alt yüzgeç */}
        <path d="M28,34 Q32,38 36,34" fill={color} opacity="0.6" />
        {/* Yan yüzgeç */}
        <ellipse cx="20" cy="24" rx="5" ry="3" fill={color} opacity="0.5" transform="rotate(-20 20 24)" />
        {/* Pullar */}
        {[0,1,2,3,4,5].map(i => (
          <circle key={i} cx={20 + i * 6} cy={16 + (i % 2) * 8} r={1.5 + (i % 3) * 0.5} fill="white" opacity={0.08 + (i % 3) * 0.04} />
        ))}
        {/* Göz */}
        <circle cx="16" cy="17" r="6" fill="white" />
        <circle cx="14.5" cy="16.5" r="4" fill="#1E293B" />
        <circle cx="13" cy="15" r="1.8" fill="white" opacity="0.9" />
        <circle cx="15.5" cy="17.5" r="0.8" fill="white" opacity="0.4" />
        {/* Ağız */}
        <path d="M6,22 Q9,25 6,28" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
        {/* Çizgi deseni */}
        <path d="M18,12 Q30,10 42,14" fill="none" stroke="white" strokeWidth="0.5" opacity="0.08" />
        <path d="M18,26 Q30,28 42,24" fill="none" stroke="white" strokeWidth="0.5" opacity="0.06" />
      </g>
    </motion.svg>
  )
}

// === BAYKUŞ — Göz kırpan, tüylü ===
export function OwlSVG({ size = 80, blinking = true }: { size?: number; blinking?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 90 95"
      animate={{ rotate: [0, 2, -2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id="owlBody" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#9B7B60" /><stop offset="100%" stopColor="#6B4C3B" />
        </radialGradient>
        <radialGradient id="owlEye" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFB347" /><stop offset="100%" stopColor="#E8860C" />
        </radialGradient>
        <filter id="owlSh"><feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3" /></filter>
      </defs>
      {/* Gövde */}
      <ellipse cx="45" cy="60" rx="25" ry="28" fill="url(#owlBody)" filter="url(#owlSh)" />
      {/* Karın tüy deseni */}
      <ellipse cx="45" cy="64" rx="16" ry="20" fill="#D4B896" />
      {[0,1,2,3,4].map(i => (
        <path key={i} d={`M${36 + i * 2},${52 + i * 5} L45,${48 + i * 5} L${54 - i * 2},${52 + i * 5}`} fill="#C4A880" opacity={0.5 - i * 0.08} />
      ))}
      {/* Kanatlar */}
      <path d="M20,48 Q10,58 16,75 Q22,68 24,56 Z" fill="#5A3D2E" />
      <path d="M70,48 Q80,58 74,75 Q68,68 66,56 Z" fill="#5A3D2E" />
      <path d="M22,50 Q14,58 18,70" fill="none" stroke="#7A5D4A" strokeWidth="0.8" opacity="0.4" />
      <path d="M68,50 Q76,58 72,70" fill="none" stroke="#7A5D4A" strokeWidth="0.8" opacity="0.4" />
      {/* Kafa */}
      <circle cx="45" cy="32" r="22" fill="url(#owlBody)" filter="url(#owlSh)" />
      {/* Kulak tüyleri */}
      <path d="M24,16 L28,4 L34,15" fill="#6B4C3B" stroke="#5A3D2E" strokeWidth="0.5" />
      <path d="M66,16 L62,4 L56,15" fill="#6B4C3B" stroke="#5A3D2E" strokeWidth="0.5" />
      <path d="M26,14 L29,6 L32,14" fill="#8B6B56" opacity="0.5" />
      <path d="M64,14 L61,6 L58,14" fill="#8B6B56" opacity="0.5" />
      {/* Göz diskleri */}
      <circle cx="35" cy="30" r="12" fill="#F5E6D3" stroke="#D4C0A8" strokeWidth="0.5" />
      <circle cx="55" cy="30" r="12" fill="#F5E6D3" stroke="#D4C0A8" strokeWidth="0.5" />
      {/* Gözler */}
      <circle cx="35" cy="30" r="7" fill="url(#owlEye)" />
      <circle cx="55" cy="30" r="7" fill="url(#owlEye)" />
      <motion.circle cx="35" cy="30" r="4.5" fill="#1A1A2E"
        animate={blinking ? { ry: [4.5, 0.3, 4.5] } : {}} transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 4 }} />
      <motion.circle cx="55" cy="30" r="4.5" fill="#1A1A2E"
        animate={blinking ? { ry: [4.5, 0.3, 4.5] } : {}} transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 4 }} />
      <circle cx="33" cy="27.5" r="2" fill="white" opacity="0.85" />
      <circle cx="53" cy="27.5" r="2" fill="white" opacity="0.85" />
      <circle cx="36" cy="31" r="0.8" fill="white" opacity="0.4" />
      <circle cx="56" cy="31" r="0.8" fill="white" opacity="0.4" />
      {/* Gaga */}
      <path d="M41,38 L45,45 L49,38 Z" fill="#E8A33C" stroke="#D4903A" strokeWidth="0.8" />
      <path d="M43,39 L45,43 L47,39 Z" fill="#F0B84C" opacity="0.4" />
      {/* Ayaklar */}
      <g fill="#E8A33C" stroke="#D4903A" strokeWidth="0.3">
        <path d="M36,85 L30,93 L34,90 L38,93 L36,85" />
        <path d="M54,85 L48,93 L52,90 L56,93 L54,85" />
      </g>
    </motion.svg>
  )
}

// === BALON — Işıklı, gerçekçi ===
export function BalloonSVG({ color, size = 55 }: { color: string; size?: number }) {
  const id = color.replace('#', '')
  return (
    <motion.svg width={size} height={size * 1.45} viewBox="0 0 50 72"
      animate={{ y: [0, -3, 0], rotate: [0, 1, -1, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`bl_${id}`} cx="35%" cy="28%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="25%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </radialGradient>
        <filter id={`bls_${id}`}>
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={color} floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Gövde */}
      <ellipse cx="25" cy="26" rx="22" ry="26" fill={`url(#bl_${id})`} filter={`url(#bls_${id})`} />
      {/* Ana parlama */}
      <ellipse cx="16" cy="15" rx="8" ry="12" fill="white" opacity="0.2" transform="rotate(-18 16 15)" />
      {/* İkincil parlama */}
      <ellipse cx="13" cy="12" rx="3.5" ry="6" fill="white" opacity="0.15" transform="rotate(-18 13 12)" />
      {/* Alt kenar karartma */}
      <ellipse cx="25" cy="38" rx="18" ry="10" fill="black" opacity="0.06" />
      {/* Düğüm */}
      <path d="M22,51 L25,56 L28,51" fill={color} opacity="0.9" />
      <circle cx="25" cy="52" r="1.5" fill={color} stroke="white" strokeWidth="0.3" opacity="0.5" />
      {/* İp */}
      <motion.path d="M25,56 Q22,62 26,66 Q23,70 25,72" fill="none" stroke={color} strokeWidth="0.7" opacity="0.35" strokeLinecap="round"
        animate={{ d: ['M25,56 Q22,62 26,66 Q23,70 25,72', 'M25,56 Q28,62 24,66 Q27,70 25,72'] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }} />
    </motion.svg>
  )
}
