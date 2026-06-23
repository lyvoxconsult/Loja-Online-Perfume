import { loadCourses } from "@/services/courses";
import { teachers } from "@/mocks/teachers";
import type { AgendaEvent } from "@/types/agenda";

const STUDENTS_KEY = "lumina:demo:students";
const CLASSES_KEY = "lumina:classes";
const LESSONS_KEY = "lumina:demo:lessons";
const MATERIALS_KEY = "lumina:materials";
const PROGRESS_KEY = "lumina:demo:progress";

export interface DemoStudent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  level: string;
  course_id: string;
  class_id: string;
  status: "ativo" | "pausado" | "inadimplente" | "concluido";
  progress: number;
  created_at: string;
}

export interface DemoClassStudent {
  studentId: string;
  studentName: string | null;
}

export interface DemoClass {
  id: string;
  name: string;
  course_id: string;
  description: string | null;
  status: "ativa" | "inativa" | "concluida" | "arquivada";
  start_date: string | null;
  end_date: string | null;
  teacher: string | null;
  notes: string | null;
  created_at: string;
  students: DemoClassStudent[];
  lessonsCount?: number;
}

export interface DemoMaterial {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  }>;
  student_id: string;
  createdAt: string;
}

export interface DemoProgressRow {
  id: string;
  student_id: string;
  skill: string;
  score: number;
}

const now = new Date();

const daysFromNow = (days: number, hour = 19, minute = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const isoDate = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day, 12, 0, 0, 0).toISOString();

const seedStudents: DemoStudent[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    full_name: "Marina Costa",
    email: "aluno@lumina.com",
    phone: "+55 (11) 99999-1101",
    level: "B1",
    course_id: "c2",
    class_id: "class-conversation-evening",
    status: "ativo",
    progress: 74,
    created_at: isoDate(2025, 11, 12),
  },
  {
    id: "demo-student-2",
    full_name: "Rafael Almeida",
    email: "rafael.almeida@lumina.demo",
    phone: "+55 (11) 99999-2202",
    level: "C1",
    course_id: "c7",
    class_id: "class-ielts-pro",
    status: "ativo",
    progress: 88,
    created_at: isoDate(2025, 10, 2),
  },
  {
    id: "demo-student-3",
    full_name: "Beatriz Lima",
    email: "beatriz.lima@lumina.demo",
    phone: "+55 (11) 99999-3303",
    level: "A2",
    course_id: "c6",
    class_id: "class-teens-hybrid",
    status: "ativo",
    progress: 63,
    created_at: isoDate(2025, 9, 20),
  },
  {
    id: "demo-student-4",
    full_name: "Joao Santos",
    email: "joao.santos@lumina.demo",
    phone: "+55 (11) 99999-4404",
    level: "B2",
    course_id: "c4",
    class_id: "class-business-morning",
    status: "inadimplente",
    progress: 81,
    created_at: isoDate(2025, 8, 15),
  },
  {
    id: "demo-student-5",
    full_name: "Ana Ribeiro",
    email: "ana.ribeiro@lumina.demo",
    phone: "+55 (11) 99999-5505",
    level: "A1",
    course_id: "c1",
    class_id: "class-foundations-night",
    status: "ativo",
    progress: 46,
    created_at: isoDate(2026, 1, 9),
  },
];

const teacherById = new Map(
  teachers.map((teacher) => [teacher.id, teacher.name]),
);

