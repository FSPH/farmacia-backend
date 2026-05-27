import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    const isDevelopment = process.env.NODE_ENV !== 'production';

    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        path: req.originalUrl,
        ...(isDevelopment ? { stack: err.stack } : {}),
    });

};
