import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/cursos", label: "Cursos" },
  { to: "/professores", label: "Professores" },
  { to: "/blog", label: "Blog" },
  { to: "/contato", label: "Contato" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const { user, role } = useAuth();
  const dashboardPath = role === "gestor" ? "/gestor/dashboard" : "/aluno/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-muted"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/60"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <Button asChild size="sm" className="shadow-soft">
              <Link to={dashboardPath}><LayoutDashboard className="h-4 w-4 mr-1.5" /> Meu painel</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="shadow-soft">
                <Link to="/cursos">Matricule-se</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-primary hover:bg-muted transition"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container-page py-4 flex flex-col gap-1" aria-label="Navegação móvel">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2.5 rounded-md text-sm font-medium",
                    isActive ? "text-primary bg-muted" : "text-muted-foreground hover:bg-muted/60"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" onClick={() => setOpen(false)}>
                <Link to="/cursos">Matricule-se</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
