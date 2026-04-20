import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// === CHILD FLOW — Eager load (ana kullanıcı akışı, 5-11 yaş çocuk) ===
// Bunlar core flow olduğu için eager load; ilk etkileşim hızı kritik
import SplashPage from '@/pages/student/SplashPage'
import ModeSelectPage from '@/pages/student/ModeSelectPage'
import GradeSelectPage from '@/pages/student/GradeSelectPage'
import AvatarSelectPage from '@/pages/student/AvatarSelectPage'

// === LAZY LOADED ROUTES ===
// GalaxyMap + Game: ikincil etkileşim, ilk ekrandan sonra lazy
const GalaxyMapPage = lazy(() => import('@/pages/student/GalaxyMapPage'))
const GamePage = lazy(() => import('@/pages/student/GamePage'))

// Teacher pages: çoğu kullanıcı (çocuk) için hiç yüklenmez, büyük kazanım
const TeacherLoginPage = lazy(() => import('@/pages/teacher/TeacherLoginPage'))
const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage'))
const ClassStudentsPage = lazy(() => import('@/pages/teacher/ClassStudentsPage'))
const StudentDetailPage = lazy(() => import('@/pages/teacher/StudentDetailPage'))
const FeedbackInsightsPage = lazy(() => import('@/pages/teacher/FeedbackInsightsPage'))

/** Lazy chunk yüklenirken gösterilen basit, çocuk dostu ekran. */
function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060A1A' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-purple-400 animate-spin" />
        <p className="text-white/40 text-sm font-bold">Yükleniyor...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Child Flow — eager (ilk açılış hızı için) */}
          <Route path="/" element={<SplashPage />} />
          <Route path="/mode" element={<ModeSelectPage />} />
          <Route path="/grade" element={<GradeSelectPage />} />
          <Route path="/avatar" element={<AvatarSelectPage />} />

          {/* Child Flow — lazy (sonraki adımlar) */}
          <Route path="/galaxy" element={<GalaxyMapPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />

          {/* Teacher Flow — hepsi lazy (çocuk buraya inmez) */}
          <Route path="/teacher" element={<TeacherLoginPage />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
          <Route path="/teacher/class/:classId" element={<ClassStudentsPage />} />
          <Route path="/teacher/student/:studentId" element={<StudentDetailPage />} />
          <Route path="/teacher/feedback" element={<FeedbackInsightsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
