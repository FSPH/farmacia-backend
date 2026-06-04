import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { AuthUser } from '../types/auth.js';
import { logUnexpectedError } from '../utils/controllerError.js';

// Interpreta flags booleanas do ambiente sem depender de capitalizacao.
function isEnabled(value?: string): boolean {
    return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

// Extrai o token Bearer do cabecalho Authorization.
function parseBearerToken(header?: string): string | null {
    if (!header) {
        return null;
    }

    const [scheme, token] = header.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
        return null;
    }

    return token.trim();
}

// Carrega a chave de verificacao na ordem de prioridade definida pelo ambiente.
function loadVerificationKey(): string | null {
    const publicKey = process.env.AUTH_JWT_PUBLIC_KEY?.trim();
    const publicKeyBase64 = process.env.AUTH_JWT_PUBLIC_KEY_BASE64?.trim();
    const secret = process.env.AUTH_JWT_SECRET?.trim();

    if (publicKey) {
        return publicKey.replace(/\\n/g, '\n');
    }

    if (publicKeyBase64) {
        return Buffer.from(publicKeyBase64, 'base64').toString('utf-8');
    }

    return secret || null;
}

// Normaliza os papeis do payload para um array simples de strings.
function normalizeRoles(payload: JwtPayload | Record<string, any>): string[] {
    const rawRoles = payload.roles || payload.role || payload.authorities || payload.groups || [];

    if (Array.isArray(rawRoles)) {
        return rawRoles.map(role => String(role).trim()).filter(Boolean);
    }

    if (typeof rawRoles === 'string') {
        return rawRoles
            .split(',')
            .map(role => role.trim())
            .filter(Boolean);
    }

    return [];
}

// Constrói o usuario autenticado que sera anexado ao request.
function buildAuthUser(payload: JwtPayload | Record<string, any>, tokenVerified: boolean): AuthUser {
    const name = String(
        payload.name ||
        payload.preferred_username ||
        payload.username ||
        payload.user_name ||
        payload.sub ||
        'USUARIO_AUTENTICADO'
    ).trim();

    return {
        id: String(payload.sub || payload.user_id || payload.uid || name),
        name,
        roles: normalizeRoles(payload),
        tokenVerified,
        claims: payload,
    };
}

// Valida tokens externos e anexa as claims do usuario autenticado na requisicao.
export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authRequired = isEnabled(process.env.AUTH_REQUIRED);
    const allowUnverifiedTokens = isEnabled(process.env.AUTH_ALLOW_UNVERIFIED_TOKENS);
    const token = parseBearerToken(req.headers.authorization);

    if (!token) {
        if (authRequired) {
            return res.status(401).json({
                err: 401,
                msg: 'Token Bearer não informado.',
                status: 401,
                data: null,
            });
        }

        return next();
    }

    const verificationKey = loadVerificationKey();
    const algorithms = process.env.AUTH_JWT_ALGORITHMS
        ?.split(',')
        .map(item => item.trim())
        .filter(Boolean);

    try {
        if (verificationKey) {
            const payload = jwt.verify(
                token,
                verificationKey,
                algorithms?.length ? { algorithms } : undefined,
            ) as JwtPayload;

            req.authUser = buildAuthUser(payload, true);
            return next();
        }

        if (!allowUnverifiedTokens) {
            const message = 'Autenticação habilitada, mas sem chave pública/segredo configurado para validar o token externo.';

            if (authRequired) {
                logUnexpectedError('AuthMiddleware', new Error(message));
            }

            return res.status(authRequired ? 500 : 401).json({
                err: authRequired ? 500 : 401,
                msg: authRequired
                    ? message
                    : 'Token inválido.',
                status: authRequired ? 500 : 401,
                data: null,
            });
        }

        const decoded = jwt.decode(token);

        if (!decoded || typeof decoded === 'string') {
            return res.status(401).json({
                err: 401,
                msg: 'Token inválido.',
                status: 401,
                data: null,
            });
        }

        req.authUser = buildAuthUser(decoded, false);
        return next();
    } catch (error: any) {
        return res.status(401).json({
            err: 401,
            msg: error.message || 'Falha ao validar token.',
            status: 401,
            data: null,
        });
    }
}
