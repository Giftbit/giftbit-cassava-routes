import * as superagent from "superagent";
import {AssumeScopeToken} from "../../secureConfig";
import {SharedSecretProvider} from "./SharedSecretProvider";

export class RestSharedSecretProvider implements SharedSecretProvider {

    constructor(
        private readonly sharedSecretUri: string,
        private readonly assumeGetSharedSecretToken: Promise<AssumeScopeToken>
    ) {
        if (!/^https?:\/\//.test(this.sharedSecretUri)) {
            this.sharedSecretUri = "https://" + this.sharedSecretUri;
        }
    }

    async getSharedSecret(token: string): Promise<string> {
        const tokenPayload = token.split(".")[1];
        const storageTokenConfig = await this.assumeGetSharedSecretToken;
        const resp = await superagent("GET", this.sharedSecretUri)
            .set("Authorization", `Bearer ${storageTokenConfig.assumeToken}`)
            .set("AuthorizeAs", tokenPayload);
        return resp.body;
    }
}
