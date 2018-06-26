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
let initialized = false;
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
    if (!options.router && !options.handler) {
        throw new Error("Must specify one of router or handler.");
    }
    const handler = options.handler || options.router.getLambdaHandler();
    installApiKey(options).then(() => initialized = true, err => console.error("sentry init error", err));
    if (options.router) {
        options.router.errorHandler = sendErrorNotification;
    }
    if (options.logger) {
        logger = options.logger;
    }
    return (evt, ctx) => {
        ravenContext.tags = Object.assign({}, getDefaultTags(ctx), options.additionalTags);
        ravenContext.extra = ctx;
        return handler(evt, ctx);
    };
}
exports.wrapLambdaHandler = wrapLambdaHandler;
function installApiKey(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const secureConfig = yield options.secureConfig;
        if (!secureConfig.apiKey) {
            throw new Error("Stored Sentry API key object missing `apiKey` member.");
        }
        Raven.config(secureConfig.apiKey).install();
    });
}
function getDefaultTags(ctx) {
    let tags = {
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
/**
 * Send an error notification to Sentry.
 * @param {Error | string} err
 */
function sendErrorNotification(err) {
    logger(err);
    if (!initialized) {
        logger("Error notification service is not initialized.");
        return;
    }
    Raven.captureException(err, ravenContext);
}
exports.sendErrorNotification = sendErrorNotification;
//# sourceMappingURL=index.js.map