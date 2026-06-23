import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/context/AuthContext";
import { LoadingState } from "@/components/common/LoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: AppRole;
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState label="Verificando sessão..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireRole && role !== requireRole) {
    const target = role === "gestor" ? "/gestor/dashboard" : role === "aluno" ? "/aluno/dashboard" : "/login";
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};
