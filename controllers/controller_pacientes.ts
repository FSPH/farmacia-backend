import Database, { iDatabase } from '../connections/dbconn.js';
import Pacientes from '../model/dao_pacientes.js';
import type { Request, Response } from 'express';
import type { iresdata } from './interface_controllers.js';
import GravarLog from '../utils/gravarLogsError.js';

export default class Controller_Pacientes {
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

            const q = String(req.query.q || req.params.q || '*').trim();
            const limit = Number(req.query.limit || 20);
            const pacientes = new Pacientes(db.connection);

            resdata.data = await pacientes.Listar(q, limit);
        } catch (error: any) {
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? 'Erro desconhecido' : error.message;

            if (resdata.status === 500) {
                GravarLog(`Controller Pacientes - Erro inesperado: ${error.stack}`);
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

            const pacienteId = Number(req.params.paciente_id || req.params.id || 0);

            if (!pacienteId) {
                const error = new Error('Paciente não informado.') as any;
                error.statusCode = 400;
                throw error;
            }

            const pacientes = new Pacientes(db.connection);
            const paciente = await pacientes.BuscarPorId(pacienteId);

            if (!paciente) {
                const error = new Error('Paciente não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            resdata.data = paciente;
        } catch (error: any) {
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? 'Erro desconhecido' : error.message;

            if (resdata.status === 500) {
                GravarLog(`Controller Pacientes - Erro inesperado: ${error.stack}`);
            }
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }
}
