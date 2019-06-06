export { AuthenticationConfig } from "./AuthenticationConfig";
export { RolesConfig } from "./RolesConfig";
export { AssumeScopeToken } from "./AssumeScopeToken";
export { StripeConfig } from "./StripeConfig";
export interface FetchFromS3Options {
    errorLogger?: (...args: any) => void;
    maxAttempts?: number;
}
export declare function fetchFromS3<T>(bucket: string, key: string, options?: FetchFromS3Options): Promise<T>;
export declare function fetchFromS3ByEnvVar<T>(bucketEnvVar: string, keyEnvVar: string, options?: FetchFromS3Options): Promise<T>;
