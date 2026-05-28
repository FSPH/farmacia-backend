import { Connection,RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iTiposRequisicoesFields {
    tip_id : number,
    tip_codigo : string,
    tip_descr : string,
}

export default class TiposRequisicoes extends BaseModel implements iBaseModel,iTiposRequisicoesFields {
    
    constructor(connection : Connection) {
    
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iTiposRequisicoesFields = {
            tip_id: 0,
            tip_codigo: '',
            tip_descr: '',
        };

        super(connection, 'tb_tipos_requisicoes', initFields, 'tip_id');

    }

    get found(): boolean {return this._found;}

    set tip_id(id : number) { this._fields.tip_id = id;}
    get tip_id() :number {return this._fields.tip_id;}

    set tip_codigo(codigo : string) { this._fields.tip_codigo = codigo;}
    get tip_codigo() :string {return this._fields.tip_codigo;}

    set tip_descr(descr : string) { this._fields.tip_descr = descr;}
    get tip_descr() :string {return this._fields.tip_descr;}

    public async Listar() : Promise<iTiposRequisicoesFields[]>{

        let query : string = "SELECT * FROM tb_tipos_requisicoes";

        const [rows] = await this.ExecuteQuery(query) as [iTiposRequisicoesFields[]];

        return rows;

    }

}
