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

export const logErrors: boolean = true;

export async function fetchFromS3<T>(bucket: string, key: string): Promise<T> {
    let retryWait = 100;
    while (true) {
        try {
            logErrors && console.log(`Fetching secure config item ${bucket}/${key}.`);
            const resp = await s3.getObject({
                Bucket: bucket,
                Key: key
            }).promise();
            return JSON.parse(resp.Body.toString());
        } catch (error) {
            logErrors && console.error(`Could not retrieve config from ${bucket}/${key}`, error);
            logErrors && console.log(`Retrying in ${retryWait}ms`);
            await new Promise(resolve => setTimeout(resolve, retryWait));
            retryWait = Math.min(retryWait * 2, 10000);
        }
    }
}

export async function fetchFromS3ByEnvVar<T>(bucketEnvVar: string, keyEnvVar: string): Promise<T> {
    if (!process || !process.env[bucketEnvVar]) {
        logErrors && console.error(`${bucketEnvVar} is not set.  The secure config item cannot be fetched.`);
        return null;
    }
    if (!process || !process.env[keyEnvVar]) {
        logErrors && console.error(`${keyEnvVar} is not set.  The secure config item cannot be fetched.`);
        return null;
    }

    return await fetchFromS3<T>(process.env[bucketEnvVar], process.env[keyEnvVar]);
}
