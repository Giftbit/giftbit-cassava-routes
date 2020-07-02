"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathForMetricsLogging = void 0;
function getPathForMetricsLogging(evt, handlingRoutes) {
    let path = evt.path;
    const handler = handlingRoutes[0]; // cast as any because settings is private on BuildableRoute
    if (handler && handler.settings && handler.settings.pathRegex) {
        const pathRegex = handler.settings.pathRegex;
        path = pathRegex.toString();
        if (handler.settings.regexGroupToPathParamMap) {
            const pathParams = handler.settings.regexGroupToPathParamMap;
            let pathParamIndex = 0;
            /**
             * Replace each path parameter in the stringified path regex with the corresponding path param identifier
             *
             * For example: if evt.path is "/v2/programs/program-id-12345",`
             *      the matching regexp is /^\/v2\/programs\/([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)$/
             *      and the pathParams are ["", "programId"] (see https://github.com/Giftbit/cassava/blob/v2.4.0/src/routes/BuildableRoute.ts#L37)
             * This will replace "([0-9a-zA-Z-._~!$&'()*+,;=:@%]+)" with "<programId>" so 'path' will be "/^\/v2\/programs\/<programId>$/"
             */
            path = path.replace(/\(.+?\)(?=\\\/|\$)/g, // matches capture groups followed by an escaped slash or end of string
            () => {
                pathParamIndex += 1;
                return `<${pathParams[pathParamIndex]}>`;
            });
        }
        else {
            // no path parameters to replace
        }
        path = path.replace(/\\\//g, "/"); // replace escaped slashes
        path = path.replace(/\/\^|\$\/[gimuy]/g, ""); // clear start/end markers & flags
    }
    else {
        // this request didn't get handled by a route with a path matcher: no path replacements can be made
    }
    return path;
}
exports.getPathForMetricsLogging = getPathForMetricsLogging;
//# sourceMappingURL=MetricsRouteUtils.js.map