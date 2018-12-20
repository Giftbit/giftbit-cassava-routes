"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const superagent = require("superagent");
class RestSharedSecretProvider {
    constructor(sharedSecretUri, assumeGetSharedSecretToken) {
        this.sharedSecretUri = sharedSecretUri;
        this.assumeGetSharedSecretToken = assumeGetSharedSecretToken;
        if (!/^https?:\/\//.test(this.sharedSecretUri)) {
            this.sharedSecretUri = "https://" + this.sharedSecretUri;
        }
    }
    getSharedSecret(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenPayload = token.split(".")[1];
            const storageTokenConfig = yield this.assumeGetSharedSecretToken;
            const resp = yield superagent("GET", this.sharedSecretUri)
                .set("Authorization", `Bearer ${storageTokenConfig.assumeToken}`)
                .set("AuthorizeAs", tokenPayload);
            return resp.body;
        });
    }
}
exports.RestSharedSecretProvider = RestSharedSecretProvider;
//# sourceMappingURL=RestSharedSecretProvider.js.map