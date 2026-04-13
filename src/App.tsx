import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Pages — Child Flow
import SplashPage from '@/pages/student/SplashPage'
import ModeSelectPage from '@/pages/student/ModeSelectPage'
import GradeSelectPage from '@/pages/student/GradeSelectPage'
import AvatarSelectPage from '@/pages/student/AvatarSelectPage'
import GalaxyMapPage from '@/pages/student/GalaxyMapPage'
import GamePage from '@/pages/student/GamePage'

// Pages — Teacher Flow
import TeacherLoginPage from '@/pages/teacher/TeacherLoginPage'
import TeacherDashboardPage from '@/pages/teacher/TeacherDashboardPage'
import ClassStudentsPage from '@/pages/teacher/ClassStudentsPage'
import StudentDetailPage from '@/pages/teacher/StudentDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Child Flow */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/mode" element={<ModeSelectPage />} />
        <Route path="/grade" element={<GradeSelectPage />} />
        <Route path="/avatar" element={<AvatarSelectPage />} />
        <Route path="/galaxy" element={<GalaxyMapPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />

        {/* Teacher Flow */}
        <Route path="/teacher" element={<TeacherLoginPage />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/class/:classId" element={<ClassStudentsPage />} />
        <Route path="/teacher/student/:studentId" element={<StudentDetailPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
