/**
 * Geri Bildirim Paneli — Öğretmen için çocuk geri bildirimlerini görüntüleme
 *
 * Veri kaynakları:
 *  • localStorage (her tarayıcıda yerel)
 *  • Supabase (opsiyonel, session_feedback tablosu)
 *
 * Gösterir:
 *  • Her oyun için ortalama enjoyment, zorluk dağılımı
 *  • En eğlenceli 5 / en sevilmeyen 5 oyun
 *  • Son bildirimler (tarih sıralı)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { SessionFeedback } from '@/components/shared/SessionFeedback'
import { supabase } from '@/lib/supabase'

interface GameStat {
  gameId: string
  count: number
  avgEnjoyment: number
  easy: number
  right: number
  hard: number
}

function loadLocalFeedback(): SessionFeedback[] {
  try {
    return JSON.parse(localStorage.getItem('dusunkup_feedback') || '[]')
  } catch { return [] }
}

async function loadRemoteFeedback(): Promise<SessionFeedback[]> {
  // Supabase yapılandırılmamışsa sessizce boş dön (env var yok, localStorage-only mod)
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('session_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error || !data) return []
    return data.map(r => ({
      gameId: r.game_id,
      studentId: r.student_id,
      enjoyment: r.enjoyment,
      difficulty: r.difficulty,
      wouldPlayAgain: r.would_play_again,
      createdAt: r.created_at,
      durationSec: r.duration_sec,
      accuracy: r.accuracy,
      score: r.score,
    }))
  } catch { return [] }
}

function computeStats(items: SessionFeedback[]): GameStat[] {
  const groups = new Map<string, SessionFeedback[]>()
  items.forEach(it => {
    const arr = groups.get(it.gameId) || []
    arr.push(it)
    groups.set(it.gameId, arr)
  })

  return Array.from(groups.entries()).map(([gameId, arr]) => ({
    gameId,
    count: arr.length,
    avgEnjoyment: arr.reduce((s, x) => s + x.enjoyment, 0) / arr.length,
    easy:  arr.filter(x => x.difficulty === 'easy').length,
    right: arr.filter(x => x.difficulty === 'right').length,
    hard:  arr.filter(x => x.difficulty === 'hard').length,
  })).sort((a, b) => b.count - a.count)
}

function enjoymentEmoji(v: number): string {
  if (v >= 4.5) return '😄'
  if (v >= 3.5) return '🙂'
  if (v >= 2.5) return '😐'
  if (v >= 1.5) return '😕'
  return '😢'
}

function enjoymentColor(v: number): string {
  if (v >= 4.5) return '#10B981'
  if (v >= 3.5) return '#3B82F6'
  if (v >= 2.5) return '#A1A1AA'
  if (v >= 1.5) return '#F59E0B'
  return '#DC2626'
}

export default function FeedbackInsightsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<SessionFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'local' | 'remote' | 'both'>('both')

  useEffect(() => {
    (async () => {
      const local = loadLocalFeedback()
      const remote = await loadRemoteFeedback()
      // Deduplicate by createdAt+gameId
      const seen = new Set<string>()
      const merged = [...remote, ...local].filter(it => {
        const k = `${it.createdAt}-${it.gameId}`
        if (seen.has(k)) return false
        seen.add(k); return true
      })
      setItems(merged)
      setSource(remote.length > 0 ? (local.length > 0 ? 'both' : 'remote') : 'local')
      setLoading(false)
    })()
  }, [])

  const stats = computeStats(items)
  const top5Loved = [...stats].filter(s => s.count >= 2).sort((a, b) => b.avgEnjoyment - a.avgEnjoyment).slice(0, 5)
  const bottom5 = [...stats].filter(s => s.count >= 2).sort((a, b) => a.avgEnjoyment - b.avgEnjoyment).slice(0, 5)
  const recent = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20)

  return (
    <div className="min-h-screen relative" style={{ background: '#060A1A', fontFamily: 'var(--font-child)' }}>
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">💬 Çocuk Geri Bildirimleri</h1>
            <p className="text-xs text-white/40 mt-1">
              {loading ? 'Yükleniyor...' : `${items.length} bildirim · Kaynak: ${source === 'both' ? 'Yerel + Bulut' : source === 'remote' ? 'Bulut' : 'Yerel'}`}
            </p>
          </div>
          <button onClick={() => navigate('/teacher/dashboard')}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white/80"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            ← Panel
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/40">Bildirimler yükleniyor...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-5xl mb-3">📝</div>
            <p className="text-lg font-bold text-white mb-2">Henüz geri bildirim yok</p>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Çocuklar oyun oynayıp "Harita" butonuna bastıklarında otomatik olarak geri bildirim ister.
              İlk bildirimler geldiğinde burada görünecek.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* En Sevilen */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <h2 className="text-sm font-black text-green-300 mb-3">🏆 En Sevilen Oyunlar</h2>
              {top5Loved.length === 0 ? (
                <p className="text-xs text-white/40">En az 2 bildirimi olan oyun yok</p>
              ) : top5Loved.map(s => (
                <motion.div key={s.gameId} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <span className="text-sm text-white/80">{s.gameId}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl" style={{ color: enjoymentColor(s.avgEnjoyment) }}>{enjoymentEmoji(s.avgEnjoyment)}</span>
                    <span className="text-sm font-bold" style={{ color: enjoymentColor(s.avgEnjoyment) }}>
                      {s.avgEnjoyment.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white/30">({s.count})</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* En Az Sevilen */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <h2 className="text-sm font-black text-red-300 mb-3">⚠️ İlgi Çekmeyen Oyunlar</h2>
              {bottom5.length === 0 ? (
                <p className="text-xs text-white/40">Henüz yeterli veri yok</p>
              ) : bottom5.map(s => (
                <motion.div key={s.gameId} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <span className="text-sm text-white/80">{s.gameId}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl" style={{ color: enjoymentColor(s.avgEnjoyment) }}>{enjoymentEmoji(s.avgEnjoyment)}</span>
                    <span className="text-sm font-bold" style={{ color: enjoymentColor(s.avgEnjoyment) }}>
                      {s.avgEnjoyment.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white/30">({s.count})</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Zorluk Dağılımı */}
            <div className="md:col-span-2 rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-black text-white mb-3">📊 Oyun Bazlı Zorluk Algısı</h2>
              <div className="grid gap-2">
                {stats.slice(0, 12).map(s => {
                  const total = s.easy + s.right + s.hard
                  return (
                    <div key={s.gameId} className="flex items-center gap-3">
                      <span className="text-xs text-white/70 w-32 truncate">{s.gameId}</span>
                      <div className="flex-1 h-5 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {s.easy > 0 && <div style={{ width: `${(s.easy / total) * 100}%`, background: '#10B981' }} title={`Kolay: ${s.easy}`} />}
                        {s.right > 0 && <div style={{ width: `${(s.right / total) * 100}%`, background: '#3B82F6' }} title={`Yerinde: ${s.right}`} />}
                        {s.hard > 0 && <div style={{ width: `${(s.hard / total) * 100}%`, background: '#F97316' }} title={`Zor: ${s.hard}`} />}
                      </div>
                      <span className="text-[10px] text-white/40 w-10 text-right">{total}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 mt-3 text-[10px] text-white/40">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10B981' }} />Kolay</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#3B82F6' }} />Yerinde</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F97316' }} />Zor</span>
              </div>
            </div>

            {/* Son Bildirimler */}
            <div className="md:col-span-2 rounded-2xl p-5" style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-sm font-black text-white mb-3">🕒 Son Bildirimler</h2>
              <div className="grid gap-1 text-xs">
                {recent.map((r, i) => {
                  const face = FACE_MAP[r.enjoyment]
                  return (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-lg">{face.emoji}</span>
                      <span className="text-white/70 flex-1 truncate">{r.gameId}</span>
                      <span className="text-white/40 text-[10px]">{r.difficulty === 'easy' ? 'Kolay' : r.difficulty === 'right' ? 'Yerinde' : 'Zor'}</span>
                      <span className="text-white/30 text-[10px]">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const FACE_MAP: Record<number, { emoji: string }> = {
  1: { emoji: '😢' }, 2: { emoji: '😕' }, 3: { emoji: '😐' }, 4: { emoji: '🙂' }, 5: { emoji: '😄' },
}