const seedClasses: DemoClass[] = [
  {
    id: "class-conversation-evening",
    name: "Conversation Evening",
    course_id: "c2",
    description: "Turma noturna com foco em fluencia pratica para adultos.",
    status: "ativa",
    start_date: isoDate(2026, 2, 3),
    end_date: isoDate(2026, 6, 30),
    teacher: teacherById.get("t2") ?? "James O'Connor",
    notes: "Turma premium para apresentacao comercial.",
    created_at: isoDate(2026, 1, 25),
    students: [],
  },
  {
    id: "class-ielts-pro",
    name: "Global Exam Pro Saturday",
    course_id: "c7",
    description: "Preparacao intensiva para certificacao academica com simulados semanais.",
    status: "ativa",
    start_date: isoDate(2026, 1, 18),
    end_date: isoDate(2026, 5, 18),
    teacher: teacherById.get("t6") ?? "David Williams",
    notes: "Inclui mentorias 1:1.",
    created_at: isoDate(2026, 1, 5),
    students: [],
  },
  {
    id: "class-teens-hybrid",
    name: "Teens Hybrid Lab",
    course_id: "c6",
    description: "Turma hibrida com projetos e speaking clubs.",
    status: "ativa",
    start_date: isoDate(2026, 2, 10),
    end_date: isoDate(2026, 10, 10),
    teacher: teacherById.get("t4") ?? "Michael Chen",
    notes: "Grupo com boa retencao e alta presenca.",
    created_at: isoDate(2026, 1, 12),
    students: [],
  },
  {
    id: "class-business-morning",
    name: "Business Morning",
    course_id: "c4",
    description: "Business English para lideres e analistas.",
    status: "ativa",
    start_date: isoDate(2026, 1, 20),
    end_date: isoDate(2026, 4, 28),
    teacher: teacherById.get("t3") ?? "Aisha Patel",
    notes: "Cliente B2B com alto ticket.",
    created_at: isoDate(2026, 1, 6),
    students: [],
  },
  {
    id: "class-foundations-night",
    name: "Foundations Night",
    course_id: "c1",
    description: "Turma inicial para adultos com trilha de speaking guiado.",
    status: "ativa",
    start_date: isoDate(2026, 3, 1),
    end_date: isoDate(2026, 8, 1),
    teacher: teacherById.get("t5") ?? "Olivia Brown",
    notes: "Turma de onboarding.",
    created_at: isoDate(2026, 2, 20),
    students: [],
  },
];

const studentsById = new Map(seedStudents.map((student) => [student.id, student]));

seedClasses.forEach((item) => {
  item.students = seedStudents
    .filter((student) => student.class_id === item.id)
    .map((student) => ({
      studentId: student.id,
      studentName: student.full_name,
    }));
});

const lesson = (
  id: string,
  studentId: string,
  title: string,
  teacher: string,
  scheduledAt: string,
  status: AgendaEvent["status"],
  lessonPrice: number,
  durationMinutes = 60,
): AgendaEvent => ({
  id,
  studentId,
  studentName: studentsById.get(studentId)?.full_name ?? "Aluno",
  title,
  scheduledAt,
  durationMinutes,
  lessonPrice,
  status,
  teacher,
  zoomUrl: "https://zoom.us/j/demo-lumina",
  notes: null,
  createdAt: scheduledAt,
  updatedAt: scheduledAt,
  courseId: studentsById.get(studentId)?.course_id ?? null,
});

const seedLessons: AgendaEvent[] = [
  lesson("lesson-1", "00000000-0000-4000-8000-000000000001", "Intermediate Conversation", "James O'Connor", daysFromNow(-12, 19), "completed", 180),
  lesson("lesson-2", "00000000-0000-4000-8000-000000000001", "Intermediate Conversation", "James O'Connor", daysFromNow(-5, 19), "completed", 180),
  lesson("lesson-3", "00000000-0000-4000-8000-000000000001", "Intermediate Conversation", "James O'Connor", daysFromNow(1, 19), "scheduled", 180),
  lesson("lesson-4", "00000000-0000-4000-8000-000000000001", "Intermediate Conversation", "James O'Connor", daysFromNow(8, 19), "scheduled", 180),
  lesson("lesson-5", "demo-student-2", "Global Exam Preparation", "David Williams", daysFromNow(-8, 9), "completed", 220),
  lesson("lesson-6", "demo-student-2", "Global Exam Preparation", "David Williams", daysFromNow(-1, 9), "completed", 220),
  lesson("lesson-7", "demo-student-2", "Global Exam Preparation", "David Williams", daysFromNow(6, 9), "scheduled", 220),
  lesson("lesson-8", "demo-student-3", "Teens Academy", "Michael Chen", daysFromNow(2, 17), "scheduled", 160),
  lesson("lesson-9", "demo-student-4", "Business English", "Aisha Patel", daysFromNow(-3, 8), "completed", 250),
  lesson("lesson-10", "demo-student-4", "Business English", "Aisha Patel", daysFromNow(4, 8), "scheduled", 250),
  lesson("lesson-11", "demo-student-5", "English Foundations", "Olivia Brown", daysFromNow(3, 20), "scheduled", 140),
  lesson("lesson-12", "demo-student-5", "English Foundations", "Olivia Brown", daysFromNow(10, 20), "scheduled", 140),
];

