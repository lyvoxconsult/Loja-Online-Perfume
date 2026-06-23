import { useState } from "react";
import { Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/common/SEO";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStudentById } from "@/services/demoSchool";

const StudentProfile = () => {
  const { user } = useAuth();
  const source = user ? getStudentById(user.id) : null;
  const key = `lumina:demo:profile:${user?.id ?? "anonymous"}`;
  const [profile, setProfile] = useState(() => {
    try {
      return { name: source?.full_name ?? "Aluno Demo", email: user?.email ?? "", phone: source?.phone ?? "", goal: "Ganhar confiança em reuniões e viagens.", ...JSON.parse(localStorage.getItem(key) ?? "{}") };
    } catch {
      return { name: source?.full_name ?? "Aluno Demo", email: user?.email ?? "", phone: source?.phone ?? "", goal: "Ganhar confiança em reuniões e viagens." };
    }
  });
  const save = () => { localStorage.setItem(key, JSON.stringify(profile)); toast.success("Perfil atualizado."); };
  return <div className="space-y-6">
    <SEO title="Perfil - Aluno" />
    <div><h1 className="text-2xl md:text-3xl font-bold text-primary">Meu perfil</h1><p className="mt-1 text-muted-foreground">Dados pessoais e objetivo de aprendizagem.</p></div>
    <Card className="max-w-2xl"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> Informações pessoais</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Nome</Label><Input className="mt-1.5" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></div><div><Label>E-mail</Label><Input className="mt-1.5" value={profile.email} disabled /></div><div><Label>Telefone</Label><Input className="mt-1.5" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></div><div><Label>Objetivo principal</Label><Input className="mt-1.5" value={profile.goal} onChange={(event) => setProfile({ ...profile, goal: event.target.value })} /></div><Button onClick={save}><Save className="mr-2 h-4 w-4" /> Salvar perfil</Button></CardContent></Card>
  </div>;
};

export default StudentProfile;
