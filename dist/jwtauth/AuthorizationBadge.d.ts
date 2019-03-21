import { JwtPayload } from "./JwtPayload";
import { AuthorizationBadgeOptions } from "./AuthorizationBadgeOptions";
/**
 * Expanded representation of the JWT payload.
 */
export declare class AuthorizationBadge {
    userId: string;
    teamMemberId: string;
    merchantId: string;
    valueId: string;
    programId: string;
    contactId: string;
    serviceId: string;
    email: string;
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
    private readonly rolesConfig;
    private readonly infoLogFunction?;
    private readonly errorLogFunction?;
    constructor(jwtPayload?: JwtPayload, options?: AuthorizationBadgeOptions);
    getJwtPayload(): JwtPayload;
    getAuthorizeAsPayload(): string;
    sign(secret: string): string;
    assumeJwtIdentity(jwtPayload: JwtPayload): AuthorizationBadge;
    /**
     * Require that the given IDs are set on the badge.
     * eg: requireIds("userId", "merchantId");
     */
    requireIds(...ids: ("userId" | "teamMemberId" | "merchantId" | "valueId" | "programId" | "contactId" | "serviceId" | "email")[]): void;
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
