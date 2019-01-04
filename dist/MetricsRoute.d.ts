import * as cassava from "cassava";
export declare class MetricsRoute implements cassava.routes.Route {
    private readonly options?;
    constructor(options?: {
        logFunction: (msg: string) => void;
    });
    matches(evt: cassava.RouterEvent): boolean;
    handle(evt: cassava.RouterEvent): void;
    postProcess(evt: cassava.RouterEvent, resp: cassava.RouterResponse): cassava.RouterResponse;
    log(msg: string): void;
}
