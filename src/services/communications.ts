/**
 * Serviço centralizado de comunicações
 * Usa localStorage como fonte única de verdade para funcionar em modo demo
 * 
 * IMPORTANTE: Todas as páginas devem usar este serviço para garantir consistência
 */

// Storage key
const STORAGE_KEY = "lumina:communications";

// Interface para comunicado
export interface Communication {
  id: string;
  title: string;
  body: string;
  recipientId: string | null; // null = broadcast para todos
  recipientName: string;
  createdAt: string;
  read: boolean;
}

const readKey = (userId: string) => `lumina:communications:read:${userId}`;
const loadReadIds = (userId: string) => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(readKey(userId)) ?? "[]") as string[]);
  } catch {
    return new Set<string>();
  }
};
const saveReadIds = (userId: string, ids: Set<string>) => {
  localStorage.setItem(readKey(userId), JSON.stringify([...ids]));
};

// Comunicados demo para seed
const seedCommunications: Communication[] = [
  {
    id: "comm-1",
    title: "Bem-vindo ao Lumina English Academy!",
    body: "Olá! Seja muito bem-vindo(a) à nossa escola. Estamos felizes em ter você conosco. Prepare-se para uma jornada de aprendizado incrível!",
    recipientId: null,
    recipientName: "Todos os alunos",
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "comm-2",
    title: "Nova aula disponível: Intermediate Conversation",
    body: "Uma nova aula do curso Intermediate Conversation foi disponibilizada. Acesse seu itinerário para verificar.",
    recipientId: null,
    recipientName: "Todos os alunos",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: "comm-3",
    title: "Dica de estudo: Pratique todos os dias",
    body: "A consistência é a chave para o aprendizado. Reserve pelo menos 15 minutos diários para praticar inglês.",
    recipientId: null,
    recipientName: "Todos os alunos",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    read: false,
  },
];

// Carregar comunicados do localStorage
export const loadCommunications = (): Communication[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Se não existe, salva o seed e retorna
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedCommunications));
      return seedCommunications;
    }
    const parsed = JSON.parse(raw);
    // Garante que é um array
    return Array.isArray(parsed) ? parsed : seedCommunications;
  } catch {
    return seedCommunications;
  }
};

// Salvar comunicados no localStorage
const persistCommunications = (communications: Communication[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(communications));
};

// Criar comunicado
export const createCommunication = (
  title: string,
  body: string,
  recipientId: string | null,
  recipientName: string
): Communication => {
  const communications = loadCommunications();
  const newComm: Communication = {
    id: `comm-${Date.now()}`,
    title,
    body,
    recipientId,
    recipientName,
    createdAt: new Date().toISOString(),
    read: false,
  };
  persistCommunications([newComm, ...communications]);
  return newComm;
};

// Atualizar comunicado
export const updateCommunication = (
  id: string,
  title: string,
  body: string,
  recipientId: string | null,
  recipientName: string
): boolean => {
  const communications = loadCommunications();
  const index = communications.findIndex((c) => c.id === id);
  if (index === -1) return false;

  communications[index] = {
    ...communications[index],
    title,
    body,
    recipientId,
    recipientName,
  };
  persistCommunications(communications);
  return true;
};

// Excluir comunicado - FUNÇÃO CENTRALIZADA
export const deleteCommunication = (id: string): boolean => {
  const communications = loadCommunications();
  const index = communications.findIndex((c) => c.id === id);
  if (index === -1) return false;

  const filtered = communications.filter((c) => c.id !== id);
  persistCommunications(filtered);
  return true;
};

// Buscar comunicado por ID
export const getCommunicationById = (id: string): Communication | null => {
  const communications = loadCommunications();
  return communications.find((c) => c.id === id) ?? null;
};

// Buscar comunicados por recipient (para alunos)
export const getCommunicationsForRecipient = (userId: string | null): Communication[] => {
  const communications = loadCommunications();
  return communications.filter(
    (c) => c.recipientId === null || c.recipientId === userId
  );
};

// Marcar comunicado como lido
export const markCommunicationAsRead = (id: string, userId: string): boolean => {
  if (!loadCommunications().some((communication) => communication.id === id)) return false;
  const readIds = loadReadIds(userId);
  readIds.add(id);
  saveReadIds(userId, readIds);
  return true;
};

// Marcar todos como lidos
export const markAllCommunicationsAsRead = (userId: string | null): void => {
  if (!userId) return;
  const readIds = loadReadIds(userId);
  getCommunicationsForRecipient(userId).forEach((communication) => readIds.add(communication.id));
  saveReadIds(userId, readIds);
};

// Contar não lidos
export const countUnreadCommunications = (userId: string | null): number => {
  if (!userId || userId === "gestor") return 0;
  const readIds = loadReadIds(userId);
  return getCommunicationsForRecipient(userId).filter((communication) => !readIds.has(communication.id)).length;
};

// Limpar todos os comunicados (para testing/reset)
export const clearAllCommunications = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
