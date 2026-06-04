import {Connection,RowDataPacket} from 'mysql2/promise';
import BaseModel,{iBaseModel} from './BaseModel.js';

export interface iDiagnosticosFields {
    diag_id : number,
    diag_descr : string,
    diag_ativo : number
}

export default class Diagnosticos extends BaseModel implements iDiagnosticosFields,iBaseModel  {

    constructor(connection : Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iDiagnosticosFields = {
            diag_id: 0,
            diag_descr: '',
            diag_ativo: 0
        };

        super(connection,'tb_diagnosticos', initFields,'diag_id');
    }

    set diag_id(id : number) { this._fields.diag_id = id;}
    get diag_id() :number {return this._fields.diag_id;}

    set diag_descr(descr : string) { this._fields.diag_descr = descr;}
    get diag_descr() :string {return this._fields.diag_descr;}

    set diag_ativo(ativo : number) { this._fields.diag_ativo = ativo;}
    get diag_ativo() : number {return this._fields.diag_ativo;}

    public async Listar(pesq : string) : Promise<iDiagnosticosFields[]>{

        let query : string = "SELECT * FROM tb_diagnosticos";

        if (pesq !== '*') {
            query += " WHERE diag_descr LIKE :pesq";
        }

        const [rows]  = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as RowDataPacket[];

        return rows as iDiagnosticosFields[];

    }

    public async ListarAtivos(pesq : string) : Promise<iDiagnosticosFields[]>{

        let query : string = "SELECT * FROM tb_diagnosticos WHERE diag_ativo = 1";

        if (pesq !== '*') {
            query += " AND diag_descr LIKE :pesq";
        }

        const [rows]  = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as RowDataPacket[];

        return rows as iDiagnosticosFields[];

    }

}