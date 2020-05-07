import { AuthenticationConfig, RolesConfig } from "../secureConfig";
import { SharedSecretProvider } from "./sharedSecret";
import { AuthorizationBadge } from "./AuthorizationBadge";
export interface JwtAuthorizationRouteOptions {
    authConfigPromise: Promise<AuthenticationConfig>;
    rolesConfigPromise?: Promise<RolesConfig>;
    sharedSecretProvider?: SharedSecretProvider;
    infoLogFunction?: (...msg: any[]) => void;
    errorLogFunction?: (...msg: any[]) => void;
    /**
     * Callback function called when the user authorizes,
     * or null if they fail to authorize.
     */
    onAuth?: (auth: AuthorizationBadge | null) => void;
}
