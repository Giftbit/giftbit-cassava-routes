import * as cassava from "cassava";

/**
 * A strongly-typed wrapped around cassava.RestError that standardizes our `messageCode` convention.
 */
export class GiftbitRestError extends cassava.RestError {

    constructor(statusCode?: number, message?: string, messageCode?: string) {
        super(statusCode, message, messageCode ? {messageCode} : null);
    }
}
