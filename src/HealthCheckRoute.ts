import * as cassava from "cassava";

export class HealthCheckRoute implements cassava.routes.Route {

    /**
     * @param path Exact path to respond on.
     * @param checks map of check name to function that returns a Promise of check result
     */
    constructor(private readonly path: string = "/", private readonly checks: {[key: string]: () => Promise<string>} = {}) {}

    matches(evt: cassava.RouterEvent): boolean {
        return evt.path === this.path;
    }

    async handle(evt: cassava.RouterEvent): Promise<cassava.RouterResponse> {
        const checkPromises: {[key: string]: Promise<string>} = {};
        for (const key in this.checks) {
            checkPromises[key] = this.checks[key]();
        }

        const checkResults: {[key: string]: string} = {};
        let failure = false;
        for (const key in checkPromises) {
            try {
                checkResults[key] = await checkPromises[key];
            } catch (err) {
                failure = true;
                checkResults[key] = err + "";
            }
        }

        return {
            statusCode: failure ? 500 : 200,
            body: checkResults
        };
    }
}
