import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    const stack = err.stack;

    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        stack,
        message
    });

};
