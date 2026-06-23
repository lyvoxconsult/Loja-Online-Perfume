import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Users, Search, Eye, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { SEO } from "@/components/common/SEO";
import { loadCourses } from "@/services/courses";
import {
  getCourseLabel,
  getStudentMetrics,
  loadDemoClasses,
  loadDemoStudents,
  saveDemoStudents,
  type DemoStudent,
} from "@/services/demoSchool";

type StudentForm = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  level: string;
  course_id: string;
  class_id: string;
  status: DemoStudent["status"];
  progress: string;
};

const emptyForm: StudentForm = {
  id: "",
  full_name: "",
  email: "",
  phone: "",
  level: "A1",
  course_id: "",
  class_id: "",
  status: "ativo",
  progress: "0",
};

const Students = () => {
  const [q, setQ] = useState("");
  const [students, setStudents] = useState(getStudentMetrics());
  const [active, setActive] = useState<(ReturnType<typeof getStudentMetrics>[number]) | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const classes = loadDemoClasses();
  const courses = loadCourses();

  const reload = () => setStudents(getStudentMetrics());

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    if (!search) return students;
    return students.filter((student) => (
      student.full_name.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      getCourseLabel(student.course_id).toLowerCase().includes(search)
    ));
  }, [students, q]);

  const openNew = () => {
    setForm({
      ...emptyForm,
      course_id: courses[0]?.id ?? "",
      class_id: classes[0]?.id ?? "",
    });
    setFormOpen(true);
  };

  const openEdit = (student: DemoStudent) => {
    setForm({
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      level: student.level,
      course_id: student.course_id,
      class_id: student.class_id,
      status: student.status,
      progress: String(student.progress),
    });
    setFormOpen(true);
  };

  const persistStudent = () => {
    if (!form.full_name.trim()) return toast.error("Nome do aluno e obrigatorio.");
    if (!form.email.trim()) return toast.error("E-mail do aluno e obrigatorio.");
    if (!form.course_id) return toast.error("Selecione um curso.");
    if (!form.class_id) return toast.error("Selecione uma turma.");

    const current = loadDemoStudents();
    const previous = current.find((item) => item.id === form.id);
    const nextStudent: DemoStudent = {
      id: form.id || crypto.randomUUID(),
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      level: form.level.trim() || "A1",
      course_id: form.course_id,
      class_id: form.class_id,
      status: form.status,
      progress: Math.max(0, Math.min(100, Number(form.progress) || 0)),
      created_at: previous?.created_at ?? new Date().toISOString(),
    };

    const next = previous
      ? current.map((item) => (item.id === previous.id ? nextStudent : item))
      : [nextStudent, ...current];
    saveDemoStudents(next);
    reload();
    setFormOpen(false);
    toast.success(previous ? "Aluno atualizado" : "Aluno criado");
  };

  const removeStudent = (id: string) => {
    saveDemoStudents(loadDemoStudents().filter((student) => student.id !== id));
    reload();
    toast.success("Aluno removido");
  };

  return (
    <div className="space-y-6">
      <SEO title="Alunos - Gestor" />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Alunos</h1>
          <p className="text-muted-foreground mt-1">{students.length} aluno(s) cadastrado(s).</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-accent hover:opacity-95">
          <Plus className="h-4 w-4 mr-2" /> Novo aluno
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nome, e-mail ou curso..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8"><EmptyState icon={Users} title="Nenhum aluno encontrado" /></CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => {
            const initials = student.full_name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase();
            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-accent text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary truncate">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{student.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{getCourseLabel(student.course_id)}</span>
                      <span className="font-semibold text-primary">{student.progress}%</span>
                    </div>
                    <Progress value={student.progress} className="h-1.5" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted rounded-lg py-2"><p className="text-lg font-bold text-primary">{student.lessonsCount}</p><p className="text-[10px] text-muted-foreground uppercase">aulas</p></div>
                    <div className="bg-muted rounded-lg py-2"><p className="text-lg font-bold text-primary">{student.materialsCount}</p><p className="text-[10px] text-muted-foreground uppercase">materiais</p></div>
                    <div className="bg-muted rounded-lg py-2"><p className="text-lg font-bold text-accent">{student.avgScore}%</p><p className="text-[10px] text-muted-foreground uppercase">score</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" aria-label={`Ver ${student.full_name}`} onClick={() => setActive(student)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" aria-label={`Editar ${student.full_name}`} onClick={() => openEdit(student)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" aria-label={`Excluir ${student.full_name}`} className="text-destructive hover:text-destructive" onClick={() => removeStudent(student.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar aluno" : "Novo aluno"}</DialogTitle>
            <DialogDescription>Cadastre ou atualize os dados academicos usados na demo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Nome</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Nivel</Label><Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></div>
              <div><Label>Progresso</Label><Input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as DemoStudent["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="inadimplente">Inadimplente</SelectItem>
                    <SelectItem value="concluido">Concluido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Curso</Label>
                <Select value={form.course_id} onValueChange={(value) => setForm({ ...form, course_id: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Turma</Label>
                <Select value={form.class_id} onValueChange={(value) => setForm({ ...form, class_id: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{classes.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={persistStudent}>Salvar aluno</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.full_name}</DialogTitle>
                <DialogDescription>Resumo academico do aluno.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{active.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{active.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Curso</span><span>{getCourseLabel(active.course_id)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Turma</span><span>{classes.find((item) => item.id === active.class_id)?.name ?? "Sem turma"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline">{active.status}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total de aulas</span><Badge variant="outline">{active.lessonsCount}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total de materiais</span><Badge variant="outline">{active.materialsCount}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Score medio</span><Badge className="bg-accent/10 text-accent border-accent/20">{active.avgScore}%</Badge></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
