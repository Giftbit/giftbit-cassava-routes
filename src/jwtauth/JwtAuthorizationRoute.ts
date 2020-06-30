import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
import {AuthorizationBadge} from "./AuthorizationBadge";
import {AuthorizationHeader} from "./AuthorizationHeader";
import {AuthenticationConfig} from "../secureConfig";
import {RolesConfig} from "../secureConfig";
import {JwtPayload} from "./JwtPayload";
import {SharedSecretProvider} from "./sharedSecret";
import {JwtAuthorizationRouteOptions} from "./JwtAuthorizationRouteOptions";

export class JwtAuthorizationRoute implements cassava.routes.Route {

    // eslint-disable-next-line no-console
    private readonly infoLogFunction?: (...msg: any[]) => void = console.log.bind(console);
    // eslint-disable-next-line no-console
    private readonly errorLogFunction?: (...msg: any[]) => void = console.error.bind(console);
    private readonly onAuth?: (auth: AuthorizationBadge | null) => void;
    private readonly authConfigPromise: Promise<AuthenticationConfig>;
    private readonly rolesConfigPromise?: Promise<RolesConfig>;
    private readonly sharedSecretProvider: SharedSecretProvider;

    constructor(private readonly options: JwtAuthorizationRouteOptions) {
        this.infoLogFunction = options.infoLogFunction || this.infoLogFunction;
        this.errorLogFunction = options.errorLogFunction || this.errorLogFunction;
        this.onAuth = options.onAuth;
        this.authConfigPromise = options.authConfigPromise;
        this.rolesConfigPromise = options.rolesConfigPromise;
        this.sharedSecretProvider = options.sharedSecretProvider;
    }

    async handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse> {
        try {
            const token = this.getToken(evt);
            const auth = await this.getVerifiedAuthorizationBadge(token);

            const authHeaderPayload = (jwt.decode(token, {complete: true}) as any).header;
            const authHeader = new AuthorizationHeader(authHeaderPayload);

            const authAs = this.getAuthorizeAsHeaderValue(evt);
            if (authAs) {
                const authAssumingAuthAs = auth.assumeJwtIdentity(authAs);
                evt.meta["auth"] = authAssumingAuthAs;
                this.safeCallOnAuth(authAssumingAuthAs);
            } else {
                evt.meta["auth"] = auth;
                this.safeCallOnAuth(auth);
            }

            evt.meta["auth-token"] = token;
            evt.meta["auth-header"] = authHeader;

            this.infoLogFunction("JWT authorized", auth);
        } catch (e) {
            this.errorLogFunction("error verifying jwt", e);
            this.safeCallOnAuth(null);
            throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
        }
        return null;
    }

    private safeCallOnAuth(auth: AuthorizationBadge | null): void {
        if (this.onAuth) {
            try {
                this.onAuth(auth);
            } catch (err) {
                this.errorLogFunction(`Error calling onAuth(), ${err}`);
            }
        }
    }

    async postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse> {
        if (evt.headersLowerCase["x-requested-with"] === "XMLHttpRequest" && evt.cookies["gb_jwt_session"] && evt.cookies["gb_jwt_signature"]) {
            if (!resp.cookies) {
                resp.cookies = {};
            }

            // Refresh this cookie.
            if (!resp.cookies["gb_jwt_signature"]) {
                resp.cookies["gb_jwt_signature"] = {
                    value: evt.cookies["gb_jwt_signature"],
                    options: {
                        httpOnly: true,
                        maxAge: 30 * 60,
                        path: "/",
                        secure: true,
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
            if (!/^Bearer /.test(authorization)) {
                this.errorLogFunction(`authorization header doesn't start with 'Bearer ' Authorization=${this.redact(authorization)}`);
                throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
            }
            return authorization.substring(7);
        }

        if (evt.cookies["gb_jwt_session"] && evt.cookies["gb_jwt_signature"]) {
            if (evt.headersLowerCase["x-requested-with"] !== "XMLHttpRequest") {
                this.errorLogFunction(`authorization cookies set but X-Requested-With not set X-Requested-With='${evt.headersLowerCase["x-requested-with"]}'`);
                throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
            }
            return `${evt.cookies["gb_jwt_session"]}.${evt.cookies["gb_jwt_signature"]}`;
        }

        this.errorLogFunction(`could not find auth Authorization=${this.redact(authorization)} Cookies gb_jwt_session='${evt.cookies["gb_jwt_session"]}' gb_jwt_signature=${this.redact(evt.cookies["gb_jwt_signature"])}`);
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
            const base64 = evt.headersLowerCase["authorizeas"];
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
        }

        let secret: string;
        if (unverifiedAuthPayload.iss === "MERCHANT") {
            if (!this.sharedSecretProvider) {
                throw new Error("Merchant key provider has not been configured.  Not accepting merchant signed tokens.");
            }
            secret = await this.sharedSecretProvider.getSharedSecret(token);
            if (!secret) {
                throw new Error("Secret is null.  Check that the merchant has set a shared secret.");
            }
        } else {
            const secretObj = await this.authConfigPromise;
            if (!secretObj) {
                throw new Error("Secret is null.  Check that the source of the secret can be accessed.");
            }
            secret = secretObj.secretkey;
        }

        const authPayload = jwt.verify(token, secret, {
            ignoreExpiration: false,
            algorithms: ["HS256"]
        }) as object;
        return new AuthorizationBadge(authPayload, {
            rolesConfig: this.rolesConfigPromise ? await this.rolesConfigPromise : null,
            infoLogFunction: this.infoLogFunction,
            errorLogFunction: this.errorLogFunction
        });
    }
}
