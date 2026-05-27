export interface AuthUser {
    id: string;
    name: string;
    roles: string[];
    tokenVerified: boolean;
    claims: Record<string, any>;
}
