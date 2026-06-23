import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { Logo } from "@/components/common/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldCheck, Info, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, type AppRole } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, role, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<AppRole>("aluno");
  const [email, setEmail] = useState("aluno@lumina.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  // Já logado? redireciona
  useEffect(() => {
    if (!authLoading && user && role) {
      const target = role === "gestor" ? "/gestor/dashboard" : "/aluno/dashboard";
      navigate((location.state as { from?: string })?.from ?? target, { replace: true });
    }
  }, [user, role, authLoading, navigate, location.state]);

  const onTabChange = (v: string) => {
    const r = v as AppRole;
    setTab(r);
    setEmail(`${r}@lumina.com`);
    setPassword("123456");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error("Falha no login", { description: error });
      return;
    }
    toast.success("Bem-vindo!");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <SEO title="Entrar" description="Acesse o portal Lumina English Academy." />

      <div className="hidden lg:flex relative overflow-hidden bg-primary text-primary-foreground p-12 flex-col justify-between">
        <Logo variant="white" />
        <div className="relative z-10">
          <p className="mb-3 text-sm font-semibold text-secondary">DEMONSTRAÇÃO COMERCIAL</p>
          <h2 className="text-4xl font-bold leading-tight mb-4 text-balance">Uma escola completa em uma única experiência.</h2>
          <p className="text-primary-foreground/80 leading-relaxed max-w-md">
            Alterne entre os perfis para validar gestão, aprendizagem, conteúdo e comunicação.
          </p>
          <div className="mt-8 space-y-3">
            {["Dados fictícios persistidos no navegador", "Permissões isoladas por perfil", "Fluxos funcionais sem backend"].map((item) => <div key={item} className="flex items-center gap-3 text-sm text-primary-foreground/80"><CheckCircle2 className="h-4 w-4 text-secondary" /> {item}</div>)}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/60 relative z-10">© {new Date().getFullYear()} Lumina English Academy</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center"><Logo /></div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Entrar no portal</h1>
          <p className="text-muted-foreground text-sm mb-7">Selecione seu perfil e faça login</p>

          <Tabs value={tab} onValueChange={onTabChange}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="aluno" className="gap-2"><GraduationCap className="h-4 w-4" /> Aluno</TabsTrigger>
              <TabsTrigger value="gestor" className="gap-2"><ShieldCheck className="h-4 w-4" /> Gestor</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" autoComplete="email" required />
                    </div>
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" autoComplete="current-password" required minLength={6} />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-11">
                      {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando...</>) : `Entrar como ${tab === "aluno" ? "Aluno" : "Gestor"}`}
                    </Button>
                  </form>
                  <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <p>Credenciais demo: <strong>{tab}@lumina.com</strong> / <strong>123456</strong>.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Voltar para <Link to="/" className="text-accent hover:underline font-medium">página inicial</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
