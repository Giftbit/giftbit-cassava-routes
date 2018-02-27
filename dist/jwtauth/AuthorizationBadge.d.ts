import { JwtPayload } from "./JwtPayload";
import { RolesConfig } from "../secureConfig/RolesConfig";
/**
 * Expanded representation of the JWT payload.
 */
export declare class AuthorizationBadge {
    private readonly rolesConfig;
    giftbitUserId: string;
    merchantId: string;
    cardId: string;
    programId: string;
    recipientId: string;
    templateId: string;
    teamMemberId: string;
    serviceId: string;
    shopperId: string;
    metadata: {
        [name: string]: any;
    };
    audience: string;
    issuer: string;
    issuedAtTime: Date;
    expirationTime: Date;
    uniqueIdentifier: string;
    parentUniqueIdentifier: string;
    roles: string[];
    scopes: string[];
    effectiveScopes: string[];
    constructor(jwtPayload?: JwtPayload, rolesConfig?: RolesConfig);
    getJwtPayload(): JwtPayload;
    sign(secret: string): string;
    assumeJwtIdentity(jwtPayload: JwtPayload): AuthorizationBadge;
    requireIds(...ids: ("giftbitUserId" | "merchantId" | "cardId" | "programId" | "recipientId" | "templateId" | "teamMemberId" | "serviceId")[]): void;
    isBadgeAuthorized(scope: string): boolean;
    requireScopes(...scopes: string[]): void;
    private getEffectiveScopes(rolesConfig);
    isTestUser(): boolean;
}
