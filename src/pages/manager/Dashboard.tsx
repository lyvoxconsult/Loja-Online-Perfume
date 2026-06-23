import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, BookOpen, Megaphone, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { LoadingState } from "@/components/common/LoadingState";
import { SEO } from "@/components/common/SEO";
import { loadCommunications } from "@/services/communications";
import { loadDemoLessons, loadDemoMaterials, loadDemoProgress, loadDemoStudents } from "@/services/demoSchool";
import { loadCourses } from "@/services/courses";

interface Kpis {
  students: number;
  upcomingLessons: number;
  totalMaterials: number;
  notificationsSent: number;
  avgScore: number;
  activeCourses: number;
}

const ManagerDashboard = () => {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [skillsData, setSkillsData] = useState<{ skill: string; media: number }[]>([]);
  const [lessonsByMonth, setLessonsByMonth] = useState<{ month: string; agendadas: number; concluidas: number }[]>([]);

  useEffect(() => {
    const students = loadDemoStudents();
    const lessons = loadDemoLessons();
    const materials = loadDemoMaterials();
    const communications = loadCommunications();
    const progress = loadDemoProgress();
    const courses = loadCourses();

    const grouped: Record<string, { sum: number; n: number }> = {};
    progress.forEach((row) => {
      if (!grouped[row.skill]) grouped[row.skill] = { sum: 0, n: 0 };
      grouped[row.skill].sum += row.score;
      grouped[row.skill].n += 1;
    });

    setSkillsData(
      Object.entries(grouped).map(([skill, value]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        media: Math.round(value.sum / value.n),
      })),
    );

    const avgScore = progress.length ? Math.round(progress.reduce((sum, row) => sum + row.score, 0) / progress.length) : 0;
    const months: Record<string, { agendadas: number; concluidas: number }> = {};
    const monthLabel = (date: Date) => date.toLocaleString("pt-BR", { month: "short" });
    const today = new Date();
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
      months[monthLabel(date)] = { agendadas: 0, concluidas: 0 };
    }
    lessons.forEach((lesson) => {
      const key = monthLabel(new Date(lesson.scheduledAt));
      if (!months[key]) return;
      if (lesson.status === "completed") months[key].concluidas += 1;
      else if (lesson.status !== "cancelled") months[key].agendadas += 1;
    });
    setLessonsByMonth(Object.entries(months).map(([month, values]) => ({ month, ...values })));

    setKpis({
      students: students.length,
      upcomingLessons: lessons.filter((lesson) => new Date(lesson.scheduledAt) >= new Date() && lesson.status !== "cancelled").length,
      totalMaterials: materials.length,
      notificationsSent: communications.length,
      avgScore,
      activeCourses: courses.length,
    });
  }, []);

  if (!kpis) return <LoadingState label="Carregando indicadores..." />;

  const cards = [
    { label: "Alunos ativos", value: kpis.students, icon: Users, color: "text-secondary bg-secondary/10" },
    { label: "Próximas aulas", value: kpis.upcomingLessons, icon: CalendarDays, color: "text-accent bg-accent/10" },
    { label: "Materiais", value: kpis.totalMaterials, icon: BookOpen, color: "text-primary bg-primary/10" },
    { label: "Comunicações", value: kpis.notificationsSent, icon: Megaphone, color: "text-secondary bg-secondary/10" },
    { label: "Score médio", value: `${kpis.avgScore}%`, icon: TrendingUp, color: "text-accent bg-accent/10" },
  ];

  return (
    <div className="space-y-8">
      <SEO title="Painel do Gestor" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Visão geral</h1>
        <p className="text-muted-foreground mt-1">Indicadores operacionais da Lumina English Academy.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-primary">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Médias por habilidade</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="skill" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Bar dataKey="media" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Aulas nos últimos 6 meses</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lessonsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="agendadas" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="concluidas" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
