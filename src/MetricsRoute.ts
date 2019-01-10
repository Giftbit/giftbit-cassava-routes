import * as cassava from "cassava";
import {AuthorizationBadge} from "./jwtauth";

export class MetricsRoute implements cassava.routes.Route {

    constructor(private readonly options?: { logFunction: (msg: string) => void }) {
    }

    matches(evt: cassava.RouterEvent): boolean {
        return true;
    }

    handle(evt: cassava.RouterEvent): void {
    }

    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): cassava.RouterResponse {
        let path = evt.path;
        for (let key of Object.keys(evt.pathParameters)) {
            path = path.replace(evt.pathParameters[key], `{${key}}`);
        }
        const auth = evt.meta["auth"] as AuthorizationBadge;
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

    log(msg: string): void {
        if (this.options.logFunction) {
            this.options.logFunction(msg);
        } else {
            console.log(msg);
        }
    }
}
