import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, GraduationCap, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { SEO } from "@/components/common/SEO";
import {
  loadCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type Course,
  type Level,
  type Format,
} from "@/services/courses";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const FORMATS: Format[] = ["online", "presencial", "hibrido"];
const CATEGORIES = ["kids", "teens", "adults", "business", "exam"] as const;

interface FormState {
  id?: string;
  slug: string;
  title: string;
  level: Level;
  format: Format;
  duration: string;
  price: number;
  shortDescription: string;
  description: string;
  topics: string;
  category: typeof CATEGORIES[number];
  highlight: boolean;
}

const emptyForm: FormState = {
  slug: "",
  title: "",
  level: "A1",
  format: "online",
  duration: "",
  price: 0,
  shortDescription: "",
  description: "",
  topics: "",
  category: "adults",
  highlight: false,
};

const ManagerCourses = () => {
  const [items, setItems] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    setItems(loadCourses());
  }, []);

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Course) => {
    setForm({
      id: c.id,
      slug: c.slug,
      title: c.title,
      level: c.level,
      format: c.format,
      duration: c.duration,
      price: c.price,
      shortDescription: c.shortDescription,
      description: c.description,
      topics: c.topics.join(", "),
      category: c.category,
      highlight: c.highlight ?? false,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.title || !form.shortDescription || !form.description) {
      toast.error("Preencha título, descrição resumida e descrição completa.");
      return;
    }

    if (!form.price || form.price <= 0) {
      toast.error("Informe um valor válido para o curso.");
      return;
    }

    const slug = form.slug || slugify(form.title);
    const topics = form.topics.split(",").map((t) => t.trim()).filter(Boolean);

    if (form.id) {
      updateCourse(form.id, {
        slug,
        title: form.title,
        level: form.level,
        format: form.format,
        duration: form.duration,
        price: form.price,
        shortDescription: form.shortDescription,
        description: form.description,
        topics,
        category: form.category,
        highlight: form.highlight,
      });
      toast.success("Curso atualizado");
    } else {
      createCourse({
        slug,
        title: form.title,
        level: form.level,
        format: form.format,
        duration: form.duration,
        price: form.price,
        shortDescription: form.shortDescription,
        description: form.description,
        topics,
        category: form.category,
        highlight: form.highlight,
      });
      toast.success("Curso criado");
    }

    setItems(loadCourses());
    setOpen(false);
  };

  const remove = (id: string) => {
    deleteCourse(id);
    setItems(loadCourses());
    toast.success("Curso removido");
  };

  return (
    <div className="space-y-6">
      <SEO title="Gestão de Cursos" />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Gestão de Cursos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os cursos disponíveis na plataforma.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-gradient-accent hover:opacity-95">
              <Plus className="h-4 w-4 mr-2" /> Novo curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar curso" : "Novo curso"}</DialogTitle>
              <DialogDescription>Preencha os campos para criar ou atualizar o curso.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: English Foundations" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado se vazio" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as typeof form.category })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kids">Kids (7-11 anos)</SelectItem>
                      <SelectItem value="teens">Teens (12-17 anos)</SelectItem>
                      <SelectItem value="adults">Adultos</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="exam">Exames internacionais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Nível</Label>
                  <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as Level })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Formato</Label>
                  <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v as Format })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Duração</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Ex: 6 meses" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Preço (R$) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="Ex: 297"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Descrição resumida *</Label>
                <Textarea rows={2} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="Breve descrição para cards e listagens" />
              </div>

              <div className="space-y-1.5">
                <Label>Descrição completa *</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição detalhada do curso" />
              </div>

              <div className="space-y-1.5">
                <Label>Tópicos (separados por vírgula)</Label>
                <Textarea rows={3} value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} placeholder="Ex: Vocabulário cotidiano, Pronúncia básica, Conversação guiada" />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={form.highlight}
                  onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
                  className="w-4 h-4 rounded border-input"
                />
                <Label htmlFor="highlight" className="cursor-pointer">Marcar como curso em destaque</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} className="bg-gradient-accent hover:opacity-95">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState icon={GraduationCap} title="Sem cursos" description="Nenhum curso cadastrado ainda." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Card key={c.id} className={c.highlight ? "border-accent/50" : ""}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={c.highlight ? "default" : "secondary"} className="text-xs">
                      {c.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {c.format}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {c.category}
                    </Badge>
                  </div>
                  {c.highlight && (
                    <BookOpen className="h-4 w-4 text-accent shrink-0" />
                  )}
                </div>

                <h3 className="font-semibold text-primary mb-1 line-clamp-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{c.shortDescription}</p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t">
                  <div>
                    <span className="text-lg font-bold text-accent">R$ {c.price}</span>
                    {c.duration && <span className="text-xs text-muted-foreground ml-1">/ {c.duration}</span>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" aria-label={`Editar ${c.title}`} onClick={() => openEdit(c)} className="h-8 px-2">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label={`Excluir ${c.title}`} className="h-8 px-2 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover curso?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O curso "{c.title}" será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(c.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerCourses;
