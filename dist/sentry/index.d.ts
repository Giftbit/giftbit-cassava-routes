import * as awslambda from "aws-lambda";
import * as cassava from "cassava";
import { SentryConfig } from "./SentryConfig";
export interface WrapLambdaHandlerOptions {
    additionalTags?: {
        [key: string]: string;
    };
    handler?: (evt: any, ctx: awslambda.Context) => Promise<any>;
    logger?: (error: Error | string) => void;
    router?: cassava.Router;
    secureConfig: Promise<SentryConfig> | SentryConfig;
}
/**
 * Create a handler function that wraps the given handler and initializes Sentry.
 * @param options
 * @returns a Lambda handler
 */
export declare function wrapLambdaHandler(options: WrapLambdaHandlerOptions): (evt: any, ctx: awslambda.Context) => Promise<any>;
export declare function setSentryUser(user: {
    [key: string]: any;
} | null): void;
/**
 * Send an error notification to Sentry.
 */
export declare function sendErrorNotification(err: Error): void;
