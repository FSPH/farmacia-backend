import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const backendRoot = path.resolve(__dirname, '..');
const appEntryPath = path.resolve(backendRoot, 'farmacia.ts');
const openApiPath = path.resolve(__dirname, 'openapi.json');
const markdownPath = path.resolve(projectRoot, 'swagger.md');
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const REQUEST_BODY_SCHEMAS = {
  'POST /parametros/boname/salvar': {
    componentName: 'BonameSalvarPayload',
    description: 'Payload para criar ou atualizar um Boname.',
    required: ['bona_codigo', 'bona_descr', 'bona_qt_ui', 'bona_diag_id', 'bona_ativo'],
    properties: {
      bona_id: { type: 'integer', example: 0, description: 'ID do Boname. Use 0 para criar um novo registro.' },
      bona_codigo: { type: 'string', example: 'ABC123', description: 'Codigo do Boname.' },
      bona_descr: { type: 'string', example: 'MEDICAMENTO EXEMPLO', description: 'Descricao do Boname.' },
      bona_qt_ui: { type: 'integer', example: 30, description: 'Quantidade por unidade.' },
      bona_diag_id: { type: 'integer', example: 12, description: 'ID do diagnostico relacionado.' },
      bona_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/depositos/salvar': {
    componentName: 'DepositosSalvarPayload',
    description: 'Payload para atualizar um deposito.',
    required: ['depo_id', 'depo_descr', 'depo_ativo'],
    properties: {
      depo_id: { type: 'integer', example: 1, description: 'ID do deposito.' },
      depo_descr: { type: 'string', example: 'FARMACIA CENTRAL', description: 'Descricao do deposito.' },
      depo_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/diagnosticos/salvar': {
    componentName: 'DiagnosticosSalvarPayload',
    description: 'Payload para criar ou atualizar um diagnostico.',
    required: ['diag_descr', 'diag_ativo'],
    properties: {
      diag_id: { type: 'integer', example: 0, description: 'ID do diagnostico. Use 0 para criar um novo registro.' },
      diag_descr: { type: 'string', example: 'DIAGNOSTICO EXEMPLO', description: 'Descricao do diagnostico.' },
      diag_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/locais/salvar': {
    componentName: 'LocaisSalvarPayload',
    description: 'Payload para atualizar um local.',
    required: ['local_id', 'local_descr', 'local_ativo'],
    properties: {
      local_id: { type: 'integer', example: 10, description: 'ID do local.' },
      local_descr: { type: 'string', example: 'AMBULATORIO', description: 'Descricao do local.' },
      local_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/medicamentos/salvar': {
    componentName: 'MedicamentosSalvarPayload',
    description: 'Payload para atualizar um medicamento.',
    required: ['med_id', 'med_descr', 'med_descr_coml', 'med_und', 'med_tipo_codigo', 'med_tipo_med', 'med_max', 'med_min', 'med_ui_cx', 'med_bona_codigo', 'med_alert', 'med_diag_id', 'med_ativo'],
    properties: {
      med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
      med_descr: { type: 'string', example: 'MEDICAMENTO EXEMPLO', description: 'Descricao principal do medicamento.' },
      med_descr_coml: { type: 'string', example: 'NOME COMERCIAL', description: 'Descricao comercial.' },
      med_und: { type: 'string', example: 'CX', description: 'Unidade de medida.' },
      med_tipo_codigo: { type: 'string', example: 'ORAL', description: 'Codigo do tipo de medicamento.' },
      med_tipo_med: { type: 'string', example: 'CONTROLADO', description: 'Categoria ou tipo do medicamento.' },
      med_max: { type: 'number', example: 100, description: 'Estoque maximo sugerido.' },
      med_min: { type: 'number', example: 10, description: 'Estoque minimo sugerido.' },
      med_ui_cx: { type: 'number', example: 20, description: 'Unidades internas por caixa.' },
      med_bona_codigo: { type: 'string', example: 'ABC123', description: 'Codigo Boname relacionado.' },
      med_alert: { type: 'integer', example: 1, description: 'Indicador de alerta do medicamento.' },
      med_diag_id: { type: 'integer', example: 12, description: 'ID do diagnostico relacionado.' },
      med_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/tipos_produtos/salvar': {
    componentName: 'TiposProdutosSalvarPayload',
    description: 'Payload para atualizar um tipo de produto.',
    required: ['tipo_id', 'tipo_codigo', 'tipo_descr', 'tipo_ativo'],
    properties: {
      tipo_id: { type: 'integer', example: 1, description: 'ID do tipo de produto.' },
      tipo_codigo: { type: 'string', example: 'ORAL', description: 'Codigo do tipo de produto.' },
      tipo_descr: { type: 'string', example: 'MEDICAMENTO ORAL', description: 'Descricao do tipo de produto.' },
      tipo_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /entradas/salvar': {
    componentName: 'EntradasSalvarPayload',
    description: 'Payload para salvar uma entrada de estoque.',
    required: ['ent_date', 'ent_med_id', 'ent_lote', 'ent_qtde', 'ent_doc', 'ent_fornecido_por'],
    properties: {
      ent_date: { type: 'string', format: 'date-time', example: '2026-06-03T10:00:00.000Z', description: 'Data da entrada.' },
      ent_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
      ent_lote: { type: 'string', example: 'LOTE-001', description: 'Lote da entrada.' },
      ent_qtde: { type: 'number', example: 150, description: 'Quantidade recebida.' },
      ent_doc: { type: 'string', example: 'NF-12345', description: 'Documento fiscal ou referencia da entrada.' },
      ent_fornecido_por: { type: 'string', example: 'FORNECEDOR XYZ', description: 'Nome do fornecedor.' },
    },
  },
  'POST /requisicoes/salvar': {
    componentName: 'RequisicoesSalvarPayload',
    description: 'Payload para salvar uma requisicao de medicamento.',
    required: ['req_id', 'req_data', 'req_med_id', 'req_pac_id', 'req_qtde', 'req_lote', 'req_val_mes', 'req_val_ano', 'req_dep_id', 'req_local_id', 'req_tipo'],
    properties: {
      req_id: { type: 'integer', example: 1001, description: 'ID da requisicao.' },
      req_data: { type: 'string', format: 'date-time', example: '2026-06-03T10:00:00.000Z', description: 'Data da requisicao.' },
      req_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
      req_pac_id: { type: 'integer', example: 5001, description: 'ID do paciente.' },
      req_qtde: { type: 'number', example: 2, description: 'Quantidade requisitada.' },
      req_lote: { type: 'string', example: 'LOTE-001', description: 'Lote do item requisitado.' },
      req_val_mes: { type: 'integer', example: 12, description: 'Mes de validade do lote.' },
      req_val_ano: { type: 'integer', example: 2027, description: 'Ano de validade do lote.' },
      req_dep_id: { type: 'integer', example: 2, description: 'ID do deposito.' },
      req_local_id: { type: 'integer', example: 10, description: 'ID do local solicitante.' },
      req_tipo: { type: 'string', example: 'NORMAL', description: 'Tipo da requisicao.' },
    },
  },
};

function normalizeExpressPath(routePath) {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/+$/g, '') || '/';
}

function extractPathParams(routePath) {
  const params = new Set();
  const regex = /:([A-Za-z0-9_]+)/g;
  let match = regex.exec(routePath);

  while (match) {
    params.add(match[1]);
    match = regex.exec(routePath);
  }

  return [...params].map((name) => ({
    name,
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: `Parametro de rota ${name}.`,
  }));
}

function inferTag(fullPath) {
  const [, firstSegment, secondSegment] = fullPath.split('/');

  if (firstSegment === 'parametros' && secondSegment) {
    return secondSegment.replace(/_/g, ' ');
  }

  return (firstSegment || 'outros').replace(/_/g, ' ');
}

function toTitleCase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferSummary(method, fullPath) {
  const label = fullPath
    .replace(/\{[^}]+\}/g, '')
    .split('/')
    .filter(Boolean)
    .join(' ')
    .replace(/_/g, ' ')
    .trim();

  return `${method.toUpperCase()} ${label || 'raiz'}`;
}

function buildOperation({ method, routePath, fullPath }) {
  const requestBodySchema = REQUEST_BODY_SCHEMAS[`${method.toUpperCase()} ${fullPath}`];
  const operation = {
    tags: [toTitleCase(inferTag(fullPath))],
    summary: inferSummary(method, fullPath),
    parameters: [
      ...extractPathParams(routePath),
      {
        name: 'Authorization',
        in: 'header',
        required: false,
        schema: { type: 'string' },
        description: 'Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente.',
      },
    ],
    responses: {
      '200': {
        description: 'Sucesso',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiResponse' },
          },
        },
      },
      '400': {
        description: 'Requisicao invalida',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      '401': {
        description: 'Nao autenticado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      '404': {
        description: 'Recurso nao encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      '500': {
        description: 'Erro interno',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  };

  if (['post', 'put', 'patch'].includes(method)) {
    operation.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: requestBodySchema
            ? { $ref: `#/components/schemas/${requestBodySchema.componentName}` }
            : {
                type: 'object',
                additionalProperties: true,
              },
          },
        },
      };
  }

  return operation;
}

function parseRoutesFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const endpoints = [];
  const regex = /router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g;

  let match = regex.exec(content);
  while (match) {
    endpoints.push({
      method: match[1].toLowerCase(),
      routePath: match[2],
    });
    match = regex.exec(content);
  }

  return endpoints;
}

function parseRouteMounts() {
  const content = fs.readFileSync(appEntryPath, 'utf8');
  const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\/routes\/[^'"]+)['"];?/g;
  const mountRegex = /app\.use\(\s*['"]([^'"]+)['"]\s*,\s*([A-Za-z0-9_]+)\s*\);/g;
  const importMap = new Map();
  const mounts = [];

  let importMatch = importRegex.exec(content);
  while (importMatch) {
    const variableName = importMatch[1];
    const relativeImportPath = importMatch[2].replace(/\.js$/, '.ts');
    importMap.set(variableName, path.resolve(backendRoot, relativeImportPath));
    importMatch = importRegex.exec(content);
  }

  let mountMatch = mountRegex.exec(content);
  while (mountMatch) {
    const mountPath = mountMatch[1];
    const variableName = mountMatch[2];
    const routeFilePath = importMap.get(variableName);

    if (routeFilePath && fs.existsSync(routeFilePath)) {
      mounts.push({
        mountPath,
        routeFilePath,
      });
    }

    mountMatch = mountRegex.exec(content);
  }

  return mounts;
}

function buildOpenApiSpec() {
  const mounts = parseRouteMounts();
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Farmacia Ambulatorial API',
      version: '1.0.0',
      description: 'Especificacao gerada automaticamente a partir das rotas Express do projeto farmacia.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Ambiente local' },
    ],
    paths: {},
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            err: { type: 'integer', example: 0 },
            msg: { type: 'string', example: 'OK' },
            status: { type: 'integer', example: 200 },
            data: {
              oneOf: [
                { type: 'array', items: { type: 'object', additionalProperties: true } },
                { type: 'object', additionalProperties: true },
                { type: 'null' },
              ],
            },
          },
          required: ['err', 'msg', 'status', 'data'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            err: { type: 'integer', example: 500 },
            msg: { type: 'string', example: 'Erro interno do servidor.' },
            status: { type: 'integer', example: 500 },
            data: {
              oneOf: [
                { type: 'array', items: { type: 'object', additionalProperties: true } },
                { type: 'object', additionalProperties: true },
                { type: 'null' },
              ],
            },
          },
          required: ['err', 'msg', 'status', 'data'],
        },
        ...Object.fromEntries(
          Object.values(REQUEST_BODY_SCHEMAS).map((schema) => [
            schema.componentName,
            {
              type: 'object',
              description: schema.description,
              properties: schema.properties,
              required: schema.required,
            },
          ]),
        ),
      },
    },
  };

  for (const mount of mounts) {
    const endpoints = parseRoutesFile(mount.routeFilePath);

    for (const endpoint of endpoints) {
      if (!HTTP_METHODS.includes(endpoint.method)) {
        continue;
      }

      const fullPath = normalizeExpressPath(`${mount.mountPath}${endpoint.routePath}`);
      if (!spec.paths[fullPath]) {
        spec.paths[fullPath] = {};
      }

      spec.paths[fullPath][endpoint.method] = buildOperation({
        method: endpoint.method,
        routePath: endpoint.routePath,
        fullPath,
      });
    }
  }

  return spec;
}

