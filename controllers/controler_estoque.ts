import Database, { iDatabase } from '../connections/dbconn.js';
import type { Request, Response } from 'express';
import type { iresdata } from './interface_controllers.js';
import Estoque from '../model/dao_estoque.js';
import {
    assignControllerError,
    safeDisconnect,
    safeRollback,
} from './controller_helpers.js';

function parseNumber(value: any): number {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value: any): Date {
    return new Date(String(value || ''));
}

export default class Controller_Estoque {
    static async Listar(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {},
        };

        try {
            await db.Connect();

            const pesq = String(req.query.q || req.params.pesq || '*').trim() || '*';
            const dep_id = parseNumber(req.query.depId || req.params.dep_id);
            const med_id = parseNumber(req.query.medId);
            const med_tipo_codigo = String(req.query.tipoCodigo || req.params.med_tipo_codigo || '').trim().toUpperCase();
            const alerta = String(req.query.alerta || req.query.statusValidade || '').trim().toLowerCase() as 'critico' | 'vencendo' | 'vencido' | '';
            const dias_alerta = parseNumber(req.query.dias || process.env.ALERTA_VENCIMENTO_DIAS || 90) || 90;

            const estoque = new Estoque(db.connection);
            resdata.data = await estoque.ListarAtivos({
                pesq,
                dep_id: dep_id || undefined,
                med_id: med_id || undefined,
                med_tipo_codigo: med_tipo_codigo || undefined,
                alerta,
                dias_alerta,
            });
        } catch (error: any) {
            assignControllerError(resdata, error, 'Controller Estoque');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }

    static async Alertas(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {},
        };

        try {
            await db.Connect();

            const dep_id = parseNumber(req.query.depId);
            const dias_alerta = parseNumber(req.query.dias || process.env.ALERTA_VENCIMENTO_DIAS || 90) || 90;
            const estoque = new Estoque(db.connection);

            resdata.data = {
                criticos: await estoque.ListarAtivos({
                    dep_id: dep_id || undefined,
                    alerta: 'critico',
                }),
                vencendo: await estoque.ListarAtivos({
                    dep_id: dep_id || undefined,
                    alerta: 'vencendo',
                    dias_alerta,
                }),
                vencidos: await estoque.ListarAtivos({
                    dep_id: dep_id || undefined,
                    alerta: 'vencido',
                }),
            };
        } catch (error: any) {
            assignControllerError(resdata, error, 'Controller Estoque');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }

    static async Movimentacao(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {},
        };

        try {
            await db.Connect();

            const med_id = parseNumber(req.params.med_id || req.query.medId);
            const lote = String(req.params.lote || req.query.lote || '').trim().toUpperCase();

            if (!med_id || !lote) {
                const error = new Error('Medicamento e lote são obrigatórios.') as any;
                error.statusCode = 400;
                throw error;
            }

            const estoque = new Estoque(db.connection);
            resdata.data = await estoque.ListarMovimentacao(med_id, lote);
        } catch (error: any) {
            assignControllerError(resdata, error, 'Controller Estoque');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }

    static async Buscar(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {},
        };

