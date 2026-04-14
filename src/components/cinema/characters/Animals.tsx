/**
 * Ultra-Gerçekçi SVG Hayvan Karakterleri — Level 5
 * feTurbulence kürk, feSpecularLighting 3D, subsurface scattering,
 * iris doku, kornea yansıma, rim light, fizik animasyon
 */
import { useId } from 'react'
import { motion } from 'framer-motion'

// ═══════════════════ ORTAK FİLTRELER ═══════════════════
function UltraDefs({ uid, bodyGrad }: { uid: string; bodyGrad: [string,string,string,string,string,string] }) {
  return (
    <defs>
      <filter id={`fur${uid}`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" seed="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`lit${uid}`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" />
        <feSpecularLighting in="b" surfaceScale="3" specularConstant="0.55" specularExponent="25" lightingColor="#FFF8E8" result="s">
          <fePointLight x="35" y="20" z="40" />
        </feSpecularLighting>
        <feComposite in="s" in2="SourceAlpha" operator="in" result="sc" />
        <feComposite in="SourceGraphic" in2="sc" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
      </filter>
      <filter id={`sss${uid}`}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
        <feColorMatrix in="b" type="matrix" values="1.1 0 0 0 0.05 0 0.9 0 0 0.02 0 0 0.7 0 0 0 0 0 0.25 0" result="w" />
        <feComposite in="SourceGraphic" in2="w" operator="over" />
      </filter>
      <filter id={`sh${uid}`}>
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b1" />
        <feOffset in="b1" dy="2" result="o1" />
        <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b2" />
        <feOffset in="b2" dy="5" result="o2" />
        <feFlood floodColor="#1A0E05" floodOpacity="0.2" result="c1" /><feFlood floodColor="#1A0E05" floodOpacity="0.12" result="c2" />
        <feComposite in="c1" in2="o1" operator="in" result="s1" /><feComposite in="c2" in2="o2" operator="in" result="s2" />
        <feMerge><feMergeNode in="s2" /><feMergeNode in="s1" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id={`rim${uid}`}>
        <feMorphology in="SourceAlpha" operator="dilate" radius="0.5" result="t" />
        <feGaussianBlur in="t" stdDeviation="1.5" result="b" />
        <feFlood floodColor="#FFD080" floodOpacity="0.12" result="c" />
        <feComposite in="c" in2="b" operator="in" result="g" />
        <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <radialGradient id={`bg${uid}`} cx="40%" cy="35%">
        <stop offset="0%" stopColor={bodyGrad[0]} /><stop offset="15%" stopColor={bodyGrad[1]} />
        <stop offset="35%" stopColor={bodyGrad[2]} /><stop offset="55%" stopColor={bodyGrad[3]} />
        <stop offset="80%" stopColor={bodyGrad[4]} /><stop offset="100%" stopColor={bodyGrad[5]} />
      </radialGradient>
    </defs>
  )
}

// ═══════════════════ GÖZ BİLEŞENİ ═══════════════════
function UltraEye({ cx, cy, uid, irisColor = '#2A1508', pupilR = 2.8 }: { cx: number; cy: number; uid: string; irisColor?: string; pupilR?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="6.5" fill="white" filter={`url(#sh${uid})`} />
      <circle cx={cx} cy={cy} r="6" fill="#FAFAFA" />
      <circle cx={cx+0.5} cy={cy-0.5} r="4.2" fill={irisColor} />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
        <line key={a} x1={cx+0.5+Math.cos(a*Math.PI/180)*1.5} y1={cy-0.5+Math.sin(a*Math.PI/180)*1.5}
          x2={cx+0.5+Math.cos(a*Math.PI/180)*3.8} y2={cy-0.5+Math.sin(a*Math.PI/180)*3.8}
          stroke={irisColor} strokeWidth="0.2" opacity="0.35" />
      ))}
      <motion.circle cx={cx+1} cy={cy-1} r={pupilR} fill="#050200"
        animate={{ r: [pupilR, pupilR-0.3, pupilR] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      <ellipse cx={cx+2} cy={cy-2.5} rx="2" ry="1.5" fill="white" opacity="0.95" transform={`rotate(-10 ${cx+2} ${cy-2.5})`} />
      <circle cx={cx-1} cy={cy+1} r="0.9" fill="white" opacity="0.5" />
      <ellipse cx={cx+1} cy={cy-1.5} rx="0.6" ry="0.4" fill="white" opacity="0.3" />
    </g>
  )
}

