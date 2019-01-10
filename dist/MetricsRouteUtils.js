"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPathForMetricsLogging(evt, handlingRoutes) {
    let path = evt.path;
    const handler = handlingRoutes[0];
    if (handler && handler.settings && handler.settings.pathRegex) {
        let pathRegex = handler.settings.pathRegex;
        path = pathRegex.toString();
        if (handler.settings.regexGroupToPathParamMap) {
            let pathParams = handler.settings.regexGroupToPathParamMap;
            let indexArray = [];
            function replacer(...args) {
                indexArray.push(args[1]);
                return `<${pathParams[indexArray.length]}>`;
            }
            path = path.replace(/\(.+?\)(?=\\\/|\$)/g, replacer);
        }
        path = path.replace(/\\\//g, "/"); // replace escaped slashes
        path = path.replace(/\/\^|\$\/[gimuy]/g, ""); // clear start/end markers & flags
    }
    return path;
}
exports.getPathForMetricsLogging = getPathForMetricsLogging;
//# sourceMappingURL=MetricsRouteUtils.js.map