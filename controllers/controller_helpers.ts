import type { iDatabase } from '../connections/dbconn.js';
import type { iresdata } from './interface_controllers.js';
import GravarLog from '../utils/gravarLogsError.js';

export async function safeRollback(db: iDatabase): Promise<void> {
    try {
        await db.Rollback();
    } catch {
        // Ignora rollback secundário para preservar o erro original.
    }
}

export async function safeDisconnect(db: iDatabase): Promise<void> {
    try {
        await db.Disconnect();
    } catch {
        // Ignora erro de cleanup da conexão.
    }
}

export function assignControllerError(
    resdata: iresdata,
    error: any,
    context: string,
): void {
    resdata.err = error.statusCode || 500;
    resdata.status = error.statusCode || 500;
    resdata.msg = resdata.status === 500 ? 'Erro desconhecido' : error.message;

    if (resdata.status === 500) {
        GravarLog(`${context} - Erro inesperado: ${error.stack}`);
    }
}