// ═══════════════════ SİNCAP ═══════════════════
export function SquirrelSVG({ size = 70, happy = false, onClick }: { size?: number; happy?: boolean; onClick?: () => void }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
      animate={{ y: [0, -1.5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: [0.45,0.05,0.55,0.95] }}>
      <UltraDefs uid={u} bodyGrad={['#FFDA90','#F8C070','#E8A048','#D08030','#A86018','#804810']} />
      <radialGradient id={`sv${u}`} cx="48%" cy="28%">
        <stop offset="0%" stopColor="#FFFCF5" /><stop offset="25%" stopColor="#FFF5E0" />
        <stop offset="55%" stopColor="#F5DDB8" /><stop offset="100%" stopColor="#DDB880" />
      </radialGradient>
      <radialGradient id={`sn${u}`} cx="38%" cy="30%">
        <stop offset="0%" stopColor="#4A3018" /><stop offset="50%" stopColor="#2D1B0E" /><stop offset="100%" stopColor="#1A1008" />
      </radialGradient>
      <ellipse cx="46" cy="93" rx="22" ry="5" fill="#0A0500" opacity="0.12"><animate attributeName="rx" values="22;20;22" dur="3.5s" repeatCount="indefinite" /></ellipse>
      {/* Kuyruk */}
      <motion.path d="M65,62 Q82,32 76,14 Q72,4 62,10 Q56,16 60,32 Q62,44 64,56" fill={`url(#bg${u})`} stroke="#7A4810" strokeWidth="0.5" filter={`url(#sh${u})`}
        animate={{ d: ['M65,62 Q82,32 76,14 Q72,4 62,10 Q56,16 60,32 Q62,44 64,56','M65,62 Q85,28 78,10 Q74,0 64,6 Q58,12 62,28 Q64,42 64,56'] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: [0.45,0.05,0.55,0.95] }} />
      <path d="M66,58 Q78,34 74,18" fill="none" stroke="#E8B860" strokeWidth="2" opacity="0.15" />
      <path d="M67,55 Q76,36 73,20" fill="none" stroke="#F0C868" strokeWidth="1" opacity="0.08" />
      {/* Gövde — 3D */}
      <g filter={`url(#lit${u})`}><ellipse cx="46" cy="58" rx="20" ry="22" fill={`url(#bg${u})`} filter={`url(#sh${u})`} /></g>
      <ellipse cx="42" cy="52" rx="10" ry="12" fill="#F8C860" opacity="0.12" />
      <g filter={`url(#sss${u})`}><ellipse cx="46" cy="63" rx="13" ry="16" fill={`url(#sv${u})`} /></g>
      <ellipse cx="46" cy="58" rx="19" ry="21" fill={`url(#bg${u})`} opacity="0.12" filter={`url(#fur${u})`} />
      {/* Kollar */}
      <ellipse cx="27" cy="56" rx="6" ry="12" fill={`url(#bg${u})`} transform="rotate(-18 27 56)" filter={`url(#sh${u})`} />
      <ellipse cx="65" cy="56" rx="6" ry="12" fill={`url(#bg${u})`} transform="rotate(18 65 56)" filter={`url(#sh${u})`} />
      {/* Kafa */}
      <g filter={`url(#rim${u})`}>
        <motion.circle cx="46" cy="32" r="18" fill={`url(#bg${u})`} filter={`url(#sh${u})`}
          animate={{ r: [18,18.4,18] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} />
      </g>
      <circle cx="46" cy="32" r="17" fill={`url(#bg${u})`} opacity="0.1" filter={`url(#fur${u})`} />
      {/* Kulaklar */}
      <ellipse cx="31" cy="17" rx="7" ry="11" fill={`url(#bg${u})`} stroke="#805018" strokeWidth="0.3" filter={`url(#sh${u})`} />
      <ellipse cx="31" cy="17" rx="4.2" ry="7.5" fill="#F5D6A0" />
      <ellipse cx="31" cy="16" rx="2.5" ry="5" fill="#FFECD0" opacity="0.4" />
      <ellipse cx="61" cy="17" rx="7" ry="11" fill={`url(#bg${u})`} stroke="#805018" strokeWidth="0.3" filter={`url(#sh${u})`} />
      <ellipse cx="61" cy="17" rx="4.2" ry="7.5" fill="#F5D6A0" />
      <ellipse cx="61" cy="16" rx="2.5" ry="5" fill="#FFECD0" opacity="0.4" />
      {/* Gözler */}
      <UltraEye cx={38} cy={30} uid={u} />
      <UltraEye cx={54} cy={30} uid={u} />
      {happy && <>
        <path d="M34,25 Q38,23 42,25" fill="none" stroke="#7A4A18" strokeWidth="0.8" opacity="0.3" />
        <path d="M50,25 Q54,23 58,25" fill="none" stroke="#7A4A18" strokeWidth="0.8" opacity="0.3" />
      </>}
      {/* Burun */}
      <ellipse cx="46" cy="37" rx="4" ry="3" fill={`url(#sn${u})`} />
      <ellipse cx="44.5" cy="36" rx="1.5" ry="1" fill="white" opacity="0.4" />
      <ellipse cx="44.5" cy="37.5" rx="1" ry="0.7" fill="#1A0C04" opacity="0.4" />
      <ellipse cx="47.5" cy="37.5" rx="1" ry="0.7" fill="#1A0C04" opacity="0.4" />
      {/* Ağız */}
      <path d={happy ? "M39,40 Q46,48 53,40" : "M42,40 Q46,44 50,40"} fill="none" stroke="#2D1B0E" strokeWidth="1.2" strokeLinecap="round" />
      {happy && <path d="M42,42 Q46,46 50,42" fill="#E85050" opacity="0.3" />}
      {/* Bıyıklar */}
      <motion.line x1="25" y1="34" x2="36" y2="36.5" stroke="#C89848" strokeWidth="0.5" opacity="0.35"
        animate={{ y1: [34,34.5,34] }} transition={{ duration: 2, repeat: Infinity }} />
      <line x1="25" y1="37" x2="36" y2="38.5" stroke="#C89848" strokeWidth="0.5" opacity="0.3" />
      <line x1="24" y1="40" x2="37" y2="40.5" stroke="#C89848" strokeWidth="0.4" opacity="0.2" />
      <motion.line x1="67" y1="34" x2="56" y2="36.5" stroke="#C89848" strokeWidth="0.5" opacity="0.35"
        animate={{ y1: [34,34.5,34] }} transition={{ duration: 2, repeat: Infinity }} />
      <line x1="67" y1="37" x2="56" y2="38.5" stroke="#C89848" strokeWidth="0.5" opacity="0.3" />
      <line x1="68" y1="40" x2="55" y2="40.5" stroke="#C89848" strokeWidth="0.4" opacity="0.2" />
      {/* Ayaklar */}
      <ellipse cx="36" cy="78" rx="10" ry="5" fill="#905818" filter={`url(#sh${u})`} />
      <ellipse cx="56" cy="78" rx="10" ry="5" fill="#905818" filter={`url(#sh${u})`} />
      <ellipse cx="36" cy="77" rx="7" ry="3.5" fill="#B87828" opacity="0.3" />
      <ellipse cx="56" cy="77" rx="7" ry="3.5" fill="#B87828" opacity="0.3" />
      {[32,35.5,39].map(x => <line key={x} x1={x} y1="76" x2={x} y2="80" stroke="#704010" strokeWidth="0.3" opacity="0.2" />)}
      {[52,55.5,59].map(x => <line key={x} x1={x} y1="76" x2={x} y2="80" stroke="#704010" strokeWidth="0.3" opacity="0.2" />)}
      {/* Fındık */}
      {happy && (
        <motion.g initial={{ scale: 0, y: 8 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <ellipse cx="46" cy="72" rx="6.5" ry="5.5" fill="#8B6341" stroke="#5A3D20" strokeWidth="0.6" />
          <ellipse cx="46" cy="70" rx="4.5" ry="3.5" fill="#A07854" opacity="0.5" />
          <ellipse cx="44" cy="69" rx="2" ry="1.2" fill="white" opacity="0.12" />
        </motion.g>
      )}
    </motion.svg>
  )
}

// ═══════════════════ BALIK ═══════════════════
export function FishSVG({ size = 50, direction = 'right', color = '#3B82F6' }: { size?: number; direction?: 'left'|'right'; color?: string }) {
  const u = useId().replace(/:/g, '')
  const flip = direction === 'left' ? -1 : 1
  return (
    <motion.svg width={size} height={size*0.65} viewBox="0 0 70 42"
      animate={{ y: [0,-1.5,0], x: [0,1,0] }} transition={{ duration: 2.5, repeat: Infinity, ease: [0.45,0.05,0.55,0.95] }}>
      <defs>
        <radialGradient id={`fb${u}`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" /><stop offset="20%" stopColor={color} />
          <stop offset="60%" stopColor={color} stopOpacity="0.85" /><stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
        <linearGradient id={`ft${u}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" /><stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
        <filter id={`fs${u}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" /><feOffset in="b" dy="2" result="o" />
          <feFlood floodColor={color} floodOpacity="0.2" result="c" /><feComposite in="c" in2="o" operator="in" result="s" />
          <feMerge><feMergeNode in="s" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`fsc${u}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" />
        </filter>
      </defs>
      <g transform={`scale(${flip},1) translate(${flip===-1?-70:0},0)`}>
        <ellipse cx="30" cy="21" rx="24" ry="15" fill={`url(#fb${u})`} filter={`url(#fs${u})`} />
        <ellipse cx="30" cy="21" rx="23" ry="14" fill={color} opacity="0.08" filter={`url(#fsc${u})`} />
        <ellipse cx="26" cy="16" rx="14" ry="7" fill="white" opacity="0.1" />
        <ellipse cx="24" cy="14" rx="8" ry="4" fill="white" opacity="0.06" />
        <path d="M52,21 L66,7 L63,21 L66,35 Z" fill={`url(#ft${u})`} />
        <path d="M53,21 L62,11 L60,21 L62,31 Z" fill="white" opacity="0.06" />
        <path d="M24,6 Q30,0 36,7 Q30,10 26,8 Z" fill={color} opacity="0.7" />
        <path d="M28,34 Q32,39 36,34" fill={color} opacity="0.55" />
        <ellipse cx="20" cy="24" rx="5.5" ry="3.5" fill={color} opacity="0.45" transform="rotate(-20 20 24)" />
        {[0,1,2,3,4,5,6,7].map(i => (
          <motion.circle key={i} cx={16+i*5} cy={14+(i%3)*6} r={1.2+(i%3)*0.4} fill="white" opacity={0.06+(i%3)*0.03}
            animate={{ opacity: [0.06+(i%3)*0.03,0.12+(i%3)*0.03,0.06+(i%3)*0.03] }}
            transition={{ duration: 2, repeat: Infinity, delay: i*0.3 }} />
        ))}
        <path d="M16,12 Q28,9 44,13" fill="none" stroke="white" strokeWidth="0.4" opacity="0.06" />
        <path d="M16,27 Q28,29 44,25" fill="none" stroke="white" strokeWidth="0.4" opacity="0.05" />
        <circle cx="16" cy="17" r="6.5" fill="white" />
        <circle cx="16" cy="17" r="6" fill="#FAFAFA" />
        <circle cx="14.5" cy="16.5" r="4.2" fill="#1E293B" />
        <circle cx="14" cy="16" r="3" fill="#0F172A" />
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a} x1={14.5+Math.cos(a*Math.PI/180)*1.5} y1={16.5+Math.sin(a*Math.PI/180)*1.5}
            x2={14.5+Math.cos(a*Math.PI/180)*3.5} y2={16.5+Math.sin(a*Math.PI/180)*3.5}
            stroke="#1E293B" strokeWidth="0.15" opacity="0.3" />
        ))}
        <motion.circle cx="14" cy="16" r="2.5" fill="#050510"
          animate={{ r: [2.5,2.2,2.5] }} transition={{ duration: 3, repeat: Infinity }} />
        <ellipse cx="12.5" cy="14.5" rx="2" ry="1.5" fill="white" opacity="0.92" transform="rotate(-10 12.5 14.5)" />
        <circle cx="15.5" cy="17.5" r="0.8" fill="white" opacity="0.45" />
        <path d="M6,22 Q9,25.5 6,29" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      </g>
    </motion.svg>
  )
}

// ═══════════════════ BAYKUŞ ═══════════════════
export function OwlSVG({ size = 80, blinking = true }: { size?: number; blinking?: boolean }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 90 95"
      animate={{ rotate: [0,1.5,-1.5,0] }} transition={{ duration: 5, repeat: Infinity, ease: [0.45,0.05,0.55,0.95] }}>
      <defs>
        <radialGradient id={`ob${u}`} cx="48%" cy="38%">
          <stop offset="0%" stopColor="#C8A888" /><stop offset="30%" stopColor="#9B7B60" />
          <stop offset="60%" stopColor="#7A5D45" /><stop offset="100%" stopColor="#4A3020" />
        </radialGradient>
        <radialGradient id={`oe${u}`} cx="35%" cy="28%">
          <stop offset="0%" stopColor="#FFD080" /><stop offset="50%" stopColor="#FFB347" /><stop offset="100%" stopColor="#D87A0C" />
        </radialGradient>
        <radialGradient id={`od${u}`} cx="50%" cy="45%">
          <stop offset="0%" stopColor="#FFF5E8" /><stop offset="60%" stopColor="#F5E6D3" /><stop offset="100%" stopColor="#D4C0A8" />
        </radialGradient>
        <filter id={`os${u}`}><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1A0E05" floodOpacity="0.3" /></filter>
        <filter id={`of${u}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" />
        </filter>
        <filter id={`ol${u}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" />
          <feSpecularLighting in="b" surfaceScale="2.5" specularConstant="0.5" specularExponent="20" lightingColor="#FFF0D8" result="s">
            <fePointLight x="40" y="15" z="35" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sc" />
          <feComposite in="SourceGraphic" in2="sc" operator="arithmetic" k1="0" k2="1" k3="0.25" k4="0" />
        </filter>
      </defs>
      <ellipse cx="45" cy="93" rx="20" ry="3" fill="#0A0500" opacity="0.1" />
      {/* Gövde */}
      <g filter={`url(#ol${u})`}>
        <motion.ellipse cx="45" cy="60" rx="25" ry="28" fill={`url(#ob${u})`} filter={`url(#os${u})`}
          animate={{ ry: [28,28.5,28] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      </g>
      <ellipse cx="45" cy="60" rx="24" ry="27" fill={`url(#ob${u})`} opacity="0.1" filter={`url(#of${u})`} />
      {/* Karın V desenleri */}
      <ellipse cx="45" cy="64" rx="17" ry="21" fill="#D4B896" />
      {[0,1,2,3,4,5].map(i => <path key={i} d={`M${37+i*1.5},${50+i*5} L45,${46+i*5} L${53-i*1.5},${50+i*5}`} fill="#C4A880" opacity={0.55-i*0.07} />)}
      {/* Kanatlar */}
      <path d="M20,48 Q8,58 14,78 Q22,68 24,56 Z" fill="#3A2418" filter={`url(#os${u})`} />
      <path d="M21,50 Q12,58 16,72 Q22,65 23,55 Z" fill="#5A3D2E" opacity="0.5" />
      <path d="M70,48 Q82,58 76,78 Q68,68 66,56 Z" fill="#3A2418" filter={`url(#os${u})`} />
      <path d="M69,50 Q78,58 74,72 Q68,65 67,55 Z" fill="#5A3D2E" opacity="0.5" />
      {/* Kafa */}
      <circle cx="45" cy="32" r="22" fill={`url(#ob${u})`} filter={`url(#os${u})`} />
      <circle cx="45" cy="32" r="21" fill={`url(#ob${u})`} opacity="0.08" filter={`url(#of${u})`} />
      {/* Kulak tüyleri */}
      <path d="M24,16 L28,3 L34,15" fill="#4A3020" stroke="#3A2015" strokeWidth="0.4" />
      <path d="M26,15 L29,5 L32,14" fill="#6A4D38" opacity="0.45" />
      <path d="M66,16 L62,3 L56,15" fill="#4A3020" stroke="#3A2015" strokeWidth="0.4" />
      <path d="M64,15 L61,5 L58,14" fill="#6A4D38" opacity="0.45" />
      {/* Göz diskleri */}
      <circle cx="35" cy="30" r="12.5" fill={`url(#od${u})`} stroke="#C8B090" strokeWidth="0.4" />
      <circle cx="55" cy="30" r="12.5" fill={`url(#od${u})`} stroke="#C8B090" strokeWidth="0.4" />
      {/* İris */}
      <circle cx="35" cy="30" r="7.5" fill={`url(#oe${u})`} />
      <circle cx="55" cy="30" r="7.5" fill={`url(#oe${u})`} />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
        <line key={a} x1={35+Math.cos(a*Math.PI/180)*3} y1={30+Math.sin(a*Math.PI/180)*3}
          x2={35+Math.cos(a*Math.PI/180)*6.5} y2={30+Math.sin(a*Math.PI/180)*6.5}
          stroke="#C87A0C" strokeWidth="0.2" opacity="0.15" />
      ))}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
        <line key={`r${a}`} x1={55+Math.cos(a*Math.PI/180)*3} y1={30+Math.sin(a*Math.PI/180)*3}
          x2={55+Math.cos(a*Math.PI/180)*6.5} y2={30+Math.sin(a*Math.PI/180)*6.5}
          stroke="#C87A0C" strokeWidth="0.2" opacity="0.15" />
      ))}
      {/* Pupiller */}
      <motion.ellipse cx="35" cy="30" rx="4.5" ry="4.5" fill="#1A1A2E"
        animate={blinking ? { ry: [4.5,0.3,4.5] } : {}} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4.5 }} />
      <motion.ellipse cx="55" cy="30" rx="4.5" ry="4.5" fill="#1A1A2E"
        animate={blinking ? { ry: [4.5,0.3,4.5] } : {}} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4.5 }} />
      {/* Kornea yansıma */}
      <ellipse cx="33" cy="27" rx="2.2" ry="1.6" fill="white" opacity="0.9" transform="rotate(-8 33 27)" />
      <ellipse cx="53" cy="27" rx="2.2" ry="1.6" fill="white" opacity="0.9" transform="rotate(-8 53 27)" />
      <circle cx="36.5" cy="31.5" r="0.9" fill="white" opacity="0.4" />
      <circle cx="56.5" cy="31.5" r="0.9" fill="white" opacity="0.4" />
      {/* Gaga */}
      <path d="M41,38 L45,46 L49,38 Z" fill="#E8A33C" stroke="#C8882A" strokeWidth="0.6" />
      <path d="M42.5,39 L45,44 L47.5,39 Z" fill="#F0C050" opacity="0.3" />
      <ellipse cx="44" cy="39" rx="0.8" ry="0.5" fill="white" opacity="0.2" />
      {/* Ayaklar */}
      <g fill="#E8A33C" stroke="#C8882A" strokeWidth="0.3">
        <path d="M36,85 L29,93 L33,90 L37,93 L41,90 L36,85" />
        <path d="M54,85 L47,93 L51,90 L55,93 L59,90 L54,85" />
      </g>
    </motion.svg>
  )
}

