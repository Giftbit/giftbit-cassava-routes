import * as cassava from "cassava";
import { AuthenticationConfig } from "../secureConfig/AuthenticationConfig";
import { RolesConfig } from "../secureConfig/RolesConfig";
export declare class JwtAuthorizationRoute implements cassava.routes.Route {
    private readonly authConfigPromise;
    private readonly rolesConfigPromise;
    /**
     * Log errors to console.
     */
    logErrors: boolean;
    constructor(authConfigPromise: Promise<AuthenticationConfig>, rolesConfigPromise?: Promise<RolesConfig>);
    handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse>;
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse>;
    matches(evt: cassava.RouterEvent): boolean;
    private getToken(evt);
    private getAuthorizeAs(evt);
}
