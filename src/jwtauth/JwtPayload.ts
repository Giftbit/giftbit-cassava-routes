/**
 * Terse representation of the AuthorizationBadge stored in
 * the JWT payload.  We control this part.
 */
export interface JwtPayload {
    g?: {
        gui?: string;
        gci?: string;
        gri?: string;
        gti?: string;
        gmi?: string;
        pid?: string;
        si?: string;
        tmi?: string;
        spi?: string;
    };
    aud?: string;
    iss?: string;
    iat?: string | number;
    exp?: string | number;
    jti?: string;
    parentJti?: string;
    roles?: string[];
    scopes?: string[];
}
