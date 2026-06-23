# FALHAS.md

Registro de falhas e erros encontrados durante o desenvolvimento.

## 2025-02-14 - Erro courseId não existe na tabela lessons

- contexto: Ao criar aula via Agenda, retornava erro 400 do Supabase
- ação: Tentativa de enviar campo courseId que não existe na tabela
- resultado: falha
- aprendizado: Verificar schema do banco antes de enviar campos
- aplicar novamente: não - campo courseId removido do payload
- tags: BUG,supabase,agenda

---

## 2025-02-14 - RangeError Invalid time value

- contexto: data inválida ao criar aula com campos de data vazios
- ação: new Date("").toISOString() causava erro
- resultado: falha
- aprendizado: Validar string antes de converter para Date
- aplicar novamente: não - tratar empty strings antes de converter
- tags: BUG,data,agenda