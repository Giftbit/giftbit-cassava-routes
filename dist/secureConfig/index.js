"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        console.log("Fetching Config from s3", bucket, key);
        const getObject = yield s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise()
            .then(s3Object => {
            return JSON.parse(s3Object.Body.toString());
        }).catch(error => console.error(`Could not retrieve secureConfig from ${bucket}/${key}`, error));
        return getObject;
    });
}
exports.fetchFromS3 = fetchFromS3;
//# sourceMappingURL=index.js.map