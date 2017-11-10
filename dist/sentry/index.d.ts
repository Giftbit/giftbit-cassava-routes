import * as awslambda from "aws-lambda";
import { Router } from "cassava";
export declare function errorNotificationWrapper<T>(apiKeyS3Bucket: string, apiKeyS3Key: string, router: Router, handler: (evt: T, ctx: awslambda.Context, callback: awslambda.Callback) => void): (evt: T, ctx: awslambda.Context, callback: awslambda.Callback) => void;
export declare function init(apiKeyS3Bucket: string, apiKeyS3Key: string, ctx: awslambda.Context, router: Router): Promise<void>;
export declare function getDefaultTags(ctx: awslambda.Context): any;
export declare function initAdvanced(ctx: awslambda.Context, router: Router, options: AsyncBufferedSentryLoggerOptions): Promise<void>;
export interface AsyncBufferedSentryLoggerOptions {
    apiKeyS3Bucket?: string;
    apiKeyS3Key?: string;
    context?: AdditionalErrorNotificationContext;
}
/**
 * This can be used to pass additional context to Sentry specific to the error.
 * The keys "tags" and "extra" are unique to sentry.
 */
export interface AdditionalErrorNotificationContext {
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
export declare function sendErrorNotificaiton(err: Error, context?: AdditionalErrorNotificationContext): void;
