import "babel-polyfill";
export { AuthenticationConfig } from "./AuthenticationConfig";
export { RolesConfig } from "./RolesConfig";
export { AssumeScopeToken } from "./AssumeScopeToken";
export declare function fetchFromS3<T>(bucket: string, key: string): Promise<T>;
export declare function fetchFromS3ByEnvVar<T>(bucketEnvVar: string, keyEnvVar: string): Promise<T>;
