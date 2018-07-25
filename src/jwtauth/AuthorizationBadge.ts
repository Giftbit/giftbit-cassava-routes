import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
import {JwtPayload} from "./JwtPayload";
import {RolesConfig} from "../secureConfig";

/**
 * Expanded representation of the JWT payload.
 */
export class AuthorizationBadge {

    userId: string;
    teamMemberId: string;
    merchantId: string;
    valueId: string;
    programId: string;
    contactId: string;
    serviceId: string;

    metadata: {[name: string]: any};

    audience: string;
    issuer: string;
    issuedAtTime: Date;
    expirationTime: Date;
    uniqueIdentifier: string;
    parentUniqueIdentifier: string;

    roles: string[] = [];
    scopes: string[] = [];
    effectiveScopes: string[] = [];

    constructor(jwtPayload?: JwtPayload, private readonly rolesConfig?: RolesConfig) {
        if (jwtPayload) {
            if (jwtPayload.g) {
                this.userId = jwtPayload.g.gui;
                this.teamMemberId = jwtPayload.g.tmi;
                this.merchantId = jwtPayload.g.gmi;
                this.valueId = jwtPayload.g.gvi;
                this.programId = jwtPayload.g.pid;
                this.contactId = jwtPayload.g.coi;
                this.serviceId = jwtPayload.g.si;
            }
            this.metadata = jwtPayload.metadata;
            this.audience = jwtPayload.aud;
            this.issuer = jwtPayload.iss;
            this.roles = jwtPayload.roles || [];
            this.scopes = jwtPayload.scopes || [];
            this.uniqueIdentifier = jwtPayload.jti;
            this.parentUniqueIdentifier = jwtPayload.parentJti;

            if (typeof jwtPayload.iat === "number") {
                this.issuedAtTime = new Date(jwtPayload.iat * 1000);
            } else if (typeof jwtPayload.iat === "string") {
                // This is off-spec but something we did in the past.
                this.issuedAtTime = new Date(jwtPayload.iat);
            }

            if (typeof jwtPayload.exp === "number") {
                this.expirationTime = new Date(jwtPayload.exp * 1000);
            }
        }

        if (this.issuer === "MERCHANT") {
            this.sanitizeMerchantSigned();
        }

        this.effectiveScopes = this.getEffectiveScopes(rolesConfig);
    }

    getJwtPayload(): JwtPayload {
        const payload: JwtPayload = {
            g: {}
        };
        if (this.userId) {
            payload.g.gui = this.userId;
        }
        if (this.teamMemberId) {
            payload.g.tmi = this.teamMemberId;
        }
        if (this.merchantId) {
            payload.g.gmi = this.merchantId;
        }
        if (this.valueId) {
            payload.g.gvi = this.valueId;
        }
        if (this.programId) {
            payload.g.pid = this.programId;
        }
        if (this.contactId) {
            payload.g.coi = this.contactId;
        }
        if (this.serviceId) {
            payload.g.si = this.serviceId;
        }
        if (this.metadata) {
            payload.metadata = this.metadata;
        }
        if (this.audience) {
            payload.aud = this.audience;
        }
        if (this.issuer) {
            payload.iss = this.issuer;
        }
        if (this.roles.length) {
            payload.roles = this.roles;
        }
        payload.scopes = this.scopes;
        if (this.uniqueIdentifier) {
            payload.jti = this.uniqueIdentifier;
        }
        if (this.parentUniqueIdentifier) {
            payload.parentJti = this.parentUniqueIdentifier;
        }
        if (this.issuedAtTime) {
            payload.iat = this.issuedAtTime.getTime() / 1000;
        }
        if (this.expirationTime) {
            payload.exp = this.expirationTime.getTime();
        }
        return payload;
    }

    getAuthorizeAsPayload(): string {
        return Buffer.from(JSON.stringify(this.getJwtPayload()), "utf-8").toString("base64");
    }

