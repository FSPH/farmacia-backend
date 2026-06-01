import { Connection, RowDataPacket } from "mysql2/promise";
import Database,{iDatabase} from "../connections/dbconn.js";
import BaseModel,{iBaseModel} from "./BaseModel.js";

export interface iGaucherFields {
    gau_id : number,
    gau_pac_id : number,
    gau_medico_assis : string,
    gau_medico_crm : string,
    gau_med_id : number,    
    gua_qtde_medicamento: number,
    gau_ativo : 0 | 1,
}

export default class Gaucher extends BaseModel implements iBaseModel,iGaucherFields {
    
    private connection: Connection;
    
    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iGaucherFields = {
            gau_id: 0,
            gau_pac_id: 0,
            gau_medico_assis: '',
            gau_medico_crm: '',
            gau_med_id: 0,
            gua_qtde_medicamento: 0,
            gau_ativo: 0,
        }
        
        super(connection, 'tb_pacientes_gaucher', initialFields, 'gau_id');

        this.connection = connection;
    }

    get found() {return this._found;}

    set gau_id(id: number) {this._fields.gau_id = id;}
    get gau_id() {return this._fields.gau_id;}
    
    set gau_pac_id(pac_id: number) {this._fields.gau_pac_id = pac_id;}
    get gau_pac_id() {return this._fields.gau_pac_id;}
    
    set gau_medico_assis(medico_assis: string) {this._fields.gau_medico_assis = medico_assis;}
    get gau_medico_assis() {return this._fields.gau_medico_assis;}
    
    set gau_medico_crm(medico_crm: string) {this._fields.gau_medico_crm = medico_crm;}
    get gau_medico_crm() {return this._fields.gau_medico_crm;}
    
    set gau_med_id(med_id: number) {this._fields.gau_med_id = med_id;}
    get gau_med_id() {return this._fields.gau_med_id;}
    
    set gua_qtde_medicamento(qtde_medicamento: number) {this._fields.gua_qtde_medicamento = qtde_medicamento;}
    get gua_qtde_medicamento() {return this._fields.gua_qtde_medicamento;}
    
    set gau_ativo(ativo: 0 | 1) {this._fields.gau_ativo = ativo;}
    get gau_ativo() {return this._fields.gau_ativo;}
    
    async ListarPacientesGaucher() {

        const query = `SELECT g.gau_id as id, g.gau_pac_id as num_pacientes, p.nom_paciente as nome_paciente, p.dt_nascimento as data_nascimento,
                       g.gau_medico_assis as medico_assistente, g.gau_medico_crm as medico_crm, m.med_descr as medicamento, g.gau_qtde_medicamento as qtde_medicamento, g.gau_ativo as ativo 
                       FROM tb_pacientes_gaucher g 
                       LEFT JOIN fsph_ambulatorio.tb_pacientes p ON g.gau_pac_id = p.num_paciente
                       LEFT JOIN tb_medicamentos m ON g.gau_med_id = m.med_id`;
        
        const [rows] = await this.connection.query(query) as RowDataPacket[];
        return rows;
    }

    async BuscarPorPaciente(pac_id: number) {

        const query = `SELECT * FROM tb_pacientes_gaucher WHERE gau_pac_id = :pac_id`;
        
        const [rows] = await this.connection.query(query, { pac_id })  as RowDataPacket[];
        
        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;
    }
}
