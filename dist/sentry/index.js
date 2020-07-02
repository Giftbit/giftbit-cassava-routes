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
exports.sendErrorNotification = exports.setSentryUser = exports.wrapLambdaHandler = void 0;
const Sentry = require("@sentry/node");
// eslint-disable-next-line no-console
let logger = console.error.bind(console);
/**
 * Create a handler function that wraps the given handler and initializes Sentry.
 * @param options
 * @returns a Lambda handler
 */
function wrapLambdaHandler(options) {
    var _a;
    if (options.logger) {
        logger = options.logger;
    }
    else {
        // eslint-disable-next-line no-console
        logger = console.error.bind(console);
    }
    Sentry.init({
        dsn: options.sentryDsn,
        ignoreErrors: (_a = options.filtersOptions) === null || _a === void 0 ? void 0 : _a.ignoreErrors
    });
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
        // How long to wait for Sentry to flush events.
        const flushTimeoutMillis = 3000;
        // How much time to leave for the rest of lambda execution.
        const finishResponseBufferMillis = 50;
        if (!(yield Sentry.flush(Math.min(flushTimeoutMillis, ctx.getRemainingTimeInMillis() - finishResponseBufferMillis)))) {
            logger("Flushing Sentry timed out");
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
    logger(err);
    Sentry.captureException(err);
}
exports.sendErrorNotification = sendErrorNotification;
//# sourceMappingURL=index.js.map