import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe2, Sparkles, Users, Trophy, GraduationCap, Star, Quote, CalendarCheck2, TrendingUp } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadCourses, type Course } from "@/services/courses";
import { testimonials } from "@/mocks/teachers";

const benefits = [
  { icon: Globe2, title: "Professores internacionais", desc: "Time global fictício, certificado e preparado para diferentes objetivos." },
  { icon: Sparkles, title: "Método imersivo", desc: "Aprenda em contexto real, com prática desde a primeira aula." },
  { icon: Users, title: "Turmas reduzidas", desc: "Máximo de 8 alunos por turma para atenção individualizada." },
  { icon: Trophy, title: "Evolução acompanhada", desc: "Indicadores claros conectam aulas, prática e progresso acadêmico." },
];

const Home = () => {
  const [courses, setCourses] = useState<Course[]>([]);

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

  const featured = courses.filter((c) => c.highlight).slice(0, 3);

  return (
    <>
      <SEO title="Aprenda inglês de verdade" description="Lumina English Academy, experiência demonstrativa para gestão e aprendizagem de inglês." />

      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] border-l border-primary-foreground/10 bg-primary-foreground/[0.04] lg:block" aria-hidden="true">
          <div className="absolute left-10 right-10 top-20 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-5 shadow-elevated">
            <div className="flex items-center justify-between"><span className="text-xs font-medium text-primary-foreground/70">Visão acadêmica</span><TrendingUp className="h-4 w-4 text-secondary" /></div>
            <div className="mt-5 grid grid-cols-3 gap-3">{[["92%", "Presença"], ["4,8", "Satisfação"], ["18", "Aulas"]].map(([value, label]) => <div key={label} className="rounded-md bg-primary-foreground/10 p-3"><p className="text-xl font-bold">{value}</p><p className="mt-1 text-[11px] text-primary-foreground/60">{label}</p></div>)}</div>
            <div className="mt-5 space-y-3">{[82, 68, 91].map((value, index) => <div key={value} className="flex items-center gap-3"><span className="w-20 text-xs text-primary-foreground/60">{["Speaking", "Writing", "Listening"][index]}</span><div className="h-2 flex-1 rounded-full bg-primary-foreground/10"><div className="h-2 rounded-full bg-secondary" style={{ width: `${value}%` }} /></div></div>)}</div>
          </div>
          <div className="absolute bottom-20 left-24 right-4 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-4 shadow-elevated">
            <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-secondary-foreground"><CalendarCheck2 className="h-5 w-5" /></div><div><p className="text-sm font-semibold">Conversation Lab</p><p className="text-xs text-primary-foreground/60">Hoje, 19:00 · Turma B1</p></div></div>
          </div>
        </div>
        <div className="container-page relative py-20 md:py-28 lg:py-32">
          <div className="max-w-2xl animate-fade-in">
            <Badge className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/15 mb-6">
              <Sparkles className="h-3 w-3 mr-1.5" /> Ambiente demonstrativo completo
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-normal text-balance">
              Lumina English Academy
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 leading-relaxed max-w-2xl">
              Uma experiência integrada para apresentar cursos, acompanhar alunos e operar uma escola de inglês com clareza.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" variant="secondary" className="h-12 px-7 shadow-soft">
                <Link to="/login">
                  Explorar a demonstração <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/cursos">Ver cursos</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
              {[
                { v: "2", l: "Perfis de acesso" },
                { v: "20+", l: "Fluxos navegáveis" },
                { v: "100%", l: "Dados fictícios" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl md:text-3xl font-bold">{s.v}</div>
                  <div className="text-xs md:text-sm text-primary-foreground/70 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="container-page py-20 md:py-28">
        <SectionHeader eyebrow="Por que Lumina" title="Tudo que você precisa para aprender inglês de verdade" description="Combinamos pedagogia comprovada, tecnologia moderna e um time apaixonado para entregar resultado real." />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/60 hover:border-accent/40 hover:shadow-soft transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-primary mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CURSOS EM DESTAQUE */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <SectionHeader eyebrow="Cursos" title="Programas em destaque" description="Selecionamos os caminhos mais procurados para você começar." align="left" className="max-w-xl" />
            <Button asChild variant="outline">
              <Link to="/cursos">Ver todos os cursos <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((c) => (
              <Card key={c.id} className="overflow-hidden hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 group bg-card">
                <div className="aspect-video bg-primary flex items-center justify-center text-primary-foreground">
                  <GraduationCap className="h-12 w-12 opacity-90" />
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">{c.level}</Badge>
                    <span className="text-xs text-muted-foreground">{c.duration}</span>
                  </div>
                  <h3 className="font-display font-semibold text-xl text-primary group-hover:text-accent transition-colors">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">R$ {c.price}<span className="text-muted-foreground font-normal">/mês</span></span>
                    <Link to="/cursos" className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1">
                      Saiba mais <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="container-page py-20 md:py-28">
        <SectionHeader eyebrow="Depoimentos" title="Histórias demonstrativas da jornada de aprendizagem" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id} className="border-border/60 bg-card relative">
              <CardContent className="p-7">
                <Quote className="h-7 w-7 text-accent/30 mb-3" />
                <div className="flex gap-0.5 mb-3" aria-label={`${t.rating} estrelas`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold text-sm">{t.initials}</div>
                  <div>
                    <div className="font-semibold text-sm text-primary">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-page pb-24">
        <div className="rounded-lg bg-primary text-primary-foreground p-10 md:p-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Pronto para destravar seu inglês?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Faça uma aula experimental gratuita e descubra o nível ideal para você.
            </p>
            <Button asChild size="lg" variant="secondary" className="h-12 px-8 shadow-soft">
              <Link to="/contato">Quero minha aula gratuita <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
