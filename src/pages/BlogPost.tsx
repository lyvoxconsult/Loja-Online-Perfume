import { Link, useParams, Navigate } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { findPublishedPost, loadPublishedPosts } from "@/services/posts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, BookOpenText, Linkedin, Share2 } from "lucide-react";
import { toast } from "sonner";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = findPublishedPost(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const related = loadPublishedPosts().filter((p) => p.id !== post.id).slice(0, 3);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: post.title, text: post.excerpt, url });
    else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado.");
    }
  };

  return (
    <>
      <SEO title={post.title} description={post.excerpt} />

      <article className="container-page py-12 md:py-16">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/blog"><ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar ao blog</Link>
        </Button>

        <div className="grid lg:grid-cols-[1fr_280px] gap-10">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 mb-4">{post.category}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-primary leading-tight mb-5 text-balance">{post.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-5 text-sm text-muted-foreground pb-6 mb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">{post.authorInitials}</div>
                <span className="font-medium text-foreground">{post.author}</span>
              </div>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(post.publishedAt)}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.readingTime} min</span>
            </div>

            <div className="aspect-[16/9] rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-10">
              <BookOpenText className="h-16 w-16 opacity-75" />
            </div>

            <div className="prose prose-slate max-w-none">
              {post.content.split("\n\n").map((block, i) => {
                if (block.startsWith("## ")) {
                  return <h2 key={i} className="text-2xl font-display font-bold text-primary mt-10 mb-4">{block.replace("## ", "")}</h2>;
                }
                return <p key={i} className="text-foreground/85 leading-relaxed mb-5 whitespace-pre-line">{block}</p>;
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center gap-2">
              {post.tags.map((t) => (
                <Badge key={t} variant="outline" className="capitalize">#{t}</Badge>
              ))}
              <Button variant="outline" size="sm" className="ml-auto" onClick={share}><Share2 className="h-4 w-4 mr-2" /> Compartilhar</Button>
              <Button asChild variant="outline" size="icon" aria-label="Compartilhar no LinkedIn">
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer"><Linkedin className="h-4 w-4" /></a>
              </Button>
            </div>
          </div>

          <aside className="space-y-4">
            <h4 className="font-display font-semibold text-primary">Artigos relacionados</h4>
            {related.map((p) => (
              <Link to={`/blog/${p.slug}`} key={p.id}>
                <Card className="hover:shadow-soft hover:border-accent/30 transition-all">
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 mb-2 text-xs">{p.category}</Badge>
                    <h5 className="font-display font-semibold text-sm text-primary leading-snug line-clamp-3">{p.title}</h5>
                    <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.readingTime} min</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </aside>
        </div>
      </article>
    </>
  );
};

export default BlogPost;
