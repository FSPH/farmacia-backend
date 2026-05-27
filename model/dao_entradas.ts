import { Connection,RowDataPacket } from "mysql2/promise";
import BaseModel, {iBaseModel} from "./BaseModel.js"; 

export interface iEntradas {
    ent_id: number,
    ent_date: Date,
    ent_med_id: number,
    ent_lote: string,
    ent_qtde: number,
    ent_doc: string,
    ent_fornecido_por: string
}

export default class Entradas extends BaseModel implements iEntradas,iBaseModel {

    constructor(connection : Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields : iEntradas = {
            ent_id: 0,
            ent_date: new Date(),
            ent_med_id: 0,
            ent_qtde: 0,
            ent_doc: '',
            ent_lote: '',
            ent_fornecido_por: ''
        }

        super(connection,'tb_entradas',initialFields,'ent_id');

    }

    get found() {return this._found}

    set ent_id(ent_id: number) { this._fields.ent_id = ent_id}
    get ent_id(): number  {return this._fields.ent_id}

    set ent_date(ent_date: Date) {this._fields.ent_date = ent_date}
    get ent_date(): Date { return this._fields.ent_date}

    set ent_med_id(ent_med_id: number) {this._fields.ent_med_id = ent_med_id}
    get ent_med_id(): number {return this._fields.ent_med_id}

    set ent_lote(ent_lote: string) {this._fields.ent_lote = ent_lote}
    get ent_lote(): string {return this._fields.ent_lote}

    set ent_qtde(ent_qtde: number) {this._fields.ent_qtde = ent_qtde}
    get ent_qtde(): number {return this._fields.ent_qtde}

    set ent_doc(ent_doc: string) {this._fields.ent_doc = ent_doc}
    get ent_doc(): string {return this._fields.ent_doc}

    set ent_fornecido_por(ent_fornecido_por: string) { this._fields.ent_fornecido_por = ent_fornecido_por}
    get ent_fornecido_por(): string { return this._fields.ent_fornecido_por}

    async ListarTodos(pesq: string,data_inicio: Date,data_fim: Date): Promise<iEntradas[]> {

        let query : string = `SELECT e.ent_id as id,e.ent_date as data, m.med_descr as medicamento, m.med_und as unidade,
                              e.ent_lote as lote, e.ent_qtde as quantidade  
                              FROM tb_entradas e
                              LEFT JOIN tb_medicamentos m ON m.med_id = e.ent_med_id
                              WHERE e.ent_date >= :data_inicio AND e.ent_date <= :data_fim`;

        if (pesq !== '*') {
            query += " AND m.med_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`,data_inicio,data_fim});

        return rows as iEntradas[]

    }
}
