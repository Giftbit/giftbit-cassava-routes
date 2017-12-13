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
const region = process.env["AWS_REGION"] || "";
const creds = new aws.EnvironmentCredentials("AWS");
const s3 = new aws.S3({
    apiVersion: "2006-03-01",
    credentials: creds,
    signatureVersion: "v4",
    region: region
});
exports.logErrors = true;
function fetchFromS3(bucket, key) {
    return __awaiter(this, void 0, void 0, function* () {
        let retryWait = 100;
        while (true) {
            try {
                exports.logErrors && console.log(`Fetching secure config item ${bucket}/${key}.`);
                const resp = yield s3.getObject({
                    Bucket: bucket,
                    Key: key
                }).promise();
                return JSON.parse(resp.Body.toString());
            }
            catch (error) {
                exports.logErrors && console.error(`Could not retrieve config from ${bucket}/${key}`, error);
                exports.logErrors && console.log(`Retrying in ${retryWait}ms`);
                yield new Promise(resolve => setTimeout(resolve, retryWait));
                retryWait = Math.min(retryWait * 2, 10000);
            }
        }
    });
}
exports.fetchFromS3 = fetchFromS3;
function fetchFromS3ByEnvVar(bucketEnvVar, keyEnvVar) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process || !process.env[bucketEnvVar]) {
            exports.logErrors && console.error(`${bucketEnvVar} is not set.  The secure config item cannot be fetched.`);
            return null;
        }
        if (!process || !process.env[keyEnvVar]) {
            exports.logErrors && console.error(`${keyEnvVar} is not set.  The secure config item cannot be fetched.`);
            return null;
        }
        return yield fetchFromS3(process.env[bucketEnvVar], process.env[keyEnvVar]);
    });
}
exports.fetchFromS3ByEnvVar = fetchFromS3ByEnvVar;
//# sourceMappingURL=index.js.map