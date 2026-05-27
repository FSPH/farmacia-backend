declare module 'jsonwebtoken' {
    export interface JwtPayload {
        [key: string]: any;
        sub?: string;
        name?: string;
    }

    export type Algorithm = string;

    export interface VerifyOptions {
        algorithms?: Algorithm[];
    }

    interface JsonWebTokenApi {
        verify(token: string, secretOrPublicKey: string, options?: VerifyOptions): JwtPayload | string;
        decode(token: string): JwtPayload | string | null;
    }

    const jwt: JsonWebTokenApi;
    export default jwt;
}
