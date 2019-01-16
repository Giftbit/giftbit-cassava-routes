import * as chai from "chai";
import {getPathForMetricsLogging} from "./MetricsRouteUtils";
import {Route} from "cassava/dist/routes";


describe("getPathForMetricsLogging", () => {
    function getHandlingRoute(pathRegex: RegExp, pathParams: string[]): Route {
        return {
            settings: {
                regexGroupToPathParamMap: pathParams,
                pathRegex: pathRegex,
                method: "GET",
                serializers: {}
            },
            matches: null
        } as Route;
    }

    it("handles path with nothing to replace", () => {
        const reqPath = "/v2/programs";
        const path = getPathForMetricsLogging({path: reqPath}, [
            getHandlingRoute(/^\/v2\/programs$/i, [
                "",
                "programId",
                "id"
            ])]);

        chai.assert.equal(path, reqPath);
    });

    it("handles path with two things to replace", () => {
        const reqPath = "/v2/programs/1sgret9034\\g09g4s()/issuances/1-420-t39jmzzklnoaer\\[GA%$^h";
        const path = getPathForMetricsLogging({path: reqPath}, [
            getHandlingRoute(/^\/v2\/programs\/([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)\/issuances\/([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)$/i, [
                "",
                "programId",
                "id"
            ])]);

        chai.assert.equal(path, "/v2/programs/<programId>/issuances/<id>");
    });

    describe("obnoxious IDs", () => {
        it("handles path like /v2/programs/programs", () => {
            const reqPath = "/v2/programs/programs/issuances/issuances";
            const path = getPathForMetricsLogging({path: reqPath}, [
                getHandlingRoute(/^\/v2\/programs\/([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)\/issuances\/([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)$/i, [
                    "",
                    "programId",
                    "id"
                ])]);

            chai.assert.equal(path, "/v2/programs/<programId>/issuances/<id>");
        });

        it("handles path like /v2/programs/issuances/issuances", () => {
            const reqPath = "/v2/programs/issuances/issuances";
            const path = getPathForMetricsLogging({path: reqPath}, [
                getHandlingRoute(/^\/v2\/programs\/([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)\/issuances$/i, [
                    "",
                    "programId",
                    "id"
                ])]);

            chai.assert.equal(path, "/v2/programs/<programId>/issuances");
        });
    });

    it("handles path that starts with replacement", () => {
        const reqPath = "/random-id-346w553w/someResource/another-id-Q#$gs05ys5.";
        const path = getPathForMetricsLogging({path: reqPath}, [
            getHandlingRoute(/^\/([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)\/someResource\/([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)$/i, [
                "",
                "firstId",
                "secondId"
            ])]);

        chai.assert.equal(path, "/<firstId>/someResource/<secondId>");
    });
});
