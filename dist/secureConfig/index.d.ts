import "babel-polyfill";
export { AuthenticationConfig } from "./AuthenticationConfig";
export declare function fetchFromS3<T>(bucket: string, key: string): Promise<T>;
export declare function fetchFromS3ByEnvVar<T>(bucket: string, envVar: string): Promise<T>;