// ═══════════════════ BALON ═══════════════════
export function BalloonSVG({ color, size = 55 }: { color: string; size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size*1.45} viewBox="0 0 50 72"
      animate={{ y: [0,-3,0], rotate: [0,1.5,-1.5,0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`bl${u}`} cx="33%" cy="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" /><stop offset="18%" stopColor="white" stopOpacity="0.15" />
          <stop offset="35%" stopColor={color} stopOpacity="0.95" /><stop offset="75%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
        <filter id={`bs${u}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b" /><feOffset in="b" dy="4" result="o" />
          <feFlood floodColor={color} floodOpacity="0.25" result="c" /><feComposite in="c" in2="o" operator="in" result="s" />
          <feMerge><feMergeNode in="s" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="25" cy="26" rx="22" ry="26" fill={`url(#bl${u})`} filter={`url(#bs${u})`} />
      <ellipse cx="15" cy="14" rx="9" ry="13" fill="white" opacity="0.22" transform="rotate(-20 15 14)" />
      <ellipse cx="12" cy="11" rx="4" ry="7" fill="white" opacity="0.18" transform="rotate(-20 12 11)" />
      <ellipse cx="10" cy="9" rx="2" ry="3.5" fill="white" opacity="0.12" transform="rotate(-20 10 9)" />
      <ellipse cx="25" cy="40" rx="18" ry="10" fill="black" opacity="0.07" />
      <path d="M22,51 L25,56 L28,51" fill={color} opacity="0.9" />
      <circle cx="25" cy="52" r="1.8" fill={color} stroke="white" strokeWidth="0.3" opacity="0.5" />
      <motion.path d="M25,56 Q22,62 26,66 Q23,70 25,72" fill="none" stroke={color} strokeWidth="0.7" opacity="0.3" strokeLinecap="round"
        animate={{ d: ['M25,56 Q22,62 26,66 Q23,70 25,72','M25,56 Q28,62 24,66 Q27,70 25,72'] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }} />
    </motion.svg>
  )
}

// ═══════════════════ KELEBEK ═══════════════════
export function ButterflySVG({ size = 40, color = '#818CF8' }: { size?: number; color?: string }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 60 60"
      animate={{ y: [0,-3,0], rotate: [0,3,-3,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`bw${u}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" /><stop offset="40%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
        <filter id={`bws${u}`}><feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={color} floodOpacity="0.3" /></filter>
      </defs>
      <ellipse cx="30" cy="30" rx="2.2" ry="11" fill="#3D2818" />
      <motion.ellipse cx="19" cy="23" rx="11" ry="13" fill={`url(#bw${u})`} filter={`url(#bws${u})`}
        animate={{ rx: [11,9.5,11] }} transition={{ duration: 0.8, repeat: Infinity }} />
      <motion.ellipse cx="41" cy="23" rx="11" ry="13" fill={`url(#bw${u})`} filter={`url(#bws${u})`}
        animate={{ rx: [11,9.5,11] }} transition={{ duration: 0.8, repeat: Infinity }} />
      <circle cx="17" cy="21" r="4" fill="white" opacity="0.15" />
      <circle cx="43" cy="21" r="4" fill="white" opacity="0.15" />
      <circle cx="20" cy="26" r="2.5" fill="white" opacity="0.1" />
      <circle cx="40" cy="26" r="2.5" fill="white" opacity="0.1" />
      <ellipse cx="23" cy="39" rx="7" ry="9" fill={color} opacity="0.6" />
      <ellipse cx="37" cy="39" rx="7" ry="9" fill={color} opacity="0.6" />
      <circle cx="30" cy="17" r="3" fill="#3D2818" />
      <line x1="28" y1="15" x2="23" y2="9" stroke="#3D2818" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="32" y1="15" x2="37" y2="9" stroke="#3D2818" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="23" cy="9" r="1.2" fill={color} opacity="0.6" />
      <circle cx="37" cy="9" r="1.2" fill={color} opacity="0.6" />
    </motion.svg>
  )
}

// ═══════════════════ TAVŞAN ═══════════════════
export function RabbitSVG({ size = 40 }: { size?: number }) {
  const u = useId().replace(/:/g, '')
  return (
    <motion.svg width={size} height={size} viewBox="0 0 80 80"
      animate={{ y: [0,-1.5,0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`rb${u}`} cx="45%" cy="38%">
          <stop offset="0%" stopColor="#FAF8F5" /><stop offset="30%" stopColor="#F0ECE6" />
          <stop offset="60%" stopColor="#E0DAD2" /><stop offset="100%" stopColor="#C8C0B8" />
        </radialGradient>
        <filter id={`rs${u}`}><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" /></filter>
        <filter id={`rf${u}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1" />
        </filter>
      </defs>
      <ellipse cx="40" cy="74" rx="14" ry="2.5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="40" cy="50" rx="15" ry="19" fill={`url(#rb${u})`} filter={`url(#rs${u})`} />
      <ellipse cx="40" cy="50" rx="14" ry="18" fill={`url(#rb${u})`} opacity="0.08" filter={`url(#rf${u})`} />
      <circle cx="40" cy="33" r="15" fill={`url(#rb${u})`} filter={`url(#rs${u})`} />
      <ellipse cx="32" cy="12" rx="5.5" ry="17" fill={`url(#rb${u})`} />
      <ellipse cx="32" cy="12" rx="3.2" ry="13" fill="#F2C4C4" />
      <ellipse cx="32" cy="10" rx="1.8" ry="8" fill="#E8A8A8" opacity="0.3" />
      <ellipse cx="48" cy="12" rx="5.5" ry="17" fill={`url(#rb${u})`} />
      <ellipse cx="48" cy="12" rx="3.2" ry="13" fill="#F2C4C4" />
      <ellipse cx="48" cy="10" rx="1.8" ry="8" fill="#E8A8A8" opacity="0.3" />
      <circle cx="34" cy="31" r="4" fill="white" />
      <circle cx="46" cy="31" r="4" fill="white" />
      <circle cx="35" cy="31" r="2.2" fill="#3D2020" />
      <circle cx="47" cy="31" r="2.2" fill="#3D2020" />
      <circle cx="35.5" cy="30" r="1" fill="white" opacity="0.88" />
      <circle cx="47.5" cy="30" r="1" fill="white" opacity="0.88" />
      <ellipse cx="40" cy="37" rx="3" ry="2" fill="#F0AAA8" />
      <ellipse cx="39.5" cy="36.5" rx="1" ry="0.6" fill="white" opacity="0.25" />
      <path d="M38,39 Q40,41 42,39" fill="none" stroke="#C09090" strokeWidth="0.8" />
      <line x1="30" y1="37" x2="36" y2="36" stroke="#D0C0B0" strokeWidth="0.5" opacity="0.3" />
      <line x1="30" y1="39" x2="36" y2="38" stroke="#D0C0B0" strokeWidth="0.5" opacity="0.25" />
      <line x1="50" y1="37" x2="44" y2="36" stroke="#D0C0B0" strokeWidth="0.5" opacity="0.3" />
      <line x1="50" y1="39" x2="44" y2="38" stroke="#D0C0B0" strokeWidth="0.5" opacity="0.25" />
      <circle cx="40" cy="67" r="5" fill="white" opacity="0.8" />
      <circle cx="39" cy="66" r="2" fill="white" opacity="0.15" />
    </motion.svg>
  )
}
