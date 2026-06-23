export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorInitials: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  status: "draft" | "published" | "archived";
  featured: boolean;
}

export const posts: Post[] = [
  {
    id: "p1",
    slug: "10-dicas-praticas-para-acelerar-seu-ingles",
    title: "10 dicas práticas para acelerar seu inglês em 2025",
    excerpt: "Estratégias acionáveis baseadas em ciência do aprendizado para destravar a fluência no menor tempo possível.",
    category: "Aprendizado",
    author: "Sarah Mitchell",
    authorInitials: "SM",
    publishedAt: "2025-03-12",
    readingTime: 7,
    tags: ["fluência", "estudo", "metodologia"],
    status: "published",
    featured: true,
    content:
      "Aprender um idioma é uma maratona, não uma corrida de 100 metros. Mas existem atalhos comprovados pela ciência do aprendizado que aceleram drasticamente a sua jornada.\n\n## 1. Imersão diária de 20 minutos\nA consistência vence a intensidade. 20 minutos por dia geram mais resultado do que 3 horas no fim de semana.\n\n## 2. Aprenda em contexto\nMemorizar listas de palavras é ineficiente. Aprenda vocabulário dentro de frases reais.\n\n## 3. Fale desde o primeiro dia\nNão espere ser fluente para começar a falar. O erro é parte do processo.\n\n## 4. Use a técnica do shadowing\nRepita imediatamente o que ouve, imitando o ritmo e a entonação.\n\n## 5. Crie uma rotina sustentável\nMelhor 30 minutos consistentes do que 3 horas esporádicas.",
  },
  {
    id: "p2",
    slug: "como-se-preparar-para-exames-internacionais",
    title: "Como se preparar para exames internacionais: guia completo",
    excerpt: "Passo a passo detalhado para alcançar sua nota-alvo, da estratégia de estudo aos simulados.",
    category: "Exames",
    author: "David Williams",
    authorInitials: "DW",
    publishedAt: "2025-02-28",
    readingTime: 10,
    tags: ["certificação", "exames", "preparação"],
    status: "published",
    featured: true,
    content:
      "Certificações internacionais exigem estratégia e consistência. Aqui está o roteiro que usamos com nossos alunos.\n\n## Entenda o formato\nMapeie as seções de Listening, Reading, Writing e Speaking.\n\n## Faça um diagnóstico\nAntes de estudar, faça um simulado completo para identificar suas lacunas.\n\n## Foque no que pesa\nWriting e Speaking exigem feedback humano. Não tente fazer sozinho.\n\n## Simulados semanais\nA partir do 2º mês, faça um simulado completo por semana.",
  },
  {
    id: "p3",
    slug: "phrasal-verbs-mais-usados-em-conversacao",
    title: "Os 25 phrasal verbs mais usados em conversação",
    excerpt: "Domine os phrasal verbs essenciais que aparecem em 80% das conversas do dia a dia.",
    category: "Vocabulário",
    author: "James O'Connor",
    authorInitials: "JO",
    publishedAt: "2025-02-15",
    readingTime: 6,
    tags: ["vocabulário", "phrasal verbs", "conversação"],
    status: "published",
    featured: false,
    content:
      "Phrasal verbs assustam muitos estudantes, mas são essenciais para soar natural.\n\n## Por que são tão importantes?\nNativos usam phrasal verbs o tempo todo, especialmente em contextos informais.\n\n## Os top 5\n1. **Pick up** — buscar, pegar\n2. **Look up** — pesquisar\n3. **Get up** — levantar-se\n4. **Hang out** — sair com amigos\n5. **Figure out** — descobrir\n\nAprenda em blocos de 5 e use cada um em 3 frases próprias.",
  },
  {
    id: "p4",
    slug: "ingles-para-negocios-vocabulario-essencial",
    title: "Inglês para negócios: vocabulário essencial",
    excerpt: "150 termos de negócios que todo profissional deve dominar para se destacar em multinacionais.",
    category: "Business",
    author: "Aisha Patel",
    authorInitials: "AP",
    publishedAt: "2025-01-30",
    readingTime: 8,
    tags: ["business", "carreira", "vocabulário"],
    status: "published",
    featured: false,
    content:
      "O inglês de negócios tem nuances próprias que vão muito além do inglês geral.\n\n## Reuniões\n- **To set up a meeting** — agendar uma reunião\n- **To follow up** — dar continuidade\n- **Action items** — itens de ação\n\n## E-mails profissionais\nUse linguagem clara, objetiva e respeitosa. Evite gírias.\n\n## Apresentações\nEstruture com começo, meio e fim. Pratique em voz alta.",
  },
  {
    id: "p5",
    slug: "intercambio-vale-a-pena",
    title: "Intercâmbio vale a pena? Análise honesta em 2025",
    excerpt: "Custos, benefícios e alternativas modernas para imersão internacional no aprendizado de inglês.",
    category: "Cultura",
    author: "Olivia Brown",
    authorInitials: "OB",
    publishedAt: "2025-01-15",
    readingTime: 9,
    tags: ["intercâmbio", "imersão", "cultura"],
    status: "published",
    featured: false,
    content:
      "Intercâmbio é um sonho para muitos brasileiros. Mas vale o investimento? Depende.\n\n## O que o intercâmbio entrega\n- Imersão cultural real\n- Networking internacional\n- Confiança e independência\n\n## O que NÃO entrega\nFluência mágica. Você precisa estudar antes para aproveitar.\n\n## Alternativas modernas\nProgramas online imersivos podem entregar 80% do resultado a 20% do custo.",
  },
];
