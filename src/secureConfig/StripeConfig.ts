/**
 * Stripe configuration values stored in secure config.
 */
export interface StripeConfig {
    // The email address of the account.  We don't really use this anywhere but
    // it helps us identify the account.
    email: string;
    test: StripeConfig.StripeModeConfig;
    live: StripeConfig.StripeModeConfig;
}

export namespace StripeConfig {
    /**
     * Configuration particular to a mode in Stripe (live or test).
     */
    export interface StripeModeConfig {
        // Available in Connect -> Settings
        clientId: string;

        // Available in Developers -> API keys
        secretKey: string;

        // Available in Developers -> API keys
        publishableKey: string;

        // Webhook for events from Connect applications.
        // Available in Developers -> Webhooks
        connectWebhookSigningSecret: string;
    }

}
