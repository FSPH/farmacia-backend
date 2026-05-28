import { Connection,RowDataPacket } from "mysql2/promise";
import BaseModel,{iBaseModel} from "./BaseModel.js";

export interface iRequisicoesFields {
    req_id : number,
    req_pac_id : number,
    req_date : Date,
    req_med_id : number,
    req_qtde : number,
    req_lote: string ,
    req_val_mes: number,
    req_val_ano: number,
    req_dep_id: number,
    req_local_id: number,
    req_aprova: 0 | 1,
    req_solicitado_por: string,
    req_aprovado_por: string,
    req_tipo: string
}

export default class Requisicoes extends BaseModel implements iRequisicoesFields, iBaseModel {
    
    constructor(connection : Connection) {
        
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }
        
        const initFields : iRequisicoesFields = {
            req_id: 0,
            req_pac_id: 0,
            req_date: new Date(),
            req_med_id: 0,
            req_qtde: 0,
            req_lote: '',
            req_val_mes: 0,
            req_val_ano: 0,
            req_dep_id: 0,
            req_local_id: 0,
            req_aprova: 0,
            req_solicitado_por: '',
            req_aprovado_por: '',
            req_tipo: ''
        };
        
        super(connection,'tb_requisicoes',initFields,'req_id');
    }

    get found(): boolean {return this._found;}

    set req_id(id: number) { this._fields.req_id = id;}
    get req_id(): number {return this._fields.req_id;}

    set req_pac_id(pac_id: number) { this._fields.req_pac_id = pac_id;}
    get req_pac_id(): number {return this._fields.req_pac_id;}

    set req_date(date: Date) { this._fields.req_date = date;}
    get req_date(): Date {return this._fields.req_date;}

    set req_med_id(med_id: number) { this._fields.req_med_id = med_id;}
    get req_med_id(): number {return this._fields.req_med_id;}

    set req_qtde(qtde: number) { this._fields.req_qtde = qtde;}
    get req_qtde(): number {return this._fields.req_qtde;}

    set req_lote(lote: string) { this._fields.req_lote = lote;}
    get req_lote(): string {return this._fields.req_lote;}

    set req_val_mes(val_mes: number) { this._fields.req_val_mes = val_mes;}
    get req_val_mes(): number {return this._fields.req_val_mes;}

    set req_val_ano(val_ano: number) { this._fields.req_val_ano = val_ano;}
    get req_val_ano(): number {return this._fields.req_val_ano;}

    set req_dep_id(dep_id: number) { this._fields.req_dep_id = dep_id;}
    get req_dep_id(): number {return this._fields.req_dep_id;}

    set req_local_id(local_id: number) { this._fields.req_local_id = local_id;}
    get req_local_id(): number {return this._fields.req_local_id;}

    set req_aprova(aprova: 0 | 1) { this._fields.req_aprova = aprova;}
    get req_aprova(): 0 | 1 {return this._fields.req_aprova;}

    set req_tipo(tipo: string) { this._fields.req_tipo = tipo;}
    get req_tipo(): string {return this._fields.req_tipo;}

    set req_solicitado_por(solicitado_por: string) { this._fields.req_solicitado_por = solicitado_por;}
    get req_solicitado_por(): string {return this._fields.req_solicitado_por;}

    set req_aprovado_por(aprovado_por: string) { this._fields.req_aprovado_por = aprovado_por;}
    get req_aprovado_por(): string {return this._fields.req_aprovado_por;}

    public async ListarPorPeriodo(dat_ini: Date, dat_fim: Date, aprova: 0 | 1 = 0) : Promise<iRequisicoesFields[]>{

        let query: string = `SELECT r.req_id as ID,r.req_date as data,p.nom_paciente as paciente, m.med_descr as medicamento, m.med_und as unidade, 
                             r.req_lote as lote,r.req_qtde as quantidade
                             FROM tb_requisicoes r
                             LEFT JOIN fsph_ambulatorio.tb_pacientes p ON r.req_pac_id = p.num_paciente
                             LEFT JOIN tb_medicamentos m ON r.req_med_id = m.med_id
                             WHERE r.req_date >= :dat_ini AND r.req_date <= :dat_fim AND r.req_aprova = :aprova`;

        const [rows] = await this.ExecuteQuery(query, {dat_ini, dat_fim, aprova}) as RowDataPacket[];

        return rows as iRequisicoesFields[];

    }
   
}
