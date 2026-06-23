# Lumina English Academy Demo

Aplicação demonstrativa para apresentação comercial de uma escola de inglês fictícia. O projeto reúne site institucional, blog, portal do aluno e painel do gestor.

## Premissas

- Não usa banco de dados ou backend para os fluxos demonstrativos.
- Não envia dados para serviços externos.
- Persiste alterações em `localStorage` e sessões em armazenamento local.
- Todo conteúdo, usuário, professor, curso e dado financeiro é fictício.

## Acesso

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Gestor | `gestor@lumina.com` | `123456` |
| Aluno | `aluno@lumina.com` | `123456` |

## Funcionalidades

### Público

- Home institucional, sobre, cursos, professores e contato.
- Blog com busca, categorias, tags, compartilhamento e artigos relacionados.
- Formulário de contato com validação e registro local.

### Gestor

- Dashboard, alunos, professores, turmas, agenda e cursos.
- Materiais, mensagens, financeiro, relatórios e histórico.
- Blog com rascunho, publicação, destaque, edição, arquivo e exclusão.
- Conteúdo institucional e configurações locais.

### Aluno

- Dashboard, minhas aulas e calendário.
- Materiais, exercícios, progresso e mensagens.
- Blog recomendado e perfil.

## Stack

- React 18, TypeScript e Vite.
- React Router.
- Tailwind CSS e componentes shadcn/ui.
- Recharts.
- Zod.

## Execução

```bash
npm install
npm run dev
```

O Vite informa a URL local disponível no terminal.

## Validação

```bash
npm run typecheck
npm run lint
npm run build
```

## Arquitetura resumida

```text
src/
  components/       componentes compartilhados, layouts e UI
  context/          sessão e autorização por perfil
  mocks/            dados fictícios iniciais
  pages/            áreas pública, aluno e gestor
  services/         persistência e regras locais da demonstração
  types/            contratos compartilhados
```

As rotas privadas são protegidas por perfil. Uma sessão inválida ou adulterada é descartada antes da navegação.
