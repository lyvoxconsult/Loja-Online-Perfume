import { useState } from "react";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/common/SEO";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadDemoTeachers, saveDemoTeachers, type DemoTeacher } from "@/services/demoTeachers";

const emptyTeacher: DemoTeacher = {
  id: "",
  name: "",
  email: "",
  role: "Professor",
  country: "Brasil",
  bio: "",
  specialties: [],
  initials: "",
  yearsExperience: 3,
  status: "ativo",
  classes: 0,
};

const ManagerTeachers = () => {
  const [items, setItems] = useState(loadDemoTeachers);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DemoTeacher | null>(null);

  const persist = (next: DemoTeacher[]) => {
    setItems(next);
    saveDemoTeachers(next);
  };

  const save = () => {
    if (!editing?.name.trim() || !editing.email.includes("@")) return toast.error("Informe nome e e-mail válidos.");
    const initials = editing.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    if (editing.id) persist(items.map((item) => item.id === editing.id ? { ...editing, initials } : item));
    else persist([{ ...editing, id: crypto.randomUUID(), initials }, ...items]);
    setEditing(null);
    toast.success("Professor salvo.");
  };

  const visible = items.filter((item) => `${item.name} ${item.email} ${item.specialties.join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <SEO title="Professores - Gestor" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl md:text-3xl font-bold text-primary">Professores</h1><p className="mt-1 text-muted-foreground">Equipe acadêmica, especialidades e disponibilidade.</p></div>
        <Button onClick={() => setEditing({ ...emptyTeacher })}><Plus className="mr-2 h-4 w-4" /> Novo professor</Button>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar professor..." /></div>
      {visible.length === 0 ? <Card><CardContent><EmptyState icon={Users} title="Nenhum professor encontrado" /></CardContent></Card> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((teacher) => (
            <Card key={teacher.id}><CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">{teacher.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-primary">{teacher.name}</h2><Badge variant={teacher.status === "ativo" ? "default" : "secondary"}>{teacher.status}</Badge></div>
                  <p className="text-sm text-muted-foreground">{teacher.role} · {teacher.country}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{teacher.classes} turmas · {teacher.yearsExperience} anos de experiência</p>
                  <div className="mt-3 flex flex-wrap gap-1">{teacher.specialties.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label="Editar professor" onClick={() => setEditing({ ...teacher })}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Excluir professor" onClick={() => { persist(items.filter((item) => item.id !== teacher.id)); toast.success("Professor removido."); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Editar professor" : "Novo professor"}</DialogTitle></DialogHeader>
          {editing && <div className="grid gap-4">
            <div><Label>Nome</Label><Input className="mt-1.5" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></div>
            <div><Label>E-mail</Label><Input className="mt-1.5" type="email" value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Cargo</Label><Input className="mt-1.5" value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value })} /></div><div><Label>País</Label><Input className="mt-1.5" value={editing.country} onChange={(event) => setEditing({ ...editing, country: event.target.value })} /></div></div>
            <div><Label>Especialidades</Label><Input className="mt-1.5" value={editing.specialties.join(", ")} onChange={(event) => setEditing({ ...editing, specialties: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></div>
            <div><Label>Status</Label><select className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as DemoTeacher["status"] })}><option value="ativo">Ativo</option><option value="ferias">Férias</option><option value="inativo">Inativo</option></select></div>
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={save}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerTeachers;
