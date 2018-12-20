import * as awslambda from "aws-lambda";
import * as cassava from "cassava";
import * as Raven from "raven";
import {SentryConfig} from "./SentryConfig";
import {RavenContext} from "./RavenContext";

let onInitialized: () => void;
let onInitializedFailed: () => void;
const initializedPromise = new Promise<void>((resolve, reject) => {
    onInitialized = resolve;
    onInitializedFailed = reject;
});
const sentryPromises: Promise<void>[] = [];

let logger: (...msg: any[]) => void = console.error.bind(console);

let ravenContext: RavenContext = {
    tags: {},
    extra: {}
};

export interface WrapLambdaHandlerOptions {
    additionalTags?: { [key: string]: string; };
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
    }
    if (!options.router && !options.handler) {
        logger("Must specify one of router or handler.");
        throw new Error("Must specify one of router or handler.");
    }
    if (options.router) {
        options.router.errorHandler = sendErrorNotification;
    }
    const handler: (evt: any, ctx: awslambda.Context) => Promise<any> = options.handler || options.router.getLambdaHandler() as any;

    installApiKey(options).then(onInitialized, onInitializedFailed);

    return async (evt: any, ctx: awslambda.Context): Promise<any> => {
        ravenContext.tags = {
            ...getDefaultTags(evt, ctx),
            ...options.additionalTags
        };
        ravenContext.extra = ctx;

        const result = handler(evt, ctx);

        try {
            await Promise.all(sentryPromises);
        } catch (err) {
            logger("error awaiting sentry promises", err);
        }
        sentryPromises.length = 0;

        return result;
    };
}

async function installApiKey(options: WrapLambdaHandlerOptions): Promise<void> {
    const secureConfig = await options.secureConfig;
    if (!secureConfig.apiKey) {
        throw new Error("Sentry not initialized. Sentry API key object missing `apiKey` member.");
    }
    Raven.config(secureConfig.apiKey).install();
}

function getDefaultTags(evt: any, ctx: awslambda.Context): any {
    let tags: { [key: string]: string; } = {
        functionname: ctx.functionName,
        region: process.env["AWS_REGION"]
    };

    const accountMatcher = /arn:aws:lambda:([a-z0-9-]+):([0-9]+):.*/.exec(ctx.invokedFunctionArn);
    if (accountMatcher) {
        tags["aws_account"] = accountMatcher[2];
    }

    return tags;
}

/**
 * Send an error notification to Sentry.
 */
export function sendErrorNotification(err: Error): void {
    sentryPromises.push(sendErrorNotificationImpl(err));
}

async function sendErrorNotificationImpl(err: Error): Promise<void> {
    logger(err);
    await initializedPromise;
    return await new Promise<void>(((resolve, reject) => {
        Raven.captureException(err, ravenContext, (ravenError) => {
            if (ravenError) {
                logger("Unable to send to Sentry:", ravenError);
                reject(ravenError);
            } else {
                resolve();
            }
        });
    }));
}
