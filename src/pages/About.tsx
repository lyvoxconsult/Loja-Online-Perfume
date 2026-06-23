import { SEO } from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Globe2, Lightbulb, Target, Users } from "lucide-react";

const About = () => {
  const differentials = [
    { icon: Award, title: "Trilhas certificadas", desc: "Avaliações demonstrativas alinhadas a níveis internacionais de proficiência." },
    { icon: Heart, title: "Ensino humanizado", desc: "Cada aluno é único. Acompanhamento próximo do início ao fim da jornada." },
    { icon: Globe2, title: "Comunidade global", desc: "Eventos, clubes de conversação e intercâmbio com alunos de outros países." },
    { icon: Lightbulb, title: "Metodologia ativa", desc: "Aprenda fazendo. Projetos reais, debates e simulações desde o nível básico." },
  ];

  return (
    <>
      <SEO title="Sobre nós" description="Conheça a história, a missão e os diferenciais da Lumina English Academy." />

      <section className="bg-gradient-hero text-primary-foreground">
        <div className="container-page py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-4 inline-block">Nossa história</span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-balance">Educação que abre portas para o mundo.</h1>
            <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed max-w-2xl">
              Fundada em 2015, a Lumina nasceu da paixão por unir tecnologia, pedagogia e cultura para entregar uma experiência de aprendizado verdadeiramente transformadora.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 items-start">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-5">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Nossa missão</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Democratizar o acesso ao inglês de qualidade no Brasil, com método imersivo, professores nativos e tecnologia de ponta. Acreditamos que aprender um idioma é mais do que estudar gramática — é viver outra cultura.
            </p>
          </div>
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary mb-5">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Nossa visão</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Ser a escola de inglês mais admirada da América Latina, conhecida pelo impacto real na vida de cada aluno e pela excelência acadêmica reconhecida internacionalmente.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20 md:py-28">
        <div className="container-page">
          <SectionHeader eyebrow="Diferenciais" title="O que nos torna únicos" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {differentials.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-border/60 hover:border-accent/40 hover:shadow-soft transition-all">
                <CardContent className="p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-primary mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
