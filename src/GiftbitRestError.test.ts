import * as cassava from "cassava";
import * as chai from "chai";
import {GiftbitRestError} from "./GiftbitRestError";

describe("GiftbitRestError", () => {
    it("behaves like cassava.RestError", async () => {
        const router = new cassava.Router();

        router.route("/foo")
            .handler(async evt => {
                throw new GiftbitRestError(400, "This is my custom error message")
            });

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo"));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 400, JSON.stringify(resp));
        chai.assert.isObject(JSON.parse(resp.body));
        chai.assert.deepEqual(JSON.parse(resp.body), {
            statusCode: 400,
            message: "This is my custom error message"
        });
    });

    it("serializes the messageCode if set", async () => {
        const router = new cassava.Router();

        router.route("/foo")
            .handler(async evt => {
                throw new GiftbitRestError(400, "This is my custom error message", "MESSAGE_CODE")
            });

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo"));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 400, JSON.stringify(resp));
        chai.assert.isObject(JSON.parse(resp.body));
        chai.assert.deepEqual(JSON.parse(resp.body), {
            statusCode: 400,
            message: "This is my custom error message",
            messageCode: "MESSAGE_CODE"
        });
    });
});
