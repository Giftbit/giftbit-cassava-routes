import { JwtPayload } from "./JwtPayload";
import { RolesConfig } from "../secureConfig/RolesConfig";
/**
 * Expanded representation of the JWT payload.
 */
export declare class AuthorizationBadge {
    giftbitUserId: string;
    merchantId: string;
    cardId: string;
    programId: string;
    recipientId: string;
    templateId: string;
    teamMemberId: string;
    serviceId: string;
    audience: string;
    issuer: string;
    issuedAtTime: Date;
    expirationTime: Date;
    uniqueIdentifier: string;
    roles: string[];
    scopes: string[];
    effectiveScopes: string[];
    constructor(jwtPayload?: JwtPayload, rolesConfig?: RolesConfig);
    private getEffectiveScopes(rolesConfig);
    private getParentScope(scope);
    isBadgeAuthorized(scope: string): boolean;
    requireScopes(...scopes: string[]): void;
    requireIds(...ids: ("giftbitUserId" | "merchantId" | "cardId" | "programId" | "recipientId" | "templateId" | "teamMemberId" | "serviceId")[]): void;
}
