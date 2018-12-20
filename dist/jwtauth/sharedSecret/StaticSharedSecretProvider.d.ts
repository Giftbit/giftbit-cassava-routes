import { SharedSecretProvider } from "./SharedSecretProvider";
export declare class StaticSharedSecretProvider implements SharedSecretProvider {
    private readonly key;
    constructor(key: string);
    getSharedSecret(token: string): Promise<string>;
}
