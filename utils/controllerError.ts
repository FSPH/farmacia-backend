import type { iresdata } from "../controllers/interface_controllers.js";
import GravarLog from "./gravarLogsError.js";

type AppError = Error & {
    statusCode?: number;
};

// Extrai o status HTTP padrao usado pelos controladores do projeto.
export function getErrorStatusCode(error: unknown): number {
    return (error as AppError)?.statusCode || 500;
}

// Mantem a mensagem original para erros conhecidos e usa fallback para falhas internas.
export function getErrorMessage(error: unknown): string {
    return (error as AppError)?.message || "Erro desconhecido";
}

// Garante que o log de erro 500 sempre carregue o stack trace quando ele existir.
export function getErrorStack(error: unknown): string {
    const stack = (error as AppError)?.stack?.trim();

    if (stack) {
        return stack;
    }

    return getErrorMessage(error);
}

// Centraliza o formato de log para todos os erros inesperados do backend.
export function logUnexpectedError(context: string, error: unknown): void {
    GravarLog(`${context} - Erro inesperado: ${getErrorStack(error)}`);
}

// Aplica o contrato padrao de resposta dos controladores e registra stack em erros 500.
export function applyControllerError(resdata: iresdata, error: unknown, context: string): void {
    const statusCode = getErrorStatusCode(error);

    resdata.err = statusCode;
    resdata.status = statusCode;
    resdata.msg = statusCode === 500 ? "Erro desconhecido" : getErrorMessage(error);

    if (statusCode === 500) {
        logUnexpectedError(context, error);
    }
}
