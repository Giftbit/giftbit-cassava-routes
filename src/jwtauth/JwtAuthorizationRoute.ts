import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
import {AuthorizationBadge} from "./AuthorizationBadge";
import {AuthorizationHeader} from "./AuthorizationHeader";
import {AuthenticationConfig} from "../secureConfig/AuthenticationConfig";
import {RolesConfig} from "../secureConfig/RolesConfig";

export class JwtAuthorizationRoute implements cassava.routes.Route {

    /**
     * Log errors to console.
     */
    logErrors = true;

    constructor(
        private readonly authConfigPromise: Promise<AuthenticationConfig>,
        private readonly rolesConfigPromise?: Promise<RolesConfig>) {}

    async handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse> {
        try {
            const secret = await this.authConfigPromise;
            if (!secret) {
                throw new Error("Secret is null.  Check that the source of the secret can be accessed.");
            }

            // Expiration time is checked manually because we issued JWTs with date string expirations,
            // which is against the spec and the library rightly rejects those.
            const token = this.getToken(evt);
            const payload = jwt.verify(token, secret.secretkey, {ignoreExpiration: true, algorithms: ["HS256"]});
            const auth = new AuthorizationBadge(payload, this.rolesConfigPromise ? await this.rolesConfigPromise : null);
            if (auth.expirationTime && auth.expirationTime.getTime() < Date.now()) {
                throw new Error(`jwt expired at ${auth.expirationTime} (and it is currently ${new Date()})`);
            }
            evt.meta["auth"] = auth;
            const header = (jwt.decode(token, {complete: true}) as any).header;
            evt.meta["auth-header"] = new AuthorizationHeader(header);
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
            if (/^Bearer /.test(authorization)) {
                return authorization.substring(7);
            }
            this.logErrors && console.log(`authorization header doesn't start with 'Bearer ': ${authorization}`);
            throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
        }

        if (evt.getHeader("X-Requested-With") === "XMLHttpRequest" && evt.cookies["gb_jwt_session"] && evt.cookies["gb_jwt_signature"]) {
            return `${evt.cookies["gb_jwt_session"]}.${evt.cookies["gb_jwt_signature"]}`;
        }

        this.logErrors && console.log(`request doesn't have Authorization header or X-Requested-With header (${authorization}) with Cookies gb_jwt_session (${evt.cookies["gb_jwt_session"]}) and gb_jwt_signature (${evt.cookies["gb_jwt_signature"]})`);
        throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
    }
}