        try {
            await db.Connect();

            const med_id = parseNumber(req.params.med_id || req.query.medId);
            const dep_id = parseNumber(req.params.dep_id || req.query.depId);
            const lote = String(req.params.lote || req.query.lote || '').trim().toUpperCase();
            
            if (!med_id || !dep_id || !lote) {
                const error = new Error('Medicamento, depósito e lote são obrigatórios.') as any;
                error.statusCode = 400;
                throw error;
            }
            
            const estoque = new Estoque(db.connection);
            const result = await estoque.BuscarPorItemEstoque(med_id, dep_id, lote);
            
            if (!estoque.found) {
                const error = new Error('Item de estoque não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            resdata.data = result;
        } catch (error: any) {
            assignControllerError(resdata, error, 'Controller Estoque');
        } finally {
            await safeDisconnect(db);
        }
        
        return res.status(resdata.status).json(resdata);
    }

    static async Salvar(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {},
        };

        try {
            if (process.env.ALLOW_STOCK_DIRECT_WRITE !== 'true') {
                const error = new Error('Ajuste direto de estoque desabilitado. Use os fluxos de entrada, transferência ou inventário.') as any;
                error.statusCode = 403;
                throw error;
            }

            await db.Connect();
            await db.Begin();

            const est_id = parseNumber(req.body.est_id);
            const est_dep_id = parseNumber(req.body.est_dep_id || req.body.dep_id || req.body.depositoId);
            const est_med_id = parseNumber(req.body.est_med_id || req.body.med_id || req.body.medicamentoId);
            const est_lote = String(req.body.est_lote || req.body.lote || '').trim().toUpperCase();
            const est_saldo = Number(req.body.est_saldo ?? req.body.saldo);
            const est_validade = parseDate(req.body.est_validade || req.body.validade);

            if (!est_med_id) {
                const error = new Error('Medicamento não informado.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!est_dep_id) {
                const error = new Error('Depósito não informado.') as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (!est_lote) {
                const error = new Error('Lote não informado.') as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (!Number.isFinite(est_saldo) || est_saldo < 0) {
                const error = new Error('Saldo inválido.') as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (isNaN(est_validade.getTime())) {
                const error = new Error('Validade não informada.') as any;
                error.statusCode = 400;
                throw error;
            }

            const estoque = new Estoque(db.connection);

            if (est_id) {
                await estoque.BuscarPorId(est_id);
            } else {
                await estoque.BuscarPorItemEstoque(est_med_id, est_dep_id, est_lote, true);
            }

            estoque.est_dep_id = est_dep_id;
            estoque.est_med_id = est_med_id;
            estoque.est_lote = est_lote;
            estoque.est_saldo = est_saldo;
            estoque.est_validade = est_validade;
            
            await estoque.Salvar();

            await db.Commit();

            resdata.msg = 'Estoque atualizado com sucesso.';
            resdata.data = {
                est_id: estoque.est_id,
                est_dep_id: estoque.est_dep_id,
                est_med_id: estoque.est_med_id,
                est_lote: estoque.est_lote,
                est_saldo: estoque.est_saldo,
                est_validade: estoque.est_validade,
            };
        } catch (error: any) {
            await safeRollback(db);
            assignControllerError(resdata, error, 'Controller Estoque');
        } finally {
            await safeDisconnect(db);
        }
        
        return res.status(resdata.status).json(resdata);
    }

    static async Transferir(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {},
        };

        try {
            await db.Connect();
            await db.Begin();

            const origem_dep_id = parseNumber(req.body.origem_dep_id || req.body.origemDepositoId);
            const destino_dep_id = parseNumber(req.body.destino_dep_id || req.body.destinoDepositoId);
            const med_id = parseNumber(req.body.est_med_id || req.body.med_id || req.body.medicamentoId);
            const lote = String(req.body.est_lote || req.body.lote || '').trim().toUpperCase();
            const qtde = parseNumber(req.body.qtde || req.body.quantidade);

            if (!origem_dep_id || !destino_dep_id || !med_id || !lote || !qtde) {
                const error = new Error('Origem, destino, medicamento, lote e quantidade são obrigatórios.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (origem_dep_id === destino_dep_id) {
                const error = new Error('Origem e destino devem ser depósitos diferentes.') as any;
                error.statusCode = 400;
                throw error;
            }

            const estoqueOrigem = new Estoque(db.connection);
            await estoqueOrigem.BuscarPorItemEstoque(med_id, origem_dep_id, lote, true);

            if (!estoqueOrigem.found) {
                const error = new Error('Estoque de origem não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (estoqueOrigem.est_saldo < qtde) {
                const error = new Error('Saldo insuficiente no depósito de origem.') as any;
                error.statusCode = 409;
                throw error;
            }

            const estoqueDestino = new Estoque(db.connection);
            await estoqueDestino.BuscarPorItemEstoque(med_id, destino_dep_id, lote, true);

            estoqueOrigem.est_saldo -= qtde;
            await estoqueOrigem.Salvar();

            if (estoqueDestino.found) {
                estoqueDestino.est_saldo += qtde;
            } else {
                estoqueDestino.est_dep_id = destino_dep_id;
                estoqueDestino.est_med_id = med_id;
                estoqueDestino.est_lote = lote;
                estoqueDestino.est_saldo = qtde;
                estoqueDestino.est_validade = estoqueOrigem.est_validade;
            }

            estoqueDestino.est_validade = estoqueOrigem.est_validade;
            await estoqueDestino.Salvar();

            await db.Commit();

            resdata.msg = 'Transferência concluída com sucesso.';
            resdata.data = {
                origem: {
                    deposito_id: estoqueOrigem.est_dep_id,
                    saldo: estoqueOrigem.est_saldo,
                },
                destino: {
                    deposito_id: estoqueDestino.est_dep_id,
                    saldo: estoqueDestino.est_saldo,
                },
            };
        } catch (error: any) {
            await safeRollback(db);
            assignControllerError(resdata, error, 'Controller Estoque');
        } finally {
            await safeDisconnect(db);
        }
        
        return res.status(resdata.status).json(resdata);
    }
}
