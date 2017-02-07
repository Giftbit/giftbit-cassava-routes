import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
import { AuthenticationBadgeKey } from "../secureConfig/AuthenticationBadgeKey";
export declare class JwtAuthorizationRoute implements cassava.routes.Route {
    private readonly authBadgePromise;
    private readonly jwtOptions;
    /**
     * Log errors to console.
     */
    logErrors: boolean;
    constructor(authBadgePromise: Promise<AuthenticationBadgeKey>, jwtOptions?: jwt.VerifyOptions);
    handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse>;
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse>;
    matches(evt: cassava.RouterEvent): boolean;
    private getToken(evt);
}
