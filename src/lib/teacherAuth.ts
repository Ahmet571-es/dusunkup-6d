/**
 * Teacher Authentication & Data Service
 * Works with localStorage (demo mode) or Supabase (production)
 * Faz 2: Full CRUD for classes and students
 */

import type { Teacher, Class, Student, GradeLevel } from '@/types'

const STORAGE_KEYS = {
  teacher: 'dk6d_teacher',
  classes: 'dk6d_classes',
  students: 'dk6d_students',
  isLoggedIn: 'dk6d_logged_in',
}

// === DEMO DATA (seeded on first load) ===
const DEMO_TEACHER: Teacher = {
  id: 'teacher-001',
  school_id: 'school-001',
  email: 'ogretmen@dusunkup.com',
  full_name: 'Ayşe Öğretmen',
  password_hash: '1234',
  created_at: new Date().toISOString(),
}

const DEMO_CLASSES: Class[] = [
  { id: 'class-001', teacher_id: 'teacher-001', name: 'Anaokulu-A', grade_level: 'anaokulu', section: 'A', academic_year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'class-002', teacher_id: 'teacher-001', name: '1-A', grade_level: 'sinif1', section: 'A', academic_year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'class-003', teacher_id: 'teacher-001', name: '1-B', grade_level: 'sinif1', section: 'B', academic_year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'class-004', teacher_id: 'teacher-001', name: '3-A', grade_level: 'sinif3', section: 'A', academic_year: '2025-2026', created_at: new Date().toISOString() },
]

const DEMO_STUDENTS: Student[] = [
  { id: 's-001', class_id: 'class-001', first_name: 'Ayşe', last_name: 'Yılmaz', avatar_id: 5, created_at: new Date().toISOString() },
  { id: 's-002', class_id: 'class-001', first_name: 'Mehmet', last_name: 'Kaya', avatar_id: 1, created_at: new Date().toISOString() },
  { id: 's-003', class_id: 'class-001', first_name: 'Zeynep', last_name: 'Demir', avatar_id: 2, created_at: new Date().toISOString() },
  { id: 's-004', class_id: 'class-001', first_name: 'Ali', last_name: 'Çelik', avatar_id: 4, created_at: new Date().toISOString() },
  { id: 's-005', class_id: 'class-001', first_name: 'Elif', last_name: 'Şahin', avatar_id: 3, created_at: new Date().toISOString() },
  { id: 's-006', class_id: 'class-001', first_name: 'Burak', last_name: 'Arslan', avatar_id: 6, created_at: new Date().toISOString() },
  { id: 's-007', class_id: 'class-002', first_name: 'Defne', last_name: 'Korkmaz', avatar_id: 7, created_at: new Date().toISOString() },
  { id: 's-008', class_id: 'class-002', first_name: 'Arda', last_name: 'Yıldız', avatar_id: 8, created_at: new Date().toISOString() },
  { id: 's-009', class_id: 'class-002', first_name: 'Nisa', last_name: 'Aydın', avatar_id: 5, created_at: new Date().toISOString() },
  { id: 's-010', class_id: 'class-002', first_name: 'Efe', last_name: 'Özkan', avatar_id: 6, created_at: new Date().toISOString() },
  { id: 's-011', class_id: 'class-003', first_name: 'Mira', last_name: 'Güneş', avatar_id: 9, created_at: new Date().toISOString() },
  { id: 's-012', class_id: 'class-003', first_name: 'Batu', last_name: 'Koç', avatar_id: 4, created_at: new Date().toISOString() },
  { id: 's-013', class_id: 'class-004', first_name: 'Deniz', last_name: 'Aktaş', avatar_id: 8, created_at: new Date().toISOString() },
  { id: 's-014', class_id: 'class-004', first_name: 'Ela', last_name: 'Çetin', avatar_id: 2, created_at: new Date().toISOString() },
  { id: 's-015', class_id: 'class-004', first_name: 'Can', last_name: 'Polat', avatar_id: 3, created_at: new Date().toISOString() },
]

