import { JwtPayload } from "./JwtPayload";
import { RolesConfig } from "../secureConfig";
/**
 * Expanded representation of the JWT payload.
 */
export declare class AuthorizationBadge {
    private readonly rolesConfig?;
    userId: string;
    teamMemberId: string;
    merchantId: string;
    valueId: string;
    programId: string;
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
    /**
     * Require that the given IDs are set on the badge.
     * eg: requireIds("userId", "merchantId");
     */
    requireIds(...ids: ("userId" | "teamMemberId" | "merchantId" | "valueId" | "programId" | "contactId" | "serviceId")[]): void;
    /**
     * @deprecated use hasScope, because the name is clearer
     */
    isBadgeAuthorized(scope: string): boolean;
    /**
     * Returns true if this badge contains the given scope or any parent of the scope.
     */
    hasScope(scope: string): boolean;
    /**
     * Returns true if the badge has all the given scopes.
     */
    hasScopes(...scopes: string[]): boolean;
    /**
     * Require that the given scopes are authorized on the badge.
     * Throws a RestError if they are not.
     */
    requireScopes(...scopes: string[]): void;
    /**
     * Save the merchant from themselves.
     */
    private sanitizeMerchantSigned;
    private getEffectiveScopes;
    isTestUser(): boolean;
}
