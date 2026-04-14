/**
 * Sinematik Oyun Input Bileşenleri
 * Tuş takımı, seçenek butonları — hepsi animasyonlu
 */
import { motion } from 'framer-motion'

// === SİNEMATİK TUŞ TAKIMI ===
export function CinematicKeypad({ onDigit, onClear, onSubmit, value, disabled }: {
  onDigit: (n: number) => void; onClear: () => void; onSubmit: () => void; value: string; disabled: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Display */}
      <motion.div className="w-24 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: `2px ${value ? 'solid' : 'dashed'} rgba(251,191,36,0.3)` }}
        animate={{ borderColor: value ? 'rgba(251,191,36,0.5)' : ['rgba(251,191,36,0.2)', 'rgba(251,191,36,0.4)', 'rgba(251,191,36,0.2)'] }}
        transition={value ? {} : { duration: 2, repeat: Infinity }}>
        <span className="text-3xl font-black text-yellow-300" style={{ textShadow: value ? '0 0 12px rgba(251,191,36,0.4)' : 'none' }}>
          {value || '?'}
        </span>
      </motion.div>

      {/* Keys */}
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
          <motion.button key={n} disabled={disabled}
            className="w-11 h-11 rounded-xl text-lg font-black text-white/90 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }}
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.88 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onDigit(n)}>{n}</motion.button>
        ))}
      </div>
      <div className="flex gap-2">
        <motion.button disabled={disabled} className="px-5 py-2 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}
          whileTap={{ scale: 0.92 }} onClick={onClear}>Sil</motion.button>
        <motion.button disabled={disabled || !value} className="px-6 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
          style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.25)', color: '#6EE7B7' }}
          whileHover={{ boxShadow: '0 0 15px rgba(52,211,153,0.2)' }}
          whileTap={{ scale: 0.92 }} onClick={onSubmit}>Gönder ✓</motion.button>
      </div>
    </div>
  )
}

// === SİNEMATİK SEÇENEK BUTONLARI ===
export function CinematicOptions({ options, onSelect, disabled, type = 'default' }: {
  options: string[]; onSelect: (idx: number) => void; disabled: boolean; type?: 'default' | 'wide' | 'number'
}) {
  const isNumber = type === 'number'
  return (
    <div className={`flex gap-2.5 flex-wrap justify-center ${type === 'wide' ? 'max-w-md' : ''}`}>
      {options.map((opt, i) => (
        <motion.button key={i} disabled={disabled}
          className={`${isNumber ? 'w-14 h-14' : 'px-5 py-3'} rounded-xl font-bold text-white disabled:opacity-30`}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)',
            fontSize: isNumber ? '1.2rem' : '0.875rem',
          }}
          whileHover={{ scale: 1.06, borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(i)}>{opt}</motion.button>
      ))}
    </div>
  )
}
