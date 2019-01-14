import * as cassava from "cassava";
import {Route} from "cassava/dist/routes";
import {AuthorizationBadge} from "./jwtauth";
import {getPathForMetricsLogging} from "./MetricsRouteUtils";

export class MetricsRoute implements cassava.routes.Route {

    constructor(private readonly options?: { logFunction: (msg: string) => void }) {
    }

    matches(evt: cassava.RouterEvent): boolean {
        return true;
    }

    handle(evt: cassava.RouterEvent): void {
    }

    /**
     * Uses Cloudwatch logs to send metrics to Datadog: see https://docs.datadoghq.com/integrations/amazon_lambda/#using-cloudwatch-logs
     * Log message follows format `MONITORING|<unix_epoch_timestamp_in_seconds>|<value>|<metric_type>|<metric_name>|#<tag_list>`
     * The tag function_name:<name_of_the_function> is added automatically
     */
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse, handlingRoutes: Route[]): cassava.RouterResponse {
        const path: string = getPathForMetricsLogging(evt, handlingRoutes);
        const code: number = resp.statusCode || resp.body ? 200 : 0;

        const auth = evt.meta["auth"] as AuthorizationBadge;

        let metricsLogString: string = `MONITORING|` +
            `${Math.round(Date.now() / 1000)}|` +
            `${code}|` +
            `histogram|` +
            `response_codes|` +
            `#path:${path},` +
            `#respCode:${code},` +
            `#httpMethod:${evt.httpMethod}`;

        if (auth) {      // not all routes require auth
            metricsLogString += `,#liveMode:${!auth.isTestUser()},` +
                `#userId:${auth.userId},` +
                `#teamMemberId:${auth.teamMemberId}`;
        }

        this.log(metricsLogString);

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
