import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, BookOpen, TrendingUp, Bell, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { seedStudentDataIfEmpty } from "@/services/studentSeed";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { SEO } from "@/components/common/SEO";
import { countUnreadCommunications, loadCommunications } from "@/services/communications";
import { loadStudentAgenda, loadStudentProgress } from "@/services/demoSchool";

interface Lesson {
  id: string;
  title: string;
  teacher: string | null;
  scheduledAt: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState<{ id: string; title: string; body: string }[]>([]);
  const [overall, setOverall] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      await seedStudentDataIfEmpty(user.id);

      const upcoming = loadStudentAgenda(user.id)
        .filter((lesson) => new Date(lesson.scheduledAt) >= new Date())
        .slice(0, 3)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          teacher: lesson.teacher,
          scheduledAt: lesson.scheduledAt,
        }));
      setLessons(upcoming);

      const progress = loadStudentProgress(user.id);
      if (progress.length > 0) {
        setOverall(Math.round(progress.reduce((sum, item) => sum + item.score, 0) / progress.length));
      } else {
        setOverall(0);
      }

      const allComms = loadCommunications();
      const userComms = allComms.filter((comm) => comm.recipientId === null || comm.recipientId === user.id);
      setUnreadCount(countUnreadCommunications(user.id));
      setRecentNotifs(userComms.slice(0, 4).map((comm) => ({ id: comm.id, title: comm.title, body: comm.body })));
      setLoading(false);
    };

    load().catch(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState />;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <SEO title="Dashboard do Aluno" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Olá, {user?.email?.split("@")[0]}</h1>
        <p className="text-muted-foreground mt-1">Veja seu progresso e próximos compromissos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progresso geral</span>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div className="text-3xl font-bold text-primary">{overall}%</div>
            <Progress value={overall} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Próximas aulas</span>
              <CalendarDays className="h-4 w-4 text-accent" />
            </div>
            <div className="text-3xl font-bold text-primary">{lessons.length}</div>
            <p className="text-xs text-muted-foreground mt-1">agendadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avisos novos</span>
              <Bell className="h-4 w-4 text-accent" />
            </div>
            <div className="text-3xl font-bold text-primary">{unreadCount}</div>
            <p className="text-xs text-muted-foreground mt-1">não lidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-primary">Próximas aulas</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/aluno/agenda">Ver tudo <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
            {lessons.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Sem aulas agendadas" description="Aguarde a próxima programação do gestor." />
            ) : (
              <ul className="divide-y divide-border">
                {lessons.map((lesson) => (
                  <li key={lesson.id} className="py-3 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary text-sm truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.teacher ?? "Professor"} • {fmt(lesson.scheduledAt)}</p>
                    </div>
                    <Badge variant="outline" className="text-accent border-accent/30 hidden sm:inline-flex">
                      <Sparkles className="h-3 w-3 mr-1" /> Agendada
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-display font-semibold text-primary mb-4">Avisos recentes</h2>
            {recentNotifs.length === 0 ? (
              <EmptyState icon={Bell} title="Sem avisos" />
            ) : (
              <ul className="space-y-4">
                {recentNotifs.map((item) => (
                  <li key={item.id} className="text-sm">
                    <p className="font-medium text-primary">{item.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-hero text-primary-foreground border-0">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div>
            <h3 className="font-display font-semibold text-xl">Continue de onde parou</h3>
            <p className="text-primary-foreground/80 text-sm mt-1">Revise seus materiais ou acompanhe sua evolucao.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link to="/aluno/materiais"><BookOpen className="h-4 w-4 mr-2" /> Materiais</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/aluno/progresso">Meu progresso</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
