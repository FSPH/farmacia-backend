import Database, { iDatabase } from "../connections/dbconn.js";
import Entradas, { iEntradas } from "../model/dao_entradas.js";
import Medicamentos from "../model/dao_medicamentos.js";
import { iresdata } from "./interface_controllers.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";

// Coordena o fluxo de entradas e os reflexos no estoque.
export default class Controller_Entradas {

    static async ListarTodos(req: Request, res: Response) {
        
        // Inicializa infraestrutura da requisicao e o envelope padrao da resposta.
        const db = new Database();
        const resdata: iresdata = {
          err: 0,
          msg: '',
          status: 200,
          data: null
        };

        try {
            
            // Valida filtros, consulta o DAO e devolve a lista encontrada.
            await db.Connect();
            const pesq = String(req.params.pesq || '*');
            const data_inicio = new Date(String(req.params.data_inicio));
            const data_fim = new Date(String(req.params.data_fim));

            if(isNaN(data_inicio.getTime())) {
                const error = new Error('Data de início inválida');
                error.statusCode = 400;
                throw error;
            }
            
            if(isNaN(data_fim.getTime())) {
                const error = new Error('Data de fim inválida');
                error.statusCode = 400;
                throw error;
            }

            if(data_inicio > data_fim) {
                const error = new Error('Data de início deve ser menor que data de fim');
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);
            
            const result = await entradas.ListarTodos(pesq, data_inicio, data_fim);

            resdata.data = result;
            
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }
    
    static async BuscarPorId(req: Request, res: Response) {

        const db = new Database();

        const resdata: iresdata = {
          err: 0,
          msg: '',
          status: 200,
          data: null
        };

        try {
            
            await db.Connect();

            const ent_id = Number(req.params.ent_id || 0) ;
            
            const entradas = new Entradas(db.connection);
            const medicamentos = new Medicamentos(db.connection);
            
            const result = await entradas.BuscarPorId(ent_id);

            if (!entradas.found) {
                const error = new Error('Entrada não encontrada');
                error.statusCode = 404;
                throw error;
            }

            await medicamentos.BuscarPorId(entradas.ent_med_id);
            
            if (!medicamentos.found) {
                const error = new Error('Medicamento não encontrado');
                error.statusCode = 404;
                throw error;
            }

            result.ent_med_descr = medicamentos.med_descr;
            result.ent_med_descr_coml = medicamentos.med_descr_coml;

            resdata.data = result;
            
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);
        
    }

    static async Salvar(req: Request, res: Response) {
        
        const db = new Database();
        
        const resdata: iresdata = {
          err: 0,
          msg: '',
          status: 200,
          data: null
        };

        try {

            await db.Connect();
            await db.Begin();

            const ent_id = Number(req.params.id || 0);
            const ent_date = new Date(req.body.ent_date);
            const ent_med_id = Number(req.body.ent_med_id || 0);
            const ent_lote = req.body.ent_lote ? String(req.body.ent_lote) : null;
            const ent_qtde = Number(req.body.ent_qtde || 0);
            const ent_doc = req.body.ent_doc ? String(req.body.ent_doc) : null;
            const ent_fornecido_por = req.body.ent_fornecido_por ? String(req.body.ent_fornecido_por) : null;

            if (ent_id === 0) {
               const error = new Error('ID da entrada é obrigatório') as any;
               error.statusCode = 400;
               throw error;   
            }

            if (isNaN(ent_date.getTime())) {
               const error = new Error('Data da entrada é obrigatória') as any;
               error.statusCode = 400;
               throw error;   
            }

            if (ent_med_id === 0) {
               const error = new Error('ID do medicamento é obrigatório') as any;
               error.statusCode = 400;
               throw error;   
            }

            if (ent_qtde === 0) {
               const error = new Error('Quantidade da entrada é obrigatória') as any;
               error.statusCode = 400;
               throw error;   
            }

            if (!ent_lote) {
               const error = new Error('Lote da entrada é obrigatório') as any;
               error.statusCode = 400;
               throw error;   
            }

            if (!ent_doc) {
               const error = new Error('Documento da entrada é obrigatório') as any;
               error.statusCode = 400;
               throw error;   
            }

            if (!ent_fornecido_por) {
               const error = new Error('O nome do fornecedor é obrigatório') as any;
               error.statusCode = 400;
               throw error;   
            }

            const entradas = new Entradas(db.connection);

            entradas.ent_id = ent_id;
            entradas.ent_date = ent_date;
            entradas.ent_med_id = ent_med_id;
            entradas.ent_lote = ent_lote;
            entradas.ent_qtde = ent_qtde;
            entradas.ent_doc = ent_doc;
            entradas.ent_fornecido_por = ent_fornecido_por;

            await entradas.Salvar();

            await db.connection.commit();

            resdata.msg = 'Entrada salva com sucesso';
            
        } catch (error: any) {
            await db.connection.rollback();
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }
}
