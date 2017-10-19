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
require("babel-polyfill");
const aws = require("aws-sdk");
const region = process.env["AWS_REGION"] || "";
const creds = new aws.EnvironmentCredentials("AWS");
const s3 = new aws.S3({
    apiVersion: "2006-03-01",
    credentials: creds,
    signatureVersion: "v4",
    region: region
});
function fetchFromS3(bucket, key) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching secure config item ${bucket}/${key}.`);
        try {
            const resp = yield s3.getObject({
                Bucket: bucket,
                Key: key
            }).promise();
            return JSON.parse(resp.Body.toString());
        }
        catch (error) {
            console.error(`Could not retrieve config from ${bucket}/${key}`, error);
            return null;
        }
    });
}
exports.fetchFromS3 = fetchFromS3;
function fetchFromS3ByEnvVar(bucket, envVar) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process || !process.env[envVar]) {
            console.error(`${envVar} is not set.  The secure config item cannot be fetched.`);
            return null;
        }
        console.log(`Secure config env var ${envVar} = ${process.env[envVar]}.`);
        return yield fetchFromS3(bucket, process.env[envVar]);
    });
}
exports.fetchFromS3ByEnvVar = fetchFromS3ByEnvVar;
//# sourceMappingURL=index.js.map