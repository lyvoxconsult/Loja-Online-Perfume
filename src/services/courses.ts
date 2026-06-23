/**
 * Serviço centralizado de cursos
 * Usa localStorage como fonte única de verdade
 * 
 * IMPORTANTE: Todas as páginas (público e admin) devem usar este serviço
 */

// Storage key
const STORAGE_KEY = "lumina:courses";

// Tipos
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Format = "online" | "presencial" | "hibrido";

export interface Course {
  id: string;
  slug: string;
  title: string;
  level: Level;
  format: Format;
  duration: string;
  price: number;
  shortDescription: string;
  description: string;
  topics: string[];
  highlight?: boolean;
  category: "kids" | "teens" | "adults" | "business" | "exam";
}

// Seed data - cursos padrão
const seedCourses: Course[] = [
  {
    id: "c1",
    slug: "english-foundations-a1-a2",
    title: "English Foundations",
    level: "A1",
    format: "online",
    duration: "6 meses",
    price: 297,
    category: "adults",
    shortDescription: "Comece do zero com método imersivo e aulas dinâmicas ao vivo.",
    description: "Curso ideal para quem está começando. Construa vocabulário essencial, pronúncia natural e confiança para conversar em situações reais do dia a dia.",
    topics: ["Saudações e apresentações", "Verbos no presente", "Vocabulário cotidiano", "Pronúncia básica", "Conversação guiada"],
    highlight: true,
  },
  {
    id: "c2",
    slug: "intermediate-conversation-b1",
    title: "Intermediate Conversation",
    level: "B1",
    format: "hibrido",
    duration: "4 meses",
    price: 397,
    category: "adults",
    shortDescription: "Fluência prática com role-plays, debates e imersão cultural.",
    description: "Acelere sua fluência com aulas focadas em conversação real, situações profissionais, viagens e cultura internacional.",
    topics: ["Past & Future tenses", "Phrasal verbs essenciais", "Debates guiados", "Listening intensivo", "Pronúncia conectada"],
    highlight: true,
  },
  {
    id: "c3",
    slug: "advanced-fluency-c1",
    title: "Advanced Fluency",
    level: "C1",
    format: "online",
    duration: "5 meses",
    price: 497,
    category: "adults",
    shortDescription: "Domínio avançado para carreira global e estudos no exterior.",
    description: "Aprimore vocabulário sofisticado, gramática complexa e pronúncia natural. Prepare-se para entrevistas internacionais e exames.",
    topics: ["Idiomatic expressions", "Academic writing", "Public speaking", "Subjunctive mood", "Negotiation skills"],
    highlight: true,
  },
  {
    id: "c4",
    slug: "business-english-b2",
    title: "Business English",
    level: "B2",
    format: "online",
    duration: "3 meses",
    price: 547,
    category: "business",
    shortDescription: "Inglês corporativo: reuniões, e-mails e apresentações de impacto.",
    description: "Programa intensivo voltado para profissionais. Domine o vocabulário de negócios, comunicação executiva e networking internacional.",
    topics: ["Meeting English", "Professional emails", "Presentations", "Negotiation", "Cross-cultural communication"],
  },
  {
    id: "c5",
    slug: "kids-explorers-a1",
    title: "Kids Explorers",
    level: "A1",
    format: "presencial",
    duration: "10 meses",
    price: 247,
    category: "kids",
    shortDescription: "Inglês lúdico para crianças de 7 a 11 anos com método imersivo.",
    description: "Aulas divertidas com músicas, jogos e histórias. As crianças aprendem inglês de forma natural, como uma segunda língua materna.",
    topics: ["Vocabulário lúdico", "Storytelling", "Songs & games", "Phonics", "Mini-projetos"],
  },
  {
    id: "c6",
    slug: "teens-academy-a2-b1",
    title: "Teens Academy",
    level: "A2",
    format: "hibrido",
    duration: "8 meses",
    price: 297,
    category: "teens",
    shortDescription: "Programa para adolescentes com cultura pop e projetos reais.",
    description: "Inglês relevante para a geração Z: música, séries, redes sociais, intercâmbio e preparação acadêmica.",
    topics: ["Pop culture vocabulary", "Social media English", "Project-based learning", "Pronúncia americana", "Writing creativo"],
  },
  {
    id: "c7",
    slug: "ielts-preparation-c1",
    title: "Global Exam Preparation",
    level: "C1",
    format: "online",
    duration: "3 meses",
    price: 697,
    category: "exam",
    shortDescription: "Prepare-se para certificações internacionais com simulados e correções 1:1.",
    description: "Estratégias para Listening, Reading, Writing e Speaking. Simulados semanais com feedback individual e plano de estudos personalizado.",
    topics: ["Reading strategies", "Listening practice", "Academic writing", "Speaking mock tests", "Score boosting tips"],
  },
  {
    id: "c8",
    slug: "toefl-mastery-c1",
    title: "Academic English Mastery",
    level: "C1",
    format: "online",
    duration: "3 meses",
    price: 697,
    category: "exam",
    shortDescription: "Treinamento intensivo de inglês acadêmico com mentoria.",
    description: "Domine formatos de avaliação acadêmica. Inclui acesso a simulados demonstrativos e mentoria semanal com especialistas.",
    topics: ["Integrated tasks", "Academic vocabulary", "Note-taking skills", "Time management", "Score analysis"],
  },
];

// Carregar cursos do localStorage
export const loadCourses = (): Course[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Se não existe, salva o seed e retorna
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedCourses));
      return seedCourses;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedCourses;
  } catch {
    return seedCourses;
  }
};

// Salvar cursos no localStorage
const persistCourses = (courses: Course[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
};

// Criar curso
export const createCourse = (course: Omit<Course, "id">): Course => {
  const courses = loadCourses();
  const newCourse: Course = {
    ...course,
    id: `c-${Date.now()}`,
  };
  persistCourses([newCourse, ...courses]);
  return newCourse;
};

// Atualizar curso
export const updateCourse = (id: string, updates: Partial<Course>): boolean => {
  const courses = loadCourses();
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return false;

  courses[index] = { ...courses[index], ...updates };
  persistCourses(courses);
  return true;
};

// Excluir curso
export const deleteCourse = (id: string): boolean => {
  const courses = loadCourses();
  const filtered = courses.filter((c) => c.id !== id);
  if (filtered.length === courses.length) return false;
  
  persistCourses(filtered);
  return true;
};

// Buscar curso por ID
export const getCourseById = (id: string): Course | null => {
  const courses = loadCourses();
  return courses.find((c) => c.id === id) ?? null;
};

// Buscar curso por slug
export const getCourseBySlug = (slug: string): Course | null => {
  const courses = loadCourses();
  return courses.find((c) => c.slug === slug) ?? null;
};

// Filtrar cursos
export const filterCourses = (level?: Level | "all", format?: Format | "all", category?: string): Course[] => {
  const courses = loadCourses();
  return courses.filter((c) => {
    if (level && level !== "all" && c.level !== level) return false;
    if (format && format !== "all" && c.format !== format) return false;
    if (category && category !== "all" && c.category !== category) return false;
    return true;
  });
};

// Obter cursos em destaque
export const getHighlightedCourses = (): Course[] => {
  const courses = loadCourses();
  return courses.filter((c) => c.highlight);
};

// Contar cursos
export const countCourses = (): number => {
  return loadCourses().length;
};

// Limpar todos os cursos (para reset)
export const clearAllCourses = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