function renderParameterTable(parameters) {
  if (!parameters.length) {
    return '- Nenhum parametro documentado.\n';
  }

  const header = [
    '| Nome | Local | Obrigatorio | Tipo | Descricao |',
    '| --- | --- | --- | --- | --- |',
  ];

  const rows = parameters.map((parameter) => {
    const schemaType = parameter.schema?.type || 'object';
    return `| ${parameter.name} | ${parameter.in} | ${parameter.required ? 'sim' : 'nao'} | ${schemaType} | ${parameter.description || ''} |`;
  });

  return `${header.concat(rows).join('\n')}\n`;
}

function renderResponses(responses) {
  const header = [
    '| Status | Descricao |',
    '| --- | --- |',
  ];

  const rows = Object.entries(responses).map(([status, config]) => `| ${status} | ${config.description} |`);
  return `${header.concat(rows).join('\n')}\n`;
}

function resolveSchemaFromRef(spec, schemaRef) {
  const schemaName = String(schemaRef || '').replace('#/components/schemas/', '');
  return spec.components?.schemas?.[schemaName] || null;
}

function renderSchemaTable(schema) {
  if (!schema?.properties) {
    return '- Schema nao detalhado.\n';
  }

  const required = new Set(schema.required || []);
  const header = [
    '| Campo | Tipo | Obrigatorio | Descricao |',
    '| --- | --- | --- | --- |',
  ];

  const rows = Object.entries(schema.properties).map(([fieldName, config]) => {
    const type = config.type || (config.enum ? 'enum' : 'object');
    const suffix = config.enum ? ` (${config.enum.join(', ')})` : '';
    return `| ${fieldName} | ${type}${suffix} | ${required.has(fieldName) ? 'sim' : 'nao'} | ${config.description || ''} |`;
  });

  return `${header.concat(rows).join('\n')}\n`;
}

