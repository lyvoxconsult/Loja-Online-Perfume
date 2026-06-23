# DECISOES.md

Decisões técnicas importantes tomadas durante o desenvolvimento.

## Estrutura de Dados de Turmas

- contexto: Precisava de gestão de turmas mas banco não tinha tabela
- decisão: Usar localStorage para armazenar turmas
- alternativa: Criar tabela no Supabase
- reason: Desenvolvimento rápido sem dependência de migrações
- referencia: SUCESSOS.md
- tags: turmas,localStorage

## localStorage vs Banco

- contexto: Armazenar dados de turmas
- decisão: localStorage (chave: lumina:classes)
- alternativa: Supabase com tabela classes
- reason: Rapidez no desenvolvimento, dados não críticos
- quando revisar: Migrar para Supabase quando necessário

## Seleção Múltipla de Alunos

- contexto: Criar aula para múltiplos alunos
- decisão: Checkboxes em vez de Select múltiplo (Radix não suporta)
- alternativa: Componente customizado
- reason: Simplicidade e melhor UX
- referencia: SUCESSOS.md

## Menu Consolidado

- contexto: Itinerário e Agenda eram duplicados
- decisão: Manter apenas Agenda
- reason: Evitar confusão e duplicidade
- quando revisar: Manter consolidado

## Campos de Curso na Aula

- contexto: Permitir vincular curso à aula
- decisão: Usar dropdown mas não armazenar courseId no banco (não existe)
- reason: Campo não existe na tabela lessons do Supabase
- referencia: FALHAS.md
- quando revisar: Adicionar campo via migração se necessário