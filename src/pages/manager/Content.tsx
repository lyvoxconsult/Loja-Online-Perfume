import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/common/SEO";

const STORAGE_KEY = "lumina:site-content";

interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutMission: string;
  contactEmail: string;
  contactPhone: string;
}

const defaults: SiteContent = {
  heroTitle: "Aprenda inglês de verdade, viva o mundo.",
  heroSubtitle: "Metodologia consolidada, professores nativos e um ecossistema que acompanha você até a fluência real.",
  aboutMission: "Formar cidadãos globais por meio de uma educação em inglês transformadora, humana e baseada em ciência do aprendizado.",
  contactEmail: "contato@lumina.com",
  contactPhone: "+55 (11) 4000-0000",
};

const loadFromStorage = (): SiteContent => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
};

const ManagerContent = () => {
  const [content, setContent] = useState<SiteContent>(loadFromStorage);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    toast.success("Conteúdo salvo!");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SEO title="Conteúdo institucional" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Conteúdo institucional</h1>
        <p className="text-muted-foreground mt-1">Edite os textos das principais páginas públicas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" /> Hero da Home
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título principal</Label>
            <Input value={content.heroTitle} onChange={(e) => setContent({ ...content, heroTitle: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Subtítulo</Label>
            <Textarea rows={3} value={content.heroSubtitle} onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sobre / Missão</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={4} value={content.aboutMission} onChange={(e) => setContent({ ...content, aboutMission: e.target.value })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Contato</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={content.contactEmail} onChange={(e) => setContent({ ...content, contactEmail: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={content.contactPhone} onChange={(e) => setContent({ ...content, contactPhone: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>
          <Save className="h-4 w-4 mr-2" /> Salvar alterações
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">As alterações são persistidas somente neste navegador demonstrativo.</p>
    </div>
  );
};

export default ManagerContent;
