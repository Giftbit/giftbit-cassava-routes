/// <reference types="node" />
import * as cassava from "cassava";
import * as jwt from "jsonwebtoken";
export declare class JwtAuthorizationRoute implements cassava.routes.Route {
    private readonly secret;
    private readonly jwtOptions;
    /**
     * Log errors to console.
     */
    logErrors: boolean;
    constructor(secret?: string | Buffer, jwtOptions?: jwt.VerifyOptions);
    handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse>;
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse>;
    matches(evt: cassava.RouterEvent): boolean;
    private getToken(evt);
}
