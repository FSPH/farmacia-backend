import { Connection, RowDataPacket } from 'mysql2/promise';

export interface iPacienteFields {
    num_paciente: number;
    nom_paciente: string;
    nom_social: string | null;
    dt_nascimento: string | null;
    cpf: string | null;
    cns: string | null;
    sexo: string | null;
    telefone: string | null;
    celular: string | null;
    email: string | null;
    endereco: string | null;
    numero: string | null;
    bairro: string | null;
    cep: string | null;
    uf: string | null;
    nom_mae: string | null;
    nom_pai: string | null;
    responsavel: string | null;
    tem_alergia: string | null;
    qual: string | null;
}

export default class Pacientes {
    private connection: Connection;

    constructor(connection: Connection) {
        if (!connection) {
            throw new Error('Conexão com o banco de dados não estabelecida.');
        }

        this.connection = connection;
    }

    async Listar(q: string = '', limit: number = 20): Promise<iPacienteFields[]> {
        let query = `
            SELECT
                num_paciente,
                nom_paciente,
                nom_social,
                dt_nascimento,
                cpf,
                cns,
                sexo,
                telefone,
                celular,
                email,
                endereco,
                numero,
                bairro,
                cep,
                uf,
                nom_mae,
                nom_pai,
                responsavel,
                tem_alergia,
                qual
            FROM fsph_ambulatorio.tb_pacientes
            WHERE 1 = 1
        `;

        const params: Record<string, any> = {
            q: `%${q}%`,
            limit: Math.max(1, Math.min(limit, 100)),
        };

        if (q && q !== '*') {
            query += `
                AND (
                    nom_paciente LIKE :q
                    OR nom_social LIKE :q
                    OR cpf LIKE :q
                    OR CAST(num_paciente AS CHAR) LIKE :q
                )
            `;
        }

        query += ' ORDER BY nom_paciente LIMIT :limit';

        const [rows] = await this.connection.query(query, params) as RowDataPacket[];

        return rows as iPacienteFields[];
    }

    async BuscarPorId(num_paciente: number): Promise<iPacienteFields | null> {
        const query = `
            SELECT
                num_paciente,
                nom_paciente,
                nom_social,
                dt_nascimento,
                cpf,
                cns,
                sexo,
                telefone,
                celular,
                email,
                endereco,
                numero,
                bairro,
                cep,
                uf,
                nom_mae,
                nom_pai,
                responsavel,
                tem_alergia,
                qual
            FROM fsph_ambulatorio.tb_pacientes
            WHERE num_paciente = :num_paciente
            LIMIT 1
        `;

        const [rows] = await this.connection.query(query, { num_paciente }) as RowDataPacket[];

        if (!rows.length) {
            return null;
        }

        return rows[0] as iPacienteFields;
    }
}
