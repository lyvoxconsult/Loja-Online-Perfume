import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeDollarSign,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  FileWarning,
  GraduationCap,
  Landmark,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { SEO } from "@/components/common/SEO";
import { cn } from "@/lib/utils";
import {
  buildEmptyFinanceFilters,
  getBillingModelLabel,
  getChargeStatusLabel,
  getPaymentMethodLabel,
  loadFinanceSnapshot,
  removeFinancialCharge,
  saveFinancialCharge,
  saveFinancialProfile,
  type FinanceSnapshot,
} from "@/services/finance";
import { useToast } from "@/hooks/use-toast";
import type {
  BillingModel,
  ChargeOriginType,
  ChargeStatus,
  FinancialCharge,
  FinanceFilters,
  FinanceStudentRow,
  PaymentMethod,
  StudentFinancialProfile,
} from "@/types/finance";

const CHART_COLORS = ["#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#6366f1", "#84cc16"];

const paymentMethodOptions: PaymentMethod[] = [
  "pix",
  "credit_card",
  "debit_card",
  "bank_slip",
  "bank_transfer",
  "cash",
  "not_informed",
];

const billingModelOptions: BillingModel[] = ["per_lesson", "monthly", "course_package"];
const chargeStatusOptions: ChargeStatus[] = ["draft", "open", "partial", "paid", "overdue", "cancelled"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

const formatDate = (value: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
};

type ProfileFormState = {
  id: string;
  studentId: string;
  classId: string;
  courseId: string;
  billingModel: BillingModel;
  agreedAmount: string;
  monthlyAmount: string;
  courseTotalAmount: string;
  discountAmount: string;
  discountType: "fixed" | "percentage";
  paymentMethod: PaymentMethod;
  dueDay: string;
  notes: string;
  active: boolean;
};

type ChargeFormState = {
  id: string;
  studentId: string;
  classId: string;
  courseId: string;
  lessonId: string;
  description: string;
  referenceDate: string;
  dueDate: string;
  amountGross: string;
  discountAmount: string;
  paidAmount: string;
  paidAt: string;
  paymentMethod: PaymentMethod;
  status: ChargeStatus;
  originType: ChargeOriginType;
  notes: string;
};

const FinancePage = () => {
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
  const [filters, setFilters] = useState<FinanceFilters>(buildEmptyFinanceFilters());
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState<FinanceStudentRow | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState | null>(null);
  const [chargeForm, setChargeForm] = useState<ChargeFormState | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const nextSnapshot = await loadFinanceSnapshot(filters);
      setSnapshot(nextSnapshot);
    } catch (error) {
      console.error("Erro ao carregar financeiro:", error);
      toast({
        title: "Erro ao carregar a guia Financeiro",
        description: "Verifique a conexão com os dados acadêmicos e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters.period, filters.studentId, filters.classId, filters.courseId, filters.chargeStatus, filters.paymentMethod, filters.dueFilter, filters.lessonProgress, filters.search]);

  const overdueStudents = useMemo(
    () => snapshot?.students.filter((student) => student.amountOverdue > 0).sort((a, b) => b.amountOverdue - a.amountOverdue) ?? [],
    [snapshot],
  );

  const topCourses = useMemo(
    () => snapshot?.courses.slice().sort((a, b) => b.amountReceived - a.amountReceived).slice(0, 5) ?? [],
    [snapshot],
  );

  const topClasses = useMemo(
    () => snapshot?.classes.slice().sort((a, b) => b.amountReceived - a.amountReceived).slice(0, 5) ?? [],
    [snapshot],
  );

  const statusBadgeClass = (status: ChargeStatus | FinanceStudentRow["financialStatus"]) => {
    if (status === "paid" || status === "em_dia") return "bg-green-100 text-green-800 border-green-200";
    if (status === "partial" || status === "open" || status === "draft" || status === "pendente") {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    if (status === "overdue" || status === "atrasado") return "bg-red-100 text-red-800 border-red-200";
    if (status === "cancelled") return "bg-slate-100 text-slate-700 border-slate-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const openProfileDialog = (student: FinanceStudentRow) => {
    const profile = snapshot?.profiles.find((item) => item.studentId === student.studentId);
    if (!profile) return;
    setProfileForm({
      id: profile.id,
      studentId: profile.studentId,
      classId: profile.classId ?? "none",
      courseId: profile.courseId ?? "none",
      billingModel: profile.billingModel,
      agreedAmount: profile.agreedAmount?.toString() ?? "",
      monthlyAmount: profile.monthlyAmount?.toString() ?? "",
      courseTotalAmount: profile.courseTotalAmount?.toString() ?? "",
      discountAmount: profile.discountAmount.toString(),
      discountType: profile.discountType,
      paymentMethod: profile.paymentMethod,
      dueDay: profile.dueDay?.toString() ?? "",
      notes: profile.notes ?? "",
      active: profile.active,
    });
    setProfileDialogOpen(true);
  };

  const openManualChargeDialog = () => {
    setChargeForm({
      id: "",
      studentId: "all",
      classId: "none",
      courseId: "none",
      lessonId: "",
      description: "",
      referenceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      amountGross: "",
      discountAmount: "0",
      paidAmount: "0",
      paidAt: "",
      paymentMethod: "pix",
      status: "open",
      originType: "manual",
      notes: "",
    });
    setChargeDialogOpen(true);
  };

  const openChargeDialog = (charge: FinancialCharge) => {
    setChargeForm({
      id: charge.id,
      studentId: charge.studentId,
      classId: charge.classId ?? "none",
      courseId: charge.courseId ?? "none",
      lessonId: charge.lessonId ?? "",
      description: charge.description,
      referenceDate: charge.referenceDate.split("T")[0],
      dueDate: charge.dueDate.split("T")[0],
      amountGross: charge.amountGross.toString(),
      discountAmount: charge.discountAmount.toString(),
      paidAmount: charge.paidAmount.toString(),
      paidAt: charge.paidAt ? charge.paidAt.split("T")[0] : "",
      paymentMethod: charge.paymentMethod,
      status: charge.status,
      originType: charge.originType,
      notes: charge.notes ?? "",
    });
    setChargeDialogOpen(true);
  };

  const saveProfile = async () => {
    if (!profileForm) return;
    const previous = snapshot?.profiles.find((item) => item.id === profileForm.id);
    const nextProfile: StudentFinancialProfile = {
      id: profileForm.id,
      studentId: profileForm.studentId,
      classId: profileForm.classId === "none" ? null : profileForm.classId,
      courseId: profileForm.courseId === "none" ? null : profileForm.courseId,
      billingModel: profileForm.billingModel,
      agreedAmount: profileForm.agreedAmount ? Number(profileForm.agreedAmount) : null,
      monthlyAmount: profileForm.monthlyAmount ? Number(profileForm.monthlyAmount) : null,
      courseTotalAmount: profileForm.courseTotalAmount ? Number(profileForm.courseTotalAmount) : null,
      discountAmount: Number(profileForm.discountAmount || "0"),
      discountType: profileForm.discountType,
      paymentMethod: profileForm.paymentMethod,
      dueDay: profileForm.dueDay ? Number(profileForm.dueDay) : null,
      notes: profileForm.notes || null,
      active: profileForm.active,
      createdAt: previous?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveFinancialProfile(nextProfile);
    setProfileDialogOpen(false);
    await load();
    toast({ title: "Perfil financeiro salvo com sucesso." });
  };

  const saveCharge = async () => {
    if (!chargeForm) return;
    if (chargeForm.studentId === "all") {
      toast({ title: "Selecione um aluno para o lançamento.", variant: "destructive" });
      return;
    }
    if (!chargeForm.description.trim()) {
      toast({ title: "Descrição do lançamento é obrigatória.", variant: "destructive" });
      return;
    }

    const gross = Number(chargeForm.amountGross || "0");
    const discount = Number(chargeForm.discountAmount || "0");
    const paidAmount = Number(chargeForm.paidAmount || "0");
    const amountNet = Math.max(gross - discount, 0);
    const id = chargeForm.id || `manual:${crypto.randomUUID()}`;
    const previous = snapshot?.charges.find((item) => item.id === id);
    const status: ChargeStatus =
      chargeForm.status === "cancelled"
        ? "cancelled"
        : paidAmount >= amountNet && amountNet > 0
          ? "paid"
          : paidAmount > 0
            ? new Date(chargeForm.dueDate) < new Date()
              ? "overdue"
              : "partial"
            : new Date(chargeForm.dueDate) < new Date()
              ? "overdue"
              : chargeForm.status;

    saveFinancialCharge({
      id,
      studentId: chargeForm.studentId,
      classId: chargeForm.classId === "none" ? null : chargeForm.classId,
      courseId: chargeForm.courseId === "none" ? null : chargeForm.courseId,
      lessonId: chargeForm.lessonId || null,
      description: chargeForm.description.trim(),
      referenceDate: new Date(`${chargeForm.referenceDate}T12:00:00`).toISOString(),
      dueDate: new Date(`${chargeForm.dueDate}T12:00:00`).toISOString(),
      amountGross: gross,
      discountAmount: discount,
      amountNet,
      paidAmount,
      paidAt: chargeForm.paidAt ? new Date(`${chargeForm.paidAt}T12:00:00`).toISOString() : null,
      paymentMethod: chargeForm.paymentMethod,
      status,
      originType: chargeForm.originType,
      notes: chargeForm.notes || null,
      createdAt: previous?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setChargeDialogOpen(false);
    await load();
    toast({ title: "Lançamento financeiro salvo com sucesso." });
  };

  const deleteCharge = async () => {
    if (!chargeForm?.id) return;
    removeFinancialCharge(chargeForm.id);
    setChargeDialogOpen(false);
    await load();
    toast({ title: "Lançamento removido com sucesso." });
  };

  if (loading || !snapshot) {
    return <LoadingState label="Carregando visão financeira..." />;
  }

  const summaryCards = [
    {
      label: "Faturamento previsto",
      value: formatCurrency(snapshot.overview.totalExpected),
      icon: Wallet,
      accent: "text-primary bg-primary/10",
    },
    {
      label: "Recebido",
      value: formatCurrency(snapshot.overview.totalReceived),
      icon: CircleDollarSign,
      accent: "text-success bg-success/10",
    },
    {
      label: "Pendentes",
      value: formatCurrency(snapshot.overview.totalPending),
      icon: CreditCard,
      accent: "text-warning bg-warning/10",
    },
    {
      label: "Em atraso",
      value: formatCurrency(snapshot.overview.totalOverdue),
      icon: FileWarning,
      accent: "text-destructive bg-destructive/10",
    },
    {
      label: "Pagantes",
      value: `${snapshot.overview.payingStudents}`,
      icon: Users,
      accent: "text-secondary bg-secondary/10",
    },
    {
      label: "Inadimplentes",
      value: `${snapshot.overview.overdueStudents}`,
      icon: AlertTriangle,
      accent: "text-destructive bg-destructive/10",
    },
    {
      label: "Ticket médio",
      value: formatCurrency(snapshot.overview.averageTicket),
      icon: BadgeDollarSign,
      accent: "text-accent bg-accent/10",
    },
  ];

  return (
    <div className="space-y-8">
      <SEO title="Financeiro - Gestor" />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Controle financeiro integrado com cursos, turmas, alunos e aulas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={load}>
            Atualizar dados
          </Button>
          <Button onClick={openManualChargeDialog} className="bg-gradient-accent hover:opacity-95">
            <Plus className="h-4 w-4 mr-2" />
            Novo lançamento
          </Button>
        </div>
      </div>

      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-primary">
            <Landmark className="h-4 w-4 text-secondary" />
            Base operacional da guia Financeiro
          </div>
          <p>
            Dados acadêmicos e financeiros são simulados e persistidos localmente neste navegador.
            Todas as ações desta tela funcionam sem banco de dados ou serviço externo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros financeiros</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <Input
              placeholder="Buscar aluno, turma ou curso..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />

            <Select value={filters.period} onValueChange={(value) => setFilters((prev) => ({ ...prev, period: value as FinanceFilters["period"] }))}>
              <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="current_month">Mês atual</SelectItem>
                <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
                <SelectItem value="current_year">Ano atual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.studentId} onValueChange={(value) => setFilters((prev) => ({ ...prev, studentId: value }))}>
              <SelectTrigger><SelectValue placeholder="Aluno" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os alunos</SelectItem>
                {snapshot.base.students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name ?? student.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.classId} onValueChange={(value) => setFilters((prev) => ({ ...prev, classId: value }))}>
              <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {snapshot.base.classes.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.courseId} onValueChange={(value) => setFilters((prev) => ({ ...prev, courseId: value }))}>
              <SelectTrigger><SelectValue placeholder="Curso" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {snapshot.base.courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.chargeStatus} onValueChange={(value) => setFilters((prev) => ({ ...prev, chargeStatus: value }))}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {chargeStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getChargeStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.paymentMethod} onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as formas</SelectItem>
                {paymentMethodOptions.map((method) => (
                  <SelectItem key={method} value={method}>
                    {getPaymentMethodLabel(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.dueFilter} onValueChange={(value) => setFilters((prev) => ({ ...prev, dueFilter: value as FinanceFilters["dueFilter"] }))}>
              <SelectTrigger><SelectValue placeholder="Vencimento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vencimentos</SelectItem>
                <SelectItem value="due_soon">Próximos do vencimento</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.lessonProgress} onValueChange={(value) => setFilters((prev) => ({ ...prev, lessonProgress: value as FinanceFilters["lessonProgress"] }))}>
              <SelectTrigger><SelectValue placeholder="Aulas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as aulas</SelectItem>
                <SelectItem value="completed">Aulas realizadas</SelectItem>
                <SelectItem value="pending">Aulas pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3", item.accent)}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-primary">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="groups">Cursos & Turmas</TabsTrigger>
          <TabsTrigger value="charges">Lançamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Faturamento mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={snapshot.charts.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="expected" name="Previsto" stroke="#0f172a" strokeWidth={2} />
                      <Line type="monotone" dataKey="received" name="Recebido" stroke="#14b8a6" strokeWidth={2} />
                      <Line type="monotone" dataKey="pending" name="Pendente" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recebido vs pendente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={snapshot.charts.status}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                      >
                        {snapshot.charts.status.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receita por curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snapshot.charts.byCourse.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receita por turma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snapshot.charts.byClass.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ranking financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <GraduationCap className="h-4 w-4" />
                    Cursos mais rentáveis
                  </div>
                  {topCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum curso com receita consolidada ainda.</p>
                  ) : (
                    topCourses.map((row, index) => (
                      <div key={row.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{index + 1}. {row.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.studentsCount} aluno(s) · {formatPercent(row.profitability)} de recebimento
                          </p>
                        </div>
                        <p className="font-semibold text-primary">{formatCurrency(row.amountReceived)}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Users className="h-4 w-4" />
                    Turmas com maior faturamento
                  </div>
                  {topClasses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma turma com faturamento consolidado ainda.</p>
                  ) : (
                    topClasses.map((row, index) => (
                      <div key={row.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{index + 1}. {row.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.studentsCount} aluno(s) · inadimplência de {formatPercent(row.delinquencyRate)}
                          </p>
                        </div>
                        <p className="font-semibold text-primary">{formatCurrency(row.amountReceived)}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alertas financeiros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {snapshot.alerts.length === 0 ? (
                  <EmptyState icon={CalendarClock} title="Sem alertas no momento" description="Nenhuma inconsistência ou pendência relevante." />
                ) : (
                  snapshot.alerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="rounded-lg border p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={cn(
                          "h-4 w-4 mt-0.5",
                          alert.severity === "high" ? "text-destructive" : alert.severity === "medium" ? "text-warning" : "text-secondary",
                        )} />
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alunos com pagamentos em atraso</CardTitle>
            </CardHeader>
            <CardContent>
              {overdueStudents.length === 0 ? (
                <EmptyState icon={Users} title="Nenhum aluno inadimplente" description="Os alunos filtrados estão em dia." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Em atraso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{student.studentName}</TableCell>
                        <TableCell>{student.courseName ?? "Sem curso"}</TableCell>
                        <TableCell>{student.className ?? "Sem turma"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusBadgeClass(student.financialStatus)}>
                            {student.financialStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          {formatCurrency(student.amountOverdue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Controle financeiro por aluno</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshot.students.length === 0 ? (
                <EmptyState icon={Users} title="Nenhum aluno financeiro encontrado" description="Ajuste os filtros ou cadastre lançamentos." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Curso / turma</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Aulas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Previsto</TableHead>
                      <TableHead className="text-right">Recebido</TableHead>
                      <TableHead className="text-right">Aberto</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.students.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.studentName}</p>
                            <p className="text-xs text-muted-foreground">{getPaymentMethodLabel(student.paymentMethod)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{student.courseName ?? "Sem curso"}</p>
                            <p className="text-xs text-muted-foreground">{student.className ?? "Sem turma"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getBillingModelLabel(student.billingModel)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{student.lessonsCompleted} realizadas</p>
                            <p className="text-xs text-muted-foreground">{student.lessonsPending} pendentes</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusBadgeClass(student.financialStatus)}>
                            {student.financialStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(student.amountExpected)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(student.amountReceived)}</TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          {formatCurrency(student.amountPending)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openProfileDialog(student)}>
                              Perfil
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setActiveStudent(student)}>
                              Histórico
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receita por curso</CardTitle>
              </CardHeader>
              <CardContent>
                {snapshot.courses.length === 0 ? (
                  <EmptyState icon={GraduationCap} title="Sem dados por curso" description="Associe aulas ou lançamentos a cursos." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead>Alunos</TableHead>
                        <TableHead className="text-right">Previsto</TableHead>
                        <TableHead className="text-right">Recebido</TableHead>
                        <TableHead className="text-right">Pendente</TableHead>
                        <TableHead className="text-right">Rentabilidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {snapshot.courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{course.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {course.lessonsCompleted} aula(s) realizadas · {course.lessonsPending} pendentes
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{course.studentsCount}</TableCell>
                          <TableCell className="text-right">{formatCurrency(course.amountExpected)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(course.amountReceived)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(course.amountPending)}</TableCell>
                          <TableCell className="text-right">{formatPercent(course.profitability)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receita por turma</CardTitle>
              </CardHeader>
              <CardContent>
                {snapshot.classes.length === 0 ? (
                  <EmptyState icon={Users} title="Sem dados por turma" description="Cadastre turmas e vínculos com alunos." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Turma</TableHead>
                        <TableHead>Alunos</TableHead>
                        <TableHead className="text-right">Previsto</TableHead>
                        <TableHead className="text-right">Recebido</TableHead>
                        <TableHead className="text-right">Inadimplência</TableHead>
                        <TableHead className="text-right">Rentabilidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {snapshot.classes.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.lessonsCompleted} aula(s) realizadas · {item.lessonsPending} pendentes
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{item.studentsCount}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amountExpected)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amountReceived)}</TableCell>
                          <TableCell className="text-right">{formatPercent(item.delinquencyRate)}</TableCell>
                          <TableCell className="text-right">{formatPercent(item.profitability)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lançamentos financeiros</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshot.charges.length === 0 ? (
                <EmptyState icon={Wallet} title="Nenhum lançamento encontrado" description="Cadastre um lançamento manual ou utilize aulas com valor informado." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Pago</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshot.charges.map((charge) => {
                      const student = snapshot.students.find((item) => item.studentId === charge.studentId);
                      return (
                        <TableRow key={charge.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{charge.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {charge.notes ?? "Sem observações"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{student?.studentName ?? charge.studentId.slice(0, 8)}</TableCell>
                          <TableCell className="capitalize">{charge.originType}</TableCell>
                          <TableCell>{formatDate(charge.dueDate)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusBadgeClass(charge.status)}>
                              {getChargeStatusLabel(charge.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(charge.amountNet)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(charge.paidAmount)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openChargeDialog(charge)}>
                                Editar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!activeStudent} onOpenChange={(open) => !open && setActiveStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {activeStudent && (
            <>
              <DialogHeader>
                <DialogTitle>{activeStudent.studentName}</DialogTitle>
                <DialogDescription>
                  Histórico financeiro, vínculo acadêmico e saldo atual do aluno.
                </DialogDescription>
              </DialogHeader>
              <div className="grid lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Curso</Label>
                      <p className="font-medium">{activeStudent.courseName ?? "Sem curso"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Turma</Label>
                      <p className="font-medium">{activeStudent.className ?? "Sem turma"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Valor acordado</Label>
                      <p className="font-medium">
                        {activeStudent.agreedAmount ? formatCurrency(activeStudent.agreedAmount) : "Não definido"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Aulas realizadas</Label>
                      <p className="font-medium">{activeStudent.lessonsCompleted}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Aulas pendentes</Label>
                      <p className="font-medium">{activeStudent.lessonsPending}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status financeiro</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className={statusBadgeClass(activeStudent.financialStatus)}>
                          {activeStudent.financialStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardContent className="p-0">
                    <ScrollArea className="h-[420px]">
                      <div className="p-4 space-y-4">
                        {activeStudent.charges.length === 0 ? (
                          <EmptyState icon={Wallet} title="Sem histórico financeiro" description="Nenhum lançamento para este aluno." />
                        ) : (
                          activeStudent.charges.map((charge) => (
                            <div key={charge.id} className="rounded-lg border p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                  <p className="font-medium">{charge.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Referência: {formatDate(charge.referenceDate)} · Vencimento: {formatDate(charge.dueDate)}
                                  </p>
                                </div>
                                <Badge variant="outline" className={statusBadgeClass(charge.status)}>
                                  {getChargeStatusLabel(charge.status)}
                                </Badge>
                              </div>
                              <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
                                <div>
                                  <Label className="text-muted-foreground">Valor</Label>
                                  <p className="font-medium">{formatCurrency(charge.amountNet)}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Pago</Label>
                                  <p className="font-medium">{formatCurrency(charge.paidAmount)}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Pagamento</Label>
                                  <p className="font-medium">{getPaymentMethodLabel(charge.paymentMethod)}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {profileForm && (
            <>
              <DialogHeader>
                <DialogTitle>Perfil financeiro do aluno</DialogTitle>
                <DialogDescription>
                  Defina regras de cobrança, vínculo acadêmico e vencimento padrão.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Aluno</Label>
                    <Select value={profileForm.studentId} onValueChange={(value) => setProfileForm((prev) => prev ? { ...prev, studentId: value } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {snapshot.base.students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name ?? student.id.slice(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Modelo de cobrança</Label>
                    <Select value={profileForm.billingModel} onValueChange={(value) => setProfileForm((prev) => prev ? { ...prev, billingModel: value as BillingModel } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {billingModelOptions.map((model) => (
                          <SelectItem key={model} value={model}>
                            {getBillingModelLabel(model)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Curso</Label>
                    <Select value={profileForm.courseId} onValueChange={(value) => setProfileForm((prev) => prev ? { ...prev, courseId: value } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem curso</SelectItem>
                        {snapshot.base.courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Turma</Label>
                    <Select value={profileForm.classId} onValueChange={(value) => setProfileForm((prev) => prev ? { ...prev, classId: value } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem turma</SelectItem>
                        {snapshot.base.classes.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Valor acordado</Label>
                    <Input value={profileForm.agreedAmount} onChange={(e) => setProfileForm((prev) => prev ? { ...prev, agreedAmount: e.target.value } : prev)} type="number" min="0" step="0.01" />
                  </div>
                  <div>
                    <Label>Valor mensal</Label>
                    <Input value={profileForm.monthlyAmount} onChange={(e) => setProfileForm((prev) => prev ? { ...prev, monthlyAmount: e.target.value } : prev)} type="number" min="0" step="0.01" />
                  </div>
                  <div>
                    <Label>Valor do pacote</Label>
                    <Input value={profileForm.courseTotalAmount} onChange={(e) => setProfileForm((prev) => prev ? { ...prev, courseTotalAmount: e.target.value } : prev)} type="number" min="0" step="0.01" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <Label>Desconto</Label>
                    <Input value={profileForm.discountAmount} onChange={(e) => setProfileForm((prev) => prev ? { ...prev, discountAmount: e.target.value } : prev)} type="number" min="0" step="0.01" />
                  </div>
                  <div>
                    <Label>Tipo do desconto</Label>
                    <Select value={profileForm.discountType} onValueChange={(value) => setProfileForm((prev) => prev ? { ...prev, discountType: value as ProfileFormState["discountType"] } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Valor fixo</SelectItem>
                        <SelectItem value="percentage">Percentual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Forma padrão</Label>
                    <Select value={profileForm.paymentMethod} onValueChange={(value) => setProfileForm((prev) => prev ? { ...prev, paymentMethod: value as PaymentMethod } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map((method) => (
                          <SelectItem key={method} value={method}>
                            {getPaymentMethodLabel(method)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Dia do vencimento</Label>
                    <Input value={profileForm.dueDay} onChange={(e) => setProfileForm((prev) => prev ? { ...prev, dueDay: e.target.value } : prev)} type="number" min="1" max="31" />
                  </div>
                </div>

                <div>
                  <Label>Observações financeiras</Label>
                  <Textarea value={profileForm.notes} onChange={(e) => setProfileForm((prev) => prev ? { ...prev, notes: e.target.value } : prev)} rows={4} placeholder="Observações internas sobre acordo, descontos ou condições de pagamento." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveProfile}>Salvar perfil</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={chargeDialogOpen} onOpenChange={setChargeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {chargeForm && (
            <>
              <DialogHeader>
                <DialogTitle>{chargeForm.id ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
                <DialogDescription>
                  Lance cobranças, registre pagamentos e acompanhe o status financeiro.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Aluno</Label>
                    <Select value={chargeForm.studentId} onValueChange={(value) => setChargeForm((prev) => prev ? { ...prev, studentId: value } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Selecione um aluno</SelectItem>
                        {snapshot.base.students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name ?? student.id.slice(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Origem</Label>
                    <Select value={chargeForm.originType} onValueChange={(value) => setChargeForm((prev) => prev ? { ...prev, originType: value as ChargeOriginType } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="lesson">Aula</SelectItem>
                        <SelectItem value="monthly">Mensalidade</SelectItem>
                        <SelectItem value="package">Pacote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Input value={chargeForm.description} onChange={(e) => setChargeForm((prev) => prev ? { ...prev, description: e.target.value } : prev)} placeholder="Ex: Mensalidade de maio" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Curso</Label>
                    <Select value={chargeForm.courseId} onValueChange={(value) => setChargeForm((prev) => prev ? { ...prev, courseId: value } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem curso</SelectItem>
                        {snapshot.base.courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Turma</Label>
                    <Select value={chargeForm.classId} onValueChange={(value) => setChargeForm((prev) => prev ? { ...prev, classId: value } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem turma</SelectItem>
                        {snapshot.base.classes.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <Label>Referência</Label>
                    <Input type="date" value={chargeForm.referenceDate} onChange={(e) => setChargeForm((prev) => prev ? { ...prev, referenceDate: e.target.value } : prev)} />
                  </div>
                  <div>
                    <Label>Vencimento</Label>
                    <Input type="date" value={chargeForm.dueDate} onChange={(e) => setChargeForm((prev) => prev ? { ...prev, dueDate: e.target.value } : prev)} />
                  </div>
                  <div>
                    <Label>Valor bruto</Label>
                    <Input type="number" min="0" step="0.01" value={chargeForm.amountGross} onChange={(e) => setChargeForm((prev) => prev ? { ...prev, amountGross: e.target.value } : prev)} />
                  </div>
                  <div>
                    <Label>Desconto</Label>
                    <Input type="number" min="0" step="0.01" value={chargeForm.discountAmount} onChange={(e) => setChargeForm((prev) => prev ? { ...prev, discountAmount: e.target.value } : prev)} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <Label>Pago</Label>
                    <Input type="number" min="0" step="0.01" value={chargeForm.paidAmount} onChange={(e) => setChargeForm((prev) => prev ? { ...prev, paidAmount: e.target.value } : prev)} />
                  </div>
                  <div>
                    <Label>Data do pagamento</Label>
                    <Input type="date" value={chargeForm.paidAt} onChange={(e) => setChargeForm((prev) => prev ? { ...prev, paidAt: e.target.value } : prev)} />
                  </div>
                  <div>
                    <Label>Forma de pagamento</Label>
                    <Select value={chargeForm.paymentMethod} onValueChange={(value) => setChargeForm((prev) => prev ? { ...prev, paymentMethod: value as PaymentMethod } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map((method) => (
                          <SelectItem key={method} value={method}>
                            {getPaymentMethodLabel(method)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={chargeForm.status} onValueChange={(value) => setChargeForm((prev) => prev ? { ...prev, status: value as ChargeStatus } : prev)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {chargeStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getChargeStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Observações financeiras</Label>
                  <Textarea value={chargeForm.notes} onChange={(e) => setChargeForm((prev) => prev ? { ...prev, notes: e.target.value } : prev)} rows={3} placeholder="Anotações internas, referência de comprovante ou contexto do lançamento." />
                </div>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {chargeForm.id && (
                  <Button variant="destructive" onClick={deleteCharge}>
                    Excluir lançamento
                  </Button>
                )}
                <Button variant="outline" onClick={() => setChargeDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveCharge}>Salvar lançamento</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancePage;
