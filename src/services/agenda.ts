import {
  cancelDemoLesson,
  createDemoLesson,
  loadDemoLessons,
  loadStudentAgenda,
  updateDemoLesson,
} from "@/services/demoSchool";
import type { AgendaEvent } from "@/types/agenda";

export const fetchAgendaForAll = async (): Promise<AgendaEvent[]> =>
  loadDemoLessons().sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

export const fetchAgendaForStudent = async (studentId: string): Promise<AgendaEvent[]> =>
  loadStudentAgenda(studentId);

export const createAgendaEvent = async (
  payload: Omit<AgendaEvent, "id" | "createdAt" | "updatedAt" | "studentName"> & { studentId: string },
): Promise<AgendaEvent | null> => {
  try {
    return createDemoLesson(payload);
  } catch {
    return null;
  }
};

export const updateAgendaEvent = async (id: string, updates: Partial<AgendaEvent>): Promise<AgendaEvent | null> => {
  try {
    return updateDemoLesson(id, updates);
  } catch {
    return null;
  }
};

export const cancelAgendaEvent = async (id: string): Promise<boolean> => {
  try {
    return cancelDemoLesson(id);
  } catch {
    return false;
  }
};
