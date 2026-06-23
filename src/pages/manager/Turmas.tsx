import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Search, Plus, Pencil, Trash2, Eye, GraduationCap, Calendar } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { SEO } from "@/components/common/SEO";
import { loadCourses, type Course } from "@/services/courses";
import { getStudentDirectory, loadDemoClasses, saveDemoClasses, type DemoClass } from "@/services/demoSchool";
import { toast } from "sonner";

const emptyForm = { id: "", name: "", course_id: "", description: "", status: "ativa" as DemoClass["status"], start_date: "", end_date: "", teacher: "", notes: "", studentIds: [] as string[] };

const ManagerTurmas = () => {
  const [classes, setClasses] = useState(loadDemoClasses());
  const [courses] = useState<Course[]>(loadCourses());
  const [students] = useState(getStudentDirectory());
  const [q, setQ] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeClass, setActiveClass] = useState<DemoClass | null>(null);

  const persist = (items: DemoClass[]) => {
    saveDemoClasses(items);
    setClasses(loadDemoClasses());
  };

  const filtered = useMemo(() => {
    return classes.filter((item) => {
      if (q.trim() && !item.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
      if (filterCourse !== "all" && item.course_id !== filterCourse) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      return true;
    });
  }, [classes, q, filterCourse, filterStatus]);

  const save = () => {
    if (!form.name.trim()) return toast.error("Nome da turma e obrigatorio");
    if (!form.course_id) return toast.error("Selecione um curso");
    const nextClass: DemoClass = {
      id: form.id || crypto.randomUUID(),
      name: form.name.trim(),
      course_id: form.course_id,
      description: form.description || null,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      teacher: form.teacher || null,
      notes: form.notes || null,
      created_at: new Date().toISOString(),
      students: students.filter((student) => form.studentIds.includes(student.id)).map((student) => ({ studentId: student.id, studentName: student.full_name })),
    };
    const next = form.id ? classes.map((item) => item.id === form.id ? nextClass : item) : [...classes, nextClass];
    persist(next);
    setOpen(false);
    toast.success(form.id ? "Turma atualizada" : "Turma criada");
  };

  return (
    <div className="space-y-6">
      <SEO title="Turmas - Gestor" />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl md:text-3xl font-bold text-primary">Turmas</h1><p className="text-muted-foreground mt-1">{classes.length} turma(s) cadastrada(s).</p></div>
        <Button onClick={() => { setForm(emptyForm); setOpen(true); }} className="bg-gradient-accent hover:opacity-95"><Plus className="h-4 w-4 mr-2" /> Nova Turma</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar por nome..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select value={filterCourse} onValueChange={setFilterCourse}><SelectTrigger className="w-48"><SelectValue placeholder="Curso" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os cursos</SelectItem>{courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}</SelectContent></Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="ativa">Ativa</SelectItem><SelectItem value="inativa">Inativa</SelectItem><SelectItem value="concluida">Concluida</SelectItem><SelectItem value="arquivada">Arquivada</SelectItem></SelectContent></Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8"><EmptyState icon={Users} title="Nenhuma turma" description="Crie sua primeira turma" /></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{courses.find((course) => course.id === item.course_id)?.title ?? "Sem curso"}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{item.students.length} alunos</span>
                      {item.start_date && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(item.start_date).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setActiveClass(item); setViewOpen(true); }}><Eye className="h-4 w-4 mr-1" /> Ver</Button>
                    <Button variant="outline" size="sm" onClick={() => { setForm({ id: item.id, name: item.name, course_id: item.course_id, description: item.description ?? "", status: item.status, start_date: item.start_date ?? "", end_date: item.end_date ?? "", teacher: item.teacher ?? "", notes: item.notes ?? "", studentIds: item.students.map((student) => student.studentId) }); setOpen(true); }}><Pencil className="h-4 w-4 mr-1" /> Editar</Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => { persist(classes.filter((entry) => entry.id !== item.id)); toast.success("Turma removida"); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Editar Turma" : "Nova Turma"}</DialogTitle><DialogDescription>Preencha os dados da turma.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Nome da Turma</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Curso</Label><Select value={form.course_id} onValueChange={(value) => setForm({ ...form, course_id: value })}><SelectTrigger><SelectValue placeholder="Selecione um curso" /></SelectTrigger><SelectContent>{courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as DemoClass["status"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ativa">Ativa</SelectItem><SelectItem value="inativa">Inativa</SelectItem><SelectItem value="concluida">Concluida</SelectItem><SelectItem value="arquivada">Arquivada</SelectItem></SelectContent></Select></div>
              <div><Label>Professor</Label><Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data de Inicio</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>Data de Termino</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div><Label>Descricao</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <Label>Alunos ({form.studentIds.length} selecionados)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-2">
                    <Checkbox checked={form.studentIds.includes(student.id)} onCheckedChange={() => setForm((prev) => ({ ...prev, studentIds: prev.studentIds.includes(student.id) ? prev.studentIds.filter((id) => id !== student.id) : [...prev.studentIds, student.id] }))} />
                    <span className="text-sm truncate">{student.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Observacoes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} className="bg-gradient-accent hover:opacity-95">Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeClass && (
            <>
              <DialogHeader><DialogTitle>{activeClass.name}</DialogTitle><DialogDescription>{courses.find((course) => course.id === activeClass.course_id)?.title ?? "Sem curso"}</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2"><Badge variant="outline">{activeClass.status}</Badge>{activeClass.teacher && <Badge variant="outline">{activeClass.teacher}</Badge>}</div>
                {activeClass.description && <div><Label className="text-muted-foreground">Descricao</Label><p>{activeClass.description}</p></div>}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {activeClass.start_date && <div><Label className="text-muted-foreground">Inicio</Label><p>{new Date(activeClass.start_date).toLocaleDateString("pt-BR")}</p></div>}
                  {activeClass.end_date && <div><Label className="text-muted-foreground">Termino</Label><p>{new Date(activeClass.end_date).toLocaleDateString("pt-BR")}</p></div>}
                </div>
                <div>
                  <Label className="text-muted-foreground">Alunos ({activeClass.students.length})</Label>
                  <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                    {activeClass.students.length === 0 ? <p className="p-3 text-sm text-muted-foreground">Nenhum aluno vinculado</p> : activeClass.students.map((student) => <div key={student.studentId} className="p-2 text-sm flex items-center gap-2"><Users className="h-4 w-4" />{student.studentName ?? student.studentId}</div>)}
                  </div>
                </div>
                {activeClass.notes && <div><Label className="text-muted-foreground">Observacoes</Label><p className="text-sm">{activeClass.notes}</p></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerTurmas;
