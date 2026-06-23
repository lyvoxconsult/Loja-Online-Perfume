import { useMemo, useState } from "react";
import { Download, FileChartColumn, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadDemoLessons, loadDemoStudents, getStudentMetrics } from "@/services/demoSchool";

const ManagerReports = () => {
  const [period, setPeriod] = useState("6");
  const metrics = useMemo(() => getStudentMetrics(), []);
  const lessons = useMemo(() => loadDemoLessons(), []);
  const students = useMemo(() => loadDemoStudents(), []);
  const chart = metrics.map((item) => ({ name: item.full_name.split(" ")[0], progresso: item.progress, media: item.avgScore }));
  const periodStart = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - Number(period));
    return date;
  }, [period]);
  const filteredLessons = lessons.filter((item) => new Date(item.scheduledAt) >= periodStart);
  const completed = filteredLessons.filter((item) => item.status === "completed").length;

  const exportReport = () => {
    const csv = ["Aluno,Progresso,Media,Aulas", ...metrics.map((item) => `${item.full_name},${item.progress},${item.avgScore},${item.lessonsCount}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-lumina-demo.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado.");
  };

  return <div className="space-y-6">
    <SEO title="Relatórios - Gestor" />
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl md:text-3xl font-bold text-primary">Relatórios</h1><p className="mt-1 text-muted-foreground">Visão acadêmica e operacional da escola demonstrativa.</p></div><div className="flex gap-2"><select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="3">Últimos 3 meses</option><option value="6">Últimos 6 meses</option><option value="12">Últimos 12 meses</option></select><Button onClick={exportReport}><Download className="mr-2 h-4 w-4" /> Exportar CSV</Button></div></div>
    <div className="grid gap-4 md:grid-cols-3">
      {[{ label: "Alunos monitorados", value: students.length, icon: Users }, { label: "Aulas concluídas", value: completed, icon: FileChartColumn }, { label: "Progresso médio", value: `${Math.round(students.reduce((sum, item) => sum + item.progress, 0) / students.length)}%`, icon: TrendingUp }].map((item) => <Card key={item.label}><CardContent className="p-5"><item.icon className="mb-3 h-5 w-5 text-secondary" /><p className="text-2xl font-bold text-primary">{item.value}</p><p className="text-sm text-muted-foreground">{item.label}</p></CardContent></Card>)}
    </div>
    <Card><CardHeader><CardTitle>Desempenho por aluno · {period} meses</CardTitle></CardHeader><CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="progresso" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} /><Bar dataKey="media" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
  </div>;
};

export default ManagerReports;
