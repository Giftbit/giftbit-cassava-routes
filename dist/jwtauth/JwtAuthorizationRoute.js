"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cassava = require("cassava");
const jwt = require("jsonwebtoken");
const AuthorizationBadge_1 = require("./AuthorizationBadge");
const AuthorizationHeader_1 = require("./AuthorizationHeader");
const RestMerchantKeyProvider_1 = require("./merchantSharedKey/RestMerchantKeyProvider");
class JwtAuthorizationRoute {
    constructor(authConfigPromise, rolesConfigPromise, merchantKeyUri, assumeGetSharedSecretToken) {
        this.authConfigPromise = authConfigPromise;
        this.rolesConfigPromise = rolesConfigPromise;
        this.merchantKeyUri = merchantKeyUri;
        this.assumeGetSharedSecretToken = assumeGetSharedSecretToken;
        /**
         * Log errors to console.
         */
        this.logErrors = true;
        if (merchantKeyUri && assumeGetSharedSecretToken) {
            this.merchantKeyProvider = new RestMerchantKeyProvider_1.RestMerchantKeyProvider(merchantKeyUri, assumeGetSharedSecretToken);
        }
        else if (merchantKeyUri || assumeGetSharedSecretToken) {
            throw new Error("Configuration error. You must provide both the merchantKeyUri and the assumeGetSharedSecretToken or neither.");
        }
    }
    handle(evt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.getToken(evt);
                const auth = yield this.getVerifiedAuthorizationBadge(token);
                const authHeaderPayload = jwt.decode(token, { complete: true }).header;
                const authHeader = new AuthorizationHeader_1.AuthorizationHeader(authHeaderPayload);
                const authAs = this.getAuthorizeAs(evt);
                if (authAs) {
                    evt.meta["auth"] = auth.assumeJwtIdentity(authAs);
                }
                else {
                    evt.meta["auth"] = auth;
                }
                evt.meta["auth-token"] = token;
                evt.meta["auth-header"] = authHeader;
            }
            catch (e) {
                this.logErrors && console.error("error verifying jwt", e);
                throw new cassava.RestError(cassava.httpStatusCode.clientError.UNAUTHORIZED);
            }
            return null;
        });
    }
    postProcess(evt, resp) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    matches(evt) {
        return true;
    }
    getToken(evt) {
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
    getAuthorizeAs(evt) {
        try {
            const base64 = evt.getHeader("AuthorizeAs");
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
            else if (unverifiedAuthPayload.iss === "MERCHANT") {
                const secret = yield this.merchantKeyProvider.getMerchantKey(token);
                const authPayload = jwt.verify(token, secret, {
                    ignoreExpiration: false,
                    algorithms: ["HS256"]
                });
                const shopperPayload = Object.assign({}, authPayload, { scopes: [], roles: ["shopper"] });
                return new AuthorizationBadge_1.AuthorizationBadge(shopperPayload, this.rolesConfigPromise ? yield this.rolesConfigPromise : null);
            }
            else {
                const secret = yield this.authConfigPromise;
                if (!secret) {
                    throw new Error("Secret is null.  Check that the source of the secret can be accessed.");
                }
                const authPayload = jwt.verify(token, secret.secretkey, {
                    ignoreExpiration: false,
                    algorithms: ["HS256"]
                });
                return new AuthorizationBadge_1.AuthorizationBadge(authPayload, this.rolesConfigPromise ? yield this.rolesConfigPromise : null);
            }
        });
    }
}
exports.JwtAuthorizationRoute = JwtAuthorizationRoute;
//# sourceMappingURL=JwtAuthorizationRoute.js.map