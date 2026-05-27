import Database, { iDatabase } from '../connections/dbconn.js';
import Entradas from '../model/dao_entradas.js';
import Medicamentos from '../model/dao_medicamentos.js';
import Estoque from '../model/dao_estoque.js';
import type { iresdata } from './interface_controllers.js';
import type { Request, Response } from 'express';
import GravarLog from '../utils/gravarLogsError.js';

function toDate(value: any): Date {
    return new Date(String(value || ''));
}

export default class Controller_Entradas {
    static async ListarTodos(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: null,
        };

        try {
            await db.Connect();

            const pesq = String(req.query.q || req.params.pesq || '*');
            const data_inicio = toDate(req.query.dataInicio || req.params.data_inicio);
            const data_fim = toDate(req.query.dataFim || req.params.data_fim);

            if (isNaN(data_inicio.getTime())) {
                const error = new Error('Data de início inválida') as any;
                error.statusCode = 400;
                throw error;
            }

            if (isNaN(data_fim.getTime())) {
                const error = new Error('Data de fim inválida') as any;
                error.statusCode = 400;
                throw error;
            }

            if (data_inicio > data_fim) {
                const error = new Error('Data de início deve ser menor que data de fim') as any;
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);
            resdata.data = await entradas.ListarTodos(pesq, data_inicio, data_fim);
        } catch (error: any) {
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? 'Erro desconhecido' : error.message;

            if (resdata.status === 500) {
                GravarLog(`Controller Entradas - Erro inesperado: ${error.stack}`);
            }
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }
    
    static async BuscarPorId(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: null,
        };

        try {
            await db.Connect();

            const ent_id = Number(req.params.ent_id || req.params.id || 0);

            if (!ent_id) {
                const error = new Error('Entrada não informada.') as any;
                error.statusCode = 400;
                throw error;
            }
            
            const entradas = new Entradas(db.connection);
            const medicamentos = new Medicamentos(db.connection);
            const result = await entradas.BuscarPorId(ent_id);

            if (!entradas.found) {
                const error = new Error('Entrada não encontrada') as any;
                error.statusCode = 404;
                throw error;
            }

            await medicamentos.BuscarPorId(entradas.ent_med_id);

            resdata.data = {
                ...result,
                ent_med_descr: medicamentos.found ? medicamentos.med_descr : null,
                ent_med_descr_coml: medicamentos.found ? medicamentos.med_descr_coml : null,
            };
        } catch (error: any) {
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? 'Erro desconhecido' : error.message;

            if (resdata.status === 500) {
                GravarLog(`Controller Entradas - Erro inesperado: ${error.stack}`);
            }
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }

    static async Salvar(req: Request, res: Response) {
        const db: iDatabase = new Database();
        
        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: null,
        };

        try {
            await db.Connect();
            await db.Begin();

            const ent_date = toDate(req.body.ent_date || req.body.data);
            const ent_med_id = Number(req.body.ent_med_id || req.body.medicamentoId || 0);
            const ent_lote = String(req.body.ent_lote || req.body.lote || '').trim().toUpperCase();
            const ent_qtde = Number(req.body.ent_qtde || req.body.quantidade || 0);
            const ent_doc = String(req.body.ent_doc || req.body.documento || '').trim().toUpperCase();
            const ent_fornecido_por = String(req.body.ent_fornecido_por || req.body.fornecedor || '').trim().toUpperCase();
            const ent_dep_id = Number(req.body.ent_dep_id || req.body.est_dep_id || req.body.dep_id || req.body.depositoId || 0);
            const ent_validade = toDate(req.body.ent_validade || req.body.est_validade || req.body.validade);

            if (isNaN(ent_date.getTime())) {
                const error = new Error('Data da entrada é obrigatória.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!ent_med_id) {
                const error = new Error('Medicamento da entrada é obrigatório.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!ent_dep_id) {
                const error = new Error('Depósito da entrada é obrigatório.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!ent_qtde || ent_qtde <= 0) {
                const error = new Error('Quantidade da entrada deve ser maior que zero.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!ent_lote) {
                const error = new Error('Lote da entrada é obrigatório.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!ent_doc) {
                const error = new Error('Documento da entrada é obrigatório.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!ent_fornecido_por) {
                const error = new Error('Fornecedor da entrada é obrigatório.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (isNaN(ent_validade.getTime())) {
                const error = new Error('Validade do lote é obrigatória.') as any;
                error.statusCode = 400;
                throw error;
            }

            const medicamentos = new Medicamentos(db.connection);
            await medicamentos.BuscarPorId(ent_med_id);

            if (!medicamentos.found) {
                const error = new Error('Medicamento não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            const entradas = new Entradas(db.connection);
            entradas.ent_date = ent_date;
            entradas.ent_med_id = ent_med_id;
            entradas.ent_lote = ent_lote;
            entradas.ent_qtde = ent_qtde;
            entradas.ent_doc = ent_doc;
            entradas.ent_fornecido_por = ent_fornecido_por;

            await entradas.Salvar();

            const estoque = new Estoque(db.connection);
            await estoque.BuscarPorItemEstoque(ent_med_id, ent_dep_id, ent_lote, true);

            if (estoque.found) {
                if (estoque.est_validade && String(estoque.est_validade) !== 'Invalid Date') {
                    const validadeAtual = new Date(estoque.est_validade);

                    if (!isNaN(validadeAtual.getTime()) && validadeAtual.toISOString().slice(0, 10) !== ent_validade.toISOString().slice(0, 10)) {
                        const error = new Error('O lote informado já existe no estoque com validade diferente.') as any;
                        error.statusCode = 409;
                        throw error;
                    }
                }

                estoque.est_saldo += ent_qtde;
            } else {
                estoque.est_dep_id = ent_dep_id;
                estoque.est_med_id = ent_med_id;
                estoque.est_lote = ent_lote;
                estoque.est_saldo = ent_qtde;
                estoque.est_validade = ent_validade;
            }

            estoque.est_validade = ent_validade;
            await estoque.Salvar();

            await db.Commit();

            resdata.msg = 'Entrada registrada com sucesso.';
            resdata.data = {
                ent_id: entradas.ent_id,
                estoque: {
                    est_id: estoque.est_id,
                    est_dep_id: estoque.est_dep_id,
                    est_med_id: estoque.est_med_id,
                    est_lote: estoque.est_lote,
                    est_saldo: estoque.est_saldo,
                    est_validade: estoque.est_validade,
                },
            };
        } catch (error: any) {
            await db.Rollback();

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? 'Erro desconhecido' : error.message;
            
            if (resdata.status === 500) {
                GravarLog(`Controller Entradas - Erro inesperado: ${error.stack}`);
            }
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }
}
