import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import type { Post } from "@/mocks/posts";
import { loadPublishedPosts } from "@/services/posts";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, ArrowRight, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

const Blog = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    const sync = () => setPosts(loadPublishedPosts());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("lumina:posts-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("lumina:posts-updated", sync);
    };
  }, []);

  const categories = useMemo(() => ["all", ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [posts, query, category]);

  return (
    <>
      <SEO title="Blog" description="Artigos, dicas e estratégias para acelerar seu aprendizado de inglês." />

      <section className="bg-gradient-soft border-b border-border">
        <div className="container-page py-16 md:py-20">
          <SectionHeader eyebrow="Blog" title="Aprenda enquanto lê" description="Artigos práticos escritos pelo nosso time de educadores." />
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_280px] gap-10">
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar artigos..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-11"
                  aria-label="Buscar artigos"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-md text-sm font-medium border transition-all",
                      category === c
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    {c === "all" ? "Todas" : c}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="Nenhum artigo encontrado" description="Tente uma busca diferente." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((p) => (
                  <Link to={`/blog/${p.slug}`} key={p.id}>
                    <Card className="overflow-hidden h-full hover:shadow-elevated hover:-translate-y-0.5 transition-all group">
                      <div className="aspect-[16/10] bg-primary flex items-center justify-center text-primary-foreground">
                        <BookOpenText className="h-12 w-12 opacity-80" />
                      </div>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">{p.category}</Badge>
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {p.readingTime} min
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-lg text-primary group-hover:text-accent transition-colors line-clamp-2">{p.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{p.excerpt}</p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold">{p.authorInitials}</div>
                            <span className="text-xs text-muted-foreground">{p.author}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h4 className="font-display font-semibold text-primary mb-3">Posts recentes</h4>
                <ul className="space-y-3">
                  {posts.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Link to={`/blog/${p.slug}`} className="text-sm text-muted-foreground hover:text-accent transition-colors line-clamp-2">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-5">
                <h4 className="font-display font-semibold mb-2">Newsletter</h4>
                <p className="text-sm text-primary-foreground/80 mb-4">Receba conteúdos semanais para acelerar seu inglês.</p>
                <form
                  className="space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!newsletterEmail.includes("@")) return toast.error("Informe um e-mail válido.");
                    setNewsletterEmail("");
                    toast.success("Inscrição confirmada para esta demonstração.");
                  }}
                >
                  <Input value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Seu e-mail" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50" />
                  <Button type="submit" variant="secondary" className="w-full">Inscrever-se</Button>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Blog;
