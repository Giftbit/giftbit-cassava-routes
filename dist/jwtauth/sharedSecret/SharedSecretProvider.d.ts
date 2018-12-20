export interface SharedSecretProvider {
    /**
     * Get the shared secret for the given Authorization token.
     */
    getSharedSecret(token: string): Promise<string>;
}
