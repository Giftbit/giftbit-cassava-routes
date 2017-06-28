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

            if (jwtPayload.iat) {
                this.issuedAtTime = new Date(jwtPayload.iat);
            }

            if (jwtPayload.exp) {
                this.expirationTime = new Date(jwtPayload.exp);
            }
        }

        this.effectiveScopes = this.getEffectiveScopes(rolesConfig);
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

    private getParentScope(scope: string): string {
        if (!scope || typeof scope !== "string") {
            return null;
        }

        const lastSeparatorIx = scope.lastIndexOf(":");
        if (lastSeparatorIx == -1) {
            return null;
        }

        return scope.substring(0, lastSeparatorIx);
    }

    isBadgeAuthorized(scope: string): boolean {
        for (; scope; scope = this.getParentScope(scope)) {
            if (this.effectiveScopes.indexOf(scope) != -1) {
                return true;
            }
        }
        return false;
    }
}
