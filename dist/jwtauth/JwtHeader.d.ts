/**
 * JWT header as defined in the spec.  We don't control this part.
 */
export interface JwtHeader {
    ver?: number;
    vav?: number;
    alg?: string;
    typ?: string;
}
