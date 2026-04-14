/**
 * Profesyonel SVG Hayvan Karakterleri v2 — Sinematik Kalite
 * useId() ile gradient/filter çakışması yok
 * 5+ katman gradient, nefes/idle animasyonu, göz parlaması, gölge derinliği
 */
import { useId } from 'react'
import { motion } from 'framer-motion'

// ─────────────────────────── SİNCAP ───────────────────────────
export function SquirrelSVG({ size = 70, happy = false, onClick }: { size?: number; happy?: boolean; onClick?: () => void }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
      animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`sqB${u}`} cx="42%" cy="38%">
          <stop offset="0%" stopColor="#F8C070" /><stop offset="30%" stopColor="#F0A850" />
          <stop offset="60%" stopColor="#D4883A" /><stop offset="100%" stopColor="#A06020" />
        </radialGradient>
        <radialGradient id={`sqV${u}`} cx="48%" cy="32%">
          <stop offset="0%" stopColor="#FFF5E8" /><stop offset="40%" stopColor="#FDE8C8" /><stop offset="100%" stopColor="#E0B878" />
        </radialGradient>
        <filter id={`sqS${u}`}><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2D1B0E" floodOpacity="0.35" /></filter>
      </defs>
      <ellipse cx="46" cy="92" rx="18" ry="4" fill="#1A0E05" opacity="0.15" />
      {/* Kuyruk — dalga */}
      <motion.path d="M65,62 Q82,32 76,14 Q72,4 62,10 Q56,16 60,32 Q62,44 64,56" fill={`url(#sqB${u})`} stroke="#8B5A18" strokeWidth="0.6" filter={`url(#sqS${u})`}
        animate={{ d: ['M65,62 Q82,32 76,14 Q72,4 62,10 Q56,16 60,32 Q62,44 64,56', 'M65,62 Q84,30 77,12 Q73,2 63,8 Q57,14 61,30 Q63,42 64,56'] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }} />
      <path d="M66,58 Q78,34 74,18" fill="none" stroke="#D4A048" strokeWidth="2.5" opacity="0.2" />
      <path d="M67,56 Q76,38 73,22" fill="none" stroke="#F0C868" strokeWidth="1" opacity="0.1" />
      {/* Gövde */}
      <ellipse cx="46" cy="58" rx="20" ry="22" fill={`url(#sqB${u})`} filter={`url(#sqS${u})`} />
      <ellipse cx="44" cy="54" rx="12" ry="14" fill="#F0B050" opacity="0.2" />
      {/* Karın */}
      <ellipse cx="46" cy="62" rx="13" ry="15" fill={`url(#sqV${u})`} />
      <ellipse cx="43" cy="57" rx="5" ry="7" fill="white" opacity="0.06" />
      {/* Kürk dokusu */}
      {[0,1,2].map(i => <path key={`f${i}`} d={`M${33+i*5},${54+i*4} Q${36+i*5},${50+i*4} ${39+i*5},${54+i*4}`} fill="none" stroke="#C89040" strokeWidth="0.4" opacity="0.15" />)}
      {/* Kollar */}
      <ellipse cx="28" cy="56" rx="5.5" ry="11" fill={`url(#sqB${u})`} transform="rotate(-15 28 56)" />
      <ellipse cx="64" cy="56" rx="5.5" ry="11" fill={`url(#sqB${u})`} transform="rotate(15 64 56)" />
      {/* Kafa — nefes */}
      <motion.circle cx="46" cy="32" r="18" fill={`url(#sqB${u})`} filter={`url(#sqS${u})`}
        animate={{ r: [18, 18.3, 18] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      <circle cx="46" cy="34" r="14" fill="#E89840" opacity="0.3" />
      {/* Kulaklar — iç tüy */}
      <ellipse cx="32" cy="18" rx="6.5" ry="10" fill={`url(#sqB${u})`} stroke="#905818" strokeWidth="0.4" />
      <ellipse cx="32" cy="18" rx="3.8" ry="6.5" fill="#F5D6A0" />
      <ellipse cx="32" cy="17" rx="2" ry="4" fill="#F0C880" opacity="0.3" />
      <ellipse cx="60" cy="18" rx="6.5" ry="10" fill={`url(#sqB${u})`} stroke="#905818" strokeWidth="0.4" />
      <ellipse cx="60" cy="18" rx="3.8" ry="6.5" fill="#F5D6A0" />
      <ellipse cx="60" cy="17" rx="2" ry="4" fill="#F0C880" opacity="0.3" />
      {/* Gözler — çok katmanlı */}
      <circle cx="38" cy="30" r="6" fill="white" />
      <circle cx="54" cy="30" r="6" fill="white" />
      <circle cx="38.5" cy="29.5" r="3.8" fill="#2A1508" />
      <circle cx="54.5" cy="29.5" r="3.8" fill="#2A1508" />
      <motion.circle cx="39" cy="29" r="2.8" fill="#0A0500"
        animate={happy ? { r: [2.8, 0.4, 2.8] } : { r: [2.8, 2.6, 2.8] }} transition={{ duration: happy ? 0.3 : 3, repeat: happy ? 0 : Infinity }} />
      <motion.circle cx="55" cy="29" r="2.8" fill="#0A0500"
        animate={happy ? { r: [2.8, 0.4, 2.8] } : { r: [2.8, 2.6, 2.8] }} transition={{ duration: happy ? 0.3 : 3, repeat: happy ? 0 : Infinity }} />
      {/* Göz parlaması — çift */}
      <circle cx="40.5" cy="27.5" r="1.8" fill="white" opacity="0.92" />
      <circle cx="56.5" cy="27.5" r="1.8" fill="white" opacity="0.92" />
      <circle cx="37.5" cy="30.5" r="0.8" fill="white" opacity="0.45" />
      <circle cx="53.5" cy="30.5" r="0.8" fill="white" opacity="0.45" />
      {/* Kaş (mutlu) */}
      {happy && <>
        <path d="M34,25 Q38,23 42,25" fill="none" stroke="#7A4A18" strokeWidth="0.8" opacity="0.3" />
        <path d="M50,25 Q54,23 58,25" fill="none" stroke="#7A4A18" strokeWidth="0.8" opacity="0.3" />
      </>}
      {/* Burun */}
      <ellipse cx="46" cy="37" rx="3.8" ry="2.8" fill="#2D1B0E" />
      <ellipse cx="45" cy="36.3" rx="1.2" ry="0.8" fill="white" opacity="0.3" />
      {/* Ağız */}
      <path d={happy ? "M39,40 Q46,48 53,40" : "M42,40 Q46,43 50,40"} fill="none" stroke="#2D1B0E" strokeWidth="1.5" strokeLinecap="round" />
      {happy && <path d="M42,42 Q46,46 50,42" fill="#E85050" opacity="0.35" />}
      {/* Bıyıklar */}
      <line x1="26" y1="35" x2="36" y2="37" stroke="#C89848" strokeWidth="0.6" opacity="0.4" />
      <line x1="26" y1="38" x2="36" y2="39" stroke="#C89848" strokeWidth="0.6" opacity="0.3" />
      <line x1="66" y1="35" x2="56" y2="37" stroke="#C89848" strokeWidth="0.6" opacity="0.4" />
      <line x1="66" y1="38" x2="56" y2="39" stroke="#C89848" strokeWidth="0.6" opacity="0.3" />
      {/* Ayaklar */}
      <ellipse cx="36" cy="78" rx="9" ry="4.5" fill="#A06020" />
      <ellipse cx="56" cy="78" rx="9" ry="4.5" fill="#A06020" />
      <ellipse cx="36" cy="77" rx="6.5" ry="3" fill="#C89848" opacity="0.35" />
      <ellipse cx="56" cy="77" rx="6.5" ry="3" fill="#C89848" opacity="0.35" />
      {[33,36,39].map(x => <ellipse key={x} cx={x} cy="80" rx="1.5" ry="1" fill="#905818" opacity="0.25" />)}
      {[53,56,59].map(x => <ellipse key={x} cx={x} cy="80" rx="1.5" ry="1" fill="#905818" opacity="0.25" />)}
      {/* Fındık */}
      {happy && (
        <motion.g initial={{ scale: 0, y: 8 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <ellipse cx="46" cy="72" rx="6.5" ry="5.5" fill="#8B6341" stroke="#5A3D20" strokeWidth="0.6" />
          <ellipse cx="46" cy="70" rx="4.5" ry="3.5" fill="#A07854" opacity="0.5" />
          <ellipse cx="44" cy="69" rx="2" ry="1.2" fill="white" opacity="0.12" />
          <path d="M43,67 Q46,64 49,67" fill="#6B4C2A" opacity="0.5" />
        </motion.g>
      )}
    </motion.svg>
  )
}

// ─────────────────────────── BALIK ───────────────────────────
export function FishSVG({ size = 50, direction = 'right', color = '#3B82F6' }: { size?: number; direction?: 'left' | 'right'; color?: string }) {
  const u = useId().replace(/:/g, '')
  const flip = direction === 'left' ? -1 : 1
  return (
    <motion.svg width={size} height={size * 0.65} viewBox="0 0 70 42"
      animate={{ y: [0, -1.5, 0], x: [0, 1, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`fb${u}`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="25%" stopColor={color} /><stop offset="70%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id={`ft${u}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" /><stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
        <filter id={`fs${u}`}><feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={color} floodOpacity="0.25" /></filter>
      </defs>
      <g transform={`scale(${flip},1) translate(${flip === -1 ? -70 : 0},0)`}>
        <ellipse cx="30" cy="21" rx="24" ry="15" fill={`url(#fb${u})`} filter={`url(#fs${u})`} />
        <ellipse cx="26" cy="16" rx="14" ry="7" fill="white" opacity="0.1" />
        <ellipse cx="24" cy="14" rx="8" ry="4" fill="white" opacity="0.06" />
        <path d="M52,21 L66,7 L63,21 L66,35 Z" fill={`url(#ft${u})`} />
        <path d="M53,21 L62,11 L60,21 L62,31 Z" fill="white" opacity="0.06" />
        <path d="M24,6 Q30,0 36,7 Q30,10 26,8 Z" fill={color} opacity="0.7" />
        <path d="M28,34 Q32,39 36,34" fill={color} opacity="0.55" />
        <ellipse cx="20" cy="24" rx="5.5" ry="3.5" fill={color} opacity="0.45" transform="rotate(-20 20 24)" />
        {/* Animasyonlu pullar */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <motion.circle key={i} cx={16 + i * 5} cy={14 + (i % 3) * 6} r={1.2 + (i % 3) * 0.4}
            fill="white" opacity={0.06 + (i % 3) * 0.03}
            animate={{ opacity: [0.06+(i%3)*0.03, 0.12+(i%3)*0.03, 0.06+(i%3)*0.03] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
        ))}
        {/* Çizgiler */}
        <path d="M16,12 Q28,9 44,13" fill="none" stroke="white" strokeWidth="0.4" opacity="0.06" />
        <path d="M16,27 Q28,29 44,25" fill="none" stroke="white" strokeWidth="0.4" opacity="0.05" />
        {/* Göz — zengin */}
        <circle cx="16" cy="17" r="6.5" fill="white" />
        <circle cx="14.5" cy="16.5" r="4.2" fill="#1E293B" />
        <circle cx="14" cy="16" r="3" fill="#0F172A" />
        <circle cx="12.5" cy="14.5" r="2" fill="white" opacity="0.92" />
        <circle cx="15.5" cy="17.5" r="0.9" fill="white" opacity="0.45" />
        <path d="M6,22 Q9,25.5 6,29" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      </g>
    </motion.svg>
  )
}

// ─────────────────────────── BAYKUŞ ───────────────────────────
export function OwlSVG({ size = 80, blinking = true }: { size?: number; blinking?: boolean }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 90 95"
      animate={{ rotate: [0, 1.5, -1.5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`ob${u}`} cx="48%" cy="38%">
          <stop offset="0%" stopColor="#B89878" /><stop offset="40%" stopColor="#9B7B60" /><stop offset="100%" stopColor="#5A3D2E" />
        </radialGradient>
        <radialGradient id={`oe${u}`} cx="35%" cy="28%">
          <stop offset="0%" stopColor="#FFD080" /><stop offset="50%" stopColor="#FFB347" /><stop offset="100%" stopColor="#D87A0C" />
        </radialGradient>
        <radialGradient id={`od${u}`} cx="50%" cy="45%">
          <stop offset="0%" stopColor="#FFF5E8" /><stop offset="60%" stopColor="#F5E6D3" /><stop offset="100%" stopColor="#D4C0A8" />
        </radialGradient>
        <filter id={`os${u}`}><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2D1B0E" floodOpacity="0.3" /></filter>
      </defs>
      <ellipse cx="45" cy="93" rx="20" ry="3" fill="#1A0E05" opacity="0.12" />
      {/* Gövde — nefes */}
      <motion.ellipse cx="45" cy="60" rx="25" ry="28" fill={`url(#ob${u})`} filter={`url(#os${u})`}
        animate={{ ry: [28, 28.5, 28] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Karın V desenleri */}
      <ellipse cx="45" cy="64" rx="17" ry="21" fill="#D4B896" />
      {[0,1,2,3,4,5].map(i => (
        <path key={i} d={`M${37+i*1.5},${50+i*5} L45,${46+i*5} L${53-i*1.5},${50+i*5}`} fill="#C4A880" opacity={0.55-i*0.07} />
      ))}
      {/* Kanatlar — 3 katman */}
      <path d="M20,48 Q8,58 14,78 Q22,68 24,56 Z" fill="#4A3020" />
      <path d="M21,50 Q12,58 16,72 Q22,65 23,55 Z" fill="#5A3D2E" opacity="0.6" />
      <path d="M70,48 Q82,58 76,78 Q68,68 66,56 Z" fill="#4A3020" />
      <path d="M69,50 Q78,58 74,72 Q68,65 67,55 Z" fill="#5A3D2E" opacity="0.6" />
      {/* Kafa */}
      <circle cx="45" cy="32" r="22" fill={`url(#ob${u})`} filter={`url(#os${u})`} />
      {/* Kulak tüyleri */}
      <path d="M24,16 L28,3 L34,15" fill="#5A3D2E" stroke="#4A3020" strokeWidth="0.4" />
      <path d="M26,15 L29,5 L32,14" fill="#7A5D4A" opacity="0.45" />
      <path d="M66,16 L62,3 L56,15" fill="#5A3D2E" stroke="#4A3020" strokeWidth="0.4" />
      <path d="M64,15 L61,5 L58,14" fill="#7A5D4A" opacity="0.45" />
      {/* Göz diskleri */}
      <circle cx="35" cy="30" r="12.5" fill={`url(#od${u})`} stroke="#C8B090" strokeWidth="0.4" />
      <circle cx="55" cy="30" r="12.5" fill={`url(#od${u})`} stroke="#C8B090" strokeWidth="0.4" />
      {/* İris */}
      <circle cx="35" cy="30" r="7.5" fill={`url(#oe${u})`} />
      <circle cx="55" cy="30" r="7.5" fill={`url(#oe${u})`} />
      <circle cx="35" cy="30" r="5.5" fill="#D87A0C" opacity="0.3" />
      <circle cx="55" cy="30" r="5.5" fill="#D87A0C" opacity="0.3" />
      {/* Göz bebekleri — kırpma */}
      <motion.ellipse cx="35" cy="30" rx="4.5" ry="4.5" fill="#1A1A2E"
        animate={blinking ? { ry: [4.5, 0.3, 4.5] } : {}} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4.5 }} />
      <motion.ellipse cx="55" cy="30" rx="4.5" ry="4.5" fill="#1A1A2E"
        animate={blinking ? { ry: [4.5, 0.3, 4.5] } : {}} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4.5 }} />
      {/* Göz parlaması — üçlü */}
      <circle cx="33" cy="27" r="2.2" fill="white" opacity="0.88" />
      <circle cx="53" cy="27" r="2.2" fill="white" opacity="0.88" />
      <circle cx="36.5" cy="31.5" r="0.9" fill="white" opacity="0.4" />
      <circle cx="56.5" cy="31.5" r="0.9" fill="white" opacity="0.4" />
      {/* Gaga */}
      <path d="M41,38 L45,46 L49,38 Z" fill="#E8A33C" stroke="#C8882A" strokeWidth="0.6" />
      <path d="M42.5,39 L45,44 L47.5,39 Z" fill="#F0C050" opacity="0.35" />
      {/* Ayaklar */}
      <g fill="#E8A33C" stroke="#C8882A" strokeWidth="0.3">
        <path d="M36,85 L29,93 L33,90 L37,93 L41,90 L36,85" />
        <path d="M54,85 L47,93 L51,90 L55,93 L59,90 L54,85" />
      </g>
    </motion.svg>
  )
}

// ─────────────────────────── BALON ───────────────────────────
export function BalloonSVG({ color, size = 55 }: { color: string; size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size * 1.45} viewBox="0 0 50 72"
      animate={{ y: [0, -3, 0], rotate: [0, 1.5, -1.5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`bl${u}`} cx="33%" cy="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="18%" stopColor="white" stopOpacity="0.15" />
          <stop offset="35%" stopColor={color} stopOpacity="0.95" />
          <stop offset="75%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
        <filter id={`bs${u}`}><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={color} floodOpacity="0.35" /></filter>
      </defs>
      <ellipse cx="25" cy="26" rx="22" ry="26" fill={`url(#bl${u})`} filter={`url(#bs${u})`} />
      {/* Çoklu parlama */}
      <ellipse cx="15" cy="14" rx="9" ry="13" fill="white" opacity="0.2" transform="rotate(-20 15 14)" />
      <ellipse cx="12" cy="11" rx="4" ry="7" fill="white" opacity="0.18" transform="rotate(-20 12 11)" />
      <ellipse cx="10" cy="9" rx="2" ry="3.5" fill="white" opacity="0.12" transform="rotate(-20 10 9)" />
      <ellipse cx="25" cy="40" rx="18" ry="10" fill="black" opacity="0.07" />
      {/* Düğüm */}
      <path d="M22,51 L25,56 L28,51" fill={color} opacity="0.9" />
      <circle cx="25" cy="52" r="1.8" fill={color} stroke="white" strokeWidth="0.3" opacity="0.5" />
      {/* İp */}
      <motion.path d="M25,56 Q22,62 26,66 Q23,70 25,72" fill="none" stroke={color} strokeWidth="0.7" opacity="0.3" strokeLinecap="round"
        animate={{ d: ['M25,56 Q22,62 26,66 Q23,70 25,72', 'M25,56 Q28,62 24,66 Q27,70 25,72'] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }} />
    </motion.svg>
  )
}

// ─────────────────────────── KELEBEK ───────────────────────────
export function ButterflySVG({ size = 40, color = '#818CF8' }: { size?: number; color?: string }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 60 60"
      animate={{ y: [0, -3, 0], rotate: [0, 3, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`bw${u}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="50%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
        <filter id={`bws${u}`}><feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={color} floodOpacity="0.3" /></filter>
      </defs>
      <ellipse cx="30" cy="30" rx="2.2" ry="11" fill="#3D2818" />
      {/* Üst kanatlar — çırpma */}
      <motion.ellipse cx="19" cy="23" rx="11" ry="13" fill={`url(#bw${u})`} filter={`url(#bws${u})`}
        animate={{ rx: [11, 9.5, 11] }} transition={{ duration: 0.8, repeat: Infinity }} />
      <motion.ellipse cx="41" cy="23" rx="11" ry="13" fill={`url(#bw${u})`} filter={`url(#bws${u})`}
        animate={{ rx: [11, 9.5, 11] }} transition={{ duration: 0.8, repeat: Infinity }} />
      <circle cx="17" cy="21" r="4" fill="white" opacity="0.15" />
      <circle cx="43" cy="21" r="4" fill="white" opacity="0.15" />
      <circle cx="20" cy="26" r="2.5" fill="white" opacity="0.1" />
      <circle cx="40" cy="26" r="2.5" fill="white" opacity="0.1" />
      {/* Alt kanatlar */}
      <ellipse cx="23" cy="39" rx="7" ry="9" fill={color} opacity="0.6" />
      <ellipse cx="37" cy="39" rx="7" ry="9" fill={color} opacity="0.6" />
      {/* Kafa + antenler */}
      <circle cx="30" cy="17" r="3" fill="#3D2818" />
      <line x1="28" y1="15" x2="23" y2="9" stroke="#3D2818" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="32" y1="15" x2="37" y2="9" stroke="#3D2818" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="23" cy="9" r="1.2" fill={color} opacity="0.6" />
      <circle cx="37" cy="9" r="1.2" fill={color} opacity="0.6" />
    </motion.svg>
  )
}

// ─────────────────────────── TAVŞAN ───────────────────────────
export function RabbitSVG({ size = 40 }: { size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 80 80"
      animate={{ y: [0, -1.5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`rb${u}`} cx="45%" cy="38%">
          <stop offset="0%" stopColor="#F5F0EA" /><stop offset="50%" stopColor="#E8E2DA" /><stop offset="100%" stopColor="#D0C8BE" />
        </radialGradient>
        <filter id={`rs${u}`}><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" /></filter>
      </defs>
      <ellipse cx="40" cy="74" rx="14" ry="2.5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="40" cy="50" rx="15" ry="19" fill={`url(#rb${u})`} filter={`url(#rs${u})`} />
      <circle cx="40" cy="33" r="15" fill={`url(#rb${u})`} filter={`url(#rs${u})`} />
      {/* Kulaklar */}
      <ellipse cx="32" cy="12" rx="5.5" ry="17" fill={`url(#rb${u})`} />
      <ellipse cx="32" cy="12" rx="3.2" ry="13" fill="#F2C4C4" />
      <ellipse cx="48" cy="12" rx="5.5" ry="17" fill={`url(#rb${u})`} />
      <ellipse cx="48" cy="12" rx="3.2" ry="13" fill="#F2C4C4" />
      {/* Gözler */}
      <circle cx="34" cy="31" r="4" fill="white" />
      <circle cx="46" cy="31" r="4" fill="white" />
      <circle cx="35" cy="31" r="2.2" fill="#3D2020" />
      <circle cx="47" cy="31" r="2.2" fill="#3D2020" />
      <circle cx="35.5" cy="30" r="1" fill="white" opacity="0.85" />
      <circle cx="47.5" cy="30" r="1" fill="white" opacity="0.85" />
      {/* Burun */}
      <ellipse cx="40" cy="37" rx="3" ry="2" fill="#F0AAA8" />
      <path d="M38,39 Q40,41 42,39" fill="none" stroke="#C09090" strokeWidth="0.8" />
      {/* Kuyruk */}
      <circle cx="40" cy="67" r="5" fill="white" opacity="0.8" />
    </motion.svg>
  )
}
