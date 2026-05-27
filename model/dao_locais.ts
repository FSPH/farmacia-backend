import { Connection,RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

enum eAtivo {
    Inativo = 0,
    Ativo = 1,
}

export interface iLocaisFields {
    local_id : number,
    local_descr : string,
    local_ativo : eAtivo,
}

export default class Locais extends BaseModel implements iBaseModel,iLocaisFields {
    
    constructor(connection : Connection) {
    
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iLocaisFields = {
            local_id: 0,
            local_descr: '',
            local_ativo: 0,
        };

        super(connection, 'tb_locais', initFields, 'local_id');

    }

    get found(): boolean {return this._found;}

    set local_id(id : number) { this._fields.local_id = id;}
    get local_id() :number {return this._fields.local_id;}

    set local_descr(descr : string) { this._fields.local_descr = descr;}
    get local_descr() :string {return this._fields.local_descr;}

    set local_ativo(ativo : eAtivo) { this._fields.local_ativo = ativo;}
    get local_ativo() : eAtivo {return this._fields.local_ativo;}

    public async Listar(pesq : string = '') : Promise<iLocaisFields[]>{

        let query : string = "SELECT * FROM tb_locais";

        if (pesq !== '*') {
            query += " WHERE local_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as [iLocaisFields[]];

        return rows;

    }

}
