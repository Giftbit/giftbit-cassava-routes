import * as cassava from "cassava";

export class GiftbitRestError extends cassava.RestError {

    constructor(statusCode?: number, message?: string, messageCode?: string) {
        super(statusCode, message, messageCode ? {messageCode} : null);
    }
}
