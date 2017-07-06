"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cassava = require("cassava");
/**
 * Expanded representation of the JWT payload.
 */
class AuthorizationBadge {
    constructor(jwtPayload, rolesConfig) {
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
            }
            this.audience = jwtPayload.aud;
            this.issuer = jwtPayload.iss;
            this.roles = jwtPayload.roles || [];
            this.scopes = jwtPayload.scopes || [];
            this.uniqueIdentifier = jwtPayload.jti;
            if (jwtPayload.iat) {
                this.issuedAtTime = new Date(jwtPayload.iat);
            }
            if (jwtPayload.exp) {
                this.expirationTime = new Date(jwtPayload.exp);
            }
        }
        this.effectiveScopes = this.getEffectiveScopes(rolesConfig);
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
    getParentScope(scope) {
        if (!scope || typeof scope !== "string") {
            return null;
        }
        const lastSeparatorIx = scope.lastIndexOf(":");
        if (lastSeparatorIx === -1) {
            return null;
        }
        return scope.substring(0, lastSeparatorIx);
    }
    isBadgeAuthorized(scope) {
        for (; scope; scope = this.getParentScope(scope)) {
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
    requireIds(...ids) {
        for (let id of ids) {
            if (!this[id]) {
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
    }
}
exports.AuthorizationBadge = AuthorizationBadge;
//# sourceMappingURL=AuthorizationBadge.js.map