import * as awslambda from "aws-lambda";
import * as cassava from "cassava";
export interface WrapLambdaHandlerOptions {
    additionalTags?: {
        [key: string]: string;
    };
    handler?: (evt: any, ctx: awslambda.Context) => Promise<any>;
    logger?: (error: Error | string) => void;
    router?: cassava.Router;
    sentryDsn: string;
    filtersOptions?: {
        ignoreErrors?: Array<string | RegExp>;
    };
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
