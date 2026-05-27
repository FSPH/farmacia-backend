import Database, { iDatabase } from '../connections/dbconn.js';
import type { Request, Response } from 'express';
import type { iresdata } from './interface_controllers.js';
import Requisicoes from '../model/dao_requisicoes.js';
import Gaucher from '../model/dao_gaucher.js';
import Estoque from '../model/dao_estoque.js';
import Medicamentos from '../model/dao_medicamentos.js';
import Pacientes from '../model/dao_pacientes.js';
import {
    assignControllerError,
    safeDisconnect,
    safeRollback,
} from './controller_helpers.js';

function parseDate(value: any): Date {
    return new Date(String(value || ''));
}

function parseNumber(value: any): number {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getRequestUser(req: Request, explicitUser?: string): string {
    const authName = req.authUser?.name?.trim();

    if (authName) {
        return authName.toUpperCase();
    }

    const fallback = String(explicitUser || '').trim();
    return fallback ? fallback.toUpperCase() : 'INTEGRACAO';
}

export default class Controller_Requisicoes {
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

            const dat_ini = parseDate(req.query.dataInicio || req.params.dat_ini);
            const dat_fim = parseDate(req.query.dataFim || req.params.dat_fim);
            const aprovaRaw = req.query.aprova ?? req.params.aprova;
            const aprova = aprovaRaw === undefined || aprovaRaw === '' ? undefined : parseNumber(aprovaRaw) as 0 | 1;
            const tipo = String(req.query.tipo || req.query.tipoCodigo || '').trim().toUpperCase();

            if (isNaN(dat_ini.getTime()) || isNaN(dat_fim.getTime())) {
                const error = new Error('Datas não informadas corretamente.') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);
            resdata.data = await requisicoes.ListarPorPeriodo(dat_ini, dat_fim, aprova, tipo || undefined);
        } catch (error: any) {
            assignControllerError(resdata, error, 'Controller Requisicoes');
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

            const id = parseNumber(req.params.req_id || req.params.id);

            if (!id) {
                const error = new Error('ID não informado ou inválido.') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);
            const result = await requisicoes.BuscarPorIdDetalhado(id);

            if (!requisicoes.found || !result) {
                const error = new Error('Requisição não encontrada.') as any;
                error.statusCode = 404;
                throw error;
            }
            
            resdata.data = result;
        } catch (error: any) {
            assignControllerError(resdata, error, 'Controller Requisicoes');
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
            await db.Connect();
            await db.Begin();

            const req_id = parseNumber(req.body.req_id);
            const req_date = parseDate(req.body.req_date || req.body.data || new Date());
            const req_med_id = parseNumber(req.body.req_med_id || req.body.medicamentoId);
            const req_pac_id = parseNumber(req.body.req_pac_id || req.body.pacienteId);
            const req_qtde = parseNumber(req.body.req_qtde || req.body.quantidade);
            const req_lote = String(req.body.req_lote || req.body.lote || '').trim().toUpperCase();
            const req_val_mes = parseNumber(req.body.req_val_mes || req.body.mesReferencia || (isNaN(req_date.getTime()) ? 0 : req_date.getMonth() + 1));
            const req_val_ano = parseNumber(req.body.req_val_ano || req.body.anoReferencia || (isNaN(req_date.getTime()) ? 0 : req_date.getFullYear()));
            const req_dep_id = parseNumber(req.body.req_dep_id || req.body.dep_id || req.body.depositoId);
            const req_local_id = parseNumber(req.body.req_local_id || req.body.localId);
            const req_tipo = String(req.body.req_tipo || req.body.tipoCodigo || '').trim().toUpperCase();
            const req_solicitado_por = getRequestUser(req, req.body.req_solicitado_por);

            if (isNaN(req_date.getTime())) {
                const error = new Error('Data não informada ou inválida.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_med_id) {
                const error = new Error('Medicamento não informado.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_qtde || req_qtde <= 0) {
                const error = new Error('Quantidade não informada ou inválida.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_lote) {
                const error = new Error('Lote não informado.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_val_mes || !req_val_ano) {
                const error = new Error('Competência da requisição inválida.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_dep_id) {
                const error = new Error('Depósito não informado.') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_local_id) {
                const error = new Error('Local não informado.') as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (!req_tipo) {
                const error = new Error('Tipo de requisição não informado.') as any;
                error.statusCode = 400;
                throw error;
            }

            const medicamentos = new Medicamentos(db.connection);
            await medicamentos.BuscarPorId(req_med_id);

            if (!medicamentos.found) {
                const error = new Error('Medicamento não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            const estoque = new Estoque(db.connection);
            await estoque.BuscarPorItemEstoque(req_med_id, req_dep_id, req_lote, true);

            if (!estoque.found) {
                const error = new Error('Item de estoque não encontrado para o lote/deposito informado.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (estoque.est_saldo < req_qtde) {
                const error = new Error('Quantidade solicitada maior que o saldo disponível.') as any;
                error.statusCode = 409;
                throw error;
            }

            if (req_pac_id) {
                const pacientes = new Pacientes(db.connection);
                const paciente = await pacientes.BuscarPorId(req_pac_id);

                if (!paciente) {
                    const error = new Error('Paciente não encontrado no ambulatório.') as any;
                    error.statusCode = 404;
                    throw error;
                }

                const gaucher = new Gaucher(db.connection);
                await gaucher.BuscarAtivoPorPaciente(req_pac_id);

                if (gaucher.found && gaucher.gau_med_id && gaucher.gau_med_id !== req_med_id) {
                    const error = new Error('Paciente Gaucher possui vínculo com medicamento diferente do solicitado.') as any;
                    error.statusCode = 409;
                    throw error;
                }
            }

            const requisicoes = new Requisicoes(db.connection);

            if (req_id) {
                await requisicoes.BuscarPorId(req_id);

                if (requisicoes.found && requisicoes.req_aprova === 1) {
                    const error = new Error('Requisição já aprovada não pode ser alterada.') as any;
                    error.statusCode = 409;
                    throw error;
                }
            }

            requisicoes.req_id = req_id;
            requisicoes.req_tipo = req_tipo;
            requisicoes.req_date = req_date;
            requisicoes.req_med_id = req_med_id;
            requisicoes.req_pac_id = req_pac_id;
            requisicoes.req_qtde = req_qtde;
            requisicoes.req_lote = req_lote;
            requisicoes.req_val_mes = req_val_mes;
            requisicoes.req_val_ano = req_val_ano;
            requisicoes.req_dep_id = req_dep_id;
            requisicoes.req_local_id = req_local_id;
            requisicoes.req_aprova = 0;
            requisicoes.req_solicitado_por = req_solicitado_por;
            requisicoes.req_aprovado_por = '';
            
            await requisicoes.Salvar();

            await db.Commit();

            resdata.msg = 'Requisição salva com sucesso.';
            resdata.data = {
                req_id: requisicoes.req_id,
                req_aprova: requisicoes.req_aprova,
                req_solicitado_por: requisicoes.req_solicitado_por,
            };
        } catch (error: any) {
            await safeRollback(db);
            assignControllerError(resdata, error, 'Controller Requisicoes');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }

    static async AprovacaoPorIDRequisicao(req: Request, res: Response) {
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

            const req_id = parseNumber(req.params.req_id || req.params.id);
            const user_aprova = getRequestUser(req, req.body?.user_aprova || req.params.user_aprova);
            
            if (!req_id) {
                const error = new Error('ID da requisição não informado ou inválido.') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);
            const item = await requisicoes.BuscarPorId(req_id);

            if (!requisicoes.found) {
                const error = new Error('Número da requisição não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (requisicoes.req_aprova === 1) {
                const error = new Error('Requisição já foi aprovada anteriormente.') as any;
                error.statusCode = 409;
                throw error;
            }

            const estoque = new Estoque(db.connection);
            await estoque.BuscarPorItemEstoque(item.req_med_id, item.req_dep_id, item.req_lote, true);

            if (!estoque.found) {
                const error = new Error('Item de estoque não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (estoque.est_saldo < item.req_qtde) {
                const error = new Error('Saldo em estoque insuficiente.') as any;
                error.statusCode = 409;
                throw error;
            }

            requisicoes.req_aprova = 1;
            requisicoes.req_aprovado_por = user_aprova;
            await requisicoes.Salvar();

            estoque.est_saldo -= item.req_qtde;
            await estoque.Salvar();
            
            await db.Commit();

            resdata.msg = 'Requisição aprovada com sucesso.';
            resdata.data = {
                req_id: requisicoes.req_id,
                req_aprovado_por: requisicoes.req_aprovado_por,
                saldo_atual: estoque.est_saldo,
            };
        } catch (error: any) {
            await safeRollback(db);
            assignControllerError(resdata, error, 'Controller Requisicoes');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }
}
