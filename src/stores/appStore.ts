import { create } from 'zustand'
import type { GradeLevel, Student, Teacher, Class, Avatar, GameSession, AttentionProfile, MathProfile, EmotionType } from '@/types'

// === App Mode ===
type AppMode = 'splash' | 'mode_select' | 'child' | 'teacher'

// === Child Flow State ===
interface ChildState {
  gradeLevel: GradeLevel | null
  avatar: Avatar | null
  student: Student | null
  currentGame: string | null
  currentSession: GameSession | null
}

// === Teacher Flow State ===
interface TeacherState {
  teacher: Teacher | null
  selectedClass: Class | null
  selectedStudent: Student | null
  classes: Class[]
  students: Student[]
}

// === 6D Engine State ===
interface EngineState {
  // Adaptive (6D)
  currentDifficulty: Record<string, number>
  bktParams: Record<string, number> // skill_id → P(L)
  
  // Emotion (6D)
  currentEmotion: EmotionType
  emotionConfidence: number
  
  // Assessment
  sessionEvents: Array<Record<string, unknown>>
  
  // Audio (5D)
  musicVolume: number
  sfxVolume: number
  isMuted: boolean
}

// === Combined Store ===
interface AppStore {
  // Mode
  mode: AppMode
  setMode: (mode: AppMode) => void
  
  // Child
  child: ChildState
  setGradeLevel: (grade: GradeLevel) => void
  setAvatar: (avatar: Avatar) => void
  setStudent: (student: Student) => void
  setCurrentGame: (gameId: string | null) => void
  
  // Teacher
  teacher: TeacherState
  setTeacher: (teacher: Teacher) => void
  setSelectedClass: (cls: Class | null) => void
  setSelectedStudent: (student: Student | null) => void
  setClasses: (classes: Class[]) => void
  setStudents: (students: Student[]) => void
  
  // Engine
  engine: EngineState
  updateDifficulty: (axisId: string, value: number) => void
  updateBKT: (skillId: string, pLearned: number) => void
  setEmotion: (emotion: EmotionType, confidence: number) => void
  addGameEvent: (event: Record<string, unknown>) => void
  clearSessionEvents: () => void
  toggleMute: () => void
  
  // Reset
  resetChild: () => void
  resetTeacher: () => void
}

const initialChild: ChildState = {
  gradeLevel: null,
  avatar: null,
  student: null,
  currentGame: null,
  currentSession: null,
}

const initialTeacher: TeacherState = {
  teacher: null,
  selectedClass: null,
  selectedStudent: null,
  classes: [],
  students: [],
}

const initialEngine: EngineState = {
  currentDifficulty: {},
  bktParams: {},
  currentEmotion: 'calm',
  emotionConfidence: 0,
  sessionEvents: [],
  musicVolume: 0.5,
  sfxVolume: 0.7,
  isMuted: false,
}

export const useAppStore = create<AppStore>((set) => ({
  mode: 'splash',
  setMode: (mode) => set({ mode }),
  
  child: initialChild,
  setGradeLevel: (grade) => set((s) => ({ child: { ...s.child, gradeLevel: grade } })),
  setAvatar: (avatar) => set((s) => ({ child: { ...s.child, avatar } })),
  setStudent: (student) => set((s) => ({ child: { ...s.child, student } })),
  setCurrentGame: (gameId) => set((s) => ({ child: { ...s.child, currentGame: gameId } })),
  
  teacher: initialTeacher,
  setTeacher: (teacher) => set((s) => ({ teacher: { ...s.teacher, teacher } })),
  setSelectedClass: (cls) => set((s) => ({ teacher: { ...s.teacher, selectedClass: cls } })),
  setSelectedStudent: (student) => set((s) => ({ teacher: { ...s.teacher, selectedStudent: student } })),
  setClasses: (classes) => set((s) => ({ teacher: { ...s.teacher, classes } })),
  setStudents: (students) => set((s) => ({ teacher: { ...s.teacher, students } })),
  
  engine: initialEngine,
  updateDifficulty: (axisId, value) => set((s) => ({
    engine: { ...s.engine, currentDifficulty: { ...s.engine.currentDifficulty, [axisId]: value } }
  })),
  updateBKT: (skillId, pLearned) => set((s) => ({
    engine: { ...s.engine, bktParams: { ...s.engine.bktParams, [skillId]: pLearned } }
  })),
  setEmotion: (emotion, confidence) => set((s) => ({
    engine: { ...s.engine, currentEmotion: emotion, emotionConfidence: confidence }
  })),
  addGameEvent: (event) => set((s) => ({
    engine: { ...s.engine, sessionEvents: [...s.engine.sessionEvents, event] }
  })),
  clearSessionEvents: () => set((s) => ({
    engine: { ...s.engine, sessionEvents: [] }
  })),
  toggleMute: () => set((s) => ({
    engine: { ...s.engine, isMuted: !s.engine.isMuted }
  })),
  
  resetChild: () => set({ child: initialChild, engine: initialEngine }),
  resetTeacher: () => set({ teacher: initialTeacher }),
}))
