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

Não utilizar memória interna quando houver documentação disponível no Context7.
Priorizar sempre a documentação mais recente.

Responsável:
Ana Carolina

Objetivo:
Implementar:
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