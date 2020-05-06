import * as awslambda from "aws-lambda";
import * as cassava from "cassava";
import {SentryConfig} from "./SentryConfig";
import Sentry = require("@sentry/node");

let logger: (...msg: any[]) => void = console.error.bind(console);
let sentryInitPromise: Promise<void>;
const sentryPromises: Promise<void>[] = [];

export interface WrapLambdaHandlerOptions {
    additionalTags?: { [key: string]: string };
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
export function wrapLambdaHandler(options: WrapLambdaHandlerOptions): (evt: any, ctx: awslambda.Context) => Promise<any> {
    if (options.logger) {
        logger = options.logger;
    } else {
        logger = console.error.bind(console);
    }

    if (!sentryInitPromise) {
        // Sentry is only initialized once under the assumption the credentials won't change.
        sentryInitPromise = (async () => {
            const secureConfig = await options.secureConfig;
            Sentry.init({
                dsn: secureConfig.apiKey,
                onFatalError: error => logger("FATAL ERROR", error)
            });
        })().catch(error => logger("Error initializing Sentry", error));
    }

    if (!options.router && !options.handler) {
        logger("Cannot wrap lambda handler: must specify one of router or handler.");
        throw new Error("Must specify one of router or handler.");
    }
    if (options.router) {
        options.router.errorHandler = sendErrorNotification;
    }
    const handler: (evt: any, ctx: awslambda.Context) => Promise<any> = options.handler || options.router.getLambdaHandler() as any;

    return async (evt: any, ctx: awslambda.Context): Promise<any> => {
        Sentry.setTags({
            ...getDefaultTags(evt, ctx),
            ...options.additionalTags
        });
        Sentry.setExtras(ctx);
        Sentry.setExtra("request", evt);

        try {
            const result = await handler(evt, ctx);
            await flushSentry(ctx);
            return Promise.resolve(result);
        } catch (err) {
            sendErrorNotification(err);
            await flushSentry(ctx);
            throw err;
        }
    };
}

function getDefaultTags(evt: any, ctx: awslambda.Context): any {
    const tags: { [key: string]: string } = {
        functionname: ctx.functionName,
        region: process.env["AWS_REGION"]
    };

    const accountMatcher = /arn:aws:lambda:([a-z0-9-]+):([0-9]+):.*/.exec(ctx.invokedFunctionArn);
    if (accountMatcher) {
        tags["aws_account"] = accountMatcher[2];
    }

    return tags;
}

async function flushSentry(ctx: awslambda.Context): Promise<void> {
    if (sentryPromises.length) {
        // Wait for any workers sending errors to Sentry.
        // Any errors not sent to Sentry before the Lambda returns may never get sent.
        try {
            await Promise.race([
                Promise.all(sentryPromises),
                new Promise(resolve => setTimeout(resolve, Math.min(3000, ctx.getRemainingTimeInMillis() - 3200)))
            ]);
            if (!await Sentry.flush(Math.min(3000, ctx.getRemainingTimeInMillis() - 200))) {
                logger("Flushing Sentry error timed out");
            }
        } catch (err) {
            logger("Error awaiting sentry promises", err);
        }
        sentryPromises.length = 0;
    }
    Sentry.setUser(null);
}

export function setSentryUser(user: { [key: string]: any } | null): void {
    Sentry.setUser(user);
}

/**
 * Send an error notification to Sentry.
 */
export function sendErrorNotification(err: Error): void {
    sentryPromises.push(sendErrorNotificationImpl(err));
}

async function sendErrorNotificationImpl(err: Error): Promise<void> {
    logger(err);
    await sentryInitPromise;
    Sentry.captureException(err);
}
