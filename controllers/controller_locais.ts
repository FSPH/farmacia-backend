import Database, { iDatabase } from '../connections/dbconn.js';
import Locais, {iLocaisFields}  from '../model/dao_locais.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";

// Controla o cadastro de locais usados pelo fluxo da farmacia.
export default class Controller_Locais {

    static async Buscar(req: Request, res: Response) {

        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db : iDatabase = new Database();
        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []

        };

        try {

            void await db.Connect();

            const local_id : number = Number(req.params.id_local || 0);

            if (local_id === 0) {
                const error = new Error('ID Local não informado');
                error.statusCode = 400;
                throw error;
            } 

            // Carrega o registro e garante retorno 404 quando ele nao existir.
            const locais = new Locais(db.connection);
            const dados = await locais.BuscarPorId(local_id) as iLocaisFields;

            if (!locais.found) {
                const error = new Error('Local não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Locais');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }
    
    static async Listar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}

        } as iresdata;

        try {

            void await db.Connect();

            const pesq : string = String(req.params?.pesq || '*');

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const locais = new Locais(db.connection);

            resdata.data = await locais.Listar(pesq) as iLocaisFields[];

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Locais');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            void await db.Begin();

            const locais = new Locais(db.connection);

            const local_id: number = Number(req.body?.local_id || 0);
            const local_descr: string = String(req.body.local_descr || '').toLocaleUpperCase().trim();
            const local_ativo: 0 | 1 = req.body?.local_ativo || 0;

            if (local_id === 0) {
                const error = new Error('ID Local não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!local_descr) {
                const error = new Error('Descrição do local não informada');
                error.statusCode = 400;
                throw error;
            }

            if (req.body.local_ativo === undefined) {
                const error = new Error('Ativo não informado');
                error.statusCode = 400;
                throw error;
            }

            void await locais.BuscarPorId(local_id);

            if (!locais.found) {
                const error = new Error('Local não encontrado');    
                error.statusCode = 404;
                throw error;
            }

            locais.local_descr = local_descr;
            locais.local_ativo = local_ativo;

            await locais.Salvar();

            void await db.Commit();

            resdata.msg = "Local salvo com sucesso";

        } catch (error :any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Locais');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

    static async Excluir(req: Request, res: Response) {

        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            void await db.Begin();

            const locais = new Locais(db.connection);

            const local_id: number = Number(req.params.local_id || 0);

            if (local_id === 0) {
                const error = new Error('ID do local não informado');
                error.statusCode = 400;
                throw error;
            }

            void await locais.BuscarPorId(local_id);

            if (!locais.found) {
                const error = new Error('Local não encontrado');
                error.statusCode = 404;
                throw error;
            }
            
            await locais.Excluir();

            void await db.Commit();

            resdata.msg = "Local excluído com sucesso";

        } catch (error :any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Locais');
        }
        
        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    }
}   
