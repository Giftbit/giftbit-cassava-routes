/**
 * Terse representation of the AuthorizationBadge stored in
 * the JWT payload.  We control this part.
 */
export interface JwtPayload {
    g?: {
        gui?: string;
        tmi?: string;
        gmi?: string;
        gvi?: string;
        pid?: string;
        coi?: string;
        si?: string;
    };
    metadata?: {[name: string]: any};
    aud?: string;
    iss?: string;
    iat?: string | number;
    exp?: string | number;
    jti?: string;
    parentJti?: string;
    roles?: string[];
    scopes?: string[];
}

export namespace JwtPayload {
    export function isTestUser(payload: JwtPayload): boolean {
        return payload && payload.g && payload.g.gui && payload.g.gui.endsWith("-TEST");
    }
}
