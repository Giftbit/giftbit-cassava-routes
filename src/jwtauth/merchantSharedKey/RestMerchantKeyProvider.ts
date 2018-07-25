import * as superagent from "superagent";
import {AssumeScopeToken} from "../../secureConfig";
import {MerchantKeyProvider} from "./MerchantKeyProvider";

export class RestMerchantKeyProvider implements MerchantKeyProvider {

    constructor(
        private readonly merchantKeyUri: string,
        private readonly assumeGetSharedSecretToken: Promise<AssumeScopeToken>
    ) {
        if (!/^https?:\/\//.test(this.merchantKeyUri)) {
            this.merchantKeyUri = "https://" + this.merchantKeyUri;
        }
    }

    async getMerchantKey(token: string): Promise<string> {
        const tokenPayload = token.split(".")[1];
        const storageTokenConfig = await this.assumeGetSharedSecretToken;
        const resp = await superagent("GET", this.merchantKeyUri)
            .set("Authorization", `Bearer ${storageTokenConfig.assumeToken}`)
            .set("AuthorizeAs", tokenPayload);
        return resp.body;
    }
}
