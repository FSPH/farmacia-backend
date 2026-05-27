import { Connection,RowDataPacket } from "mysql2/promise";
import BaseModel,{iBaseModel} from "./BaseModel.js";

export interface iRequisicoesFields {
    req_id : number,
    req_tipo: string,
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
}

export default class Requisicoes extends BaseModel implements iRequisicoesFields, iBaseModel {
    private connection: Connection;
    private originalKey: { req_id: number; req_med_id: number; req_lote: string } | null;
    
    constructor(connection : Connection) {
        
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }
        
        const initFields : iRequisicoesFields = {
            req_id: 0,
            req_tipo: '',
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
        };
        
        super(connection,'tb_requisicoes',initFields,'req_id');
        this.connection = connection;
        this.originalKey = null;
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

    private registerOriginalKey(): void {
        this.originalKey = {
            req_id: this.req_id,
            req_med_id: this.req_med_id,
            req_lote: this.req_lote,
        };
    }

    private buildPersistedFields() {
        return {
            req_id: this.req_id,
            req_tipo: this.req_tipo || null,
            req_pac_id: this.req_pac_id || null,
            req_date: this.req_date,
            req_med_id: this.req_med_id,
            req_qtde: this.req_qtde,
            req_lote: this.req_lote,
            req_val_mes: this.req_val_mes || null,
            req_val_ano: this.req_val_ano || null,
            req_dep_id: this.req_dep_id || null,
            req_local_id: this.req_local_id || null,
            req_aprova: this.req_aprova,
            req_solicitado_por: this.req_solicitado_por || null,
            req_aprovado_por: this.req_aprovado_por || null,
        };
    }

    private async nextReqId(): Promise<number> {
        const query = `
            SELECT IFNULL(MAX(req_id), 0) + 1 as newid
            FROM tb_requisicoes
            FOR UPDATE
        `;

        const [rows] = await this.connection.query(query) as RowDataPacket[];
        return Number(rows[0].newid);
    }

    async BuscarPorId(req_id: number): Promise<RowDataPacket> {
        const query = `
            SELECT *
            FROM tb_requisicoes
            WHERE req_id = :req_id
            ORDER BY req_med_id, req_lote
            LIMIT 1
        `;

        const [rows] = await this.connection.query(query, { req_id }) as RowDataPacket[];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
            this.registerOriginalKey();
        } else {
            this._found = false;
            this.originalKey = null;
        }

