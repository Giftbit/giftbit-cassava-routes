import { JwtPayload } from "./JwtPayload";
import { RolesConfig } from "../secureConfig";
/**
 * Expanded representation of the JWT payload.
 */
export declare class AuthorizationBadge {
    private readonly rolesConfig;
    giftbitUserId: string;
    teamMemberId: string;
    merchantId: string;
    cardId: string;
    templateId: string;
    programId: string;
    contactUserSuppliedId: string;
    shopperId: string;
    contactId: string;
    serviceId: string;
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
    getAuthorizeAsPayload(): string;
    sign(secret: string): string;
    assumeJwtIdentity(jwtPayload: JwtPayload): AuthorizationBadge;
    requireIds(...ids: (keyof this)[]): void;
    isBadgeAuthorized(scope: string): boolean;
    requireScopes(...scopes: string[]): void;
    /**
     * Save the merchant from themselves.
     */
    private sanitizeMerchantSigned();
    private getEffectiveScopes(rolesConfig);
    isTestUser(): boolean;
}
