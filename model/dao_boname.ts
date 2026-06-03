import {Connection,RowDataPacket} from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iBonameFields {
    bona_id: number,
    bona_codigo: string,
    bona_descr: string,
    bona_qt_ui: number,
    bona_ativo: 0 | 1,
    bona_diag_id: number,
}

export default class Boname extends BaseModel implements iBonameFields, iBaseModel {

    constructor(connection: Connection) {
    
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iBonameFields = {
            bona_id: 0,
            bona_codigo: '',
            bona_descr: '',
            bona_qt_ui: 0,
            bona_ativo: 0,
            bona_diag_id: 0,

        }

        super(connection, 'tb_boname', initialFields, 'bona_id');
    }

    set bona_id(id: number) { this._fields.bona_id = id;}
    get bona_id(): number {return this._fields.bona_id;}

    set bona_codigo(codigo: string) { this._fields.bona_codigo = codigo;}
    get bona_codigo(): string {return this._fields.bona_codigo;}

    set bona_descr(descr: string) { this._fields.bona_descr = descr;}
    get bona_descr(): string {return this._fields.bona_descr;}

    set bona_qt_ui(qt_ui: number) { this._fields.bona_qt_ui = qt_ui;}
    get bona_qt_ui(): number {return this._fields.bona_qt_ui;}
    
    set bona_diag_id(diag_id: number) { this._fields.bona_diag_id = diag_id;}
    get bona_diag_id(): number {return this._fields.bona_diag_id;}

    set bona_ativo(ativo : 0 | 1) { this._fields.bona_ativo = ativo;}
    get bona_ativo() : 0 | 1 {return this._fields.bona_ativo;} 

    async ListarTodos(pesq : string): Promise<iBonameFields[]> {
        
        let query : string = `SELECT * FROM tb_boname`;

        if (pesq !== '*') {
            query += " WHERE bona_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as RowDataPacket[];
        
        return rows as iBonameFields[];
    }

    async ListarAtivos(pesq : string): Promise<iBonameFields[]> {
        
        let query : string = `SELECT * FROM tb_boname WHERE bona_ativo = 1`;

        if (pesq !== '*') {
            query += " AND bona_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as RowDataPacket[];
        
        return rows as iBonameFields[];
    }

    async BuscarPorCodigo(codigo: string): Promise<void> {
        
        const query = `SELECT * FROM tb_boname WHERE bona_codigo = :codigo LIMIT 1`;
        const [rows] = await this.ExecuteQuery(query, {codigo}) as RowDataPacket[];

        if (rows.length > 0) {
            this.populateFromRow(rows[0]);
        } else {
            this._found = false;
        }
    }
   
}