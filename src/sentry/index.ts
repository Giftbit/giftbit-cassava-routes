import * as awslambda from "aws-lambda";
import * as cassava from "cassava";
import * as Raven from "raven";
import {SentryConfig} from "./SentryConfig";
import {RavenContext} from "./RavenContext";

let initialized = false;

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
    if (!options.router && !options.handler) {
        throw new Error("Must specify one of router or handler.");
    }
    const handler: (evt: any, ctx: awslambda.Context) => Promise<any> = options.handler || options.router.getLambdaHandler() as any;

    installApiKey(options).then(onInitialized, err => console.error("Sentry init error", err));

    if (options.router) {
        options.router.errorHandler = sendErrorNotification;
    }
    if (options.logger) {
        logger = options.logger;
    }

    return (evt: any, ctx: awslambda.Context): Promise<any> => {
        ravenContext.tags = {
            ...getDefaultTags(ctx),
            ...options.additionalTags
        };
        ravenContext.extra = ctx;
        return handler(evt, ctx);
    };
}

async function installApiKey(options: WrapLambdaHandlerOptions): Promise<void> {
    const secureConfig = await options.secureConfig;
    if (!secureConfig.apiKey) {
        throw new Error("Sentry API key object missing `apiKey` member.");
    }
    Raven.config(secureConfig.apiKey).install();
}

function getDefaultTags(ctx: awslambda.Context): any {
    let tags: { [key: string]: string; } = {
        // I think we did it this way for consistency with some existing thing.
        functionname: ctx.functionName
    };

    const accountMatcher = /arn:aws:lambda:([a-z0-9-]+):([0-9]+):.*/.exec(ctx.invokedFunctionArn);
    if (accountMatcher) {
        tags["region"] = accountMatcher[1];
        tags["aws_account"] = accountMatcher[2];
    }
    return tags;
}

const errorQueue: Error[] = [];

function onInitialized(): void {
    initialized = true;
    while (errorQueue.length) {
        Raven.captureException(errorQueue.shift(), ravenContext, (ravenError) => {
            if (ravenError) {
                logger("error sending to Sentry", ravenError);
            }
        });
    }
}

/**
 * Send an error notification to Sentry.
 * @param {Error | string} err
 */
export function sendErrorNotification(err: Error): void {
    if (!initialized) {
        logger("(queued for sending)", err);
        errorQueue.push(err);
    } else {
        logger(err);
        Raven.captureException(err, ravenContext, (ravenError) => {
            if (ravenError) {
                logger("error sending to Sentry", ravenError);
            }
        });
    }
}
