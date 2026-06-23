import { fetchAgendaForAll } from "@/services/agenda";
import { loadCourses, type Course } from "@/services/courses";
import { getStudentDirectory, loadDemoClasses, loadDemoStudents } from "@/services/demoSchool";
import type { AgendaEvent } from "@/types/agenda";
import type {
  BillingModel,
  ChargeStatus,
  FinancialAlert,
  FinancialCharge,
  FinanceAggregateRow,
  FinanceFilters,
  FinanceStudentRow,
  FinancialOverview,
  PaymentMethod,
  StudentFinancialProfile,
} from "@/types/finance";

const FINANCIAL_PROFILES_KEY = "lumina:finance:profiles";
const FINANCIAL_CHARGES_KEY = "lumina:finance:charges";
const CLASSES_KEY = "lumina:classes";

type StudentProfileRecord = {
  id: string;
  full_name: string | null;
  created_at: string;
};

type StudentRoleRecord = {
  user_id: string;
};

type StoredClassStudent = {
  studentId: string;
  studentName: string | null;
};

type StoredClass = {
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
  students: StoredClassStudent[];
};

type FinanceCourseSummary = FinanceAggregateRow;

type FinanceClassSummary = FinanceAggregateRow;

export interface FinanceSnapshot {
  students: FinanceStudentRow[];
  courses: FinanceCourseSummary[];
  classes: FinanceClassSummary[];
  charges: FinancialCharge[];
  profiles: StudentFinancialProfile[];
  overview: FinancialOverview;
  charts: {
    monthly: { label: string; expected: number; received: number; pending: number; overdue: number }[];
    byCourse: { name: string; value: number }[];
    byClass: { name: string; value: number }[];
    status: { name: string; value: number }[];
  };
  alerts: FinancialAlert[];
  base: {
    students: StudentProfileRecord[];
    lessons: AgendaEvent[];
    courses: Course[];
    classes: StoredClass[];
  };
}

const paymentMethodLabelMap: Record<PaymentMethod, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
  bank_slip: "Boleto",
  bank_transfer: "Transferência",
  cash: "Dinheiro",
  not_informed: "Não informado",
};

const billingModelLabelMap: Record<BillingModel, string> = {
  per_lesson: "Por aula",
  monthly: "Mensalidade",
  course_package: "Pacote de curso",
};

const chargeStatusLabelMap: Record<ChargeStatus, string> = {
  draft: "Rascunho",
  open: "Pendente",
  partial: "Parcial",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

const safeJsonParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const nowIso = () => new Date().toISOString();

const startOfDayIso = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toISOString();
};

const endOfDayIso = (date: Date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value.toISOString();
};

