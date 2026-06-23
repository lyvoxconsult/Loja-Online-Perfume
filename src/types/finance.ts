export type BillingModel = "per_lesson" | "monthly" | "course_package";

export type DiscountType = "fixed" | "percentage";

export type PaymentMethod =
  | "pix"
  | "credit_card"
  | "debit_card"
  | "bank_slip"
  | "bank_transfer"
  | "cash"
  | "not_informed";

export type ChargeStatus = "draft" | "open" | "partial" | "paid" | "overdue" | "cancelled";

export type ChargeOriginType = "lesson" | "monthly" | "package" | "manual";

export type FinancialAlertType =
  | "student_overdue"
  | "payment_due_soon"
  | "payment_overdue"
  | "low_profitability"
  | "missing_link"
  | "inconsistency";

export type FinancialStatus = "em_dia" | "pendente" | "atrasado";

export interface StudentFinancialProfile {
  id: string;
  studentId: string;
  classId: string | null;
  courseId: string | null;
  billingModel: BillingModel;
  agreedAmount: number | null;
  monthlyAmount: number | null;
  courseTotalAmount: number | null;
  discountAmount: number;
  discountType: DiscountType;
  paymentMethod: PaymentMethod;
  dueDay: number | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialCharge {
  id: string;
  studentId: string;
  classId: string | null;
  courseId: string | null;
  lessonId: string | null;
  description: string;
  referenceDate: string;
  dueDate: string;
  amountGross: number;
  discountAmount: number;
  amountNet: number;
  paidAmount: number;
  paidAt: string | null;
  paymentMethod: PaymentMethod;
  status: ChargeStatus;
  originType: ChargeOriginType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceStudentRow {
  studentId: string;
  studentName: string;
  courseId: string | null;
  courseName: string | null;
  classId: string | null;
  className: string | null;
  agreedAmount: number | null;
  billingModel: BillingModel;
  lessonsCompleted: number;
  lessonsPending: number;
  amountExpected: number;
  amountReceived: number;
  amountPending: number;
  amountOverdue: number;
  financialStatus: FinancialStatus;
  paymentMethod: PaymentMethod;
  charges: FinancialCharge[];
  notes: string | null;
}

export interface FinanceAggregateRow {
  id: string;
  name: string;
  studentsCount: number;
  lessonsCompleted: number;
  lessonsPending: number;
  amountExpected: number;
  amountReceived: number;
  amountPending: number;
  amountOverdue: number;
  profitability: number;
  delinquencyRate: number;
}

export interface FinancialAlert {
  id: string;
  type: FinancialAlertType;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  studentId?: string | null;
  classId?: string | null;
  courseId?: string | null;
}

export interface FinancialOverview {
  totalExpected: number;
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  payingStudents: number;
  overdueStudents: number;
  averageTicket: number;
}

export interface FinancialChartPoint {
  label: string;
  expected: number;
  received: number;
  pending: number;
  overdue: number;
}

export interface FinanceFilters {
  period: "all" | "current_month" | "last_3_months" | "last_6_months" | "current_year";
  studentId: string;
  classId: string;
  courseId: string;
  chargeStatus: string;
  paymentMethod: string;
  dueFilter: "all" | "due_soon" | "overdue";
  lessonProgress: "all" | "completed" | "pending";
  search: string;
}
