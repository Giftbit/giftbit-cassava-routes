import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
import {AuthorizationBadge} from "./AuthorizationBadge";
import {AuthorizationHeader} from "./AuthorizationHeader";
import {AuthenticationBadgeKey} from "../secureConfig/AuthenticationBadgeKey";

export class JwtAuthorizationRoute implements cassava.routes.Route {

    /**
     * Log errors to console.
     */
    logErrors = true;

    constructor(private readonly authBadgePromise: Promise<AuthenticationBadgeKey>, private readonly jwtOptions?: jwt.VerifyOptions) {
    }

    async handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse> {
        const secret = await this.authBadgePromise;
        const token = this.getToken(evt);
        try {
            const payload = jwt.verify(token, secret.secretkey, this.jwtOptions);
            const auth = new AuthorizationBadge(payload);
            if (auth.expirationTime && auth.expirationTime.getTime() < Date.now()) {
                throw new Error(`jwt expired at ${auth.expirationTime} (and it is currently ${new Date()})`);
            }
            evt.meta["auth"] = auth;
            const header = jwt.decode(token, {complete: true}).header;
            evt.meta["auth-header"] = new AuthorizationHeader(header);
        } catch (e) {
            this.logErrors && console.error("error verifying jwt", e);
            throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
        }
        return null;
    }

    async postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse> {
        if (evt.headersLowerCase["x-requested-with"] === "XMLHttpRequest" && evt.cookies["gb_jwt_session"] && evt.cookies["gb_jwt_signature"]) {
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
        const authorization = evt.headersLowerCase["authorization"];
        if (authorization) {
            if (/^Bearer /.test(authorization)) {
                return authorization.substring(7);
            }
            this.logErrors && console.log(`authorization header doesn't start with 'Bearer ': ${authorization}`);
            throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
        }

        if (evt.headersLowerCase["x-requested-with"] === "XMLHttpRequest" && evt.cookies["gb_jwt_session"] && evt.cookies["gb_jwt_signature"]) {
            return `${evt.cookies["gb_jwt_session"]}.${evt.cookies["gb_jwt_signature"]}`;
        }

        this.logErrors && console.log(`request doesn't have Authorization header or X-Requested-With header (${authorization}) with Cookies gb_jwt_session (${evt.cookies["gb_jwt_session"]}) and gb_jwt_signature (${evt.cookies["gb_jwt_signature"]})`);
        throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
    }
}
