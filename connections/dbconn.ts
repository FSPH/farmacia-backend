import 'dotenv/config';
import { createConnection, Connection } from 'mysql2/promise';

export interface iDatabase {
    connection : Connection,
    Connect() : Promise<void>,
    Disconnect() : Promise<void>,
    Begin() : Promise<void>,
    Commit() : Promise<void>,
    Rollback() : Promise<void>,
}

// Encapsula a conexao MySQL e o controle de transacao usado pelos controllers.
export default class Database implements iDatabase {

    private conn: Connection | null = null;
    private dbname: string;
    private transactionActive = false;

    constructor(dbname: string = 'fsph_farmacia') {
        this.dbname = dbname;
    }

    // Abre a conexao somente quando ela ainda nao existe no ciclo atual.
    public async Connect() : Promise<void> {
        if (this.conn) {
            return;
        }

        this.conn = await createConnection({
            host: process.env.DB_HOST || '172.23.42.17',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'apiuser',
            password: process.env.DB_PASS || 'Abcd@1234!',
            database: this.dbname,
            namedPlaceholders: true,
            decimalNumbers: true,
            dateStrings: true,
            charset: 'utf8mb4'
        });
       
    }

    // Exige que a conexao tenha sido inicializada antes de expor o driver.
    get connection(): Connection {
        if (!this.conn) {
            throw new Error('Conexão com banco de dados não inicializada!');
        }

        return this.conn;
    }

    // Fecha a conexao e reseta o estado da transacao local.
    public async Disconnect(): Promise<void> {
        if (!this.conn) {
            return;
        }

        await this.conn.end();
        this.conn = null;
        this.transactionActive = false;
    }

    // Inicia transacao apenas uma vez por ciclo de requisicao.
    public async Begin(): Promise<void> {
        if (!this.conn || this.transactionActive) {
            return;
        }

        await this.conn.beginTransaction();
        this.transactionActive = true;
    }

    // Confirma alteracoes somente quando ha transacao ativa.
    public async Commit(): Promise<void> {
        if (!this.conn || !this.transactionActive) {
            return;
        }

        await this.conn.commit();
        this.transactionActive = false;
    }

    // Reverte alteracoes pendentes quando alguma etapa falha.
    public async Rollback(): Promise<void> {
        if (!this.conn || !this.transactionActive) {
            return;
        }

        await this.conn.rollback();
        this.transactionActive = false;
    }
}       