function renderSchemaBulletList(schema) {
  if (!schema?.properties) {
    return '- Schema nao detalhado.\n';
  }

  const required = new Set(schema.required || []);

  return `${Object.entries(schema.properties)
    .map(([fieldName, config]) => {
      const type = config.type || (config.enum ? 'enum' : 'object');
      const enumSuffix = config.enum ? ` (${config.enum.join(', ')})` : '';
      const requiredLabel = required.has(fieldName) ? 'obrigatorio' : 'opcional';
      return `- \`${fieldName}\`: ${type}${enumSuffix}, ${requiredLabel}. ${config.description || ''}`.trim();
    })
    .join('\n')}\n`;
}

function renderMarkdown(spec) {
  const lines = [
    '# Swagger - Farmacia Ambulatorial',
    '',
    'Documentacao gerada automaticamente a partir das rotas Express do backend.',
    '',
    `- Gerado em: ${new Date().toISOString()}`,
    `- OpenAPI: ${spec.openapi}`,
    '',
    '## Visao Geral',
    '',
    `- Titulo: ${spec.info.title}`,
    `- Versao: ${spec.info.version}`,
    `- Base URL local: ${spec.servers[0]?.url || 'http://localhost:3000'}`,
    '- Autenticacao: header `Authorization: Bearer <token>` quando a autenticacao estiver habilitada.',
    '',
    '## Endpoints',
    '',
  ];

  const groupedPaths = new Map();

  for (const [apiPath, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const tag = operation.tags?.[0] || 'Outros';
      if (!groupedPaths.has(tag)) {
        groupedPaths.set(tag, []);
      }

      groupedPaths.get(tag).push({ apiPath, method, operation });
    }
  }

  for (const [tag, endpoints] of [...groupedPaths.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`### ${tag}`);
    lines.push('');

    for (const endpoint of endpoints.sort((a, b) => a.apiPath.localeCompare(b.apiPath) || a.method.localeCompare(b.method))) {
      lines.push(`#### ${endpoint.method.toUpperCase()} ${endpoint.apiPath}`);
      lines.push('');
      lines.push(`- Resumo: ${endpoint.operation.summary}`);
      lines.push(`- Request body: ${endpoint.operation.requestBody ? 'sim' : 'nao'}`);
      lines.push('');
      if (endpoint.operation.requestBody) {
        const requestSchema = resolveSchemaFromRef(
          spec,
          endpoint.operation.requestBody.content?.['application/json']?.schema?.$ref,
        );
        lines.push('##### Payload');
        lines.push('');
        lines.push(renderSchemaBulletList(requestSchema).trimEnd());
        lines.push('');
      }
      lines.push('##### Parametros');
      lines.push('');
      lines.push(renderParameterTable(endpoint.operation.parameters || []).trimEnd());
      lines.push('');
      lines.push('##### Respostas');
      lines.push('');
      lines.push(renderResponses(endpoint.operation.responses || {}).trimEnd());
      lines.push('');
    }
  }

  lines.push('## Schemas');
  lines.push('');
  lines.push('### ApiResponse');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(spec.components.schemas.ApiResponse, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('### ErrorResponse');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(spec.components.schemas.ErrorResponse, null, 2));
  lines.push('```');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

export function generateOpenApiSpec() {
  return buildOpenApiSpec();
}

export function generateAndSaveSwaggerDocs() {
  const spec = buildOpenApiSpec();
  const markdown = renderMarkdown(spec);

  fs.writeFileSync(openApiPath, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, markdown, 'utf8');

  return { spec, markdownPath, openApiPath };
}

generateAndSaveSwaggerDocs();
