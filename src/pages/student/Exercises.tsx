import { useState } from "react";
import { CheckCircle2, Circle, Dumbbell, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/common/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const KEY = "lumina:demo:exercises";
const seed = [
  { id: "ex-1", title: "Listening: Airport announcements", skill: "Listening", level: "B1", minutes: 12 },
  { id: "ex-2", title: "Grammar: Present perfect review", skill: "Grammar", level: "B1", minutes: 15 },
  { id: "ex-3", title: "Vocabulary: Business meetings", skill: "Vocabulary", level: "B2", minutes: 10 },
  { id: "ex-4", title: "Speaking: Describe a memorable trip", skill: "Speaking", level: "B1", minutes: 8 },
];

const StudentExercises = () => {
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]; } catch { return []; }
  });
  const toggle = (id: string) => {
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    toast.success(next.includes(id) ? "Exercício concluído." : "Exercício reaberto.");
  };
  const progress = Math.round((completed.length / seed.length) * 100);
  return <div className="space-y-6">
    <SEO title="Exercícios - Aluno" />
    <div><h1 className="text-2xl md:text-3xl font-bold text-primary">Exercícios</h1><p className="mt-1 text-muted-foreground">Pratique habilidades alinhadas ao seu nível atual.</p></div>
    <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="font-semibold text-primary">Progresso da semana</p><p className="text-sm text-muted-foreground">{completed.length} de {seed.length} atividades concluídas</p></div><span className="text-2xl font-bold text-secondary">{progress}%</span></div><Progress value={progress} className="mt-4 h-2" /></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2">
      {seed.map((exercise) => {
        const done = completed.includes(exercise.id);
        return <Card key={exercise.id} className={done ? "border-success/40 bg-success/5" : ""}><CardContent className="p-5">
          <div className="flex items-start gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${done ? "bg-success/15 text-success" : "bg-secondary/10 text-secondary"}`}>{done ? <CheckCircle2 className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}</div><div className="flex-1"><div className="flex flex-wrap gap-2"><Badge variant="outline">{exercise.skill}</Badge><Badge variant="secondary">{exercise.level}</Badge></div><h2 className="mt-3 font-semibold text-primary">{exercise.title}</h2><p className="mt-1 text-sm text-muted-foreground">{exercise.minutes} minutos · correção simulada imediata</p></div></div>
          <Button className="mt-5 w-full" variant={done ? "outline" : "default"} onClick={() => toggle(exercise.id)}>{done ? <><RotateCcw className="mr-2 h-4 w-4" /> Refazer</> : <><Circle className="mr-2 h-4 w-4" /> Concluir atividade</>}</Button>
        </CardContent></Card>;
      })}
    </div>
  </div>;
};

export default StudentExercises;
