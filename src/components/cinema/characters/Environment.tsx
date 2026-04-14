/**
 * Ultra-Gerçekçi SVG Çevre Bileşenleri — Level 5
 * feTurbulence doku, feSpecularLighting, çoklu paralaks, fizik animasyon
 */
import { useId } from 'react'
import { motion } from 'framer-motion'

// ═══════════════════ AĞAÇ ═══════════════════
export function TreeSVG({ size = 80, variant = 0 }: { size?: number; variant?: number }) {
  const u = useId().replace(/:/g, '')
  const palettes = [
    { crown: ['#1B6B30','#1D8A4E','#2DAA5E','#4CC070','#6BD888'], trunk: ['#5D4037','#3E2723','#2A1A10'] },
    { crown: ['#1B7A35','#2E9D45','#40B855','#5DD070','#78E088'], trunk: ['#6D4C41','#4E342E','#3A2218'] },
    { crown: ['#0F5520','#1D7535','#2D9548','#40AA58','#58C070'], trunk: ['#4E342E','#3E2723','#2A1A10'] },
  ]
  const p = palettes[variant % palettes.length]
  return (
    <motion.svg width={size} height={size*1.4} viewBox="0 0 70 98">
      <defs>
        <linearGradient id={`tt${u}`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor={p.trunk[0]} /><stop offset="50%" stopColor={p.trunk[1]} /><stop offset="100%" stopColor={p.trunk[2]} />
        </linearGradient>
        <radialGradient id={`tc${u}`} cx="42%" cy="30%">
          <stop offset="0%" stopColor={p.crown[4]} stopOpacity="0.85" /><stop offset="30%" stopColor={p.crown[2]} />
          <stop offset="60%" stopColor={p.crown[1]} /><stop offset="100%" stopColor={p.crown[0]} />
        </radialGradient>
        <filter id={`ts${u}`}><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" /></filter>
        <filter id={`tf${u}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" seed={variant+1} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" />
        </filter>
        <filter id={`tl${u}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="b" />
          <feSpecularLighting in="b" surfaceScale="2" specularConstant="0.4" specularExponent="20" lightingColor="#E8FFE0" result="s">
            <fePointLight x="25" y="10" z="30" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sc" />
          <feComposite in="SourceGraphic" in2="sc" operator="arithmetic" k1="0" k2="1" k3="0.2" k4="0" />
        </filter>
      </defs>
      <ellipse cx="35" cy="96" rx="16" ry="3" fill="#0A0A0A" opacity="0.1" />
      {/* Gövde */}
      <rect x="30" y="55" width="10" height="38" rx="3" fill={`url(#tt${u})`} />
      <rect x="33" y="55" width="3" height="38" rx="1" fill="white" opacity="0.05" />
      {[0,1,2,3].map(i => <line key={i} x1="31" y1={60+i*8} x2="39" y2={62+i*8} stroke={p.trunk[2]} strokeWidth="0.5" opacity="0.2" />)}
      {/* Kökler */}
      <path d="M28,90 Q24,94 18,96" fill="none" stroke={p.trunk[0]} strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
      <path d="M42,90 Q46,94 52,96" fill="none" stroke={p.trunk[0]} strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
      <path d="M33,92 Q30,96 26,97" fill="none" stroke={p.trunk[0]} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      {/* Yaprak katmanları */}
      <g filter={`url(#tl${u})`}>
        <motion.path d="M35,5 L60,40 L10,40 Z" fill={`url(#tc${u})`} filter={`url(#ts${u})`}
          animate={{ d: ['M35,5 L60,40 L10,40 Z','M35,3 L61,39 L9,39 Z'] }}
          transition={{ duration: 3+variant, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
      </g>
      <path d="M35,18 L56,48 L14,48 Z" fill={p.crown[1]} />
      <path d="M35,30 L53,57 L17,57 Z" fill={p.crown[2]} opacity="0.85" />
      {/* Yaprak doku */}
      <path d="M35,5 L58,38 L12,38 Z" fill={p.crown[3]} opacity="0.06" filter={`url(#tf${u})`} />
      {/* Parlaması */}
      <circle cx="26" cy="26" r="4" fill="white" opacity="0.06" />
      <circle cx="44" cy="38" r="3" fill="white" opacity="0.04" />
    </motion.svg>
  )
}

// ═══════════════════ MANTAR ═══════════════════
export function MushroomSVG({ size = 35 }: { size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 44 44"
      animate={{ y: [0,-0.5,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`mc${u}`} cx="36%" cy="28%">
          <stop offset="0%" stopColor="#FCA5A5" /><stop offset="30%" stopColor="#F87171" />
          <stop offset="60%" stopColor="#EF4444" /><stop offset="100%" stopColor="#B91C1C" />
        </radialGradient>
        <linearGradient id={`ms${u}`} x1="40%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#FAFAF9" /><stop offset="100%" stopColor="#E7E5E4" />
        </linearGradient>
        <filter id={`msh${u}`}><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" /></filter>
        <filter id={`ml${u}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="b" />
          <feSpecularLighting in="b" surfaceScale="2" specularConstant="0.5" specularExponent="18" lightingColor="#FFF0F0" result="s">
            <fePointLight x="15" y="10" z="25" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sc" />
          <feComposite in="SourceGraphic" in2="sc" operator="arithmetic" k1="0" k2="1" k3="0.2" k4="0" />
        </filter>
      </defs>
      <rect x="17" y="26" width="10" height="16" rx="3.5" fill={`url(#ms${u})`} stroke="#D6D3D1" strokeWidth="0.4" />
      <rect x="20" y="26" width="3" height="16" rx="1" fill="white" opacity="0.2" />
      <g filter={`url(#ml${u})`}>
        <ellipse cx="22" cy="26" rx="19" ry="15" fill={`url(#mc${u})`} filter={`url(#msh${u})`} />
      </g>
      <circle cx="14" cy="19" r="4" fill="white" opacity="0.75" />
      <circle cx="27" cy="16" r="3" fill="white" opacity="0.65" />
      <circle cx="20" cy="27" r="2.5" fill="white" opacity="0.55" />
      <circle cx="31" cy="22" r="2" fill="white" opacity="0.45" />
      <circle cx="11" cy="26" r="1.5" fill="white" opacity="0.35" />
      <ellipse cx="13" cy="17" rx="2.5" ry="3.5" fill="white" opacity="0.15" transform="rotate(-15 13 17)" />
    </motion.svg>
  )
}

// ═══════════════════ YILDIZ ═══════════════════
export function StarSVG({ size = 45, filled = true, glowing = false }: { size?: number; filled?: boolean; glowing?: boolean }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 50 50"
      animate={glowing ? { filter: ['drop-shadow(0 0 4px #FDE68A)','drop-shadow(0 0 16px #FBBF24)','drop-shadow(0 0 4px #FDE68A)'] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}>
      <defs>
        <linearGradient id={`sg${u}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" /><stop offset="25%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#FBBF24" /><stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id={`sr${u}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" /><stop offset="50%" stopColor="#FDE68A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id={`sgl${u}`}><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FBBF24" floodOpacity="0.5" /></filter>
      </defs>
      {filled && glowing && <circle cx="25" cy="25" r="20" fill={`url(#sr${u})`} />}
      <path d="M25,3 L31,19 L48,19 L34,29 L39,46 L25,36 L11,46 L16,29 L2,19 L19,19 Z"
        fill={filled ? `url(#sg${u})` : 'none'} stroke={filled ? '#D97706' : '#6B7280'} strokeWidth="1" filter={filled ? `url(#sgl${u})` : 'none'} />
      {filled && <>
        <path d="M25,7 L29,18 L25,16 L21,18 Z" fill="white" opacity="0.3" />
        <path d="M25,8 L27.5,16" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
        <circle cx="25" cy="24" r="4" fill="white" opacity="0.06" />
      </>}
    </motion.svg>
  )
}

// ═══════════════════ ÇİÇEK ═══════════════════
export function FlowerSVG({ color = '#EC4899', size = 40, blooming = false }: { color?: string; size?: number; blooming?: boolean }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 40 40"
      animate={blooming ? { scale: [0,1.15,1] } : {}} transition={{ duration: 0.5 }}>
      <defs>
        <radialGradient id={`fp${u}`} cx="50%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" /><stop offset="40%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id={`fc${u}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#FEF3C7" /><stop offset="40%" stopColor="#FBBF24" /><stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <filter id={`fl${u}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b" />
          <feSpecularLighting in="b" surfaceScale="2" specularConstant="0.4" specularExponent="15" lightingColor="#FFF0F0" result="s">
            <fePointLight x="15" y="10" z="20" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sc" />
          <feComposite in="SourceGraphic" in2="sc" operator="arithmetic" k1="0" k2="1" k3="0.2" k4="0" />
        </filter>
      </defs>
      <g filter={`url(#fl${u})`}>
        {[0,60,120,180,240,300].map((angle,i) => (
          <ellipse key={i} cx="20" cy="12" rx="6.5" ry="10.5" fill={`url(#fp${u})`} opacity={0.75+i*0.02}
            transform={`rotate(${angle} 20 20)`} />
        ))}
      </g>
      {[0,120,240].map((angle,i) => (
        <ellipse key={`i${i}`} cx="20" cy="14" rx="2" ry="6" fill="white" opacity="0.06" transform={`rotate(${angle} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="6.5" fill={`url(#fc${u})`} />
      <circle cx="20" cy="20" r="4.5" fill="#D97706" opacity="0.3" />
      <circle cx="18.5" cy="18" r="2" fill="white" opacity="0.25" />
      <circle cx="19" cy="19" r="0.8" fill="white" opacity="0.15" />
      {[0,1,2,3,4].map(i => (
        <circle key={`p${i}`} cx={18+Math.cos(i*1.25)*3} cy={18+Math.sin(i*1.25)*3} r="0.5" fill="#92400E" opacity="0.2" />
      ))}
    </motion.svg>
  )
}
