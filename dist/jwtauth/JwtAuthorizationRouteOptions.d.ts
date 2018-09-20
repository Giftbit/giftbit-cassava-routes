import { AuthenticationConfig } from "../secureConfig";
import { RolesConfig } from "../secureConfig";
import { AssumeScopeToken } from "../secureConfig";
export interface JwtAuthorizationRouteOptions {
    authConfigPromise: Promise<AuthenticationConfig>;
    rolesConfigPromise?: Promise<RolesConfig>;
    merchantKeyUri?: string;
    assumeGetSharedSecretToken?: Promise<AssumeScopeToken>;
    infoLogFunction?: (...msg: any[]) => void;
    errorLogFunction?: (...msg: any[]) => void;
}
