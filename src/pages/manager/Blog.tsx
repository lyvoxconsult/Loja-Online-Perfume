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
import { Plus, Pencil, Trash2, Newspaper, Star, Archive, Send, Search } from "lucide-react";
import { toast } from "sonner";
import type { Post } from "@/mocks/posts";
import { loadPosts, savePosts } from "@/services/posts";
import { EmptyState } from "@/components/common/EmptyState";
import { SEO } from "@/components/common/SEO";

interface FormState { id?: string; slug: string; title: string; excerpt: string; content: string; category: string; author: string; tags: string; status: Post["status"]; featured: boolean; }
const emptyForm: FormState = { slug: "", title: "", excerpt: "", content: "", category: "Aprendizado", author: "Equipe Lumina", tags: "", status: "draft", featured: false };

const ManagerBlog = () => {
  const [items, setItems] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState("");

  useEffect(() => { setItems(loadPosts()); }, []);

  const persist = (next: Post[]) => {
    setItems(next);
    savePosts(next);
  };

  const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openNew = () => { setForm(emptyForm); setOpen(true); };
  const openEdit = (p: Post) => {
    setForm({ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content, category: p.category, author: p.author, tags: p.tags.join(", "), status: p.status, featured: p.featured });
    setOpen(true);
  };

  const save = () => {
    if (!form.title || !form.excerpt || !form.content) return toast.error("Preencha título, resumo e conteúdo.");
    const slug = form.slug || slugify(form.title);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const authorInitials = form.author.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

    if (form.id) {
      const next = items.map((p) => p.id === form.id ? { ...p, slug, title: form.title, excerpt: form.excerpt, content: form.content, category: form.category, author: form.author, authorInitials, tags, status: form.status, featured: form.featured } : p);
      persist(next);
      toast.success("Post atualizado");
    } else {
      const newPost: Post = {
        id: `p-${Date.now()}`,
        slug, title: form.title, excerpt: form.excerpt, content: form.content,
        category: form.category, author: form.author, authorInitials,
        publishedAt: new Date().toISOString().slice(0, 10),
        readingTime: Math.max(2, Math.round(form.content.split(" ").length / 200)),
        tags,
        status: form.status,
        featured: form.featured,
      };
      persist([newPost, ...items]);
      toast.success(form.status === "published" ? "Post publicado" : "Rascunho salvo");
    }
    setOpen(false);
  };

  const remove = (id: string) => {
    persist(items.filter((p) => p.id !== id));
    toast.success("Post removido");
  };

  const updatePost = (id: string, updates: Partial<Post>, message: string) => {
    persist(items.map((post) => (post.id === id ? { ...post, ...updates } : post)));
    toast.success(message);
  };

  const visibleItems = items.filter((post) => {
    const value = query.trim().toLowerCase();
    return !value || post.title.toLowerCase().includes(value) || post.category.toLowerCase().includes(value);
  });

  return (
    <div className="space-y-6">
      <SEO title="Blog Manager" />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Blog Manager</h1>
          <p className="text-muted-foreground mt-1">Crie, revise, publique e destaque artigos da demonstração.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Novo post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar post" : "Novo post"}</DialogTitle>
              <DialogDescription>Preencha os campos para publicar.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado se vazio" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Autor</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Resumo *</Label>
                <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Conteúdo (Markdown) *</Label>
                <Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Tags (separadas por vírgula)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Post["status"] })}>
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 pt-7 text-sm font-medium">
                  <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
                  Exibir como destaque
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por título ou categoria..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      {visibleItems.length === 0 ? (
        <Card><CardContent className="p-8"><EmptyState icon={Newspaper} title="Sem posts" /></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-primary">{p.title}</h3>
                    <Badge variant="outline" className="text-xs">{p.category}</Badge>
                    <Badge variant={p.status === "published" ? "default" : "secondary"} className="text-xs">
                      {p.status === "published" ? "Publicado" : p.status === "draft" ? "Rascunho" : "Arquivado"}
                    </Badge>
                    {p.featured && <Badge className="bg-warning text-warning-foreground"><Star className="h-3 w-3 mr-1" /> Destaque</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.author} • {p.publishedAt} • {p.readingTime} min</p>
                </div>
                <div className="flex gap-2">
                  {p.status !== "published" && (
                    <Button variant="outline" size="sm" onClick={() => updatePost(p.id, { status: "published", publishedAt: new Date().toISOString().slice(0, 10) }, "Post publicado")}>
                      <Send className="h-3.5 w-3.5 mr-1.5" /> Publicar
                    </Button>
                  )}
                  {p.status === "published" && (
                    <Button variant="outline" size="sm" onClick={() => updatePost(p.id, { status: "archived" }, "Post arquivado")}>
                      <Archive className="h-3.5 w-3.5 mr-1.5" /> Arquivar
                    </Button>
                  )}
                  <Button variant="outline" size="icon" aria-label={p.featured ? "Remover destaque" : "Destacar post"} onClick={() => updatePost(p.id, { featured: !p.featured }, p.featured ? "Destaque removido" : "Post destacado")}>
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover post?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(p.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerBlog;
