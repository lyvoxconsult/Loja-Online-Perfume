import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/common/LoadingState";
import { SEO } from "@/components/common/SEO";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { loadStudentProgress, type DemoProgressRow } from "@/services/demoSchool";

const skillLabel: Record<string, string> = {
  speaking: "Speaking",
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
};

const ProgressPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<DemoProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setRows(loadStudentProgress(user.id));
    setLoading(false);
  }, [user]);

  if (loading) return <LoadingState />;

  const overall = rows.length ? Math.round(rows.reduce((sum, item) => sum + item.score, 0) / rows.length) : 0;
  const chartData = rows.map((row) => ({ name: skillLabel[row.skill] ?? row.skill, score: row.score }));

  return (
    <div className="space-y-6">
      <SEO title="Progresso" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Seu progresso</h1>
        <p className="text-muted-foreground mt-1">Evolucao por habilidade e visao geral.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Geral</h2>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "Geral", value: overall, fill: "hsl(var(--accent))" }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={12} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-[140px] mb-[110px]">
              <div className="text-4xl font-bold text-primary">{overall}%</div>
              <p className="text-xs text-muted-foreground mt-1">de progresso</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Por habilidade</h2>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 8, bottom: 5, left: -20 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="score" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detalhamento</h2>
          {rows.map((row) => (
            <div key={row.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-primary">{skillLabel[row.skill] ?? row.skill}</span>
                <span className="text-sm text-muted-foreground">{row.score}%</span>
              </div>
              <Progress value={row.score} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressPage;
