import * as cassava from "cassava";
import { AuthenticationConfig } from "../secureConfig/AuthenticationConfig";
import { RolesConfig } from "../secureConfig/RolesConfig";
import { AssumeScopeToken } from "../secureConfig/AssumeScopeToken";
import { MerchantKeyProvider } from "./merchantSharedKey/MerchantKeyProvider";
export declare class JwtAuthorizationRoute implements cassava.routes.Route {
    private readonly authConfigPromise;
    private readonly rolesConfigPromise?;
    private readonly merchantKeyUri?;
    private readonly assumeGetSharedSecretToken?;
    /**
     * Log errors to console.
     */
    logErrors: boolean;
    readonly merchantKeyProvider: MerchantKeyProvider;
    constructor(authConfigPromise: Promise<AuthenticationConfig>, rolesConfigPromise?: Promise<RolesConfig>, merchantKeyUri?: string, assumeGetSharedSecretToken?: Promise<AssumeScopeToken>);
    handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse>;
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): Promise<cassava.RouterResponse>;
    matches(evt: cassava.RouterEvent): boolean;
    private getToken;
    private redact;
    private getAuthorizeAsHeaderValue;
    private getVerifiedAuthorizationBadge;
}
