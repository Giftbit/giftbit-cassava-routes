export interface MerchantKeyProvider {
    getMerchantKey(token: string): Promise<string>;
}
