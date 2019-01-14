"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MetricsRouteUtils_1 = require("./MetricsRouteUtils");
class MetricsRoute {
    constructor(options) {
        this.options = options;
    }
    matches(evt) {
        return true;
    }
    handle(evt) {
    }
    /**
     * Uses Cloudwatch logs to send metrics to Datadog: see https://docs.datadoghq.com/integrations/amazon_lambda/#using-cloudwatch-logs
     * Log message follows format `MONITORING|<unix_epoch_timestamp_in_seconds>|<value>|<metric_type>|<metric_name>|#<tag_list>`
     * The tag function_name:<name_of_the_function> is added automatically
     */
    postProcess(evt, resp, handlingRoutes) {
        const path = MetricsRouteUtils_1.getPathForMetricsLogging(evt, handlingRoutes);
        const code = resp.statusCode || resp.body ? 200 : 0;
        const auth = evt.meta["auth"];
        let metricsLogString = `MONITORING|` +
            `${Math.round(Date.now() / 1000)}|` +
            `${code}|` +
            `histogram|` +
            `response_codes|` +
            `#path:${path},` +
            `#respCode:${code},` +
            `#httpMethod:${evt.httpMethod}`;
        if (auth) { // not all routes require auth
            metricsLogString += `,#liveMode:${!auth.isTestUser()},` +
                `#userId:${auth.userId},` +
                `#teamMemberId:${auth.teamMemberId}`;
        }
        this.log(metricsLogString);
        return resp;
    }
    log(msg) {
        if (this.options.logFunction) {
            this.options.logFunction(msg);
        }
        else {
            console.log(msg);
        }
    }
}
exports.MetricsRoute = MetricsRoute;
//# sourceMappingURL=MetricsRoute.js.map