"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MetricsRoute {
    constructor(options) {
        this.options = options;
    }
    matches(evt) {
        return true;
    }
    handle(evt) {
    }
    postProcess(evt, resp) {
        // todo - sanitize path & query params (IDs, codes)?
        const path = evt.path;
        const auth = evt.meta["auth"];
        const liveMode = !auth.isTestUser();
        /**
         * Uses Cloudwatch logs to send metrics to Datadog: see https://docs.datadoghq.com/integrations/amazon_lambda/#using-cloudwatch-logs
         * Log message follows format `MONITORING|<unix_epoch_timestamp_in_seconds>|<value>|<metric_type>|<metric_name>|#<tag_list>`
         * The tag function_name:<name_of_the_function> is added automatically
         */
        this.log(`MONITORING|` +
            `${Math.round(Date.now() / 1000)}|` +
            `${resp.statusCode}|` +
            `histogram|` +
            `response_codes|` +
            `#path:${path},` +
            `#liveMode:${liveMode},` +
            `#respCode:${resp.statusCode},` +
            `#httpMethod:${evt.httpMethod},` +
            `#userId:${auth.userId},` +
            `#teamMemberId:${auth.teamMemberId}`);
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