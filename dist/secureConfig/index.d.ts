import "babel-polyfill";
export { AuthenticationConfig } from "./AuthenticationConfig";
export declare function fetchFromS3<T>(bucket: string, key: string): Promise<T>;
