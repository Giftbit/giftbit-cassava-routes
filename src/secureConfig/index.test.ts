import * as aws from "aws-sdk";
import * as chai from "chai";
import * as sinon from "sinon";
import * as secureConfig from "./index";

describe("secureConfig", () => {
    describe("fetchFromS3()", () => {

        let sandbox: sinon.SinonSandbox;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
            (secureConfig as any).logErrors = false;
        });

        afterEach(() => {
            sandbox.restore();
            (secureConfig as any).logErrors = true;
        });

        it("fetches config items from s3", async () => {
            const value = {a: "alpha"};

            const stub = sandbox.stub(aws.S3.prototype, "makeRequest")
                .callsFake((operation: string, params: {Bucket: string, Key: string})  => {
                    chai.assert.equal(params.Bucket, "hat");
                    chai.assert.equal(params.Key, "Florida");
                    return {
                        promise: () => Promise.resolve({
                            Body: Buffer.from(JSON.stringify(value))
                        })
                    } as aws.Request<any, aws.AWSError>
                });

            const result = await secureConfig.fetchFromS3("hat", "Florida");
            chai.assert.deepEqual(result, value);
            chai.assert.equal(stub.callCount, 1);
        });

        it("retries on failure", async () => {
            const value = {a: "alpha"};

            const stub = sandbox.stub(aws.S3.prototype, "makeRequest")
                .onFirstCall()
                .callsFake((operation: string, params: {Bucket: string, Key: string})  => {
                    chai.assert.equal(params.Bucket, "hat");
                    chai.assert.equal(params.Key, "Florida");
                    return {
                        promise: () => Promise.reject(new Error("I'm a network error"))
                    } as aws.Request<any, aws.AWSError>
                })
                .onSecondCall()
                .callsFake((operation: string, params: {Bucket: string, Key: string})  => {
                    chai.assert.equal(params.Bucket, "hat");
                    chai.assert.equal(params.Key, "Florida");
                    return {
                        promise: () => Promise.reject(new Error("I'm a network error"))
                    } as aws.Request<any, aws.AWSError>
                })
                .onThirdCall()
                .callsFake((operation: string, params: {Bucket: string, Key: string})  => {
                    chai.assert.equal(params.Bucket, "hat");
                    chai.assert.equal(params.Key, "Florida");
                    return {
                        promise: () => Promise.resolve({
                            Body: Buffer.from(JSON.stringify(value))
                        })
                    } as aws.Request<any, aws.AWSError>
                });

            const result = await secureConfig.fetchFromS3("hat", "Florida");
            chai.assert.deepEqual(result, value);
            chai.assert.equal(stub.callCount, 3);
        });
    });
});
