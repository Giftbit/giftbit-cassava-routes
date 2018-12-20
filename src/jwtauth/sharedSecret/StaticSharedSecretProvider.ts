import {SharedSecretProvider} from "./SharedSecretProvider";

export class StaticSharedSecretProvider implements SharedSecretProvider {

    constructor(private readonly key: string) {
    }

    async getSharedSecret(token: string): Promise<string> {
        return Promise.resolve(this.key);
    }
}
