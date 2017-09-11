import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
import {JwtPayload} from "./JwtPayload";
import {RolesConfig} from "../secureConfig/RolesConfig";

/**
 * Expanded representation of the JWT payload.
 */
export class AuthorizationBadge {

    giftbitUserId: string;
    merchantId: string;
    cardId: string;
    programId: string;
    recipientId: string;
    templateId: string;
    teamMemberId: string;
    serviceId: string;

    audience: string;
    issuer: string;
    issuedAtTime: Date;
    expirationTime: Date;
    uniqueIdentifier: string;

    roles: string[] = [];
    scopes: string[] = [];
    effectiveScopes: string[] = [];

    constructor(jwtPayload?: JwtPayload, rolesConfig?: RolesConfig) {
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

            if (typeof jwtPayload.iat === "number") {
                this.issuedAtTime = new Date(jwtPayload.iat * 1000);
            } else if (typeof jwtPayload.iat === "string") {
                this.issuedAtTime = new Date(jwtPayload.iat);
            }

            if (typeof jwtPayload.exp === "number") {
                this.expirationTime = new Date(jwtPayload.exp * 1000);
            }
        }

        this.effectiveScopes = this.getEffectiveScopes(rolesConfig);
    }

    getJwtPayload(): JwtPayload {
        return {
            g: {
                gui: this.giftbitUserId,
                gci: this.cardId,
                gri: this.recipientId,
                gti: this.templateId,
                gmi: this.merchantId,
                pid: this.programId,
                tmi: this.teamMemberId,
                si: this.serviceId
            },
            aud: this.audience,
            iss: this.issuer,
            roles: this.roles.length ? this.roles : undefined,
            scopes: this.scopes.length ? this.scopes : undefined,
            jti: this.uniqueIdentifier,
            iat: this.issuedAtTime ? this.issuedAtTime.getTime() / 1000 : undefined,
            exp: this.expirationTime ? this.expirationTime.getTime() / 1000 : undefined
        };
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

    requireIds(...ids: ("giftbitUserId" | "merchantId" | "cardId" | "programId" | "recipientId" | "templateId" | "teamMemberId" | "serviceId")[]): void {
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