        return this._fields;
    }

    async BuscarPorChave(req_id: number, req_med_id: number, req_lote: string): Promise<RowDataPacket> {
        const query = `
            SELECT *
            FROM tb_requisicoes
            WHERE req_id = :req_id
              AND req_med_id = :req_med_id
              AND req_lote = :req_lote
            LIMIT 1
        `;

        const [rows] = await this.connection.query(query, {
            req_id,
            req_med_id,
            req_lote,
        }) as RowDataPacket[];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
            this.registerOriginalKey();
        } else {
            this._found = false;
            this.originalKey = null;
        }

        return this._fields;
    }

    async Salvar(): Promise<void> {
        if (!this._found && !this.req_id) {
            this.req_id = await this.nextReqId();
        }

        const fields = this.buildPersistedFields();

        if (this._found && this.originalKey) {
            const updateQuery = `
                UPDATE tb_requisicoes
                SET req_id = :req_id,
                    req_tipo = :req_tipo,
                    req_pac_id = :req_pac_id,
                    req_date = :req_date,
                    req_med_id = :req_med_id,
                    req_qtde = :req_qtde,
                    req_lote = :req_lote,
                    req_val_mes = :req_val_mes,
                    req_val_ano = :req_val_ano,
                    req_dep_id = :req_dep_id,
                    req_local_id = :req_local_id,
                    req_aprova = :req_aprova,
                    req_solicitado_por = :req_solicitado_por,
                    req_aprovado_por = :req_aprovado_por
                WHERE req_id = :original_req_id
                  AND req_med_id = :original_req_med_id
                  AND req_lote = :original_req_lote
            `;

            await this.connection.query(updateQuery, {
                ...fields,
                original_req_id: this.originalKey.req_id,
                original_req_med_id: this.originalKey.req_med_id,
                original_req_lote: this.originalKey.req_lote,
            });
        } else {
            const insertQuery = `
                INSERT INTO tb_requisicoes
                SET req_id = :req_id,
                    req_tipo = :req_tipo,
                    req_pac_id = :req_pac_id,
                    req_date = :req_date,
                    req_med_id = :req_med_id,
                    req_qtde = :req_qtde,
                    req_lote = :req_lote,
                    req_val_mes = :req_val_mes,
                    req_val_ano = :req_val_ano,
                    req_dep_id = :req_dep_id,
                    req_local_id = :req_local_id,
                    req_aprova = :req_aprova,
                    req_solicitado_por = :req_solicitado_por,
                    req_aprovado_por = :req_aprovado_por
            `;

            await this.connection.query(insertQuery, fields);
        }

        this._found = true;
        this.registerOriginalKey();
    }

    async Excluir(id?: number): Promise<void> {
        if (this.originalKey) {
            const deleteQuery = `
                DELETE FROM tb_requisicoes
                WHERE req_id = :req_id
                  AND req_med_id = :req_med_id
                  AND req_lote = :req_lote
            `;

            await this.connection.query(deleteQuery, this.originalKey);
            return;
        }

        await this.connection.query(
            'DELETE FROM tb_requisicoes WHERE req_id = :req_id',
            { req_id: id || this.req_id },
        );
    }

    public async ListarPorPeriodo(dat_ini: Date, dat_fim: Date, aprova?: 0 | 1, tipo?: string) : Promise<iRequisicoesFields[]>{

        let query: string = `SELECT r.req_id as id,r.req_date as data,r.req_tipo as tipo_codigo, tr.tip_descr as tipo_descr,
                             p.nom_paciente as paciente, l.local_descr as local_descr, d.dep_descr as deposito_descr,
                             m.med_descr as medicamento, m.med_und as unidade, r.req_med_id as med_id,
                             r.req_lote as lote,r.req_qtde as quantidade, r.req_aprova as aprovado,
                             r.req_pac_id as paciente_id, r.req_dep_id as deposito_id, r.req_local_id as local_id,
                             r.req_solicitado_por, r.req_aprovado_por
                             FROM tb_requisicoes r
                             LEFT JOIN fsph_ambulatorio.tb_pacientes p ON r.req_pac_id = p.num_paciente
                             LEFT JOIN tb_medicamentos m ON r.req_med_id = m.med_id
                             LEFT JOIN tb_locais l ON r.req_local_id = l.local_id
                             LEFT JOIN tb_depositos d ON r.req_dep_id = d.dep_id
                             LEFT JOIN tb_tipos_requisicoes tr ON r.req_tipo = tr.tip_codigo
                             WHERE r.req_date >= :dat_ini AND r.req_date <= :dat_fim`;

        const params: Record<string, any> = { dat_ini, dat_fim, aprova, tipo };

        if (aprova !== undefined) {
            query += ' AND r.req_aprova = :aprova';
        }

        if (tipo) {
            query += ' AND r.req_tipo = :tipo';
        }

        query += ' ORDER BY r.req_date DESC, r.req_id DESC';

        const [rows] = await this.ExecuteQuery(query, params) as RowDataPacket[];

        return rows as iRequisicoesFields[];

    }

    public async BuscarPorIdDetalhado(req_id: number) {
        const query = `
            SELECT
                r.*,
                p.nom_paciente,
                m.med_descr,
                m.med_descr_coml,
                m.med_und,
                l.local_descr,
                d.dep_descr,
                tr.tip_descr
            FROM tb_requisicoes r
            LEFT JOIN fsph_ambulatorio.tb_pacientes p ON r.req_pac_id = p.num_paciente
            LEFT JOIN tb_medicamentos m ON r.req_med_id = m.med_id
            LEFT JOIN tb_locais l ON r.req_local_id = l.local_id
            LEFT JOIN tb_depositos d ON r.req_dep_id = d.dep_id
            LEFT JOIN tb_tipos_requisicoes tr ON r.req_tipo = tr.tip_codigo
            WHERE r.req_id = :req_id
            LIMIT 1
        `;

        const [rows] = await this.ExecuteQuery(query, { req_id }) as RowDataPacket[];

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
            return rows[0];
        }

        this._found = false;
        return null;
    }
   
}
