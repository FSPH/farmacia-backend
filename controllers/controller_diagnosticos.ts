import Database,{iDatabase} from "../connections/dbconn.js";
import Diagnosticos,{iDiagnosticosFields} from "../model/dao_diagnostigos.js";
import { Request, Response } from "express";
import { iresdata } from "./interface_controllers.js";
import GravarLog from "../utils/gravarLogsError.js";

export default class Controller_Diagnosticos{

    static async Listar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            const pesq : string = String(req.params.pesq || '*');

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            } 

            const diagnosticos = new Diagnosticos(db.connection);

            resdata.data = await diagnosticos.Listar(pesq) as iDiagnosticosFields[]; 
            
        } catch (error: any) {
            
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Boname - Erro inesperado: ${error.stack}`);
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ListarAtivos(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            const pesq : string = String(req.params.pesq || '*');

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            } 

            const diagnosticos = new Diagnosticos(db.connection);

            resdata.data = await diagnosticos.ListarAtivos(pesq) as iDiagnosticosFields[]; 
            
        } catch (error: any) {
            
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Boname - Erro inesperado: ${error.stack}`);
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }


    static async Buscar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            const diag_id : number = Number(req.params.diag_id || 0);

            if (diag_id === 0) {
                const error = new Error('ID Diagnóstico não informado');
                error.statusCode = 400;
                throw error;
            }

            void await db.Connect();

            const diagnosticos = new Diagnosticos(db.connection);

            const dados = await diagnosticos.BuscarPorId(diag_id);

            if (!diagnosticos.found) { 
                const error = new Error('Diagnóstico não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = dados; 
            
        } catch (error: any) {

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Diagnosticos - Erro inesperado: ${error.stack}`);

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        } 

        try {

            void await db.Connect();

            void await db.Begin();

            const diag_id : number = Number(req.body.diag_id || 0);
            const diag_descr : string = String(req.body.diag_descr || '').toLocaleUpperCase();
            const diag_ativo : number = Number(req.body.diag_ativo || 0);

            if (diag_id === 0) {
                const error = new Error('ID Diagnóstico não informado');
                error.statusCode = 400;
                throw error;
            }
            
            if (!diag_descr) {
                const error = new Error('Descrição do diagnóstico não informada');
                error.statusCode = 400;
                throw error;
            }

            if (req.body.diag_ativo === undefined) {
                const error = new Error('Ativo não informado');
                error.statusCode = 400;
                throw error;
            }

            const diagnosticos = new Diagnosticos(db.connection);

            void await diagnosticos.BuscarPorId(diag_id);

            diagnosticos.diag_id = diag_id;
            diagnosticos.diag_descr = diag_descr;
            diagnosticos.diag_ativo = diag_ativo;

            void await diagnosticos.Salvar();

            void await db.Commit();

            resdata.msg = "Diagnóstico salvo com sucesso";   

        } catch (error: any) {

            void await db.Rollback();

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Diagnosticos - Erro inesperado: ${error.stack}`);

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Excluir(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try { 

            void await db.Connect();

            void await db.Begin();

            const diag_id : number = Number(req.params.diag_id || 0);   

            if (!diag_id) {
                const error =  new Error('ID do diagnostico não informado');
                error.statusCode = 400;
                throw error;
            }

            const diagnosticos = new Diagnosticos(db.connection);

            void await diagnosticos.BuscarPorId(diag_id);

            if (!diagnosticos.found) {
                const error = new Error('Diagnostico não encontrado');
                error.statusCode = 404;
                throw error;
            }

            await diagnosticos.Excluir();

            void await db.Commit();

            resdata.msg = "Diagnóstico excluído com sucesso";

        } catch (error: any) {

            void await db.Rollback();

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Diagnosticos - Erro inesperado: ${error.stack}`);

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    }

}