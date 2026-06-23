import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearDemoSession, loadDemoSession, tryDemoLogin, type DemoUser } from "@/services/demoAuth";

export type AppRole = "aluno" | "gestor";

interface AuthContextValue {
  user: DemoUser | null;
  session: null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<null>(null);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demo = loadDemoSession();
    setSession(null);
    setUser(demo?.user ?? null);
    setRole(demo?.role ?? null);
    setLoading(false);
  }, []);

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const demo = tryDemoLogin(email, password);
    if (demo) {
      setSession(null);
      setUser(demo.user);
      setRole(demo.role);
      return { error: null };
    }

    return { error: "Credenciais demo: gestor@lumina.com ou aluno@lumina.com com senha 123456." };
  };

  const signUp: AuthContextValue["signUp"] = async () => ({
    error: "Cadastro desativado na demonstração. Use uma das credenciais disponíveis na tela de login.",
  });

  const signOut = async () => {
    clearDemoSession();
    setSession(null);
    setUser(null);
    setRole(null);
  };

  return <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
