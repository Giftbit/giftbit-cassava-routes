import {JwtPayload} from "./JwtPayload";

export class AuthorizationBadge {

    giftbitUserId: string;
    merchantId: string;
    cardId: string;
    recipientId: string;
    templateId: string;

    audience: string;
    issuer: string;
    issuedAtTime: Date;
    expirationTime: Date;

    scopes: string[];

    constructor(jwtPayload?: JwtPayload) {
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

            if (jwtPayload.iat) {
                this.issuedAtTime = new Date(jwtPayload.iat);
            }

            if (jwtPayload.exp) {
                this.expirationTime = new Date(jwtPayload.exp);
            }
        }
    }
}
