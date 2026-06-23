import { ensureDemoSchoolData } from "@/services/demoSchool";
import { isDemoUser } from "@/services/demoAuth";

export const seedStudentDataIfEmpty = async (userId: string) => {
  ensureDemoSchoolData();
  if (isDemoUser({ id: userId, email: null })) return;
};
