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
const aws = require("aws-sdk");
const Raven = require("raven");
let initialized = false;
function errorNotificationWrapper(apiKeyS3Bucket, apiKeyS3Key, router, handler) {
    return (evt, ctx, callback) => {
        init(apiKeyS3Bucket, apiKeyS3Key, ctx, router).catch(err => console.error("sentry init error", err));
        handler(evt, ctx, callback);
    };
}
exports.errorNotificationWrapper = errorNotificationWrapper;
function init(apiKeyS3Bucket, apiKeyS3Key, ctx, router) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiKeyS3Bucket) {
            throw new Error("apiKeyS3Bucket not set");
        }
        if (!apiKeyS3Key) {
            throw new Error("apiKeyS3Key not set");
        }
        return initAdvanced(ctx, router, {
            apiKeyS3Bucket: apiKeyS3Bucket,
            apiKeyS3Key: apiKeyS3Key,
            context: { tags: getDefaultTags(ctx) }
        });
    });
}
exports.init = init;
function getDefaultTags(ctx) {
    let tags = {
        functionname: ctx.functionName
    };
    const accountMatcher = /arn:aws:lambda:([a-z0-9-]+):([0-9]+):.*/.exec(ctx.invokedFunctionArn);
    if (accountMatcher) {
        tags["region"] = accountMatcher[1];
        tags["aws_account"] = accountMatcher[2];
    }
    return tags;
}
exports.getDefaultTags = getDefaultTags;
function initAdvanced(ctx, router, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (initialized) {
            return;
        }
        if (options.apiKeyS3Bucket && options.apiKeyS3Key) {
            const s3 = new aws.S3({
                apiVersion: "2006-03-01",
                credentials: new aws.EnvironmentCredentials("AWS"),
                signatureVersion: "v4"
            });
            const s3Object = yield s3.getObject({
                Bucket: options.apiKeyS3Bucket,
                Key: options.apiKeyS3Key
            }).promise();
            const apiKeyObject = JSON.parse(s3Object.Body.toString());
            if (!apiKeyObject.apiKey) {
                throw new Error("Stored Sentry API key object missing `apiKey` member.");
            }
            Raven.config(apiKeyObject.apiKey).install();
        }
        options.context.extra = ctx;
        router.errorHandler = (err) => {
            console.error(err);
            Raven.captureException(err, options.context);
        };
        initialized = true;
    });
}
exports.initAdvanced = initAdvanced;
function sendErrorNotificaiton(err, context) {
    if (!initialized) {
        console.log(`Error notification service must be initialized. Attempted to send error: ${err}`);
        throw new Error("Error notification service must be initialized");
    }
    console.error(err);
    Raven.captureException(err, context);
}
exports.sendErrorNotificaiton = sendErrorNotificaiton;
//# sourceMappingURL=index.js.map