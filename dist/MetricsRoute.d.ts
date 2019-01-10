import * as cassava from "cassava";
import { Route } from "cassava/dist/routes";
export declare class MetricsRoute implements cassava.routes.Route {
    private readonly options?;
    constructor(options?: {
        logFunction: (msg: string) => void;
    });
    matches(evt: cassava.RouterEvent): boolean;
    handle(evt: cassava.RouterEvent): void;
    /**
     * Uses Cloudwatch logs to send metrics to Datadog: see https://docs.datadoghq.com/integrations/amazon_lambda/#using-cloudwatch-logs
     * Log message follows format `MONITORING|<unix_epoch_timestamp_in_seconds>|<value>|<metric_type>|<metric_name>|#<tag_list>`
     * The tag function_name:<name_of_the_function> is added automatically
     */
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse, handlingRoutes: Route[]): cassava.RouterResponse;
    log(msg: string): void;
}
