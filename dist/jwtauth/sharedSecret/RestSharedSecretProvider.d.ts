import { AssumeScopeToken } from "../../secureConfig";
import { SharedSecretProvider } from "./SharedSecretProvider";
export declare class RestSharedSecretProvider implements SharedSecretProvider {
    private readonly sharedSecretUri;
    private readonly assumeGetSharedSecretToken;
    constructor(sharedSecretUri: string, assumeGetSharedSecretToken: Promise<AssumeScopeToken>);
    getSharedSecret(token: string): Promise<string>;
}
