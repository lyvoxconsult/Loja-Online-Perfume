import React, { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { AgendaEvent, AgendaViewMode } from "@/types/agenda";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  CalendarDays, 
  Clock, 
  Video, 
  Edit, 
  Trash2, 
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";

type AgendaCalendarProps = {
  events: AgendaEvent[];
  viewMode?: AgendaViewMode;
  readOnly?: boolean;
  onEdit?: (event: AgendaEvent) => void;
  onCancel?: (eventId: string) => void;
  onReschedule?: (event: AgendaEvent) => void;
  onCreate?: (event: Partial<AgendaEvent>) => void;
  courses?: { id: string; title: string }[]; // Add courses prop
};

// Status badge helper
const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    scheduled: { label: "Agendada", className: "bg-blue-100 text-blue-800 border-blue-200", icon: <Clock className="h-3 w-3 mr-1" /> },
    completed: { label: "Concluída", className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="h-3 w-3 mr-1" /> },
    rescheduled: { label: "Remarcada", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <RefreshCw className="h-3 w-3 mr-1" /> },
    pending: { label: "Pendente", className: "bg-gray-100 text-gray-800 border-gray-200", icon: <Clock className="h-3 w-3 mr-1" /> },
  };
  return statusConfig[status] || statusConfig.pending;
};

const isValidDate = (value: string | undefined | null) => {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
};

const dateInputValue = (value: string | undefined | null) =>
  isValidDate(value) ? new Date(value as string).toISOString().split("T")[0] : "";

const timeInputValue = (value: string | undefined | null, fallback = "10:00") =>
  isValidDate(value) ? new Date(value as string).toTimeString().slice(0, 5) : fallback;

const mergeDateTime = (dateValue: string, timeValue = "10:00") => {
  if (!dateValue) return "";
  const next = new Date(`${dateValue}T${timeValue || "10:00"}:00`);
  return Number.isNaN(next.getTime()) ? "" : next.toISOString();
};

// Format helper
const formatDateTime = (iso: string) => {
  const date = isValidDate(iso) ? new Date(iso) : new Date();
  return {
    date: date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    full: date.toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  };
};

