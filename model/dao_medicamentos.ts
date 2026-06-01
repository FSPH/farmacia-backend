import { Connection,RowDataPacket } from "mysql2/promise";
import BaseModel, {iBaseModel} from "./BaseModel.js";

export interface iMedicamentosFields {
    med_id : number,
    med_codigo : string,
    med_descr : string,
    med_descr_coml: string,
    med_und: string,
    med_tipo_codigo: string,
    med_tipo_med: string,
    med_max: number,
    med_min: number,
    med_ui_cx: number,
    med_bona_codigo: string,
    med_alert: number,
    med_ativo : 0 | 1,
    med_diag_id : number,
}

export default class Medicamentos extends BaseModel implements iMedicamentosFields, iBaseModel {
    
    constructor(connection : Connection) {
    
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iMedicamentosFields = {
            med_id: 0,
            med_codigo: '',
            med_descr: '',
            med_descr_coml: '',
            med_und: '',
            med_tipo_codigo: '',
            med_tipo_med: '',
            med_max: 0,
            med_min: 0,
            med_ui_cx: 0,
            med_bona_codigo: '',
            med_alert: 0,
            med_ativo: 0,
            med_diag_id: 0,
        }

        super(connection,'tb_medicamentos',initialFields,'med_id'); 
    }

    set med_id(id: number) { this._fields.med_id = id;}
    get med_id(): number {return this._fields.med_id;}

    set med_codigo(codigo: string) { this._fields.med_codigo = codigo;}
    get med_codigo(): string {return this._fields.med_codigo;}

    set med_descr(descr: string) { this._fields.med_descr = descr;}
    get med_descr(): string {return this._fields.med_descr;}

    set med_descr_coml(descr_coml: string) { this._fields.med_descr_coml = descr_coml;}
    get med_descr_coml(): string {return this._fields.med_descr_coml;}

    set med_und(und: string) { this._fields.med_und = und;}
    get med_und(): string {return this._fields.med_und;}

    set med_tipo_codigo(tipo_codigo: string) { this._fields.med_tipo_codigo = tipo_codigo;}
    get med_tipo_codigo(): string {return this._fields.med_tipo_codigo;}

    set med_tipo_med(tipo_med: string) { this._fields.med_tipo_med = tipo_med;}
    get med_tipo_med(): string {return this._fields.med_tipo_med;}

    set med_max(max: number) { this._fields.med_max = max;}
    get med_max(): number {return this._fields.med_max;}

    set med_min(min: number) { this._fields.med_min = min;}
    get med_min(): number {return this._fields.med_min;}

    set med_ui_cx(ui_cx: number) { this._fields.med_ui_cx = ui_cx;}
    get med_ui_cx(): number {return this._fields.med_ui_cx;}

    set med_bona_codigo(bona_codigo: string) { this._fields.med_bona_codigo = bona_codigo;}
    get med_bona_codigo(): string {return this._fields.med_bona_codigo;}

    set med_alert(alert: number) { this._fields.med_alert = alert;}
    get med_alert(): number {return this._fields.med_alert;}
    
    set med_diag_id(diag_id: number) { this._fields.med_diag_id = diag_id;}
    get med_diag_id(): number {return this._fields.med_diag_id;}
    
    set med_ativo(ativo: 0 | 1) { this._fields.med_ativo = ativo;}
    get med_ativo(): 0 | 1 {return this._fields.med_ativo;}
    
    async ListarTodos(pesq: string) {
        
        let query: string = `SELECT * FROM tb_medicamentos`;

        if (pesq !== '*') {
            query += " WHERE med_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as RowDataPacket[];
        
        return rows as iMedicamentosFields[];
    }

    async ListarAtivos(pesq: string) {
        
        let query : string = `SELECT * FROM tb_medicamentos WHERE med_ativo = 1`;

        if (pesq !== '*') {
            query += " AND med_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as RowDataPacket[];
        
        return rows as iMedicamentosFields[];
    }
}   