import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
import {JwtPayload} from "./JwtPayload";
import {RolesConfig} from "../secureConfig";

/**
 * Expanded representation of the JWT payload.
 */
export class AuthorizationBadge {

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
                this.giftbitUserId = jwtPayload.g.gui;
                this.teamMemberId = jwtPayload.g.tmi;
                this.merchantId = jwtPayload.g.gmi;
                this.cardId = jwtPayload.g.gci;
                this.templateId = jwtPayload.g.gti;
                this.programId = jwtPayload.g.pid;
                this.contactUserSuppliedId = jwtPayload.g.cui;
                this.shopperId = jwtPayload.g.shi;
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
        if (this.giftbitUserId) {
            payload.g.gui = this.giftbitUserId;
        }
        if (this.teamMemberId) {
            payload.g.tmi = this.teamMemberId;
        }
        if (this.merchantId) {
            payload.g.gmi = this.merchantId;
        }
        if (this.cardId) {
            payload.g.gci = this.cardId;
        }
        if (this.templateId) {
            payload.g.gti = this.templateId;
        }
        if (this.programId) {
            payload.g.pid = this.programId;
        }
        if (this.contactUserSuppliedId) {
            payload.g.cui = this.contactUserSuppliedId;
        }
        if (this.shopperId) {
            payload.g.shi = this.shopperId;
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
            si: this.giftbitUserId
        };
        j.parentJti = jwtPayload.jti;

        const badge = new AuthorizationBadge(j, this.rolesConfig);
        badge.scopes = badge.scopes.filter(scope => scope !== "ASSUME");
        badge.effectiveScopes = badge.effectiveScopes.filter(scope => scope !== "ASSUME");

        return badge;
    }

    requireIds(...ids: (keyof this)[]): void {
        for (let id of ids) {
            if (!this[id]) {
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
    }

    isBadgeAuthorized(scope: string): boolean {
        for (; scope; scope = getParentScope(scope)) {
            if (this.effectiveScopes.indexOf(scope) !== -1) {
                return true;
            }
        }
        return false;
    }

    requireScopes(...scopes: string[]): void {
        for (let scope of scopes) {
            if (!this.isBadgeAuthorized(scope)) {
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
    }

    /**
     * Save the merchant from themselves.
     */
    private sanitizeMerchantSigned(): void {
        const rolesWhitelist = ["shopper"];

        this.merchantId = this.giftbitUserId;
        if (!this.contactUserSuppliedId && !this.shopperId && !this.contactId) {
            this.shopperId = "defaultShopper";
            this.contactId = "defaultShopper";
        }
        this.roles = this.roles.filter(role => rolesWhitelist.indexOf(role) !== -1);
        this.scopes = [];
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
        return this.giftbitUserId && this.giftbitUserId.endsWith("-TEST");
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
