import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Send, Pencil, Trash2, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/common/SEO";
import { EmptyState } from "@/components/common/EmptyState";
import { loadCommunications, deleteCommunication, createCommunication, updateCommunication, type Communication } from "@/services/communications";
import { getStudentDirectory } from "@/services/demoSchool";

interface FormState {
  id?: string;
  title: string;
  body: string;
  recipient: string;
}

const emptyForm: FormState = { title: "", body: "", recipient: "all" };

const ManagerCommunications = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [students] = useState(getStudentDirectory());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCommunications(loadCommunications());
  }, []);

  const getRecipientName = (recipientId: string | null) => {
    if (!recipientId) return "Todos os alunos";
    return students.find((student) => student.id === recipientId)?.full_name ?? `Aluno ${recipientId.slice(0, 8)}`;
  };

  const save = async () => {
    if (!form.title || !form.body) {
      toast.error("Preencha titulo e mensagem.");
      return;
    }
    setSending(true);
    const recipientId = form.recipient === "all" ? null : form.recipient;
    const recipientName = getRecipientName(recipientId);
    if (form.id) updateCommunication(form.id, form.title, form.body, recipientId, recipientName);
    else createCommunication(form.title, form.body, recipientId, recipientName);
    setCommunications(loadCommunications());
    setSending(false);
    setOpen(false);
    toast.success(form.id ? "Comunicado atualizado" : "Comunicado criado");
  };

  const remove = (id: string) => {
    deleteCommunication(id);
    setCommunications(loadCommunications());
    toast.success("Comunicado removido");
  };

  const formatDate = (date: string) => new Date(date).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <SEO title="Comunicacoes" />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Comunicacoes</h1>
          <p className="text-muted-foreground mt-1">Gerencie avisos e comunicacoes para os alunos.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => setForm(emptyForm)} className="bg-gradient-accent hover:opacity-95"><Send className="h-4 w-4 mr-2" /> Nova mensagem</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar comunicacao" : "Nova comunicacao"}</DialogTitle>
              <DialogDescription>Envie avisos para todos os alunos ou um aluno especifico.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Destinatario</Label>
                <Select value={form.recipient} onValueChange={(value) => setForm({ ...form, recipient: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os alunos</SelectItem>
                    {students.map((student) => <SelectItem key={student.id} value={student.id}>{student.full_name ?? student.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Titulo</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Mensagem</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={sending} className="bg-gradient-accent hover:opacity-95">{sending ? "Salvando..." : form.id ? "Atualizar" : "Enviar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {communications.length === 0 ? (
        <Card><CardContent className="p-8"><EmptyState icon={MessageSquare} title="Sem comunicacoes" description="Nenhuma comunicacao enviada ainda." /></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {communications.map((comm) => (
            <Card key={comm.id} className={!comm.read ? "border-l-4 border-l-accent" : ""}>
              <CardContent className="p-5 flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {!comm.read && <Badge variant="default" className="text-xs bg-accent">Novo</Badge>}
                    <Badge variant="outline" className="text-xs">{comm.recipientName}</Badge>
                  </div>
                  <h3 className="font-semibold text-primary">{comm.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{comm.body}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /><span>{formatDate(comm.createdAt)}</span></div>
                </div>
                <div className="flex gap-2 md:flex-col">
                  <Button variant="outline" size="sm" onClick={() => { setForm({ id: comm.id, title: comm.title, body: comm.body, recipient: comm.recipientId ?? "all" }); setOpen(true); }}><Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1.5" /> Excluir</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Remover comunicacao?</AlertDialogTitle><AlertDialogDescription>Esta acao nao pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => remove(comm.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
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

export default ManagerCommunications;
