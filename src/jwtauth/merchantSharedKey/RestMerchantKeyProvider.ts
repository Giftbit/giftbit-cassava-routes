import * as superagent from "superagent";
import {AssumeStorageScopeToken} from "../../secureConfig/AssumeStorageScopeToken";
import {MerchantKeyProvider} from "./MerchantKeyProvider";

export class RestMerchantKeyProvider implements MerchantKeyProvider {

    constructor(
        private readonly storageUri: string,
        private readonly assumeStorageToken: Promise<AssumeStorageScopeToken>) {}

    async getMerchantKey(token: string): Promise<string> {
        const tokenPayload = token.split(".")[1];
        const storageTokenConfig = (await this.assumeStorageToken);
        const resp = await superagent("GET", this.storageUri)
            .set("Authorization", `Bearer ${storageTokenConfig.assumeToken}`)
            .set("AuthorizeAs", tokenPayload);
        return resp.body;
    }
}
