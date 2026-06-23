import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, BookOpen, TrendingUp, Bell, LogOut, Menu, X, Users, Megaphone, FileText, Newspaper, History, GraduationCap, Landmark, Dumbbell, UserRound, Settings, BarChart3, UserRoundCog } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useAuth, type AppRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { countUnreadCommunications } from "@/services/communications";

const studentNav = [
  { to: "/aluno/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { to: "/aluno/agenda", label: "Minhas aulas", icon: CalendarDays },
  { to: "/aluno/materiais", label: "Materiais", icon: BookOpen },
  { to: "/aluno/exercicios", label: "Exercícios", icon: Dumbbell },
  { to: "/aluno/progresso", label: "Progresso", icon: TrendingUp },
  { to: "/aluno/blog", label: "Blog", icon: Newspaper },
  { to: "/aluno/comunicacoes", label: "Mensagens", icon: Bell },
  { to: "/aluno/perfil", label: "Perfil", icon: UserRound },
];

const managerNav = [
  { to: "/gestor/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { to: "/gestor/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/gestor/alunos", label: "Alunos", icon: Users },
  { to: "/gestor/professores", label: "Professores", icon: UserRoundCog },
  { to: "/gestor/turmas", label: "Turmas", icon: Users },
  { to: "/gestor/cursos", label: "Cursos", icon: GraduationCap },
  { to: "/gestor/materiais", label: "Materiais", icon: BookOpen },
  { to: "/gestor/comunicacoes", label: "Mensagens", icon: Megaphone },
  { to: "/gestor/financeiro", label: "Financeiro", icon: Landmark },
  { to: "/gestor/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/gestor/historico", label: "Histórico", icon: History },
  { to: "/gestor/blog", label: "Blog", icon: Newspaper },
  { to: "/gestor/conteudo", label: "Conteúdo", icon: FileText },
  { to: "/gestor/configuracoes", label: "Configurações", icon: Settings },
];

interface DashboardLayoutProps {
  role: AppRole;
}

export const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const nav = role === "gestor" ? managerNav : studentNav;
  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();
  const roleLabel = role === "gestor" ? "Gestor" : "Aluno";

  useEffect(() => {
    const updateUnread = () => setUnread(countUnreadCommunications(role === "gestor" ? "gestor" : user?.id ?? null));
    updateUnread();
    const handleStorage = () => updateUnread();
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(updateUnread, 2000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [user, role]);

  const onLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-border bg-card flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border"><Logo /></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Navegação do painel">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-primary")}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-1 mb-3">
              <div className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={onLogout}><LogOut className="h-4 w-4 mr-2" /> Sair</Button>
        </div>
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-foreground/40" onClick={() => setOpen(false)}>
          <aside className="w-72 max-w-[85%] h-full bg-card flex flex-col" onClick={(event) => event.stopPropagation()}>
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <Logo />
              <button onClick={() => setOpen(false)} className="p-2 -mr-2" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                  <Icon className="h-4 w-4" /> {label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-border"><Button variant="ghost" size="sm" className="w-full justify-start" onClick={onLogout}><LogOut className="h-4 w-4 mr-2" /> Sair</Button></div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-background/85 backdrop-blur border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 text-primary" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
            <span className="text-sm font-medium text-muted-foreground">Portal {roleLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Notificações" className="relative">
              <Link to={role === "gestor" ? "/gestor/historico" : "/aluno/comunicacoes"}>
                <Bell className="h-5 w-5" />
                {unread > 0 && <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-accent text-accent-foreground border-2 border-background text-[10px]">{unread > 9 ? "9+" : unread}</Badge>}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold" aria-label="Menu do usuário">{initials}</button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-xs text-muted-foreground">Logado como</div>
                  <div className="text-sm font-medium truncate max-w-[200px]">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")}>Site público</DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}><LogOut className="h-4 w-4 mr-2" /> Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
