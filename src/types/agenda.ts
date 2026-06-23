// Agenda (Aulas) types – used across gestor e aluno
export interface AgendaEvent {
  id: string;
  studentId: string;
  studentName?: string;
  courseId?: string; // curso asociado
  title: string; // nome da aula / curso
  scheduledAt: string; // ISO date string
  durationMinutes: number;
  lessonPrice?: number | null;
  status:
    | "scheduled"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "pending";
  teacher?: string;
  zoomUrl?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // historico simples de alterações pode ser armazenado externamente
}

export type AgendaViewMode = "month" | "week" | "day";
