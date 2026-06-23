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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Pencil, Trash2, BookOpen, FileText, Headphones, Video, Link as LinkIcon,
  File, Download, Eye
} from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { SEO } from "@/components/common/SEO";
import { FileUploader, type UploadedFile } from "@/components/common/FileUploader";
import { cn } from "@/lib/utils";
import { getStudentDirectory } from "@/services/demoSchool";

const STORAGE_KEY = "lumina:materials";

// Interface para material no localStorage
interface MaterialFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  files: MaterialFile[];
  student_id: string;
  createdAt: string;
}

interface Student {
  id: string;
  full_name: string | null;
}

interface FormState {
  id?: string;
  title: string;
  description: string;
  type: string;
  url: string;
  files: UploadedFile[];
  student_id: string;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  type: "pdf",
  url: "",
  files: [],
  student_id: "",
};

// Seed data para demo
const seedMaterials: Material[] = [
  {
    id: "mat-1",
    title: "Apostila - English Foundations A1",
    description: "Material completo do módulo inicial com exercícios práticos.",
    type: "pdf",
    url: null,
    files: [
      { id: "f1", name: "apostila-english-foundations.pdf", size: 2500000, type: "application/pdf", dataUrl: "" }
    ],
    student_id: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mat-2",
    title: "Lista de Phrasal Verbs",
    description: "Phrasal verbs mais comuns com exemplos de uso.",
    type: "document",
    url: null,
    files: [
      { id: "f2", name: "phrasal-verbs.pdf", size: 800000, type: "application/pdf", dataUrl: "" },
      { id: "f3", name: "phrasal-verbs-exercises.docx", size: 150000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", dataUrl: "" }
    ],
    student_id: "",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "mat-3",
    title: "Podcast - Conversação em Inglês",
    description: "Episódio especial sobre small talk. Áudio MP3.",
    type: "audio",
    url: "https://example.com/podcast.mp3",
    files: [],
    student_id: "",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const iconFor = (t: string) => (t === "audio" ? Headphones : t === "video" ? Video : FileText);

const getFileIcon = (type: string) => {
  if (type.includes("audio")) return Headphones;
  if (type.includes("video")) return Video;
  return FileText;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const loadMaterials = (): Material[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedMaterials;
  } catch {
    return seedMaterials;
  }
};

const ManagerMaterials = () => {
  const [items, setItems] = useState<Material[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = async () => {
    setLoading(true);
    
    // Carregar materiais do localStorage
    setItems(loadMaterials());
    
    setStudents(getStudentDirectory());
    
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const persist = (next: Material[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (m: Material) => {
    setForm({
      id: m.id,
      title: m.title,
      description: m.description ?? "",
      type: m.type,
      url: m.url ?? "",
      files: m.files.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        dataUrl: f.dataUrl,
      })),
      student_id: m.student_id,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title) return toast.error("Preencha o título.");
    
    if (!form.url && form.files.length === 0) {
      return toast.error("Informe uma URL ou anexe pelo menos um arquivo.");
    }

    try {
      const newMaterial: Material = {
        id: form.id ?? `mat-${Date.now()}`,
        title: form.title,
        description: form.description || null,
        type: form.type,
        url: form.url || null,
        files: form.files.map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          dataUrl: f.dataUrl,
        })),
        student_id: form.student_id,
        createdAt: form.id ? items.find((m) => m.id === form.id)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
      };

      if (form.id) {
        const next = items.map((m) => (m.id === form.id ? newMaterial : m));
        persist(next);
        toast.success("Material atualizado");
      } else {
        persist([newMaterial, ...items]);
        toast.success("Material criado");
      }

      setOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar material");
    }
  };

  const remove = async (id: string) => {
    persist(items.filter((m) => m.id !== id));
    toast.success("Material removido");
  };

  const studentName = (id: string) => {
    if (!id) return "Todos os alunos";
    return students.find((s) => s.id === id)?.full_name ?? "—";
  };

  const handleViewFile = (file: MaterialFile) => {
    if (file.dataUrl) {
      if (file.type.includes("image") || file.type.includes("pdf")) {
        window.open(file.dataUrl, "_blank", "noopener,noreferrer");
        return;
      }
      const link = document.createElement("a");
      link.href = file.dataUrl;
      link.download = file.name;
      link.click();
    } else if (file.name) {
      toast.info(`Arquivo: ${file.name}`);
    }
  };

  const handleDownloadFile = (file: MaterialFile) => {
    if (file.dataUrl) {
      const link = document.createElement("a");
      link.href = file.dataUrl;
      link.download = file.name;
      link.click();
    } else {
      toast.info(`Arquivo: ${file.name}`);
    }
  };

  const totalFiles = items.reduce((acc, m) => acc + m.files.length, 0);

  return (
    <div className="space-y-6">
      <SEO title="Materiais — Gestor" />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Materiais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie recursos de estudo. {totalFiles > 0 && `${totalFiles} arquivo(s) anexado(s).`}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-gradient-accent hover:opacity-95">
              <Plus className="h-4 w-4 mr-2" /> Novo material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar material" : "Novo material"}</DialogTitle>
              <DialogDescription>Adicione recursos de estudo com URL ou arquivos anexados.</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="files" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <File className="h-4 w-4" /> Arquivos
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> URL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="files" className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label>Título *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Apostila English Foundations"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Breve descrição do material..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Tipo de Material</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Arquivos</Label>
                  <FileUploader
                    files={form.files}
                    onFilesChange={(files) => setForm({ ...form, files })}
                    maxFiles={10}
                    maxSizeMB={50}
                  />
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label>Título *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Video aula sobre phrasal verbs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Breve descrição do material..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>URL *</Label>
                  <Input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} className="bg-gradient-accent hover:opacity-95">
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState icon={BookOpen} title="Nenhum material cadastrado" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {items.map((m) => {
            const Icon = iconFor(m.type);
            return (
              <Card key={m.id}>
                <CardContent className="p-5 flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-primary">{m.title}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase">{m.type}</Badge>
                    </div>
                    {m.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>}
                    
                    {/* Exibir arquivos anexados */}
                    {m.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {m.files.map((file) => {
                          const FileIcon = getFileIcon(file.type);
                          return (
                            <div key={file.id} className="flex items-center gap-2 text-xs">
                              <FileIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground truncate flex-1">{file.name}</span>
                              <span className="text-muted-foreground">({formatSize(file.size)})</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleViewFile(file)}
                                  className="p-1 hover:bg-secondary/50 rounded"
                                  title="Visualizar"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(file)}
                                  className="p-1 hover:bg-secondary/50 rounded"
                                  title="Baixar"
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Exibir URL se houver */}
                    {m.url && (
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        <LinkIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{m.url}</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      Aluno: {studentName(m.student_id)}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                        <Pencil className="h-3 w-3 mr-1.5" /> Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3 mr-1.5" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover material?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(m.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManagerMaterials;
