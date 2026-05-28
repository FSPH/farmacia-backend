import {Connection,RowDataPacket} from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iTiposMedicamentosFields {
    tipo_id : number,
    tipo_codigo : string,
    tipo_descr : string,
    tipo_ativo : 0 | 1
}


export default class TiposMedicamentos extends BaseModel implements iBaseModel, iTiposMedicamentosFields {
        
    constructor(connection : Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iTiposMedicamentosFields = {
            tipo_id: 0,
            tipo_codigo: '',
            tipo_descr: '',
            tipo_ativo: 0
        };

        super(connection, 'tb_tipos_produtos', initFields, 'tipo_id');

    }

    get found() :boolean {return this._found;}

    set tipo_id(id : number) { this._fields.tipo_id = id;}
    get tipo_id() :number {return this._fields.tipo_id;}

    set tipo_codigo(codigo : string) { this._fields.tipo_codigo = codigo;}
    get tipo_codigo() :string {return this._fields.tipo_codigo;}

    set tipo_descr(descr : string) { this._fields.tipo_descr = descr;}
    get tipo_descr() :string {return this._fields.tipo_descr;}

    set tipo_ativo(ativo : 0 | 1) { this._fields.tipo_ativo = ativo;}
    get tipo_ativo() : 0 | 1 {return this._fields.tipo_ativo;}

    public async BuscarPorCodigo(tipo_codigo : string) : Promise<iTiposMedicamentosFields>{

        const query : string = "SELECT * FROM tb_tipos_produtos WHERE tipo_codigo = :tipo_codigo";

        const [rows]: RowDataPacket[] = await this.ExecuteQuery(query, {tipo_codigo});

        if (rows[0]) {
            this._fields = rows[0] as iTiposMedicamentosFields;
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;

    }

    public async Listar(pesq : string): Promise<iTiposMedicamentosFields[]> {

        let query : string = "SELECT * FROM tb_tipos_produtos";

        if (pesq !== '*') {
            query += " WHERE tipo_descr LIKE :pesq";
        }

        const [rows]: RowDataPacket[] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`});

        return rows as iTiposMedicamentosFields[];

    }

}