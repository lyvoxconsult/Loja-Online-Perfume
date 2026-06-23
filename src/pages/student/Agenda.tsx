import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AgendaEvent } from "@/types/agenda";
import { fetchAgendaForStudent } from "@/services/agenda";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/common/SEO";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { AgendaCalendarPanel } from "@/components/agenda/AgendaCalendar";
import { Calendar as CalendarIcon, Filter, Clock, Video } from "lucide-react";

const StudentAgenda = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    fetchAgendaForStudent(user.id).then((lessons) => {
      setEvents(lessons);
      setLoading(false);
    });
  }, [user]);

  const filtered = useMemo(() => {
    let result = events;
    const q = query.toLowerCase();
    if (q) {
      result = result.filter((event) => event.title.toLowerCase().includes(q) || event.teacher?.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") {
      result = result.filter((event) => event.status === filterStatus);
    }
    const now = new Date();
    if (filterPeriod === "today") {
      result = result.filter((event) => new Date(event.scheduledAt).toDateString() === now.toDateString());
    } else if (filterPeriod === "future") {
      result = result.filter((event) => new Date(event.scheduledAt) >= now);
    } else if (filterPeriod === "past") {
      result = result.filter((event) => new Date(event.scheduledAt) < now);
    }
    return result;
  }, [events, query, filterStatus, filterPeriod]);

  if (loading) return <LoadingState />;

  const futureEvents = filtered.filter((event) => new Date(event.scheduledAt) >= new Date());
  const stats = {
    total: events.length,
    scheduled: events.filter((event) => event.status === "scheduled").length,
    completed: events.filter((event) => event.status === "completed").length,
    today: events.filter((event) => new Date(event.scheduledAt).toDateString() === new Date().toDateString()).length,
  };

  return (
    <div className="space-y-6">
      <SEO title="Agenda" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Minha Agenda</h1>
          <p className="text-muted-foreground">Suas aulas agendadas</p>
        </div>
        <div className="flex items-center gap-2">
          {stats.today > 0 && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{stats.today} aula(s) hoje</Badge>}
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{stats.completed} concluidas</Badge>
        </div>
      </div>

      {stats.today > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Aulas de hoje</span>
            </div>
            <div className="space-y-2">
              {events.filter((event) => new Date(event.scheduledAt).toDateString() === new Date().toDateString()).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {event.durationMinutes} min
                    </div>
                  </div>
                  {event.zoomUrl && (
                    <a href={event.zoomUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                      <Video className="h-4 w-4" />
                      Entrar
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total de Aulas</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div><div className="text-xs text-muted-foreground">Agendadas</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{stats.completed}</div><div className="text-xs text-muted-foreground">Concluidas</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{futureEvents.length}</div><div className="text-xs text-muted-foreground">Proximas</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Buscar aula..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluida</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger><SelectValue placeholder="Periodo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="future">Futuras</SelectItem>
                <SelectItem value="past">Passadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <AgendaCalendarPanel events={filtered} readOnly />
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <EmptyState icon={CalendarIcon} title="Nenhuma aula encontrada" description={query || filterStatus !== "all" || filterPeriod !== "all" ? "Tente ajustar os filtros" : "Voce nao tem aulas agendadas ainda"} />
      )}
    </div>
  );
};

export default StudentAgenda;