const monthKey = (isoDate: string) => {
  const date = new Date(isoDate);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

const monthLabel = (key: string) => {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
};

const numberOrZero = (value: number | null | undefined) => Number(value ?? 0);

const normalizeChargeStatus = (charge: FinancialCharge): ChargeStatus => {
  if (charge.status === "cancelled") return "cancelled";
  if (charge.amountNet <= 0) return "cancelled";
  if (charge.paidAmount >= charge.amountNet && charge.amountNet > 0) return "paid";
  if (charge.paidAmount > 0 && charge.paidAmount < charge.amountNet) {
    return new Date(charge.dueDate) < new Date() ? "overdue" : "partial";
  }
  if (new Date(charge.dueDate) < new Date()) return "overdue";
  return charge.status === "draft" ? "draft" : "open";
};

const loadStoredClasses = (): StoredClass[] => {
  const stored = safeJsonParse<StoredClass[]>(localStorage.getItem(CLASSES_KEY), []);
  if (stored.length > 0) return stored;
  return loadDemoClasses() as unknown as StoredClass[];
};

export const loadFinancialProfiles = (): StudentFinancialProfile[] =>
  safeJsonParse<StudentFinancialProfile[]>(localStorage.getItem(FINANCIAL_PROFILES_KEY), []);

export const saveFinancialProfile = (profile: StudentFinancialProfile) => {
  const items = loadFinancialProfiles();
  const next = items.some((item) => item.id === profile.id)
    ? items.map((item) => (item.id === profile.id ? profile : item))
    : [profile, ...items];
  localStorage.setItem(FINANCIAL_PROFILES_KEY, JSON.stringify(next));
};

export const loadFinancialCharges = (): FinancialCharge[] =>
  safeJsonParse<FinancialCharge[]>(localStorage.getItem(FINANCIAL_CHARGES_KEY), []);

export const saveFinancialCharge = (charge: FinancialCharge) => {
  const items = loadFinancialCharges();
  const next = items.some((item) => item.id === charge.id)
    ? items.map((item) => (item.id === charge.id ? charge : item))
    : [charge, ...items];
  localStorage.setItem(FINANCIAL_CHARGES_KEY, JSON.stringify(next));
};

export const removeFinancialCharge = (chargeId: string) => {
  const items = loadFinancialCharges().filter((item) => item.id !== chargeId);
  localStorage.setItem(FINANCIAL_CHARGES_KEY, JSON.stringify(items));
};

const createDefaultProfile = (
  student: StudentProfileRecord,
  studentLessons: AgendaEvent[],
  storedClasses: StoredClass[],
  courses: Course[],
): StudentFinancialProfile => {
  const enrolledClass = storedClasses.find((item) => item.students.some((entry) => entry.studentId === student.id)) ?? null;
  const courseId = enrolledClass?.course_id ?? null;
  const course = courseId ? courses.find((item) => item.id === courseId) ?? null : null;
  const hasPricedLessons = studentLessons.some((lesson) => lesson.lessonPrice != null && lesson.lessonPrice > 0);

  return {
    id: `profile:${student.id}`,
    studentId: student.id,
    classId: enrolledClass?.id ?? null,
    courseId,
    billingModel: hasPricedLessons ? "per_lesson" : "monthly",
    agreedAmount: hasPricedLessons ? null : course?.price ?? null,
    monthlyAmount: hasPricedLessons ? null : course?.price ?? null,
    courseTotalAmount: null,
    discountAmount: 0,
    discountType: "fixed",
    paymentMethod: "pix",
    dueDay: 10,
    notes: null,
    active: true,
    createdAt: student.created_at,
    updatedAt: nowIso(),
  };
};

const applyDiscount = (amount: number, discountAmount: number, discountType: StudentFinancialProfile["discountType"]) => {
  if (!discountAmount) return 0;
  if (discountType === "percentage") {
    return Number(((amount * discountAmount) / 100).toFixed(2));
  }
  return Number(discountAmount.toFixed(2));
};

const inferCourseId = (
  lesson: AgendaEvent,
  profile: StudentFinancialProfile,
  courses: Course[],
): string | null => {
  if (lesson.courseId) return lesson.courseId;
  if (profile.courseId) return profile.courseId;
  const byTitle = courses.find((course) => course.title === lesson.title);
  return byTitle?.id ?? null;
};

const buildLessonCharge = (
  lesson: AgendaEvent,
  profile: StudentFinancialProfile,
  courses: Course[],
  storedCharge?: FinancialCharge,
): FinancialCharge | null => {
  if (!lesson.lessonPrice || lesson.lessonPrice <= 0) return null;

  const courseId = inferCourseId(lesson, profile, courses);
  const dueDate = storedCharge?.dueDate ?? lesson.scheduledAt;
  const baseAmount = storedCharge?.amountGross ?? lesson.lessonPrice;
  const discountAmount = storedCharge?.discountAmount ?? applyDiscount(baseAmount, profile.discountAmount, profile.discountType);
  const amountNet = Number(Math.max(baseAmount - discountAmount, 0).toFixed(2));

  const charge: FinancialCharge = {
    id: `lesson:${lesson.id}`,
    studentId: lesson.studentId,
    classId: storedCharge?.classId ?? profile.classId,
    courseId: storedCharge?.courseId ?? courseId,
    lessonId: lesson.id,
    description: storedCharge?.description ?? `Cobrança da aula: ${lesson.title}`,
    referenceDate: storedCharge?.referenceDate ?? lesson.scheduledAt,
    dueDate,
    amountGross: Number(baseAmount.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    amountNet,
    paidAmount: numberOrZero(storedCharge?.paidAmount),
    paidAt: storedCharge?.paidAt ?? null,
    paymentMethod: storedCharge?.paymentMethod ?? profile.paymentMethod,
    status: lesson.status === "cancelled" ? "cancelled" : storedCharge?.status ?? "open",
    originType: "lesson",
    notes: storedCharge?.notes ?? lesson.notes ?? null,
    createdAt: storedCharge?.createdAt ?? lesson.createdAt ?? nowIso(),
    updatedAt: storedCharge?.updatedAt ?? lesson.updatedAt ?? nowIso(),
  };

  charge.status = lesson.status === "cancelled" ? "cancelled" : normalizeChargeStatus(charge);
  return charge;
};

const buildRecurringCharges = (
  profile: StudentFinancialProfile,
  lessons: AgendaEvent[],
  storedChargesById: Map<string, FinancialCharge>,
): FinancialCharge[] => {
  if (profile.billingModel === "per_lesson") return [];

  const activeLessons = lessons.filter((lesson) => lesson.status !== "cancelled");
  if (activeLessons.length === 0) return [];

  if (profile.billingModel === "course_package") {
    const firstLesson = activeLessons.slice().sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
    const id = `package:${profile.studentId}:${profile.courseId ?? "general"}`;
    const stored = storedChargesById.get(id);
    const gross = stored?.amountGross ?? numberOrZero(profile.courseTotalAmount ?? profile.agreedAmount);
    if (gross <= 0) return [];
    const discount = stored?.discountAmount ?? applyDiscount(gross, profile.discountAmount, profile.discountType);
    const charge: FinancialCharge = {
      id,
      studentId: profile.studentId,
      classId: stored?.classId ?? profile.classId,
      courseId: stored?.courseId ?? profile.courseId,
      lessonId: null,
      description: stored?.description ?? "Pacote do curso",
      referenceDate: stored?.referenceDate ?? firstLesson.scheduledAt,
      dueDate: stored?.dueDate ?? firstLesson.scheduledAt,
      amountGross: gross,
      discountAmount: discount,
      amountNet: Number(Math.max(gross - discount, 0).toFixed(2)),
      paidAmount: numberOrZero(stored?.paidAmount),
      paidAt: stored?.paidAt ?? null,
      paymentMethod: stored?.paymentMethod ?? profile.paymentMethod,
      status: stored?.status ?? "open",
      originType: "package",
      notes: stored?.notes ?? profile.notes,
      createdAt: stored?.createdAt ?? firstLesson.createdAt ?? nowIso(),
      updatedAt: stored?.updatedAt ?? nowIso(),
    };
    charge.status = normalizeChargeStatus(charge);
    return [charge];
  }

  const groupedMonths = Array.from(new Set(activeLessons.map((lesson) => monthKey(lesson.scheduledAt)))).sort();
  return groupedMonths.map((key) => {
    const [year, month] = key.split("-");
    const dueDay = profile.dueDay ?? 10;
    const dueDate = new Date(Number(year), Number(month) - 1, dueDay);
    const id = `monthly:${profile.studentId}:${key}`;
    const stored = storedChargesById.get(id);
    const gross = stored?.amountGross ?? numberOrZero(profile.monthlyAmount ?? profile.agreedAmount);
    const discount = stored?.discountAmount ?? applyDiscount(gross, profile.discountAmount, profile.discountType);
    const charge: FinancialCharge = {
      id,
      studentId: profile.studentId,
      classId: stored?.classId ?? profile.classId,
      courseId: stored?.courseId ?? profile.courseId,
      lessonId: null,
      description: stored?.description ?? `Mensalidade ${monthLabel(key)}`,
      referenceDate: stored?.referenceDate ?? startOfDayIso(new Date(Number(year), Number(month) - 1, 1)),
      dueDate: stored?.dueDate ?? dueDate.toISOString(),
      amountGross: Number(gross.toFixed(2)),
      discountAmount: Number(discount.toFixed(2)),
      amountNet: Number(Math.max(gross - discount, 0).toFixed(2)),
      paidAmount: numberOrZero(stored?.paidAmount),
      paidAt: stored?.paidAt ?? null,
      paymentMethod: stored?.paymentMethod ?? profile.paymentMethod,
      status: stored?.status ?? "open",
      originType: "monthly",
      notes: stored?.notes ?? profile.notes,
      createdAt: stored?.createdAt ?? nowIso(),
      updatedAt: stored?.updatedAt ?? nowIso(),
    };
    charge.status = normalizeChargeStatus(charge);
    return charge;
  }).filter((charge) => charge.amountGross > 0);
};

const summarizeCharges = (charges: FinancialCharge[]) => {
  const activeCharges = charges.filter((charge) => charge.status !== "cancelled");
  const amountExpected = activeCharges.reduce((sum, charge) => sum + charge.amountNet, 0);
  const amountReceived = activeCharges.reduce((sum, charge) => sum + Math.min(charge.paidAmount, charge.amountNet), 0);
  const amountPending = activeCharges.reduce((sum, charge) => sum + Math.max(charge.amountNet - charge.paidAmount, 0), 0);
  const amountOverdue = activeCharges
    .filter((charge) => charge.status === "overdue")
    .reduce((sum, charge) => sum + Math.max(charge.amountNet - charge.paidAmount, 0), 0);

  return { amountExpected, amountReceived, amountPending, amountOverdue };
};

const buildAlerts = (
  studentRows: FinanceStudentRow[],
  courseRows: FinanceCourseSummary[],
  classRows: FinanceClassSummary[],
  charges: FinancialCharge[],
): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const now = new Date();
  const dueSoonLimit = new Date(now);
  dueSoonLimit.setDate(now.getDate() + 7);

  studentRows.forEach((student) => {
    if (student.amountOverdue > 0) {
      alerts.push({
        id: `student_overdue:${student.studentId}`,
        type: "student_overdue",
        severity: "high",
        title: `${student.studentName} está inadimplente`,
        description: `Saldo em atraso de R$ ${student.amountOverdue.toFixed(2)}.`,
        studentId: student.studentId,
        classId: student.classId,
        courseId: student.courseId,
      });
    }
  });

  charges
    .filter((charge) => charge.status !== "cancelled" && charge.status !== "paid")
    .forEach((charge) => {
      const dueDate = new Date(charge.dueDate);
      if (dueDate > now && dueDate <= dueSoonLimit) {
        alerts.push({
          id: `due_soon:${charge.id}`,
          type: "payment_due_soon",
          severity: "medium",
          title: "Pagamento próximo do vencimento",
          description: `${charge.description} vence em ${dueDate.toLocaleDateString("pt-BR")}.`,
          studentId: charge.studentId,
          classId: charge.classId,
          courseId: charge.courseId,
        });
      }
      if (charge.status === "overdue") {
        alerts.push({
          id: `overdue:${charge.id}`,
          type: "payment_overdue",
          severity: "high",
          title: "Pagamento vencido",
          description: `${charge.description} está em atraso desde ${dueDate.toLocaleDateString("pt-BR")}.`,
          studentId: charge.studentId,
          classId: charge.classId,
          courseId: charge.courseId,
        });
      }
      if (!charge.courseId || !charge.classId) {
        alerts.push({
          id: `missing_link:${charge.id}`,
          type: "missing_link",
          severity: "medium",
          title: "Lançamento com vínculo incompleto",
          description: `${charge.description} está sem curso ou turma vinculada.`,
          studentId: charge.studentId,
          classId: charge.classId,
          courseId: charge.courseId,
        });
      }
      if (charge.amountNet < 0 || charge.paidAmount < 0) {
        alerts.push({
          id: `inconsistency:${charge.id}`,
          type: "inconsistency",
          severity: "high",
          title: "Inconsistência financeira",
          description: `${charge.description} possui valores inválidos.`,
          studentId: charge.studentId,
          classId: charge.classId,
          courseId: charge.courseId,
        });
      }
    });

  [...courseRows, ...classRows].forEach((row) => {
    if (row.amountExpected > 0 && row.profitability < 0.4) {
      alerts.push({
        id: `low_profitability:${row.id}`,
        type: "low_profitability",
        severity: "low",
        title: `${row.name} com baixa rentabilidade`,
        description: `Recebimento de apenas ${(row.profitability * 100).toFixed(0)}% do previsto.`,
        courseId: courseRows.some((item) => item.id === row.id) ? row.id : undefined,
        classId: classRows.some((item) => item.id === row.id) ? row.id : undefined,
      });
    }
  });

  return alerts;
};

const filterSnapshotCharges = (charges: FinancialCharge[], filters: FinanceFilters) => {
  const now = new Date();
  const start = new Date(now);

  if (filters.period === "current_month") {
    start.setDate(1);
  } else if (filters.period === "last_3_months") {
    start.setMonth(start.getMonth() - 2, 1);
  } else if (filters.period === "last_6_months") {
    start.setMonth(start.getMonth() - 5, 1);
  } else if (filters.period === "current_year") {
    start.setMonth(0, 1);
  }

  return charges.filter((charge) => {
    const referenceDate = new Date(charge.referenceDate);
    if (filters.period !== "all" && referenceDate < start) return false;
    if (filters.studentId !== "all" && charge.studentId !== filters.studentId) return false;
    if (filters.classId !== "all" && charge.classId !== filters.classId) return false;
    if (filters.courseId !== "all" && charge.courseId !== filters.courseId) return false;
    if (filters.chargeStatus !== "all" && charge.status !== filters.chargeStatus) return false;
    if (filters.paymentMethod !== "all" && charge.paymentMethod !== filters.paymentMethod) return false;
    if (filters.dueFilter === "due_soon") {
      const dueDate = new Date(charge.dueDate);
      const limit = new Date(now);
      limit.setDate(now.getDate() + 7);
      if (!(dueDate > now && dueDate <= limit && charge.status !== "paid" && charge.status !== "cancelled")) {
        return false;
      }
    }
    if (filters.dueFilter === "overdue" && charge.status !== "overdue") return false;
    return true;
  });
};

export const buildEmptyFinanceFilters = (): FinanceFilters => ({
  period: "last_6_months",
  studentId: "all",
  classId: "all",
  courseId: "all",
  chargeStatus: "all",
  paymentMethod: "all",
  dueFilter: "all",
  lessonProgress: "all",
  search: "",
});

export const getPaymentMethodLabel = (method: PaymentMethod) => paymentMethodLabelMap[method];
export const getBillingModelLabel = (model: BillingModel) => billingModelLabelMap[model];
export const getChargeStatusLabel = (status: ChargeStatus) => chargeStatusLabelMap[status];

export const loadFinanceSnapshot = async (filters: FinanceFilters): Promise<FinanceSnapshot> => {
  const lessons = await fetchAgendaForAll();

  const courseItems = loadCourses();
  const classItems = loadStoredClasses();
  const studentProfiles = getStudentDirectory() as StudentProfileRecord[];
  const storedProfiles = loadFinancialProfiles();
  const storedCharges = loadFinancialCharges();
  const storedChargesById = new Map(storedCharges.map((charge) => [charge.id, charge]));

  const profiles = studentProfiles.map((student) => {
    const existing = storedProfiles.find((profile) => profile.studentId === student.id);
    return existing ?? createDefaultProfile(
      student,
      lessons.filter((lesson) => lesson.studentId === student.id),
      classItems,
      courseItems,
    );
  });

  const charges: FinancialCharge[] = [];

  profiles.forEach((profile) => {
    const studentLessons = lessons.filter((lesson) => lesson.studentId === profile.studentId);
    const lessonCharges = studentLessons
      .map((lesson) => buildLessonCharge(lesson, profile, courseItems, storedChargesById.get(`lesson:${lesson.id}`)))
      .filter((charge): charge is FinancialCharge => Boolean(charge));
    const recurringCharges = buildRecurringCharges(profile, studentLessons, storedChargesById);
    charges.push(...lessonCharges, ...recurringCharges);
  });

  storedCharges
    .filter((charge) => charge.originType === "manual")
    .forEach((charge) => charges.push({ ...charge, status: normalizeChargeStatus(charge) }));

  const dedupedCharges = Array.from(new Map(charges.map((charge) => [charge.id, charge])).values());
  const filteredCharges = filterSnapshotCharges(dedupedCharges, filters);
  const filteredLessons = lessons.filter((lesson) => {
    if (filters.studentId !== "all" && lesson.studentId !== filters.studentId) return false;
    if (filters.lessonProgress === "completed" && lesson.status !== "completed") return false;
    if (filters.lessonProgress === "pending" && lesson.status === "completed") return false;
    return true;
  });

  const studentRows = studentProfiles
    .map<FinanceStudentRow>((student) => {
      const profile = profiles.find((item) => item.studentId === student.id)!;
      const studentCharges = filteredCharges.filter((charge) => charge.studentId === student.id);
      const studentLessons = filteredLessons.filter((lesson) => lesson.studentId === student.id);
      const enrolledClass = classItems.find((item) => item.id === profile.classId) ?? classItems.find((item) => item.students.some((entry) => entry.studentId === student.id)) ?? null;
      const course = courseItems.find((item) => item.id === profile.courseId) ?? (enrolledClass ? courseItems.find((item) => item.id === enrolledClass.course_id) ?? null : null);
      const summary = summarizeCharges(studentCharges);
      const financialStatus =
        summary.amountOverdue > 0 ? "atrasado" : summary.amountPending > 0 ? "pendente" : "em_dia";

      return {
        studentId: student.id,
        studentName: student.full_name ?? "Aluno sem nome",
        courseId: course?.id ?? profile.courseId,
        courseName: course?.title ?? null,
        classId: enrolledClass?.id ?? profile.classId,
        className: enrolledClass?.name ?? null,
        agreedAmount: profile.agreedAmount ?? profile.monthlyAmount ?? profile.courseTotalAmount,
        billingModel: profile.billingModel,
        lessonsCompleted: studentLessons.filter((lesson) => lesson.status === "completed").length,
        lessonsPending: studentLessons.filter((lesson) => lesson.status !== "completed" && lesson.status !== "cancelled").length,
        amountExpected: summary.amountExpected,
        amountReceived: summary.amountReceived,
        amountPending: summary.amountPending,
        amountOverdue: summary.amountOverdue,
        financialStatus,
        paymentMethod: profile.paymentMethod,
        charges: studentCharges.sort((a, b) => new Date(b.referenceDate).getTime() - new Date(a.referenceDate).getTime()),
        notes: profile.notes,
      };
    })
    .filter((row) => {
      if (filters.studentId !== "all" && row.studentId !== filters.studentId) return false;
      if (filters.classId !== "all" && row.classId !== filters.classId) return false;
      if (filters.courseId !== "all" && row.courseId !== filters.courseId) return false;
      if (filters.chargeStatus !== "all") {
        if (!row.charges.some((charge) => charge.status === filters.chargeStatus)) return false;
      }
      if (filters.paymentMethod !== "all" && row.paymentMethod !== filters.paymentMethod) return false;
      if (filters.search) {
        const value = filters.search.toLowerCase();
        const haystack = `${row.studentName} ${row.className ?? ""} ${row.courseName ?? ""}`.toLowerCase();
        if (!haystack.includes(value)) return false;
      }
      return true;
    });

  const overview = studentRows.reduce<FinancialOverview>(
    (acc, row) => {
      acc.totalExpected += row.amountExpected;
      acc.totalReceived += row.amountReceived;
      acc.totalPending += row.amountPending;
      acc.totalOverdue += row.amountOverdue;
      if (row.amountExpected > 0) acc.payingStudents += 1;
      if (row.amountOverdue > 0) acc.overdueStudents += 1;
      return acc;
    },
    {
      totalExpected: 0,
      totalReceived: 0,
      totalPending: 0,
      totalOverdue: 0,
      payingStudents: 0,
      overdueStudents: 0,
      averageTicket: 0,
    },
  );
  overview.averageTicket = overview.payingStudents > 0 ? overview.totalExpected / overview.payingStudents : 0;

  const monthlyMap = new Map<string, { expected: number; received: number; pending: number; overdue: number }>();
  filteredCharges.forEach((charge) => {
    const key = monthKey(charge.referenceDate);
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { expected: 0, received: 0, pending: 0, overdue: 0 });
    }
    const item = monthlyMap.get(key)!;
    item.expected += charge.status === "cancelled" ? 0 : charge.amountNet;
    item.received += charge.status === "cancelled" ? 0 : Math.min(charge.paidAmount, charge.amountNet);
    item.pending += charge.status === "cancelled" ? 0 : Math.max(charge.amountNet - charge.paidAmount, 0);
    item.overdue += charge.status === "overdue" ? Math.max(charge.amountNet - charge.paidAmount, 0) : 0;
  });
  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ label: monthLabel(key), ...value }));

  const buildAggregate = (
    items: { id: string; name: string }[],
    getChargeMatch: (charge: FinancialCharge, itemId: string) => boolean,
    getLessonMatch: (lesson: AgendaEvent, itemId: string) => boolean,
  ): FinanceAggregateRow[] =>
    items.map((item) => {
      const itemCharges = filteredCharges.filter((charge) => getChargeMatch(charge, item.id));
      const itemLessons = filteredLessons.filter((lesson) => getLessonMatch(lesson, item.id));
      const relatedStudents = new Set(itemCharges.map((charge) => charge.studentId));
      const summary = summarizeCharges(itemCharges);
      return {
        id: item.id,
        name: item.name,
        studentsCount: relatedStudents.size,
        lessonsCompleted: itemLessons.filter((lesson) => lesson.status === "completed").length,
        lessonsPending: itemLessons.filter((lesson) => lesson.status !== "completed" && lesson.status !== "cancelled").length,
        amountExpected: summary.amountExpected,
        amountReceived: summary.amountReceived,
        amountPending: summary.amountPending,
        amountOverdue: summary.amountOverdue,
        profitability: summary.amountExpected > 0 ? summary.amountReceived / summary.amountExpected : 0,
        delinquencyRate: summary.amountExpected > 0 ? summary.amountOverdue / summary.amountExpected : 0,
      };
    }).filter((row) => row.studentsCount > 0 || row.amountExpected > 0 || row.lessonsCompleted > 0 || row.lessonsPending > 0);

  const courseRows = buildAggregate(
    courseItems.map((item) => ({ id: item.id, name: item.title })),
    (charge, itemId) => charge.courseId === itemId,
    (lesson, itemId) => {
      const courseId = lesson.courseId ?? courseItems.find((course) => course.title === lesson.title)?.id ?? null;
      return courseId === itemId;
    },
  );

  const classRows = buildAggregate(
    classItems.map((item) => ({ id: item.id, name: item.name })),
    (charge, itemId) => charge.classId === itemId,
    (lesson, itemId) => {
      const row = studentRows.find((student) => student.studentId === lesson.studentId);
      return row?.classId === itemId;
    },
  );

  const charts = {
    monthly,
    byCourse: courseRows
      .slice()
      .sort((a, b) => b.amountReceived - a.amountReceived)
      .map((row) => ({ name: row.name, value: row.amountReceived })),
    byClass: classRows
      .slice()
      .sort((a, b) => b.amountReceived - a.amountReceived)
      .map((row) => ({ name: row.name, value: row.amountReceived })),
    status: [
      { name: "Recebido", value: overview.totalReceived },
      { name: "Pendente", value: overview.totalPending - overview.totalOverdue },
      { name: "Atrasado", value: overview.totalOverdue },
    ],
  };

  const alerts = buildAlerts(studentRows, courseRows, classRows, filteredCharges)
    .filter((alert, index, array) => array.findIndex((candidate) => candidate.id === alert.id) === index)
    .sort((a, b) => {
      const weight = { high: 0, medium: 1, low: 2 };
      return weight[a.severity] - weight[b.severity];
    });

  return {
    students: studentRows,
    courses: courseRows,
    classes: classRows,
    charges: filteredCharges.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
    profiles,
    overview,
    charts,
    alerts,
    base: {
      students: studentProfiles,
      lessons,
      courses: courseItems,
      classes: classItems,
    },
  };
};
