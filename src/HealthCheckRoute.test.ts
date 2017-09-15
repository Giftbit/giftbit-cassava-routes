import * as cassava from "cassava";
import * as chai from "chai";
import {HealthCheckRoute} from "./HealthCheckRoute";

describe("HealthCheckRoute", () => {
    it("responds with 200 with no checks", async () => {
       const router = new cassava.Router();
       router.route(new HealthCheckRoute("/healthCheck"));

       const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/healthCheck", "GET"));

       chai.assert.isObject(resp);
       chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
       chai.assert.deepEqual(resp.body, JSON.stringify({}), JSON.stringify(resp));
    });

    it("responds with 200 for passing checks", async () => {
        const router = new cassava.Router();
        router.route(new HealthCheckRoute("/healthCheck", {
            hold: () => Promise.resolve("up"),
            wait: () => Promise.resolve("a minute")
        }));

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/healthCheck", "GET"));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
        chai.assert.deepEqual<any>(resp.body, JSON.stringify({hold: "up", wait: "a minute"}), JSON.stringify(resp));
    });

    it("responds with 500 for a failing check", async () => {
        const router = new cassava.Router();
        router.route(new HealthCheckRoute("/healthCheck", {
            "let": () => Promise.resolve("me"),
            clear: () => Promise.reject(new Error("cannot clear throat"))
        }));

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/healthCheck", "GET"));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 500, JSON.stringify(resp));
        chai.assert.deepEqual<any>(resp.body, JSON.stringify({"let": "me", clear: "Error: cannot clear throat"}), JSON.stringify(resp));
    });

    it("does not match other paths", async () => {
       const router = new cassava.Router();
       router.route(new HealthCheckRoute("/healthCheck"));
       router.route(/.*/).handler(async res => {
           return {
               statusCode: 404,
               body: {}
           }
       });

       const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/butts", "GET"));

       chai.assert.isObject(resp);
       chai.assert.notEqual(resp.statusCode, 200, JSON.stringify(resp));
    });
});
