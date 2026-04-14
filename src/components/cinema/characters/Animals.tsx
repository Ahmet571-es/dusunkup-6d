/**
 * Ultra Kalite SVG Hayvan Karakterleri
 * Profesyonel illüstrasyon seviyesi: kürk dokusu, ışık/gölge,
 * çoklu katman, detaylı yüz ifadeleri, mikro animasyonlar
 */
import { motion } from 'framer-motion'

// === SİNCAP — Ultra Detaylı ===
export function SquirrelSVG({ size = 80, happy = false, counting = false }: { size?: number; happy?: boolean; counting?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100"
      animate={happy ? { y: [0, -4, 0] } : counting ? { rotate: [0, -3, 3, 0] } : {}}
      transition={{ duration: happy ? 0.5 : 0.8, repeat: counting ? Infinity : 0 }}>
      <defs>
        {/* Kürk gradient'ları */}
        <radialGradient id="sqBody" cx="45%" cy="40%">
          <stop offset="0%" stopColor="#E8A84C" />
          <stop offset="60%" stopColor="#D4883A" />
          <stop offset="100%" stopColor="#B5702D" />
        </radialGradient>
        <radialGradient id="sqBelly" cx="50%" cy="35%">
          <stop offset="0%" stopColor="#FBE9C7" />
          <stop offset="100%" stopColor="#F0D5A0" />
        </radialGradient>
        <radialGradient id="sqHead" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#EDBA5E" />
          <stop offset="70%" stopColor="#D4883A" />
          <stop offset="100%" stopColor="#C07830" />
        </radialGradient>
        <radialGradient id="sqEye" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#3D2010" />
          <stop offset="100%" stopColor="#1A0E06" />
        </radialGradient>
        <radialGradient id="sqNose" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#4A2818" />
          <stop offset="100%" stopColor="#2D1B0E" />
        </radialGradient>
        <filter id="sqShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1A0E06" floodOpacity="0.25" />
        </filter>
        <filter id="sqFur">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
        </filter>
      </defs>

      <g filter="url(#sqShadow)">
        {/* Kuyruk — kabarık, çok katmanlı */}
        <motion.path d="M62,58 Q78,30 72,12 Q68,2 56,8 Q48,14 52,28 Q54,40 58,52"
          fill="url(#sqBody)" stroke="#B5702D" strokeWidth="0.8"
          animate={happy ? { d: 'M62,58 Q82,25 75,8 Q70,-2 58,5 Q50,12 54,26 Q56,38 58,52' } : {}}
          transition={{ duration: 0.5 }} />
        {/* Kuyruk kürk çizgileri */}
        <path d="M65,20 Q62,25 64,32" fill="none" stroke="#C8923B" strokeWidth="0.5" opacity="0.4" />
        <path d="M60,15 Q58,22 61,28" fill="none" stroke="#E8B060" strokeWidth="0.5" opacity="0.3" />
        <path d="M68,25 Q65,30 67,38" fill="none" stroke="#C8923B" strokeWidth="0.5" opacity="0.3" />

        {/* Gövde */}
        <ellipse cx="48" cy="60" rx="20" ry="22" fill="url(#sqBody)" />
        {/* Karın */}
        <ellipse cx="48" cy="64" rx="13" ry="15" fill="url(#sqBelly)" />
        {/* Karın kürk dokusu */}
        <path d="M42,55 Q45,58 43,62" fill="none" stroke="#E8D0A8" strokeWidth="0.3" opacity="0.5" />
        <path d="M50,54 Q52,58 50,63" fill="none" stroke="#E8D0A8" strokeWidth="0.3" opacity="0.4" />

        {/* Ön patiler */}
        <ellipse cx="36" cy="72" rx="5" ry="3" fill="#C8843A" transform="rotate(-15 36 72)" />
        <ellipse cx="60" cy="72" rx="5" ry="3" fill="#C8843A" transform="rotate(15 60 72)" />
        {/* Pati detayları */}
        <path d="M34,71 L33,73" stroke="#A06828" strokeWidth="0.5" />
        <path d="M36,71 L35,74" stroke="#A06828" strokeWidth="0.5" />
        <path d="M38,71 L37,73" stroke="#A06828" strokeWidth="0.5" />

        {/* Arka patiler */}
        <ellipse cx="34" cy="80" rx="7" ry="4" fill="#C07830" />
        <ellipse cx="62" cy="80" rx="7" ry="4" fill="#C07830" />

        {/* Kafa */}
        <circle cx="48" cy="34" r="18" fill="url(#sqHead)" />

        {/* Kulaklar — yuvarlak, iç detaylı */}
        <ellipse cx="33" cy="20" rx="6" ry="9" fill="#D4883A" stroke="#C07830" strokeWidth="0.8" />
        <ellipse cx="33" cy="20" rx="3.5" ry="6" fill="#F5D6A0" />
        <ellipse cx="33" cy="19" rx="2" ry="4" fill="#EDCBA0" opacity="0.5" />
        <ellipse cx="63" cy="20" rx="6" ry="9" fill="#D4883A" stroke="#C07830" strokeWidth="0.8" />
        <ellipse cx="63" cy="20" rx="3.5" ry="6" fill="#F5D6A0" />
        <ellipse cx="63" cy="19" rx="2" ry="4" fill="#EDCBA0" opacity="0.5" />

        {/* Kulak tüy uçları */}
        <path d="M31,12 L30,8 L33,11" fill="#C07830" />
        <path d="M65,12 L66,8 L63,11" fill="#C07830" />

        {/* Yanak tüyleri */}
        <ellipse cx="32" cy="38" rx="6" ry="4" fill="#F0D5A0" opacity="0.6" />
        <ellipse cx="64" cy="38" rx="6" ry="4" fill="#F0D5A0" opacity="0.6" />

        {/* Gözler — ultra detaylı */}
        {/* Sol göz */}
        <ellipse cx="40" cy="32" rx="5.5" ry="6" fill="white" />
        <ellipse cx="40" cy="32" rx="5" ry="5.5" fill="#FAFAFA" />
        <circle cx="41" cy="32" r="3.5" fill="url(#sqEye)" />
        <motion.circle cx="41" cy="32" r="3.5" fill="url(#sqEye)"
          animate={happy ? { ry: [3.5, 1, 3.5] } : {}} transition={{ duration: 0.3, delay: 0.2 }} />
        {/* Işık yansımaları */}
        <circle cx="39.5" cy="30" r="1.5" fill="white" opacity="0.9" />
        <circle cx="42" cy="33.5" r="0.7" fill="white" opacity="0.5" />

        {/* Sağ göz */}
        <ellipse cx="56" cy="32" rx="5.5" ry="6" fill="white" />
        <ellipse cx="56" cy="32" rx="5" ry="5.5" fill="#FAFAFA" />
        <circle cx="57" cy="32" r="3.5" fill="url(#sqEye)" />
        <circle cx="55.5" cy="30" r="1.5" fill="white" opacity="0.9" />
        <circle cx="58" cy="33.5" r="0.7" fill="white" opacity="0.5" />

        {/* Kaşlar — ifade */}
        {happy ? (
          <>
            <path d="M35,27 Q38,25 42,26" fill="none" stroke="#8B5E30" strokeWidth="1" strokeLinecap="round" />
            <path d="M54,26 Q58,25 61,27" fill="none" stroke="#8B5E30" strokeWidth="1" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M36,27 Q39,26 43,27" fill="none" stroke="#8B5E30" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M53,27 Q57,26 60,27" fill="none" stroke="#8B5E30" strokeWidth="0.8" strokeLinecap="round" />
          </>
        )}

        {/* Burun — 3D */}
        <ellipse cx="48" cy="39" rx="3.5" ry="2.5" fill="url(#sqNose)" />
        <ellipse cx="47" cy="38.5" rx="1.5" ry="1" fill="#5A3520" opacity="0.3" />
        {/* Burun parlama */}
        <ellipse cx="47.5" cy="38" rx="1" ry="0.6" fill="white" opacity="0.15" />

        {/* Ağız */}
        <motion.path
          d={happy ? "M42,42 Q48,50 54,42" : "M44,43 Q48,46 52,43"}
          fill={happy ? "rgba(180,80,60,0.3)" : "none"}
          stroke="#6B4020" strokeWidth="1.2" strokeLinecap="round"
        />
        {/* Alt dudak çizgisi */}
        <path d="M46,43 L48,45 L50,43" fill="none" stroke="#8B5E30" strokeWidth="0.5" opacity="0.4" />

        {/* Bıyıklar — uzun, kıvrımlı */}
        <path d="M22,36 Q30,35 37,38" fill="none" stroke="#A07040" strokeWidth="0.6" opacity="0.5" />
        <path d="M20,40 Q30,38 37,40" fill="none" stroke="#A07040" strokeWidth="0.6" opacity="0.4" />
        <path d="M22,44 Q30,42 37,42" fill="none" stroke="#A07040" strokeWidth="0.6" opacity="0.35" />
        <path d="M74,36 Q66,35 59,38" fill="none" stroke="#A07040" strokeWidth="0.6" opacity="0.5" />
        <path d="M76,40 Q66,38 59,40" fill="none" stroke="#A07040" strokeWidth="0.6" opacity="0.4" />
        <path d="M74,44 Q66,42 59,42" fill="none" stroke="#A07040" strokeWidth="0.6" opacity="0.35" />

        {/* Fındık (mutluyken elinde tutar) */}
        {happy && (
          <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
            <ellipse cx="48" cy="75" rx="6" ry="5" fill="#8B6341" />
            <ellipse cx="48" cy="74" rx="5" ry="3.5" fill="#A07854" />
            <ellipse cx="46" cy="73" rx="2" ry="1.5" fill="#B8956C" opacity="0.4" />
            {/* Fındık kabuğu çizgileri */}
            <path d="M44,74 Q48,72 52,74" fill="none" stroke="#6B4C2A" strokeWidth="0.5" opacity="0.3" />
          </motion.g>
        )}

        {/* Sayma göstergesi (counting modunda parmak) */}
        {counting && (
          <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>
            <circle cx="65" cy="55" r="4" fill="#E8A84C" />
            <rect x="63" y="48" width="4" height="8" rx="2" fill="#E8A84C" />
          </motion.g>
        )}
      </g>
    </motion.svg>
  )
}