const seedMaterials: DemoMaterial[] = [
  {
    id: "mat-1",
    title: "Workbook - Intermediate Conversation",
    description: "Unidade 4 com foco em travel vocabulary e speaking prompts.",
    type: "pdf",
    url: null,
    files: [],
    student_id: "00000000-0000-4000-8000-000000000001",
    createdAt: daysFromNow(-10),
  },
  {
    id: "mat-2",
    title: "Speaking Drill Audio",
    description: "Treino de pronuncia para linking sounds.",
    type: "audio",
    url: "https://example.com/audio-speaking-drill",
    files: [],
    student_id: "00000000-0000-4000-8000-000000000001",
    createdAt: daysFromNow(-6),
  },
  {
    id: "mat-3",
    title: "Academic Writing Pack",
    description: "Modelos de essay com anotacoes do professor.",
    type: "document",
    url: null,
    files: [],
    student_id: "demo-student-2",
    createdAt: daysFromNow(-9),
  },
  {
    id: "mat-4",
    title: "Business Meeting Checklist",
    description: "Guia rapido para openings, transitions e action items.",
    type: "pdf",
    url: null,
    files: [],
    student_id: "demo-student-4",
    createdAt: daysFromNow(-4),
  },
  {
    id: "mat-5",
    title: "Welcome Kit - Foundations",
    description: "Plano de estudos das primeiras 4 semanas.",
    type: "pdf",
    url: null,
    files: [],
    student_id: "demo-student-5",
    createdAt: daysFromNow(-2),
  },
];

const seedProgress: DemoProgressRow[] = [
  { id: "prog-1", student_id: "00000000-0000-4000-8000-000000000001", skill: "speaking", score: 78 },
  { id: "prog-2", student_id: "00000000-0000-4000-8000-000000000001", skill: "listening", score: 82 },
  { id: "prog-3", student_id: "00000000-0000-4000-8000-000000000001", skill: "reading", score: 71 },
  { id: "prog-4", student_id: "00000000-0000-4000-8000-000000000001", skill: "writing", score: 66 },
  { id: "prog-5", student_id: "00000000-0000-4000-8000-000000000001", skill: "grammar", score: 74 },
  { id: "prog-6", student_id: "00000000-0000-4000-8000-000000000001", skill: "vocabulary", score: 75 },
  { id: "prog-7", student_id: "demo-student-2", skill: "speaking", score: 86 },
  { id: "prog-8", student_id: "demo-student-2", skill: "listening", score: 91 },
  { id: "prog-9", student_id: "demo-student-2", skill: "reading", score: 88 },
  { id: "prog-10", student_id: "demo-student-2", skill: "writing", score: 84 },
  { id: "prog-11", student_id: "demo-student-3", skill: "speaking", score: 65 },
  { id: "prog-12", student_id: "demo-student-3", skill: "listening", score: 68 },
  { id: "prog-13", student_id: "demo-student-4", skill: "speaking", score: 83 },
  { id: "prog-14", student_id: "demo-student-4", skill: "listening", score: 80 },
  { id: "prog-15", student_id: "demo-student-5", skill: "speaking", score: 44 },
  { id: "prog-16", student_id: "demo-student-5", skill: "listening", score: 48 },
];

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const syncClassStudents = (classes: DemoClass[], students: DemoStudent[]) =>
  classes.map((item) => ({
    ...item,
    students: students
      .filter((student) => student.class_id === item.id)
      .map((student) => ({
        studentId: student.id,
        studentName: student.full_name,
      })),
  }));

export const ensureDemoSchoolData = () => {
  if (!localStorage.getItem(STUDENTS_KEY)) writeJson(STUDENTS_KEY, seedStudents);
  if (!localStorage.getItem(CLASSES_KEY)) writeJson(CLASSES_KEY, syncClassStudents(seedClasses, seedStudents));
  if (!localStorage.getItem(LESSONS_KEY)) writeJson(LESSONS_KEY, seedLessons);
  if (!localStorage.getItem(MATERIALS_KEY)) writeJson(MATERIALS_KEY, seedMaterials);
  if (!localStorage.getItem(PROGRESS_KEY)) writeJson(PROGRESS_KEY, seedProgress);
  loadCourses();
};

export const loadDemoStudents = (): DemoStudent[] => {
  ensureDemoSchoolData();
  return readJson<DemoStudent[]>(STUDENTS_KEY, seedStudents);
};

export const saveDemoStudents = (students: DemoStudent[]) => {
  writeJson(STUDENTS_KEY, students);
  const classes = loadDemoClasses();
  writeJson(CLASSES_KEY, syncClassStudents(classes, students));
};

export const loadDemoClasses = (): DemoClass[] => {
  ensureDemoSchoolData();
  const classes = readJson<DemoClass[]>(CLASSES_KEY, syncClassStudents(seedClasses, seedStudents));
  return syncClassStudents(classes, loadDemoStudents());
};

