import { AuthenticationConfig } from "../secureConfig";
import { RolesConfig } from "../secureConfig";
import { SharedSecretProvider } from "./sharedSecret/SharedSecretProvider";
export interface JwtAuthorizationRouteOptions {
    authConfigPromise: Promise<AuthenticationConfig>;
    rolesConfigPromise?: Promise<RolesConfig>;
    sharedSecretProvider?: SharedSecretProvider;
    infoLogFunction?: (...msg: any[]) => void;
    errorLogFunction?: (...msg: any[]) => void;
}
