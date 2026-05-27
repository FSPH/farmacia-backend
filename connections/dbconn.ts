import {createConnection,Connection} from 'mysql2/promise';

export interface iDatabase {
    connection : Connection,
    Connect() : Promise<void>,
    Disconnect() : Promise<void>,
    Begin() : Promise<void>,
    Commit() : Promise<void>,
    Rollback() : Promise<void>,
}

export default class Database implements iDatabase {

    private conn: Connection = {} as Connection;
    private dbname: string;

    constructor(dbname: string = 'fsph_farmacia') {
        this.dbname = dbname;
    }

    public async Connect() : Promise<void> {
 
        this.conn = await createConnection({
            host: '172.23.42.17',
            user: 'apiuser',
            password: 'Abcd@1234!',
            database: this.dbname,
            namedPlaceholders: true,
            decimalNumbers: true,
            dateStrings: true
        });
       
    }

    get connection(): Connection {return this.conn;}

    public async Disconnect(): Promise<void> {
    
        if (this.conn) {
            await this.conn.end();
            this.conn = {} as Connection;
        }
    }

    public async Begin(): Promise<void> {

        if (this.conn) {
            await this.conn.beginTransaction();
        }
    }

    public async Commit(): Promise<void> {

        if (this.conn) {
            await this.conn.commit();
        }
    }

    public async Rollback(): Promise<void> {

        if (this.conn) {
            await this.conn.rollback();
        }
    }
}       