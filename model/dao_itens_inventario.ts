import { Connection, RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iItensInventarioFields {
    iti_id: number,
    iti_inv_id: number,
    iti_med_id: number,
    iti_lote: string,
    iti_validade: Date,
    iti_qtde_estoque: number,
    iti_qtde_invent: number,
    iti_qtde_dif: number,
}

export default class ItensInventario extends BaseModel implements iBaseModel, iItensInventarioFields {
    
    constructor(connection: Connection) {
    
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iItensInventarioFields = {
            iti_id: 0,
            iti_inv_id: 0,
            iti_med_id: 0,
            iti_lote: '',
            iti_validade: new Date(),
            iti_qtde_estoque: 0,
            iti_qtde_invent: 0,
            iti_qtde_dif: 0,
        };

        super(connection, 'tb_itens_inventario', initFields, 'iti_id');

    }

    get found(): boolean {return this._found;}

    set iti_id(id: number) { this._fields.iti_id = id;}
    get iti_id(): number {return this._fields.iti_id;}

    set iti_inv_id(inv_id: number) { this._fields.iti_inv_id = inv_id;}
    get iti_inv_id(): number {return this._fields.iti_inv_id;}

    set iti_med_id(med_id: number) { this._fields.iti_med_id = med_id;}
    get iti_med_id(): number {return this._fields.iti_med_id;}

    set iti_lote(lote: string) { this._fields.iti_lote = lote;}
    get iti_lote(): string {return this._fields.iti_lote;}

    set iti_validade(validade: Date) { this._fields.iti_validade = validade;}
    get iti_validade(): Date {return this._fields.iti_validade;}

    set iti_qtde_estoque(qtde_estoque: number) { this._fields.iti_qtde_estoque = qtde_estoque;}
    get iti_qtde_estoque(): number {return this._fields.iti_qtde_estoque;}

    set iti_qtde_invent(qtde_invent: number) { this._fields.iti_qtde_invent = qtde_invent;}
    get iti_qtde_invent(): number {return this._fields.iti_qtde_invent;}

    set iti_qtde_dif(qtde_dif: number) { this._fields.iti_qtde_dif = qtde_dif;}
    get iti_qtde_dif(): number {return this._fields.iti_qtde_dif;}

    public async ListarPorInventario(inv_id: number): Promise<iItensInventarioFields[]> {

        const query: string = "SELECT * FROM tb_itens_inventario WHERE iti_inv_id = :inv_id";

        const [rows] = await this.ExecuteQuery(query, { inv_id }) as [iItensInventarioFields[]];

        return rows;

    }

    public async BuscarPorItem(inv_id: number, med_id: number, lote: string): Promise<iItensInventarioFields> {

        const query: string = "SELECT * FROM tb_itens_inventario WHERE iti_inv_id = :inv_id AND iti_med_id = :med_id AND iti_lote = :lote";

        const [rows] = await this.ExecuteQuery(query, { inv_id, med_id, lote }) as [iItensInventarioFields[]];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;

    }

}
