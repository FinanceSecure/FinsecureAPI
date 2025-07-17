# 🧹 Filtros e Validações

Listagem de ***filtros e validações de entrada com dados esperados pela API***

## Cadastro de Usuário

**Endpoint**: `POST /api/usuarios`

*Campos obrigatóroios*:
`email`: texto, obrigatório
`senha`: mínimo de 8 caracteres
`primeiro_nome`: texto, obrigatório
`ultimo_nome`: texto, obrigatório

*Validações*:
>message: `E-mail já cadastrado`
    >status: `409` conflict

___

## Resposta padrão

- `400 Bad Request`: Campos inválidos
- `401 Unautorized`: Token ausente ou inválido
- `403 Forbidden`: Acesso negado devido a falta de permissões
- `404 Not Found`: Recurso não encontrada
- `409 Conflict`: Conflito com dados existentes
- `500 Server-side error`: Erro interno do servidor
