import { Request, Response } from 'express';
import Database, { iDatabase } from '../connections/dbconn.js';
import Service_Inventarios from '../services/service_inventarios.js';
import { iresdata } from './interface_controllers.js';
import { assignControllerError, safeDisconnect, safeRollback } from './controller_helpers.js';

export default class Controller_Inventarios {

    static async Listar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: null,
        };

        try {

            await db.Connect();

            const mes_ref = Number(req.params.mes_ref || 0) || undefined;
            const ano_ref = Number(req.params.ano_ref || 0) || undefined;
            const dep_id = Number(req.query.dep_id || 0) || undefined;
            const med_tipo_codigo = req.query.med_tipo_codigo
                ? String(req.query.med_tipo_codigo).trim().toUpperCase()
                : undefined;
            const statusParam = req.query.status;
            const status = statusParam === undefined
                ? undefined
                : Number(statusParam) as 0 | 1;

            if (mes_ref !== undefined && (mes_ref < 1 || mes_ref > 12)) {
                const error = new Error('Mês de referência inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            if (ano_ref !== undefined && ano_ref < 2000) {
                const error = new Error('Ano de referência inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            if (dep_id !== undefined && dep_id <= 0) {
                const error = new Error('Depósito inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            if (status !== undefined && status !== 0 && status !== 1) {
                const error = new Error('Status inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            resdata.data = await Service_Inventarios.Listar(db.connection, {
                mes_ref,
                ano_ref,
                dep_id,
                med_tipo_codigo,
                status,
            });

        } catch (error: any) {
            assignControllerError(resdata, error, 'Controller Inventarios');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }

    static async Criar(req: Request, res: Response) {

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

            const inv_date = new Date(req.body.inv_date);
            const inv_dep_id = Number(req.body.inv_dep_id || 0);
            const inv_med_tipo_codigo = req.body.inv_med_tipo_codigo
                ? String(req.body.inv_med_tipo_codigo).trim().toUpperCase()
                : '';
            const inv_mes_ref = Number(req.body.inv_mes_ref || inv_date.getMonth() + 1);
            const inv_ano_ref = Number(req.body.inv_ano_ref || inv_date.getFullYear());

            if (isNaN(inv_date.getTime())) {
                const error = new Error('Data do inventário inválida.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            if (!inv_dep_id || inv_dep_id <= 0) {
                const error = new Error('Depósito é obrigatório.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            if (!inv_med_tipo_codigo) {
                const error = new Error('Tipo de medicamento é obrigatório.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            if (inv_mes_ref < 1 || inv_mes_ref > 12) {
                const error = new Error('Mês de referência inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            if (inv_ano_ref < 2000) {
                const error = new Error('Ano de referência inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            resdata.data = await Service_Inventarios.Criar(db.connection, {
                inv_date,
                inv_dep_id,
                inv_med_tipo_codigo,
                inv_mes_ref,
                inv_ano_ref,
            });

            await db.Commit();

            resdata.msg = 'Inventário criado com sucesso.';

        } catch (error: any) {
            await safeRollback(db);
            assignControllerError(resdata, error, 'Controller Inventarios');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }

    static async ListarItens(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: null,
        };

        try {

            await db.Connect();

            const inv_id = Number(req.params.inv_id || 0);

            if (!inv_id || inv_id <= 0) {
                const error = new Error('Inventário inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            resdata.data = await Service_Inventarios.ListarItens(db.connection, inv_id);

        } catch (error: any) {
            assignControllerError(resdata, error, 'Controller Inventarios');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }

    static async AtualizarContagem(req: Request, res: Response) {

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

            const iti_id = Number(req.params.iti_id || 0);
            const iti_qtde_invent = Number(req.body.iti_qtde_invent);

            if (!iti_id || iti_id <= 0) {
                const error = new Error('Item de inventário inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            if (!Number.isFinite(iti_qtde_invent) || iti_qtde_invent < 0) {
                const error = new Error('Contagem informada é inválida.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            resdata.data = await Service_Inventarios.AtualizarContagem(db.connection, {
                iti_id,
                iti_qtde_invent,
            });

            await db.Commit();

            resdata.msg = 'Contagem atualizada com sucesso.';

        } catch (error: any) {
            await safeRollback(db);
            assignControllerError(resdata, error, 'Controller Inventarios');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }

    static async Fechar(req: Request, res: Response) {

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

            const inv_id = Number(req.params.inv_id || 0);

            if (!inv_id || inv_id <= 0) {
                const error = new Error('Inventário inválido.') as Error & { statusCode?: number };
                error.statusCode = 400;
                throw error;
            }

            resdata.data = await Service_Inventarios.Fechar(db.connection, inv_id);

            await db.Commit();

            resdata.msg = 'Inventário fechado com sucesso.';

        } catch (error: any) {
            await safeRollback(db);
            assignControllerError(resdata, error, 'Controller Inventarios');
        } finally {
            await safeDisconnect(db);
        }

        return res.status(resdata.status).json(resdata);
    }
}
