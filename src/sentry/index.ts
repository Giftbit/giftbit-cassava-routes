import * as awslambda from "aws-lambda";
import * as cassava from "cassava";
import Sentry = require("@sentry/node");

let logger: (...msg: any[]) => void = console.error.bind(console);

export interface WrapLambdaHandlerOptions {
    additionalTags?: { [key: string]: string };
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
export function wrapLambdaHandler(options: WrapLambdaHandlerOptions): (evt: any, ctx: awslambda.Context) => Promise<any> {
    if (options.logger) {
        logger = options.logger;
    } else {
        logger = console.error.bind(console);
    }

    Sentry.init({
        dsn: options.sentryDsn,
        ignoreErrors: options.filtersOptions.ignoreErrors
    });

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
    // How long to wait for Sentry to flush events.
    const flushTimeoutMillis = 3000;

    // How much time to leave for the rest of lambda execution.
    const finishResponseBufferMillis = 50;

    if (!await Sentry.flush(Math.min(flushTimeoutMillis, ctx.getRemainingTimeInMillis() - finishResponseBufferMillis))) {
        logger("Flushing Sentry timed out");
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
    logger(err);
    Sentry.captureException(err);
}
