import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

enum eStatus {
    Aberto = 0,
    Fechado = 1,
}

export interface iInventariosFields {
    inv_id: number,
    inv_date: Date,
    inv_dep_id: number,
    inv_med_tipo_codigo: string,
    inv_status: eStatus,
    inv_mes_ref: number,
    inv_ano_ref: number,
}

export default class Inventarios extends BaseModel implements iBaseModel, iInventariosFields {
    
    constructor(connection: Connection) {
    
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iInventariosFields = {
            inv_id: 0,
            inv_date: new Date(),
            inv_dep_id: 0,
            inv_med_tipo_codigo: '',
            inv_status: 0,
            inv_mes_ref: 0,
            inv_ano_ref: 0,
        };

        super(connection, 'tb_inventarios', initFields, 'inv_id');

    }

    get found(): boolean {return this._found;}

    set inv_id(id: number) { this._fields.inv_id = id;}
    get inv_id(): number {return this._fields.inv_id;}

    set inv_date(date: Date) { this._fields.inv_date = date;}
    get inv_date(): Date {return this._fields.inv_date;}

    set inv_dep_id(dep_id: number) { this._fields.inv_dep_id = dep_id;}
    get inv_dep_id(): number {return this._fields.inv_dep_id;}

    set inv_med_tipo_codigo(med_tipo_codigo: string) { this._fields.inv_med_tipo_codigo = med_tipo_codigo;}
    get inv_med_tipo_codigo(): string {return this._fields.inv_med_tipo_codigo;}

    set inv_status(status: eStatus) { this._fields.inv_status = status;}
    get inv_status(): eStatus {return this._fields.inv_status;}

    set inv_mes_ref(mes_ref: number) { this._fields.inv_mes_ref = mes_ref;}
    get inv_mes_ref(): number {return this._fields.inv_mes_ref;}

    set inv_ano_ref(ano_ref: number) { this._fields.inv_ano_ref = ano_ref;}
    get inv_ano_ref(): number {return this._fields.inv_ano_ref;}

    public async ListarPorPeriodo(mes_ref: number, ano_ref: number, dep_id?: number): Promise<iInventariosFields[]> {

        let query: string = "SELECT * FROM tb_inventarios WHERE inv_mes_ref = :mes_ref AND inv_ano_ref = :ano_ref";

        const params: any = { mes_ref, ano_ref };

        if (dep_id) {
            query += " AND inv_dep_id = :dep_id";
            params.dep_id = dep_id;
        }

        const [rows] = await this.ExecuteQuery(query, params) as [iInventariosFields[]];

        return rows;

    }

    public async ListarPorStatus(status: eStatus): Promise<iInventariosFields[]> {

        const query: string = "SELECT * FROM tb_inventarios WHERE inv_status = :status";

        const [rows] = await this.ExecuteQuery(query, { status }) as [iInventariosFields[]];

        return rows;

    }

}
