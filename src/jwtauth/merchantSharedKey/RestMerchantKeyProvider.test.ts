import * as chai from "chai";
import * as http from "http";
import mitm = require("mitm");
import {RestMerchantKeyProvider} from "./RestMerchantKeyProvider";
import {AssumeScopeToken} from "../../secureConfig";
import {TLSSocket} from "tls";

describe("RestMerchantKeyProvider", () => {

    let mitmInstance: any;

    beforeEach(() => {
        // mitm shims node's internal request/response constructs so they can be intercepted.
        // A similar project called nock works at a higher level but can't do assertions on
        // the header based on the whole request.
        mitmInstance = mitm();
    });

    afterEach(() => {
        if (mitmInstance) {
            mitmInstance.disable();
            mitmInstance = null;
        }
    });

    it.skip("defaults to the https protocol -- mitm testing dependency is broken", async () => {
        mitmInstance.on("request", (req: http.IncomingMessage, res: http.ServerResponse) => {
            // The socket type proves this went over HTTPS.
            chai.assert.instanceOf(req.socket, TLSSocket);
            chai.assert.equal(req.method, "GET");
            chai.assert.equal(req.url, "/");
            chai.assert.equal(req.headers.authorization, "Bearer secret");
            chai.assert.equal(req.headers.authorizeas, "bbb");

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify("hello"));
        });

        const prov = new RestMerchantKeyProvider("www.example.com", Promise.resolve<AssumeScopeToken>({assumeToken: "secret"}));
        const key = await prov.getMerchantKey("aaa.bbb.ccc");
        chai.assert.equal(key, "hello");
    });
});
