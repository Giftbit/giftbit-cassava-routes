import * as cassava from "cassava";
import * as chai from "chai";
import {JwtAuthorizationRoute} from "./JwtAuthorizationRoute";
import {AuthorizationBadge} from "./AuthorizationBadge";

describe("JwtAuthorizationRoute", () => {
    it("verifies a valid JWT in the Authorization header", async() => {
        let secondHandlerCalled = false;
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route({
            matches: () => true,
            handle: async evt => {
                const auth = evt.meta["auth"] as AuthorizationBadge;
                chai.assert.isObject(auth);
                chai.assert.equal(auth.giftbitUserId, "user-7052210bcb94448b825ffa68508d29ad-TEST");
                chai.assert.equal(auth.merchantId, "user-7052210bcb94448b825ffa68508d29ad");
                chai.assert.instanceOf(auth.issuedAtTime, Date);
                chai.assert.equal(auth.issuedAtTime.getTime(), new Date("2016-12-12T20:11:40.997+0000").getTime());
                secondHandlerCalled = true;
                return {body: {}};
            }
        });

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0.uZxYrUPqwJk5oTTtDWaPOYzhRSt5dzRS4OZGYP8u2Po"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
        chai.assert.isTrue(secondHandlerCalled);
    });

    it("verifies a valid JWT in cookies when X-Requested-With is present", async() => {
        let secondHandlerCalled = false;
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route({
            matches: () => true,
            handle: async evt => {
                const auth = evt.meta["auth"] as AuthorizationBadge;
                chai.assert.isObject(auth);
                chai.assert.equal(auth.giftbitUserId, "user-7052210bcb94448b825ffa68508d29ad-TEST");
                chai.assert.equal(auth.merchantId, "user-7052210bcb94448b825ffa68508d29ad");
                chai.assert.instanceOf(auth.issuedAtTime, Date);
                chai.assert.equal(auth.issuedAtTime.getTime(), new Date("2016-12-12T20:11:40.997+0000").getTime());
                secondHandlerCalled = true;
                return {body: {}};
            }
        });

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0; gb_jwt_signature=uZxYrUPqwJk5oTTtDWaPOYzhRSt5dzRS4OZGYP8u2Po",
                "X-Requested-With": "XMLHttpRequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
        chai.assert.isTrue(secondHandlerCalled);
    });

    it("verifies a valid JWT in cookies when x-requested-with header is lower case", async() => {
        let secondHandlerCalled = false;
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route({
            matches: () => true,
            handle: async evt => {
                const auth = evt.meta["auth"] as AuthorizationBadge;
                chai.assert.isObject(auth);
                chai.assert.equal(auth.giftbitUserId, "user-7052210bcb94448b825ffa68508d29ad-TEST");
                chai.assert.equal(auth.merchantId, "user-7052210bcb94448b825ffa68508d29ad");
                chai.assert.instanceOf(auth.issuedAtTime, Date);
                chai.assert.equal(auth.issuedAtTime.getTime(), new Date("2016-12-12T20:11:40.997+0000").getTime());
                secondHandlerCalled = true;
                return {body: {}};
            }
        });

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0; gb_jwt_signature=uZxYrUPqwJk5oTTtDWaPOYzhRSt5dzRS4OZGYP8u2Po",
                "x-requested-with": "XMLHttpRequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
        chai.assert.isTrue(secondHandlerCalled);
    });

    it("rejects an expired JWT", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsImV4cCI6IjIwMTYtMTItMTJUMjA6MTE6NDAuOTk3KzAwMDAiLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19.Wyqsgd_QvLT2bRkK8O6WAPOnC-0deYm6xuwHORzzQWo"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT with a bad signature in the Authorization header", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT with a bad signature in cookies", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0; gb_jwt_signature=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "X-Requested-With": "XMLHttpRequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT in cookies missing the X-Requested-With header", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0; gb_jwt_signature=uZxYrUPqwJk5oTTtDWaPOYzhRSt5dzRS4OZGYP8u2Po"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT in cookies with the X-Requested-With header value the wrong case", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0; gb_jwt_signature=uZxYrUPqwJk5oTTtDWaPOYzhRSt5dzRS4OZGYP8u2Po",
                "X-Requested-With": "xmlhttprequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT in cookies missing gb_jwt_session", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_signature=uZxYrUPqwJk5oTTtDWaPOYzhRSt5dzRS4OZGYP8u2Po",
                "X-Requested-With": "XMLHttpRequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT in cookies missing gb_jwt_signature", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC45OTcrMDAwMCIsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0",
                "X-Requested-With": "XMLHttpRequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });
});
