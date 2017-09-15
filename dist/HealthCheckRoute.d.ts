import * as cassava from "cassava";
export declare class HealthCheckRoute implements cassava.routes.Route {
    private readonly path;
    private readonly checks;
    /**
     * @param path Exact path to respond on.
     * @param checks map of check name to function that returns a Promise of check result
     */
    constructor(path?: string, checks?: {
        [key: string]: () => Promise<string>;
    });
    matches(evt: cassava.RouterEvent): boolean;
    handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse>;
}
