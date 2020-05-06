import * as cassava from "cassava";
import { JwtAuthorizationRouteOptions } from "./JwtAuthorizationRouteOptions";
export declare class JwtAuthorizationRoute implements cassava.routes.Route {
    private readonly options;
    private readonly infoLogFunction?;
    private readonly errorLogFunction?;
    private readonly onAuth?;
    private readonly authConfigPromise;
    private readonly rolesConfigPromise?;
    private readonly sharedSecretProvider;
    constructor(options: JwtAuthorizationRouteOptions);
    handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse>;
    private safeCallOnAuth;
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse>;
    matches(evt: cassava.RouterEvent): boolean;
    private getToken;
    private redact;
    private getAuthorizeAsHeaderValue;
    private getVerifiedAuthorizationBadge;
}
