import { ensureDemoSchoolData } from "@/services/demoSchool";

const FLAG_KEY = "lumina:demo-seeded";

export const ensureDemoUsers = async () => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(FLAG_KEY)) return;
  ensureDemoSchoolData();
  localStorage.setItem(FLAG_KEY, "1");
};
