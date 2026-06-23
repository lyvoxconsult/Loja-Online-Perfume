import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Music, Link as LinkIcon, Download } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { SEO } from "@/components/common/SEO";
import { toast } from "sonner";
import { loadStudentMaterials, type DemoMaterial } from "@/services/demoSchool";

const iconFor = (type: string) => {
  switch (type) {
    case "video":
      return Video;
    case "audio":
      return Music;
    case "link":
      return LinkIcon;
    default:
      return FileText;
  }
};

const Materials = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<DemoMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setItems(loadStudentMaterials(user.id));
    setLoading(false);
  }, [user]);

  const onDownload = (item: DemoMaterial) => {
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }
    toast.success("Material pronto para demonstracao", { description: item.title });
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <SEO title="Materiais" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Materiais</h1>
        <p className="text-muted-foreground mt-1">Conteudos e recursos para complementar suas aulas.</p>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="p-6"><EmptyState icon={FileText} title="Nenhum material disponivel" description="Em breve seu professor disponibilizara conteudos aqui." /></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = iconFor(item.type);
            return (
              <Card key={item.id} className="hover:shadow-soft transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="capitalize ml-auto">{item.type}</Badge>
                  </div>
                  <h3 className="font-semibold text-primary leading-snug">{item.title}</h3>
                  {item.description && <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{item.description}</p>}
                  <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onDownload(item)}>
                    <Download className="h-4 w-4 mr-2" /> Acessar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Materials;