const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const AgendaCalendarPanel: React.FC<AgendaCalendarProps> = ({ 
  events, 
  viewMode = "month",
  readOnly = false,
  onEdit,
  onCancel,
  onReschedule,
  onCreate,
  courses = [], // Default empty array
}) => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [active, setActive] = useState<AgendaEvent | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AgendaEvent>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<AgendaEvent>>({});
  
  // Group events by date
  const byDate = useMemo(() => {
    const map: Record<string, AgendaEvent[]> = {};
    events.forEach((e) => {
      const d = isValidDate(e.scheduledAt) ? new Date(e.scheduledAt) : new Date();
      const key = d.toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    // Sort by time within the day
    Object.values(map).forEach((arr) => arr.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
    return map;
  }, [events]);

  // Get events for selected date
  const visibleForSelected = selected ? byDate[new Date(selected).toDateString()] ?? [] : [];
  
  // Check for conflicts (same time slot)
  const checkConflicts = (event: AgendaEvent): AgendaEvent[] => {
    const eventTime = new Date(event.scheduledAt).getTime();
    const duration = event.durationMinutes * 60 * 1000;
    return events.filter(e => {
      if (e.id === event.id) return false;
      const eStart = new Date(e.scheduledAt).getTime();
      const eEnd = eStart + (e.durationMinutes * 60 * 1000);
      return (eventTime >= eStart && eventTime < eEnd) || (eventTime < eEnd && eventTime + duration > eStart);
    });
  };

  // Handlers
  const handleEdit = () => {
    if (active) {
      setEditMode(true);
      setEditForm({
        title: active.title,
        scheduledAt: active.scheduledAt,
        durationMinutes: active.durationMinutes,
        lessonPrice: active.lessonPrice ?? null,
        status: active.status,
        notes: active.notes,
        zoomUrl: active.zoomUrl,
      });
    }
  };

  const handleSaveEdit = () => {
    if (active && onEdit) {
      onEdit({ ...active, ...editForm } as AgendaEvent);
      setEditMode(false);
      setActive(null);
    }
  };

  const handleCancel = () => {
    if (active && onCancel) {
      onCancel(active.id);
      setActive(null);
    }
  };

  const handleReschedule = () => {
    if (active && onReschedule) {
      onReschedule(active);
    }
  };

  const handleCreate = () => {
    if (onCreate && newEvent.title && newEvent.scheduledAt) {
      onCreate(newEvent);
      setShowCreateDialog(false);
      setNewEvent({});
    }
  };

  // Calendar highlight dates with events
  const calendarModifiers = useMemo(() => {
    return {
      equipped: Object.keys(byDate).map((dateKey) => new Date(dateKey)),
    };
  }, [byDate]);

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="border rounded-lg p-4 bg-card">
        <Calendar
          mode="single"
          showOutsideDays={true}
          selected={selected}
          onDayClick={(day) => setSelected(day)}
          modifiers={calendarModifiers}
          modifiersStyles={{
            equipped: { fontWeight: "bold", backgroundColor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))", borderRadius: "4px" }
          }}
        />
      </div>

      {/* Create Button (only for non-readonly) */}
      {!readOnly && onCreate && (
        <Button onClick={() => setShowCreateDialog(true)} className="w-full">
          <CalendarDays className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      )}

      {/* Events List */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
          {selected ? formatDateTime(selected.toISOString()).date : "Selecione uma data"}
        </h3>
        
        {visibleForSelected.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <span className="text-muted-foreground">Nenhuma aula nesta data.</span>
              {!readOnly && onCreate && (
                <Button variant="link" size="sm" onClick={() => setShowCreateDialog(true)} className="mt-2">
                  Criar nova aula
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {visibleForSelected.map((ev) => {
              const statusInfo = getStatusBadge(ev.status);
              const conflicts = checkConflicts(ev);
              return (
                <Card key={ev.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActive(ev)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                          ev.status === "completed" ? "bg-green-100 text-green-700" :
                          ev.status === "cancelled" ? "bg-red-100 text-red-700" :
                          ev.status === "rescheduled" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          <CalendarDays className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-primary truncate">{ev.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(ev.scheduledAt).time}
                            </span>
                            <span>•</span>
                            <span>{ev.durationMinutes} min</span>
                            {ev.teacher && (
                              <>
                                <span>•</span>
                                <span>{ev.teacher}</span>
                              </>
                            )}
                          </div>
                          {ev.studentName && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Aluno: {ev.studentName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={statusInfo.className}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </Badge>
                        {conflicts.length > 0 && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Conflito
                          </Badge>
                        )}
                        {ev.zoomUrl && (
                          <a 
                            href={ev.zoomUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Video className="h-3 w-3" />
                            Entrar
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <Dialog open={!!active && !editMode} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{active.title}</DialogTitle>
                <DialogDescription>
                  {active.studentName ? `Aluno: ${active.studentName}` : `ID: ${active.studentId}`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Data</Label>
                    <div className="font-medium">{formatDateTime(active.scheduledAt).date}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Horário</Label>
                    <div className="font-medium">{formatDateTime(active.scheduledAt).time}</div>
                  </div>
                </div>

                {/* Duration & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Duração</Label>
                    <div className="font-medium">{active.durationMinutes} minutos</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant="outline" className={getStatusBadge(active.status).className}>
                      {getStatusBadge(active.status).icon}
                      {getStatusBadge(active.status).label}
                    </Badge>
                  </div>
                </div>

                {/* Teacher */}
                {active.teacher && (
                  <div>
                    <Label className="text-muted-foreground">Professor/Responsável</Label>
                    <div className="font-medium">{active.teacher}</div>
                  </div>
                )}

                {!readOnly && active.lessonPrice != null && (
                  <div>
                    <Label className="text-muted-foreground">Valor da Aula</Label>
                    <div className="font-medium">{formatCurrencyBRL(active.lessonPrice)}</div>
                  </div>
                )}

                {/* Zoom Link */}
                {active.zoomUrl && (
                  <div>
                    <Label className="text-muted-foreground">Link da Aula</Label>
                    <a 
                      href={active.zoomUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Video className="h-4 w-4" />
                      Acessar sala virtual
                    </a>
                  </div>
                )}

                {/* Notes */}
                {active.notes && (
                  <div>
                    <Label className="text-muted-foreground">Observações</Label>
                    <div className="text-sm p-3 bg-muted/30 rounded-md">{active.notes}</div>
                  </div>
                )}

                {/* Conflict Warning */}
                {checkConflicts(active).length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                    <div className="text-sm text-orange-800">
                      <strong>Conflito detectado:</strong> existem {checkConflicts(active).length} aula(s) no mesmo horário.
                    </div>
                  </div>
                )}

                {/* History (placeholder) */}
                {active.createdAt && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Criado em: {formatDateTime(active.createdAt).full}
                    {active.updatedAt && ` • Atualizado em: ${formatDateTime(active.updatedAt).full}`}
                  </div>
                )}
              </div>

              {/* Action Buttons (only for non-readonly) */}
              {!readOnly && (
                <DialogFooter className="flex-wrap gap-2 mt-4">
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" onClick={handleReschedule}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Remarcar
                  </Button>
                  {active.status !== "cancelled" && (
                    <Button variant="destructive" onClick={handleCancel}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancelar Aula
                    </Button>
                  )}
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editMode} onOpenChange={(o) => !o && setEditMode(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Aula</DialogTitle>
            <DialogDescription>Altere os dados da aula e clique emSalvar.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Título da Aula</Label>
              <Input 
                value={editForm.title || ""} 
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input 
                  type="date" 
                  value={dateInputValue(editForm.scheduledAt)}
                  onChange={(e) => {
                    setEditForm({...editForm, scheduledAt: mergeDateTime(e.target.value, timeInputValue(editForm.scheduledAt))});
                  }}
                />
              </div>
              <div>
                <Label>Horário</Label>
                <Input 
                  type="time" 
                  value={timeInputValue(editForm.scheduledAt)}
                  onChange={(e) => {
                    const date = dateInputValue(editForm.scheduledAt) || new Date().toISOString().split("T")[0];
                    setEditForm({...editForm, scheduledAt: mergeDateTime(date, e.target.value)});
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duração (minutos)</Label>
                <Input 
                  type="number" 
                  value={editForm.durationMinutes || 60}
                  onChange={(e) => setEditForm({...editForm, durationMinutes: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={editForm.status || "scheduled"}
                  onValueChange={(v) => setEditForm({...editForm, status: v as AgendaEvent["status"]})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="rescheduled">Remarcada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Valor da Aula</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editForm.lessonPrice ?? ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    lessonPrice: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                placeholder="Ex: 120.00"
              />
            </div>

            <div>
              <Label>Link da sala virtual</Label>
              <Input 
                value={editForm.zoomUrl || ""}
                onChange={(e) => setEditForm({...editForm, zoomUrl: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea 
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Observações sobre a aula..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMode(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Event Modal */}
      <Dialog open={showCreateDialog} onOpenChange={(o) => !o && setShowCreateDialog(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
            <DialogDescription>Preencha os dados para agendar uma nova aula.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Curso</Label>
              <Select 
                value={newEvent.courseId || ""}
                onValueChange={(v) => setNewEvent({...newEvent, courseId: v, title: courses.find(c => c.id === v)?.title || newEvent.title})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Título da Aula *</Label>
              <Input 
                value={newEvent.title || ""}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Ex: Aula de Inglês Básico"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data *</Label>
                <Input 
                  type="date"
                  value={dateInputValue(newEvent.scheduledAt)}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setNewEvent({...newEvent, scheduledAt: ""});
                      return;
                    }
                    setNewEvent({...newEvent, scheduledAt: mergeDateTime(e.target.value, timeInputValue(newEvent.scheduledAt))});
                  }}
                />
              </div>
              <div>
                <Label>Horário *</Label>
                <Input 
                  type="time"
                  value={timeInputValue(newEvent.scheduledAt)}
                  onChange={(e) => {
                    const baseDate = dateInputValue(newEvent.scheduledAt) || new Date().toISOString().split("T")[0];
                    setNewEvent({...newEvent, scheduledAt: mergeDateTime(baseDate, e.target.value)});
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duração (minutos)</Label>
                <Input 
                  type="number"
                  value={newEvent.durationMinutes || 60}
                  onChange={(e) => setNewEvent({...newEvent, durationMinutes: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Professor</Label>
                <Input 
                  value={newEvent.teacher || ""}
                  onChange={(e) => setNewEvent({...newEvent, teacher: e.target.value})}
                  placeholder="Nome do professor"
                />
              </div>
            </div>

            <div>
              <Label>Valor da Aula</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newEvent.lessonPrice ?? ""}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    lessonPrice: e.target.value === "" ? null : parseFloat(e.target.value),
                  })
                }
                placeholder="Ex: 120.00"
              />
            </div>

            <div>
              <Label>Link da sala virtual</Label>
              <Input 
                value={newEvent.zoomUrl || ""}
                onChange={(e) => setNewEvent({...newEvent, zoomUrl: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea 
                value={newEvent.notes || ""}
                onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                placeholder="Observações..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button 
              onClick={handleCreate}
              disabled={!newEvent.title || !newEvent.scheduledAt}
            >
              Criar Aula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
