import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, Clock } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { loadPublishedPosts } from "@/services/posts";

const StudentBlog = () => {
  const posts = loadPublishedPosts();
  return <div className="space-y-6">
    <SEO title="Conteúdos - Aluno" />
    <div><h1 className="text-2xl md:text-3xl font-bold text-primary">Blog e conteúdos</h1><p className="mt-1 text-muted-foreground">Leituras recomendadas para complementar sua trilha.</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <Card key={post.id} className="overflow-hidden"><div className="flex aspect-[16/8] items-center justify-center bg-primary text-primary-foreground"><BookOpenText className="h-10 w-10 opacity-75" /></div><CardContent className="p-5"><div className="flex items-center gap-2"><Badge variant="secondary">{post.category}</Badge><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {post.readingTime} min</span></div><h2 className="mt-3 font-semibold text-primary">{post.title}</h2><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p><Link className="mt-4 inline-flex items-center text-sm font-medium text-secondary" to={`/blog/${post.slug}`}>Ler artigo <ArrowRight className="ml-1 h-4 w-4" /></Link></CardContent></Card>)}</div>
  </div>;
};

export default StudentBlog;