// Demo cognitive data per student
export interface StudentCognitiveData {
  attention_score: number;
  math_score: number;
  memory_score: number;
  fluency: number;
  trend: 'up' | 'down' | 'stable';
  total_sessions: number;
  weekly_attention: number[];
  weekly_math: number[];
  weber_fraction: number;
  number_line_pae: number;
  dominant_strategy: string;
  automatized_facts: number;
  misconceptions: string[];
}

const DEMO_COGNITIVE: Record<string, StudentCognitiveData> = {
  's-001': { attention_score: 78, math_score: 82, memory_score: 72, fluency: 14, trend: 'up', total_sessions: 14, weekly_attention: [45,52,58,65,71,78], weekly_math: [50,56,63,70,76,82], weber_fraction: 0.19, number_line_pae: 7, dominant_strategy: 'counting_on_larger', automatized_facts: 78, misconceptions: [] },
  's-002': { attention_score: 65, math_score: 71, memory_score: 60, fluency: 10, trend: 'up', total_sessions: 12, weekly_attention: [40,45,50,55,60,65], weekly_math: [42,48,54,60,66,71], weber_fraction: 0.24, number_line_pae: 12, dominant_strategy: 'counting_on_first', automatized_facts: 55, misconceptions: ['conservation_error'] },
  's-003': { attention_score: 88, math_score: 90, memory_score: 85, fluency: 18, trend: 'up', total_sessions: 16, weekly_attention: [60,68,74,80,85,88], weekly_math: [62,70,76,82,87,90], weber_fraction: 0.15, number_line_pae: 4, dominant_strategy: 'retrieval', automatized_facts: 92, misconceptions: [] },
  's-004': { attention_score: 45, math_score: 52, memory_score: 40, fluency: 6, trend: 'stable', total_sessions: 8, weekly_attention: [38,40,42,43,44,45], weekly_math: [44,46,48,50,51,52], weber_fraction: 0.32, number_line_pae: 22, dominant_strategy: 'counting_all', automatized_facts: 25, misconceptions: ['conservation_error', 'cardinality_error'] },
  's-005': { attention_score: 72, math_score: 68, memory_score: 65, fluency: 11, trend: 'up', total_sessions: 11, weekly_attention: [48,54,58,63,68,72], weekly_math: [40,46,52,58,63,68], weber_fraction: 0.22, number_line_pae: 10, dominant_strategy: 'counting_on_larger', automatized_facts: 60, misconceptions: [] },
  's-006': { attention_score: 58, math_score: 63, memory_score: 55, fluency: 8, trend: 'down', total_sessions: 6, weekly_attention: [62,60,60,59,58,58], weekly_math: [65,64,64,63,63,63], weber_fraction: 0.26, number_line_pae: 15, dominant_strategy: 'counting_on_first', automatized_facts: 38, misconceptions: ['double_count_error'] },
  's-007': { attention_score: 70, math_score: 75, memory_score: 68, fluency: 12, trend: 'up', total_sessions: 10, weekly_attention: [45,50,55,60,65,70], weekly_math: [48,54,60,66,71,75], weber_fraction: 0.20, number_line_pae: 9, dominant_strategy: 'counting_on_larger', automatized_facts: 65, misconceptions: [] },
  's-008': { attention_score: 80, math_score: 78, memory_score: 75, fluency: 15, trend: 'up', total_sessions: 13, weekly_attention: [55,60,65,70,75,80], weekly_math: [50,56,62,68,73,78], weber_fraction: 0.18, number_line_pae: 6, dominant_strategy: 'making_tens', automatized_facts: 72, misconceptions: [] },
}

// === INITIALIZATION ===
function initDemoData(): void {
  if (!localStorage.getItem(STORAGE_KEYS.classes)) {
    localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(DEMO_CLASSES));
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(DEMO_STUDENTS));
  }
}

// === AUTH ===
export function login(email: string, password: string): Teacher | null {
  initDemoData();
  if (password.length >= 1) { // Demo: any password works
    localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
    localStorage.setItem(STORAGE_KEYS.teacher, JSON.stringify(DEMO_TEACHER));
    return DEMO_TEACHER;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.isLoggedIn);
  localStorage.removeItem(STORAGE_KEYS.teacher);
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(STORAGE_KEYS.isLoggedIn) === 'true';
}

