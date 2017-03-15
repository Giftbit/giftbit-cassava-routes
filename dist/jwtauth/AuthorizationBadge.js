"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthorizationBadge {
    constructor(jwtPayload) {
        if (jwtPayload) {
            if (jwtPayload.g) {
                this.giftbitUserId = jwtPayload.g.gui;
                this.cardId = jwtPayload.g.gci;
                this.recipientId = jwtPayload.g.gri;
                this.templateId = jwtPayload.g.gti;
                this.merchantId = jwtPayload.g.gmi;
            }
            this.audience = jwtPayload.aud;
            this.issuer = jwtPayload.iss;
            this.scopes = jwtPayload.scopes;
            this.uniqueIdentifier = jwtPayload.jti;
            if (jwtPayload.iat) {
                this.issuedAtTime = new Date(jwtPayload.iat);
            }
            if (jwtPayload.exp) {
                this.expirationTime = new Date(jwtPayload.exp);
            }
        }
    }
}
exports.AuthorizationBadge = AuthorizationBadge;
//# sourceMappingURL=AuthorizationBadge.js.map