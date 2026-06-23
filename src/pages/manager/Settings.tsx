import { useState } from "react";
import { Bell, Building2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const KEY = "lumina:demo:settings";
const defaults = { schoolName: "Lumina English Academy", email: "contato@lumina.demo", phone: "(11) 4000-2026", reminders: true, weeklyReport: true, maintenance: false };

const ManagerSettings = () => {
  const [settings, setSettings] = useState(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; } catch { return defaults; }
  });
  const save = () => { localStorage.setItem(KEY, JSON.stringify(settings)); toast.success("Configurações salvas."); };
  return <div className="space-y-6">
    <SEO title="Configurações - Gestor" />
    <div><h1 className="text-2xl md:text-3xl font-bold text-primary">Configurações</h1><p className="mt-1 text-muted-foreground">Preferências locais da demonstração comercial.</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Identidade da escola</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Nome</Label><Input className="mt-1.5" value={settings.schoolName} onChange={(event) => setSettings({ ...settings, schoolName: event.target.value })} /></div><div><Label>E-mail</Label><Input className="mt-1.5" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} /></div><div><Label>Telefone</Label><Input className="mt-1.5" value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} /></div></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Automação demonstrativa</CardTitle></CardHeader><CardContent className="space-y-5">{[{ key: "reminders", label: "Lembretes de aula", description: "Simula avisos antes das aulas." }, { key: "weeklyReport", label: "Resumo semanal", description: "Simula o envio de indicadores ao gestor." }, { key: "maintenance", label: "Modo manutenção", description: "Apenas preferência visual, sem bloquear o acesso." }].map((item) => <div key={item.key} className="flex items-center justify-between gap-4"><div><p className="font-medium">{item.label}</p><p className="text-sm text-muted-foreground">{item.description}</p></div><Switch checked={settings[item.key as keyof typeof settings] as boolean} onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })} /></div>)}</CardContent></Card>
    </div>
    <Card className="border-secondary/30 bg-secondary/5"><CardContent className="flex items-start gap-3 p-5"><ShieldCheck className="mt-0.5 h-5 w-5 text-secondary" /><div><p className="font-medium text-primary">Ambiente demonstrativo isolado</p><p className="text-sm text-muted-foreground">As alterações ficam somente neste navegador e não são enviadas para serviços externos.</p></div></CardContent></Card>
    <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Salvar configurações</Button>
  </div>;
};

export default ManagerSettings;
