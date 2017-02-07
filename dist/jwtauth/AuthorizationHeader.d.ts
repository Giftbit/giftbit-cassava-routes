import { JwtHeader } from "./JwtHeader";
export declare class AuthorizationHeader {
    version: number;
    validAfterVersion: number;
    algorithm: string;
    type: string;
    constructor(jwtHeader?: JwtHeader);
}
