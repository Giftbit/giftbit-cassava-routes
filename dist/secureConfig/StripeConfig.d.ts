/**
 * Stripe configuration values stored in secure config.
 */
export interface StripeConfig {
    email: string;
    test: StripeConfig.StripeModeConfig;
    live: StripeConfig.StripeModeConfig;
}
export declare namespace StripeConfig {
    /**
     * Configuration particular to a mode in Stripe (live or test).
     */
    interface StripeModeConfig {
        clientId: string;
        secretKey: string;
        publishableKey: string;
        connectWebhookSigningSecret: string;
    }
}
