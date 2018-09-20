import {RolesConfig} from "../secureConfig";

export interface AuthorizationBadgeOptions {
    rolesConfig?: RolesConfig;
    infoLogFunction?: (...msg: any[]) => void;
    errorLogFunction?: (...msg: any[]) => void;
}