// === BALIK — Ultra Detaylı ===
export function FishSVG({ size = 55, direction = 'right', color = '#3B82F6', variant = 0 }: { size?: number; direction?: 'left' | 'right'; color?: string; variant?: number }) {
  const flip = direction === 'left' ? -1 : 1
  const bodyColors = [color, '#22C55E', '#EAB308', '#A855F7', '#EC4899', '#F97316']
  const bodyColor = bodyColors[variant % bodyColors.length] || color
  
  return (
    <motion.svg width={size} height={size * 0.65} viewBox="0 0 70 45"
      animate={{ y: [0, -2, 0] }} transition={{ duration: 2 + variant * 0.3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id={`fishBody_${direction}_${variant}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
          <stop offset="70%" stopColor={bodyColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor={bodyColor} stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id={`fishBelly_${direction}_${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={bodyColor} />
          <stop offset="100%" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
        <filter id={`fishGlow_${variant}`}>
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={bodyColor} floodOpacity="0.3" />
        </filter>
      </defs>
      <g transform={`scale(${flip}, 1) translate(${flip === -1 ? -70 : 0}, 0)`} filter={`url(#fishGlow_${variant})`}>
        {/* Gövde — organik form */}
        <path d="M12,22 Q8,14 14,8 Q22,2 34,4 Q46,6 52,14 Q56,20 52,28 Q46,36 34,38 Q22,40 14,34 Q8,28 12,22 Z"
          fill={`url(#fishBody_${direction}_${variant})`} />
        
        {/* Karın — açık ton */}
        <path d="M16,24 Q14,20 18,16 Q26,12 36,14 Q44,16 48,20 Q50,24 48,28 Q42,32 34,33 Q24,34 18,30 Q14,28 16,24 Z"
          fill="white" opacity="0.12" />
        
        {/* Kuyruk — zarif */}
        <path d="M52,22 L66,8 L62,22 L66,36 Z" fill={bodyColor} opacity="0.8" />
        <path d="M54,22 L63,12 L60,22 L63,32 Z" fill={bodyColor} opacity="0.5" />
        
        {/* Sırt yüzgeci */}
        <path d="M26,4 Q32,0 38,2 Q36,6 30,6 Z" fill={bodyColor} opacity="0.75" />
        
        {/* Karın yüzgeci */}
        <path d="M28,34 Q32,40 36,36 Q34,34 30,34 Z" fill={bodyColor} opacity="0.6" />
        
        {/* Yan yüzgeç */}
        <motion.path d="M22,22 Q18,28 24,30 Q22,26 22,22 Z" fill={bodyColor} opacity="0.5"
          animate={{ d: ['M22,22 Q18,28 24,30 Q22,26 22,22 Z', 'M22,22 Q16,26 24,28 Q22,24 22,22 Z'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }} />
        
        {/* Pul deseni */}
        {[
          [28, 16], [34, 14], [40, 16], [26, 22], [32, 20], [38, 20], [44, 20],
          [28, 28], [34, 26], [40, 24], [26, 24], [44, 26], [32, 30],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.8} fill="white" opacity={0.06 + (i % 3) * 0.02} />
        ))}
        
        {/* Çizgi deseni (lateral line) */}
        <path d="M16,22 Q24,20 34,20 Q44,20 50,22" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.3" />
        
        {/* Göz — ultra detaylı */}
        <circle cx="18" cy="18" r="6" fill="white" />
        <circle cx="18" cy="18" r="5.5" fill="#F8FAFC" />
        <circle cx="16.5" cy="17" r="3.5" fill="#0F172A" />
        <circle cx="16.5" cy="17" r="2.5" fill="#1E293B" />
        {/* İris detayı */}
        <circle cx="16.5" cy="17" r="1.8" fill="#334155" />
        {/* Işık yansımaları */}
        <circle cx="15.5" cy="15.5" r="1.5" fill="white" opacity="0.95" />
        <circle cx="17.5" cy="18.5" r="0.6" fill="white" opacity="0.5" />
        
        {/* Ağız */}
        <path d="M8,22 Q10,25 8,28" fill="none" stroke={bodyColor} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
        
        {/* Solungaç çizgisi */}
        <path d="M22,14 Q20,20 22,26" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.2" />
      </g>
    </motion.svg>
  )
}

// === BAYKUŞ — Ultra Detaylı ===
export function OwlSVG({ size = 80, blinking = true }: { size?: number; blinking?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100"
      animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <defs>
        <radialGradient id="owlBody" cx="50%" cy="35%">
          <stop offset="0%" stopColor="#9B7B64" />
          <stop offset="100%" stopColor="#6B4C3B" />
        </radialGradient>
        <radialGradient id="owlEyeDisc" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#F0E6D6" />
        </radialGradient>
        <radialGradient id="owlIris" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="50%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#CC6600" />
        </radialGradient>
        <filter id="owlShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2D1B0E" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#owlShadow)">
        {/* Gövde */}
        <ellipse cx="50" cy="62" rx="24" ry="28" fill="url(#owlBody)" />
        {/* Karın tüy deseni */}
        <ellipse cx="50" cy="66" rx="16" ry="20" fill="#C9A882" />
        {[0,1,2,3,4].map(i => (
          <path key={i} d={`M${40+i*2},${52+i*5} L50,${48+i*5} L${60-i*2},${52+i*5} L50,${56+i*5} Z`}
            fill="#B8956C" opacity={0.4 - i * 0.06} />
        ))}
        {/* Kanatlar */}
        <path d="M26,48 Q16,58 22,78 Q28,72 30,58 Z" fill="#5A3D2E" />
        <path d="M74,48 Q84,58 78,78 Q72,72 70,58 Z" fill="#5A3D2E" />
        {/* Kanat tüy çizgileri */}
        <path d="M24,55 Q26,62 24,70" fill="none" stroke="#4A2E1E" strokeWidth="0.5" opacity="0.4" />
        <path d="M76,55 Q74,62 76,70" fill="none" stroke="#4A2E1E" strokeWidth="0.5" opacity="0.4" />
        {/* Kafa */}
        <circle cx="50" cy="34" r="22" fill="#8B6B56" />
        {/* Kulak tüyleri */}
        <path d="M30,18 L32,4 L38,16" fill="#6B4C3B" />
        <path d="M32,16 L34,8 L36,15" fill="#7D5D4A" opacity="0.5" />
        <path d="M70,18 L68,4 L62,16" fill="#6B4C3B" />
        <path d="M68,16 L66,8 L64,15" fill="#7D5D4A" opacity="0.5" />
        {/* Göz diskleri — detaylı kenar */}
        <circle cx="38" cy="32" r="12" fill="url(#owlEyeDisc)" stroke="#D4C4B0" strokeWidth="0.5" />
        <circle cx="62" cy="32" r="12" fill="url(#owlEyeDisc)" stroke="#D4C4B0" strokeWidth="0.5" />
        {/* İris */}
        <circle cx="38" cy="32" r="7" fill="url(#owlIris)" />
        <circle cx="62" cy="32" r="7" fill="url(#owlIris)" />
        {/* Pupil */}
        <motion.circle cx="38" cy="32" r="4.5" fill="#1A1A2E"
          animate={blinking ? { r: [4.5, 0.3, 4.5] } : {}}
          transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 4 }} />
        <motion.circle cx="62" cy="32" r="4.5" fill="#1A1A2E"
          animate={blinking ? { r: [4.5, 0.3, 4.5] } : {}}
          transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 4 }} />
        {/* Göz parlamaları */}
        <circle cx="36" cy="29.5" r="2" fill="white" opacity="0.9" />
        <circle cx="39" cy="34" r="0.8" fill="white" opacity="0.5" />
        <circle cx="60" cy="29.5" r="2" fill="white" opacity="0.9" />
        <circle cx="63" cy="34" r="0.8" fill="white" opacity="0.5" />
        {/* Gaga — 3D */}
        <path d="M46,40 L50,48 L54,40 Z" fill="#E8A33C" />
        <path d="M47,40 L50,46 L50,40 Z" fill="#F0B84C" opacity="0.5" />
        <path d="M50,40 L50,46 L53,40 Z" fill="#D4903A" opacity="0.5" />
        {/* Ayaklar */}
        <g fill="#E8A33C" stroke="#D4903A" strokeWidth="0.5">
          <path d="M38,88 L34,96 L38,93 L42,96 L38,88" />
          <path d="M62,88 L58,96 L62,93 L66,96 L62,88" />
        </g>
      </g>
    </motion.svg>
  )
}

