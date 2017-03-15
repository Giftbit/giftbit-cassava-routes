"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthorizationHeader {
    constructor(jwtHeader) {
        if (jwtHeader) {
            this.version = jwtHeader.ver;
            this.validAfterVersion = jwtHeader.vav;
            this.algorithm = jwtHeader.alg;
            this.type = jwtHeader.typ;
        }
    }
}
exports.AuthorizationHeader = AuthorizationHeader;
//# sourceMappingURL=AuthorizationHeader.js.map