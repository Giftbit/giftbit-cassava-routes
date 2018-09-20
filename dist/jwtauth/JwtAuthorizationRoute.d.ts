import * as cassava from "cassava";
import { MerchantKeyProvider } from "./merchantSharedKey/MerchantKeyProvider";
import { JwtAuthorizationRouteOptions } from "./JwtAuthorizationRouteOptions";
export declare class JwtAuthorizationRoute implements cassava.routes.Route {
    private readonly options;
    private readonly infoLogFunction?;
    private readonly errorLogFunction?;
    private readonly authConfigPromise;
    private readonly rolesConfigPromise?;
    readonly merchantKeyProvider: MerchantKeyProvider;
    constructor(options: JwtAuthorizationRouteOptions);
    handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse>;
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse>;
    matches(evt: cassava.RouterEvent): boolean;
    private getToken;
    private redact;
    private getAuthorizeAsHeaderValue;
    private getVerifiedAuthorizationBadge;
}
