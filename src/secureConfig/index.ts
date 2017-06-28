import "babel-polyfill";
import * as aws from "aws-sdk";
export {AuthenticationConfig} from "./AuthenticationConfig";

const region = process.env["AWS_REGION"] || "";

const creds = new aws.EnvironmentCredentials("AWS");
const s3 = new aws.S3({
    apiVersion: "2006-03-01",
    credentials: creds,
    signatureVersion: "v4",
    region: region
});

export async function fetchFromS3<T>(bucket: string, key: string): Promise<T> {
    console.log("Fetching Config from s3", bucket, key);
    const getObject = await s3.getObject({
        Bucket: bucket,
        Key: key
    }).promise()
        .then(s3Object => {
            return JSON.parse(s3Object.Body.toString());
        }).catch(error => console.error(`Could not retrieve secureConfig from ${bucket}/${key}`, error));

    return getObject;
}
