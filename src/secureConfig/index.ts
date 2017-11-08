import "babel-polyfill";
import * as aws from "aws-sdk";
export {AuthenticationConfig} from "./AuthenticationConfig";
export {RolesConfig} from "./RolesConfig";
export {AssumeScopeToken} from "./AssumeScopeToken";

const region = process.env["AWS_REGION"] || "";

const creds = new aws.EnvironmentCredentials("AWS");
const s3 = new aws.S3({
    apiVersion: "2006-03-01",
    credentials: creds,
    signatureVersion: "v4",
    region: region
});

export async function fetchFromS3<T>(bucket: string, key: string): Promise<T> {
    console.log(`Fetching secure config item ${bucket}/${key}.`);
    try {
        const resp = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();
        return JSON.parse(resp.Body.toString());
    } catch (error) {
        console.error(`Could not retrieve config from ${bucket}/${key}`, error);
        return null;
    }
}

export async function fetchFromS3ByEnvVar<T>(bucketEnvVar: string, keyEnvVar: string): Promise<T> {
    if (!process || !process.env[bucketEnvVar]) {
        console.error(`${bucketEnvVar} is not set.  The secure config item cannot be fetched.`);
        return null;
    }
    if (!process || !process.env[keyEnvVar]) {
        console.error(`${keyEnvVar} is not set.  The secure config item cannot be fetched.`);
        return null;
    }

    return await fetchFromS3<T>(process.env[bucketEnvVar], process.env[keyEnvVar]);
}
