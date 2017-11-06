
import {MerchantKeyProvider} from "./MerchantKeyProvider";

export class StaticKey implements MerchantKeyProvider {

    constructor(
        private readonly key: string,
    ) {}

    async getMerchantKey(token: string): Promise<string> {
        return Promise.resolve(this.key);
    }
}
