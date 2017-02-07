import {JwtHeader} from "./JwtHeader";

export class AuthorizationHeader {

    version: number;
    validAfterVersion: number;
    algorithm: string;
    type: string;

    constructor(jwtHeader: JwtHeader) {
        if (jwtHeader) {
            this.version = jwtHeader.ver;
            this.validAfterVersion = jwtHeader.vav;
            this.algorithm = jwtHeader.alg;
            this.type = jwtHeader.typ;
        }
    }
}