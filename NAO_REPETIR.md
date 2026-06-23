# NAO_REPETIR.md

Práticas que não devem ser repetidas.

## Campos não existentes no banco

- contexto: Enviar campos para o Supabase sem verificar se existem na tabela
- ação: courseId foi enviado mas não existe na tabela lessons
- solução: Sempre verificar schema antes de enviar payloads
- referencia: SUCESSOS.md

## Datos sem validação

- contexto: Usar new Date() com strings vazias ou inválidas
- ação: Não validar antes de converter
- solução: Verificar se string é válida antes de criar Date
- referencia: SUCESSOS.md

## Duplicação de funcionalidades

- contexto: Dois locais para criar aulas (Itinerário e Agenda)
- ação: Manter ambas funcionalidades
- solução: Manter apenas Agenda como fonte única
- referencia: SUCESSOS.md