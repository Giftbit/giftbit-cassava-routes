import * as cassava from "cassava";
/**
 * A strongly-typed wrapped around cassava.RestError that standardizes our `messageCode` convention.
 */
export declare class GiftbitRestError extends cassava.RestError {
    constructor(statusCode?: number, message?: string, messageCode?: string);
}
