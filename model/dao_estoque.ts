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

export interface iEstoqueFiltro {
    pesq?: string;
    dep_id?: number;
    med_id?: number;
    med_tipo_codigo?: string;
    alerta?: 'critico' | 'vencendo' | 'vencido' | '';
    dias_alerta?: number;
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
    
    async ListarAtivos(filtros: iEstoqueFiltro = {}) : Promise<iEstoqueFields[]>{
        const {
            pesq = '*',
            dep_id,
            med_id,
            med_tipo_codigo,
            alerta = '',
            dias_alerta = 90,
        } = filtros;

        let query = `
            SELECT
                e.est_id,
                e.est_dep_id,
                d.dep_descr,
                e.est_med_id,
                m.med_descr,
                m.med_descr_coml,
                m.med_und,
                m.med_tipo_codigo,
                m.med_min,
                m.med_alert,
                e.est_lote,
                e.est_saldo,
                e.est_validade,
                DATEDIFF(e.est_validade, CURDATE()) AS dias_para_vencer
            FROM tb_estoque e
            INNER JOIN tb_medicamentos m ON e.est_med_id = m.med_id
            INNER JOIN tb_depositos d ON e.est_dep_id = d.dep_id
            WHERE e.est_saldo > 0
        `;

        const params: Record<string, any> = {
            pesq: `%${pesq}%`,
            dep_id,
            med_id,
            med_tipo_codigo,
            dias_alerta,
        };

        if (dep_id) {
            query += ' AND e.est_dep_id = :dep_id';
        }

        if (med_id) {
            query += ' AND e.est_med_id = :med_id';
        }

        if (med_tipo_codigo) {
            query += ' AND m.med_tipo_codigo = :med_tipo_codigo';
        }

        if (pesq !== '*') {
            query += ' AND (m.med_descr LIKE :pesq OR m.med_descr_coml LIKE :pesq OR e.est_lote LIKE :pesq)';
        }

        if (alerta === 'critico') {
            query += ' AND e.est_saldo <= COALESCE(NULLIF(m.med_min, 0), NULLIF(m.med_alert, 0), 0)';
        }

        if (alerta === 'vencendo') {
            query += ' AND e.est_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL :dias_alerta DAY)';
        }

        if (alerta === 'vencido') {
            query += ' AND e.est_validade < CURDATE()';
        }

        query += ' ORDER BY d.dep_descr, m.med_descr, e.est_validade, e.est_lote';

        const [rows] = await this.ExecuteQuery(query, params);

        return rows as iEstoqueFields[];

    }

    async ListarAlertas(dep_id?: number, dias_alerta: number = 90) {
        return this.ListarAtivos({
            dep_id,
            dias_alerta,
        });
    }

    async ListarMovimentacao(med_id: number, lote: string) {
        const query = `
            SELECT
                movimento,
                data_movimento,
                lote,
                quantidade,
                documento,
                fornecedor,
                deposito_id,
                local_id,
                paciente_id,
                usuario
            FROM (
                SELECT
                    'ENTRADA' AS movimento,
                    e.ent_date AS data_movimento,
                    e.ent_lote AS lote,
                    e.ent_qtde AS quantidade,
                    e.ent_doc AS documento,
                    e.ent_fornecido_por AS fornecedor,
                    NULL AS deposito_id,
                    NULL AS local_id,
                    NULL AS paciente_id,
                    NULL AS usuario
                FROM tb_entradas e
                WHERE e.ent_med_id = :med_id AND e.ent_lote = :lote

                UNION ALL

                SELECT
                    'REQUISICAO_APROVADA' AS movimento,
                    r.req_date AS data_movimento,
                    r.req_lote AS lote,
                    r.req_qtde * -1 AS quantidade,
                    NULL AS documento,
                    NULL AS fornecedor,
                    r.req_dep_id AS deposito_id,
                    r.req_local_id AS local_id,
                    r.req_pac_id AS paciente_id,
                    r.req_aprovado_por AS usuario
                FROM tb_requisicoes r
                WHERE r.req_med_id = :med_id AND r.req_lote = :lote AND r.req_aprova = 1
            ) movimentacoes
            ORDER BY data_movimento, movimento
        `;

        const [rows] = await this.ExecuteQuery(query, { med_id, lote });

        return rows;
    }

    async BuscarPorItemEstoque(med_id: number, dep_id: number, lote: string, forUpdate: boolean = false) : Promise<iEstoqueFields>{

        let query: string = `SELECT * FROM tb_estoque WHERE est_med_id = :med_id AND est_dep_id = :dep_id AND est_lote = :lote`;

        if (forUpdate) {
            query += ' FOR UPDATE';
        }

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
