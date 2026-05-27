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

export interface iItemInventarioListagem extends iItensInventarioFields {
    med_descr: string,
    med_descr_coml: string,
    med_und: string,
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

        const query = `SELECT ii.*,
                              m.med_descr,
                              m.med_descr_coml,
                              m.med_und
                       FROM tb_itens_inventario ii
                       LEFT JOIN tb_medicamentos m ON m.med_id = ii.iti_med_id
                       WHERE ii.iti_inv_id = :inv_id
                       ORDER BY m.med_descr, ii.iti_lote`;

        const [rows] = await this.ExecuteQuery(query, { inv_id }) as [iItemInventarioListagem[]];

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

    public async BuscarPorIdParaAtualizacao(iti_id: number): Promise<iItensInventarioFields> {

        const query = 'SELECT * FROM tb_itens_inventario WHERE iti_id = :iti_id FOR UPDATE';

        const [rows] = await this.ExecuteQuery(query, { iti_id }) as [iItensInventarioFields[]];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;
    }

    public async ListarPorInventarioParaFechamento(inv_id: number): Promise<iItensInventarioFields[]> {

        const query = 'SELECT * FROM tb_itens_inventario WHERE iti_inv_id = :inv_id ORDER BY iti_id FOR UPDATE';

        const [rows] = await this.ExecuteQuery(query, { inv_id }) as [iItensInventarioFields[]];

        return rows;
    }

    public async BuscarEstoqueParaInventario(
        dep_id: number,
        med_tipo_codigo: string,
        forUpdate = false,
    ): Promise<iItensInventarioFields[]> {

        let query = `SELECT e.est_med_id AS iti_med_id,
                            e.est_lote AS iti_lote,
                            e.est_validade AS iti_validade,
                            e.est_saldo AS iti_qtde_estoque,
                            e.est_saldo AS iti_qtde_invent,
                            0 AS iti_qtde_dif
                     FROM tb_estoque e
                     INNER JOIN tb_medicamentos m ON m.med_id = e.est_med_id
                     WHERE e.est_dep_id = :dep_id
                       AND m.med_tipo_codigo = :med_tipo_codigo
                       AND e.est_saldo > 0
                     ORDER BY m.med_descr, e.est_lote`;

        if (forUpdate) {
            query += ' FOR UPDATE';
        }

        const [rows] = await this.ExecuteQuery(query, {
            dep_id,
            med_tipo_codigo,
        }) as [iItensInventarioFields[]];

        return rows;
    }

    public override async Salvar(): Promise<void> {

        const fieldToSave = {
            iti_id: this._fields.iti_id,
            iti_inv_id: this._fields.iti_inv_id,
            iti_med_id: this._fields.iti_med_id,
            iti_lote: this._fields.iti_lote,
            iti_validade: this._fields.iti_validade,
            iti_qtde_estoque: this._fields.iti_qtde_estoque,
            iti_qtde_invent: this._fields.iti_qtde_invent,
        };

        if (this._found) {
            await this.ExecuteQuery(
                `UPDATE tb_itens_inventario
                 SET iti_inv_id = :iti_inv_id,
                     iti_med_id = :iti_med_id,
                     iti_lote = :iti_lote,
                     iti_validade = :iti_validade,
                     iti_qtde_estoque = :iti_qtde_estoque,
                     iti_qtde_invent = :iti_qtde_invent
                 WHERE iti_id = :iti_id`,
                fieldToSave,
            );

            return;
        }

        this.iti_id = await this.nextId();
        fieldToSave.iti_id = this.iti_id;

        await this.ExecuteQuery(
            `INSERT INTO tb_itens_inventario SET
                iti_id = :iti_id,
                iti_inv_id = :iti_inv_id,
                iti_med_id = :iti_med_id,
                iti_lote = :iti_lote,
                iti_validade = :iti_validade,
                iti_qtde_estoque = :iti_qtde_estoque,
                iti_qtde_invent = :iti_qtde_invent`,
            fieldToSave,
        );

        this._found = true;
    }

    private async nextId(): Promise<number> {

        const query = 'SELECT IFNULL(MAX(iti_id), 0) + 1 AS newid FROM tb_itens_inventario FOR UPDATE';

        const [rows] = await this.ExecuteQuery(query) as [RowDataPacket[]];

        return Number(rows[0].newid);
    }

}
