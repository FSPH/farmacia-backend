import Database, {iDatabase} from "../connections/dbconn.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import { iresdata } from "./interface_controllers.js";
import Estoque from "../model/dao_estoque.js";

// Expoe consultas e ajustes de estoque controlados por deposito, medicamento e lote.
export default class Controller_Estoque {

    static async Listar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            const pesq = String(req.params.pesq || '*');
            const dep_id = Number(req.params.dep_id) || 0;
            const med_tipo_codigo = String(req.params.med_tipo_codigo || '');

            if (!pesq || !dep_id || !med_tipo_codigo) {
                const error = new Error('Parâmetros não informados corretamente.') as any;
                error.statusCode = 400;
                throw error;
            }       

            const estoque = new Estoque(db.connection);

            const result = await estoque.ListarAtivos(pesq, dep_id, med_tipo_codigo);
            
            resdata.data = result;
            
        } catch (error :any) {

            applyControllerError(resdata, error, 'Controller Estoque');

        } finally {

            await db.Disconnect();

        }

        return res.status(resdata.status).json(resdata);

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
            
            void await db.Connect();

            const med_id = Number(req.params.med_id) || 0;
            const dep_id = Number(req.params.dep_id) || 0;
            const lote = String(req.params.lote || '');
            
            if (!med_id || !dep_id || !lote) {
                const error = new Error('Parâmetros não informados corretamente.') as any;
                error.statusCode = 400;
                throw error;
            }
            
            const estoque = new Estoque(db.connection);

            const result = await estoque.BuscarPorItemEstoque(med_id, dep_id, lote);
            
            if (!result) {
                const error = new Error('Item não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            resdata.data = result;
            
        } catch (error :any) {
            
            applyControllerError(resdata, error, 'Controller Estoque');
        }
        
        return res.status(resdata.status).json(resdata);
        
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

            const est_id = Number(req.body.est_id) || 0;
            const est_dep_id = Number(req.body.est_dep_id) || 0;
            const est_med_id = Number(req.body.est_med_id) || 0;
            const est_lote = String(req.body.est_lote || '');
            const est_saldo = Number(req.body.est_saldo) || 0;
            const est_validade = new Date(req.body.est_validade || '');

            if (est_med_id === 0) {
                const error = new Error("Medicamento não informado") as any;
                error.statusCode = 400;
                throw error;
            }

            if (est_dep_id === 0) {
                const error = new Error("Departamento não informado") as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (est_lote === '') {
                const error = new Error("Lote não informado") as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (est_saldo === 0) {
                const error = new Error("Saldo não informado") as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (est_validade === new Date('')) {
                const error = new Error("Validade não informada") as any;
                error.statusCode = 400;
                throw error;
            }

            const estoque = new Estoque(db.connection);

            void await estoque.BuscarPorId(est_id);

            estoque.est_dep_id = est_dep_id;
            estoque.est_med_id = est_med_id;
            estoque.est_lote = est_lote;
            estoque.est_saldo = est_saldo;
            estoque.est_validade = est_validade;
            
            await estoque.Salvar();

            void await db.Commit();

            resdata.msg = "Estoque atualizado com sucesso";
            
        } catch (error :any) {

            void await db.Rollback();
            
            applyControllerError(resdata, error, 'Controller Estoque');
        }
        
        return res.status(resdata.status).json(resdata);
        
    }
}
