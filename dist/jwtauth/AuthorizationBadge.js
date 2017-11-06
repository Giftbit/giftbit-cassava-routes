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
                this.cardId = jwtPayload.g.gci;
                this.recipientId = jwtPayload.g.gri;
                this.templateId = jwtPayload.g.gti;
                this.merchantId = jwtPayload.g.gmi;
                this.programId = jwtPayload.g.pid;
                this.teamMemberId = jwtPayload.g.tmi;
                this.serviceId = jwtPayload.g.si;
                this.shopperId = jwtPayload.g.spi;
            }
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
                this.issuedAtTime = new Date(jwtPayload.iat);
            }
            if (typeof jwtPayload.exp === "number") {
                this.expirationTime = new Date(jwtPayload.exp * 1000);
            }
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
        if (this.cardId) {
            payload.g.gci = this.cardId;
        }
        if (this.recipientId) {
            payload.g.gri = this.recipientId;
        }
        if (this.templateId) {
            payload.g.gti = this.templateId;
        }
        if (this.merchantId) {
            payload.g.gmi = this.merchantId;
        }
        if (this.programId) {
            payload.g.pid = this.programId;
        }
        if (this.teamMemberId) {
            payload.g.tmi = this.teamMemberId;
        }
        if (this.serviceId) {
            payload.g.si = this.serviceId;
        }
        if (this.shopperId) {
            payload.g.spi = this.shopperId;
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
    requireScopes(...scopes) {
        for (let scope of scopes) {
            if (!this.isBadgeAuthorized(scope)) {
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
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