import { useEffect, useMemo, useState } from "react";
import { AgendaCalendarPanel } from "@/components/agenda/AgendaCalendar";
import { AgendaEvent, AgendaViewMode } from "@/types/agenda";
import { fetchAgendaForAll, createAgendaEvent, updateAgendaEvent, cancelAgendaEvent } from "@/services/agenda";
import { loadCourses, type Course } from "@/services/courses";
import { getStudentOptions } from "@/services/demoSchool";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/common/SEO";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Calendar as CalendarIcon, Filter, Users, Check } from "lucide-react";

interface StudentOption {
  id: string;
  fullName: string;
}

const ManagerAgenda = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode] = useState<AgendaViewMode>("month");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filterStudent, setFilterStudent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const { toast } = useToast();

  const reload = async () => {
    setLoading(true);
    setStudents(getStudentOptions());
    setCourses(loadCourses());
    setEvents(await fetchAgendaForAll());
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    let result = events;
    const q = query.toLowerCase();
    if (q) result = result.filter((event) => event.studentName?.toLowerCase().includes(q) || event.title.toLowerCase().includes(q) || event.teacher?.toLowerCase().includes(q));
    if (filterStudent !== "all") result = result.filter((event) => event.studentId === filterStudent);
    if (filterStatus !== "all") result = result.filter((event) => event.status === filterStatus);
    if (filterCourse !== "all") result = result.filter((event) => event.title === filterCourse);
    if (filterTeacher !== "all") result = result.filter((event) => event.teacher === filterTeacher);
    const now = new Date();
    if (filterPeriod === "today") result = result.filter((event) => new Date(event.scheduledAt).toDateString() === now.toDateString());
    else if (filterPeriod === "future") result = result.filter((event) => new Date(event.scheduledAt) >= now);
    else if (filterPeriod === "past") result = result.filter((event) => new Date(event.scheduledAt) < now);
    return result;
  }, [events, query, filterStudent, filterStatus, filterCourse, filterTeacher, filterPeriod]);

  const uniqueCourses = useMemo(() => [...new Set(events.map((event) => event.title))], [events]);
  const uniqueTeachers = useMemo(() => [...new Set(events.map((event) => event.teacher).filter(Boolean))], [events]);

  const handleEdit = async (event: AgendaEvent) => {
    const { id, ...updates } = event;
    const success = await updateAgendaEvent(id, updates);
    if (!success) return toast({ title: "Erro ao atualizar aula", variant: "destructive" });
    toast({ title: "Aula atualizada com sucesso" });
    setEvents(await fetchAgendaForAll());
    setRefreshKey((value) => value + 1);
  };

  const handleCancel = async (eventId: string) => {
    const success = await cancelAgendaEvent(eventId);
    if (!success) return toast({ title: "Erro ao cancelar aula", variant: "destructive" });
    toast({ title: "Aula cancelada com sucesso" });
    setEvents(await fetchAgendaForAll());
    setRefreshKey((value) => value + 1);
  };

  const handleReschedule = async (event: AgendaEvent) => {
    const nextDate = new Date(event.scheduledAt);
    nextDate.setDate(nextDate.getDate() + 7);
    await handleEdit({ ...event, scheduledAt: nextDate.toISOString(), status: "rescheduled" });
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) => prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]);
  };

  const handleCreate = async (newEvent: Partial<AgendaEvent>) => {
    const studentIds = selectedStudents.length > 0 ? selectedStudents : students.length > 0 ? [students[0].id] : [];
    let createdCount = 0;
    for (const studentId of studentIds) {
      const created = await createAgendaEvent({
        studentId,
        title: newEvent.title ?? "Aula de ingles",
        scheduledAt: newEvent.scheduledAt ?? new Date().toISOString(),
        durationMinutes: newEvent.durationMinutes ?? 60,
        lessonPrice: newEvent.lessonPrice ?? null,
        status: "scheduled",
        teacher: newEvent.teacher ?? null,
        zoomUrl: newEvent.zoomUrl ?? null,
        notes: newEvent.notes ?? null,
        courseId: newEvent.courseId ?? null,
      });
      if (created) createdCount += 1;
    }
    if (!createdCount) return toast({ title: "Erro ao criar aula", variant: "destructive" });
    toast({ title: `${createdCount} aula(s) criada(s) com sucesso` });
    setEvents(await fetchAgendaForAll());
    setSelectedStudents([]);
    setRefreshKey((value) => value + 1);
  };

  if (loading) return <LoadingState />;

  const stats = {
    total: events.length,
    scheduled: events.filter((event) => event.status === "scheduled").length,
    completed: events.filter((event) => event.status === "completed").length,
    cancelled: events.filter((event) => event.status === "cancelled").length,
    today: events.filter((event) => new Date(event.scheduledAt).toDateString() === new Date().toDateString()).length,
  };

  return (
    <div className="space-y-6">
      <SEO title="Agenda - Gestor" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gerencie todas as aulas agendadas</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{stats.scheduled} Agendadas</Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{stats.completed} Concluidas</Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{stats.cancelled} Canceladas</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total de Aulas</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div><div className="text-xs text-muted-foreground">Agendadas</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{stats.today}</div><div className="text-xs text-muted-foreground">Hoje</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-orange-600">{stats.cancelled}</div><div className="text-xs text-muted-foreground">Canceladas</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4"><Filter className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Filtros</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="col-span-2"><Input placeholder="Buscar por aluno ou aula..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-9" /></div>
            <Select value={filterStudent} onValueChange={setFilterStudent}><SelectTrigger className="h-9"><SelectValue placeholder="Aluno" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os alunos</SelectItem>{students.map((student) => <SelectItem key={student.id} value={student.id}>{student.fullName}</SelectItem>)}</SelectContent></Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="scheduled">Agendada</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="completed">Concluida</SelectItem><SelectItem value="cancelled">Cancelada</SelectItem><SelectItem value="rescheduled">Remarcada</SelectItem></SelectContent></Select>
            <Select value={filterCourse} onValueChange={setFilterCourse}><SelectTrigger className="h-9"><SelectValue placeholder="Curso" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{uniqueCourses.map((course) => <SelectItem key={course} value={course}>{course}</SelectItem>)}</SelectContent></Select>
            <Select value={filterTeacher} onValueChange={setFilterTeacher}><SelectTrigger className="h-9"><SelectValue placeholder="Professor" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{uniqueTeachers.map((teacher) => <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}><SelectTrigger className="h-9"><SelectValue placeholder="Periodo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os periodos</SelectItem><SelectItem value="today">Hoje</SelectItem><SelectItem value="future">Futuras</SelectItem><SelectItem value="past">Passadas</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Selecione os alunos para a aula</span>
              {selectedStudents.length > 0 && <Badge variant="outline" className="bg-blue-100 text-blue-800">{selectedStudents.length} selecionado(s)</Badge>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {students.map((student) => (
                <div key={student.id} className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer ${selectedStudents.includes(student.id) ? "bg-blue-100 border-blue-300" : "bg-background hover:bg-muted"}`} onClick={() => toggleStudent(student.id)}>
                  <Checkbox checked={selectedStudents.includes(student.id)} onCheckedChange={() => toggleStudent(student.id)} />
                  <Label className="text-sm cursor-pointer truncate">{student.fullName}</Label>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3 w-3" /><span>Selecione um ou mais alunos para criar a aula</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <AgendaCalendarPanel key={refreshKey} events={filtered} viewMode={viewMode} readOnly={false} onEdit={handleEdit} onCancel={handleCancel} onReschedule={handleReschedule} onCreate={handleCreate} courses={courses.map((course) => ({ id: course.id, title: course.title }))} />
        </CardContent>
      </Card>

      {filtered.length === 0 && <EmptyState icon={CalendarIcon} title="Nenhuma aula encontrada" description={query || filterStudent !== "all" || filterStatus !== "all" ? "Tente ajustar os filtros" : "Nao ha aulas agendadas ainda"} />}
    </div>
  );
};

export default ManagerAgenda;
