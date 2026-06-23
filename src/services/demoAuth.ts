import type { AppRole } from "@/context/AuthContext";

const DEMO_SESSION_KEY = "lumina:demo-session";

type DemoSeedUser = {
  id: string;
  email: string;
  password: string;
  role: AppRole;
  fullName: string;
};

export type DemoUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    role: AppRole;
  };
};

type DemoSessionRecord = {
  user: DemoUser;
  role: AppRole;
};

const DEMO_USERS: DemoSeedUser[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "aluno@lumina.com",
    password: "123456",
    role: "aluno",
    fullName: "Aluno Demo",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "gestor@lumina.com",
    password: "123456",
    role: "gestor",
    fullName: "Gestor Demo",
  },
];

const buildDemoUser = (record: DemoSeedUser): DemoUser => ({
    id: record.id,
    email: record.email,
    user_metadata: { full_name: record.fullName, role: record.role },
  });

export const tryDemoLogin = (email: string, password: string): DemoSessionRecord | null => {
  const match = DEMO_USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
  );
  if (!match) return null;

  const session = {
    user: buildDemoUser(match),
    role: match.role,
  };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const loadDemoSession = (): DemoSessionRecord | null => {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoSessionRecord;
    const source = DEMO_USERS.find(
      (item) => item.id === parsed.user?.id && item.email === parsed.user?.email && item.role === parsed.role,
    );
    if (!source) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      return null;
    }
    return { user: buildDemoUser(source), role: source.role };
  } catch {
    localStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }
};

export const clearDemoSession = () => {
  localStorage.removeItem(DEMO_SESSION_KEY);
};

export const isDemoUser = (user: Pick<DemoUser, "id" | "email"> | null | undefined) =>
  !!user && DEMO_USERS.some((item) => item.id === user.id || item.email === user.email);
