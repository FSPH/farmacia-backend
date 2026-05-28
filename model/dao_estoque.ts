import { Connection,RowDataPacket } from "mysql2/promise";
import BaseModel, {iBaseModel} from "./BaseModel.js";

export interface iEstoqueFields {
    est_id: number,
    est_dep_id: number,
    est_med_id: number,
    est_lote: string,
    est_saldo: number,
    est_validade: Date
}

export default class Estoque extends BaseModel implements iEstoqueFields, iBaseModel {

    private connection: Connection;

    constructor(connection: Connection) {
     
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }
        
        const initFields: iEstoqueFields = {
            est_id: 0,
            est_dep_id: 0,
            est_med_id: 0,
            est_lote: '',
            est_saldo: 0,
            est_validade: new Date(),
        };
        
        super(connection, 'tb_estoque', initFields, 'est_id');

        this.connection = connection;
    }

    get found(): boolean {return this._found;}

    set est_id(id: number) { this._fields.est_id = id;}
    get est_id(): number {return this._fields.est_id;}

    set est_dep_id(dep_id: number) { this._fields.est_dep_id = dep_id;}
    get est_dep_id(): number {return this._fields.est_dep_id;}

    set est_med_id(med_id: number) { this._fields.est_med_id = med_id;}
    get est_med_id(): number {return this._fields.est_med_id;}

    set est_lote(lote: string) { this._fields.est_lote = lote;}
    get est_lote(): string {return this._fields.est_lote;}

    set est_saldo(saldo: number) { this._fields.est_saldo = saldo;}
    get est_saldo(): number {return this._fields.est_saldo;}

    set est_validade(validade: Date) { this._fields.est_validade = validade;}
    get est_validade(): Date {return this._fields.est_validade;}
    
    async ListarAtivos(pesq: string = '',dep_id: number,med_tipo_codigo: string) : Promise<iEstoqueFields[]>{

        let query: string = `SELECT m.med_id as id, m.med_descr as descricao, m.med_desc_coml as descricao_comercial,
                             m.und as unidade, e.est_lote as lote, e.est_saldo as saldo, e.est_validade as validade 
                             FROM tb_estoque e
                             LEFT JOIN tb_medicamentos m ON e.est_med_id = m.med_id
                             WHERE e.est_dep_id = :dep_id AND m.med_tipo_codigo = :med_tipo_codigo AND e.est_saldo > 0`;

        if (pesq !== '*') {
            query += " AND m.med_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`, dep_id, med_tipo_codigo});

        return rows as iEstoqueFields[];

    }

    async BuscarPorItemEstoque(med_id: number, dep_id: number, lote: string) : Promise<iEstoqueFields>{

        const query: string = `SELECT * FROM tb_estoque WHERE est_med_id = :med_id AND est_dep_id = :dep_id AND est_lote = :lote`;

        const [rows] = await this.connection.query(query, {med_id, dep_id, lote}) as RowDataPacket[]  ;

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;
    }
}
