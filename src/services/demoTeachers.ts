import { teachers as seedTeachers, type Teacher } from "@/mocks/teachers";

const STORAGE_KEY = "lumina:demo:teachers";

export type DemoTeacher = Teacher & {
  email: string;
  status: "ativo" | "ferias" | "inativo";
  classes: number;
};

const seeded: DemoTeacher[] = seedTeachers.map((teacher, index) => ({
  ...teacher,
  email: `${teacher.name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@lumina.demo`,
  status: index === 4 ? "ferias" : "ativo",
  classes: [4, 5, 3, 4, 2, 3][index] ?? 2,
}));

export const loadDemoTeachers = (): DemoTeacher[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoTeacher[]) : seeded;
  } catch {
    return seeded;
  }
};

export const saveDemoTeachers = (items: DemoTeacher[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};
