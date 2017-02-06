/**
 * Terse representation of the AuthorizationBadge stored in
 * the JWT payload.
 */
export interface JwtPayload {
    g?: {
        gui?: string;
        gci?: string;
        gri?: string;
        gti?: string;
        gmi?: string;
    };
    aud?: string;
    iss?: string;
    iat?: string;
    exp?: string;
    scopes?: string[];
}