export const saveDemoClasses = (classes: DemoClass[]) => {
  writeJson(CLASSES_KEY, syncClassStudents(classes, loadDemoStudents()));
};

export const loadDemoLessons = (): AgendaEvent[] => {
  ensureDemoSchoolData();
  return readJson<AgendaEvent[]>(LESSONS_KEY, seedLessons);
};

export const saveDemoLessons = (lessons: AgendaEvent[]) => {
  writeJson(LESSONS_KEY, lessons);
};

export const loadDemoMaterials = (): DemoMaterial[] => {
  ensureDemoSchoolData();
  return readJson<DemoMaterial[]>(MATERIALS_KEY, seedMaterials);
};

export const saveDemoMaterials = (materials: DemoMaterial[]) => {
  writeJson(MATERIALS_KEY, materials);
};

export const loadDemoProgress = (): DemoProgressRow[] => {
  ensureDemoSchoolData();
  return readJson<DemoProgressRow[]>(PROGRESS_KEY, seedProgress);
};

export const loadStudentAgenda = (studentId: string) =>
  loadDemoLessons()
    .filter((lesson) => lesson.studentId === studentId)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

export const loadStudentMaterials = (studentId: string) =>
  loadDemoMaterials()
    .filter((material) => !material.student_id || material.student_id === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const loadStudentProgress = (studentId: string) =>
  loadDemoProgress().filter((item) => item.student_id === studentId);

export const getStudentDirectory = () =>
  loadDemoStudents().map((student) => ({
    id: student.id,
    full_name: student.full_name,
    created_at: student.created_at,
  }));

export const getStudentOptions = () =>
  loadDemoStudents().map((student) => ({
    id: student.id,
    fullName: student.full_name,
  }));

export const getStudentById = (studentId: string) =>
  loadDemoStudents().find((student) => student.id === studentId) ?? null;

export const getStudentMetrics = () => {
  const students = loadDemoStudents();
  const lessons = loadDemoLessons();
  const materials = loadDemoMaterials();
  const progress = loadDemoProgress();

  return students.map((student) => {
    const studentLessons = lessons.filter((lesson) => lesson.studentId === student.id);
    const studentMaterials = materials.filter((material) => !material.student_id || material.student_id === student.id);
    const scores = progress.filter((row) => row.student_id === student.id).map((row) => row.score);
    return {
      ...student,
      lessonsCount: studentLessons.length,
      materialsCount: studentMaterials.length,
      avgScore: scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0,
    };
  });
};

export const createDemoLesson = (
  payload: Omit<AgendaEvent, "id" | "createdAt" | "updatedAt" | "studentName"> & { studentId: string },
) => {
  const student = getStudentById(payload.studentId);
  const nextLesson: AgendaEvent = {
    id: crypto.randomUUID(),
    studentId: payload.studentId,
    studentName: student?.full_name ?? "Aluno",
    title: payload.title,
    scheduledAt: payload.scheduledAt,
    durationMinutes: payload.durationMinutes,
    lessonPrice: payload.lessonPrice ?? null,
    status: payload.status,
    teacher: payload.teacher ?? null,
    zoomUrl: payload.zoomUrl ?? null,
    notes: payload.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    courseId: payload.courseId ?? student?.course_id ?? null,
  };
  const lessons = [nextLesson, ...loadDemoLessons()];
  saveDemoLessons(lessons);
  return nextLesson;
};

export const updateDemoLesson = (id: string, updates: Partial<AgendaEvent>) => {
  const lessons = loadDemoLessons();
  const existing = lessons.find((lesson) => lesson.id === id);
  if (!existing) return null;
  const student = getStudentById(updates.studentId ?? existing.studentId);
  const nextLesson: AgendaEvent = {
    ...existing,
    ...updates,
    studentName: student?.full_name ?? existing.studentName,
    updatedAt: new Date().toISOString(),
    courseId: updates.courseId ?? existing.courseId ?? student?.course_id ?? null,
  };
  saveDemoLessons(lessons.map((lesson) => (lesson.id === id ? nextLesson : lesson)));
  return nextLesson;
};

export const cancelDemoLesson = (id: string) => {
  const updated = updateDemoLesson(id, { status: "cancelled" });
  return Boolean(updated);
};

export const getCourseLabel = (courseId: string | null | undefined) =>
  loadCourses().find((course) => course.id === courseId)?.title ?? "Sem curso";
