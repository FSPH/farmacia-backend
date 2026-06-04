# Backend - Farmácia Ambulatorial

REGRA OBRIGATÓRIA CONTEXT7:

Antes de criar, modificar, corrigir ou refatorar qualquer código backend:

1. Consultar Context7
2. Consultar MCP farmacia
3. Implementar

Bibliotecas obrigatórias para consulta:
- Node.js
- Express
- Fastify
- Knex
- JWT
- Zod
- Jest

# Regra obrigatorio para documentação da API:
- Ao criar, modificar ou excluir uma rota, atualizar o arquivo farmacia/swagger.md atravez do        script swagger/swagger-docs.js

# Uso Obrigatório
- Não utilizar memória interna quando houver documentação disponível no Context7 e atualiza o 
  repositorio memories no github. Priorizar sempre a documentação mais recente.

Responsável:
Ana Carolina

Objetivo:
Implementar:
- Aplicar a skill express-rest-api da pasta farmacia/backend/.agents/skills/express-rest-api
- APIs REST 
- regras de estoque
- inventários
- requisições
- autenticação
- relatórios

Padrões:
- controller fino
- service com regra
- repository/query separado
- transactions
- tratamento global de erros

Banco:
- fsph_farmacia leitura/escrita
- fsph_ambulatorio somente leitura