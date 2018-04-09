"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cassava = require("cassava");
const jwt = require("jsonwebtoken");
/**
 * Expanded representation of the JWT payload.
 */
class AuthorizationBadge {
    constructor(jwtPayload, rolesConfig) {
        this.rolesConfig = rolesConfig;
        this.roles = [];
        this.scopes = [];
        this.effectiveScopes = [];
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
            }
            else if (typeof jwtPayload.iat === "string") {
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
    getJwtPayload() {
        const payload = {
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
    getAuthorizeAsPayload() {
        return Buffer.from(JSON.stringify(this.getJwtPayload()), "utf-8").toString("base64");
    }
    sign(secret) {
        return jwt.sign(this.getJwtPayload(), secret, {
            algorithm: "HS256",
            header: {
                ver: 2,
                vav: 1
            }
        });
    }
    assumeJwtIdentity(jwtPayload) {
        this.requireScopes("ASSUME");
        const j = this.getJwtPayload();
        j.g = Object.assign({}, jwtPayload.g, { si: this.giftbitUserId });
        j.parentJti = jwtPayload.jti;
        const badge = new AuthorizationBadge(j, this.rolesConfig);
        badge.scopes = badge.scopes.filter(scope => scope !== "ASSUME");
        badge.effectiveScopes = badge.effectiveScopes.filter(scope => scope !== "ASSUME");
        return badge;
    }
    /**
     * Require that the given IDs are set on the badge.
     * eg: requireIds("giftbitUserId", "merchantId");
     */
    requireIds(...ids) {
        for (let id of ids) {
            if (!this[id]) {
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
    }
    isBadgeAuthorized(scope) {
        for (; scope; scope = getParentScope(scope)) {
            if (this.effectiveScopes.indexOf(scope) !== -1) {
                return true;
            }
        }
        return false;
    }
    /**
     * Require that the given scopes are authorized on the badge.
     * Throws a RestError if they are not.
     */
    requireScopes(...scopes) {
        for (let scope of scopes) {
            if (!this.isBadgeAuthorized(scope)) {
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
    }
    /**
     * Save the merchant from themselves.
     */
    sanitizeMerchantSigned() {
        this.merchantId = this.giftbitUserId;
        if (!this.contactUserSuppliedId && !this.shopperId && !this.contactId) {
            this.shopperId = "defaultShopper";
            this.contactId = "defaultShopper";
        }
        this.roles = ["shopper"]; // This might be a whitelist in the future.
        this.scopes.length = 0;
    }
    getEffectiveScopes(rolesConfig) {
        const effectiveScopes = [];
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
    isTestUser() {
        return this.giftbitUserId && this.giftbitUserId.endsWith("-TEST");
    }
}
exports.AuthorizationBadge = AuthorizationBadge;
function getParentScope(scope) {
    if (!scope || typeof scope !== "string") {
        return null;
    }
    const lastSeparatorIx = scope.lastIndexOf(":");
    if (lastSeparatorIx === -1) {
        return null;
    }
    return scope.substring(0, lastSeparatorIx);
}
//# sourceMappingURL=AuthorizationBadge.js.map