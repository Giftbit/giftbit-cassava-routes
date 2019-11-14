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
const aws = require("aws-sdk");
const region = process.env["AWS_REGION"] || "";
const creds = new aws.EnvironmentCredentials("AWS");
const s3 = new aws.S3({
    apiVersion: "2006-03-01",
    credentials: creds,
    signatureVersion: "v4",
    region: region
});
function fetchFromS3(bucket, key, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let retryWait = 100;
        const errorLogger = (options && options.errorLogger) || console.log.bind(console);
        const maxAttempts = (options && options.maxAttempts) || Number.POSITIVE_INFINITY;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                errorLogger(`Fetching secure config item ${bucket}/${key}.`);
                const resp = yield s3.getObject({
                    Bucket: bucket,
                    Key: key
                }).promise();
                return JSON.parse(resp.Body.toString());
            }
            catch (error) {
                errorLogger(`Could not retrieve config from ${bucket}/${key}`, error);
                errorLogger(`Retrying in ${retryWait}ms`);
                yield new Promise(resolve => setTimeout(resolve, retryWait));
                retryWait = Math.min(retryWait * 2, 10000);
            }
        }
        throw new Error("Could not fetch secure config item.  Max attempts reached.");
    });
}
exports.fetchFromS3 = fetchFromS3;
function fetchFromS3ByEnvVar(bucketEnvVar, keyEnvVar, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const errorLogger = (options && options.errorLogger) || console.log.bind(console);
        if (!process || !process.env[bucketEnvVar]) {
            errorLogger(`${bucketEnvVar} is not set.  The secure config item cannot be fetched.`);
            return null;
        }
        if (!process || !process.env[keyEnvVar]) {
            errorLogger(`${keyEnvVar} is not set.  The secure config item cannot be fetched.`);
            return null;
        }
        return yield fetchFromS3(process.env[bucketEnvVar], process.env[keyEnvVar], options);
    });
}
exports.fetchFromS3ByEnvVar = fetchFromS3ByEnvVar;
//# sourceMappingURL=index.js.map