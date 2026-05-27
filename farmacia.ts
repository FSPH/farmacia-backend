import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import routes_locais from './routes/routes_locais.js';
import routes_boname from './routes/routes_boname.js';
import routes_depositos from './routes/routes_depositos.js';
import routes_tipos_produtos from './routes/routes_tipos_materias.js';
import routes_diagnosticos from './routes/routes_diagnosticos.js';
import routes_medicamentos from './routes/routes_medicamentos.js';
import routes_requisicoes from './routes/routes_requisicoes.js';
import {globalErrorHandler} from './utils/ErrorMiddleware.js';
import routes_entradas from './routes/routes_entradas.js';
import routes_estoque from './routes/routes_estoque.js';
import routes_pacientes from './routes/routes_pacientes.js';
import routes_tipos_requisicoes from './routes/routes_tipos_requisicoes.js';
import routes_inventarios from './routes/routes_inventarios.js';
import authMiddleware from './middleware/auth.js';
import { config } from 'dotenv';

declare global {
  interface Error {
    statusCode?: number;
  }
}

config({path:'../.env'})

const app = express();
const port : number = Number(process.env.PORT || 3000);

console.clear();

app.use(express.json({
    limit: '5mb',
    type: 'application/json'
}));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(authMiddleware);

/*****************************************************
* Rotas dos parametros do aplicativo
******************************************************/
app.use('/parametros/locais',routes_locais);
app.use('/parametros/boname',routes_boname);
app.use('/parametros/depositos',routes_depositos);
app.use('/parametros/tipos_produtos',routes_tipos_produtos);
app.use('/parametros/diagnosticos', routes_diagnosticos);
app.use('/parametros/medicamentos', routes_medicamentos);
app.use('/parametros/tipos_requisicoes', routes_tipos_requisicoes);
app.use('/requisicoes', routes_requisicoes);
app.use('/entradas', routes_entradas);
app.use('/estoque', routes_estoque);
app.use('/inventarios', routes_inventarios);
app.use('/pacientes', routes_pacientes);

app.use('/api/locais', routes_locais);
app.use('/api/boname', routes_boname);
app.use('/api/depositos', routes_depositos);
app.use('/api/tipos-medicamentos', routes_tipos_produtos);
app.use('/api/diagnosticos', routes_diagnosticos);
app.use('/api/medicamentos', routes_medicamentos);
app.use('/api/tipos-requisicoes', routes_tipos_requisicoes);
app.use('/api/requisicoes', routes_requisicoes);
app.use('/api/entradas', routes_entradas);
app.use('/api/estoque', routes_estoque);
app.use('/api/inventarios', routes_inventarios);
app.use('/api/pacientes', routes_pacientes);

app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`Server is running TS on port ${port}`);
});
