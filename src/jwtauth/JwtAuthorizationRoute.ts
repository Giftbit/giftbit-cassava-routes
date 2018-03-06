import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
import {AuthorizationBadge} from "./AuthorizationBadge";
import {AuthorizationHeader} from "./AuthorizationHeader";
import {AuthenticationConfig} from "../secureConfig/AuthenticationConfig";
import {RolesConfig} from "../secureConfig/RolesConfig";
import {JwtPayload} from "./JwtPayload";
import {AssumeScopeToken} from "../secureConfig/AssumeScopeToken";
import {MerchantKeyProvider} from "./merchantSharedKey/MerchantKeyProvider";
import {RestMerchantKeyProvider} from "./merchantSharedKey/RestMerchantKeyProvider";

export class JwtAuthorizationRoute implements cassava.routes.Route {

    /**
     * Log errors to console.
     */
    logErrors = true;

    readonly merchantKeyProvider: MerchantKeyProvider;

    constructor(private readonly authConfigPromise: Promise<AuthenticationConfig>,
                private readonly rolesConfigPromise?: Promise<RolesConfig>,
                private readonly merchantKeyUri?: string,
                private readonly assumeGetSharedSecretToken?: Promise<AssumeScopeToken>) {

        if (merchantKeyUri && assumeGetSharedSecretToken) {
            this.merchantKeyProvider = new RestMerchantKeyProvider(merchantKeyUri, assumeGetSharedSecretToken);
        } else if (merchantKeyUri || assumeGetSharedSecretToken) {
            throw new Error("Configuration error. You must provide both the merchantKeyUri and the assumeGetSharedSecretToken or neither.");
        }
    }

    async handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse> {
        try {
            const token = this.getToken(evt);
            const auth = await this.getVerifiedAuthorizationBadge(token);

            const authHeaderPayload = (jwt.decode(token, {complete: true}) as any).header;
            const authHeader = new AuthorizationHeader(authHeaderPayload);

            const authAs = this.getAuthorizeAsHeaderValue(evt);
            if (authAs) {
                evt.meta["auth"] = auth.assumeJwtIdentity(authAs);
            } else {
                evt.meta["auth"] = auth;
            }

            evt.meta["auth-token"] = token;
            evt.meta["auth-header"] = authHeader;
        } catch (e) {
            this.logErrors && console.error("error verifying jwt", e);
            throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
        }
        return null;
    }

    async postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse> {
        if (evt.getHeader("X-Requested-With") === "XMLHttpRequest" && evt.cookies["gb_jwt_session"] && evt.cookies["gb_jwt_signature"]) {
            if (!resp.cookies) {
                resp.cookies = {};
            }

            // Refresh this cookie.
            if (!resp.cookies["gb_jwt_session"]) {
                resp.cookies["gb_jwt_session"] = {
                    value: evt.cookies["gb_jwt_session"],
                    options: {
                        path: "/",
                        maxAge: 30 * 60
                    }
                };
            }
        }
        return resp;
    }

    matches(evt: cassava.RouterEvent): boolean {
        return true;
    }

    private getToken(evt: cassava.RouterEvent): string {
        const authorization = evt.getHeader("Authorization");
        if (authorization) {
            if (!/^Bearer /.test(authorization)) {
                this.logErrors && console.log(`authorization header doesn't start with 'Bearer ' Authorization=${this.redact(authorization)}`);
                throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
            }
            return authorization.substring(7);
        }

        if (evt.cookies["gb_jwt_session"] && evt.cookies["gb_jwt_signature"]) {
            if (evt.getHeader("X-Requested-With") !== "XMLHttpRequest") {
                this.logErrors && console.log(`authorization cookies set but X-Requested-With not set X-Requested-With='${evt.getHeader("X-Requested-With")}'`);
                throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
            }
            return `${evt.cookies["gb_jwt_session"]}.${evt.cookies["gb_jwt_signature"]}`;
        }

        this.logErrors && console.log(`could not find auth Authorization=${this.redact(authorization)} Cookies gb_jwt_session='${evt.cookies["gb_jwt_session"]}' gb_jwt_signature=${this.redact(evt.cookies["gb_jwt_signature"])}`);
        throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
    }

    private redact(s: string): string {
        if (s === undefined) {
            return "undefined";
        } else if (s === null) {
            return "null";
        } else if (s === "") {
            return "''";
        } else {
            return `[redacted length=${s.length}]`;
        }
    }

    private getAuthorizeAsHeaderValue(evt: cassava.RouterEvent): JwtPayload {
        try {
            const base64 = evt.getHeader("AuthorizeAs");
            if (!base64) {
                return null;
            }
            const jsonString = Buffer.from(base64, "base64").toString("utf-8");
            return JSON.parse(jsonString) as JwtPayload;
        } catch (ignored) {
            return null;
        }
    }

    private async getVerifiedAuthorizationBadge(token: string): Promise<AuthorizationBadge> {
        const unverifiedAuthPayload = (jwt.decode(token) as any);
        if (!unverifiedAuthPayload) {
            throw new Error("Cannot be decoded as a JWT.");
        } else if (unverifiedAuthPayload.iss === "MERCHANT") {
            if (!this.merchantKeyProvider) {
                throw new Error("Merchant key provider has not been configured.  Not accepting merchant signed tokens.");
            }
            const secret = await this.merchantKeyProvider.getMerchantKey(token);
            const authPayload = jwt.verify(token, secret, {
                ignoreExpiration: false,
                algorithms: ["HS256"]
            }) as object;
            const shopperPayload = {
                ...authPayload,
                scopes: [] as string [],
                roles: ["shopper"]
            };
            return new AuthorizationBadge(shopperPayload, this.rolesConfigPromise ? await this.rolesConfigPromise : null);
        } else {
            const secret = await this.authConfigPromise;
            if (!secret) {
                throw new Error("Secret is null.  Check that the source of the secret can be accessed.");
            }
            const authPayload = jwt.verify(token, secret.secretkey, {
                ignoreExpiration: false,
                algorithms: ["HS256"]
            }) as object;
            return new AuthorizationBadge(authPayload, this.rolesConfigPromise ? await this.rolesConfigPromise : null);
        }
    }
}
