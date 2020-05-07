"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cassava = require("cassava");
const jwt = require("jsonwebtoken");
const AuthorizationBadge_1 = require("./AuthorizationBadge");
const AuthorizationHeader_1 = require("./AuthorizationHeader");
class JwtAuthorizationRoute {
    constructor(options) {
        this.options = options;
        this.infoLogFunction = console.log.bind(console);
        this.errorLogFunction = console.error.bind(console);
        this.infoLogFunction = options.infoLogFunction || this.infoLogFunction;
        this.errorLogFunction = options.errorLogFunction || this.errorLogFunction;
        this.onAuth = options.onAuth;
        this.authConfigPromise = options.authConfigPromise;
        this.rolesConfigPromise = options.rolesConfigPromise;
        this.sharedSecretProvider = options.sharedSecretProvider;
    }
    handle(evt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.getToken(evt);
                const auth = yield this.getVerifiedAuthorizationBadge(token);
                const authHeaderPayload = jwt.decode(token, { complete: true }).header;
                const authHeader = new AuthorizationHeader_1.AuthorizationHeader(authHeaderPayload);
                const authAs = this.getAuthorizeAsHeaderValue(evt);
                if (authAs) {
                    const authAssumingAuthAs = auth.assumeJwtIdentity(authAs);
                    evt.meta["auth"] = authAssumingAuthAs;
                    this.safeCallOnAuth(authAssumingAuthAs);
                }
                else {
                    evt.meta["auth"] = auth;
                    this.safeCallOnAuth(auth);
                }
                evt.meta["auth-token"] = token;
                evt.meta["auth-header"] = authHeader;
                this.infoLogFunction("JWT authorized", auth);
            }
            catch (e) {
                this.errorLogFunction("error verifying jwt", e);
                this.safeCallOnAuth(null);
                throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
            }
            return null;
        });
    }
    safeCallOnAuth(auth) {
        if (this.onAuth) {
            try {
                this.onAuth(auth);
            }
            catch (ignored) { }
        }
    }
    postProcess(evt, resp) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    matches(evt) {
        return true;
    }
    getToken(evt) {
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
    redact(s) {
        if (s === undefined) {
            return "undefined";
        }
        else if (s === null) {
            return "null";
        }
        else if (s === "") {
            return "''";
        }
        else {
            return `[redacted length=${s.length}]`;
        }
    }
    getAuthorizeAsHeaderValue(evt) {
        try {
            const base64 = evt.headersLowerCase["authorizeas"];
            if (!base64) {
                return null;
            }
            const jsonString = Buffer.from(base64, "base64").toString("utf-8");
            return JSON.parse(jsonString);
        }
        catch (ignored) {
            return null;
        }
    }
    getVerifiedAuthorizationBadge(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const unverifiedAuthPayload = jwt.decode(token);
            if (!unverifiedAuthPayload) {
                throw new Error("Cannot be decoded as a JWT.");
            }
            let secret;
            if (unverifiedAuthPayload.iss === "MERCHANT") {
                if (!this.sharedSecretProvider) {
                    throw new Error("Merchant key provider has not been configured.  Not accepting merchant signed tokens.");
                }
                secret = yield this.sharedSecretProvider.getSharedSecret(token);
                if (!secret) {
                    throw new Error("Secret is null.  Check that the merchant has set a shared secret.");
                }
            }
            else {
                const secretObj = yield this.authConfigPromise;
                if (!secretObj) {
                    throw new Error("Secret is null.  Check that the source of the secret can be accessed.");
                }
                secret = secretObj.secretkey;
            }
            const authPayload = jwt.verify(token, secret, {
                ignoreExpiration: false,
                algorithms: ["HS256"]
            });
            return new AuthorizationBadge_1.AuthorizationBadge(authPayload, {
                rolesConfig: this.rolesConfigPromise ? yield this.rolesConfigPromise : null,
                infoLogFunction: this.infoLogFunction,
                errorLogFunction: this.errorLogFunction
            });
        });
    }
}
exports.JwtAuthorizationRoute = JwtAuthorizationRoute;
//# sourceMappingURL=JwtAuthorizationRoute.js.map