import { AssumeScopeToken } from "../../secureConfig/AssumeScopeToken";
import { MerchantKeyProvider } from "./MerchantKeyProvider";
export declare class RestMerchantKeyProvider implements MerchantKeyProvider {
    private readonly merchantKeyUri;
    private readonly assumeGetSharedSecretToken;
    constructor(merchantKeyUri: string, assumeGetSharedSecretToken: Promise<AssumeScopeToken>);
    getMerchantKey(token: string): Promise<string>;
}
