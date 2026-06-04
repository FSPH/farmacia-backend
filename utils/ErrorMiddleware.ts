import { Request, Response, NextFunction } from 'express';
import { logUnexpectedError } from './controllerError.js';

// Fecha o pipeline HTTP com uma resposta JSON uniforme para falhas nao tratadas.
export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (statusCode === 500) {
        logUnexpectedError(`GlobalErrorHandler ${req.method} ${req.originalUrl}`, err);
    }

    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        path: req.originalUrl,
        ...(isDevelopment ? { stack: err.stack } : {}),
    });

};
