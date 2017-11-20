import * as cassava from "cassava";
export declare class GiftbitRestError extends cassava.RestError {
    constructor(statusCode?: number, message?: string, messageCode?: string);
}
