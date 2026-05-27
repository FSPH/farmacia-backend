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

export interface iInventarioListagem extends iInventariosFields {
    dep_descr: string,
    tipo_descr: string,
    total_itens: number,
    total_itens_divergentes: number,
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

    public async Listar(
        mes_ref?: number,
        ano_ref?: number,
        dep_id?: number,
        med_tipo_codigo?: string,
        status?: eStatus,
    ): Promise<iInventarioListagem[]> {

        let query = `SELECT i.*,
                            d.dep_descr,
                            t.tipo_descr,
                            COUNT(ii.iti_id) AS total_itens,
                            SUM(CASE WHEN IFNULL(ii.iti_qtde_dif, 0) <> 0 THEN 1 ELSE 0 END) AS total_itens_divergentes
                     FROM tb_inventarios i
                     LEFT JOIN tb_depositos d ON d.dep_id = i.inv_dep_id
                     LEFT JOIN tb_tipos_medicamentos t ON t.tipo_codigo = i.inv_med_tipo_codigo
                     LEFT JOIN tb_itens_inventario ii ON ii.iti_inv_id = i.inv_id
                     WHERE 1 = 1`;

        const params: Record<string, string | number> = {};

        if (mes_ref) {
            query += ' AND i.inv_mes_ref = :mes_ref';
            params.mes_ref = mes_ref;
        }

        if (ano_ref) {
            query += ' AND i.inv_ano_ref = :ano_ref';
            params.ano_ref = ano_ref;
        }

        if (dep_id) {
            query += ' AND i.inv_dep_id = :dep_id';
            params.dep_id = dep_id;
        }

        if (med_tipo_codigo) {
            query += ' AND i.inv_med_tipo_codigo = :med_tipo_codigo';
            params.med_tipo_codigo = med_tipo_codigo;
        }

        if (status === 0 || status === 1) {
            query += ' AND i.inv_status = :status';
            params.status = status;
        }

        query += ` GROUP BY i.inv_id, i.inv_date, i.inv_dep_id, i.inv_med_tipo_codigo, i.inv_status,
                            i.inv_mes_ref, i.inv_ano_ref, d.dep_descr, t.tipo_descr
                   ORDER BY i.inv_ano_ref DESC, i.inv_mes_ref DESC, i.inv_dep_id, i.inv_id DESC`;

        const [rows] = await this.ExecuteQuery(query, params) as [iInventarioListagem[]];

        return rows;
    }

    public async BuscarPorReferencia(
        dep_id: number,
        med_tipo_codigo: string,
        mes_ref: number,
        ano_ref: number,
    ): Promise<iInventariosFields> {

        const query = `SELECT *
                       FROM tb_inventarios
                       WHERE inv_dep_id = :dep_id
                         AND inv_med_tipo_codigo = :med_tipo_codigo
                         AND inv_mes_ref = :mes_ref
                         AND inv_ano_ref = :ano_ref
                       LIMIT 1`;

        const [rows] = await this.ExecuteQuery(query, {
            dep_id,
            med_tipo_codigo,
            mes_ref,
            ano_ref,
        }) as [iInventariosFields[]];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;
    }

    public async BuscarPorIdParaAtualizacao(inv_id: number): Promise<iInventariosFields> {

        const query = 'SELECT * FROM tb_inventarios WHERE inv_id = :inv_id FOR UPDATE';

        const [rows] = await this.ExecuteQuery(query, { inv_id }) as [iInventariosFields[]];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;
    }

    public async ListarPorStatus(status: eStatus): Promise<iInventariosFields[]> {

        const query: string = "SELECT * FROM tb_inventarios WHERE inv_status = :status";

        const [rows] = await this.ExecuteQuery(query, { status }) as [iInventariosFields[]];

        return rows;

    }

}