    sign(secret: string): string {
        return jwt.sign(this.getJwtPayload(), secret, {
            algorithm: "HS256",
            header: {
                ver: 2,
                vav: 1
            }
        });
    }

    assumeJwtIdentity(jwtPayload: JwtPayload): AuthorizationBadge {
        this.requireScopes("ASSUME");

        const j = this.getJwtPayload();
        j.g = {
            ... jwtPayload.g,
            si: this.userId
        };
        j.parentJti = jwtPayload.jti;

        const badge = new AuthorizationBadge(j, this.rolesConfig);
        badge.scopes = badge.scopes.filter(scope => scope !== "ASSUME");
        badge.effectiveScopes = badge.effectiveScopes.filter(scope => scope !== "ASSUME");

        return badge;
    }

    /**
     * Require that the given IDs are set on the badge.
     * eg: requireIds("userId", "merchantId");
     */
    requireIds(...ids: ("userId" | "teamMemberId" | "merchantId" | "valueId" | "programId" | "contactId" | "serviceId")[]): void {
        for (let id of ids) {
            if (!this[id]) {
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
    }

    /**
     * @deprecated use hasScope, because the name is clearer
     */
    isBadgeAuthorized(scope: string): boolean {
        return this.hasScope(scope);
    }

    /**
     * Returns true if this badge contains the given scope or any parent of the scope.
     */
    hasScope(scope: string): boolean {
        for (; scope; scope = getParentScope(scope)) {
            if (this.effectiveScopes.indexOf(scope) !== -1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the badge has all the given scopes.
     */
    hasScopes(...scopes: string[]): boolean {
        for (let scope of scopes) {
            if (!this.hasScope(scope)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Require that the given scopes are authorized on the badge.
     * Throws a RestError if they are not.
     */
    requireScopes(...scopes: string[]): void {
        if (!this.hasScopes(...scopes)) {
            throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
        }
    }

    /**
     * Save the merchant from themselves.
     */
    private sanitizeMerchantSigned(): void {
        this.merchantId = this.userId;
        if (!this.contactId) {
            this.contactId = "defaultShopper";
        }
        this.roles = ["shopper"];   // This might be a whitelist in the future.
        this.scopes.length = 0;
    }

    private getEffectiveScopes(rolesConfig: RolesConfig): string[] {
        const effectiveScopes: string[] = [];

        if (rolesConfig) {
            this.roles.forEach(roleName => {
                const roleConfig = rolesConfig.roles.find(roleConfig => roleConfig.name === roleName);
                if (!roleConfig) {
                    console.log(`JWT ${this.uniqueIdentifier} contains an unknown role ${roleName}`);
                    return;
                }

                roleConfig.scopes.forEach(scope => {
                    if (effectiveScopes.indexOf(scope) === -1) {
                        effectiveScopes.push(scope);
                    }
                });
            });
        }

        this.scopes
            .filter(scope => typeof scope === "string" && !scope.startsWith("-"))
            .forEach(scope => {
                if (effectiveScopes.indexOf(scope) === -1) {
                    effectiveScopes.push(scope);
                }
            });

        this.scopes
            .filter(scope => typeof scope === "string" && scope.startsWith("-"))
            .map(scope => scope.substring(1))
            .forEach(scope => {
                const scopeColon = scope + ":";

                let effectiveScopeIx = 0;
                while ((effectiveScopeIx = effectiveScopes.findIndex(effectiveScope => effectiveScope === scope || effectiveScope.startsWith(scopeColon), effectiveScopeIx)) !== -1) {
                    effectiveScopes.splice(effectiveScopeIx, 1);
                }
            });

        return effectiveScopes;
    }

    isTestUser(): boolean {
        return this.userId && this.userId.endsWith("-TEST");
    }
}

function getParentScope(scope: string): string {
    if (!scope || typeof scope !== "string") {
        return null;
    }

    const lastSeparatorIx = scope.lastIndexOf(":");
    if (lastSeparatorIx === -1) {
        return null;
    }

    return scope.substring(0, lastSeparatorIx);
}
