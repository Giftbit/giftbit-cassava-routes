import "babel-polyfill";
export { AuthenticationBadgeKey } from "./AuthenticationBadgeKey";
export declare function fetchFromS3<T>(bucket: string, key: string): Promise<T>;
