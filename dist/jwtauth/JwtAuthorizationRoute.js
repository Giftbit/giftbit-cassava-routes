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
class JwtAuthorizationRoute {
    constructor(authConfigPromise, rolesConfigPromise) {
        this.authConfigPromise = authConfigPromise;
        this.rolesConfigPromise = rolesConfigPromise;
        /**
         * Log errors to console.
         */
        this.logErrors = true;
    }
    handle(evt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secret = yield this.authConfigPromise;
                if (!secret) {
                    throw new Error("Secret is null.  Check that the source of the secret can be accessed.");
                }
                // Expiration time is checked manually because we issued JWTs with date string expirations,
                // which is against the spec and the library rightly rejects those.
                const token = this.getToken(evt);
                const payload = jwt.verify(token, secret.secretkey, { ignoreExpiration: false, algorithms: ["HS256"] });
                evt.meta["auth"] = new AuthorizationBadge_1.AuthorizationBadge(payload, this.rolesConfigPromise ? yield this.rolesConfigPromise : null);
                const header = jwt.decode(token, { complete: true }).header;
                evt.meta["auth-header"] = new AuthorizationHeader_1.AuthorizationHeader(header);
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
}
exports.JwtAuthorizationRoute = JwtAuthorizationRoute;
//# sourceMappingURL=JwtAuthorizationRoute.js.map