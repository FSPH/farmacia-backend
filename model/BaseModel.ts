import { Connection, RowDataPacket } from 'mysql2/promise';

export interface iBaseModel {
    found: boolean;
    BuscarPorId(id: any): Promise<RowDataPacket>;
    Salvar(): Promise<void>;
    Excluir(id?: any): Promise<void>;
}

export default class BaseModel implements iBaseModel{
   
    private _conn: Connection;
    private _tb_name: string;
    protected _fields: any;
    private _primaryKey: string;
    protected _found: boolean;

    constructor(connection: Connection, tb_name: string, field_structure: any, primaryKey: string) {

        if (!connection) throw new Error('Conexao Invalida.');
        if (!tb_name) throw new Error('Tabela Invalida.');
        if (!field_structure) throw new Error('Estrutura Invalida.');
        if (!primaryKey) throw new Error('Chave primaria invalida.');

        this._found = false;
        this._tb_name = tb_name;
        this._fields = { ...field_structure };
        this._conn = connection;
        this._primaryKey = primaryKey;
    }

    get found(): boolean { return this._found; }
    
    protected async ExecuteQuery(query: string, params: any = {}) :Promise<RowDataPacket[]> {
        const rows = await this._conn.query(query, params) as RowDataPacket[];
        return rows;
    }

    async BuscarPorId(id: number): Promise<RowDataPacket> {
        
        const query: string= `SELECT * FROM ${this._tb_name} WHERE ${this._primaryKey} = :id`;

        const [rows] = await this._conn.query(query, { id }) as RowDataPacket[];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;
    }

    async Salvar() {
        
        let query;
        
        const fieldToSave = { ...this._fields };

        if (this._found) {
            query = this.buildUpdateQuery();
        } else {
            this._fields[this._primaryKey] = await this.newId();
            fieldToSave[this._primaryKey] = this._fields[this._primaryKey];
            query = this.buildInsertQuery();
        }

        void await this._conn.query(query, fieldToSave);
    }

    async Excluir(id?: number) {
        
        const deleteId = id || this._fields[this._primaryKey];
        const query: string = `DELETE FROM ${this._tb_name} WHERE ${this._primaryKey} = :id`;

        void await this._conn.query(query, { id: deleteId });
    }

    private async newId(): Promise<number> {

        const query: string = `SELECT IFNULL(MAX(${this._primaryKey}), 0) + 1 as newid 
                       FROM ${this._tb_name} FOR UPDATE`;

        const [rows] = await this._conn.query(query) as RowDataPacket[];
        
        return Number(rows[0].newid);
    }

    protected populateFromRow(row: any) {

        Object.keys(this._fields).forEach(key => {
            if (row[key] !== undefined) {
                this._fields[key] = row[key];
            }
        });

    }

    private buildInsertQuery() {
        
        const fields = Object.keys(this._fields).filter(f => this._fields[f] !== 0);
        const assignments = fields.map(f => `${f} = :${f}`).join(', ');

        return `INSERT INTO ${this._tb_name} SET ${assignments}`;
    }

    private buildUpdateQuery() {
        const fields = Object.keys(this._fields)
            .filter(f => f !== this._primaryKey)
            .map(f => `${f} = :${f}`)
            .join(', ');

        return `UPDATE ${this._tb_name} SET ${fields} WHERE ${this._primaryKey} = :${this._primaryKey}`;
    }
}