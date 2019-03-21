"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cassava = require("cassava");
const jwt = require("jsonwebtoken");
/**
 * Expanded representation of the JWT payload.
 */
class AuthorizationBadge {
    constructor(jwtPayload, options) {
        this.roles = [];
        this.scopes = [];
        this.effectiveScopes = [];
        this.infoLogFunction = console.log.bind(console);
        this.errorLogFunction = console.error.bind(console);
        if (options) {
            this.rolesConfig = options.rolesConfig;
            this.infoLogFunction = options.infoLogFunction || this.infoLogFunction;
            this.errorLogFunction = options.errorLogFunction || this.errorLogFunction;
        }
        if (jwtPayload) {
            if (jwtPayload.g) {
                this.userId = jwtPayload.g.gui;
                this.teamMemberId = jwtPayload.g.tmi;
                this.merchantId = jwtPayload.g.gmi;
                this.valueId = jwtPayload.g.gvi;
                this.programId = jwtPayload.g.pid;
                this.contactId = jwtPayload.g.coi;
                this.serviceId = jwtPayload.g.si;
                this.email = jwtPayload.g.e;
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
        this.effectiveScopes = this.getEffectiveScopes();
    }
    getJwtPayload() {
        const payload = {
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
        if (this.email) {
            payload.g.e = this.email;
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
        j.g = Object.assign({}, jwtPayload.g, { si: this.userId });
        j.parentJti = jwtPayload.jti;
        const badge = new AuthorizationBadge(j, {
            rolesConfig: this.rolesConfig,
            infoLogFunction: this.infoLogFunction,
            errorLogFunction: this.errorLogFunction
        });
        badge.scopes = badge.scopes.filter(scope => scope !== "ASSUME");
        badge.effectiveScopes = badge.effectiveScopes.filter(scope => scope !== "ASSUME");
        return badge;
    }
    /**
     * Require that the given IDs are set on the badge.
     * eg: requireIds("userId", "merchantId");
     */
    requireIds(...ids) {
        for (const id of ids) {
            if (!this[id]) {
                this.errorLogFunction(`auth missing required id '${id}'`);
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
    }
    /**
     * Returns true if this badge contains the given scope or any parent of the scope.
     */
    hasScope(scope) {
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
    hasScopes(...scopes) {
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
    requireScopes(...scopes) {
        for (let scope of scopes) {
            if (!this.hasScope(scope)) {
                this.errorLogFunction(`auth missing required scope '${scope}'`);
                throw new cassava.RestError(cassava.httpStatusCode.clientError.FORBIDDEN);
            }
        }
    }
    /**
     * Save the merchant from themselves.
     */
    sanitizeMerchantSigned() {
        this.merchantId = this.userId;
        if (!this.contactId) {
            this.contactId = "defaultShopper";
        }
        this.roles = ["shopper"]; // This might be a whitelist in the future.
        this.scopes.length = 0;
    }
    getEffectiveScopes() {
        const effectiveScopes = [];
        if (this.rolesConfig) {
            this.roles.forEach(roleName => {
                const roleConfig = this.rolesConfig.roles.find(roleConfig => roleConfig.name === roleName);
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
        return this.userId && this.userId.endsWith("-TEST");
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