// === BALON — Ultra Detaylı ===
export function BalloonSVG({ color, size = 56 }: { color: string; size?: number }) {
  const id = `b${color.replace('#','')}_${Math.random().toString(36).slice(2,6)}`
  return (
    <svg width={size} height={size * 1.45} viewBox="0 0 52 75">
      <defs>
        <radialGradient id={`bg${id}`} cx="35%" cy="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="25%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </radialGradient>
        <filter id={`sh${id}`}>
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={color} floodOpacity="0.35" />
        </filter>
        <linearGradient id={`edge${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Ana balon gövdesi */}
      <ellipse cx="26" cy="27" rx="23" ry="27" fill={`url(#bg${id})`} filter={`url(#sh${id})`} />
      {/* Kenar highlight */}
      <ellipse cx="26" cy="27" rx="22" ry="26" fill="none" stroke={`url(#edge${id})`} strokeWidth="1" />
      {/* Ana parlama — büyük */}
      <ellipse cx="17" cy="16" rx="8" ry="12" fill="white" opacity="0.25" transform="rotate(-20 17 16)" />
      {/* İkincil parlama — küçük */}
      <ellipse cx="14" cy="12" rx="3.5" ry="6" fill="white" opacity="0.2" transform="rotate(-20 14 12)" />
      {/* Üçüncül parlama — mini */}
      <circle cx="34" cy="36" r="3" fill="white" opacity="0.06" />
      {/* Alt uç — düğüm */}
      <path d="M23,52 L26,58 L29,52" fill={color} opacity="0.85" />
      <circle cx="26" cy="58" r="1.5" fill={color} opacity="0.6" />
      {/* İp — kıvrımlı */}
      <path d="M26,59.5 Q24,63 27,66 Q25,69 26,72 Q24.5,74 25.5,75" fill="none" stroke={color} strokeWidth="0.7" opacity="0.35" strokeLinecap="round" />
    </svg>
  )
}
