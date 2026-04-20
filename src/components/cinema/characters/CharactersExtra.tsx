/**
 * Ek Karakter Kütüphanesi — Sevimli SVG illüstrasyonlar
 *
 * Bear, Frog, Cat, Duck, Apple, Carrot
 * Orta detay seviyesinde: gradient + soft shadow + nefes/sway animasyonu.
 * Ultra-detay (feTurbulence) mevcut Squirrel'da, burada daha hafif + daha hızlı.
 */
import { useId } from 'react'
import { motion } from 'framer-motion'

// ═══════════════════ AYI ═══════════════════
export function BearSVG({ size = 70, happy = false }: { size?: number; happy?: boolean }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100"
      animate={{ y: [0, -1.8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`br${u}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#C8926A" />
          <stop offset="50%" stopColor="#8B5A3C" />
          <stop offset="100%" stopColor="#5D3A20" />
        </radialGradient>
        <radialGradient id={`bsn${u}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#E8C098" />
          <stop offset="100%" stopColor="#B88C60" />
        </radialGradient>
        <filter id={`bsh${u}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dy="2" />
          <feFlood floodColor="#3D2410" floodOpacity="0.3" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Gölge */}
      <ellipse cx="50" cy="93" rx="20" ry="4" fill="#1A0E05" opacity="0.18" />
      {/* Kulaklar */}
      <circle cx="30" cy="25" r="10" fill={`url(#br${u})`} filter={`url(#bsh${u})`} />
      <circle cx="30" cy="25" r="5" fill="#D8A878" opacity="0.7" />
      <circle cx="70" cy="25" r="10" fill={`url(#br${u})`} filter={`url(#bsh${u})`} />
      <circle cx="70" cy="25" r="5" fill="#D8A878" opacity="0.7" />
      {/* Vücut */}
      <ellipse cx="50" cy="70" rx="24" ry="22" fill={`url(#br${u})`} filter={`url(#bsh${u})`} />
      <ellipse cx="50" cy="72" rx="16" ry="14" fill="#E0B488" opacity="0.35" />
      {/* Kafa */}
      <circle cx="50" cy="38" r="22" fill={`url(#br${u})`} filter={`url(#bsh${u})`} />
      <ellipse cx="50" cy="43" rx="13" ry="10" fill={`url(#bsn${u})`} />
      {/* Gözler */}
      <circle cx="42" cy="36" r="3.5" fill="white" />
      <circle cx="42.5" cy="36" r="2.2" fill="#1A0E05" />
      <circle cx="43" cy="35.2" r="0.8" fill="white" />
      <circle cx="58" cy="36" r="3.5" fill="white" />
      <circle cx="58.5" cy="36" r="2.2" fill="#1A0E05" />
      <circle cx="59" cy="35.2" r="0.8" fill="white" />
      {/* Burun */}
      <ellipse cx="50" cy="43" rx="3" ry="2.2" fill="#1A0E05" />
      <ellipse cx="49" cy="42.3" rx="1" ry="0.6" fill="white" opacity="0.5" />
      {/* Ağız */}
      <path d={happy ? "M44,48 Q50,54 56,48" : "M46,48 Q50,50 54,48"} fill="none" stroke="#1A0E05" strokeWidth="1.3" strokeLinecap="round" />
      {happy && <path d="M45,49 Q50,53 55,49" fill="#E85050" opacity="0.35" />}
      {/* Patiler */}
      <ellipse cx="34" cy="86" rx="8" ry="5" fill="#6D4425" filter={`url(#bsh${u})`} />
      <ellipse cx="66" cy="86" rx="8" ry="5" fill="#6D4425" filter={`url(#bsh${u})`} />
      <ellipse cx="34" cy="85" rx="5" ry="3" fill="#8B5A3C" opacity="0.5" />
      <ellipse cx="66" cy="85" rx="5" ry="3" fill="#8B5A3C" opacity="0.5" />
    </motion.svg>
  )
}

// ═══════════════════ KURBAĞA ═══════════════════
export function FrogSVG({ size = 60, jumping = false }: { size?: number; jumping?: boolean }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100"
      animate={jumping ? { y: [0, -8, 0] } : { y: [0, -2, 0] }}
      transition={{ duration: jumping ? 1.2 : 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`fg${u}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#86E65B" />
          <stop offset="50%" stopColor="#4CAF50" />
          <stop offset="100%" stopColor="#1F7A1F" />
        </radialGradient>
        <filter id={`fsh${u}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dy="2" />
          <feFlood floodColor="#0A3D0A" floodOpacity="0.3" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="50" cy="93" rx="20" ry="3" fill="#0A3D0A" opacity="0.15" />
      {/* Göz kabarcıkları */}
      <ellipse cx="35" cy="30" rx="11" ry="12" fill={`url(#fg${u})`} filter={`url(#fsh${u})`} />
      <ellipse cx="65" cy="30" rx="11" ry="12" fill={`url(#fg${u})`} filter={`url(#fsh${u})`} />
      {/* Göz beyazları + pupiller */}
      <circle cx="35" cy="28" r="7" fill="white" />
      <circle cx="65" cy="28" r="7" fill="white" />
      <motion.circle cx="35" cy="29" r="4" fill="#1A0E05"
        animate={{ cx: [35, 36, 35, 34, 35] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.circle cx="65" cy="29" r="4" fill="#1A0E05"
        animate={{ cx: [65, 66, 65, 64, 65] }} transition={{ duration: 4, repeat: Infinity }} />
      <circle cx="36" cy="27.5" r="1.2" fill="white" />
      <circle cx="66" cy="27.5" r="1.2" fill="white" />
      {/* Vücut */}
      <ellipse cx="50" cy="62" rx="28" ry="22" fill={`url(#fg${u})`} filter={`url(#fsh${u})`} />
      <ellipse cx="50" cy="66" rx="20" ry="14" fill="#A8E888" opacity="0.45" />
      {/* Benekler */}
      <circle cx="38" cy="55" r="2.5" fill="#2F6B2F" opacity="0.6" />
      <circle cx="62" cy="58" r="2.5" fill="#2F6B2F" opacity="0.6" />
      <circle cx="48" cy="72" r="2" fill="#2F6B2F" opacity="0.6" />
      {/* Ön bacaklar */}
      <ellipse cx="28" cy="76" rx="5" ry="8" fill={`url(#fg${u})`} transform="rotate(-20 28 76)" />
      <ellipse cx="72" cy="76" rx="5" ry="8" fill={`url(#fg${u})`} transform="rotate(20 72 76)" />
      {/* Arka ayaklar */}
      <path d="M22,85 Q18,82 15,86 L20,90 Z" fill={`url(#fg${u})`} opacity="0.8" />
      <path d="M78,85 Q82,82 85,86 L80,90 Z" fill={`url(#fg${u})`} opacity="0.8" />
      {/* Ağız */}
      <path d="M40,55 Q50,62 60,55" fill="none" stroke="#0A3D0A" strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  )
}

// ═══════════════════ KEDİ ═══════════════════
export function CatSVG({ size = 60, color = '#F4A460' }: { size?: number; color?: string }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100"
      animate={{ y: [0, -1.5, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`cg${u}`} cx="38%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="30%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </radialGradient>
        <filter id={`csh${u}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dy="2" />
          <feFlood floodColor="#000" floodOpacity="0.25" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="50" cy="93" rx="18" ry="3" fill="#000" opacity="0.15" />
      {/* Kuyruk (sway) */}
      <motion.path d="M76,65 Q92,55 86,35"
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        animate={{ d: ['M76,65 Q92,55 86,35', 'M76,65 Q94,58 88,32', 'M76,65 Q92,55 86,35'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Vücut */}
      <ellipse cx="50" cy="68" rx="22" ry="18" fill={`url(#cg${u})`} filter={`url(#csh${u})`} />
      {/* Kafa */}
      <circle cx="50" cy="40" r="20" fill={`url(#cg${u})`} filter={`url(#csh${u})`} />
      {/* Üçgen kulaklar */}
      <polygon points="35,22 32,10 44,20" fill={color} filter={`url(#csh${u})`} />
      <polygon points="65,22 68,10 56,20" fill={color} filter={`url(#csh${u})`} />
      <polygon points="36,22 34.5,13 42,20" fill="#FFC8A0" opacity="0.7" />
      <polygon points="64,22 65.5,13 58,20" fill="#FFC8A0" opacity="0.7" />
      {/* Gözler — yeşil kedi gözü */}
      <ellipse cx="42" cy="38" rx="4" ry="5" fill="#7AE05A" />
      <ellipse cx="58" cy="38" rx="4" ry="5" fill="#7AE05A" />
      <ellipse cx="42" cy="38" rx="1.2" ry="4.5" fill="#0F2A0A" />
      <ellipse cx="58" cy="38" rx="1.2" ry="4.5" fill="#0F2A0A" />
      <circle cx="43" cy="36" r="1" fill="white" />
      <circle cx="59" cy="36" r="1" fill="white" />
      {/* Burun (üçgen) */}
      <polygon points="47,45 53,45 50,49" fill="#D97570" />
      {/* Ağız */}
      <path d="M50,49 Q46,52 42,50" fill="none" stroke="#3D2410" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M50,49 Q54,52 58,50" fill="none" stroke="#3D2410" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bıyıklar */}
      <line x1="30" y1="45" x2="42" y2="46" stroke="#5A3D20" strokeWidth="0.5" opacity="0.6" />
      <line x1="30" y1="48" x2="42" y2="48" stroke="#5A3D20" strokeWidth="0.5" opacity="0.6" />
      <line x1="70" y1="45" x2="58" y2="46" stroke="#5A3D20" strokeWidth="0.5" opacity="0.6" />
      <line x1="70" y1="48" x2="58" y2="48" stroke="#5A3D20" strokeWidth="0.5" opacity="0.6" />
    </motion.svg>
  )
}

// ═══════════════════ ÖRDEK ═══════════════════
export function DuckSVG({ size = 60 }: { size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100"
      animate={{ y: [0, -1.5, 0], rotate: [-1, 1, -1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`dg${u}`} cx="38%" cy="30%">
          <stop offset="0%" stopColor="#FFF5A0" />
          <stop offset="55%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <filter id={`dsh${u}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dy="2" />
          <feFlood floodColor="#7A4F00" floodOpacity="0.3" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="50" cy="93" rx="18" ry="3" fill="#7A4F00" opacity="0.15" />
      {/* Vücut */}
      <ellipse cx="50" cy="65" rx="26" ry="20" fill={`url(#dg${u})`} filter={`url(#dsh${u})`} />
      {/* Kuyruk (kanat üstünde küçük kıvrık) */}
      <path d="M74,55 Q82,48 80,60" fill={`url(#dg${u})`} filter={`url(#dsh${u})`} />
      {/* Kanat */}
      <ellipse cx="52" cy="63" rx="13" ry="9" fill="#F5B830" opacity="0.6" transform="rotate(-8 52 63)" />
      <path d="M48,60 Q56,63 60,70" fill="none" stroke="#D97706" strokeWidth="0.8" opacity="0.5" />
      {/* Kafa */}
      <circle cx="38" cy="38" r="17" fill={`url(#dg${u})`} filter={`url(#dsh${u})`} />
      {/* Göz */}
      <circle cx="35" cy="34" r="3" fill="white" />
      <circle cx="35.5" cy="34" r="1.8" fill="#1A0E05" />
      <circle cx="36" cy="33.2" r="0.7" fill="white" />
      {/* Gaga */}
      <ellipse cx="22" cy="40" rx="8" ry="4" fill="#FB923C" filter={`url(#dsh${u})`} />
      <ellipse cx="22" cy="42" rx="7" ry="2" fill="#EA580C" opacity="0.6" />
      <line x1="17" y1="40" x2="27" y2="40" stroke="#C2410C" strokeWidth="0.6" opacity="0.5" />
      {/* Ayaklar (suda görünmüyor ama yere basanlar için) */}
      <path d="M42,82 Q40,88 44,88 L48,84 Z" fill="#FB923C" />
      <path d="M55,82 Q53,88 57,88 L61,84 Z" fill="#FB923C" />
    </motion.svg>
  )
}

// ═══════════════════ ELMA ═══════════════════
export function AppleSVG({ size = 40, color = '#EF4444' }: { size?: number; color?: string }) {
  const u = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <defs>
        <radialGradient id={`ap${u}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="25%" stopColor={color === '#EF4444' ? '#FCA5A5' : color} />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={color === '#EF4444' ? '#991B1B' : color} stopOpacity="0.7" />
        </radialGradient>
        <filter id={`aps${u}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
          <feOffset dy="1.5" />
          <feFlood floodColor="#5A0A0A" floodOpacity="0.3" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Yaprak */}
      <path d="M26,10 Q34,6 36,14 Q30,16 26,12 Z" fill="#4CAF50" />
      <path d="M26,10 Q30,8 34,12" fill="none" stroke="#2E7D32" strokeWidth="0.4" />
      {/* Sap */}
      <rect x="24" y="8" width="1.5" height="4" fill="#6D4425" rx="0.5" />
      {/* Gövde — hafif çift loblu (kalp şekli) */}
      <path d="M25,12 Q15,12 13,22 Q12,35 20,42 Q25,45 30,42 Q38,35 37,22 Q35,12 25,12 Z"
        fill={`url(#ap${u})`} filter={`url(#aps${u})`} />
      {/* Parlaklık */}
      <ellipse cx="19" cy="20" rx="4" ry="6" fill="white" opacity="0.3" transform="rotate(-15 19 20)" />
      <ellipse cx="18" cy="18" rx="2" ry="3" fill="white" opacity="0.5" transform="rotate(-15 18 18)" />
    </svg>
  )
}

// ═══════════════════ HAVUÇ ═══════════════════
export function CarrotSVG({ size = 40 }: { size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <defs>
        <linearGradient id={`cr${u}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id={`cl${u}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86E65B" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
      {/* Yapraklar */}
      <path d="M24,10 Q22,3 18,5 Q20,8 22,12 Z" fill={`url(#cl${u})`} />
      <path d="M25,9 Q25,2 27,2 Q27,7 26,12 Z" fill={`url(#cl${u})`} />
      <path d="M26,10 Q30,3 32,7 Q28,9 27,12 Z" fill={`url(#cl${u})`} />
      {/* Havuç gövdesi */}
      <path d="M18,14 Q20,12 30,12 Q32,14 30,18 L28,40 Q25,45 22,40 L20,18 Z"
        fill={`url(#cr${u})`} />
      {/* Yatay çizgiler (doku) */}
      <line x1="20" y1="20" x2="30" y2="20" stroke="#9A3412" strokeWidth="0.4" opacity="0.5" />
      <line x1="20.5" y1="25" x2="29.5" y2="25" stroke="#9A3412" strokeWidth="0.4" opacity="0.5" />
      <line x1="21" y1="30" x2="29" y2="30" stroke="#9A3412" strokeWidth="0.4" opacity="0.5" />
      <line x1="21.5" y1="35" x2="28.5" y2="35" stroke="#9A3412" strokeWidth="0.4" opacity="0.5" />
      {/* Parlaklık */}
      <path d="M22,15 Q22,25 23,35" stroke="white" strokeWidth="1.5" fill="none" opacity="0.35" strokeLinecap="round" />
    </svg>
  )
}
