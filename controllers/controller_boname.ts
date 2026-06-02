import Database, { iDatabase } from "../connections/dbconn.js";
import Boname, {iBonameFields} from "../model/dao_boname.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import GravarLog from "../utils/gravarLogsError.js";

export default class Controller_Boname {

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

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            } 

            void await db.Connect();

            const boname = new Boname(db.connection);

            resdata.data = await boname.ListarTodos(pesq) as iBonameFields[]; 
            
        } catch (error :any) {

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Boname - Erro inesperado: ${error.stack}`);

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

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

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            } 

            void await db.Connect();

            const boname = new Boname(db.connection);

            resdata.data = await boname.ListarAtivos(pesq) as iBonameFields[]; 
            
        } catch (error :any) {

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

            const bona_id : number = Number(req.params.bona_id || 0);

            if (bona_id === 0) {
                const error = new Error('ID Boname não informado');
                error.statusCode = 400;
                throw error;
            } 

            void await db.Connect();

            const boname = new Boname(db.connection);

            const dados  = await boname.BuscarPorId(bona_id);

            if (!boname.found) { 
                const error = new Error('Boname não encontrado');
                error.statusCode = 404  
                throw error;
            }

            resdata.data = dados; 
            
        } catch (error :any) {

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Boname - Erro inesperado: ${error.stack}`);
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

            console.log(req.body);

            const bona_id : number = Number(req.body.bona_id || 0);
            const bona_codigo : string = String(req.body.bona_codigo || '').toLocaleUpperCase();
            const bona_descr : string = String(req.body.bona_descr || '').toLocaleUpperCase();
            const bona_qt_ui : number = Number(req.body.bona_qt_ui || 0);
            const bona_diag_id : number = Number(req.body.bona_diag_id || 0);
            const bona_ativo : 0 | 1 = req.body.bona_ativo || 0;

            if (bona_id === 0) {
                const error = new Error('ID Boname não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!bona_codigo) {
                const error = new Error('Código do Boname não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!bona_descr) {
                const error = new Error('Descrição do Boname não informada');
                error.statusCode = 400;
                throw error;
            }

            if (bona_diag_id === 0) {
                const error = new Error('ID do diagnóstico não informado');
                error.statusCode = 400;
                throw error;
            }

            if (bona_qt_ui === 0) {
                const error = new Error('Quantidade por unidade não informada');
                error.statusCode = 400;
                throw error;
            }

            if (req.body.bona_ativo === undefined) {
                const error = new Error('Ativo não informado');
                error.statusCode = 400;
                throw error;
            }

            const boname = new Boname(db.connection);

            void await boname.BuscarPorId(bona_id);

            boname.bona_id = bona_id;
            boname.bona_codigo = bona_codigo;
            boname.bona_descr = bona_descr;
            boname.bona_qt_ui = bona_qt_ui;
            boname.bona_diag_id = bona_diag_id;
            boname.bona_ativo = bona_ativo;

            void await boname.Salvar();

            void await db.Commit();

            resdata.msg = "Boname salvo com sucesso";   
            
        } catch (error :any) {

            void await db.Rollback();

           
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Boname - Erro inesperado: ${error.stack}`);
            
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

            const bona_id : number = Number(req.params.bona_id || 0);

            if(bona_id === undefined || bona_id === 0) {
                const error = new Error('ID do boname não informado');
                error.statusCode = 400;
                throw error;
            }

            const boname = new Boname(db.connection);

            void await boname.BuscarPorId(bona_id);

            if (!boname.found) {
                const error = new Error('Boname não encontrado');
                error.statusCode = 404;
                throw error;
            }

            await boname.Excluir();

            void await db.Commit();

            resdata.msg = "Boname excluído com sucesso";

        } catch (error :any) {

            void await db.Rollback();
          
            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Boname - Erro inesperado: ${error.stack}`);
        }
        
        void await db.Disconnect();

        res.status(resdata.status).json(resdata);   
    }

}
