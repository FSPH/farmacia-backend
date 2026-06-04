import Database,{iDatabase} from "../connections/dbconn.js";
import Diagnosticos,{iDiagnosticosFields} from "../model/dao_diagnosticos.js";
import { Request, Response } from "express";
import { iresdata } from "./interface_controllers.js";
import { applyControllerError } from "../utils/controllerError.js";

// Controla o CRUD de diagnosticos seguindo o contrato padrao da API.
export default class Controller_Diagnosticos{

    static async Listar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            // Valida o filtro antes da consulta.
            const pesq : string = String(req.params.pesq || '*');

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            } 

            // Executa a consulta no DAO e devolve a lista filtrada.
            const diagnosticos = new Diagnosticos(db.connection);
            resdata.data = await diagnosticos.Listar(pesq) as iDiagnosticosFields[]; 
            
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Diagnosticos');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ListarAtivos(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            // Valida o filtro antes da consulta.
            const pesq : string = String(req.params.pesq || '*');

            void await db.Connect();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            } 

            // Executa a consulta no DAO e devolve apenas registros ativos.
            const diagnosticos = new Diagnosticos(db.connection);
            resdata.data = await diagnosticos.ListarAtivos(pesq) as iDiagnosticosFields[]; 
            
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Diagnosticos');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }


    static async Buscar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            // Valida o identificador antes da busca.
            const diag_id : number = Number(req.params.diag_id || 0);

            if (diag_id === 0) {
                const error = new Error('ID Diagnóstico não informado');
                error.statusCode = 400;
                throw error;
            }

            void await db.Connect();

            // Carrega o registro e garante retorno 404 quando ele nao existir.
            const diagnosticos = new Diagnosticos(db.connection);
            const dados = await diagnosticos.BuscarPorId(diag_id);

            if (!diagnosticos.found) { 
                const error = new Error('Diagnóstico não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = dados; 
            
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Diagnosticos');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        } 

        try {

            // Abre a conexao e inicia a transacao do salvamento.
            void await db.Connect();
            void await db.Begin();

            // Normaliza os campos vindos da requisicao.
            const diag_id : number = Number(req.body.diag_id || 0);
            const diag_descr : string = String(req.body.diag_descr || '').trim().toLocaleUpperCase();
            const diag_ativo : 0 | 1 = Number(req.body.diag_ativo || 0) === 1 ? 1 : 0;
            
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

            // Carrega o registro atual quando houver ID e persiste a alteracao.
            const diagnosticos = new Diagnosticos(db.connection);
            if (diag_id > 0) {
                void await diagnosticos.BuscarPorId(diag_id);
            }

            diagnosticos.diag_id = diag_id;
            diagnosticos.diag_descr = diag_descr;
            diagnosticos.diag_ativo = diag_ativo;

            void await diagnosticos.Salvar();

            void await db.Commit();

            resdata.msg = "Diagnóstico salvo com sucesso";   

        } catch (error: any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Diagnosticos');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Excluir(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try { 

            // Abre a conexao e inicia a transacao da exclusao.
            void await db.Connect();
            void await db.Begin();

            // Valida o identificador e garante que o registro exista.
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
            applyControllerError(resdata, error, 'Controller Diagnosticos');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    }

}