export function getTeacher(): Teacher | null {
  const data = localStorage.getItem(STORAGE_KEYS.teacher);
  return data ? JSON.parse(data) : null;
}

// === CLASSES CRUD ===
export function getClasses(): Class[] {
  initDemoData();
  const data = localStorage.getItem(STORAGE_KEYS.classes);
  return data ? JSON.parse(data) : [];
}

export function getClass(id: string): Class | null {
  return getClasses().find(c => c.id === id) || null;
}

export function addClass(name: string, gradeLevel: GradeLevel, section: string): Class {
  const classes = getClasses();
  const newClass: Class = {
    id: `class-${Date.now()}`,
    teacher_id: 'teacher-001',
    name,
    grade_level: gradeLevel,
    section,
    academic_year: '2025-2026',
    created_at: new Date().toISOString(),
  };
  classes.push(newClass);
  localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes));
  return newClass;
}

export function updateClass(id: string, updates: Partial<Class>): Class | null {
  const classes = getClasses();
  const idx = classes.findIndex(c => c.id === id);
  if (idx === -1) return null;
  classes[idx] = { ...classes[idx], ...updates };
  localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes));
  return classes[idx];
}

export function deleteClass(id: string): boolean {
  const classes = getClasses().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes));
  // Also delete students in this class
  const students = getStudents().filter(s => s.class_id !== id);
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  return true;
}

// === STUDENTS CRUD ===
export function getStudents(classId?: string): Student[] {
  initDemoData();
  const data = localStorage.getItem(STORAGE_KEYS.students);
  const students: Student[] = data ? JSON.parse(data) : [];
  return classId ? students.filter(s => s.class_id === classId) : students;
}

export function getStudent(id: string): Student | null {
  return getStudents().find(s => s.id === id) || null;
}

export function addStudent(classId: string, firstName: string, lastName: string, avatarId: number): Student {
  const students = getStudents();
  const newStudent: Student = {
    id: `s-${Date.now()}`,
    class_id: classId,
    first_name: firstName,
    last_name: lastName,
    avatar_id: avatarId,
    created_at: new Date().toISOString(),
  };
  students.push(newStudent);
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  return newStudent;
}

export function updateStudent(id: string, updates: Partial<Student>): Student | null {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return null;
  students[idx] = { ...students[idx], ...updates };
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  return students[idx];
}

export function deleteStudent(id: string): boolean {
  const students = getStudents().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  return true;
}

// === COGNITIVE DATA (demo) ===
export function getStudentCognitive(studentId: string): StudentCognitiveData {
  return DEMO_COGNITIVE[studentId] || {
    attention_score: 50 + Math.floor(Math.random() * 30),
    math_score: 50 + Math.floor(Math.random() * 30),
    memory_score: 45 + Math.floor(Math.random() * 30),
    fluency: 5 + Math.floor(Math.random() * 10),
    trend: 'up' as const,
    total_sessions: Math.floor(Math.random() * 10) + 3,
    weekly_attention: Array.from({length: 6}, (_, i) => 40 + i * 6 + Math.floor(Math.random() * 5)),
    weekly_math: Array.from({length: 6}, (_, i) => 42 + i * 6 + Math.floor(Math.random() * 5)),
    weber_fraction: 0.20 + Math.random() * 0.10,
    number_line_pae: 8 + Math.floor(Math.random() * 10),
    dominant_strategy: 'counting_on_larger',
    automatized_facts: 40 + Math.floor(Math.random() * 30),
    misconceptions: [],
  };
}

export function getClassStats(classId: string) {
  const students = getStudents(classId);
  const cogData = students.map(s => getStudentCognitive(s.id));
  
  const avg = (arr: number[]) => arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;
  
  return {
    studentCount: students.length,
    avgAttention: Math.round(avg(cogData.map(c => c.attention_score))),
    avgMath: Math.round(avg(cogData.map(c => c.math_score))),
    avgSessions: Math.round(avg(cogData.map(c => c.total_sessions))),
    trendUp: cogData.filter(c => c.trend === 'up').length,
    trendDown: cogData.filter(c => c.trend === 'down').length,
    alerts: cogData.filter(c => c.attention_score < 50 || c.math_score < 50).length,
  };
}
