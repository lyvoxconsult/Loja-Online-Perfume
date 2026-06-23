import { useEffect, useMemo, useState } from "react";
import { SEO } from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { loadCourses, type Course, type Format, type Level } from "@/services/courses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GraduationCap, Clock, Globe, ArrowRight, Check } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const levels: Array<"all" | Level> = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];
const formats: Array<"all" | Format> = ["all", "online", "presencial", "hibrido"];

const formatLabel: Record<Format, string> = { online: "Online", presencial: "Presencial", hibrido: "Híbrido" };

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [level, setLevel] = useState<"all" | Level>("all");
  const [format, setFormat] = useState<"all" | Format>("all");
  const [active, setActive] = useState<Course | null>(null);

  // Carregar cursos do serviço centralizado
  useEffect(() => {
    setCourses(loadCourses());
    
    // Atualizar quando houver mudanças no localStorage (gestor alterou cursos)
    const handleStorage = () => setCourses(loadCourses());
    window.addEventListener("storage", handleStorage);
    
    // Atualizar também em intervalos para pegar mudanças dentro da mesma página
    const interval = setInterval(() => setCourses(loadCourses()), 2000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(
    () => courses.filter((c) => (level === "all" || c.level === level) && (format === "all" || c.format === format)),
    [courses, level, format]
  );

  return (
    <>
      <SEO title="Cursos" description="Conheça todos os cursos da Lumina English Academy: do básico ao avançado, online ou presencial." />

      <section className="bg-gradient-soft border-b border-border">
        <div className="container-page py-16 md:py-20">
          <SectionHeader eyebrow="Catálogo" title="Encontre o curso perfeito para você" description="Filtros por nível e formato. Todos os cursos incluem material digital, suporte 1:1 e certificado." />
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nível</p>
              <div className="flex flex-wrap gap-2">
                {levels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-md text-sm font-medium border transition-all",
                      level === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    {l === "all" ? "Todos" : l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Formato</p>
              <div className="flex flex-wrap gap-2">
                {formats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-md text-sm font-medium border transition-all",
                      format === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    {f === "all" ? "Todos" : formatLabel[f as Format]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">{filtered.length} curso{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Nenhum curso encontrado" description="Tente ajustar os filtros para ver mais opções." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card key={c.id} className="overflow-hidden hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer" onClick={() => setActive(c)}>
                <div className="aspect-video bg-primary flex items-center justify-center text-primary-foreground">
                  <GraduationCap className="h-12 w-12 opacity-90" />
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">{c.level}</Badge>
                    <Badge variant="outline" className="capitalize">{formatLabel[c.format]}</Badge>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-primary group-hover:text-accent transition-colors">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{c.shortDescription}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.duration}</span>
                    <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{formatLabel[c.format]}</span>
                  </div>
                  <div className="pt-3 flex items-center justify-between border-t border-border">
                    <span className="text-base font-semibold text-primary">R$ {c.price}<span className="text-muted-foreground text-sm font-normal">/mês</span></span>
                    <span className="text-sm font-medium text-accent inline-flex items-center gap-1">Detalhes <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">{active.level}</Badge>
                  <Badge variant="outline">{formatLabel[active.format]}</Badge>
                </div>
                <DialogTitle className="text-2xl font-display">{active.title}</DialogTitle>
                <DialogDescription className="text-base leading-relaxed pt-2">{active.description}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-primary mb-3">O que você vai aprender</h4>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {active.topics.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Investimento</p>
                    <p className="text-2xl font-bold text-primary">R$ {active.price}<span className="text-base font-normal text-muted-foreground">/mês</span></p>
                  </div>
                  <Button onClick={() => { localStorage.setItem("lumina:demo:selected-course", active.id); toast.success("Interesse registrado nesta demonstração."); setActive(null); }}>Matricular agora</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Courses;
