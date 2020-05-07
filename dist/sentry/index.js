"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sentry = require("@sentry/node");
let logger = console.error.bind(console);
let sentryInitPromise;
const sentryPromises = [];
/**
 * Create a handler function that wraps the given handler and initializes Sentry.
 * @param options
 * @returns a Lambda handler
 */
function wrapLambdaHandler(options) {
    if (options.logger) {
        logger = options.logger;
    }
    else {
        logger = console.error.bind(console);
    }
    if (!sentryInitPromise) {
        // Sentry is only initialized once under the assumption the credentials won't change.
        sentryInitPromise = (() => __awaiter(this, void 0, void 0, function* () {
            const secureConfig = yield options.secureConfig;
            Sentry.init({
                dsn: secureConfig.apiKey,
                onFatalError: error => logger("FATAL ERROR", error)
            });
        }))().catch(error => logger("Error initializing Sentry", error));
    }
    if (!options.router && !options.handler) {
        logger("Cannot wrap lambda handler: must specify one of router or handler.");
        throw new Error("Must specify one of router or handler.");
    }
    if (options.router) {
        options.router.errorHandler = sendErrorNotification;
    }
    const handler = options.handler || options.router.getLambdaHandler();
    return (evt, ctx) => __awaiter(this, void 0, void 0, function* () {
        Sentry.setTags(Object.assign(Object.assign({}, getDefaultTags(evt, ctx)), options.additionalTags));
        Sentry.setExtras(ctx);
        try {
            const result = yield handler(evt, ctx);
            yield flushSentry(ctx);
            return Promise.resolve(result);
        }
        catch (err) {
            sendErrorNotification(err);
            yield flushSentry(ctx);
            throw err;
        }
    });
}
exports.wrapLambdaHandler = wrapLambdaHandler;
function getDefaultTags(evt, ctx) {
    const tags = {
        functionname: ctx.functionName,
        region: process.env["AWS_REGION"]
    };
    const accountMatcher = /arn:aws:lambda:([a-z0-9-]+):([0-9]+):.*/.exec(ctx.invokedFunctionArn);
    if (accountMatcher) {
        tags["aws_account"] = accountMatcher[2];
    }
    return tags;
}
function flushSentry(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (sentryPromises.length) {
            // Wait for any workers sending errors to Sentry.
            // Any errors not sent to Sentry before the Lambda returns may never get sent.
            try {
                // How long to wait for Sentry promises.
                const sentryPromiseTimeoutMillis = 3000;
                // How long to wait for Sentry to flush events.
                const flushTimeoutMillis = 3000;
                // How much time to leave for the rest of lambda execution.
                const finishResponseBufferMillis = 50;
                yield Promise.race([
                    Promise.all(sentryPromises),
                    new Promise(resolve => setTimeout(resolve, Math.min(sentryPromiseTimeoutMillis, ctx.getRemainingTimeInMillis() - flushTimeoutMillis - finishResponseBufferMillis)))
                ]);
                if (!(yield Sentry.flush(Math.min(flushTimeoutMillis, ctx.getRemainingTimeInMillis() - finishResponseBufferMillis)))) {
                    logger("Flushing Sentry error timed out");
                }
            }
            catch (err) {
                logger("Error awaiting sentry promises", err);
            }
            sentryPromises.length = 0;
        }
        Sentry.setUser(null);
    });
}
function setSentryUser(user) {
    Sentry.setUser(user);
}
exports.setSentryUser = setSentryUser;
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
        yield sentryInitPromise;
        Sentry.captureException(err);
    });
}
//# sourceMappingURL=index.js.map