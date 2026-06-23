import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { SEO } from "@/components/common/SEO";
import {
  loadCommunications,
  markAllCommunicationsAsRead,
  type Communication,
} from "@/services/communications";

const Communications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Communication[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    
    // Carregar comunicações do serviço centralizado
    const communications = loadCommunications();
    
    // Filtrar apenas comunicações para este usuário (broadcast ou direcionado)
    const userCommunications = communications.filter(
      (c) => c.recipientId === null || c.recipientId === user.id
    );
    
    setItems(userCommunications);
    const beforeRead = new Set(userCommunications.filter((communication) => communication.read).map((communication) => communication.id));
    setReadIds(beforeRead);

    // Marcar todos como lidos após carregar
    if (userCommunications.length > 0) {
      markAllCommunicationsAsRead(user.id);
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <SEO title="Comunicações" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Comunicações</h1>
        <p className="text-muted-foreground mt-1">Avisos enviados pela equipe Lumina.</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Bell}
              title="Sem comunicações"
              description="Quando houver avisos, aparecerão aqui."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <Card key={n.id} className={!readIds.has(n.id) && !n.read ? "border-l-4 border-l-accent" : ""}>
              <CardContent className="p-5 flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="font-semibold text-primary">{n.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{n.body}</p>
                  {!readIds.has(n.id) && !n.read && (
                    <Badge variant="default" className="text-xs mt-2 bg-accent">
                      Novo
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Communications;
