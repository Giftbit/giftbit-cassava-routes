"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cassava = require("cassava");
/**
 * A strongly-typed wrapped around cassava.RestError that standardizes our `messageCode` convention.
 */
class GiftbitRestError extends cassava.RestError {
    constructor(statusCode, message, messageCode) {
        super(statusCode, message, messageCode ? { messageCode } : null);
    }
}
exports.GiftbitRestError = GiftbitRestError;
//# sourceMappingURL=GiftbitRestError.js.map