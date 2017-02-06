import { JwtPayload } from "./JwtPayload";
export declare class AuthorizationBadge {
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
    constructor(jwtPayload?: JwtPayload);
}
