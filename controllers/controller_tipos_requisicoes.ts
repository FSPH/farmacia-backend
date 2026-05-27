import Database, { iDatabase } from '../connections/dbconn.js';
import TiposRequisicoes, { iTiposRequisicoesFields } from '../model/dao_tipos_requisicoes.js';
import type { Request, Response } from 'express';
import type { iresdata } from './interface_controllers.js';
import GravarLog from '../utils/gravarLogsError.js';

export default class Controller_TiposRequisicoes {
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

            const tipos = new TiposRequisicoes(db.connection);
            resdata.data = await tipos.Listar() as iTiposRequisicoesFields[];
        } catch (error: any) {
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? 'Erro desconhecido' : error.message;

            if (resdata.status === 500) {
                GravarLog(`Controller Tipos Requisições - Erro inesperado: ${error.stack}`);
            }
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }

    static async Buscar(req: Request, res: Response) {
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: null,
        };

        try {
            await db.Connect();

            const tip_id = Number(req.params.tip_id || 0);

            if (!tip_id) {
                const error = new Error('Tipo de requisição não informado.') as any;
                error.statusCode = 400;
                throw error;
            }

            const tipos = new TiposRequisicoes(db.connection);
            const data = await tipos.BuscarPorId(tip_id) as iTiposRequisicoesFields;

            if (!tipos.found) {
                const error = new Error('Tipo de requisição não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            resdata.data = data;
        } catch (error: any) {
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? 'Erro desconhecido' : error.message;

            if (resdata.status === 500) {
                GravarLog(`Controller Tipos Requisições - Erro inesperado: ${error.stack}`);
            }
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }
}
