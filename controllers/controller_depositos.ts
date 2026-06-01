import Database, { iDatabase } from "../connections/dbconn.js";
import Depositos, { iDepositosFields } from "../model/dao_depositos.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import GravarLog from "../utils/gravarLogsError.js";

export default class Controller_Depositos {

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

            const depositos = new Depositos(db.connection);

            resdata.data = await depositos.Listar(pesq) as iDepositosFields[]; 
            
        } catch (error: any) {

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Depositos - Erro inesperado: ${error.stack}`);
            
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

            const dep_id : number = Number(req.params.dep_id || 0);

            void await db.Connect();

            if (dep_id === 0) {
                const error = new Error('ID do depósito não informado');
                error.statusCode = 400;
                throw error;
            }

            const depositos = new Depositos(db.connection);

            const dados = await depositos.BuscarPorId(dep_id) as iDepositosFields;

            if (!depositos.found) { 
                const error = new Error('Depósito não encontrado');
                error.statusCode = 404
                throw error;
            }

            resdata.data = dados; 
            
        } catch (error: any) {

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Depositos - Erro inesperado: ${error.stack}`);            
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

            const depo_id : number = Number(req.body.depo_id || 0);
            const depo_descr : string = String(req.body.depo_descr || '').toLocaleUpperCase();
            const depo_ativo : 0 | 1 = req.body.depo_ativo || 0;

            if (depo_id === 0) {
                const error = new Error('ID do depósito não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!depo_descr) {
                const error = new Error('Descrição do depósito não informada');
                error.statusCode = 400;
                throw error;
            }

            if (req.body.depo_ativo === undefined) {
                const error = new Error('Ativo não informado');
                error.statusCode = 400;
                throw error;
            }

            const depositos = new Depositos(db.connection);

            void await depositos.BuscarPorId(depo_id);

            depositos.dep_id = depo_id;
            depositos.dep_descr = depo_descr;
            depositos.dep_ativo = depo_ativo;

            void await depositos.Salvar();

            void await db.Commit();

            resdata.msg = "Depósito salvo com sucesso";   
            
        } catch (error: any) {

            void await db.Rollback();

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Depositos - Erro inesperado: ${error.stack}`);
            
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

            const dep_id : number = Number(req.params.dep_id || 0);

            if (dep_id === 0) {
                const error = new Error('ID do depósito não informado');
                error.statusCode = 400;
                throw error;
            }

            const depositos = new Depositos(db.connection);

            void await depositos.BuscarPorId(dep_id);

            if (!depositos.found) {
                const error = new Error('Depositoo não encontrado');
                error.statusCode = 404;
                throw error;
            }
            
            await depositos.Excluir();

            void await db.Commit();

            resdata.msg = "Depósito excluído com sucesso";

        } catch (error: any) {

            void await db.Rollback();

            resdata.err = error.statusCode || 500;
            resdata.status = error.statusCode || 500;
            resdata.msg = resdata.status === 500 ? "Erro desconhecido" : error.message;

            if (resdata.status === 500) GravarLog(`Controller Depositos - Erro inesperado: ${error.stack}`);

        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
  
    }

}