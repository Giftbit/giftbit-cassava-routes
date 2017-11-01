import * as superagent from "superagent";
import {AssumeStorageScopeToken} from "../secureConfig/AssumeStorageScopeToken";

export function getMerchantSharedKeyProvider(storageUri: string,  assumeStorageToken: Promise<AssumeStorageScopeToken> ): (token: string) => Promise<string>  {
    return async function (token: string): Promise<string> {
        const tokenPayload = token.split(".")[1];
        const storageTokenConfig = (await assumeStorageToken);
        if (!this.jwtSecrets.get(tokenPayload)) {
            const resp = superagent("GET", storageUri)
                .set("Authorization", `Bearer ${storageTokenConfig.assumeToken}`)
                .set("AuthorizeAs", tokenPayload);
            this.jwtSecrets.set(tokenPayload, resp);
        }
        return (await this.jwtSecrets.get(tokenPayload)).body;
    };
}
