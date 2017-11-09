import * as awslambda from "aws-lambda";
import * as aws from "aws-sdk";
import {Router} from "cassava";

let Raven = require('raven');
let initialized = false;

export function errorNotificationWrapper<T>(apiKeyS3Bucket: string, apiKeyS3Key: string, router: Router, handler: (evt: T, ctx: awslambda.Context, callback: awslambda.Callback) => void): (evt: T, ctx: awslambda.Context, callback: awslambda.Callback) => void {
    return (evt: T, ctx: awslambda.Context, callback: awslambda.Callback): void => {
        init(apiKeyS3Bucket, apiKeyS3Key, ctx, router).catch(err => console.error("sentry init error", err));
        handler(evt, ctx, callback);
    };
}

export async function init(apiKeyS3Bucket: string, apiKeyS3Key: string, ctx: awslambda.Context, router: Router): Promise<void> {
    if (!apiKeyS3Bucket) {
        throw new Error("apiKeyS3Bucket not set");
    }
    if (!apiKeyS3Key) {
        throw new Error("apiKeyS3Key not set");
    }

    return initAdvanced(ctx, router, {
        apiKeyS3Bucket: apiKeyS3Bucket,
        apiKeyS3Key: apiKeyS3Key,
        context: {tags: getDefaultTags(ctx)}
    });
}

export function getDefaultTags(ctx: awslambda.Context): any {
    let tags: { [key: string]: string; } = {
        functionname: ctx.functionName
    };

    const accountMatcher = /arn:aws:lambda:([a-z0-9-]+):([0-9]+):.*/.exec(ctx.invokedFunctionArn);
    if (accountMatcher) {
        tags["region"] = accountMatcher[1];
        tags["aws_account"] = accountMatcher[2];
    }
    return tags;
}

export async function initAdvanced(ctx: awslambda.Context, router: Router, options: AsyncBufferedSentryLoggerOptions): Promise<void> {
    if (initialized) {
        return;
    }

    if (options.apiKeyS3Bucket && options.apiKeyS3Key) {
        const s3 = new aws.S3({
            apiVersion: "2006-03-01",
            credentials: new aws.EnvironmentCredentials("AWS"),
            signatureVersion: "v4"
        });
        const s3Object = await s3.getObject({
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
    router.errorHandler = (err: Error) => {
        console.error(err);
        Raven.captureException(err, options.context);
    };
    initialized = true;
}

export interface AsyncBufferedSentryLoggerOptions {
    apiKeyS3Bucket?: string;
    apiKeyS3Key?: string;
    context?: AdditionalErrorNotificationContext
}

export interface AdditionalErrorNotificationContext {
    tags?: { [key: string]: string; };
    extra?: { [key: string]: any; };
}

export function sendErrorNotificaiton(err: Error, context: AdditionalErrorNotificationContext) {
    if (!initialized) {
        console.log(`Error notification service must be initialized. Attempted to send error: ${err}`);
        throw new Error("Error notification service must be initialized");
    }
    console.error(err);
    Raven.captureException(err, context);
}