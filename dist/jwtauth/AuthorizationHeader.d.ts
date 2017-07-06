import { JwtHeader } from "./JwtHeader";
/**
 * Expanded representation of the JWT header.
 */
export declare class AuthorizationHeader {
    version: number;
    validAfterVersion: number;
    algorithm: string;
    type: string;
    constructor(jwtHeader?: JwtHeader);
}
