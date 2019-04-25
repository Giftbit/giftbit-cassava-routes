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

export interface FetchFromS3Options {
    errorLogger?: (...args: any) => void;
    maxAttempts?: number;
}

export async function fetchFromS3<T>(bucket: string, key: string, options?: FetchFromS3Options): Promise<T> {
    let retryWait = 100;
    const errorLogger = (options && options.errorLogger) || console.log.bind(console);
    const maxAttempts = (options && options.maxAttempts) || Number.POSITIVE_INFINITY;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            errorLogger(`Fetching secure config item ${bucket}/${key}.`);
            const resp = await s3.getObject({
                Bucket: bucket,
                Key: key
            }).promise();
            return JSON.parse(resp.Body.toString());
        } catch (error) {
            errorLogger(`Could not retrieve config from ${bucket}/${key}`, error);
            errorLogger(`Retrying in ${retryWait}ms`);
            await new Promise(resolve => setTimeout(resolve, retryWait));
            retryWait = Math.min(retryWait * 2, 10000);
        }
    }
    throw new Error("Could not fetch secure config item.  Max attempts reached.");
}

export async function fetchFromS3ByEnvVar<T>(bucketEnvVar: string, keyEnvVar: string, options?: FetchFromS3Options): Promise<T> {
    const errorLogger = (options && options.errorLogger) || console.log.bind(console);
    if (!process || !process.env[bucketEnvVar]) {
        errorLogger(`${bucketEnvVar} is not set.  The secure config item cannot be fetched.`);
        return null;
    }
    if (!process || !process.env[keyEnvVar]) {
        errorLogger(`${keyEnvVar} is not set.  The secure config item cannot be fetched.`);
        return null;
    }

    return await fetchFromS3<T>(process.env[bucketEnvVar], process.env[keyEnvVar], options);
}
