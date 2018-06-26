/**
 * This can be used to pass additional context to Sentry specific to the error.
 * The keys "tags" and "extra" are unique to sentry.
 */
export interface RavenContext {
    /**
     * Appears at the top level of the sentry event.
     * ie
     *      tags = { aws_account: "ACCOUNT_XYZ", function_name: "lambda-service-x"};
     */
    tags?: {
        [key: string]: string;
    };
    /**
     * Appears as a JSON object within the sentry event.
     * This is a good place to capture 'extra' information.
     * ie
     *      extra = <awslambda.Context> amazonContext;
     */
    extra?: {
        [key: string]: any;
    };
}
