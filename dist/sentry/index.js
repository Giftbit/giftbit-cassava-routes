"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Raven = require("raven");
let onInitialized;
let onInitializedFailed;
const initializedPromise = new Promise((resolve, reject) => {
    onInitialized = resolve;
    onInitializedFailed = reject;
});
const sentryPromises = [];
let logger = console.error.bind(console);
let ravenContext = {
    tags: {},
    extra: {}
};
/**
 * Create a handler function that wraps the given handler and initializes Sentry.
 * @param options
 * @returns a Lambda handler
 */
function wrapLambdaHandler(options) {
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
    const handler = options.handler || options.router.getLambdaHandler();
    installApiKey(options).then(onInitialized, onInitializedFailed);
    return (evt, ctx) => __awaiter(this, void 0, void 0, function* () {
        ravenContext.tags = Object.assign({}, getDefaultTags(evt, ctx), options.additionalTags);
        ravenContext.extra = ctx;
        const result = yield handler(evt, ctx);
        if (sentryPromises.length) {
            // Wait for any workers sending errors to Sentry for up to 3 seconds.
            // Any errors not sent to Sentry before the Lambda returns may never get sent.
            try {
                yield Promise.race([Promise.all(sentryPromises), new Promise(resolve => setTimeout(resolve, 3000))]);
            }
            catch (err) {
                logger("error awaiting sentry promises", err);
            }
            sentryPromises.length = 0;
        }
        return Promise.resolve(result);
    });
}
exports.wrapLambdaHandler = wrapLambdaHandler;
function installApiKey(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const secureConfig = yield options.secureConfig;
        if (!secureConfig.apiKey) {
            throw new Error("Sentry not initialized. Sentry API key object missing `apiKey` member.");
        }
        Raven.config(secureConfig.apiKey).install();
    });
}
function getDefaultTags(evt, ctx) {
    let tags = {
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
function sendErrorNotification(err) {
    sentryPromises.push(sendErrorNotificationImpl(err));
}
exports.sendErrorNotification = sendErrorNotification;
function sendErrorNotificationImpl(err) {
    return __awaiter(this, void 0, void 0, function* () {
        logger(err);
        yield initializedPromise;
        return new Promise(((resolve, reject) => {
            Raven.captureException(err, ravenContext, (ravenError) => {
                if (ravenError) {
                    logger("error sending to Sentry", ravenError);
                    reject(ravenError);
                }
                else {
                    resolve();
                }
            });
        }));
    });
}
//# sourceMappingURL=index.js.map