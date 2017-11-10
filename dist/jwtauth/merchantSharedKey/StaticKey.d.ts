import { MerchantKeyProvider } from "./MerchantKeyProvider";
export declare class StaticKey implements MerchantKeyProvider {
    private readonly key;
    constructor(key: string);
    getMerchantKey(token: string): Promise<string>;
}
