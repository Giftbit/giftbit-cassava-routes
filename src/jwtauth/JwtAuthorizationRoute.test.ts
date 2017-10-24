import * as cassava from "cassava";
import * as chai from "chai";
import {JwtAuthorizationRoute} from "./JwtAuthorizationRoute";
import {AuthorizationBadge} from "./AuthorizationBadge";

describe("JwtAuthorizationRoute", () => {

    const authConfigPromise = Promise.resolve({secretkey:"secret"});
    const happyRoute: cassava.routes.Route = {
        matches: () => true,
        handle: async evt => ({body: {}})
    };

    it("verifies a valid JWT in the Authorization header", async() => {
        let secondHandlerCalled = false;
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
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
                chai.assert.equal(auth.issuedAtTime.getTime(), 1481573500000);
                secondHandlerCalled = true;
                return {body: {}};
            }
        });

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19.15AOfp7clpOX3IuyNj0XodqPaQTY6MxsNTW-mVLgYoY"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
        chai.assert.isTrue(secondHandlerCalled);
    });

    it("verifies a valid JWT in cookies when X-Requested-With is present", async() => {
        let secondHandlerCalled = false;
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        router.route(jwtAuthorizationRoute);
        router.route({
            matches: () => true,
            handle: async evt => {
                const auth = evt.meta["auth"] as AuthorizationBadge;
                chai.assert.isObject(auth);
                chai.assert.equal(auth.giftbitUserId, "user-7052210bcb94448b825ffa68508d29ad-TEST");
                chai.assert.equal(auth.merchantId, "user-7052210bcb94448b825ffa68508d29ad");
                chai.assert.instanceOf(auth.issuedAtTime, Date);
                chai.assert.equal(auth.issuedAtTime.getTime(), 1481573500000);
                secondHandlerCalled = true;
                return {body: {}};
            }
        });

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19; gb_jwt_signature=15AOfp7clpOX3IuyNj0XodqPaQTY6MxsNTW-mVLgYoY",
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
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
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
                chai.assert.equal(auth.issuedAtTime.getTime(), 1481573500000);
                secondHandlerCalled = true;
                return {body: {}};
            }
        });

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19; gb_jwt_signature=15AOfp7clpOX3IuyNj0XodqPaQTY6MxsNTW-mVLgYoY",
                "x-requested-with": "XMLHttpRequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
        chai.assert.isTrue(secondHandlerCalled);
    });

    it("verifies a JWT with a date string iat", async() => {
        // The spec calls for timestamps but we were issuing JWTs with date strings for a while.
        // We'll still accept these technically-wrong JWTs.

        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        // jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC4wMDBaIiwic2NvcGVzIjpbIkMiLCJUIiwiUiIsIkNFQyIsIkNFUiIsIlVBIiwiRiJdfQ.p2w1R5kBfh6PAzkMWulvf-6Y8BhZx9o5gBOlc8rNlOk"
            }
        }));

        chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
    });

    it("verifies a JWT with a timestamp exp", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJleHAiOjc3OTI5MjA3MDAsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0.ceQB7hGWyL_iRqWYobPz8Uv3i8MkqO2ay_-x66Q3bk0"
            }
        }));

        chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
    });

    it("rejects a JWT with a date string exp", async() => {
        // We won't be permissive about JWTs with date string expiration because they were
        // never issued in practice.

        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjMsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoiMjAxNi0xMi0xMlQyMDoxMTo0MC4wMDBaIiwiZXhwIjoiMjAxNi0xMi0xMlQyMDoxMTo0MC4wMDBaIiwic2NvcGVzIjpbIkMiLCJUIiwiUiIsIkNFQyIsIkNFUiIsIlVBIiwiRiJdfQ.ZvsuOl3vmAFtZ4TTyeXVWVk9dt2OJn-a-s0oQ-zM2MY"
            }
        }));

        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects an Authorization header missing 'Bearer '", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(Promise.resolve({secretkey:"secret"}));
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19.15AOfp7clpOX3IuyNj0XodqPaQTY6MxsNTW-mVLgYoY"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT that is not base64", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects an expired JWT", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJleHAiOjE0ODE1NzM1MDAsInNjb3BlcyI6WyJDIiwiVCIsIlIiLCJDRUMiLCJDRVIiLCJVQSIsIkYiXX0.zuwm1-TTXp6b3X7TG-mJun4YSyRut1sJTpxH5q6NJzQ"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT with a bad signature in the Authorization header", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT with a bad signature in cookies", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19; gb_jwt_signature=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "X-Requested-With": "XMLHttpRequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT in cookies missing the X-Requested-With header", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19; gb_jwt_signature=15AOfp7clpOX3IuyNj0XodqPaQTY6MxsNTW-mVLgYoY"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT in cookies with the X-Requested-With header value the wrong case", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19; gb_jwt_signature=15AOfp7clpOX3IuyNj0XodqPaQTY6MxsNTW-mVLgYoY",
                "X-Requested-With": "xmlhttprequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT in cookies missing gb_jwt_session", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
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
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Cookie: "gb_jwt_session=eyJ2ZXIiOjEsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19",
                "X-Requested-With": "XMLHttpRequest"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    it("rejects a JWT with alg:none", async() => {
        const router = new cassava.Router();
        const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
        jwtAuthorizationRoute.logErrors = false;
        router.route(jwtAuthorizationRoute);
        router.route(happyRoute);

        const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
            headers: {
                Authorization: "Bearer eyJ2ZXIiOjMsInZhdiI6MSwiYWxnIjoibm9uZSIsInR5cCI6IkpXVCJ9.eyJnIjp7Imd1aSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQtVEVTVCIsImdtaSI6InVzZXItNzA1MjIxMGJjYjk0NDQ4YjgyNWZmYTY4NTA4ZDI5YWQifSwiaWF0IjoxNDgxNTczNTAwLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiQ0VDIiwiQ0VSIiwiVUEiLCJGIl19.tFWA2jK8E0QVaG45h1BeARQQZxNJHVhIDh4-fs2qxhg"
            }
        }));

        chai.assert.isObject(resp);
        chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
    });

    describe("assume support", () => {
        it("validates the JWT with ASSUME scope then assumes the AuthorizeAs payload", async() => {
            let secondHandlerCalled = false;
            const router = new cassava.Router();
            const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
            jwtAuthorizationRoute.logErrors = false;
            router.route(jwtAuthorizationRoute);
            router.route({
                matches: () => true,
                handle: async evt => {
                    const auth = evt.meta["auth"] as AuthorizationBadge;
                    chai.assert.isObject(auth);
                    chai.assert.equal(auth.giftbitUserId, "user-123");
                    chai.assert.equal(auth.merchantId, "user-123");
                    chai.assert.equal(auth.uniqueIdentifier, "badge-1234");
                    chai.assert.equal(auth.serviceId, "service-1");
                    chai.assert.notInclude(auth.scopes, "ASSUME");
                    chai.assert.equal(auth.parentUniqueIdentifier, "badge-2");
                    secondHandlerCalled = true;
                    return {body: {}};
                }
            });

            const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
                headers: {
                    Authorization: "Bearer eyJ2ZXIiOjIsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InNlcnZpY2UtMSIsImdtaSI6InNlcnZpY2UtMSJ9LCJpYXQiOiIyMDE3LTA0LTI1VDIyOjA5OjMzLjI2NiswMDAwIiwianRpIjoiYmFkZ2UtMTIzNCIsInNjb3BlcyI6WyJDIiwiQVNTVU1FIl19.bXvaU7Gca9_13yqfblgZ2IUuN-0xKNbUTRlC8g2q4-g",
                    AuthorizeAs: "eyJnIjp7Imd1aSI6InVzZXItMTIzIiwiZ21pIjoidXNlci0xMjMifSwiaWF0IjoiMjAxNy0wNC0yNVQyMjowOTozMy4yNjYrMDAwMCIsImp0aSI6ImJhZGdlLTIiLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiRiIsIkNFQyIsIkNFUiIsIlVBIl19"
                }
            }));

            chai.assert.isObject(resp);
            chai.assert.equal(resp.statusCode, 200, JSON.stringify(resp));
            chai.assert.isTrue(secondHandlerCalled);
        });

        it("rejects an expired JWT", async() => {
            const router = new cassava.Router();
            const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
            jwtAuthorizationRoute.logErrors = false;
            router.route(jwtAuthorizationRoute);
            router.route(happyRoute);

            const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
                headers: {
                    Authorization: "Bearer eyJ2ZXIiOjIsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InNlcnZpY2UtMSIsImdtaSI6InNlcnZpY2UtMSJ9LCJpYXQiOiIyMDE3LTA0LTI1VDIyOjA5OjMzLjI2NiswMDAwIiwiZXhwIjoiMTk5OS0wNC0yNVQyMjowOTozMy4yNjYrMDAwMCIsImp0aSI6ImJhZGdlLTEyMzQiLCJzY29wZXMiOlsiQyIsIkFTU1VNRSJdfQ.lgi1irU2n9l10zBDmb1uvVl1QGCEh5ngqCIpWp1RQLw",
                    AuthorizeAs: "eyJnIjp7Imd1aSI6InVzZXItMTIzIiwiZ21pIjoidXNlci0xMjMifSwiaWF0IjoiMjAxNy0wNC0yNVQyMjowOTozMy4yNjYrMDAwMCIsImp0aSI6ImJhZGdlLTIiLCJzY29wZXMiOlsiQyIsIlQiLCJSIiwiRiIsIkNFQyIsIkNFUiIsIlVBIl19"
                }
            }));

            chai.assert.isObject(resp);
            chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
        });

        it("rejects a JWT without ASSUME scope", async() => {
            const router = new cassava.Router();
            const jwtAuthorizationRoute = new JwtAuthorizationRoute(authConfigPromise);
            jwtAuthorizationRoute.logErrors = false;
            router.route(jwtAuthorizationRoute);
            router.route(happyRoute);

            const resp = await cassava.testing.testRouter(router, cassava.testing.createTestProxyEvent("/foo/bar", "GET", {
                headers: {
                    Authorization: "Bearer eyJ2ZXIiOjIsInZhdiI6MSwiYWxnIjoiSFMyNTYiLCJ0eXAiOiJKV1QifQ.eyJnIjp7Imd1aSI6InNlcnZpY2UtMSIsImdtaSI6InNlcnZpY2UtMSJ9LCJpYXQiOiIyMDE3LTA0LTI1VDIyOjA5OjMzLjI2NiswMDAwIiwianRpIjoiYmFkZ2UtMTIzNCIsInNjb3BlcyI6WyJDIl19.Qd3ft4gXf4wBRNRyluIEN1_bO2xpjbF3jNiNx3jtB4Q",
                    AuthorizeAs: "eyJnIjp7Imd1aSI6InVzZXItMTIzLVRFU1QiLCJnbWkiOiJ1c2VyLTEyMy1URVNUIn0sImlhdCI6IjIwMTctMDQtMjVUMjI6MDk6MzMuMjY2KzAwMDAiLCJqdGkiOiJiYWRnZS0yIiwic2NvcGVzIjpbIkMiLCJUIiwiUiIsIkYiLCJDRUMiLCJDRVIiLCJVQSJdfQ"
                }
            }));

            chai.assert.isObject(resp);
            chai.assert.equal(resp.statusCode, 401, JSON.stringify(resp));
        });
    });
});
