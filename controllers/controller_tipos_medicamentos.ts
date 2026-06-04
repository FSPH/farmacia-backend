import Database, {iDatabase} from "../connections/dbconn.js";
import TiposProdutos ,{iTiposMedicamentosFields}  from '../model/dao_tipos_medicamentos.js'
import { Request, Response } from "express";
import { iresdata } from "./interface_controllers.js";
import { applyControllerError } from "../utils/controllerError.js";

// Controla o cadastro de tipos de medicamentos da aplicacao.
export default class Controller_TiposProdutos {

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

            const tiposProdutos = new TiposProdutos(db.connection);

            resdata.data = await tiposProdutos.Listar(pesq) as iTiposMedicamentosFields[]; 
            
        } catch (error :any) {
           
            applyControllerError(resdata, error, 'Controller Tipos Produtos'); 
            
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

            const tipo_id : number = Number(req.params.tipo_id || 0);

            void await db.Connect();

            if (tipo_id === 0) {
                const error = new Error('ID do tipo de produto não informado');
                error.statusCode = 400;
                throw error;
            }

            const tiposProdutos = new TiposProdutos(db.connection);

            const dados = await tiposProdutos.BuscarPorId(tipo_id) as iTiposMedicamentosFields;

            if (!tiposProdutos.found) { 
                const error = new Error('Tipo de produto não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = dados; 
            
        } catch (error: any) {

            applyControllerError(resdata, error, 'Controller Tipos Produtos'); 
            
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async BuscarPorCodigo(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            const tipo_codigo : string = String(req.params.tipo_codigo || '').toLocaleUpperCase();

            if (!tipo_codigo) {
                const error = new Error("Código do Tipo de Produto não informado");
                error.statusCode = 400;
                throw error;
            }

            const tipos = new TiposProdutos(db.connection);

            const dados : iTiposMedicamentosFields = await tipos.BuscarPorCodigo(tipo_codigo);

            if (!tipos.found) {
                const error = new Error("Tipo de produto não encontrado"); 
                error.statusCode = 404;
                throw error;
            }

            resdata.data = dados;
            
        } catch (error :any ) {

            applyControllerError(resdata, error, 'Controller Tipos Produtos'); 
            
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

            const tipo_id : number = Number(req.body.tipo_id || 0);
            const tipo_codigo : string = String(req.body.tipo_codigo || '').toLocaleUpperCase().trim();
            const tipo_descr : string = String(req.body.tipo_descr || '').toLocaleUpperCase().trim();
            const tipo_ativo : 0 | 1 = req.body.tipo_ativo || 0;

            if (tipo_id === 0) {
                const error = new Error("ID do tipo de produto não informado");
                error.statusCode = 400;
                throw error;
            }

            if (!tipo_codigo) {
                const error = new Error("Código do tipo de produto não informado");
                error.statusCode = 400;
                throw error;
            }

            if (!tipo_descr) {
                const error = new Error("Descrição do tipo de produto não informada");
                error.statusCode = 400;
                throw error;
            }

            if (req.body.tipo_ativo === undefined) { 
                const error = new Error("Ativo não informado");
                error.statusCode = 400;
                throw error;
            }

            const tipos = new TiposProdutos(db.connection);

            void await tipos.BuscarPorId(tipo_id);
        
            tipos.tipo_id = tipo_id;
            tipos.tipo_codigo = tipo_codigo;
            tipos.tipo_descr = tipo_descr;
            tipos.tipo_ativo = tipo_ativo;

            await tipos.Salvar();

            void await db.Commit();

            resdata.msg = "Tipo de produto salvo com sucesso";

        } catch (error :any) {

            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Tipos Produtos'); 
            
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

            const tipo_id : number = Number(req.params.tipo_id || 0);

            if (tipo_id === 0) {
                const error = new Error("ID do tipo de produto não informado");
                error.statusCode = 400;
                throw error;
            }

            const tipos = new TiposProdutos(db.connection);

            void await tipos.BuscarPorId(tipo_id);

            if(!tipos.found) {
                const error = new Error("Tipo de produto não encontrado");
                error.statusCode = 404;
                throw error;
            }

            void await tipos.Excluir();

            void await db.Commit();

            resdata.msg = "Tipo de produto excluído com sucesso";
            
        } catch (error : any) {

            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Tipos Produtos'); 
            
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
        
    }
        
}
