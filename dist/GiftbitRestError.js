"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cassava = require("cassava");
class GiftbitRestError extends cassava.RestError {
    constructor(statusCode, message, messageCode) {
        super(statusCode, message, messageCode ? { messageCode } : null);
    }
}
exports.GiftbitRestError = GiftbitRestError;
//# sourceMappingURL=GiftbitRestError.js.map